'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { Flashcard } from '@/components/study/flashcard'
import { deleteSet, cloneSet, addTerm, updateTermInline } from '@/actions/sets'
import { exportSetToCsv } from '@/actions/import-export'
import { toggleTermStar } from '@/actions/term-stars'
import { LikeButton } from './like-button'
import { CommentSection } from './comment-section'
import { ShareButton } from './share-button'
import { StudySettingsDialog } from '@/components/study/study-settings-dialog'
import type { StudyMode } from '@/hooks/use-study-settings'
import {
  BookOpen,
  FileText,
  Globe,
  Grid3X3,
  Lock,
  Pencil,
  Play,
  Trash2,
  Copy,
  AlertTriangle,
  Ear,
  ListChecks,
  Star,
  MoreHorizontal,
  PlayCircle,
  Download,
  Plus,
  Folder,
  ChevronDown,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import type { TSet, TTerm } from '@/types'

interface SetDetailProps {
  set: TSet
  terms: TTerm[]
  isOwner: boolean
  creator?: { username: string | null; avatar_url: string | null } | null
  starredTermIds: string[]
  folders: { id: string; title: string }[]
  relatedSets: { id: string; title: string }[]
}

export function SetDetail({ set, terms: initialTerms, isOwner, creator, starredTermIds: initialStarred, folders, relatedSets }: SetDetailProps) {
  const router = useRouter()
  const [settingsMode, setSettingsMode] = useState<StudyMode | null>(null)
  const [starredIds, setStarredIds] = useState<Set<string>>(new Set(initialStarred))
  const [terms, setTerms] = useState(initialTerms)
  const [editingTerm, setEditingTerm] = useState<string | null>(null)
  const [editingField, setEditingField] = useState<'term' | 'definition' | null>(null)
  const [editValue, setEditValue] = useState('')
  const [newTerm, setNewTerm] = useState('')
  const [newDef, setNewDef] = useState('')
  const [showTermList, setShowTermList] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (editingTerm) inputRef.current?.focus()
  }, [editingTerm])

  async function handleToggleStar(termId: string) {
    const wasStarred = starredIds.has(termId)
    setStarredIds((prev) => {
      const next = new Set(prev)
      if (wasStarred) next.delete(termId)
      else next.add(termId)
      return next
    })
    const result = await toggleTermStar(termId)
    if (result?.error) {
      setStarredIds((prev) => {
        const next = new Set(prev)
        if (wasStarred) next.add(termId)
        else next.delete(termId)
        return next
      })
    }
  }

  function startEdit(termId: string, field: 'term' | 'definition', currentValue: string) {
    setEditingTerm(termId)
    setEditingField(field)
    setEditValue(currentValue)
  }

  async function saveEdit(termId: string) {
    if (!editingField) return
    const formData = new FormData()
    formData.append('field', editingField)
    formData.append('value', editValue)

    const result = await updateTermInline(termId, formData)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    setTerms((prev) =>
      prev.map((t) => (t.id === termId ? { ...t, [editingField]: editValue } : t))
    )
    setEditingTerm(null)
    setEditingField(null)
  }

  function cancelEdit() {
    setEditingTerm(null)
    setEditingField(null)
  }

  async function handleAddTerm() {
    if (!newTerm.trim() || !newDef.trim()) return
    const formData = new FormData()
    formData.append('term', newTerm.trim())
    formData.append('definition', newDef.trim())
    const result = await addTerm(set.id, formData)
    if (result?.error) {
      toast.error(result.error)
      return
    }
    if (result.term) {
      setTerms((prev) => [...prev, result.term as TTerm])
    }
    setNewTerm('')
    setNewDef('')
    toast.success('Đã thêm thẻ')
  }

  const flashcardTerms = terms.map(t => ({
    term: t.term,
    definition: t.definition,
    reading: t.reading,
  }))

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
        {/* Main content */}
        <div className="space-y-6 min-w-0">
          {/* Header bar */}
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="text-heading-sm font-semibold text-ink truncate">{set.title}</h1>
                {set.is_public ? (
                  <Globe className="h-5 w-5 shrink-0 text-mid-gray" />
                ) : (
                  <Lock className="h-5 w-5 shrink-0 text-mid-gray" />
                )}
              </div>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-mid-gray">
                <span>{terms.length} thuật ngữ</span>
                <Badge variant="secondary" className="text-xs">
                  {set.lang_term} → {set.lang_definition}
                </Badge>
                {creator && (
                  <span className="flex items-center gap-1">
                    <Avatar className="h-4 w-4">
                      <AvatarImage src={creator.avatar_url || undefined} />
                      <AvatarFallback className="text-[8px] bg-ash text-mid-gray">
                        {creator.username?.charAt(0).toUpperCase() || '?'}
                      </AvatarFallback>
                    </Avatar>
                    {creator.username || 'Người dùng'}
                  </span>
                )}
                {folders.map((f) => (
                  <Link key={f.id} href={`/folders/${f.id}`}>
                    <Badge variant="outline" className="text-xs gap-1 hover:bg-ash/50">
                      <Folder className="h-3 w-3" />
                      {f.title}
                    </Badge>
                  </Link>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 shrink-0">
              <LikeButton setId={set.id} />
              <ShareButton setId={set.id} />
              <DropdownMenu>
                <DropdownMenuTrigger className="flex h-8 w-8 items-center justify-center rounded-small text-mid-gray hover:bg-ash/50 outline-none data-open:bg-ash/50 cursor-default">
                  <MoreHorizontal className="h-5 w-5" />
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-44" align="end">
                  {isOwner && (
                    <DropdownMenuItem onClick={() => router.push(`/sets/${set.id}/edit`)}>
                      <Pencil className="mr-2 h-5 w-5" />
                      Sửa
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem onClick={async () => {
                    const result = await exportSetToCsv(set.id)
                    if (result.error) { toast.error(result.error); return }
                    if (result.data) {
                      const blob = new Blob([result.data.csv], { type: 'text/csv;charset=utf-8;' })
                      const url = URL.createObjectURL(blob)
                      const a = document.createElement('a')
                      a.href = url; a.download = result.data.filename; a.click()
                      URL.revokeObjectURL(url)
                      toast.success('Đã tải xuống CSV')
                    }
                  }}>
                    <Download className="mr-2 h-5 w-5" />
                    Export CSV
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => cloneSet(set.id)}>
                    <Copy className="mr-2 h-5 w-5" />
                    Sao chép
                  </DropdownMenuItem>
                  {isOwner && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => deleteSet(set.id)}>
                        <Trash2 className="mr-2 h-5 w-5 text-ember" />
                        Xoá
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* Flashcard — default view, always visible */}
          <div className="bg-gradient-to-b from-paper-mist to-canvas-white rounded-cards border border-ash p-6">
            <Flashcard terms={flashcardTerms} />
          </div>

          {/* Study mode buttons */}
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" onClick={() => setSettingsMode('learn')}>
              <BookOpen className="mr-1 h-4 w-4" />
              Học
            </Button>
            <Button size="sm" variant="outline" asChild>
              <Link href={`/sets/${set.id}/auto-play`}>
                <PlayCircle className="mr-1 h-4 w-4" />
                Auto-play
              </Link>
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSettingsMode('quiz')}>
              <FileText className="mr-1 h-4 w-4" />
              Quiz
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSettingsMode('spell')}>
              <Ear className="mr-1 h-4 w-4" />
              Spell
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSettingsMode('test')}>
              <ListChecks className="mr-1 h-4 w-4" />
              Test
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSettingsMode('match')}>
              <Grid3X3 className="mr-1 h-4 w-4" />
              Match
            </Button>
            <Button size="sm" variant="outline" onClick={() => setSettingsMode('hard-words')}>
              <AlertTriangle className="mr-1 h-4 w-4" />
              Thẻ khó
            </Button>
          </div>

          <StudySettingsDialog
            open={settingsMode !== null}
            onOpenChange={(open) => !open && setSettingsMode(null)}
            mode={settingsMode || 'flashcard'}
            setId={set.id}
          />

          {/* Toggle term list */}
          <div className="border-t border-ash pt-4">
            <button
              type="button"
              onClick={() => setShowTermList(!showTermList)}
              className="flex items-center gap-2 text-sm font-medium text-ink hover:text-primary-action-fill transition-colors"
            >
              {showTermList ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              {showTermList ? 'Ẩn danh sách thuật ngữ' : 'Xem danh sách thuật ngữ'}
            </button>

            {showTermList && (
              <div className="mt-3 space-y-2">
                <div className="rounded-cards border border-ash overflow-hidden">
                  {terms.map((term, index) => {
                    const isStarred = starredIds.has(term.id)
                    return (
                      <div
                        key={term.id}
                        className={`group flex items-center gap-3 px-4 py-3 transition-colors ${
                          index % 2 === 0 ? 'bg-canvas-white' : 'bg-paper-mist'
                        }`}
                      >
                        <span className="w-6 text-sm text-mid-gray shrink-0">{index + 1}</span>

                        <div className="flex-1 min-w-0">
                          {editingTerm === term.id && editingField === 'term' ? (
                            <Input
                              ref={inputRef}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(term.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(term.id)
                                if (e.key === 'Escape') cancelEdit()
                              }}
                              className="h-8 text-sm"
                            />
                          ) : (
                            <p
                              className={`font-medium text-ink truncate ${isOwner ? 'cursor-pointer hover:text-primary-action-fill hover:underline' : ''}`}
                              onClick={() => isOwner && startEdit(term.id, 'term', term.term)}
                            >
                              {term.term}
                            </p>
                          )}
                          {!editingTerm && term.reading && (
                            <p className="text-sm text-mid-gray truncate">{term.reading}</p>
                          )}
                        </div>

                        <div className="flex-1 text-right min-w-0">
                          {editingTerm === term.id && editingField === 'definition' ? (
                            <Input
                              ref={inputRef}
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              onBlur={() => saveEdit(term.id)}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') saveEdit(term.id)
                                if (e.key === 'Escape') cancelEdit()
                              }}
                              className="h-8 text-sm text-right"
                            />
                          ) : (
                            <p
                              className={`text-ink truncate ${isOwner ? 'cursor-pointer hover:text-primary-action-fill hover:underline' : ''}`}
                              onClick={() => isOwner && startEdit(term.id, 'definition', term.definition)}
                            >
                              {term.definition}
                            </p>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleStar(term.id)}
                          className={`shrink-0 p-1 rounded transition-colors ${
                            isStarred
                              ? 'text-yellow-500 hover:text-yellow-600'
                              : 'text-mid-gray hover:text-ink opacity-0 group-hover:opacity-100'
                          }`}
                          aria-label={isStarred ? 'Bỏ đánh dấu' : 'Đánh dấu thẻ khó'}
                        >
                          <Star className={`h-4 w-4 ${isStarred ? 'fill-yellow-500' : ''}`} />
                        </button>
                      </div>
                    )
                  })}
                </div>

                {isOwner && (
                  <div className="flex items-center gap-2 mt-2">
                    <Input
                      placeholder="Thuật ngữ mới..."
                      value={newTerm}
                      onChange={(e) => setNewTerm(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTerm && newDef) handleAddTerm()
                      }}
                      className="h-9 text-sm flex-1"
                    />
                    <Input
                      placeholder="Định nghĩa..."
                      value={newDef}
                      onChange={(e) => setNewDef(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && newTerm && newDef) handleAddTerm()
                      }}
                      className="h-9 text-sm flex-1"
                    />
                    <Button size="sm" onClick={handleAddTerm} disabled={!newTerm.trim() || !newDef.trim()}>
                      <Plus className="h-4 w-4 mr-1" />
                      Thêm
                    </Button>
                  </div>
                )}
              </div>
            )}
          </div>

          <CommentSection setId={set.id} />
        </div>

        {/* Right sidebar */}
        <aside className="hidden lg:block space-y-6">
          <div className="rounded-cards border border-ash p-4 space-y-3">
            <h3 className="text-xs font-semibold text-fog uppercase tracking-wider">Tác giả</h3>
            {creator ? (
              <div className="flex items-center gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src={creator.avatar_url || undefined} />
                  <AvatarFallback className="text-xs bg-ash text-mid-gray">
                    {creator.username?.charAt(0).toUpperCase() || '?'}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium text-ink">{creator.username || 'Người dùng'}</p>
                  <p className="text-xs text-mid-gray">{terms.length} thuật ngữ</p>
                </div>
              </div>
            ) : (
              <p className="text-sm text-mid-gray">Không rõ</p>
            )}
          </div>

          {relatedSets.length > 0 && (
            <div className="rounded-cards border border-ash p-4 space-y-3">
              <h3 className="text-xs font-semibold text-fog uppercase tracking-wider">Bộ thẻ khác</h3>
              <div className="space-y-2">
                {relatedSets.map((rs) => (
                  <Link key={rs.id} href={`/sets/${rs.id}`} className="block text-sm text-ink hover:text-primary-action-fill truncate">
                    {rs.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}
