import { create } from 'zustand'
import { organizationApi } from '@/modules/organizations/services/organization.api'
import type { Organization } from '@/modules/organizations/types'

export interface TenantInfo {
  id: string
  name: string
  slug: string
  type: string
  logoUrl: string | null
  primary_color: string
  secondary_color: string
  country: string
  location: string
  description: string
  is_public: boolean
  verified: boolean
}

function mapOrganizationToTenantInfo(org: Organization): TenantInfo {
  return {
    id: org.id,
    name: org.name,
    slug: org.slug,
    type: org.type,
    logoUrl: org.logo_url || org.logo || null,
    primary_color: org.primary_color || '#94D3C1',
    secondary_color: org.secondary_color || '#E9C349',
    country: org.country,
    location: org.location || [org.city, org.country].filter(Boolean).join(', '),
    description: org.description || '',
    is_public: org.is_public ?? true,
    verified: org.verified ?? org.is_verified ?? false,
  }
}

function hexToRgb(hex: string) {
  const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
  const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)

  return result
    ? {
        r: Number.parseInt(result[1], 16),
        g: Number.parseInt(result[2], 16),
        b: Number.parseInt(result[3], 16),
      }
    : null
}

function applyTenantColors(tenant: TenantInfo | null) {
  if (typeof document === 'undefined') return

  const root = document.documentElement

  if (!tenant) {
    root.style.removeProperty('--color-primary')
    root.style.removeProperty('--color-primary-rgb')
    root.style.removeProperty('--color-secondary')
    root.style.removeProperty('--color-secondary-rgb')
    return
  }

  if (tenant.primary_color) {
    root.style.setProperty('--color-primary', tenant.primary_color)
    const rgb = hexToRgb(tenant.primary_color)
    if (rgb) root.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  }

  if (tenant.secondary_color) {
    root.style.setProperty('--color-secondary', tenant.secondary_color)
    const rgb = hexToRgb(tenant.secondary_color)
    if (rgb) root.style.setProperty('--color-secondary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
  }
}

interface TenantStoreState {
  tenant: TenantInfo | null
  loading: boolean
  error: string | null
  subdomain: string | null
  bootstrapTenant: () => Promise<void>
}

export const useTenantStore = create<TenantStoreState>(set => ({
  tenant: null,
  loading: true,
  error: null,
  subdomain: null,
  bootstrapTenant: async () => {
    try {
      const hostname = typeof window !== 'undefined' ? window.location.hostname : ''
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null

      let slug: string | null = null
      const queryTenant = searchParams?.get('tenant')
      if (queryTenant) {
        slug = queryTenant
      } else if (hostname) {
        const parts = hostname.split('.')
        if (parts.length >= 3) {
          const possibleSubdomain = parts[0]
          const reserved = ['www', 'app', 'api', 'admin', 'cdn', 'mail']
          if (!reserved.includes(possibleSubdomain)) {
            slug = possibleSubdomain
          }
        }
      }

      set({ subdomain: slug })

      if (!slug) {
        applyTenantColors(null)
        set({ tenant: null, loading: false, error: null })
        return
      }

      const org = await organizationApi.getPublicDetail(slug)
      const tenantInfo = mapOrganizationToTenantInfo(org)
      applyTenantColors(tenantInfo)
      set({ tenant: tenantInfo, loading: false, error: null })
    } catch (error) {
      console.error('Failed to resolve Tenant:', error)
      applyTenantColors(null)
      set({
        tenant: null,
        loading: false,
        error: 'Falha ao carregar as definições da organização.',
      })
    }
  },
}))

export { applyTenantColors, mapOrganizationToTenantInfo }
