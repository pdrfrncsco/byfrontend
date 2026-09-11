import { useState, useEffect } from 'react'
import { Calendar, MapPin, Trophy } from 'lucide-react'
import type { Match, MatchEvent } from '../types'
import { MatchStatusBadge } from './MatchStatusBadge'
import { getMatchClockInfo } from '../utils/match-clock'

export interface MatchHeroHeaderProps {
  match: Match
  competition?: { name: string; slug?: string; logo?: string }
  events?: MatchEvent[]
  className?: string
}

const TeamBadge = ({ src, name, className = '' }: { src?: string; name: string; className?: string }) => {
  const [error, setError] = useState(false)
  const initial = name ? name.charAt(0).toUpperCase() : '?'

  return (
    <div className={`flex flex-col items-center gap-sm ${className}`}>
      <div className="h-16 w-16 sm:h-20 sm:w-20 overflow-hidden rounded-full border border-outline-variant/20 bg-surface-container-high flex items-center justify-center shadow-sm">
        {src && !error ? (
          <img
            src={src}
            alt={name}
            className="h-full w-full object-cover"
            onError={() => setError(true)}
          />
        ) : (
          <span className="text-xl sm:text-2xl font-bold text-primary">{initial}</span>
        )}
      </div>
      <span className="text-center font-semibold text-on-surface truncate max-w-[120px] sm:max-w-[180px] text-sm sm:text-base">{name}</span>
    </div>
  )
}

const GoalScorersSummary = ({
  events,
  homeTeamId,
}: {
  events?: MatchEvent[]
  homeTeamId?: string
}) => {
  if (!events || events.length === 0) return null

  const isGoal = (type: string) => ['goal', 'own_goal', 'penalty_goal', 'penalty_scored'].includes(type)
  const goals = events.filter(e => isGoal(e.type || (e as any).event_type))
  if (goals.length === 0) return null

  const homeGoals = goals.filter(e => {
    const tId = e.teamId || (e as any).team_id || e.club
    return String(tId) === String(homeTeamId)
  })
  const awayGoals = goals.filter(e => {
    const tId = e.teamId || (e as any).team_id || e.club
    return String(tId) !== String(homeTeamId)
  })

  const formatGoal = (g: MatchEvent) => {
    const name = g.player_name || g.playerId || 'Golo'
    const type = String(g.type || (g as any).event_type || '')
    const suffix = type.includes('penalty') ? ' (p)' : type === 'own_goal' ? ' (ag)' : ''
    return `${name} ${g.minute}'${suffix}`
  }

  return (
    <div className="grid grid-cols-2 w-full gap-4 text-xs text-on-surface-variant mt-4 pt-4 border-t border-outline-variant/15 px-md">
      <div className="flex flex-col gap-1 items-start pr-2">
        {homeGoals.map(g => (
          <span key={g.id} className="truncate font-medium text-on-surface">
            {formatGoal(g)}
          </span>
        ))}
      </div>
      <div className="flex flex-col gap-1 items-end pl-2 text-right">
        {awayGoals.map(g => (
          <span key={g.id} className="truncate font-medium text-on-surface">
            {formatGoal(g)}
          </span>
        ))}
      </div>
    </div>
  )
}

export function MatchHeroHeader({ match, competition, events, className = '' }: MatchHeroHeaderProps) {
  const [now, setNow] = useState(() => Date.now())

  const status = match.status || 'scheduled'
  const isLive = status === 'live' || status === 'halftime'
  const isFinished = status === 'finished' || status === 'archived' || status === 'cancelled' || status === 'walkover'
  const isPreMatch = !isLive && !isFinished

  useEffect(() => {
    if (!isLive) return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [isLive])

  const clockInfo = isLive ? getMatchClockInfo(match, now) : null

  const homeName = match.homeTeamName || match.home_club_name || 'Casa'
  const awayName = match.awayTeamName || match.away_club_name || 'Fora'
  const homeLogo = match.homeTeamLogo || match.home_club_logo
  const awayLogo = match.awayTeamLogo || match.away_club_logo
  const homeTeamId = match.homeTeamId || match.home_club || (match as any).home_team_id

  const homeScore = match.score?.home ?? match.home_score
  const awayScore = match.score?.away ?? match.away_score
  const hasScore = homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined

  const matchDate = new Date(match.scheduledAt || match.match_date || Date.now())
  const dateFormatted = !isNaN(matchDate.getTime())
    ? matchDate.toLocaleDateString('pt-PT', { day: 'numeric', month: 'short', year: 'numeric' })
    : ''
  const timeFormatted = !isNaN(matchDate.getTime())
    ? matchDate.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    : ''

  const isToday = !isNaN(matchDate.getTime()) && matchDate.toDateString() === new Date().toDateString()
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)
  const isTomorrow = !isNaN(matchDate.getTime()) && matchDate.toDateString() === tomorrow.toDateString()
  const dateDisplay = isToday ? 'Hoje' : isTomorrow ? 'Amanhã' : dateFormatted

  const competitionName = competition?.name || (match as any).competition_name || (match as any).competition?.name

  return (
    <div className={`flex flex-col rounded-2xl border border-outline-variant/20 bg-surface-container shadow-[0_18px_40px_-30px_rgba(15,17,23,0.35)] p-lg sm:p-xl ${className}`}>
      {/* Top Header info (Status / Round) */}
      <div className="flex items-center justify-between text-xs text-on-surface-variant font-medium mb-4 pb-2 border-b border-outline-variant/10">
        <span className="truncate">
          {competitionName ? `${competitionName}` : ''}
          {match.roundNumber || match.round_number ? ` · Jornada ${match.roundNumber || match.round_number}` : ''}
        </span>
        <MatchStatusBadge
          status={status}
          currentMinute={clockInfo?.minute}
          period={clockInfo?.period}
        />
      </div>

      {/* Main Scoreboard Area */}
      <div className="flex justify-between items-center w-full my-2">
        {/* Home Team */}
        <div className="flex-1 flex justify-start">
          <TeamBadge src={homeLogo || undefined} name={homeName} />
        </div>

        {/* Center Display: Time / Live / Score */}
        <div className="flex flex-col items-center justify-center px-4 flex-shrink-0">
          {isPreMatch && (
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl sm:text-5xl font-black font-mono text-on-surface tracking-tight">
                {timeFormatted || 'VS'}
              </span>
              <span className="text-xs sm:text-sm text-on-surface-variant font-semibold uppercase mt-1">
                {dateDisplay}
              </span>
            </div>
          )}

          {isLive && (
            <div className="flex flex-col items-center">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 text-xs font-bold font-mono mb-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>{clockInfo?.fullLabel || `${match.current_minute || 0}'`}</span>
              </div>
              <div className="text-4xl sm:text-6xl font-black font-mono tracking-tight flex items-center gap-3 text-on-surface">
                <span>{homeScore ?? 0}</span>
                <span className="text-outline-variant/40">-</span>
                <span>{awayScore ?? 0}</span>
              </div>
              {match.score?.homeFirstHalf !== undefined && match.score?.awayFirstHalf !== undefined && (
                <span className="text-xs text-on-surface-variant mt-1.5">
                  Intervalo ({match.score.homeFirstHalf} - {match.score.awayFirstHalf})
                </span>
              )}
            </div>
          )}

          {isFinished && (
            <div className="flex flex-col items-center">
              <div className="text-4xl sm:text-6xl font-black font-mono tracking-tight flex items-center gap-3 text-on-surface">
                <span>{hasScore ? homeScore : 0}</span>
                <span className="text-outline-variant/40">-</span>
                <span>{hasScore ? awayScore : 0}</span>
              </div>
              {match.score?.homeFirstHalf !== undefined && match.score?.awayFirstHalf !== undefined && (
                <span className="text-xs text-on-surface-variant mt-1.5">
                  Intervalo ({match.score.homeFirstHalf} - {match.score.awayFirstHalf})
                </span>
              )}
              {match.score?.homePenalties !== undefined && match.score?.awayPenalties !== undefined && (
                <span className="text-xs font-semibold text-primary mt-1">
                  Penáltis ({match.score.homePenalties} - {match.score.awayPenalties})
                </span>
              )}
            </div>
          )}
        </div>

        {/* Away Team */}
        <div className="flex-1 flex justify-end">
          <TeamBadge src={awayLogo || undefined} name={awayName} />
        </div>
      </div>

      {/* Goal Scorers (SofaScore style under teams) */}
      {!isPreMatch && (
        <GoalScorersSummary events={events} homeTeamId={homeTeamId} />
      )}

      {/* Footer Meta Row: Date, Stadium, Referee */}
      <div className="mt-4 pt-3 border-t border-outline-variant/15 flex flex-wrap justify-center items-center gap-x-6 gap-y-2 text-xs text-on-surface-variant">
        {dateFormatted && (
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-primary" />
            <span>{dateFormatted}{timeFormatted ? ` · ${timeFormatted}` : ''}</span>
          </div>
        )}

        {match.venue && (
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-primary" />
            <span>{match.venue}</span>
          </div>
        )}

        {(match.refereeName || (match as any).referee_name) && (
          <div className="flex items-center gap-1.5">
            <span className="text-on-surface-variant/70">Árbitro:</span>
            <span className="font-medium text-on-surface">{match.refereeName || (match as any).referee_name}</span>
          </div>
        )}
      </div>
    </div>
  )
}
