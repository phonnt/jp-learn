'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { importSetFromCsv } from '@/actions/import-export'
import { useRouter } from 'next/navigation'
import { Loader2, Upload } from 'lucide-react'
import { toast } from 'sonner'

export function ImportCsvDialog() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [csv, setCsv] = useState('')
  const [isPublic, setIsPublic] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleImport() {
    if (!title.trim() || !csv.trim()) return
    setLoading(true)

    const formData = new FormData()
    formData.append('title', title)
    formData.append('csv', csv)
    formData.append('is_public', String(isPublic))

    const result = await importSetFromCsv(formData)
    setLoading(false)

    if (result.error) {
      toast.error(result.error)
    } else {
      toast.success(`Đã import ${result.data?.termCount} thẻ`)
      setOpen(false)
      router.push(`/sets/${result.data?.setId}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Upload className="mr-1 h-4 w-4" />
        Import CSV
      </Button>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Import từ CSV</DialogTitle>
          <DialogDescription>
            Định dạng: Term,Definition,Reading,Example (mỗi dòng 1 thẻ)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Tiêu đề</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Tên bộ thẻ" />
          </div>
          <div className="space-y-1.5">
            <Label>Nội dung CSV</Label>
            <textarea
              className="min-h-[200px] w-full rounded-2xl border border-hairline bg-canvas p-3 text-sm text-ink outline-none focus:ring-1 focus:ring-hairline"
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              placeholder="勉強,học tập,べんきょう,日本語を勉強します"
            />
          </div>
          <div className="flex items-center gap-2">
            <Switch id="csv-public" checked={isPublic} onCheckedChange={setIsPublic} />
            <Label htmlFor="csv-public" className="text-sm text-mid-gray">Công khai</Label>
          </div>
          <Button onClick={handleImport} disabled={loading} className="w-full">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Import'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
