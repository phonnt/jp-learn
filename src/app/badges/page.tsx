import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { BadgesPageClient } from '@/components/dashboard/badges-page-client'

export const dynamic = 'force-dynamic'

export default async function BadgesRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: userBadges } = await supabase
    .from('user_badges')
    .select('badge_id, achieved_at')
    .eq('user_id', user.id)

  const { data: badges } = await supabase
    .from('badges')
    .select('*')

  const { data: xp } = await supabase
    .from('user_xp')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <BadgesPageClient
      badges={(badges || []) as any}
      userBadges={(userBadges || []) as any}
      xp={(xp || { xp: 0, level: 1 }) as any}
    />
  )
}
