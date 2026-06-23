export interface User {
  id: string
  email: string
  name: string
  avatar?: string
  roles: string[]
  permissions: string[]
  isEmailVerified: boolean
  status: 'active' | 'inactive' | 'suspended' | 'deleted'
  createdAt: Date
  updatedAt: Date
}

export interface LoginRequest {
  email: string
  password: string
  rememberMe?: boolean
}

export interface LoginResponse {
  user: User
  token: string
  refreshToken: string
}

export interface RegisterRequest {
  email: string
  password: string
  name: string
  phone?: string
  acceptTerms: boolean
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
}
