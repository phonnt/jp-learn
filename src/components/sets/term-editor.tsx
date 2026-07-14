'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent } from '@/components/ui/card'
import { Trash2, GripVertical, Plus } from 'lucide-react'

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
  function addTerm() {
    onChange([...terms, { term: '', definition: '', reading: '', example_sentence: '' }])
  }

  function removeTerm(index: number) {
    onChange(terms.filter((_, i) => i !== index))
  }

  function updateTerm(index: number, field: keyof TermEntry, value: string) {
    const updated = terms.map((t, i) => (i === index ? { ...t, [field]: value } : t))
    onChange(updated)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-ink">Thuật ngữ</Label>
        <span className="text-xs text-mid-gray">{terms.length} thẻ</span>
      </div>

      {terms.map((entry, index) => (
        <Card key={index} className="relative">
          <CardContent className="p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs text-mid-gray">Thuật ngữ (tiếng Nhật)</Label>
                <Input
                  placeholder="例: 勉強"
                  value={entry.term}
                  onChange={(e) => updateTerm(index, 'term', e.target.value)}
                  autoFocus={index === terms.length - 1 && terms.length > 1}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-mid-gray">Nghĩa (tiếng Việt)</Label>
                <Input
                  placeholder="vd: học tập"
                  value={entry.definition}
                  onChange={(e) => updateTerm(index, 'definition', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-mid-gray">Cách đọc (furigana)</Label>
                <Input
                  placeholder="vd: べんきょう"
                  value={entry.reading || ''}
                  onChange={(e) => updateTerm(index, 'reading', e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs text-mid-gray">Câu ví dụ</Label>
                <Input
                  placeholder="vd: 日本語を勉強します"
                  value={entry.example_sentence || ''}
                  onChange={(e) => updateTerm(index, 'example_sentence', e.target.value)}
                />
              </div>
            </div>
          </CardContent>
          {terms.length > 1 && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-2 top-2 h-6 w-6 text-mid-gray hover:text-ember"
              onClick={() => removeTerm(index)}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </Card>
      ))}

      <Button variant="outline" className="w-full" onClick={addTerm}>
        <Plus className="mr-1 h-4 w-4" />
        Thêm thẻ
      </Button>
    </div>
  )
}
