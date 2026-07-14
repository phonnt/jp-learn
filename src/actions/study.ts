'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'
import { calculateSM2 } from '@/lib/sm2'

export async function startStudySession(setId: string, mode: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: session, error } = await supabase
    .from('study_sessions')
    .insert({ user_id: user.id, set_id: setId, mode })
    .select()
    .single()

  if (error) return { error: error.message }
  return { data: session }
}

export async function completeStudySession(sessionId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { error } = await supabase
    .from('study_sessions')
    .update({ completed_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('user_id', user.id)

  if (error) return { error: error.message }

  // Update daily progress
  await supabase.rpc('increment_daily_progress', { p_terms_studied: 0 })

  revalidatePath('/dashboard')
  return { success: true }
}

export async function saveStudyResults(
  sessionId: string,
  results: Array<{ termId: string; correct: boolean; timeSpentMs: number }>
) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const rows = results.map(r => ({
    session_id: sessionId,
    term_id: r.termId,
    correct: r.correct,
    time_spent_ms: r.timeSpentMs,
  }))

  const { error } = await supabase.from('study_results').insert(rows)
  if (error) return { error: error.message }

  const correctCount = results.filter(r => r.correct).length

  // Update XP: 10 XP per correct answer
  const { data: currentXp } = await supabase
    .from('user_xp')
    .select('xp, level')
    .eq('user_id', user.id)
    .single()

  const earnedXp = correctCount * 10
  const currentTotal = currentXp?.xp || 0
  const newTotal = currentTotal + earnedXp
  const newLevel = Math.floor(newTotal / 100) + 1

  if (currentXp) {
    await supabase
      .from('user_xp')
      .update({ xp: newTotal, level: newLevel })
      .eq('user_id', user.id)
  } else {
    await supabase
      .from('user_xp')
      .insert({ user_id: user.id, xp: earnedXp, level: 1 })
  }

  // Update daily progress
  const today = new Date().toISOString().split('T')[0]
  const { data: dp } = await supabase
    .from('daily_progress')
    .select('terms_studied, xp_earned')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  if (dp) {
    await supabase
      .from('daily_progress')
      .update({
        terms_studied: dp.terms_studied + results.length,
        xp_earned: dp.xp_earned + earnedXp,
      })
      .eq('user_id', user.id)
      .eq('date', today)
  } else {
    await supabase
      .from('daily_progress')
      .insert({
        user_id: user.id,
        date: today,
        terms_studied: results.length,
        xp_earned: earnedXp,
      })
  }

  return { success: true, earnedXp }
}

export async function saveReview(termId: string, quality: number, timeSpentMs: number) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get current review data
  const { data: existing } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .eq('term_id', termId)
    .single()

  const sm2 = calculateSM2(
    quality,
    existing?.easiness_factor,
    existing?.interval,
    existing?.repetitions
  )

  if (existing) {
    await supabase
      .from('reviews')
      .update({
        easiness_factor: sm2.easinessFactor,
        interval: sm2.interval,
        repetitions: sm2.repetitions,
        next_review_at: sm2.nextReviewAt.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('user_id', user.id)
      .eq('term_id', termId)
  } else {
    await supabase
      .from('reviews')
      .insert({
        user_id: user.id,
        term_id: termId,
        easiness_factor: sm2.easinessFactor,
        interval: sm2.interval,
        repetitions: sm2.repetitions,
        next_review_at: sm2.nextReviewAt.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      })
  }

  return { success: true }
}

export async function getDueReviews(setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data: terms } = await supabase
    .from('terms')
    .select('id, term, definition, reading')
    .eq('set_id', setId)

  if (!terms) return { data: [] }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('*')
    .eq('user_id', user.id)
    .in('term_id', terms.map(t => t.id))
    .lte('next_review_at', new Date().toISOString())

  const reviewedTermIds = new Set((reviews || []).map(r => r.term_id))

  // Terms never reviewed + due reviews
  const dueTerms = terms.filter(t => !reviewedTermIds.has(t.id))
  const reviewMap = new Map((reviews || []).map(r => [r.term_id, r]))

  return {
    data: terms.map(t => ({
      ...t,
      due: !reviewedTermIds.has(t.id) || (reviewMap.get(t.id)?.next_review_at || '') <= new Date().toISOString(),
      review: reviewMap.get(t.id) || null,
    })),
  }
}
