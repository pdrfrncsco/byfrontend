import React, { createContext, useContext, useState, useEffect } from 'react'
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

interface TenantContextType {
  tenant: TenantInfo | null
  loading: boolean
  error: string | null
  subdomain: string | null
}

const TenantContext = createContext<TenantContextType>({
  tenant: null,
  loading: true,
  error: null,
  subdomain: null,
})

export const useTenant = () => useContext(TenantContext)

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tenant, setTenant] = useState<TenantInfo | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [subdomain, setSubdomain] = useState<string | null>(null)

  useEffect(() => {
    const resolveTenant = async () => {
      try {
        const hostname = window.location.hostname
        const searchParams = new URLSearchParams(window.location.search)

        let slug: string | null = null
        const queryTenant = searchParams.get('tenant')
        if (queryTenant) {
          slug = queryTenant
        } else {
          const parts = hostname.split('.')
          if (parts.length >= 3) {
            const possibleSubdomain = parts[0]
            const reserved = ['www', 'app', 'api', 'admin', 'cdn', 'mail']
            if (!reserved.includes(possibleSubdomain)) {
              slug = possibleSubdomain
            }
          }
        }

        setSubdomain(slug)

        if (!slug) {
          setTenant(null)
          setLoading(false)
          return
        }

        const org = await organizationApi.getPublicDetail(slug)
        const tenantInfo = mapOrganizationToTenantInfo(org)
        setTenant(tenantInfo)

        const root = document.documentElement
        if (tenantInfo.primary_color) {
          root.style.setProperty('--color-primary', tenantInfo.primary_color)
          const rgb = hexToRgb(tenantInfo.primary_color)
          if (rgb) root.style.setProperty('--color-primary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
        }
        if (tenantInfo.secondary_color) {
          root.style.setProperty('--color-secondary', tenantInfo.secondary_color)
          const rgb = hexToRgb(tenantInfo.secondary_color)
          if (rgb) root.style.setProperty('--color-secondary-rgb', `${rgb.r}, ${rgb.g}, ${rgb.b}`)
        }
      } catch (err) {
        console.error('Failed to resolve Tenant:', err)
        setError('Falha ao carregar as definições da organização.')
      } finally {
        setLoading(false)
      }
    }

    resolveTenant()
  }, [])

  const hexToRgb = (hex: string) => {
    const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
    const fullHex = hex.replace(shorthandRegex, (_, r, g, b) => r + r + g + g + b + b)
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(fullHex)
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null
  }

  return (
    <TenantContext.Provider value={{ tenant, loading, error, subdomain }}>
      {children}
    </TenantContext.Provider>
  )
}
