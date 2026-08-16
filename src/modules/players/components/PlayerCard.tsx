import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Trophy, Target, User, MapPin, Shield } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import type { Player } from '../types'
import { POSITION_COLOR } from '../constants'
import { PlayerLinkStatusBadge } from './PlayerLinkStatusBadge'

interface PlayerCardProps {
  player: Player
}

export function PlayerCard({ player }: PlayerCardProps) {
  const { t } = useTranslation()
  const initials = `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'
  const positionColor = POSITION_COLOR[player.primary_position] ?? '#6b7280'

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
            {player.profile_photo_url || player.avatar ? (
              <img src={player.profile_photo_url || player.avatar || ''} alt={player.full_name} className="h-full w-full rounded-2xl object-cover" />
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
              {player.current_club ? (
                <Badge
                  variant="secondary"
                  className="max-w-[160px] truncate text-[11px]"
                  title={player.current_club.name}
                >
                  <Shield className="mr-1 inline h-3 w-3" aria-hidden="true" />
                  {player.current_club.name}
                </Badge>
              ) : (
                <PlayerLinkStatusBadge status="none" className="text-[11px]" />
              )}
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
            <div className="flex items-center gap-md pt-sm text-xs text-on-surface-variant" aria-label={t('players.card.stats')}>
              <div className="flex items-center gap-1" title={t('players.card.goals')}>
                <Trophy size={12} style={{ color: '#f59e0b' }} aria-hidden="true" />
                <span>{player.total_goals}</span>
              </div>
              <div className="flex items-center gap-1" title={t('players.card.assists')}>
                <Target size={12} style={{ color: '#10b981' }} aria-hidden="true" />
                <span>{player.total_assists}</span>
              </div>
              <div className="flex items-center gap-1" title={t('players.card.matches')}>
                <User size={12} style={{ color: '#3b82f6' }} aria-hidden="true" />
                <span>{player.total_matches}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Link */}
        <div className="mt-md border-t border-outline-variant/15 pt-sm">
          <Link
            to={`/players/${player.slug}`}
            className="flex items-center justify-between text-xs font-semibold text-primary hover:underline"
          >
            <span>{t('players.card.view_profile')}</span>
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
