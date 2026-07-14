'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent } from '@/components/ui/card'
import { TermEditor, type TermEntry } from './term-editor'
import { createSet } from '@/actions/sets'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

const formSchema = z.object({
  title: z.string().min(1, 'Nhập tiêu đề'),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
})

export function SetEditor() {
  const router = useRouter()
  const [terms, setTerms] = useState<TermEntry[]>([
    { term: '', definition: '', reading: '', example_sentence: '' },
  ])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', is_public: false },
  })

  const isPublic = watch('is_public')

  async function onSubmit(data: { title: string; description?: string; is_public: boolean }) {
    const validTerms = terms.filter(t => t.term && t.definition)
    if (validTerms.length === 0) {
      setError('Cần ít nhất 1 thẻ từ vựng')
      return
    }

    setLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('title', data.title)
    if (data.description) formData.append('description', data.description)
    formData.append('is_public', String(data.is_public))
    validTerms.forEach((t, i) => {
      formData.append(`terms[${i}][term]`, t.term)
      formData.append(`terms[${i}][definition]`, t.definition)
      if (t.reading) formData.append(`terms[${i}][reading]`, t.reading)
      if (t.example_sentence) formData.append(`terms[${i}][example_sentence]`, t.example_sentence)
    })

    const result = await createSet(formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="space-y-2">
            <Label htmlFor="title" required>Tiêu đề</Label>
            <Input id="title" placeholder="VD: Từ vựng JLPT N5 - Bài 1" {...register('title')} />
            {errors.title && <p className="text-sm text-ember">{errors.title.message as string}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Mô tả</Label>
            <Input id="description" placeholder="Mô tả ngắn về bộ thẻ..." {...register('description')} />
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
          {loading ? <Loader2 className=" h-5 w-5 animate-spin" /> : 'Tạo bộ thẻ'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => router.back()}>
          Huỷ
        </Button>
      </div>
    </form>
  )
}
