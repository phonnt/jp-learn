import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, BookOpen, Flag } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function AdminDashboardPage() {
  const supabase = await createClient()

  const { count: userCount } = await supabase
    .from('users')
    .select('*', { count: 'exact', head: true })

  const { count: setCount } = await supabase
    .from('sets')
    .select('*', { count: 'exact', head: true })

  const { count: reportCount } = await supabase
    .from('reports')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'pending')

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-6">
      <h1 className="text-heading-sm font-semibold text-ink">Admin Dashboard</h1>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mid-gray">Người dùng</CardTitle>
            <Users className="h-4 w-4 text-mid-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{userCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mid-gray">Bộ thẻ</CardTitle>
            <BookOpen className="h-4 w-4 text-mid-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{setCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mid-gray">Báo cáo chờ xử lý</CardTitle>
            <Flag className="h-4 w-4 text-mid-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{reportCount || 0}</div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
