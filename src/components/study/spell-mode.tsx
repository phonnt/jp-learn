'use client'

import { useEffect, useRef, useState } from 'react'
import { useSpellStore, speak } from '@/hooks/use-spell'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Volume2, RotateCw, Check, SkipForward, ArrowRight, AlertTriangle, Volume1, VolumeX } from 'lucide-react'

interface SpellModeProps {
  terms: Array<{ id: string; term: string; definition: string; reading: string | null }>
}

export function SpellMode({ terms }: SpellModeProps) {
  const { words, currentIndex, attempts, correct, isComplete, setWords, markCorrect, markIncorrect, next, reset } = useSpellStore()
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null)
  const [hint, setHint] = useState(false)
  const [rate, setRate] = useState(0.8)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    setWords(terms)
  }, [terms, setWords])

  useEffect(() => {
    if (!isComplete && words.length > 0 && currentIndex < words.length) {
      speak(words[currentIndex].term, 'ja-JP', rate)
    }
  }, [currentIndex, words, isComplete, rate])

  useEffect(() => {
    inputRef.current?.focus()
  }, [feedback])

  const current = words[currentIndex]
  const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0

  function handlePlay() {
    if (current) speak(current.term, 'ja-JP', rate)
  }

  function handleCheck() {
    if (!current) return
    const normalized = answer.trim().toLowerCase()
    const term = current.term.trim().toLowerCase()
    const reading = current.reading?.trim().toLowerCase() || ''

    if (normalized === term || normalized === reading) {
      markCorrect()
      setFeedback('correct')
    } else {
      markIncorrect()
      setFeedback('incorrect')
    }
  }

  function handleContinue() {
    setFeedback(null)
    setAnswer('')
    setHint(false)
    next()
  }

  function handleSkip() {
    markIncorrect()
    setFeedback('incorrect')
  }

  if (isComplete) {
    const percent = attempts > 0 ? Math.round((correct / attempts) * 100) : 0
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h2 className="text-heading-sm font-semibold text-ink">Luyện chính tả hoàn thành!</h2>
        <Card>
          <CardContent className="p-8">
            <div className="text-5xl font-bold text-ink">{correct}/{attempts}</div>
            <p className="mt-2 text-lg text-mid-gray">{percent}% đúng</p>
            <Button className="mt-6" onClick={reset}>
              <RotateCw className="mr-1 h-4 w-4" />
              Làm lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!current) return null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between text-sm text-mid-gray">
        <span>{currentIndex + 1} / {words.length}</span>
        <Badge variant="secondary" className="text-xs">
          {feedback === 'correct' ? 'Đúng' : feedback === 'incorrect' ? 'Sai' : 'Nghe và gõ'}
        </Badge>
      </div>

      <Progress value={progress} className="h-1" />

      <Card>
        <CardContent className="p-8 text-center">
          <p className="mb-4 text-xs text-mid-gray">Nghe phát âm và gõ lại từ tiếng Nhật</p>

          <Button variant="outline" size="lg" className="h-16 w-16 rounded-full" onClick={handlePlay}>
            <Volume2 className="h-8 w-8" />
          </Button>

          <div className="mt-4 flex items-center justify-center gap-1">
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRate(Math.max(0.5, rate - 0.1))}>
              <Volume1 className="h-3 w-3" />
            </Button>
            <span className="text-xs text-mid-gray">{rate.toFixed(1)}x</span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setRate(Math.min(1.5, rate + 0.1))}>
              <VolumeX className="h-3 w-3" />
            </Button>
          </div>

          {feedback === null ? (
            <div className="mt-6 space-y-3">
              <Input
                ref={inputRef}
                placeholder="Gõ từ tiếng Nhật..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                className="text-center text-lg"
                autoFocus
              />
              {hint && (
                <p className="text-xs text-mid-gray">
                  Gợi ý: {current.term.slice(0, 1)}{'＿'.repeat(current.term.length - 1)}
                </p>
              )}
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleCheck}>
                  <Check className="mr-1 h-4 w-4" />
                  Kiểm tra
                </Button>
                <Button variant="ghost" size="icon" onClick={() => setHint(true)}>
                  <AlertTriangle className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={handleSkip}>
                  <SkipForward className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className={`rounded-lg border p-4 ${feedback === 'correct' ? 'border-green-300 bg-green-50' : 'border-ember/30 bg-red-50'}`}>
                <p className={`text-sm font-medium ${feedback === 'correct' ? 'text-green-700' : 'text-ember'}`}>
                  {feedback === 'correct' ? 'Đúng!' : 'Sai!'}
                </p>
                <p className="mt-1 text-lg font-semibold text-ink">{current.term}</p>
                {current.reading && <p className="text-sm text-mid-gray">{current.reading}</p>}
                <p className="text-sm text-mid-gray">Nghĩa: {current.definition}</p>
              </div>
              <Button className="w-full" onClick={handleContinue}>
                Tiếp theo
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-center text-xs text-mid-gray">
        Phím: Enter để kiểm tra, nút loa để nghe lại
      </p>
    </div>
  )
}
