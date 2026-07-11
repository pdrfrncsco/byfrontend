import type { User } from '@/types'

export const STORAGE_KEYS = {
  authToken: 'bolayetu_token',
  authRefreshToken: 'bolayetu_refresh',
  authUser: 'bolayetu_user',
  theme: 'theme',
} as const

function isBrowser(): boolean {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function safeGetItem(key: string): string | null {
  if (!isBrowser()) return null
  return window.localStorage.getItem(key)
}

function safeSetItem(key: string, value: string): void {
  if (!isBrowser()) return
  window.localStorage.setItem(key, value)
}

function safeRemoveItem(key: string): void {
  if (!isBrowser()) return
  window.localStorage.removeItem(key)
}

export function getStoredAuthToken(): string | null {
  return safeGetItem(STORAGE_KEYS.authToken)
}

export function getStoredRefreshToken(): string | null {
  return safeGetItem(STORAGE_KEYS.authRefreshToken)
}

export function getStoredUser(): User | null {
  const rawUser = safeGetItem(STORAGE_KEYS.authUser)
  if (!rawUser) return null

  try {
    return JSON.parse(rawUser) as User
  } catch {
    return null
  }
}

export function setStoredAuthSession(accessToken: string, refreshToken: string, user: User): void {
  safeSetItem(STORAGE_KEYS.authToken, accessToken)
  safeSetItem(STORAGE_KEYS.authRefreshToken, refreshToken)
  safeSetItem(STORAGE_KEYS.authUser, JSON.stringify(user))
}

export function setStoredAuthToken(accessToken: string): void {
  safeSetItem(STORAGE_KEYS.authToken, accessToken)
}

export function clearStoredAuthSession(): void {
  safeRemoveItem(STORAGE_KEYS.authToken)
  safeRemoveItem(STORAGE_KEYS.authRefreshToken)
  safeRemoveItem(STORAGE_KEYS.authUser)
}

export function setStoredTheme(theme: 'light' | 'dark'): void {
  safeSetItem(STORAGE_KEYS.theme, theme)
}

export function getStoredTheme(): 'light' | 'dark' | null {
  const theme = safeGetItem(STORAGE_KEYS.theme)
  if (theme === 'light' || theme === 'dark') return theme
  return null
}
