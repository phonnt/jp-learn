'use client'

import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { TermEditor, type TermEntry } from './term-editor'
import { BulkTermInput } from './bulk-term-input'
import { createSet } from '@/actions/sets'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { List, AlignLeft, Loader2, Globe, Lock, Folder } from 'lucide-react'
import { useDraft } from '@/hooks/use-draft'
import { useSession } from '@/hooks/use-supabase'

const formSchema = z.object({
  title: z.string().min(1, 'Nhập tiêu đề'),
  description: z.string().optional(),
  is_public: z.boolean().default(false),
})

interface FolderOption { id: string; title: string }

function parseBulk(text: string): TermEntry[] {
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => {
      const parts = line.split('|').map((p) => p.trim())
      return {
        term: parts[0] || '',
        definition: parts[1] || '',
        reading: parts[2] || '',
        example_sentence: parts[3] || '',
      }
    })
    .filter((t) => t.term && t.definition)
}

function serializeTerms(terms: TermEntry[]): string {
  return terms
    .filter((t) => t.term && t.definition)
    .map((t) => {
      const parts = [t.term, t.definition]
      if (t.reading) parts.push(t.reading)
      if (t.example_sentence) parts.push(t.example_sentence)
      return parts.join(' | ')
    })
    .join('\n')
}

interface SetEditorProps {
  folderId?: string
}

export function SetEditor({ folderId: initialFolderId }: SetEditorProps) {
  const router = useRouter()
  const { session } = useSession()
  const [mode, setMode] = useState<'single' | 'bulk'>('single')
  const defaultTerms = [{ term: '', definition: '', reading: '', example_sentence: '' }]
  const [terms, setTerms, clearDraftTerms] = useDraft<TermEntry[]>('set-editor-terms', defaultTerms)
  const [bulkText, setBulkText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [restored, setRestored] = useState(false)
  const [folders, setFolders] = useState<FolderOption[]>([])
  const [selectedFolder, setSelectedFolder] = useState<string>(initialFolderId || '')

  useEffect(() => {
    if (!session?.user?.id) return
    const supabase = createClient()
    supabase.from('folders').select('id, title').eq('user_id', session.user.id).order('created_at', { ascending: false }).then(({ data }) => {
      if (data) setFolders(data)
    })
  }, [session?.user?.id])

  const { register, handleSubmit, watch, formState: { errors }, setValue } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: { title: '', description: '', is_public: false },
  })

  useEffect(() => {
    const saved = localStorage.getItem('jp-draft-set-editor-form')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        if (parsed.title) setValue('title', parsed.title)
        if (parsed.description) setValue('description', parsed.description)
        if (typeof parsed.is_public === 'boolean') setValue('is_public', parsed.is_public)
      } catch {}
    }
    setRestored(true)
  }, [setValue])

  const watchedTitle = watch('title')
  const watchedDesc = watch('description')
  const watchedPublic = watch('is_public')
  useEffect(() => {
    if (!restored) return
    localStorage.setItem('jp-draft-set-editor-form', JSON.stringify({ title: watchedTitle, description: watchedDesc, is_public: watchedPublic }))
  }, [restored, watchedTitle, watchedDesc, watchedPublic])

  const isPublic = watch('is_public')

  function handleModeChange(newMode: 'single' | 'bulk') {
    if (newMode === 'bulk') {
      setBulkText(serializeTerms(terms))
    } else {
      const parsed = parseBulk(bulkText)
      if (parsed.length > 0) {
        setTerms(parsed)
      }
    }
    setMode(newMode)
  }

  async function onSubmit(data: { title: string; description?: string; is_public: boolean }) {
    let validTerms: TermEntry[]

    if (mode === 'bulk') {
      validTerms = parseBulk(bulkText)
    } else {
      validTerms = terms.filter((t) => t.term && t.definition)
    }

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
    if (selectedFolder) formData.append('folderId', selectedFolder)
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
    } else {
      clearDraftTerms()
      localStorage.removeItem('jp-draft-set-editor-form')
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="flex items-start gap-4">
        <div className="flex-1 space-y-2">
          <Input
            id="title"
            placeholder="Nhập tiêu đề, VD: Từ vựng JLPT N5 - Bài 1"
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

      {/* Folder selector */}
      {folders.length > 0 && (
        <div className="flex items-center gap-2">
          <Folder className="h-4 w-4 text-mid-gray shrink-0" />
          <Select value={selectedFolder || null} onValueChange={(v) => setSelectedFolder(v || '')}>
            <SelectTrigger className="w-64 h-9 text-sm">
              <SelectValue placeholder="Lưu vào thư mục (không bắt buộc)" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Không lưu vào thư mục</SelectItem>
              {folders.map((f) => (
                <SelectItem key={f.id} value={f.id}>{f.title}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      <div className="flex items-center justify-between border-b border-ash pb-2">
        <span className="text-sm font-medium text-ink">Thuật ngữ</span>
        <Tabs value={mode} onValueChange={(v) => handleModeChange(v as 'single' | 'bulk')}>
          <TabsList className="h-8">
            <TabsTrigger value="single" className="text-xs px-3">
              <List className="mr-1 h-3.5 w-3.5" />
              Từng thẻ
            </TabsTrigger>
            <TabsTrigger value="bulk" className="text-xs px-3">
              <AlignLeft className="mr-1 h-3.5 w-3.5" />
              Nhập hàng loạt
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {mode === 'single' ? (
        <TermEditor terms={terms} onChange={setTerms} />
      ) : (
        <BulkTermInput value={bulkText} onChange={setBulkText} />
      )}

      {error && <p className="text-sm text-ember">{error}</p>}

      <div className="flex gap-3 pt-4 border-t border-ash">
        <Button type="submit" disabled={loading} size="lg">
          {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Tạo bộ thẻ'}
        </Button>
        <Button type="button" variant="ghost" size="lg" onClick={() => router.back()}>
          Huỷ
        </Button>
      </div>
    </form>
  )
}
