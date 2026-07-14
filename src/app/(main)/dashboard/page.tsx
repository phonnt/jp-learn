import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
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
    <div className="mx-auto max-w-screen-xl space-y-6 p-6">
      <div>
        <h1 className="text-heading-sm font-medium text-charcoal">Dashboard</h1>
        <p className="text-fog">Chào mừng trở lại! Tiếp tục học nào.</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-fog">Bộ thẻ</CardTitle>
            <Layers className="h-5 w-5 text-fog" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-charcoal">{setCount || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-fog">Hôm nay</CardTitle>
            <BookOpen className="h-5 w-5 text-fog" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-charcoal">{dailyProgress?.terms_studied || 0} thẻ</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-fog">Streak</CardTitle>
            <Flame className={`h-5 w-5 ${streak > 0 ? 'text-tangerine' : 'text-fog'}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-charcoal">{streak} ngày</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-fog">Level {xp?.level || 1}</CardTitle>
            <Zap className="h-5 w-5 text-fog" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-semibold text-charcoal">{xp?.xp || 0} XP</div>
          </CardContent>
        </Card>
      </div>

      {dueSets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-sm font-medium text-charcoal">
              <Clock className="h-5 w-5 text-fog" />
              Cần ôn tập hôm nay ({dueTermsCount} thẻ)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {dueSets.map(s => (
              <Link
                key={s.id}
                href={`/sets/${s.id}/learn`}
                className="flex items-center justify-between rounded-cards border border-ash p-3 transition-colors hover:bg-paper-mist"
              >
                <span className="text-sm font-medium text-charcoal">{s.title}</span>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{s.count} thẻ</Badge>
                  <ArrowRight className="h-5 w-5 text-fog" />
                </div>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}

      {setCount === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <BookOpen className="h-12 w-12 text-fog" />
            <h3 className="mt-4 text-subheading font-medium text-charcoal">Bắt đầu hành trình học tiếng Nhật!</h3>
            <p className="mt-1 text-body text-fog">Tạo bộ thẻ đầu tiên và bắt đầu học ngay.</p>
            <Button asChild className="mt-4 bg-primary-action-fill text-canvas-white hover:opacity-90">
              <Link href="/sets/new">Tạo bộ thẻ</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
