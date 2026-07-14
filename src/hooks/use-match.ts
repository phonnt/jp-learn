'use client'

import { create } from 'zustand'

interface MatchCard {
  id: string
  text: string
  type: 'term' | 'definition'
  matched: boolean
}

interface MatchState {
  cards: MatchCard[]
  selected: string | null
  timer: number
  moves: number
  isRunning: boolean
  isComplete: boolean
  bestScore: number | null
  setCards: (termDefs: Array<{ id: string; term: string; definition: string }>) => void
  selectCard: (id: string) => void
  tick: () => void
  start: () => void
  reset: () => void
  setBestScore: (score: number) => void
}

export const useMatchStore = create<MatchState>((set, get) => ({
  cards: [],
  selected: null,
  timer: 0,
  moves: 0,
  isRunning: false,
  isComplete: false,
  bestScore: null,
  setCards: (termDefs) => {
    const termCards: MatchCard[] = termDefs.map(t => ({
      id: `term-${t.id}`,
      text: t.term,
      type: 'term',
      matched: false,
    }))
    const defCards: MatchCard[] = termDefs.map(t => ({
      id: `def-${t.id}`,
      text: t.definition,
      type: 'definition',
      matched: false,
    }))
    const shuffled = [...termCards, ...defCards].sort(() => Math.random() - 0.5)
    set({ cards: shuffled, selected: null, timer: 0, moves: 0, isRunning: false, isComplete: false })
  },
  selectCard: (id) => {
    const state = get()
    if (state.isComplete) return

    const card = state.cards.find(c => c.id === id)
    if (!card || card.matched) return

    if (!state.isRunning) {
      set({ isRunning: true })
    }

    if (state.selected === null) {
      set({ selected: id })
    } else {
      const first = state.cards.find(c => c.id === state.selected)
      if (!first || first.type === card.type) {
        set({ selected: id })
        return
      }

      const firstId = state.selected.replace(/^(term|def)-/, '')
      const secondId = id.replace(/^(term|def)-/, '')
      const isMatch = firstId === secondId

      const newMoves = state.moves + 1
      const updates: Partial<MatchState> = { selected: null, moves: newMoves }

      if (isMatch) {
        const updatedCards = state.cards.map(c =>
          c.id === state.selected || c.id === id ? { ...c, matched: true } : c
        )
        updates.cards = updatedCards

        const allMatched = updatedCards.every(c => c.matched)
        if (allMatched) {
          updates.isComplete = true
          updates.isRunning = false
        }
      }

      set(updates)
    }
  },
  tick: () => set((state) => ({ timer: state.timer + 1 })),
  start: () => set({ isRunning: true }),
  reset: () => set((state) => ({
    selected: null,
    timer: 0,
    moves: 0,
    isRunning: false,
    isComplete: false,
    cards: state.cards.map(c => ({ ...c, matched: false })),
  })),
  setBestScore: (score) => set({ bestScore: score }),
}))
