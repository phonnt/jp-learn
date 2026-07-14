'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { getHardWords, getHardWordsFromReviews } from '@/actions/hard-words'
import { saveReview, startStudySession, saveStudyResults, completeStudySession } from '@/actions/study'
import { AlertTriangle, ArrowRight, Check, RotateCw, X } from 'lucide-react'

interface HardWord {
  id: string
  term: string
  definition: string
  reading: string | null
  wrongCount?: number
}

interface HardWordsModeProps {
  setId: string
  title: string
}

export function HardWordsMode({ setId }: HardWordsModeProps) {
  const [words, setWords] = useState<HardWord[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState<Array<{ termId: string; correct: boolean; timeSpentMs: number }>>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [answer, setAnswer] = useState('')
  const [startTime, setStartTime] = useState(Date.now())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    init()
  }, [setId])

  async function init() {
    setLoading(true)
    const sessionResult = await startStudySession(setId, 'learn')
    if (sessionResult.data) setSessionId(sessionResult.data.id)

    // Try from study_results first, fall back to reviews
    let { data } = await getHardWords(setId)
    if (!data || data.length === 0) {
      const result = await getHardWordsFromReviews(setId)
      data = result.data as any || []
    }

    setWords(data || [])
    setLoading(false)
  }

  const current = words[currentIndex]
  const progress = words.length > 0 ? (currentIndex / words.length) * 100 : 0

  function handleCorrect() {
    if (!current) return
    setIsCorrect(true)
    setResults(prev => [...prev, { termId: current.id, correct: true, timeSpentMs: Date.now() - startTime }])
  }

  function handleIncorrect() {
    if (!current) return
    setIsCorrect(false)
    setResults(prev => [...prev, { termId: current.id, correct: false, timeSpentMs: Date.now() - startTime }])
  }

  async function handleNext() {
    if (isCorrect !== null && current) {
      await saveReview(current.id, isCorrect ? 4 : 1, Date.now() - startTime)
    }
    setIsCorrect(null)
    setAnswer('')
    setStartTime(Date.now())

    if (currentIndex >= words.length - 1) {
      if (sessionId) {
        await saveStudyResults(sessionId, results)
        await completeStudySession(sessionId)
      }
      setCompleted(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  function handleCheck() {
    if (!current) return
    if (answer.trim().toLowerCase() === current.definition.trim().toLowerCase()) {
      handleCorrect()
    } else {
      handleIncorrect()
    }
  }

  if (loading) return null

  if (completed) {
    const correct = results.filter(r => r.correct).length
    const total = results.length
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h2 className="text-heading-sm font-semibold text-charcoal">Ôn tập hoàn thành!</h2>
        <Card>
          <CardContent className="p-4">
            <div className="text-5xl font-bold text-charcoal">{correct}/{total}</div>
            <p className="mt-2 text-fog">{total > 0 ? Math.round((correct / total) * 100) : 0}% đúng</p>
            <Button className="mt-6" onClick={() => { setCompleted(false); setCurrentIndex(0); setResults([]); init() }}>
              <RotateCw className="mr-1 h-5 w-5" />
              Ôn lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (words.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center gap-4 p-4 text-center">
          <Check className="h-10 w-10 text-green-600" />
          <h3 className="text-lg font-medium text-charcoal">Không có thẻ khó</h3>
          <p className="text-sm text-fog">Bạn đã trả lời đúng tất cả các thẻ gần đây!</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between text-sm text-fog">
        <span>{currentIndex + 1} / {words.length}</span>
        <Badge variant="secondary" className="flex items-center gap-1 text-xs">
          <AlertTriangle className="h-5 w-5" />
          Sai {current.wrongCount || '?'} lần
        </Badge>
      </div>

      <Progress value={progress} className="h-1" />

      <Card>
        <CardContent className="p-4 text-center">
          <p className="mb-2 text-xs text-fog">Ôn tập từ hay sai:</p>
          <p className="text-2xl font-semibold text-charcoal">{current.term}</p>
          {current.reading && <p className="mt-1 text-sm text-fog">{current.reading}</p>}

          {isCorrect === null ? (
            <div className="mt-6 space-y-3">
              <Input
                placeholder="Gõ nghĩa..."
                value={answer}
                onChange={(e) => setAnswer(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleCheck()}
                autoFocus
              />
              <div className="flex gap-2">
                <Button className="flex-1" onClick={handleCheck}>
                  <Check className="mr-1 h-5 w-5" />
                  Kiểm tra
                </Button>
                <Button variant="outline" onClick={() => handleIncorrect()}>
                  Không biết
                </Button>
              </div>
            </div>
          ) : (
            <div className="mt-6 space-y-4">
              <div className={`rounded-cards border border-ash p-4 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-ember/30 bg-red-50'}`}>
                <p className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-ember'}`}>
                  {isCorrect ? 'Đúng!' : 'Sai!'}
                </p>
                <p className="mt-1 text-charcoal">
                  Đáp án: <strong>{current.definition}</strong>
                </p>
              </div>
              <Button className="w-full" onClick={handleNext}>
                {currentIndex >= words.length - 1 ? 'Kết thúc' : 'Tiếp theo'}
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
