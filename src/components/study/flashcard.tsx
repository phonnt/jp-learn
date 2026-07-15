'use client'

import { useEffect, useCallback, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFlashcardStore } from '@/hooks/use-study'
import { useStudySettings } from '@/hooks/use-study-settings'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { StudySettingsInline } from '@/components/study/study-settings-inline'
import { speak } from '@/lib/tts'
import {
  ArrowLeft,
  ArrowRight,
  Shuffle,
  RotateCw,
  Check,
  Volume2,
  Lightbulb,
  Star,
  Pencil,
  Maximize2,
  Minimize2,
  Play,
} from 'lucide-react'

interface FlashcardTerm {
  term: string
  definition: string
  reading?: string | null
  id?: string
}

interface FlashcardProps {
  terms: FlashcardTerm[]
  setId?: string
  starredTermIds?: Set<string>
  onToggleStar?: (termId: string) => void
  onEditTerm?: (termId: string) => void
}

export function Flashcard({ terms, setId, starredTermIds, onToggleStar, onEditTerm }: FlashcardProps) {
  const router = useRouter()
  const { currentIndex, flipped, cards, setCards, next, prev, flip, shuffle, reset } = useFlashcardStore()
  const display = useStudySettings((state) => state.flashcard.display)
  const activeSide = flipped ? display.back : display.front
  const [hintVisible, setHintVisible] = useState(false)
  const [isFullscreen, setIsFullscreen] = useState(false)

  useEffect(() => {
    setCards(terms.map(t => ({ term: t.term, definition: t.definition, reading: t.reading })))
  }, [terms, setCards])

  useEffect(() => {
    setHintVisible(false)
  }, [currentIndex, flipped])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
    if (e.key === 'Enter' || e.key === 'f') { flip() }
    if (e.key === 's') { e.preventDefault(); speakCurrent() }
    if (e.key === 'h') { e.preventDefault(); setHintVisible(v => !v) }
  }, [next, prev, flip])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  async function toggleFullscreen() {
    if (!document.fullscreenElement) {
      await document.documentElement.requestFullscreen()
      setIsFullscreen(true)
    } else {
      await document.exitFullscreen()
      setIsFullscreen(false)
    }
  }

  useEffect(() => {
    function onFsChange() { setIsFullscreen(!!document.fullscreenElement) }
    document.addEventListener('fullscreenchange', onFsChange)
    return () => document.removeEventListener('fullscreenchange', onFsChange)
  }, [])

  if (cards.length === 0) return null

  const current = terms[currentIndex] || cards[currentIndex]
  const currentId = current?.id
  const progress = ((currentIndex + 1) / cards.length) * 100
  const isStarred = currentId && starredTermIds ? starredTermIds.has(currentId) : false

  function speakCurrent() {
    if (!current) return
    const text = current.reading || current.term
    speak(text, 'ja-JP')
  }

  function getHint(): string | null {
    if (!current) return null
    if (current.reading) return current.reading
    if (current.definition.length > 3) return current.definition.slice(0, 3) + '...'
    return current.definition
  }

  return (
    <div className={`mx-auto max-w-lg space-y-6 ${isFullscreen ? 'fixed inset-0 z-50 flex flex-col items-center justify-center bg-canvas-white p-12' : ''}`}>
      <div className="flex items-center justify-between text-sm text-fog">
        <span>{currentIndex + 1} / {cards.length}</span>
        <span className="flex items-center gap-2">
          {flipped ? 'Đang xem nghĩa' : 'Đang xem từ'}
          <StudySettingsInline mode="flashcard" />
        </span>
      </div>

      <Progress value={progress} className="h-1" />

      {/* Toolbar above card */}
      <div className="flex items-center justify-center gap-1">
        {current && (
          <button type="button" onClick={speakCurrent} className="flex items-center gap-1 rounded-small p-1.5 text-mid-gray hover:bg-ash/50 transition-colors" title="Phát âm (S)">
            <Volume2 className="h-4 w-4" />
          </button>
        )}
        {current && (
          <button type="button" onClick={() => setHintVisible(!hintVisible)} className="flex items-center gap-1 rounded-small p-1.5 text-mid-gray hover:bg-ash/50 transition-colors" title="Gợi ý (H)">
            <Lightbulb className={`h-4 w-4 ${hintVisible ? 'fill-yellow-400 text-yellow-500' : ''}`} />
          </button>
        )}
        {currentId && onToggleStar && (
          <button type="button" onClick={() => onToggleStar(currentId)} className="flex items-center gap-1 rounded-small p-1.5 transition-colors" title="Đánh dấu thẻ khó">
            <Star className={`h-4 w-4 ${isStarred ? 'fill-yellow-500 text-yellow-500' : 'text-mid-gray hover:text-ink'}`} />
          </button>
        )}
        {currentId && onEditTerm && (
          <button type="button" onClick={() => onEditTerm(currentId)} className="flex items-center gap-1 rounded-small p-1.5 text-mid-gray hover:bg-ash/50 transition-colors" title="Sửa thẻ">
            <Pencil className="h-4 w-4" />
          </button>
        )}
      </div>

      <Card
        className="min-h-[280px] cursor-pointer select-none transition-all hover:shadow-md"
        onClick={flip}
      >
        <CardContent className="flex h-[280px] flex-col items-center justify-center p-4 text-center">
          {flipped ? (
            <>
              {activeSide.showDefinition && (
                <p className="text-lg font-medium text-charcoal">{current.definition}</p>
              )}
              {activeSide.showReading && current.reading && (
                <p className="mt-4 text-sm text-fog">Cách đọc: {current.reading}</p>
              )}
              {activeSide.showKanji && (
                <p className="mt-2 text-sm text-mid-gray">{current.term}</p>
              )}
              <Button variant="ghost" size="sm" className="mt-4 text-xs text-fog" onClick={(e) => { e.stopPropagation(); flip() }}>
                <RotateCw className="mr-1 h-5 w-5" />
                Lật lại
              </Button>
            </>
          ) : (
            <>
              {activeSide.showKanji && (
                <p className="text-2xl font-semibold text-charcoal">{current.term}</p>
              )}
              {activeSide.showReading && current.reading && (
                <p className="mt-2 text-sm text-fog">{current.reading}</p>
              )}
              {activeSide.showDefinition && (
                <p className="mt-2 text-sm text-mid-gray">{current.definition}</p>
              )}
              <Button variant="ghost" size="sm" className="mt-6 text-xs text-fog" onClick={(e) => { e.stopPropagation(); flip() }}>
                <RotateCw className="mr-1 h-5 w-5" />
                Lật để xem nghĩa
              </Button>
            </>
          )}
          {hintVisible && !flipped && getHint() && (
            <p className="mt-3 text-xs text-primary-action-fill italic">
              Gợi ý: {getHint()}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Bottom navigation */}
      <div className="flex items-center justify-center gap-2">
        <Button variant="outline" size="icon" onClick={prev} disabled={currentIndex === 0}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={shuffle}>
          <Shuffle className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={reset}>
          <Check className="h-5 w-5" />
        </Button>
        {setId && (
          <Button variant="outline" size="icon" onClick={() => router.push(`/sets/${setId}/auto-play`)}>
            <Play className="h-5 w-5" />
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={next} disabled={currentIndex === cards.length - 1}>
          <ArrowRight className="h-5 w-5" />
        </Button>
        <Button variant="outline" size="icon" onClick={toggleFullscreen}>
          {isFullscreen ? <Minimize2 className="h-5 w-5" /> : <Maximize2 className="h-5 w-5" />}
        </Button>
      </div>

      <p className="text-center text-xs text-fog">
        Phím tắt: ← → để chuyển, Space/F để lật, S để phát âm, H gợi ý
      </p>
    </div>
  )
}
