'use server'

import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

export async function toggleTermStar(termId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  z.string().uuid().parse(termId)

  const { data: existing } = await supabase
    .from('term_stars')
    .select('id')
    .eq('user_id', user.id)
    .eq('term_id', termId)
    .maybeSingle()

  if (existing) {
    const { error } = await supabase
      .from('term_stars')
      .delete()
      .eq('id', existing.id)

    if (error) return { error: error.message }
    return { starred: false }
  }

  const { error } = await supabase
    .from('term_stars')
    .insert({ user_id: user.id, term_id: termId })

  if (error) return { error: error.message }
  return { starred: true }
}
