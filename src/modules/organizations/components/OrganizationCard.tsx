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
      padding="none"
      hoverable
      className={cn(
        'group block overflow-hidden border border-outline-variant/80 bg-surface-container-low shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-container-high focus-within:ring-2 focus-within:ring-primary focus-within:ring-offset-2 focus-within:ring-offset-background',
        className,
      )}
      style={{
        boxShadow: `0 18px 40px -28px ${primaryColor}55`,
      }}
    >
      <Link to={`/organizations/${organization.slug}`} className="group block no-underline">
        <div
          className="h-1.5 w-full"
          style={{ background: `linear-gradient(90deg, ${primaryColor}, ${primaryColor}bb)` }}
        />

        <div className="p-lg">
          <div className="mb-md flex items-start gap-md">
            {organization.logo_url ? (
              <img
                src={organization.logo_url}
                alt={`${organization.name} logo`}
                className="h-14 w-14 rounded-2xl border border-outline-variant/30 object-cover transition-transform duration-300 group-hover:scale-105"
                loading="lazy"
              />
            ) : (
              <div
                className="flex h-14 w-14 items-center justify-center rounded-2xl font-display-lg text-xl text-on-primary shadow-sm transition-transform duration-300 group-hover:scale-105"
                style={{ backgroundColor: primaryColor }}
              >
                {firstLetter}
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-start justify-between gap-xs">
                <h3 className="truncate font-title-md text-base text-on-surface transition-colors group-hover:text-primary">
                  {organization.name}
                </h3>
                {organization.verified && (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" aria-label="Verificada" />
                )}
              </div>
              <Badge variant="outline" className="mt-1 uppercase tracking-wider">
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

            <div className="flex items-center justify-between gap-sm text-xs">
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
        </div>
      </Link>
    </Card>
  )
}
