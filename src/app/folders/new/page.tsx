'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { createFolder } from '@/actions/folders'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(1, 'Nhập tên folder'),
  description: z.string().optional(),
})

export default function NewFolderPage() {
  const [loading, setLoading] = useState(false)
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
  })

  async function onSubmit(data: { title: string; description?: string }) {
    setLoading(true)
    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    await createFolder(formData)
  }

  return (
    <div className="mx-auto max-w-lg space-y-6 p-6">
      <h1 className="text-heading-sm font-semibold text-ink">Tạo folder mới</h1>
      <Card>
        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title" required>Tên folder</Label>
              <Input id="title" placeholder="VD: JLPT N5" {...register('title')} />
              {errors.title && <p className="text-sm text-ember">{errors.title.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input id="description" placeholder="..." {...register('description')} />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? <Loader2 className=" h-5 w-5 animate-spin" /> : 'Tạo folder'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
