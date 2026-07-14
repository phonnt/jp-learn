'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function getComments(setId: string) {
  const supabase = await createClient()
  const { data } = await supabase
    .from('comments')
    .select('*, users!inner(username, avatar_url)')
    .eq('set_id', setId)
    .order('created_at', { ascending: false })
    .limit(50)

  return { data: data || [] }
}

export async function addComment(setId: string, content: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const parsed = z.string().min(1).max(1000).parse(content)

  const { error } = await supabase
    .from('comments')
    .insert({ user_id: user.id, set_id: setId, content: parsed })

  if (error) return { error: error.message }

  revalidatePath(`/sets/${setId}`)
  return { success: true }
}

export async function deleteComment(commentId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: comment } = await supabase
    .from('comments')
    .select('user_id')
    .eq('id', commentId)
    .single()

  if (!comment || comment.user_id !== user.id) return { error: 'Forbidden' }

  await supabase.from('comments').delete().eq('id', commentId)
  return { success: true }
}
