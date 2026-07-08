import type { CSSProperties } from 'react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Club } from '@/modules/clubs/types'
import { ArrowUpRight, ShieldCheck, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ClubCard({ club }: { club: Club }) {
  const initials = (club.short_name || club.name || '?').slice(0, 2).toUpperCase()

  const statusVariant =
    club.status === 'active' ? 'primary' : club.status === 'suspended' ? 'danger' : 'warning'

  const accentStyle = club.primary_color
    ? ({
        '--club-accent': club.primary_color,
        '--club-accent-soft': `${club.primary_color}22`,
      } as CSSProperties & Record<string, string>)
    : undefined

  return (
    <Card
      variant="glass"
      padding="none"
      hoverable
      className="group overflow-hidden border-outline-variant/25 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low shadow-[0_12px_40px_-24px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-1"
      style={accentStyle}
    >
      <div
        className="h-1.5 w-full bg-gradient-to-r from-primary/85 via-primary/40 to-transparent"
        style={club.primary_color ? { background: `linear-gradient(90deg, ${club.primary_color}, ${club.secondary_color || club.primary_color})` } : undefined}
      />
      <CardContent className="p-lg">
        <div className="flex items-start gap-md">
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/20 text-sm font-bold text-on-primary shadow-sm"
            style={{
              background: club.primary_color || 'linear-gradient(135deg, hsl(var(--primary)), hsl(var(--primary-container)))',
              boxShadow: club.primary_color ? `0 10px 30px ${club.primary_color}33` : undefined,
            }}
          >
            {club.logo_url ? (
              <img src={club.logo_url} alt={`${club.name} logo`} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              initials
            )}
          </div>

          <div className="min-w-0 flex-1 space-y-sm">
            <div className="flex flex-wrap items-center gap-sm">
              <h4 className="truncate font-semibold text-on-surface">{club.name}</h4>
              {club.is_verified && <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />}
            </div>

            <div className="flex flex-wrap items-center gap-sm">
              <Badge variant={statusVariant}>{club.status_label || club.status || 'active'}</Badge>
              <Badge variant="outline">{club.tenant_name || club.tenant_slug || 'Sem organização'}</Badge>
            </div>

            <div className="flex items-center gap-1 text-sm text-on-surface-variant">
              <MapPin className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span className={cn('truncate')}>
                {[club.city, club.country].filter(Boolean).join(' • ') || 'Localização indisponível'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-sm">
              <p className="text-xs text-on-surface-variant">Perfil público do clube</p>
              <Link to={`/clubs/${club.slug || club.id}`} className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5">
                Ver perfil
                <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
