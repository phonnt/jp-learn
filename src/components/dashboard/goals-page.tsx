'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { setDailyGoal as saveDailyGoal } from '@/actions/goals'
import { useRouter } from 'next/navigation'
import { Check, Flame, Target, Zap } from 'lucide-react'
import { toast } from 'sonner'

interface GoalsPageProps {
  goal: { daily_goal: number; reminder_enabled: boolean }
  progress: Array<{ date: string; terms_studied: number; xp_earned: number }>
  xp: { xp: number; level: number }
}

export function GoalsPage({ goal, progress, xp }: GoalsPageProps) {
  const router = useRouter()
  const [dailyGoal, setDailyGoal] = useState(goal.daily_goal)
  const [reminder, setReminder] = useState(goal.reminder_enabled)
  const [loading, setLoading] = useState(false)

  async function handleSave() {
    setLoading(true)
    const formData = new FormData()
    formData.append('daily_goal', String(dailyGoal))
    formData.append('reminder_enabled', String(reminder))
    const result = await saveDailyGoal(formData)
    setLoading(false)
    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success('Đã lưu mục tiêu')
      router.refresh()
    }
  }

  const today = new Date().toISOString().split('T')[0]
  const todayProgress = progress.find(p => p.date === today)
  const todayStudied = todayProgress?.terms_studied || 0
  const percent = Math.min(100, Math.round((todayStudied / dailyGoal) * 100))
  const daysWithData = progress.filter(p => p.terms_studied > 0).length

  return (
    <div className="mx-auto max-w-xl space-y-6 p-6">
      <div>
        <h1 className="text-heading-sm font-semibold text-ink">Mục tiêu & Thống kê</h1>
        <p className="text-mid-gray">Theo dõi tiến độ học tập hằng ngày</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Target className="h-5 w-5 text-mid-gray" />
            Mục tiêu hằng ngày
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Input
              type="number"
              min={1}
              max={100}
              value={dailyGoal}
              onChange={(e) => setDailyGoal(parseInt(e.target.value) || 20)}
              className="w-24"
            />
            <span className="text-sm text-mid-gray">thẻ / ngày</span>
          </div>
          <div className="flex items-center gap-2">
            <Switch id="reminder" checked={reminder} onCheckedChange={setReminder} />
            <Label htmlFor="reminder" className="text-sm text-mid-gray">Gửi thông báo nhắc học</Label>
          </div>
          <Button onClick={handleSave} disabled={loading}>
            <Check className="mr-1 h-5 w-5" />
            Lưu
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Flame className="h-5 w-5 text-mid-gray" />
            Hôm nay
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-semibold text-ink">{todayStudied}</div>
              <p className="text-sm text-mid-gray">/{dailyGoal} thẻ</p>
            </div>
            <div className="text-right">
              <div className="text-2xl font-semibold text-ink">{percent}%</div>
              <p className="text-sm text-mid-gray">hoàn thành</p>
            </div>
          </div>
          <div className="mt-3 h-2 rounded-full bg-canvas">
            <div
              className="h-full rounded-full bg-charcoal transition-all"
              style={{ width: `${percent}%` }}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Zap className="h-5 w-5 text-mid-gray" />
            Tuần này
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-mid-gray">Level {xp.level}</span>
            <span className="text-mid-gray">{xp.xp} XP</span>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => {
              const d = new Date()
              d.setDate(d.getDate() - (6 - i))
              const dateStr = d.toISOString().split('T')[0]
              const dayName = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'][d.getDay()]
              const dp = progress.find(p => p.date === dateStr)
              const studied = dp?.terms_studied || 0
              const isToday = dateStr === today
              return (
                <div key={dateStr} className="flex flex-col items-center gap-1">
                  <span className={`text-xs ${isToday ? 'font-semibold text-ink' : 'text-mid-gray'}`}>
                    {dayName}
                  </span>
                  <div
                    className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-medium ${
                      studied > 0
                        ? studied >= dailyGoal
                          ? 'bg-green-100 text-green-700'
                          : 'bg-charcoal/10 text-ink'
                        : 'bg-canvas text-mid-gray'
                    }`}
                  >
                    {studied > 0 ? studied : '-'}
                  </div>
                </div>
              )
            })}
          </div>
          <p className="text-xs text-mid-gray text-center">{daysWithData}/7 ngày có học trong tuần</p>
        </CardContent>
      </Card>
    </div>
  )
}
