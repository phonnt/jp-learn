'use client'

import { useEffect, useMemo } from 'react'
import { useQuizStore } from '@/hooks/use-study'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Check, X, ArrowRight, RotateCw } from 'lucide-react'

interface QuizProps {
  terms: Array<{ term: string; definition: string }>
}

export function Quiz({ terms }: QuizProps) {
  const { currentIndex, score, answers, questions, setQuestions, answer, nextQuestion, reset } = useQuizStore()

  const allOptions = useMemo(() => terms.map(t => t.definition), [terms])

  useEffect(() => {
    const generated = terms.map((term) => {
      const otherOptions = allOptions.filter(o => o !== term.definition)
      const shuffledOptions = [term.definition, ...otherOptions.sort(() => Math.random() - 0.5).slice(0, 3)]
      const correctIndex = shuffledOptions.indexOf(term.definition)
      return {
        term: term.term,
        definition: term.definition,
        options: shuffledOptions.sort(() => Math.random() - 0.5),
        correctIndex: shuffledOptions.sort(() => Math.random() - 0.5).indexOf(term.definition),
      }
    })
    // Fix correctIndex after final shuffle
    const fixed = generated.map(q => {
      const idx = q.options.indexOf(q.definition)
      return { ...q, correctIndex: idx }
    })
    setQuestions(fixed)
  }, [terms, setQuestions, allOptions])

  if (questions.length === 0) return null

  const isComplete = currentIndex >= questions.length

  if (isComplete) {
    const percent = Math.round((score / questions.length) * 100)
    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <h2 className="text-heading-sm font-semibold text-ink">Hoàn thành!</h2>
        <Card>
          <CardContent className="p-8">
            <div className="text-5xl font-bold text-ink">{score}/{questions.length}</div>
            <p className="mt-2 text-lg text-mid-gray">{percent}% đúng</p>
            <div className="mt-6 space-y-2">
              {answers.map((a, i) => (
                <div key={i} className="flex items-center justify-center gap-2 text-sm">
                  {a.correct ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-ember" />
                  )}
                  <span className={a.correct ? 'text-mid-gray' : 'text-ink'}>
                    {questions[i].term}
                  </span>
                </div>
              ))}
            </div>
            <Button className="mt-6" onClick={reset}>
              <RotateCw className="mr-1 h-4 w-4" />
              Làm lại
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const question = questions[currentIndex]
  const progress = ((currentIndex + 1) / questions.length) * 100

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between text-sm text-mid-gray">
        <span>{currentIndex + 1} / {questions.length}</span>
        <span>Điểm: {score}</span>
      </div>

      <Progress value={progress} className="h-1" />

      <Card>
        <CardContent className="p-8">
          <p className="mb-2 text-xs text-mid-gray">Chọn nghĩa đúng của:</p>
          <p className="mb-6 text-2xl font-semibold text-ink">{question.term}</p>
          <div className="space-y-3">
            {question.options.map((option, idx) => (
              <Button
                key={idx}
                variant="outline"
                className="w-full justify-start text-left"
                onClick={() => { answer(idx); nextQuestion() }}
              >
                {option}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
