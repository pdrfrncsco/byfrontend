import React, { createContext, useContext, useState, useEffect } from 'react'

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
  login: (token: string, user: UserProfile) => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  loading: true,
  isAuthenticated: false,
  login: () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Load auth credentials from localStorage
    const savedToken = localStorage.getItem('bolayetu_token')
    const savedUser = localStorage.getItem('bolayetu_user')

    if (savedToken && savedUser) {
      try {
        setToken(savedToken)
        setUser(JSON.parse(savedUser))
      } catch (e) {
        console.error('Failed to parse user session:', e)
        localStorage.removeItem('bolayetu_token')
        localStorage.removeItem('bolayetu_user')
      }
    }
    setLoading(false)
  }, [])

  const login = (newToken: string, newUser: UserProfile) => {
    setToken(newToken)
    setUser(newUser)
    localStorage.setItem('bolayetu_token', newToken)
    localStorage.setItem('bolayetu_user', JSON.stringify(newUser))
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('bolayetu_token')
    localStorage.removeItem('bolayetu_user')
  }

  return (
    <AuthContext.Provider value={{ user, token, loading, isAuthenticated: !!user && !!token, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}
