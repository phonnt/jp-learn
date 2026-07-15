'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Trash2, Plus, ChevronDown, ChevronRight, GripVertical } from 'lucide-react'

export interface TermEntry {
  term: string
  definition: string
  reading?: string
  example_sentence?: string
}

interface TermEditorProps {
  terms: TermEntry[]
  onChange: (terms: TermEntry[]) => void
}

export function TermEditor({ terms, onChange }: TermEditorProps) {
  const [expanded, setExpanded] = useState<Record<number, boolean>>({})

  function addTerm() {
    onChange([...terms, { term: '', definition: '', reading: '', example_sentence: '' }])
  }

  function removeTerm(index: number) {
    if (terms.length <= 1) return
    onChange(terms.filter((_, i) => i !== index))
  }

  function updateTerm(index: number, field: keyof TermEntry, value: string) {
    const updated = terms.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    onChange(updated)
  }

  function toggleExpand(index: number) {
    setExpanded((prev) => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="space-y-2">
      <div className="hidden sm:grid sm:grid-cols-[2rem_1fr_1fr_2rem] gap-2 px-1 mb-1">
        <div />
        <span className="text-xs font-medium text-mid-gray uppercase tracking-wide">Thuật ngữ</span>
        <span className="text-xs font-medium text-mid-gray uppercase tracking-wide">Định nghĩa</span>
        <div />
      </div>

      {terms.map((entry, index) => (
        <div
          key={index}
          className="group relative flex flex-col sm:grid sm:grid-cols-[2rem_1fr_1fr_2rem] gap-2 rounded-lg border border-ash bg-canvas-white p-3 transition-shadow hover:shadow-sm"
        >
          <div className="hidden sm:flex items-center justify-center text-mid-gray opacity-0 group-hover:opacity-100 transition-opacity cursor-grab">
            <GripVertical className="h-4 w-4" />
          </div>

          <div className="space-y-1 min-w-0">
            <Label className="sm:sr-only text-xs text-mid-gray">Thuật ngữ</Label>
            <Input
              placeholder="VD: 勉強"
              value={entry.term}
              onChange={(e) => updateTerm(index, 'term', e.target.value)}
              className="border-0 border-b border-transparent focus:border-primary-action-fill rounded-none px-0 pb-1 text-sm h-auto shadow-none focus-visible:ring-0"
              autoFocus={index === terms.length - 1 && terms.length > 1}
            />
          </div>

          <div className="space-y-1 min-w-0">
            <Label className="sm:sr-only text-xs text-mid-gray">Định nghĩa</Label>
            <Input
              placeholder="VD: học tập"
              value={entry.definition}
              onChange={(e) => updateTerm(index, 'definition', e.target.value)}
              className="border-0 border-b border-transparent focus:border-primary-action-fill rounded-none px-0 pb-1 text-sm h-auto shadow-none focus-visible:ring-0"
            />
          </div>

          <div className="hidden sm:flex items-center justify-center gap-1">
            {terms.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-mid-gray opacity-0 group-hover:opacity-100 hover:text-ember transition-opacity"
                onClick={() => removeTerm(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-mid-gray hover:text-ink transition-colors"
              onClick={() => toggleExpand(index)}
            >
              {expanded[index] ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            </Button>
          </div>

          <div className="sm:hidden flex items-center justify-between">
            {terms.length > 1 && (
              <Button
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-mid-gray hover:text-ember"
                onClick={() => removeTerm(index)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-mid-gray hover:text-ink"
              onClick={() => toggleExpand(index)}
            >
              {expanded[index] ? (
                <span className="text-xs text-mid-gray">Ẩn bớt</span>
              ) : (
                <span className="text-xs text-mid-gray">Thêm</span>
              )}
            </Button>
          </div>

          {expanded[index] && (
            <div className="col-span-full grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-ash mt-2">
              <div className="space-y-1">
                <Label className="text-xs text-mid-gray">Cách đọc (furigana)</Label>
                <Input
                  placeholder="VD: べんきょう"
                  value={entry.reading || ''}
                  onChange={(e) => updateTerm(index, 'reading', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs text-mid-gray">Câu ví dụ</Label>
                <Input
                  placeholder="VD: 日本語を勉強します"
                  value={entry.example_sentence || ''}
                  onChange={(e) => updateTerm(index, 'example_sentence', e.target.value)}
                  className="h-9 text-sm"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      <Button variant="ghost" className="w-full border-2 border-dashed border-ash text-mid-gray hover:text-ink hover:border-mid-gray mt-2" onClick={addTerm}>
        <Plus className="mr-1 h-5 w-5" />
        Thêm thẻ
      </Button>
    </div>
  )
}
