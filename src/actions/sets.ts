'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { setSchema, termSchema } from '@/lib/validations'
import { z } from 'zod'

const createSetSchema = setSchema.extend({
  terms: z.array(termSchema).min(1, 'Cần ít nhất 1 thẻ'),
})

export async function createSet(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const rawTerms: string[] = []
  let i = 0
  while (formData.has(`terms[${i}][term]`)) {
    rawTerms.push(JSON.stringify({
      term: formData.get(`terms[${i}][term]`),
      definition: formData.get(`terms[${i}][definition]`),
      reading: formData.get(`terms[${i}][reading]`) || undefined,
      example_sentence: formData.get(`terms[${i}][example_sentence]`) || undefined,
    }))
    i++
  }

  const parsed = createSetSchema.parse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    is_public: formData.get('is_public') === 'true',
    terms: rawTerms.map(t => JSON.parse(t)),
  })

  const { data: set, error: setError } = await supabase
    .from('sets')
    .insert({
      user_id: user.id,
      title: parsed.title,
      description: parsed.description || null,
      is_public: parsed.is_public,
    })
    .select()
    .single()

  if (setError) return { error: setError.message }

  const termsWithOrder = parsed.terms.map((t, idx) => ({
    set_id: set.id,
    term: t.term,
    definition: t.definition,
    reading: t.reading || null,
    example_sentence: t.example_sentence || null,
    order: idx,
  }))

  const { error: termsError } = await supabase
    .from('terms')
    .insert(termsWithOrder)

  if (termsError) return { error: termsError.message }

  revalidatePath('/sets')
  revalidatePath('/sets/my')
  redirect(`/sets/${set.id}`)
}

export async function updateSet(setId: string, formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: set } = await supabase
    .from('sets')
    .select('user_id')
    .eq('id', setId)
    .single()

  if (!set || set.user_id !== user.id) return { error: 'Forbidden' }

  const parsed = setSchema.parse({
    title: formData.get('title'),
    description: formData.get('description') || undefined,
    is_public: formData.get('is_public') === 'true',
  })

  const { error } = await supabase
    .from('sets')
    .update(parsed)
    .eq('id', setId)

  if (error) return { error: error.message }

  revalidatePath(`/sets/${setId}`)
  revalidatePath(`/sets/${setId}/edit`)
}

export async function deleteSet(setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: set } = await supabase
    .from('sets')
    .select('user_id')
    .eq('id', setId)
    .single()

  if (!set || set.user_id !== user.id) return { error: 'Forbidden' }

  const { error } = await supabase.from('sets').delete().eq('id', setId)
  if (error) return { error: error.message }

  revalidatePath('/sets')
  revalidatePath('/sets/my')
  redirect('/sets/my')
}

export async function cloneSet(setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: original } = await supabase
    .from('sets')
    .select('*, terms(*)')
    .eq('id', setId)
    .single()

  if (!original) return { error: 'Set not found' }
  if (!original.is_public && original.user_id !== user.id) return { error: 'Forbidden' }

  const { data: newSet, error: setError } = await supabase
    .from('sets')
    .insert({
      user_id: user.id,
      title: `${original.title} (sao chép)`,
      description: original.description,
      is_public: false,
    })
    .select()
    .single()

  if (setError) return { error: setError.message }

  if (original.terms?.length) {
    const clonedTerms = original.terms.map((t: any) => ({
      set_id: newSet.id,
      term: t.term,
      definition: t.definition,
      reading: t.reading,
      example_sentence: t.example_sentence,
      order: t.order,
    }))
    await supabase.from('terms').insert(clonedTerms)
  }

  revalidatePath('/sets')
  redirect(`/sets/${newSet.id}`)
}
