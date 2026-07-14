import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { GoalsPage } from '@/components/dashboard/goals-page'

export const dynamic = 'force-dynamic'

export default async function GoalsRoute() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { data: goal } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)
  const { data: progress } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  const { data: xp } = await supabase
    .from('user_xp')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return (
    <GoalsPage
      goal={goal || { daily_goal: 20, reminder_enabled: false }}
      progress={(progress || []) as any}
      xp={(xp || { xp: 0, level: 1 }) as any}
    />
  )
}
