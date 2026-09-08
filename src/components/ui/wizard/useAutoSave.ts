import { useEffect, useRef } from 'react'
import { useDebounce } from '@/hooks/useDebounce'

export function useAutoSave<TData>(
  data: Partial<TData>,
  isDirty: boolean,
  onSave: (data: Partial<TData>) => Promise<void> | void,
  delay: number = 1000
) {
  const debouncedData = useDebounce(data, delay)
  const isInitialMount = useRef(true)
  const onSaveRef = useRef(onSave)

  useEffect(() => {
    onSaveRef.current = onSave
  }, [onSave])

  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false
      return
    }

    if (isDirty) {
      const saveToApi = async () => {
        try {
          await onSaveRef.current(debouncedData)
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
      }
      
      saveToApi()
    }
  }, [debouncedData, isDirty])
}
