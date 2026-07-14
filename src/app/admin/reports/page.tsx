'use client'

import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { getReports, resolveReport } from '@/actions/reports'
import { toast } from 'sonner'
import { Flag, Trash2, X } from 'lucide-react'

export default function AdminReportsPage() {
  const [reports, setReports] = useState<any[]>([])

  useEffect(() => {
    getReports().then(r => setReports(r.data || []))
  }, [])

  async function handleResolve(reportId: string, action: 'delete_set' | 'dismiss') {
    const result = await resolveReport(reportId, action)
    if (result.error) toast.error(result.error)
    else {
      toast.success(action === 'delete_set' ? 'Đã xoá set' : 'Đã bỏ qua')
      getReports().then(r => setReports(r.data || []))
    }
  }

  const pending = reports.filter(r => r.status === 'pending')

  return (
    <div className="space-y-6">
      <h1 className="text-heading-sm font-semibold text-ink">Báo cáo vi phạm</h1>

      {pending.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12 text-center">
            <Flag className="h-10 w-10 text-mid-gray" />
            <p className="mt-2 text-sm text-mid-gray">Không có báo cáo nào đang chờ xử lý</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {pending.map(r => (
            <Card key={r.id}>
              <CardContent className="flex items-start justify-between p-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-ink">{r.sets?.title || 'Unknown set'}</span>
                    <Badge variant="secondary" className="text-xs">Set ID: {r.set_id?.slice(0, 8)}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-mid-gray">Lý do: {r.reason}</p>
                  <p className="text-xs text-mid-gray">
                    Báo cáo bởi: {r.users?.username || 'Unknown'} ·{' '}
                    {new Date(r.created_at).toLocaleDateString('vi-VN')}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={() => handleResolve(r.id, 'delete_set')}>
                    <Trash2 className="mr-1 h-5 w-5 text-ember" />
                    Xoá set
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleResolve(r.id, 'dismiss')}>
                    <X className="mr-1 h-5 w-5" />
                    Bỏ qua
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {reports.filter(r => r.status !== 'pending').length > 0 && (
        <details className="rounded-cards border border-ash p-4">
          <summary className="cursor-pointer text-sm font-medium text-mid-gray">
            Đã xử lý ({reports.filter(r => r.status !== 'pending').length})
          </summary>
          <div className="mt-3 space-y-2">
            {reports.filter(r => r.status !== 'pending').map(r => (
              <div key={r.id} className="flex items-center justify-between text-sm">
                <span className="text-mid-gray">{r.sets?.title || 'Unknown'}</span>
                <Badge variant="secondary" className="text-xs">{r.status}</Badge>
              </div>
            ))}
          </div>
        </details>
      )}
    </div>
  )
}
