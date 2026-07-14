'use server'

import { createClient } from '@/lib/supabase/server'
import { BADGES, checkBadges, type UserStats } from '@/lib/badges'

export async function checkAndAwardBadges() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Gather stats
  const { count: setCount } = await supabase
    .from('sets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { count: studySessions } = await supabase
    .from('study_sessions')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const { data: dp } = await supabase
    .from('daily_progress')
    .select('terms_studied')
    .eq('user_id', user.id)

  const termsLearned = (dp || []).reduce((sum, d) => sum + (d.terms_studied || 0), 0)

  const { data: results } = await supabase
    .from('study_results')
    .select('correct')
    .eq('session_id', supabase.rpc as any)

  const totalResults = results?.length || 0
  const correctResults = results?.filter(r => r.correct).length || 0
  const correctRate = totalResults > 0 ? Math.round((correctResults / totalResults) * 100) : 0

  // Streak
  const { data: recentDays } = await supabase
    .from('daily_progress')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(30)

  let streak = 0
  if (recentDays) {
    const checkDate = new Date()
    const dateSet = new Set(recentDays.map(d => d.date))
    while (dateSet.has(checkDate.toISOString().split('T')[0])) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }

  const stats: UserStats = {
    setCount: setCount || 0,
    totalTerms: 0,
    totalStudySessions: studySessions || 0,
    streak,
    correctRate,
    termsLearned,
    quizScore: correctRate,
  }

  // Get existing badges
  const { data: existing } = await supabase
    .from('user_badges')
    .select('badge_id')
    .eq('user_id', user.id)

  const existingKeys: string[] = []
  if (existing && existing.length > 0) {
    const { data: badgeDefs } = await supabase
      .from('badges')
      .select('key')
      .in('id', existing.map(e => e.badge_id))
    if (badgeDefs) existingKeys.push(...badgeDefs.map(b => b.key))
  }

  const newBadges = checkBadges(stats, existingKeys)
  const awarded: string[] = []

  for (const badge of newBadges) {
    const { data: badgeRow } = await supabase
      .from('badges')
      .select('id')
      .eq('key', badge.key)
      .single()

    if (badgeRow) {
      await supabase.from('user_badges').insert({
        user_id: user.id,
        badge_id: badgeRow.id,
      })
      awarded.push(badge.name)
    }
  }

  return { awarded }
}
