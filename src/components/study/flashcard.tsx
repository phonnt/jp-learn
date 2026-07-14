'use client'

import { useEffect, useCallback } from 'react'
import { useFlashcardStore } from '@/hooks/use-study'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { ArrowLeft, ArrowRight, Shuffle, RotateCw, Check } from 'lucide-react'

interface FlashcardProps {
  terms: Array<{ term: string; definition: string; reading?: string | null }>
}

export function Flashcard({ terms }: FlashcardProps) {
  const { currentIndex, flipped, cards, setCards, next, prev, flip, shuffle, reset } = useFlashcardStore()

  useEffect(() => {
    setCards(terms)
  }, [terms, setCards])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    if (e.key === 'Enter' || e.key === 'f') { flip() }
  }, [next, prev, flip])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  if (cards.length === 0) return null

  const current = cards[currentIndex]
  const progress = ((currentIndex + 1) / cards.length) * 100

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-between text-sm text-mid-gray">
        <span>{currentIndex + 1} / {cards.length}</span>
        <span>{flipped ? 'Đang xem nghĩa' : 'Đang xem từ'}</span>
      </div>

      <Progress value={progress} className="h-1" />

      <Card
        className="min-h-[280px] cursor-pointer select-none transition-all hover:shadow-md"
        onClick={flip}
      >
        <CardContent className="flex h-[280px] flex-col items-center justify-center p-8 text-center">
          {flipped ? (
            <>
              <p className="text-lg font-medium text-ink">{current.definition}</p>
              {current.reading && (
                <p className="mt-4 text-sm text-mid-gray">Cách đọc: {current.reading}</p>
              )}
              <Button variant="ghost" size="sm" className="mt-4 text-xs text-mid-gray" onClick={(e) => { e.stopPropagation(); flip() }}>
                <RotateCw className="mr-1 h-3 w-3" />
                Lật lại
              </Button>
            </>
          ) : (
            <>
              <p className="text-2xl font-semibold text-ink">{current.term}</p>
              <Button variant="ghost" size="sm" className="mt-6 text-xs text-mid-gray" onClick={(e) => { e.stopPropagation(); flip() }}>
                <RotateCw className="mr-1 h-3 w-3" />
                Lật để xem nghĩa
              </Button>
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4">
        <Button variant="outline" size="icon" onClick={prev} disabled={currentIndex === 0}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={shuffle}>
          <Shuffle className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={reset}>
          <Check className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={next} disabled={currentIndex === cards.length - 1}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <p className="text-center text-xs text-mid-gray">
        Phím tắt: ← → để chuyển, Space để lật, F để lật
      </p>
    </div>
  )
}
