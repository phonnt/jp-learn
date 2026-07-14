'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

export async function getDailyGoal() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const { data } = await supabase
    .from('user_goals')
    .select('*')
    .eq('user_id', user.id)
    .single()

  return { data: data || { daily_goal: 20, reminder_enabled: false } }
}

export async function setDailyGoal(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const dailyGoal = parseInt(formData.get('daily_goal') as string) || 20
  const reminderEnabled = formData.get('reminder_enabled') === 'true'

  const { error } = await supabase.from('user_goals').upsert({
    user_id: user.id,
    daily_goal: Math.max(1, Math.min(100, dailyGoal)),
    reminder_enabled: reminderEnabled,
  })

  if (error) return { error: error.message }

  revalidatePath('/goals')
  revalidatePath('/dashboard')
  return { success: true }
}

export async function getWeeklyProgress() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: 'Unauthorized' }

  const sevenDaysAgo = new Date()
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6)

  const { data } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', user.id)
    .gte('date', sevenDaysAgo.toISOString().split('T')[0])
    .order('date', { ascending: true })

  return { data: data || [] }
}
