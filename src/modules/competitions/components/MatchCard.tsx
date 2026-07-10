import { Link } from 'react-router-dom'
import { Calendar, Clock, MapPin, Activity, CheckCircle2, XCircle, Pause, Zap } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { Match, MatchStatus } from '../types'

const STATUS_CONFIG: Record<
  MatchStatus,
  { label: string; icon: React.ComponentType<any>; variant: 'default' | 'success' | 'danger' | 'warning' | 'secondary' }
> = {
  scheduled: { label: 'Agendado', icon: Clock, variant: 'default' },
  live: { label: 'Em Jogo', icon: Activity, variant: 'warning' },
  finished: { label: 'Terminado', icon: CheckCircle2, variant: 'success' },
  postponed: { label: 'Adiado', icon: Pause, variant: 'secondary' },
  cancelled: { label: 'Cancelado', icon: XCircle, variant: 'danger' },
}

interface MatchCardProps {
  match: Match
  competitionId: string
  /** Show link to MatchCenter page */
  showLink?: boolean
  /** Compact mode for list display */
  compact?: boolean
}

/**
 * MatchCard — displays a single match fixture with score, teams, and status.
 *
 * @example
 * <MatchCard match={m} competitionId={comp.id} showLink />
 */
export function MatchCard({ match, competitionId, showLink = false, compact = false }: MatchCardProps) {
  const statusCfg = STATUS_CONFIG[match.status] ?? STATUS_CONFIG.scheduled
  const StatusIcon = statusCfg.icon

  const matchDate = new Date(match.match_date)
  const dateStr = matchDate.toLocaleDateString('pt-PT', {
    weekday: compact ? undefined : 'short',
    day: '2-digit',
    month: 'short',
  })
  const timeStr = matchDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

  const isFinished = match.status === 'finished'
  const isLive = match.status === 'live'
  const hasScore = match.home_score !== null && match.away_score !== null

  const card = (
    <div
      className={`group relative overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container transition-all hover:border-primary/30 hover:shadow-sm ${compact ? 'p-md' : 'p-lg'}`}
    >
      {/* Live pulse indicator */}
      {isLive && (
        <span className="absolute right-3 top-3 flex h-2.5 w-2.5">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-amber-500" />
        </span>
      )}

      {/* Top row: round + date + status */}
      <div className="mb-md flex items-center justify-between gap-sm">
        <div className="flex items-center gap-sm text-xs text-on-surface-variant">
          <span className="rounded bg-surface-container-high px-2 py-0.5 font-semibold text-primary">
            R{match.round_number}
          </span>
          <Calendar className="h-3 w-3" />
          <span>{dateStr}</span>
          <span>{timeStr}</span>
          {match.venue && !compact && (
            <>
              <MapPin className="h-3 w-3" />
              <span className="max-w-[120px] truncate">{match.venue}</span>
            </>
          )}
        </div>
        <Badge variant={statusCfg.variant} className="flex items-center gap-1 text-xs">
          <StatusIcon className="h-3 w-3" />
          {statusCfg.label}
        </Badge>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center gap-md">
        {/* Home Team */}
        <div className="flex flex-1 items-center gap-sm overflow-hidden">
          {match.home_club_logo ? (
            <img src={match.home_club_logo} alt={match.home_club_name} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
              {match.home_club_name.charAt(0)}
            </div>
          )}
          <span className={`truncate font-semibold text-on-surface ${compact ? 'text-sm' : 'text-base'}`}>
            {match.home_club_name}
          </span>
        </div>

        {/* Score */}
        <div className="flex flex-shrink-0 items-center gap-sm">
          {hasScore ? (
            <div className="flex items-center gap-xs">
              <span
                className={`min-w-[2ch] text-center font-bold tabular-nums ${isFinished ? 'text-lg text-on-surface' : 'text-lg text-amber-500'}`}
              >
                {match.home_score}
              </span>
              <span className="text-on-surface-variant">—</span>
              <span
                className={`min-w-[2ch] text-center font-bold tabular-nums ${isFinished ? 'text-lg text-on-surface' : 'text-lg text-amber-500'}`}
              >
                {match.away_score}
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-xs text-on-surface-variant">
              {isLive ? (
                <Zap className="h-4 w-4 text-amber-500" />
              ) : (
                <span className="text-sm font-semibold">VS</span>
              )}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex flex-1 items-center justify-end gap-sm overflow-hidden">
          <span className={`truncate text-right font-semibold text-on-surface ${compact ? 'text-sm' : 'text-base'}`}>
            {match.away_club_name}
          </span>
          {match.away_club_logo ? (
            <img src={match.away_club_logo} alt={match.away_club_name} className="h-8 w-8 flex-shrink-0 rounded-full object-cover" />
          ) : (
            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary">
              {match.away_club_name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      {/* Link overlay for hover arrow */}
      {showLink && (
        <div className="mt-sm flex justify-end">
          <span className="text-xs text-primary opacity-0 transition-opacity group-hover:opacity-100">
            Ver detalhe →
          </span>
        </div>
      )}
    </div>
  )

  if (showLink) {
    return (
      <Link to={`/competitions/${competitionId}/matches/${match.id}`} className="block">
        {card}
      </Link>
    )
  }

  return card
}
