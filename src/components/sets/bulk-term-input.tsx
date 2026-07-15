'use client'

import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Sparkles } from 'lucide-react'

const SAMPLE = `勉強 | học tập | べんきょう | 日本語を勉強します
食べる | ăn | たべる | ご飯を食べます
大きい | to lớn | おおきい | 大きい犬です
先生 | giáo viên | せんせい | 先生は親切です
学校 | trường học | がっこう | 学校に行きます`

export interface BulkTermInputProps {
  value: string
  onChange: (value: string) => void
}

export function BulkTermInput({ value, onChange }: BulkTermInputProps) {
  return (
    <div className="space-y-3">
      <div className="rounded-cards border border-ash bg-paper-mist p-3 text-sm text-mid-gray">
        <p className="font-medium text-ink mb-1">Định dạng:</p>
        <code className="text-xs">
          term | definition | reading | example
        </code>
        <p className="mt-2">
          Mỗi dòng một thẻ. Chỉ cần <strong>term</strong> và <strong>definition</strong> là bắt buộc, reading và example có thể bỏ qua.
        </p>
      </div>

      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={
          'Ví dụ:\n' +
          '勉強 | học tập | べんきょう | 日本語を勉強します\n' +
          '食べる | ăn | たべる | ご飯を食べます'
        }
        className="min-h-[280px] font-mono text-sm leading-relaxed"
      />

      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => onChange(SAMPLE)}
        >
          <Sparkles className="mr-1 h-4 w-4" />
          Điền mẫu
        </Button>
      </div>
    </div>
  )
}
