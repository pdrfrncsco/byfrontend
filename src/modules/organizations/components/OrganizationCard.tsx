import { Link } from 'react-router-dom'
import { CheckCircle2, MapPin, Users } from 'lucide-react'
import type { PublicOrganization } from '../types'
import { cn } from '@/lib/utils'

interface OrganizationCardProps {
  organization: PublicOrganization
  className?: string
}

export function OrganizationCard({ organization, className }: OrganizationCardProps) {
  const firstLetter = organization.name?.charAt(0) || '?'
  const primaryColor = organization.primary_color || '#1B4D3E'

  return (
    <Link
      to={`/organizations/${organization.slug}`}
      className={cn(
        "glass-card block group hover:border-primary transition-all duration-300 transform hover:-translate-y-1.5 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-background",
        className
      )}
    >
      <div className="flex items-start gap-md mb-md">
        {organization.logo_url ? (
          <img
            src={organization.logo_url}
            alt={`${organization.name} logo`}
            className="w-14 h-14 rounded-lg object-cover border border-outline-variant/30 group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          <div
            className="w-14 h-14 rounded-lg flex items-center justify-center text-white font-display-lg text-xl shadow-inner group-hover:scale-105 transition-transform duration-300"
            style={{ backgroundColor: primaryColor }}
          >
            {firstLetter}
          </div>
        )}
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-xs flex-wrap">
            <h3 className="font-title-md text-base truncate text-on-surface group-hover:text-primary transition-colors">
              {organization.name}
            </h3>
            {organization.verified && (
              <CheckCircle2 className="w-4 h-4 text-primary shrink-0" aria-label="Verificada" />
            )}
          </div>
          <p className="text-label-sm text-outline uppercase tracking-wider mt-0.5">
            {organization.type_label || organization.type}
          </p>
        </div>
      </div>

      <div className="space-y-sm pt-sm border-t border-outline-variant/30">
        <div className="flex items-center gap-xs text-body-md text-on-surface-variant text-xs">
          <MapPin className="w-3.5 h-3.5 text-outline" />
          <span className="truncate">{organization.location || `${organization.city || ''}, ${organization.country}`}</span>
        </div>

        <div className="flex justify-between items-center text-xs">
          <div className="flex items-center gap-xs text-on-surface-variant">
            <Users className="w-3.5 h-3.5 text-outline" />
            <span>
              <strong className="text-primary font-bold">{organization.active_subscribers || 0}</strong>{' '}
              subscritores
            </span>
          </div>
          {organization.last_activity && (
            <span className="text-[10px] text-outline italic">
              Ativo {organization.last_activity}
            </span>
          )}
        </div>
      </div>
    </Link>
  )
}
