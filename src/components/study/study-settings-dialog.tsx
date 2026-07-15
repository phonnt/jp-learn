'use client'

import { useRouter } from 'next/navigation'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import { useStudySettings, type StudyMode } from '@/hooks/use-study-settings'
import { MODE_FORM } from './settings-forms'

const MODE_META: Record<StudyMode, { label: string; desc: string }> = {
  flashcard: { label: 'Flashcard', desc: 'Học với thẻ lật' },
  learn: { label: 'Học', desc: 'Học với spaced repetition' },
  quiz: { label: 'Quiz', desc: 'Trắc nghiệm' },
  test: { label: 'Test', desc: 'Bài kiểm tra tổng hợp' },
  spell: { label: 'Spell', desc: 'Chính tả' },
  match: { label: 'Match', desc: 'Ghép thẻ' },
  'hard-words': { label: 'Thẻ khó', desc: 'Ôn tập từ khó' },
}

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: StudyMode
  setId: string
}

export function StudySettingsDialog({ open, onOpenChange, mode, setId }: Props) {
  const router = useRouter()
  const settings = useStudySettings()
  const meta = MODE_META[mode]
  const Form = MODE_FORM[mode]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const value = (settings as any)[mode]

  function handleStart() {
    onOpenChange(false)
    router.push(`/sets/${setId}/${mode}`)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{meta.label}</DialogTitle>
          <DialogDescription>{meta.desc}</DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          <Form value={value} onChange={(partial) => settings.update(mode, partial)} />
        </div>

        <Button onClick={handleStart} className="w-full">
          <Play className="mr-1 h-5 w-5" />
          Bắt đầu
        </Button>
      </DialogContent>
    </Dialog>
  )
}
