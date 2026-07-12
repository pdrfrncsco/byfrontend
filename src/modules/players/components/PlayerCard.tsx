import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Trophy, Target, User, MapPin } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Player } from '../types'
import { POSITION_COLOR, STATUS_COLOR } from '../constants'

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { t } = useTranslation()
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'
  const positionColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'
  const statusColor = STATUS_COLOR[player.status] ?? '#6b7280'

  const accentStyle = {
    '--player-accent': positionColor,
    '--player-accent-soft': `${positionColor}22`,
  } as CSSProperties & Record<string, string>

  return (
    <Card
      variant="glass"
      padding="none"
      hoverable
      className="group overflow-hidden border-outline-variant/25 bg-gradient-to-br from-surface-container-high via-surface-container to-surface-container-low shadow-[0_12px_40px_-24px_rgba(0,0,0,0.6)] transition-transform duration-300 hover:-translate-y-1"
      style={accentStyle}
    >
      <div
        className="h-1.5 w-full"
        style={{ background: `linear-gradient(90deg, ${positionColor}, ${positionColor}88)` }}
      />
      <CardContent className="p-lg">
        <div className="flex items-start gap-md">
          {/* Avatar */}
          <div
            className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl border border-outline-variant/20 text-lg font-bold text-on-primary shadow-sm"
            style={{
              background: positionColor,
              boxShadow: `0 10px 30px ${positionColor}33`,
            }}
          >
            {player.avatar ? (
              <img src={player.avatar} alt={player.full_name} className="h-full w-full rounded-2xl object-cover" />
            ) : (
              initials
            )}
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1 space-y-sm">
            <h4 className="truncate font-semibold text-on-surface">{player.full_name}</h4>

            <div className="flex flex-wrap items-center gap-sm">
              <Badge
                variant="outline"
                style={{
                  borderColor: positionColor,
                  color: positionColor,
                  background: `${positionColor}15`,
                }}
              >
                {player.position_label}
              </Badge>
              <Badge
                variant="outline"
                style={{
                  borderColor: statusColor,
                  color: statusColor,
                  background: `${statusColor}15`,
                }}
              >
                {player.status_label}
              </Badge>
            </div>

            {/* Location & Age */}
            <div className="flex items-center gap-1 text-sm text-on-surface-variant">
              {player.nationality && (
                <>
                  <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  <span className="truncate">{player.nationality}</span>
                </>
              )}
              {player.age !== null && (
                <span className="ml-2 text-xs text-on-surface-variant/70">
                  {t('players.card.years', { count: player.age })}
                </span>
              )}
            </div>

            {/* Stats */}
            <div className="flex items-center gap-md pt-sm text-xs text-on-surface-variant">
              <div className="flex items-center gap-1">
                <Trophy size={12} style={{ color: '#f59e0b' }} />
                <span>{player.total_goals}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={12} style={{ color: '#10b981' }} />
                <span>{player.total_assists}</span>
              </div>
              <div className="flex items-center gap-1">
                <User size={12} />
                <span>{player.total_matches}</span>
              </div>
            </div>

            {/* Link */}
            <div className="flex items-center justify-end pt-sm">
              <Link
                to={`/players/${player.slug}`}
                className="inline-flex items-center gap-1 text-sm font-semibold text-primary transition-transform group-hover:translate-x-0.5"
              >
                {t('players.card.viewProfile')}
                <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
