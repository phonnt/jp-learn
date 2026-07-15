'use client'

import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Button } from '@/components/ui/button'
import { type StudyMode, type QuestionType, type DisplayConfig } from '@/hooks/use-study-settings'
import type {
  FlashcardSettings,
  LearnSettings,
  QuizSettings,
  TestSettings,
  SpellSettings,
  MatchSettings,
  HardWordsSettings,
} from '@/hooks/use-study-settings'

/* ─── Display toggles (shared) ─── */

function ToggleGroup({
  config,
  onChange,
  prefix,
}: {
  config: DisplayConfig
  onChange: (key: keyof DisplayConfig, value: boolean) => void
  prefix: string
}) {
  return (
    <div className="space-y-2">
      {(['showKanji', 'showReading', 'showDefinition'] as const).map((key) => (
        <div key={key} className="flex items-center justify-between">
          <Label htmlFor={`${prefix}-${key}`}>
            {key === 'showKanji' ? 'Kanji' : key === 'showReading' ? 'Hiragana / Cách đọc' : 'Nghĩa'}
          </Label>
          <Switch id={`${prefix}-${key}`} checked={config[key]} onCheckedChange={(v) => onChange(key, v)} />
        </div>
      ))}
    </div>
  )
}

export function DisplaySettings({
  mode,
  value,
  onChange,
}: {
  mode: StudyMode
  value: DisplayConfig | { front: DisplayConfig; back: DisplayConfig }
  onChange: (partial: Record<string, unknown>) => void
}) {
  if (mode === 'flashcard') {
    const d = value as { front: DisplayConfig; back: DisplayConfig }
    return (
      <div className="space-y-3">
        <Label className="text-sm font-medium">Hiển thị</Label>
        <div className="space-y-3 rounded-lg border border-ash p-3">
          <div>
            <Label className="text-xs text-mid-gray">Mặt trước</Label>
            <ToggleGroup
              config={d.front}
              onChange={(key, v) => onChange({ display: { ...d, front: { ...d.front, [key]: v } } })}
              prefix="fc-front"
            />
          </div>
          <div className="border-t border-ash pt-3">
            <Label className="text-xs text-mid-gray">Mặt sau</Label>
            <ToggleGroup
              config={d.back}
              onChange={(key, v) => onChange({ display: { ...d, back: { ...d.back, [key]: v } } })}
              prefix="fc-back"
            />
          </div>
        </div>
      </div>
    )
  }

  const d = value as DisplayConfig
  return (
    <div className="space-y-3">
      <Label className="text-sm font-medium">Hiển thị</Label>
      <div className="space-y-2 rounded-lg border border-ash p-3">
        <ToggleGroup config={d} onChange={(key, v) => onChange({ display: { ...d, [key]: v } })} prefix={mode} />
      </div>
    </div>
  )
}

/* ─── Question type multi-toggle ─── */

function QuestionTypeToggle({
  types,
  onChange,
}: {
  types: QuestionType[]
  onChange: (types: QuestionType[]) => void
}) {
  const all: { value: QuestionType; label: string }[] = [
    { value: 'written', label: 'Viết' },
    { value: 'multiple-choice', label: 'Trắc nghiệm' },
    { value: 'true-false', label: 'Đúng/Sai' },
  ]

  function toggle(t: QuestionType) {
    const next = types.includes(t) ? types.filter((x) => x !== t) : [...types, t]
    if (next.length > 0) onChange(next)
  }

  return (
    <div className="space-y-1.5">
      {all.map((opt) => (
        <div key={opt.value} className="flex items-center gap-2">
          <Switch checked={types.includes(opt.value)} onCheckedChange={() => toggle(opt.value)} id={`qt-${opt.value}`} />
          <Label htmlFor={`qt-${opt.value}`}>{opt.label}</Label>
        </div>
      ))}
    </div>
  )
}

/* ─── Direction radio ─── */

function DirectionRadio({
  value,
  onChange,
  prefix,
}: {
  value: 'term-to-def' | 'def-to-term'
  onChange: (v: 'term-to-def' | 'def-to-term') => void
  prefix: string
}) {
  const opts: { value: 'term-to-def' | 'def-to-term'; label: string }[] = [
    { value: 'term-to-def', label: 'Tiếng Nhật → Nghĩa' },
    { value: 'def-to-term', label: 'Nghĩa → Tiếng Nhật' },
  ]
  return (
    <RadioGroup value={value} onValueChange={(v) => onChange(v as 'term-to-def' | 'def-to-term')}>
      {opts.map((o) => (
        <div key={o.value} className="flex items-center gap-2">
          <RadioGroupItem value={o.value} id={`${prefix}-dir-${o.value}`} />
          <Label htmlFor={`${prefix}-dir-${o.value}`}>{o.label}</Label>
        </div>
      ))}
    </RadioGroup>
  )
}

/* ─── Mode forms ─── */

export function FlashcardForm({
  value,
  onChange,
}: {
  value: FlashcardSettings
  onChange: (partial: Partial<FlashcardSettings>) => void
}) {
  const s = value
  const update = onChange

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Chiều lật thẻ</Label>
        <DirectionRadio value={s.direction} onChange={(v) => update({ direction: v })} prefix="fc" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="fc-audio">Tự động đọc</Label>
        <Switch id="fc-audio" checked={s.autoAudio} onCheckedChange={(v) => update({ autoAudio: v })} />
      </div>
      <DisplaySettings mode="flashcard" value={s.display} onChange={update} />
    </div>
  )
}

export function LearnForm({
  value,
  onChange,
}: {
  value: LearnSettings
  onChange: (partial: Partial<LearnSettings>) => void
}) {
  const s = value
  const update = onChange

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Dạng câu hỏi</Label>
        <QuestionTypeToggle types={s.questionTypes} onChange={(v) => update({ questionTypes: v })} />
      </div>
      <div className="space-y-2">
        <Label>Chiều</Label>
        <DirectionRadio value={s.direction} onChange={(v) => update({ direction: v })} prefix="learn" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="learn-count">Số câu</Label>
        <div className="flex items-center gap-2">
          <Input
            id="learn-count"
            type="number"
            min={0}
            className="h-8 w-20"
            value={s.questionCount}
            onChange={(e) => update({ questionCount: Number(e.target.value) })}
          />
          <span className="text-xs text-mid-gray">(0 = tất cả)</span>
        </div>
      </div>
      <DisplaySettings mode="learn" value={s.display} onChange={update} />
    </div>
  )
}

export function QuizForm({
  value,
  onChange,
}: {
  value: QuizSettings
  onChange: (partial: Partial<QuizSettings>) => void
}) {
  const s = value
  const update = onChange

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Dạng câu hỏi</Label>
        <QuestionTypeToggle types={s.types} onChange={(v) => update({ types: v })} />
      </div>
      <div className="space-y-2">
        <Label>Chiều</Label>
        <DirectionRadio value={s.direction} onChange={(v) => update({ direction: v })} prefix="quiz" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="quiz-count">Số câu</Label>
        <div className="flex items-center gap-2">
          <Input
            id="quiz-count"
            type="number"
            min={0}
            className="h-8 w-20"
            value={s.questionCount}
            onChange={(e) => update({ questionCount: Number(e.target.value) })}
          />
          <span className="text-xs text-mid-gray">(0 = tất cả)</span>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="quiz-timer">Tính thời gian</Label>
        <Switch id="quiz-timer" checked={s.timer} onCheckedChange={(v) => update({ timer: v })} />
      </div>
      <DisplaySettings mode="quiz" value={s.display} onChange={update} />
    </div>
  )
}

export function TestForm({
  value,
  onChange,
}: {
  value: TestSettings
  onChange: (partial: Partial<TestSettings>) => void
}) {
  const s = value
  const update = onChange

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-3">
        {([
          { key: 'mcCount' as const, label: 'Trắc nghiệm' },
          { key: 'writtenCount' as const, label: 'Viết' },
          { key: 'tfCount' as const, label: 'Đúng/Sai' },
        ]).map(({ key, label }) => (
          <div key={key} className="space-y-1">
            <Label className="text-xs">{label}</Label>
            <Input
              type="number"
              min={0}
              className="h-8"
              value={s[key]}
              onChange={(e) => update({ [key]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>
      <div className="space-y-2">
        <Label>Chiều</Label>
        <DirectionRadio value={s.direction} onChange={(v) => update({ direction: v })} prefix="test" />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="test-timer">Tính thời gian</Label>
        <Switch id="test-timer" checked={s.timer} onCheckedChange={(v) => update({ timer: v })} />
      </div>
      <DisplaySettings mode="test" value={s.display} onChange={update} />
    </div>
  )
}

export function SpellForm({
  value,
  onChange,
}: {
  value: SpellSettings
  onChange: (partial: Partial<SpellSettings>) => void
}) {
  const s = value
  const update = onChange

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="spell-rate">Tốc độ phát: {s.rate.toFixed(1)}x</Label>
        <Input
          id="spell-rate"
          type="range"
          min={0.5}
          max={1.5}
          step={0.1}
          value={s.rate}
          onChange={(e) => update({ rate: Number(e.target.value) })}
        />
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="spell-repeat">Số lần phát lại</Label>
        <div className="flex items-center gap-1">
          {[1, 2, 3].map((n) => (
            <Button
              key={n}
              type="button"
              variant={s.repeatCount === n ? 'default' : 'outline'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => update({ repeatCount: n })}
            >
              {n}
            </Button>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="spell-hint">Hiện gợi ý nghĩa</Label>
        <Switch id="spell-hint" checked={s.showHint} onCheckedChange={(v) => update({ showHint: v })} />
      </div>
      <DisplaySettings mode="spell" value={s.display} onChange={update} />
    </div>
  )
}

export function MatchForm({
  value,
  onChange,
}: {
  value: MatchSettings
  onChange: (partial: Partial<MatchSettings>) => void
}) {
  const s = value
  const update = onChange

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Giới hạn thời gian</Label>
        <RadioGroup
          value={String(s.timeLimit)}
          onValueChange={(v) => update({ timeLimit: Number(v) })}
        >
          {[
            { value: '0', label: 'Không giới hạn' },
            { value: '60', label: '60 giây' },
            { value: '120', label: '120 giây' },
            { value: '180', label: '180 giây' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem value={opt.value} id={`match-tl-${opt.value}`} />
              <Label htmlFor={`match-tl-${opt.value}`}>{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <DisplaySettings mode="match" value={s.display} onChange={update} />
    </div>
  )
}

export function HardWordsForm({
  value,
  onChange,
}: {
  value: HardWordsSettings
  onChange: (partial: Partial<HardWordsSettings>) => void
}) {
  const s = value
  const update = onChange

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label>Ngưỡng sai tối thiểu</Label>
        <RadioGroup
          value={String(s.minWrongCount)}
          onValueChange={(v) => update({ minWrongCount: Number(v) })}
        >
          {[
            { value: '2', label: 'Sai 2 lần' },
            { value: '3', label: 'Sai 3 lần' },
            { value: '5', label: 'Sai 5 lần' },
          ].map((opt) => (
            <div key={opt.value} className="flex items-center gap-2">
              <RadioGroupItem value={opt.value} id={`hw-${opt.value}`} />
              <Label htmlFor={`hw-${opt.value}`}>{opt.label}</Label>
            </div>
          ))}
        </RadioGroup>
      </div>
      <div className="flex items-center justify-between">
        <Label htmlFor="hw-count">Số câu</Label>
        <div className="flex items-center gap-2">
          <Input
            id="hw-count"
            type="number"
            min={0}
            className="h-8 w-20"
            value={s.questionCount}
            onChange={(e) => update({ questionCount: Number(e.target.value) })}
          />
          <span className="text-xs text-mid-gray">(0 = tất cả)</span>
        </div>
      </div>
      <DisplaySettings mode="hard-words" value={s.display} onChange={update} />
    </div>
  )
}

/* ─── Registry ─── */

type AnyFormProps = { value: Record<string, unknown>; onChange: (partial: Record<string, unknown>) => void }

export const MODE_FORM: Record<StudyMode, (props: AnyFormProps) => React.ReactElement> = {
  flashcard: (p) => <FlashcardForm value={p.value as never} onChange={p.onChange as never} />,
  learn: (p) => <LearnForm value={p.value as never} onChange={p.onChange as never} />,
  quiz: (p) => <QuizForm value={p.value as never} onChange={p.onChange as never} />,
  test: (p) => <TestForm value={p.value as never} onChange={p.onChange as never} />,
  spell: (p) => <SpellForm value={p.value as never} onChange={p.onChange as never} />,
  match: (p) => <MatchForm value={p.value as never} onChange={p.onChange as never} />,
  'hard-words': (p) => <HardWordsForm value={p.value as never} onChange={p.onChange as never} />,
}
