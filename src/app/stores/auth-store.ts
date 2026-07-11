import { create } from 'zustand'
import { authApi } from '@/modules/auth/services/auth.api'
import { clearStoredAuthSession, getStoredAuthToken, getStoredRefreshToken, getStoredUser, setStoredAuthSession } from '@/lib/storage'
import type { TenantMembership, User } from '@/types'
import type { UserProfile } from '@/app/providers/AuthProvider'

function mapToUserProfile(user: User, memberships: TenantMembership[] = []): UserProfile {
  const roles: string[] = []

  if (user.status === 'active') {
    roles.push('active')
  }

  memberships.forEach(m => {
    if (m.is_active) {
      roles.push(`${m.role}_${m.tenant_slug}`)
      roles.push(m.role)
    }
  })

  const activeMembership = memberships.find(m => m.is_active)

  return {
    id: user.id,
    username: user.username || user.full_name,
    email: user.email,
    roles: roles.length > 0 ? roles : ['fan'],
    role: activeMembership?.role || 'fan',
    tenant_id: activeMembership?.tenant || null,
  }
}

interface AuthStoreState {
  user: UserProfile | null
  token: string | null
  loading: boolean
  login: (accessToken: string, refreshToken: string, user: User) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  bootstrap: () => Promise<void>
  setLoading: (loading: boolean) => void
}

export const useAuthStore = create<AuthStoreState>(set => ({
  user: null,
  token: null,
  loading: true,
  login: async (accessToken, refreshToken, user) => {
    setStoredAuthSession(accessToken, refreshToken, user)
    set({ token: accessToken })

    try {
      const memberships = await authApi.getMemberships()
      set({ user: mapToUserProfile(user, memberships), loading: false })
    } catch {
      set({ user: mapToUserProfile(user), loading: false })
    }
  },
  logout: () => {
    const refresh = getStoredRefreshToken()
    if (refresh) {
      authApi.logout(refresh).catch(err => console.warn('Logout request failed:', err))
    }

    clearStoredAuthSession()
    set({ token: null, user: null, loading: false })
  },
  refreshUser: async () => {
    try {
      const freshUser = await authApi.getMe()
      const memberships = await authApi.getMemberships()
      set({ user: mapToUserProfile(freshUser, memberships) })
      const refresh = getStoredRefreshToken()
      const token = getStoredAuthToken()
      if (token && refresh) {
        setStoredAuthSession(token, refresh, freshUser)
      }
    } catch (error) {
      console.error('Failed to refresh user:', error)
    }
  },
  bootstrap: async () => {
    const savedToken = getStoredAuthToken()
    const savedUser = getStoredUser()

    if (!savedToken || !savedUser) {
      set({ loading: false })
      return
    }

    set({ token: savedToken })

    try {
      const memberships = await authApi.getMemberships()
      set({ user: mapToUserProfile(savedUser, memberships) })
    } catch (error) {
      console.warn('Failed to bootstrap auth session:', error)
      set({ user: mapToUserProfile(savedUser) })
    } finally {
      set({ loading: false })
    }
  },
  setLoading: loading => set({ loading }),
}))

export { mapToUserProfile }
