'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Zap, Lock } from 'lucide-react'

interface BadgesPageClientProps {
  badges: Array<{ id: string; key: string; name: string; description: string; icon: string }>
  userBadges: Array<{ badge_id: string; achieved_at: string }>
  xp: { xp: number; level: number }
}

export function BadgesPageClient({ badges, userBadges, xp }: BadgesPageClientProps) {
  const earnedIds = new Set(userBadges.map(ub => ub.badge_id))
  const earnedCount = earnedIds.size

  return (
    <div className="mx-auto max-w-screen-xl space-y-6 p-6">
      <div>
        <h1 className="text-heading-sm font-semibold text-ink">Thành tích</h1>
        <p className="text-mid-gray">
          Đã đạt {earnedCount}/{badges.length} huy hiệu · Level {xp.level} · {xp.xp} XP
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {badges.map(badge => {
          const earned = earnedIds.has(badge.id)
          const userBadge = userBadges.find(ub => ub.badge_id === badge.id)

          return (
            <Card
              key={badge.id}
              className={`transition-shadow ${earned ? '' : 'opacity-50'}`}
            >
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{badge.icon}</span>
                  {earned ? (
                    <Badge variant="secondary" className="text-xs">Đã đạt</Badge>
                  ) : (
                    <Lock className="h-5 w-5 text-mid-gray" />
                  )}
                </div>
                <h3 className="mt-3 font-medium text-ink">{badge.name}</h3>
                <p className="text-sm text-mid-gray">{badge.description}</p>
                {userBadge && (
                  <p className="mt-2 text-xs text-mid-gray">
                    Đạt được: {new Date(userBadge.achieved_at).toLocaleDateString('vi-VN')}
                  </p>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>

      {badges.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <p className="text-mid-gray">Đang cập nhật danh sách huy hiệu...</p>
        </div>
      )}
    </div>
  )
}
