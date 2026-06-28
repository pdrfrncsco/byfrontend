import client from '@/lib/api-client'

export interface User {
  id: string
  email: string
  username: string
  first_name: string
  last_name: string
  full_name: string
  phone: string | null
  avatar: string | null
  tenant: string | null
  tenant_name: string | null
  profile_type: 'admin' | 'organization' | 'club' | 'player' | 'fan'
  language: string
  timezone: string
  created_at: string
  updated_at: string
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  username: string
  password: string
  password_confirm: string
  first_name: string
  last_name: string
  profile_type?: string
}

export interface AuthResponse {
  access: string
  refresh: string
  user: User
}

export interface TokenResponse {
  access: string
}

export const authApi = {
  /**
   * Login do usuário
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/login/', credentials)
    return response.data
  },

  /**
   * Registar novo usuário
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await client.post<AuthResponse>('/auth/register/', data)
    return response.data
  },

  /**
   * Logout - blacklist token
   */
  async logout(refreshToken: string): Promise<void> {
    await client.post('/auth/logout/', { refresh: refreshToken })
  },

  /**
   * Obter perfil do usuário atual
   */
  async getMe(): Promise<User> {
    const response = await client.get<User>('/auth/me/')
    return response.data
  },

  /**
   * Atualizar perfil
   */
  async updateMe(data: Partial<User>): Promise<User> {
    const response = await client.put<User>('/auth/me/', data)
    return response.data
  },

  /**
   * Alterar password
   */
  async changePassword(data: {
    old_password: string
    new_password: string
    new_password_confirm: string
  }): Promise<{ message: string }> {
    const response = await client.post<{ message: string }>('/auth/change-password/', data)
    return response.data
  },

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await client.post<TokenResponse>('/auth/refresh/', {
      refresh: refreshToken,
    })
    return response.data
  },
}
