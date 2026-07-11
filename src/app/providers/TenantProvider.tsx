import { useEffect, type ReactNode } from 'react'
import { useTenantStore, type TenantInfo } from '@/app/stores/tenant-store'

interface TenantContextType {
  tenant: TenantInfo | null
  loading: boolean
  error: string | null
  subdomain: string | null
}

export function useTenant(): TenantContextType {
  const tenant = useTenantStore(state => state.tenant)
  const loading = useTenantStore(state => state.loading)
  const error = useTenantStore(state => state.error)
  const subdomain = useTenantStore(state => state.subdomain)

  return { tenant, loading, error, subdomain }
}

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  useEffect(() => {
    void useTenantStore.getState().bootstrapTenant()
  }, [])

  return <>{children}</>
}
