'use client'

import { useEffect, useRef } from 'react'
import { useMatchStore } from '@/hooks/use-match'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Clock, RotateCw, Trophy } from 'lucide-react'

interface MatchGameProps {
  terms: Array<{ id: string; term: string; definition: string }>
}

export function MatchGame({ terms }: MatchGameProps) {
  const { cards, selected, timer, moves, isRunning, isComplete, selectCard, tick, reset, bestScore } = useMatchStore()
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    useMatchStore.getState().setCards(terms)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [terms])

  useEffect(() => {
    if (isRunning) {
      timerRef.current = setInterval(() => {
        useMatchStore.getState().tick()
      }, 1000)
    } else if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [isRunning])

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60)
    const sec = s % 60
    return `${min}:${sec.toString().padStart(2, '0')}`
  }

  if (isComplete) {
    const score = Math.max(0, 1000 - moves * 20 - timer * 2)
    const isBest = bestScore === null || score > bestScore
    if (isBest) {
      useMatchStore.getState().setBestScore(score)
    }

    return (
      <div className="mx-auto max-w-lg space-y-6 text-center">
        <Card className="p-8">
          <Trophy className="mx-auto h-12 w-12 text-ink" />
          <h2 className="mt-4 text-heading-sm font-semibold text-ink">Hoàn thành!</h2>
          <div className="mt-6 grid grid-cols-3 gap-4">
            <div>
              <div className="text-2xl font-semibold text-ink">{formatTime(timer)}</div>
              <p className="text-xs text-mid-gray">Thời gian</p>
            </div>
            <div>
              <div className="text-2xl font-semibold text-ink">{moves}</div>
              <p className="text-xs text-mid-gray">Lượt</p>
            </div>
            <div>
              <div className="text-2xl font-semibold text-ink">{score}</div>
              <p className="text-xs text-mid-gray">Điểm</p>
            </div>
          </div>
          {isBest && <Badge className="mt-4">Kỷ lục mới!</Badge>}
          {bestScore !== null && (
            <p className="mt-2 text-sm text-mid-gray">Best: {Math.max(score, bestScore)} điểm</p>
          )}
          <Button className="mt-6" onClick={reset}>
            <RotateCw className="mr-1 h-5 w-5" />
            Chơi lại
          </Button>
        </Card>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center justify-between text-sm text-mid-gray">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          {formatTime(timer)}
        </div>
        <span>{moves} lượt</span>
        <span>{cards.filter(c => c.matched).length / 2}/{terms.length} cặp</span>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((card) => (
          <button
            key={card.id}
            onClick={() => selectCard(card.id)}
            disabled={card.matched}
            className={`rounded-cards border-2 p-4 text-sm font-medium transition-all ${
              card.matched
                ? 'border-green-200 bg-green-50 text-green-600 opacity-50 line-through'
                : selected === card.id
                  ? 'border-ink bg-ink text-paper'
                  : 'border-ash bg-paper-mist text-charcoal hover:border-fog hover:shadow-sm'
            } ${card.type === 'term' ? 'font-semibold' : ''}`}
          >
            {card.text}
          </button>
        ))}
      </div>
    </div>
  )
}
