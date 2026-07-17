import { create } from 'zustand'
import { authApi } from '@/modules/auth/services/auth.api'
import {
  clearStoredAuthSession,
  getStoredActiveMembershipId,
  getStoredAuthToken,
  getStoredRefreshToken,
  getStoredUser,
  setStoredActiveMembershipId,
  setStoredAuthSession,
} from '@/lib/storage'
import type { TenantMembership, User } from '@/types'
import type { UserProfile } from '@/app/providers/AuthProvider'

function resolveActiveMembership(
  memberships: TenantMembership[] = [],
  activeMembershipId: string | null = null,
): TenantMembership | null {
  return (
    memberships.find(m => m.id === activeMembershipId) ||
    memberships.find(m => m.is_active) ||
    memberships[0] ||
    null
  )
}

function mapToUserProfile(
  user: User,
  memberships: TenantMembership[] = [],
  activeMembershipId: string | null = null,
): UserProfile {
  const roles: string[] = []
  const profileType = user.profile_type

  if (user.status === 'active') {
    roles.push('active')
  }

  if (profileType) {
    roles.push(profileType)
  }

  memberships.forEach(m => {
    roles.push(`${m.role}_${m.tenant_slug}`)
    roles.push(m.role)
  })

  const activeMembership = resolveActiveMembership(memberships, activeMembershipId)

  return {
    id: user.id,
    username: user.username || user.full_name,
    email: user.email,
    roles: roles.length > 0 ? roles : ['fan'],
    role: activeMembership?.role || memberships.find(m => m.is_active)?.role || profileType || 'fan',
    profileType,
    tenant_id: activeMembership?.tenant || memberships.find(m => m.is_active)?.tenant || null,
  }
}

interface AuthStoreState {
  sourceUser: User | null
  user: UserProfile | null
  token: string | null
  memberships: TenantMembership[]
  activeMembershipId: string | null
  loading: boolean
  login: (accessToken: string, refreshToken: string, user: User) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
  bootstrap: () => Promise<void>
  setActiveMembership: (membershipId: string) => void
}

export const useAuthStore = create<AuthStoreState>(set => ({
  sourceUser: null,
  user: null,
  token: null,
  memberships: [],
  activeMembershipId: null,
  loading: true,
  login: async (accessToken, refreshToken, user) => {
    setStoredAuthSession(accessToken, refreshToken, user)
    set({ token: accessToken, sourceUser: user })

    try {
      const memberships = await authApi.getMemberships()
      const activeMembershipId =
        getStoredActiveMembershipId() ||
        memberships.find(m => m.is_active)?.id ||
        memberships[0]?.id ||
        null
      setStoredActiveMembershipId(activeMembershipId)
      set({
        sourceUser: user,
        memberships,
        activeMembershipId,
        user: mapToUserProfile(user, memberships, activeMembershipId),
        loading: false,
      })
    } catch {
      set({ sourceUser: user, memberships: [], activeMembershipId: null, user: mapToUserProfile(user), loading: false })
    }
  },
  logout: () => {
    const refresh = getStoredRefreshToken()
    if (refresh) {
      authApi.logout(refresh).catch(err => console.warn('Logout request failed:', err))
    }

    clearStoredAuthSession()
    set({ sourceUser: null, token: null, user: null, memberships: [], activeMembershipId: null, loading: false })
  },
  refreshUser: async () => {
    try {
      const freshUser = await authApi.getMe()
      const memberships = await authApi.getMemberships()
      const activeMembershipId = getStoredActiveMembershipId() || memberships.find(m => m.is_active)?.id || memberships[0]?.id || null
      setStoredActiveMembershipId(activeMembershipId)
      set({ sourceUser: freshUser, user: mapToUserProfile(freshUser, memberships, activeMembershipId), memberships, activeMembershipId })
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
      const activeMembershipId =
        getStoredActiveMembershipId() ||
        memberships.find(m => m.is_active)?.id ||
        memberships[0]?.id ||
        null
      setStoredActiveMembershipId(activeMembershipId)
      set({ sourceUser: savedUser, user: mapToUserProfile(savedUser, memberships, activeMembershipId), memberships, activeMembershipId })
    } catch (error) {
      console.warn('Failed to bootstrap auth session:', error)
      set({ sourceUser: savedUser, user: mapToUserProfile(savedUser) })
    } finally {
      set({ loading: false })
    }
  },
  setActiveMembership: (membershipId: string) => {
    set(state => {
      const activeMembership = state.memberships.find(m => m.id === membershipId)
      if (!activeMembership || !state.sourceUser) {
        return {}
      }

      setStoredActiveMembershipId(membershipId)
      return {
        activeMembershipId: membershipId,
        user: mapToUserProfile(state.sourceUser, state.memberships, membershipId),
      }
    })
  },
}))

export { mapToUserProfile }
