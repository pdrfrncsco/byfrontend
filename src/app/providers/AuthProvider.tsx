import { useEffect, type ReactNode } from 'react'
import type { TenantMembership } from '@/types'
import { useAuthStore } from '@/app/stores/auth-store'

export interface UserProfile {
  id: string
  username: string
  email: string
  roles: string[]
  role?: string
  profileType?: string
  tenant_id: string | null
}

interface AuthContextType {
  user: UserProfile | null
  token: string | null
  loading: boolean
  isAuthenticated: boolean
  memberships: TenantMembership[]
  activeMembershipId: string | null
  login: (accessToken: string, refreshToken: string, user: import('@/types').User) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  setActiveMembership: (membershipId: string) => void
}

export function useAuth(): AuthContextType {
  const user = useAuthStore(state => state.user)
  const token = useAuthStore(state => state.token)
  const memberships = useAuthStore(state => state.memberships)
  const activeMembershipId = useAuthStore(state => state.activeMembershipId)
  const loading = useAuthStore(state => state.loading)
  const login = useAuthStore(state => state.login)
  const logout = useAuthStore(state => state.logout)
  const refreshUser = useAuthStore(state => state.refreshUser)
  const setActiveMembership = useAuthStore(state => state.setActiveMembership)

  return {
    user,
    token,
    loading,
    isAuthenticated: Boolean(user && token),
    memberships,
    activeMembershipId,
    login,
    logout,
    refreshUser,
    setActiveMembership,
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    void useAuthStore.getState().bootstrap()
  }, [])

  return <>{children}</>
}
