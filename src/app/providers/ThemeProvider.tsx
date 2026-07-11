import { useEffect, type ReactNode } from 'react'
import { useThemeStore, type Theme } from '@/app/stores/theme-store'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export function useTheme(): ThemeContextType {
  const theme = useThemeStore(state => state.theme)
  const toggleTheme = useThemeStore(state => state.toggleTheme)
  const setTheme = useThemeStore(state => state.setTheme)

  return { theme, toggleTheme, setTheme }
}

interface ThemeProviderProps {
  children: ReactNode
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  useEffect(() => {
    useThemeStore.getState().initializeTheme()
  }, [])

  return <>{children}</>
}
