import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import { BookOpen, Flame, Layers, Zap, ArrowRight, Clock } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/auth/login')

  const { count: setCount } = await supabase
    .from('sets')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', user.id)

  const today = new Date().toISOString().split('T')[0]

  const { data: dailyProgress } = await supabase
    .from('daily_progress')
    .select('*')
    .eq('user_id', user.id)
    .eq('date', today)
    .single()

  const { data: xp } = await supabase
    .from('user_xp')
    .select('xp, level')
    .eq('user_id', user.id)
    .single()

  // Calculate streak
  const { data: recentDays } = await supabase
    .from('daily_progress')
    .select('date')
    .eq('user_id', user.id)
    .order('date', { ascending: false })
    .limit(30)

  let streak = 0
  const checkDate = new Date()
  if (recentDays) {
    const dateSet = new Set(recentDays.map(d => d.date))
    while (dateSet.has(checkDate.toISOString().split('T')[0])) {
      streak++
      checkDate.setDate(checkDate.getDate() - 1)
    }
  }

  // Due reviews across all sets
  const { data: userSets } = await supabase
    .from('sets')
    .select('id, title')
    .eq('user_id', user.id)

  let dueTermsCount = 0
  const dueSets: Array<{ id: string; title: string; count: number }> = []

  if (userSets) {
    for (const s of userSets) {
      const { data: termIds } = await supabase
        .from('terms')
        .select('id')
        .eq('set_id', s.id)

      if (!termIds || termIds.length === 0) continue

      const { count } = await supabase
        .from('reviews')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id)
        .in('term_id', termIds.map(t => t.id))
        .lte('next_review_at', new Date().toISOString())

      if (count && count > 0) {
        dueTermsCount += count
        dueSets.push({ id: s.id, title: s.title, count })
      }
    }
  }

  return (
    <div className="mx-auto max-w-screen-xl space-y-8 p-6">
      <div>
        <h1 className="text-heading-sm font-semibold text-ink">Dashboard</h1>
        <p className="text-mid-gray">Chào mừng trở lại! Tiếp tục học nào.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mid-gray">Bộ thẻ</CardTitle>
            <Layers className="h-4 w-4 text-mid-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{setCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mid-gray">Hôm nay</CardTitle>
            <BookOpen className="h-4 w-4 text-mid-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{dailyProgress?.terms_studied || 0} thẻ</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mid-gray">Streak</CardTitle>
            <Flame className={`h-4 w-4 ${streak > 0 ? 'text-orange-500' : 'text-mid-gray'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{streak} ngày</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-mid-gray">Level {xp?.level || 1}</CardTitle>
            <Zap className="h-4 w-4 text-mid-gray" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold">{xp?.xp || 0} XP</div>
          </CardContent>
        </Card>
      </div>

      {dueSets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4 text-mid-gray" />
              Cần ôn tập hôm nay ({dueTermsCount} thẻ)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dueSets.map(s => (
              <Link
                key={s.id}
                href={`/sets/${s.id}/learn`}
                className="flex items-center justify-between rounded-lg border border-hairline p-3 transition-colors hover:bg-surface-alt"
              >
                <span className="text-sm font-medium text-ink">{s.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{s.count} thẻ</Badge>
                  <ArrowRight className="h-4 w-4 text-mid-gray" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {setCount === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-mid-gray" />
            <h3 className="mt-4 text-lg font-medium text-ink">Bắt đầu hành trình học tiếng Nhật!</h3>
            <p className="mt-1 text-sm text-mid-gray">Tạo bộ thẻ đầu tiên và bắt đầu học ngay.</p>
            <Link
              href="/sets/new"
              className="mt-4 inline-flex h-9 items-center rounded-2xl bg-ink px-4 text-sm font-medium text-paper"
            >
              Tạo bộ thẻ
            </Link>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
