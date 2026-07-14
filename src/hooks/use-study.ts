'use client'

import { create } from 'zustand'

interface FlashcardState {
  currentIndex: number
  flipped: boolean
  cards: Array<{ term: string; definition: string; reading?: string | null }>
  setCards: (cards: FlashcardState['cards']) => void
  next: () => void
  prev: () => void
  flip: () => void
  shuffle: () => void
  reset: () => void
}

export const useFlashcardStore = create<FlashcardState>((set, get) => ({
  currentIndex: 0,
  flipped: false,
  cards: [],
  setCards: (cards) => set({ cards, currentIndex: 0, flipped: false }),
  next: () => set((state) => ({
    currentIndex: Math.min(state.currentIndex + 1, state.cards.length - 1),
    flipped: false,
  })),
  prev: () => set((state) => ({
    currentIndex: Math.max(state.currentIndex - 1, 0),
    flipped: false,
  })),
  flip: () => set((state) => ({ flipped: !state.flipped })),
  shuffle: () => set((state) => {
    const shuffled = [...state.cards].sort(() => Math.random() - 0.5)
    return { cards: shuffled, currentIndex: 0, flipped: false }
  }),
  reset: () => set({ currentIndex: 0, flipped: false }),
}))

interface QuizState {
  currentIndex: number
  score: number
  answers: Array<{ termId: number; correct: boolean }>
  questions: Array<{
    term: string
    definition: string
    options: string[]
    correctIndex: number
  }>
  setQuestions: (questions: QuizState['questions']) => void
  answer: (selectedIndex: number) => void
  nextQuestion: () => void
  reset: () => void
}

export const useQuizStore = create<QuizState>((set, get) => ({
  currentIndex: 0,
  score: 0,
  answers: [],
  questions: [],
  setQuestions: (questions) => set({ questions, currentIndex: 0, score: 0, answers: [] }),
  answer: (selectedIndex) => set((state) => {
    const current = state.questions[state.currentIndex]
    const correct = selectedIndex === current.correctIndex
    return {
      score: correct ? state.score + 1 : state.score,
      answers: [...state.answers, { termId: state.currentIndex, correct }],
    }
  }),
  nextQuestion: () => set((state) => ({
    currentIndex: state.currentIndex + 1,
  })),
  reset: () => set({ currentIndex: 0, score: 0, answers: [] }),
}))
