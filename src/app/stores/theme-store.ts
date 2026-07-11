import { create } from 'zustand'
import { getStoredTheme, setStoredTheme } from '@/lib/storage'

export type Theme = 'light' | 'dark'

function getPreferredTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const stored = getStoredTheme()
  if (stored) return stored

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

function applyThemeToDocument(theme: Theme) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', theme === 'dark')
}

interface ThemeStoreState {
  theme: Theme
  initializeTheme: () => void
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

export const useThemeStore = create<ThemeStoreState>(set => ({
  theme: 'light',
  initializeTheme: () => {
    const theme = getPreferredTheme()
    set({ theme })
    applyThemeToDocument(theme)
    setStoredTheme(theme)
  },
  toggleTheme: () => {
    set(state => {
      const theme: Theme = state.theme === 'light' ? 'dark' : 'light'
      setStoredTheme(theme)
      applyThemeToDocument(theme)
      return { theme }
    })
  },
  setTheme: (theme: Theme) => {
    setStoredTheme(theme)
    applyThemeToDocument(theme)
    set({ theme })
  },
}))

export { applyThemeToDocument, getPreferredTheme }
