import { useState, useEffect, useCallback } from 'react'

const DRAFT_PREFIX = 'jp-draft-'

export function useDraft<T>(key: string, initialValue: T): [T, (value: T) => void, () => void] {
  const storageKey = DRAFT_PREFIX + key

  const [value, setValue] = useState<T>(() => {
    if (typeof window === 'undefined') return initialValue
    try {
      const stored = localStorage.getItem(storageKey)
      if (stored) return JSON.parse(stored) as T
    } catch {}
    return initialValue
  })

  useEffect(() => {
    try {
      if (JSON.stringify(value) !== JSON.stringify(initialValue)) {
        localStorage.setItem(storageKey, JSON.stringify(value))
      }
    } catch {}
  }, [value, storageKey, initialValue])

  const clear = useCallback(() => {
    try {
      localStorage.removeItem(storageKey)
    } catch {}
  }, [storageKey])

  return [value, setValue, clear]
}
