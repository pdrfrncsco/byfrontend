export interface Tenant {
  id: string
  name: string
  subdomain: string
  domain: string
  region: string
  logo?: string
  colors?: {
    primary: string
    secondary: string
  }
  features: string[]
  isActive: boolean
}

export interface TenantContext {
  tenant: Tenant | null
  isLoading: boolean
}
