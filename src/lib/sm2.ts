export interface SM2Result {
  easinessFactor: number
  interval: number
  repetitions: number
  nextReviewAt: Date
}

export function calculateSM2(
  quality: number,
  currentEF: number = 2.5,
  currentInterval: number = 0,
  currentRepetitions: number = 0
): SM2Result {
  const clampedQuality = Math.max(0, Math.min(5, quality))
  let newEF = currentEF
  let newInterval = currentInterval
  let newRepetitions = currentRepetitions

  if (clampedQuality < 3) {
    newRepetitions = 0
    newInterval = 1
  } else {
    if (newRepetitions === 0) {
      newInterval = 1
    } else if (newRepetitions === 1) {
      newInterval = 6
    } else {
      newInterval = Math.round(newInterval * newEF)
    }
    newRepetitions += 1
  }

  newEF = Math.max(
    1.3,
    newEF + (0.1 - (5 - clampedQuality) * (0.08 + (5 - clampedQuality) * 0.02))
  )

  const nextReviewAt = new Date()
  nextReviewAt.setDate(nextReviewAt.getDate() + newInterval)

  return {
    easinessFactor: newEF,
    interval: newInterval,
    repetitions: newRepetitions,
    nextReviewAt,
  }
}

export interface ReviewResult {
  termId: string
  correct: boolean
  timeSpentMs: number
  sm2Result: SM2Result
}
