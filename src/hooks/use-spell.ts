'use client'

import { create } from 'zustand'

interface SpellWord {
  id: string
  term: string
  definition: string
  reading: string | null
}

interface SpellState {
  words: SpellWord[]
  currentIndex: number
  attempts: number
  correct: number
  isComplete: boolean
  setWords: (words: SpellWord[]) => void
  markCorrect: () => void
  markIncorrect: () => void
  next: () => void
  reset: () => void
}

export const useSpellStore = create<SpellState>((set, get) => ({
  words: [],
  currentIndex: 0,
  attempts: 0,
  correct: 0,
  isComplete: false,
  setWords: (words) => set({ words, currentIndex: 0, attempts: 0, correct: 0, isComplete: false }),
  markCorrect: () => set((state) => ({ correct: state.correct + 1, attempts: state.attempts + 1 })),
  markIncorrect: () => set((state) => ({ attempts: state.attempts + 1 })),
  next: () => set((state) => {
    if (state.currentIndex >= state.words.length - 1) {
      return { isComplete: true }
    }
    return { currentIndex: state.currentIndex + 1 }
  }),
  reset: () => set({ currentIndex: 0, attempts: 0, correct: 0, isComplete: false }),
}))

export function speak(text: string, lang: string = 'ja-JP', rate: number = 0.8) {
  if (typeof window === 'undefined') return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = lang
  utterance.rate = rate
  window.speechSynthesis.speak(utterance)
}
