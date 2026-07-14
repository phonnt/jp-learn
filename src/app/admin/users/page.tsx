import { createClient } from '@/lib/supabase/server'
import { AdminUsersClient } from '@/components/admin/admin-users-client'

export const dynamic = 'force-dynamic'

export default async function AdminUsersPage() {
  const supabase = await createClient()
  const { data: users } = await supabase
    .from('users')
    .select('*, user_roles!inner(role)')
    .order('created_at', { ascending: false })
    .limit(100)

  return <AdminUsersClient users={(users || []) as any} />
}
