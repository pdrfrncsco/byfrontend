import client from '@/lib/api-client'
import {
  ApiResponse,
  LoginRequest,
  LoginResponse,
  RegisterRequest,
  User,
  TenantMembership,
} from '@/types'

export interface TokenResponse {
  access: string
}

export interface ProfileUpdateData {
  first_name?: string
  last_name?: string
  phone?: string | null
  language?: string
  timezone?: string
}

export const authApi = {
  /**
   * Login do usuário
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    const response = await client.post<ApiResponse<LoginResponse>>('/auth/login/', credentials)
    return response.data.data
  },

  /**
   * Registar novo usuário
   */
  async register(data: RegisterRequest): Promise<LoginResponse> {
    const response = await client.post<ApiResponse<LoginResponse>>('/auth/register/', data)
    return response.data.data
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
    const response = await client.get<ApiResponse<User>>('/auth/me/')
    return response.data.data
  },

  /**
   * Atualizar perfil
   */
  async updateMe(data: ProfileUpdateData): Promise<User> {
    const response = await client.patch<ApiResponse<User>>('/auth/me/', data)
    return response.data.data
  },

  /**
   * Alterar password
   */
  async changePassword(data: {
    old_password: string
    new_password: string
    new_password_confirm: string
  }): Promise<{ message: string }> {
    const response = await client.post<ApiResponse<{ message: string }>>('/auth/me/change-password/', data)
    return response.data.data
  },

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<TokenResponse> {
    const response = await client.post<ApiResponse<TokenResponse>>('/auth/token/refresh/', {
      refresh: refreshToken,
    })
    return response.data.data
  },

  /**
   * Obter associações/memberships do usuário a Tenants
   */
  async getMemberships(): Promise<TenantMembership[]> {
    const response = await client.get<ApiResponse<TenantMembership[]>>('/auth/me/memberships/')
    return response.data.data
  },

  /**
   * Solicitar redefinição de palavra-passe (envia email)
   */
  async forgotPassword(email: string): Promise<void> {
    await client.post('/auth/forgot-password/', { email })
  },

  /**
   * Confirmar redefinição de palavra-passe com token do email
   */
  async resetPassword(data: {
    token: string
    new_password: string
    new_password_confirm: string
  }): Promise<void> {
    await client.post('/auth/reset-password/', data)
  },
}
