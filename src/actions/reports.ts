'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function reportSet(setId: string, reason: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase.from('reports').insert({
    set_id: setId,
    reported_by: user.id,
    reason,
  })

  if (error) return { error: error.message }
  return { success: true }
}

export async function getReports() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('reports')
    .select('*, sets!inner(title, user_id), users!inner(username)')
    .order('created_at', { ascending: false })
    .limit(50)

  return { data: data || [] }
}

export async function resolveReport(reportId: string, action: 'delete_set' | 'dismiss') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: report } = await supabase
    .from('reports')
    .select('set_id')
    .eq('id', reportId)
    .single()

  if (!report) return { error: 'Report not found' }

  if (action === 'delete_set') {
    await supabase.from('sets').delete().eq('id', report.set_id)
  }

  await supabase
    .from('reports')
    .update({ status: action === 'dismiss' ? 'dismissed' : 'reviewed' })
    .eq('id', reportId)

  revalidatePath('/admin/reports')
  return { success: true, action }
}
