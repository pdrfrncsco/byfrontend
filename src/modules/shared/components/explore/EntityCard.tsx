import { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Trophy, Shield, User, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'

interface EntityCardProps {
  href: string
  title: string
  description: string
  type?: 'player' | 'club' | 'competition' | 'organization'
  eyebrow?: string
  meta?: string
  imageUrl?: string
  badgeText?: string
  icon?: string
}

export function EntityCard({
  href,
  title,
  description,
  type = 'club',
  eyebrow,
  meta,
  imageUrl,
  badgeText,
}: EntityCardProps) {
  const icons = {
    player: User,
    club: Shield,
    competition: Trophy,
    organization: MapPin,
  }

  const Icon = icons[type] || Shield

  return (
    <Link
      to={href}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/80 bg-card p-md md:p-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
    >
      <div>
        {/* Top Header */}
        <div className="flex items-start justify-between gap-sm mb-md">
          <div className="flex items-center gap-sm">
            {imageUrl ? (
              <img
                src={imageUrl}
                alt={title}
                className="h-12 w-12 rounded-xl object-cover border border-border shadow-sm"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Icon className="h-6 w-6" />
              </div>
            )}
            <div>
              {eyebrow && <span className="text-[11px] font-bold uppercase tracking-wider text-primary">{eyebrow}</span>}
              <h3 className="text-lg font-bold text-foreground group-hover:text-primary transition-colors line-clamp-1">
                {title}
              </h3>
            </div>
          </div>

          <div className="rounded-full p-xs text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all">
            <ArrowRight className="h-4 w-4" />
          </div>
        </div>

        {/* Description */}
        <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-2">
          {description}
        </p>
      </div>

      {/* Footer Meta */}
      {(meta || badgeText) && (
        <div className="mt-md pt-sm border-t border-border/60 flex items-center justify-between gap-xs text-xs font-medium text-muted-foreground">
          {meta && <span className="truncate">{meta}</span>}
          {badgeText && <Badge variant="secondary" className="text-[10px] uppercase font-bold">{badgeText}</Badge>}
        </div>
      )}
    </Link>
  )
}
