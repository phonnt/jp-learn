'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getAdminUsers() {
  const supabase = await createClient()
  const { data } = await supabase
    .from('users')
    .select('*, user_roles!inner(role)')
    .order('created_at', { ascending: false })
    .limit(100)

  return { data: data || [] }
}

export async function setUserRole(userId: string, role: 'user' | 'moderator' | 'admin') {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  await supabase.from('user_roles').upsert({ user_id: userId, role })

  revalidatePath('/admin/users')
  return { success: true }
}

export async function deleteUser(userId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { createAdminClient } = await import('@/lib/supabase/admin')
  const adminClient = createAdminClient()
  const { error } = await adminClient.auth.admin.deleteUser(userId)
  if (error) return { error: error.message }

  revalidatePath('/admin/users')
  return { success: true }
}
