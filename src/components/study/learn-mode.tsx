'use client'

import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { startStudySession, completeStudySession, saveStudyResults, saveReview, getDueReviews } from '@/actions/study'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { ArrowLeft, ArrowRight, Check, RotateCw, X } from 'lucide-react'
import { StudySettingsInline } from '@/components/study/study-settings-inline'
import { useStudySettings } from '@/hooks/use-study-settings'

interface LearnTerm {
  id: string
  term: string
  definition: string
  reading: string | null
  due: boolean
}

interface LearnModeProps {
  setId: string
  title: string
}

export function LearnMode({ setId, title }: LearnModeProps) {
  const [terms, setTerms] = useState<LearnTerm[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [results, setResults] = useState<Array<{ termId: string; correct: boolean; timeSpentMs: number }>>([])
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [answer, setAnswer] = useState('')
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    initSession()
  }, [setId])

  async function initSession() {
    // Start session
    const sessionResult = await startStudySession(setId, 'learn')
    if (sessionResult.data) {
      setSessionId(sessionResult.data.id)
    }

    // Load due reviews
    const dueResult = await getDueReviews(setId)
    if (dueResult.data) {
      setTerms(dueResult.data.filter(t => t.due))
    }
  }

  const display = useStudySettings((state) => state.learn.display)
  const questionTypes = useStudySettings((state) => state.learn.questionTypes)
  const direction = useStudySettings((state) => state.learn.direction)
  const activeType = questionTypes[currentIndex % questionTypes.length] ?? 'written'
  const currentTerm = terms[currentIndex]
  const progress = terms.length > 0 ? ((currentIndex) / terms.length) * 100 : 0

  function handleCorrect() {
    if (!currentTerm) return
    const timeSpent = Date.now() - startTime
    setIsCorrect(true)
    setResults(prev => [...prev, { termId: currentTerm.id, correct: true, timeSpentMs: timeSpent }])
  }

  function handleIncorrect() {
    if (!currentTerm) return
    const timeSpent = Date.now() - startTime
    setIsCorrect(false)
    setResults(prev => [...prev, { termId: currentTerm.id, correct: false, timeSpentMs: timeSpent }])
  }

  async function handleNext() {
    if (isCorrect !== null && currentTerm) {
      const quality = isCorrect ? 4 : 1
      await saveReview(currentTerm.id, quality, Date.now() - startTime)
    }

    setIsCorrect(null)
    setAnswer('')
    setStartTime(Date.now())

    if (currentIndex >= terms.length - 1) {
      // Session complete
      if (sessionId) {
        await saveStudyResults(sessionId, [...results])
        await completeStudySession(sessionId)
      }
      setCompleted(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  function handleCheckAnswer() {
    if (!currentTerm) return
    const normalizedAnswer = answer.trim().toLowerCase()
    const normalizedDefinition = currentTerm.definition.trim().toLowerCase()
    if (normalizedAnswer === normalizedDefinition) {
      handleCorrect()
    } else {
      handleIncorrect()
    }
  }

  function getOptions(): string[] {
    if (!currentTerm) return []
    const correct = direction === 'term-to-def' ? currentTerm.definition : currentTerm.term
    const distractors = terms
      .filter(t => t.id !== currentTerm.id)
      .map(t => direction === 'term-to-def' ? t.definition : t.term)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    return [correct, ...distractors].sort(() => Math.random() - 0.5)
  }

  function handleMultipleChoice(selected: string) {
    if (!currentTerm) return
    const correct = direction === 'term-to-def' ? currentTerm.definition : currentTerm.term
    if (selected === correct) {
      handleCorrect()
    } else {
      handleIncorrect()
    }
  }

  function handleTrueFalse(isCorrectAnswer: boolean) {
    if (isCorrectAnswer) {
      handleCorrect()
    } else {
      handleIncorrect()
    }
  }

  function getQuestionLabel(): string {
    if (direction === 'def-to-term') return 'Nhập từ tương ứng:'
    return 'Nhập nghĩa của:'
  }

  if (completed) {
    const correctCount = results.filter(r => r.correct).length
    const total = results.length
    const percent = total > 0 ? Math.round((correctCount / total) * 100) : 0
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h2 className="text-heading-sm font-semibold text-charcoal">Buổi học hoàn thành!</h2>
        <Card>
          <CardContent className="p-4">
            <div className="text-5xl font-bold text-charcoal">{correctCount}/{total}</div>
            <p className="mt-2 text-lg text-fog">{percent}% đúng</p>
            {percent >= 80 ? (
              <p className="mt-2 text-sm text-green-600">Tuyệt vời! Tiếp tục duy trì nhé!</p>
            ) : percent >= 50 ? (
              <p className="mt-2 text-sm text-fog">Cố gắng hơn nữa nhé!</p>
            ) : (
              <p className="mt-2 text-sm text-ember">Hãy ôn lại các thẻ này!</p>
            )}
            <Button className="mt-6" onClick={() => { setCompleted(false); setCurrentIndex(0); setResults([]); initSession() }}>
              <RotateCw className="mr-1 h-5 w-5" />
              Học lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (terms.length === 0) {
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <Card>
          <CardContent className="p-4">
            <Check className="mx-auto h-10 w-10 text-green-600" />
            <h3 className="mt-4 text-lg font-medium text-charcoal">Tất cả thẻ đã được ôn tập!</h3>
            <p className="mt-1 text-sm text-fog">Quay lại sau để ôn các thẻ mới.</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!currentTerm) return null

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between text-sm text-fog">
        <span>{currentIndex + 1} / {terms.length}</span>
        <span className="flex items-center gap-2">
          <Badge variant="secondary" className="text-xs">
            {isCorrect === null ? 'Trả lời' : isCorrect ? 'Đúng' : 'Sai'}
          </Badge>
          <StudySettingsInline mode="learn" />
        </span>
      </div>

      <Progress value={progress} className="h-1" />

      <Card>
        <CardContent className="p-4 text-center">
          <p className="mb-2 text-xs text-fog">{getQuestionLabel()}</p>
          {direction === 'term-to-def' ? (
            <>
              {display.showKanji && <p className="text-2xl font-semibold text-charcoal">{currentTerm.term}</p>}
              {display.showReading && currentTerm.reading && (
                <p className="mt-1 text-sm text-fog">{currentTerm.reading}</p>
              )}
            </>
          ) : (
            <>
              {display.showDefinition && <p className="text-2xl font-semibold text-charcoal">{currentTerm.definition}</p>}
            </>
          )}

          {isCorrect === null ? (
            activeType === 'written' ? (
              <div className="mt-6 space-y-3">
                <Input
                  placeholder="Gõ câu trả lời..."
                  value={answer}
                  onChange={(e) => setAnswer(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleCheckAnswer()}
                  autoFocus
                />
                <div className="flex gap-2">
                  <Button className="flex-1" onClick={handleCheckAnswer}>
                    <Check className="mr-1 h-5 w-5" />
                    Kiểm tra
                  </Button>
                  <Button variant="outline" onClick={() => { setIsCorrect(false); handleIncorrect() }}>
                    Tôi không biết
                  </Button>
                </div>
              </div>
            ) : activeType === 'multiple-choice' ? (
              <div className="mt-6 space-y-3">
                {getOptions().map((option, idx) => (
                  <Button
                    key={idx}
                    variant="outline"
                    className="w-full justify-start text-left"
                    onClick={() => handleMultipleChoice(option)}
                  >
                    {option}
                  </Button>
                ))}
              </div>
            ) : (
              <div className="mt-6 flex gap-3 justify-center">
                <Button
                  variant="outline"
                  className="px-8"
                  onClick={() => handleTrueFalse(true)}
                >
                  <Check className="mr-1 h-5 w-5" />
                  Đúng
                </Button>
                <Button
                  variant="outline"
                  className="px-8"
                  onClick={() => handleTrueFalse(false)}
                >
                  <X className="mr-1 h-5 w-5" />
                  Sai
                </Button>
              </div>
            )
          ) : (
            <div className="mt-6 space-y-4">
              <div className={`rounded-cards border border-ash p-4 ${isCorrect ? 'border-green-300 bg-green-50' : 'border-ember/30 bg-red-50'}`}>
                <p className={`text-sm font-medium ${isCorrect ? 'text-green-700' : 'text-ember'}`}>
                  {isCorrect ? 'Đúng!' : 'Sai!'}
                </p>
                <p className="mt-1 text-charcoal">
                  Đáp án: <strong>{display.showDefinition ? currentTerm.definition : '***'}</strong>
                </p>
              </div>
              <Button className="w-full" onClick={handleNext}>
                {currentIndex >= terms.length - 1 ? 'Kết thúc' : 'Tiếp theo'}
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
