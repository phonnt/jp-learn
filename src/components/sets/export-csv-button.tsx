'use client'

import { Button } from '@/components/ui/button'
import { exportSetToCsv } from '@/actions/import-export'
import { Download } from 'lucide-react'
import { toast } from 'sonner'

interface ExportCsvButtonProps {
  setId: string
}

export function ExportCsvButton({ setId }: ExportCsvButtonProps) {
  async function handleExport() {
    const result = await exportSetToCsv(setId)
    if (result.error) {
      toast.error(result.error)
      return
    }
    if (result.data) {
      const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = result.data.filename
      a.click()
      URL.revokeObjectURL(url)
      toast.success('Đã tải xuống CSV')
    }
  }

  return (
    <Button variant="ghost" size="sm" onClick={handleExport}>
      <Download className="mr-1 h-4 w-4" />
      Export CSV
    </Button>
  )
}
