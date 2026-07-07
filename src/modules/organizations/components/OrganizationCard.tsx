import { Link } from 'react-router-dom'
import { CheckCircle2, MapPin, Users } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import { cn } from '@/lib/utils'
import type { PublicOrganization } from '../types'

interface OrganizationCardProps {
  organization: PublicOrganization
  className?: string
}

export function OrganizationCard({ organization, className }: OrganizationCardProps) {
  const firstLetter = organization.name?.charAt(0) || '?'
  const primaryColor = organization.primary_color || '#1B4D3E'

  return (
    <Card
      asChild
      padding="md"
      hoverable
      className={cn(
        'block transform transition-all duration-300 hover:-translate-y-1.5 focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background',
        className,
      )}
    >
      <Link to={`/organizations/${organization.slug}`} className="group block no-underline">
        <div className="mb-md flex items-start gap-md">
          {organization.logo_url ? (
            <img
              src={organization.logo_url}
              alt={`${organization.name} logo`}
              className="h-14 w-14 rounded-lg border border-outline-variant/30 object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
            />
          ) : (
            <div
              className="flex h-14 w-14 items-center justify-center rounded-lg font-display-lg text-xl text-white shadow-inner transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundColor: primaryColor }}
            >
              {firstLetter}
            </div>
          )}

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-xs">
              <h3 className="truncate font-title-md text-base text-on-surface transition-colors group-hover:text-primary">
                {organization.name}
              </h3>
              {organization.verified && (
                <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-label="Verificada" />
              )}
            </div>
            <Badge variant="outline" className="mt-0.5 uppercase tracking-wider">
              {organization.type_label || organization.type}
            </Badge>
          </div>
        </div>

        <div className="space-y-sm border-t border-outline-variant/30 pt-sm">
          <div className="flex items-center gap-xs text-xs text-on-surface-variant">
            <MapPin className="h-3.5 w-3.5 text-outline" aria-hidden="true" />
            <span className="truncate">
              {organization.location || `${organization.city || ''}, ${organization.country}`}
            </span>
          </div>

          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-xs text-on-surface-variant">
              <Users className="h-3.5 w-3.5 text-outline" aria-hidden="true" />
              <span>
                <strong className="font-bold text-primary">{organization.active_subscribers || 0}</strong>{' '}
                subscritores
              </span>
            </div>
            {organization.last_activity && (
              <span className="text-[10px] italic text-outline">Ativo {organization.last_activity}</span>
            )}
          </div>
        </div>
      </Link>
    </Card>
  )
}
