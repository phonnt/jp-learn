'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function exportSetToCsv(setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: set } = await supabase
    .from('sets')
    .select('title')
    .eq('id', setId)
    .single()

  if (!set) return { error: 'Set not found' }

  const { data: terms } = await supabase
    .from('terms')
    .select('term, definition, reading, example_sentence')
    .eq('set_id', setId)
    .order('order', { ascending: true })

  if (!terms || terms.length === 0) return { error: 'No terms to export' }

  const header = 'Term,Definition,Reading,Example'
  const rows = terms.map(t => {
    const escape = (s: string | null) => {
      if (!s) return ''
      return `"${s.replace(/"/g, '""')}"`
    }
    return `${escape(t.term)},${escape(t.definition)},${escape(t.reading)},${escape(t.example_sentence)}`
  })

  return {
    data: {
      csv: [header, ...rows].join('\n'),
      filename: `${set.title.replace(/[^a-zA-Z0-9_\u00C0-\u024F\u1E00-\u1EFF]/g, '_')}.csv`,
    },
  }
}

export async function importSetFromCsv(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const title = formData.get('title') as string
  const csvContent = formData.get('csv') as string
  const isPublic = formData.get('is_public') === 'true'

  if (!title || !csvContent) return { error: 'Missing title or CSV data' }

  // Parse CSV
  const lines = csvContent.trim().split('\n')
  const terms: Array<{ term: string; definition: string; reading: string | null; example_sentence: string | null }> = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (i === 0 && (line.toLowerCase().startsWith('term') || line.toLowerCase().includes('term,'))) continue
    if (!line) continue

    const parts = line.split(',').map(s => s.replace(/^"|"$/g, '').replace(/""/g, '"'))
    terms.push({
      term: parts[0] || '',
      definition: parts[1] || '',
      reading: parts[2] || null,
      example_sentence: parts[3] || null,
    })
  }

  if (terms.length === 0) return { error: 'No valid terms found in CSV' }

  const { data: set, error: setError } = await supabase
    .from('sets')
    .insert({
      user_id: user.id,
      title,
      is_public: isPublic,
    })
    .select()
    .single()

  if (setError) return { error: setError.message }

  const termsWithOrder = terms.map((t, idx) => ({
    set_id: set.id,
    term: t.term,
    definition: t.definition,
    reading: t.reading,
    example_sentence: t.example_sentence,
    order: idx,
  }))

  const { error: termsError } = await supabase
    .from('terms')
    .insert(termsWithOrder)

  if (termsError) return { error: termsError.message }

  revalidatePath('/sets')
  revalidatePath('/sets/my')
  return { data: { setId: set.id, termCount: terms.length } }
}
