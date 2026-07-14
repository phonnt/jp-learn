import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export const dynamic = 'force-dynamic'

export default async function ProfilePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: roleData } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <Card>
        <CardHeader className="flex flex-row items-center gap-4">
          <Avatar className="h-16 w-16">
            <AvatarImage src={profile?.avatar_url || user.user_metadata?.avatar_url} />
            <AvatarFallback className="bg-charcoal text-paper text-lg">
              {profile?.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <CardTitle>{profile?.username || user.email}</CardTitle>
            <p className="text-sm text-mid-gray">{user.email}</p>
            <p className="text-xs text-mid-gray">Vai trò: {roleData?.role || 'user'}</p>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <span className="text-mid-gray">ID: </span>
            <span className="text-ink font-mono text-xs">{user.id}</span>
          </div>
          <div className="text-sm">
            <span className="text-mid-gray">Tham gia: </span>
            <span className="text-ink">{new Date(user.created_at).toLocaleDateString('vi-VN')}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
