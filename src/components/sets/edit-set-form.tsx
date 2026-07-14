'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { TermEditor, type TermEntry } from './term-editor'
import { updateSet } from '@/actions/sets'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import type { TSet, TTerm } from '@/types'

const formSchema = z.object({
  title: z.string().min(1, 'Nhập tiêu đề'),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
})

interface EditSetFormProps {
  set: TSet
  terms: TTerm[]
}

export function EditSetForm({ set, terms: initialTerms }: EditSetFormProps) {
  const router = useRouter()
  const [terms, setTerms] = useState<TermEntry[]>(
    initialTerms.map(t => ({
      term: t.term,
      definition: t.definition,
      reading: t.reading || '',
      example_sentence: t.example_sentence || '',
    }))
  )
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: set.title, description: set.description || '', is_public: set.is_public },
  })

  const isPublic = watch('is_public')

  async function onSubmit(data: { title: string; description?: string; is_public: boolean }) {
    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    formData.append('is_public', String(data.is_public))

    const result = await updateSet(set.id, formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/sets/${set.id}`)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6">
      <div>
        <h1 className="text-heading-sm font-semibold text-ink">Chỉnh sửa bộ thẻ</h1>
        <p className="text-mid-gray">{set.title}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardContent className="space-y-4 p-5">
            <div className="space-y-2">
              <Label htmlFor="title">Tiêu đề *</Label>
              <Input id="title" {...register('title')} />
              {errors.title && <p className="text-sm text-ember">{errors.title.message as string}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Mô tả</Label>
              <Input id="description" {...register('description')} />
            </div>
            <div className="flex items-center gap-2">
              <Switch id="is_public" {...register('is_public')} />
              <Label htmlFor="is_public" className="text-sm text-mid-gray">
                {isPublic ? 'Công khai' : 'Riêng tư'}
              </Label>
            </div>
          </CardContent>
        </Card>

        <TermEditor terms={terms} onChange={setTerms} />

        {error && <p className="text-sm text-ember">{error}</p>}

        <div className="flex gap-3">
          <Button type="submit" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Lưu thay đổi'}
          </Button>
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Huỷ
          </Button>
        </div>
      </form>
    </div>
  )
}
