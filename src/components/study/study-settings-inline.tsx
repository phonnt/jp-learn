'use client'

import { useState, useRef } from 'react'
import { Settings } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useStudySettings, type StudyMode } from '@/hooks/use-study-settings'
import { MODE_FORM } from './settings-forms'

const MODE_KEY: Record<StudyMode, string> = {
  flashcard: 'flashcard',
  learn: 'learn',
  quiz: 'quiz',
  test: 'test',
  spell: 'spell',
  match: 'match',
  'hard-words': 'hardWords',
}

interface StudySettingsInlineProps {
  mode: StudyMode
}

export function StudySettingsInline({ mode }: StudySettingsInlineProps) {
  const [open, setOpen] = useState(false)
  const [local, setLocal] = useState<Record<string, unknown> | null>(null)
  const formRef = useRef<Record<string, unknown> | null>(null)

  function handleOpenChange(next: boolean) {
    if (next) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      formRef.current = structuredClone((useStudySettings.getState() as any)[MODE_KEY[mode]])
      setLocal(formRef.current)
    } else {
      formRef.current = null
      setLocal(null)
    }
    setOpen(next)
  }

  function handleChange(partial: Record<string, unknown>) {
    formRef.current = formRef.current ? { ...formRef.current, ...partial } : null
    setLocal(formRef.current)
  }

  function handleOK() {
    if (formRef.current) {
      useStudySettings.getState().update(mode, formRef.current)
    }
    handleOpenChange(false)
  }

  function handleCancel() {
    handleOpenChange(false)
  }

  const Form = MODE_FORM[mode]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button variant="outline" size="icon" className="h-9 w-9">
            <Settings className="h-4 w-4" />
          </Button>
        }
      />
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Cài đặt
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-5">
          {local && <Form value={local} onChange={handleChange} />}
        </div>

        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={handleCancel}>
            Huỷ
          </Button>
          <Button className="flex-1" onClick={handleOK}>
            OK
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
