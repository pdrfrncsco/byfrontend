import { useState, useEffect } from 'react'

/**
 * Debounces a value by the given delay (ms).
 *
 * Usage:
 *   const debouncedQuery = useDebounce(query, 350)
 */
export function useDebounce<T>(value: T, delay: number = 300): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
