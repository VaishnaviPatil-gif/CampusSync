/**
 * useLocalStorage — generic hook for type-safe localStorage access.
 *
 * Mirrors what the original HTML pages did manually with:
 *   localStorage.setItem('student360CurrentUser', email)
 *   localStorage.getItem('student360CurrentUser')
 *
 * Usage:
 *   const [theme, setTheme] = useLocalStorage<string>('theme', 'dark')
 */
import { useState, useCallback } from 'react'

export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key)
      return item !== null ? (JSON.parse(item) as T) : initialValue
    } catch {
      return initialValue
    }
  })

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore =
          value instanceof Function ? value(storedValue) : value
        setStoredValue(valueToStore)
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      } catch (err) {
        console.warn(`[useLocalStorage] Could not write key "${key}":`, err)
      }
    },
    [key, storedValue]
  )

  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key)
      setStoredValue(initialValue)
    } catch (err) {
      console.warn(`[useLocalStorage] Could not remove key "${key}":`, err)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue]
}
