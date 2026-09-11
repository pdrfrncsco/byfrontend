import { Link } from 'react-router-dom'
import { MapPin, ShieldCheck, ChevronRight } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { ClubLogo } from './ClubLogo'
import type { Club } from '@/modules/clubs/types'

export interface ClubCardCompactProps {
  club: Club
}

export function ClubCardCompact({ club }: ClubCardCompactProps) {
  const statusVariant =
    club.status === 'active' ? 'primary' : club.status === 'suspended' ? 'danger' : 'warning'

  return (
    <Link
      to={`/clubs/${club.slug}`}
      className="group flex items-center justify-between gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-all duration-200 hover:border-primary/40 hover:bg-surface-container-high hover:shadow-md"
    >
      <div className="flex items-center gap-md min-w-0">
        <ClubLogo
          name={club.name}
          logoUrl={club.logo_url}
          shortName={club.short_name}
          primaryColor={club.primary_color}
          size="md"
          shape="squircle"
          className="shrink-0 border border-outline-variant/20 shadow-sm"
        />

        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
              {club.name}
            </h4>
            {club.is_verified && (
              <ShieldCheck className="h-3.5 w-3.5 shrink-0 text-primary" aria-hidden="true" />
            )}
          </div>

          <div className="flex items-center gap-xs text-xs text-on-surface-variant truncate">
            {club.city && (
              <span className="flex items-center gap-0.5 truncate">
                <MapPin className="h-3 w-3 shrink-0" />
                {club.city}
              </span>
            )}
            {club.city && club.tenant_name && <span>•</span>}
            {club.tenant_name && (
              <span className="truncate">{club.tenant_name}</span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-sm shrink-0">
        <Badge variant={statusVariant} className="text-[11px] hidden sm:inline-flex">
          {club.status_label || club.status || 'Ativo'}
        </Badge>
        <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}
