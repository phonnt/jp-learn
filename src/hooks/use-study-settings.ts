'use client'

import { create } from 'zustand'

export type Direction = 'term-to-def' | 'def-to-term'
export type QuestionType = 'written' | 'multiple-choice' | 'true-false'

export interface DisplayConfig {
  showKanji: boolean
  showReading: boolean
  showDefinition: boolean
}

export interface FlashcardDisplay {
  front: DisplayConfig
  back: DisplayConfig
}

export interface FlashcardSettings {
  direction: Direction
  autoAudio: boolean
  display: FlashcardDisplay
}

export interface LearnSettings {
  questionTypes: QuestionType[]
  direction: Direction
  questionCount: number
  display: DisplayConfig
}

export interface QuizSettings {
  types: QuestionType[]
  direction: Direction
  questionCount: number
  timer: boolean
  display: DisplayConfig
}

export interface TestSettings {
  mcCount: number
  writtenCount: number
  tfCount: number
  direction: Direction
  timer: boolean
  display: DisplayConfig
}

export interface SpellSettings {
  rate: number
  repeatCount: number
  showHint: boolean
  display: DisplayConfig
}

export interface MatchSettings {
  timeLimit: number
  display: DisplayConfig
}

export interface HardWordsSettings {
  minWrongCount: number
  questionCount: number
  display: DisplayConfig
}

export type StudyMode = 'flashcard' | 'learn' | 'quiz' | 'test' | 'spell' | 'match' | 'hard-words'

interface StudySettingsState {
  flashcard: FlashcardSettings
  learn: LearnSettings
  quiz: QuizSettings
  test: TestSettings
  spell: SpellSettings
  match: MatchSettings
  hardWords: HardWordsSettings
  update: (mode: StudyMode, settings: Record<string, unknown>) => void
}

function defaultDisplay(): DisplayConfig {
  return { showKanji: true, showReading: true, showDefinition: true }
}

export const useStudySettings = create<StudySettingsState>((set) => ({
  flashcard: {
    direction: 'term-to-def',
    autoAudio: false,
    display: {
      front: defaultDisplay(),
      back: defaultDisplay(),
    },
  },
  learn: {
    questionTypes: ['written'],
    direction: 'term-to-def',
    questionCount: 0,
    display: defaultDisplay(),
  },
  quiz: {
    types: ['multiple-choice'],
    direction: 'term-to-def',
    questionCount: 0,
    timer: false,
    display: defaultDisplay(),
  },
  test: {
    mcCount: 5,
    writtenCount: 5,
    tfCount: 5,
    direction: 'term-to-def',
    timer: false,
    display: defaultDisplay(),
  },
  spell: {
    rate: 0.8,
    repeatCount: 2,
    showHint: true,
    display: defaultDisplay(),
  },
  match: {
    timeLimit: 0,
    display: defaultDisplay(),
  },
  hardWords: {
    minWrongCount: 2,
    questionCount: 0,
    display: defaultDisplay(),
  },
  update: (mode, patch) => set((state) => ({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    [mode]: { ...(state as any)[mode], ...patch },
  })),
}))
