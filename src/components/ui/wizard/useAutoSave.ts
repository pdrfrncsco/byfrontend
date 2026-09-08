import { useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

export function useAutoSave<TData>(
  data: Partial<TData>,
  isDirty: boolean,
  onSave: (data: Partial<TData>) => Promise<void>,
  delay: number = 1000
) {
  const debouncedData = useDebounce(data, delay)
  const isInitialMount = useRef(true)

  useEffect(() => {
    // Skip saving on initial mount
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (isDirty) {
      // Create a local async function so we can await the save
      const saveToApi = async () => {
        try {
          await onSave(debouncedData);
        } catch (error) {
          console.error("Auto-save failed:", error);
        }
      }
      
      saveToApi();
    }
  }, [debouncedData, isDirty, onSave])
}
