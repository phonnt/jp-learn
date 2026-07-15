'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { createFolderQuick } from '@/actions/folders'
import { Loader2, Folder } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(1, 'Nhập tên thư mục'),
})

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: (folder: { id: string; title: string }) => void
}

export function CreateFolderDialog({ open, onOpenChange, onCreated }: CreateFolderDialogProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { register, handleSubmit, formState: { errors }, reset } = useForm({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: { title: string }) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('title', data.title)

    const result = await createFolderQuick(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    reset()
    onOpenChange(false)
    if (result.id) {
      onCreated?.({ id: result.id, title: data.title })
      router.push(`/folders/${result.id}`)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!loading) onOpenChange(v) }}>
      <DialogContent className="sm:max-w-sm" showCloseButton>
        <DialogTitle className="flex items-center gap-2">
          <Folder className="h-5 w-5 text-mid-gray" />
          Tạo thư mục mới
        </DialogTitle>
        <DialogDescription>
          Thư mục giúp bạn sắp xếp các bộ thẻ theo chủ đề.
        </DialogDescription>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="folder-title" required>Tên thư mục</Label>
            <Input
              id="folder-title"
              placeholder="VD: JLPT N5"
              autoFocus
              {...register('title')}
            />
            {errors.title && <p className="text-sm text-ember">{errors.title.message as string}</p>}
          </div>

          {error && <p className="text-sm text-ember">{error}</p>}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={loading}>
              Huỷ
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Tạo'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
