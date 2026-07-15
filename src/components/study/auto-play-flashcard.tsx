'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { RotateCw, Play, Pause, SkipBack, SkipForward, ChevronLeft, ChevronRight } from 'lucide-react'
import { StudySettingsInline } from '@/components/study/study-settings-inline'
import { useStudySettings } from '@/hooks/use-study-settings'

interface AutoPlayFlashcardProps {
  terms: Array<{ term: string; definition: string; reading?: string | null }>
}

export function AutoPlayFlashcard({ terms }: AutoPlayFlashcardProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [isPlaying, setIsPlaying] = useState(false)
  const [intervalSec, setIntervalSec] = useState(3)
  const [shuffled, setShuffled] = useState(terms)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const flipTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const display = useStudySettings((state) => state.flashcard.display)
  const activeSide = flipped ? display.back : display.front
  const current = shuffled[currentIndex]

  useEffect(() => {
    setShuffled(terms)
  }, [terms])

  const stop = useCallback(() => {
    setIsPlaying(false)
    if (timerRef.current) clearInterval(timerRef.current)
    if (flipTimerRef.current) clearTimeout(flipTimerRef.current)
  }, [])

  const goNext = useCallback(() => {
    setFlipped(false)
    setCurrentIndex(prev => (prev + 1) % shuffled.length)
  }, [shuffled.length])

  const goPrev = useCallback(() => {
    setFlipped(false)
    setCurrentIndex(prev => (prev - 1 + shuffled.length) % shuffled.length)
  }, [shuffled.length])

  const start = useCallback(() => {
    setIsPlaying(true)
    setFlipped(false)
    if (timerRef.current) clearInterval(timerRef.current)
    timerRef.current = setInterval(() => {
      setFlipped(false)
      setCurrentIndex(prev => (prev + 1) % shuffled.length)
    }, intervalSec * 1000)
  }, [intervalSec, shuffled.length])

  useEffect(() => {
    if (isPlaying) {
      flipTimerRef.current = setTimeout(() => setFlipped(true), intervalSec * 1000 * 0.6)
    }
    return () => {
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current)
    }
  }, [currentIndex, isPlaying, intervalSec])

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
      if (flipTimerRef.current) clearTimeout(flipTimerRef.current)
    }
  }, [])

  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div className="flex items-center justify-center gap-4 text-sm text-fog">
        <Button variant="ghost" size="sm" onClick={() => setIntervalSec(Math.max(2, intervalSec - 1))}>
          -1s
        </Button>
        <span>{intervalSec}s / thẻ</span>
        <Button variant="ghost" size="sm" onClick={() => setIntervalSec(Math.min(10, intervalSec + 1))}>
          +1s
        </Button>
      </div>

      <div className="flex items-center justify-between text-sm text-fog">
        <span>{currentIndex + 1} / {shuffled.length}</span>
        <span className="flex items-center gap-2">
          {flipped ? 'Đã lật' : 'Chưa lật'}
          <StudySettingsInline mode="flashcard" />
        </span>
      </div>

      <Progress value={((currentIndex + 1) / shuffled.length) * 100} className="h-1" />

      <Card
        className="min-h-[260px] cursor-pointer transition-all hover:shadow-md"
        onClick={() => setFlipped(!flipped)}
      >
        <CardContent className="flex h-[260px] flex-col items-center justify-center p-4 text-center">
          {flipped ? (
            <>
              {activeSide.showDefinition && <p className="text-lg font-medium text-charcoal">{current.definition}</p>}
              {activeSide.showReading && current.reading && <p className="mt-2 text-sm text-fog">{current.reading}</p>}
              {activeSide.showKanji && <p className="mt-2 text-sm text-mid-gray">{current.term}</p>}
            </>
          ) : (
            <>
              {activeSide.showKanji && <p className="text-2xl font-semibold text-charcoal">{current.term}</p>}
              {activeSide.showReading && current.reading && <p className="mt-2 text-sm text-fog">{current.reading}</p>}
              {activeSide.showDefinition && <p className="mt-2 text-sm text-mid-gray">{current.definition}</p>}
            </>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-center gap-4">
        <Button variant="ghost" size="icon" onClick={goPrev}>
          <SkipBack className="h-5 w-5" />
        </Button>
        <Button
          variant="outline"
          size="icon"
          className="h-12 w-12 rounded-full"
          onClick={isPlaying ? stop : start}
        >
          {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5 ml-0.5" />}
        </Button>
        <Button variant="ghost" size="icon" onClick={goNext}>
          <SkipForward className="h-5 w-5" />
        </Button>
      </div>

      <div className="flex justify-center">
        <Button variant="outline" size="sm" onClick={() => { setShuffled([...shuffled].sort(() => Math.random() - 0.5)); setCurrentIndex(0); stop() }}>
          <RotateCw className="mr-1 h-5 w-5" />
          Xáo trộn
        </Button>
      </div>
    </div>
  )
}
