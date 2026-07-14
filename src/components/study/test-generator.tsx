'use client'

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Check, X, RotateCw, ArrowRight, BookOpen } from 'lucide-react'

interface TestTerm {
  id: string
  term: string
  definition: string
  reading: string | null
}

type QuestionType = 'multiple-choice' | 'true-false' | 'written' | 'match'

interface Question {
  type: QuestionType
  term: string
  definition: string
  options?: string[]
  correctAnswer: string | boolean
  userAnswer?: string | boolean | null
}

interface TestGeneratorProps {
  terms: TestTerm[]
}

export function TestGenerator({ terms }: TestGeneratorProps) {
  const allDefs = useMemo(() => terms.map(t => t.definition), [terms])

  const questions = useMemo(() => {
    const qs: Question[] = []
    const shuffled = [...terms].sort(() => Math.random() - 0.5)

    for (const term of shuffled) {
      const type: QuestionType = qs.length % 3 === 0 ? 'multiple-choice' : qs.length % 3 === 1 ? 'written' : 'true-false'
      const otherDefs = allDefs.filter(d => d !== term.definition)
      const randomDefs = otherDefs.sort(() => Math.random() - 0.5).slice(0, 3)

      if (type === 'multiple-choice') {
        const options = [term.definition, ...randomDefs].sort(() => Math.random() - 0.5)
        qs.push({ type, term: term.term, definition: term.definition, options, correctAnswer: term.definition })
      } else if (type === 'written') {
        qs.push({ type, term: term.term, definition: term.definition, correctAnswer: term.definition })
      } else {
        const isTrue = Math.random() > 0.5
        const displayedDef = isTrue ? term.definition : (randomDefs[0] || term.definition)
        qs.push({ type, term: term.term, definition: displayedDef, correctAnswer: isTrue })
      }
    }
    return qs
  }, [terms, allDefs])

  const [currentIndex, setCurrentIndex] = useState(0)
  const [answers, setAnswers] = useState<(string | boolean | null)[]>(Array(questions.length).fill(null))
  const [completed, setCompleted] = useState(false)
  const [writtenAnswer, setWrittenAnswer] = useState('')
  const [feedback, setFeedback] = useState<boolean | null>(null)

  const current = questions[currentIndex]
  const progress = (currentIndex / questions.length) * 100
  const correctCount = answers.filter((a, i) => a === questions[i]?.correctAnswer).length

  function handleAnswer(answer: string | boolean) {
    setFeedback(answer === current.correctAnswer)
    const newAnswers = [...answers]
    newAnswers[currentIndex] = answer
    setAnswers(newAnswers)
  }

  function handleCheckWritten() {
    const isCorrect = writtenAnswer.trim().toLowerCase() === current.correctAnswer.toString().toLowerCase()
    setFeedback(isCorrect)
    const newAnswers = [...answers]
    newAnswers[currentIndex] = isCorrect
    setAnswers(newAnswers)
  }

  function handleNext() {
    setFeedback(null)
    setWrittenAnswer('')
    if (currentIndex >= questions.length - 1) {
      setCompleted(true)
    } else {
      setCurrentIndex(prev => prev + 1)
    }
  }

  if (completed) {
    const percent = Math.round((correctCount / questions.length) * 100)
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h2 className="text-heading-sm font-semibold text-charcoal">Bài kiểm tra hoàn thành!</h2>
        <Card>
          <CardContent className="p-4">
            <div className="text-5xl font-bold text-charcoal">{correctCount}/{questions.length}</div>
            <p className="mt-2 text-lg text-fog">{percent}% đúng</p>
            <div className="mt-6 space-y-1 text-left">
              {questions.map((q, i) => (
                <div key={i} className="flex items-center gap-2 text-sm">
                  {answers[i] === q.correctAnswer ? (
                    <Check className="h-5 w-5 shrink-0 text-green-600" />
                  ) : (
                    <X className="h-5 w-5 shrink-0 text-ember" />
                  )}
                  <span className="text-fog">{q.term}</span>
                </div>
              ))}
            </div>
            <Button className="mt-6" onClick={() => { setCurrentIndex(0); setAnswers(Array(questions.length).fill(null)); setCompleted(false) }}>
              <RotateCw className="mr-1 h-5 w-5" />
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
      <div className="flex items-center justify-between text-sm text-fog">
        <span>{currentIndex + 1} / {questions.length}</span>
        <Badge variant="secondary" className="text-xs">
          {current.type === 'multiple-choice' ? 'Chọn đáp án' : current.type === 'written' ? 'Tự luận' : 'Đúng/Sai'}
        </Badge>
      </div>

      <Progress value={progress} className="h-1" />

      <Card>
        <CardContent className="p-4">
          <p className="mb-2 text-xs text-fog">
            {current.type === 'true-false'
              ? 'Câu sau đây đúng hay sai?'
              : current.type === 'written'
                ? 'Gõ nghĩa của từ:'
                : 'Chọn nghĩa đúng của:'}
          </p>
          <p className="mb-6 text-2xl font-semibold text-charcoal">{current.term}</p>

          {current.type === 'true-false' && (
            <p className="mb-4 text-sm text-fog italic">{current.definition}</p>
          )}

          {feedback !== null ? (
            <div className="space-y-4">
              <div className={`rounded-cards border border-ash p-4 ${feedback ? 'border-green-300 bg-green-50' : 'border-ember/30 bg-red-50'}`}>
                <p className={`text-sm font-medium ${feedback ? 'text-green-700' : 'text-ember'}`}>
                  {feedback ? 'Đúng!' : 'Sai!'}
                </p>
                <p className="mt-1 text-charcoal">
                  Đáp án: <strong>{current.correctAnswer.toString()}</strong>
                </p>
              </div>
              <Button className="w-full" onClick={handleNext}>
                {currentIndex >= questions.length - 1 ? 'Xem kết quả' : 'Tiếp theo'}
                <ArrowRight className="ml-1 h-5 w-5" />
              </Button>
            </div>
          ) : (
            <>
              {current.type === 'multiple-choice' && current.options && (
                <div className="space-y-3">
                  {current.options.map((opt, i) => (
                    <Button key={i} variant="outline" className="w-full justify-start text-left" onClick={() => handleAnswer(opt)}>
                      {opt}
                    </Button>
                  ))}
                </div>
              )}

              {current.type === 'written' && (
                <div className="space-y-3">
                  <Input
                    placeholder="Gõ nghĩa..."
                    value={writtenAnswer}
                    onChange={(e) => setWrittenAnswer(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleCheckWritten()}
                    autoFocus
                  />
                  <Button className="w-full" onClick={handleCheckWritten}>
                    <Check className="mr-1 h-5 w-5" />
                    Kiểm tra
                  </Button>
                </div>
              )}

              {current.type === 'true-false' && (
                <div className="flex gap-3">
                  <Button variant="outline" className="flex-1" onClick={() => handleAnswer(true)}>
                    <Check className="mr-1 h-5 w-5 text-green-600" />
                    Đúng
                  </Button>
                  <Button variant="outline" className="flex-1" onClick={() => handleAnswer(false)}>
                    <X className="mr-1 h-5 w-5 text-ember" />
                    Sai
                  </Button>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
