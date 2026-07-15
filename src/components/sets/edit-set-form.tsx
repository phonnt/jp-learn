'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { TermEditor, type TermEntry } from './term-editor'
import { updateSet } from '@/actions/sets'
import { useRouter } from 'next/navigation'
import { Loader2, Globe, Lock } from 'lucide-react'
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

    const validTerms = terms.filter((t) => t.term && t.definition)
    if (validTerms.length === 0) {
      setError('Cần ít nhất 1 thẻ từ vựng')
      setLoading(false)
      return
    }

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

    const result = await updateSet(set.id, formData)
    if (result?.error) {
      setError(result.error)
      setLoading(false)
      return
    }

    router.push(`/sets/${set.id}`)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6 p-6">
      <div>
        <h1 className="text-heading-sm font-semibold text-ink">Chỉnh sửa bộ thẻ</h1>
        <p className="text-mid-gray">{set.title}</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-start gap-4">
          <div className="flex-1 space-y-2">
            <Input
              id="title"
              placeholder="Nhập tiêu đề"
              className="text-xl font-semibold border-0 border-b-2 border-ash rounded-none px-0 pb-2 focus-visible:ring-0 focus-visible:border-primary-action-fill"
              {...register('title')}
            />
            {errors.title && <p className="text-sm text-ember">{errors.title.message as string}</p>}
            <Input
              id="description"
              placeholder="Thêm mô tả..."
              className="border-0 border-b border-ash rounded-none px-0 pb-1 text-sm focus-visible:ring-0 focus-visible:border-primary-action-fill"
              {...register('description')}
            />
          </div>
          <div className="flex items-center gap-2 pt-2">
            <Switch id="is_public" {...register('is_public')} />
            <Label htmlFor="is_public" className="text-sm text-mid-gray cursor-pointer">
              {isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
            </Label>
          </div>
        </div>

        <div className="border-b border-ash pb-2">
          <span className="text-sm font-medium text-ink">Thuật ngữ ({terms.length} thẻ)</span>
        </div>

        <TermEditor terms={terms} onChange={setTerms} />

        {error && <p className="text-sm text-ember">{error}</p>}

        <div className="flex gap-3 pt-4 border-t border-ash">
          <Button type="submit" disabled={loading} size="lg">
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Lưu thay đổi'}
          </Button>
          <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
            Huỷ
          </Button>
        </div>
      </form>
    </div>
  )
}
