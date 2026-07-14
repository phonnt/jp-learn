'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function toggleLike(setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: existing } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('set_id', setId)
    .single()

  if (existing) {
    await supabase.from('favorites').delete().eq('id', existing.id)
  } else {
    await supabase.from('favorites').insert({ user_id: user.id, set_id: setId })
  }

  revalidatePath(`/sets/${setId}`)
  revalidatePath('/sets')
  return { liked: !existing }
}

export async function getLikeCount(setId: string) {
  const supabase = await createClient()
  const { count } = await supabase
    .from('favorites')
    .select('*', { count: 'exact', head: true })
    .eq('set_id', setId)

  return { count: count || 0 }
}

export async function hasUserLiked(setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { liked: false }

  const { data } = await supabase
    .from('favorites')
    .select('id')
    .eq('user_id', user.id)
    .eq('set_id', setId)
    .single()

  return { liked: !!data }
}
