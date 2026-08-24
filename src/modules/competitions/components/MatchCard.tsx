import { Link } from 'react-router-dom'
import { ArrowUpRight, Calendar, MapPin } from 'lucide-react'
import type { Match } from '../types'
import { getMatchClockInfo } from '../utils/match-clock'
import { MatchCountdown } from './MatchCountdown'
import { MatchScoreboard } from './MatchScoreboard'
import { MatchStatusBadge } from './MatchStatusBadge'

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
  const homeName = match.homeTeamName || match.home_club_name
  const awayName = match.awayTeamName || match.away_club_name
  const homeLogo = match.homeTeamLogo || match.home_club_logo
  const awayLogo = match.awayTeamLogo || match.away_club_logo
  const scheduledAt = match.scheduledAt || match.match_date
  const roundNumber = match.roundNumber ?? match.round_number
  const clockInfo = getMatchClockInfo(match)
  const currentMinute = clockInfo.minute
  const currentPeriod = clockInfo.period

  const matchDate = new Date(scheduledAt)
  const dateStr = matchDate.toLocaleDateString('pt-PT', {
    weekday: compact ? undefined : 'short',
    day: '2-digit',
    month: 'short',
  })
  const timeStr = matchDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })

  const isLive = match.status === 'live' || match.status === 'halftime'

  const card = (
    <div
      className={`group relative overflow-hidden rounded-xl border border-outline-variant/20 bg-surface-container transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-[0_12px_24px_-18px_rgba(15,17,23,0.45)] ${compact ? 'p-md' : 'p-lg'}`}
    >
      <span className={`absolute inset-x-0 top-0 h-1 ${isLive ? 'bg-amber-500' : 'bg-primary/20'}`} aria-hidden="true" />
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
            J{roundNumber}
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
        <div className="flex items-center gap-sm">
          {(match.status === 'scheduled' || match.status === 'pre_match') && (
            <MatchCountdown scheduledAt={scheduledAt} />
          )}
          <MatchStatusBadge status={match.status} currentMinute={currentMinute} period={currentPeriod} />
        </div>
      </div>

      {/* Teams + Score */}
      <div className="flex items-center gap-md">
        {/* Home Team */}
        <div className="flex flex-1 items-center gap-sm overflow-hidden">
          {homeLogo ? (
            <img 
              src={homeLogo} 
              alt={homeName} 
              className="h-8 w-8 flex-shrink-0 rounded-full object-cover" 
              onError={(e) => { 
                e.currentTarget.onerror = null
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary ${homeLogo ? 'hidden' : ''}`}>
            {homeName?.charAt(0) || '?'}
          </div>
          <span className={`truncate font-semibold text-on-surface ${compact ? 'text-sm' : 'text-base'}`}>
            {homeName}
          </span>
        </div>

        {/* Score */}
        <MatchScoreboard match={match} compact />

        {/* Away Team */}
        <div className="flex flex-1 items-center justify-end gap-sm overflow-hidden">
          <span className={`truncate text-right font-semibold text-on-surface ${compact ? 'text-sm' : 'text-base'}`}>
            {awayName}
          </span>
          {awayLogo ? (
            <img 
              src={awayLogo} 
              alt={awayName} 
              className="h-8 w-8 flex-shrink-0 rounded-full object-cover"
              onError={(e) => { 
                e.currentTarget.onerror = null
                e.currentTarget.src = '' 
                e.currentTarget.style.display = 'none'
                e.currentTarget.nextElementSibling?.classList.remove('hidden')
              }}
            />
          ) : null}
          <div className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-primary-container/20 text-xs font-bold text-primary ${awayLogo ? 'hidden' : ''}`}>
            {awayName?.charAt(0) || '?'}
          </div>
        </div>
      </div>

      {/* Link overlay for hover arrow */}
      {showLink && (
        <div className="mt-md flex items-center justify-end gap-xs text-xs font-semibold text-primary opacity-70 transition-opacity group-hover:opacity-100">
          <span>
            Ver detalhe
          </span>
          <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
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
