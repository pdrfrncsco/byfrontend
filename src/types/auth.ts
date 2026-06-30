export interface User {
  id: string
  email: string
  username: string | null
  first_name: string
  last_name: string
  full_name: string
  phone: string | null
  status: 'active' | 'suspended' | 'pending_verification' | 'deactivated'
  is_email_verified: boolean
  language: string
  timezone: string
  last_login: string | null
  created_at: string
  updated_at: string
}

export interface TenantMembership {
  id: string
  tenant: string
  tenant_name: string
  tenant_slug: string
  role: 'owner' | 'admin' | 'manager' | 'member'
  is_active: boolean
  joined_at: string
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  access: string
  refresh: string
  user: User
}

export interface RegisterRequest {
  email: string
  password: string
  password_confirm: string
  first_name?: string
  last_name?: string
  phone?: string
}

export interface RegisterOrganizationRequest extends RegisterRequest {
  organization_name: string
  organization_type: 'federation' | 'association' | 'league' | 'organizer' | 'academy'
  country?: string
  city?: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  memberships: TenantMembership[]
}
