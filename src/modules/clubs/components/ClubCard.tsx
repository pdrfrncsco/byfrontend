import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { Club } from '@/modules/clubs/types'
import { ShieldCheck, MapPin } from 'lucide-react'
import { Link } from 'react-router-dom'

export function ClubCard({ club }: { club: Club }) {
  const initials = (club.short_name || club.name || '?').slice(0, 2).toUpperCase()

  const statusVariant =
    club.status === 'active' ? 'primary' : club.status === 'suspended' ? 'danger' : 'warning'

  return (
    <Card variant="glass" padding="none" hoverable className="overflow-hidden">
      <CardContent className="p-lg">
        <div className="flex items-start gap-md">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-surface-container-high text-sm font-bold text-primary ring-1 ring-outline-variant/30">
            {initials}
          </div>

          <div className="min-w-0 flex-1 space-y-sm">
            <div className="flex flex-wrap items-center gap-sm">
              <h4 className="truncate font-semibold text-on-surface">{club.name}</h4>
              {club.is_verified && <ShieldCheck className="h-4 w-4 text-primary" aria-hidden="true" />}
              <Badge variant={statusVariant} className="capitalize">
                {club.status_label || club.status || 'active'}
              </Badge>
            </div>

            <div className="flex items-center gap-1 text-sm text-on-surface-variant">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              <span className={cn('truncate')}>
                {[club.city, club.country].filter(Boolean).join(' • ') || 'Localização indisponível'}
              </span>
            </div>

            <div className="flex items-center justify-between pt-sm">
              <p className="text-xs text-on-surface-variant">
                {club.tenant_name || club.tenant_slug || 'Organização não indicada'}
              </p>
              <Link to={`/clubs/${club.slug || club.id}`} className="text-sm font-semibold text-primary">
                Ver perfil
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
