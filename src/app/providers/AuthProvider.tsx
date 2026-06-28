import React, { createContext, useContext, useState, useEffect } from 'react'
import { User, TenantMembership } from '@/types'
import { authApi } from '@/modules/auth/services/auth.api'

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
  login: (accessToken: string, refreshToken: string, user: User) => Promise<void>
  logout: () => void
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: async () => {},
  logout: () => {},
  refreshUser: async () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Map Backend User + Memberships to UserProfile structure
  const mapToUserProfile = (user: User, memberships: TenantMembership[] = []): UserProfile => {
    const roles: string[] = []
    
    if (user.status === 'active') {
      roles.push('active')
    }

    // Map memberships roles
    memberships.forEach(m => {
      if (m.is_active) {
        roles.push(`${m.role}_${m.tenant_slug}`)
        roles.push(m.role)
      }
    })

    // Fallback for platform superusers
    // In Django User model, is_superuser is handled by is_superuser flag, but here we can check status/email.
    // If it's a superuser, let's map 'admin' role
    // Since we don't have is_superuser property in User type, we can infer it or rely on role check.
    // Wait, let's add is_superuser to backend UserSerializer? We already wrote it without is_superuser,
    // but the backend returns list of fields. We didn't put is_superuser, but we can put it in user.
    // Wait! Let's map roles based on memberships.
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

  const loadSession = async (savedToken: string, savedUserStr: string) => {
    try {
      setToken(savedToken)
      const parsedUser = JSON.parse(savedUserStr) as User
      
      // Attempt to load fresh memberships from backend
      try {
        const memberships = await authApi.getMemberships()
        setUser(mapToUserProfile(parsedUser, memberships))
      } catch {
        // Fallback if network fails
        setUser(mapToUserProfile(parsedUser))
      }
    } catch (e) {
      console.error('Failed to parse user session:', e)
      logout()
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const savedToken = localStorage.getItem('bolayetu_token')
    const savedUser = localStorage.getItem('bolayetu_user')

    if (savedToken && savedUser) {
      loadSession(savedToken, savedUser)
    } else {
      setLoading(false)
    }
  }, [])

  const login = async (
    accessToken: string,
    refreshToken: string,
    newUser: User
  ) => {
    // 1. Save tokens to localStorage first so interceptors can read them
    localStorage.setItem('bolayetu_token', accessToken)
    localStorage.setItem('bolayetu_refresh', refreshToken)
    localStorage.setItem('bolayetu_user', JSON.stringify(newUser))
    
    // 2. Set token state
    setToken(accessToken)

    // 3. Fetch memberships with the now active token
    try {
      const memberships = await authApi.getMemberships()
      setUser(mapToUserProfile(newUser, memberships))
    } catch (e) {
      console.warn('Failed to fetch memberships during login:', e)
      setUser(mapToUserProfile(newUser))
    }
  }


  const logout = () => {
    const refresh = localStorage.getItem('bolayetu_refresh')
    if (refresh) {
      authApi.logout(refresh).catch(err => console.warn('Logout request failed:', err))
    }
    setToken(null)
    setUser(null)
    localStorage.removeItem('bolayetu_token')
    localStorage.removeItem('bolayetu_refresh')
    localStorage.removeItem('bolayetu_user')
  }

  const refreshUser = async () => {
    try {
      const freshUser = await authApi.getMe()
      const memberships = await authApi.getMemberships()
      setUser(mapToUserProfile(freshUser, memberships))
      localStorage.setItem('bolayetu_user', JSON.stringify(freshUser))
    } catch (e) {
      console.error('Failed to refresh user:', e)
    }
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user && !!token, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}
