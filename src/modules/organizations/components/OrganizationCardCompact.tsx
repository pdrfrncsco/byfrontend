import { Link } from 'react-router-dom'
import { CheckCircle2, MapPin, Users, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { PublicOrganization } from '../types'

export interface OrganizationCardCompactProps {
  organization: PublicOrganization
}

export function OrganizationCardCompact({ organization }: OrganizationCardCompactProps) {
  const firstLetter = organization.name?.charAt(0) || '?'
  const primaryColor = organization.primary_color || '#1B4D3E'
  const isVerified = organization.verified || organization.is_verified

  return (
    <Link
      to={`/organizations/${organization.slug}`}
      className="group flex items-center justify-between gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-all duration-200 hover:border-primary/40 hover:bg-surface-container-high hover:shadow-md"
    >
      <div className="flex items-center gap-md min-w-0">
        {organization.logo_url ? (
          <img
            src={organization.logo_url}
            alt={`${organization.name} logo`}
            className="h-11 w-11 shrink-0 rounded-xl border border-outline-variant/20 object-cover shadow-sm transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-base font-bold text-white shadow-sm transition-transform duration-200 group-hover:scale-105"
            style={{ backgroundColor: primaryColor }}
          >
            {firstLetter}
          </div>
        )}

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
              {organization.name}
            </h4>
            {isVerified && (
              <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-primary" aria-label="Verificada" />
            )}
          </div>

          <div className="flex items-center gap-xs text-xs text-on-surface-variant truncate">
            <span className="font-medium text-primary text-[11px]">
              {organization.type_label || organization.type}
            </span>

            {(organization.city || organization.location) && (
              <>
                <span>•</span>
                <span className="flex items-center gap-0.5 truncate">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {organization.location || organization.city}
                </span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-sm shrink-0">
        {organization.active_subscribers != null && (
          <div className="hidden sm:flex items-center gap-1 text-xs text-on-surface-variant">
            <Users className="h-3.5 w-3.5 text-outline" />
            <span>{organization.active_subscribers}</span>
          </div>
        )}
        <Badge variant="outline" className="text-[10px] hidden md:inline-flex">
          {organization.status_label || organization.status || 'Ativa'}
        </Badge>
        <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}
