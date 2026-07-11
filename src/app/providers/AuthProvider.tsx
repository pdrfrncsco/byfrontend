import { useEffect, type ReactNode } from 'react'
import { useAuthStore } from '@/app/stores/auth-store'

export interface UserProfile {
  id: string
  username: string
  email: string
  roles: string[]
  role?: string
  tenant_id: string | null
}

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  login: (accessToken: string, refreshToken: string, user: import('@/types').User) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

export function useAuth(): AuthContextType {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.token)
  const loading = useAuthStore(state => state.loading)
  const login = useAuthStore(state => state.login)
  const logout = useAuthStore(state => state.logout)
  const refreshUser = useAuthStore(state => state.refreshUser)

  return {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    login,
    logout,
    refreshUser,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useAuthStore.getState().bootstrap()
  }, [])

  return <>{children}</>
}
