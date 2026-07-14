'use server'

import { createClient } from '@/lib/supabase/server'

export async function getHardWords(setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Get terms that the user answered incorrectly at least twice
  const { data: wrongTerms } = await supabase
    .from('study_results')
    .select(`
      term_id,
      count:term_id,
      terms!inner(term, definition, reading)
    `)
    .eq('correct', false)
    .eq('terms.set_id', setId)
    .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString())

  if (!wrongTerms) return { data: [] }

  // Deduplicate and count
  const termMap = new Map<string, { term: string; definition: string; reading: string | null; wrongCount: number }>()
  for (const row of wrongTerms as any[]) {
    const id = row.term_id
    if (termMap.has(id)) {
      termMap.get(id)!.wrongCount++
    } else {
      termMap.set(id, {
        term: (row.terms as any).term,
        definition: (row.terms as any).definition,
        reading: (row.terms as any).reading,
        wrongCount: 1,
      })
    }
  }

  const hardWords = Array.from(termMap.entries())
    .filter(([_, v]) => v.wrongCount >= 2)
    .map(([id, v]) => ({ id, ...v }))
    .sort((a, b) => b.wrongCount - a.wrongCount)

  return { data: hardWords }
}

export async function getHardWordsFromReviews(setId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  // Alternative: Get terms with low easiness factor in reviews
  const { data: terms } = await supabase
    .from('terms')
    .select('id, term, definition, reading')
    .eq('set_id', setId)

  if (!terms) return { data: [] }

  const { data: reviews } = await supabase
    .from('reviews')
    .select('term_id, easiness_factor, repetitions')
    .eq('user_id', user.id)
    .in('term_id', terms.map(t => t.id))

  if (!reviews) return { data: [] }

  const reviewMap = new Map(reviews.map(r => [r.term_id, r]))
  const hardWords = terms
    .map(t => ({
      id: t.id,
      term: t.term,
      definition: t.definition,
      reading: t.reading,
      review: reviewMap.get(t.id),
    }))
    .filter(t => {
      if (!t.review) return false
      return t.review.easiness_factor < 2.0 || (t.review.repetitions <= 1 && t.review.easiness_factor < 2.5)
    })
    .sort((a, b) => (a.review?.easiness_factor || 2.5) - (b.review?.easiness_factor || 2.5))

  return { data: hardWords }
}
