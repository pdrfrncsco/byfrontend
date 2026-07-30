import { useState } from 'react'
import { Activity } from 'lucide-react'
import type { Match } from '../types'
import { MatchStatusBadge } from './MatchStatusBadge'

export interface MatchScoreboardProps {
  match: Match
  compact?: boolean
  className?: string
}

function TeamBadge({ name, logo }: { name: string; logo?: string | null }) {
  const [logoError, setLogoError] = useState(false)
  
  if (logo && !logoError) {
    return (
      <img 
        src={logo} 
        alt="" 
        className="h-12 w-12 rounded-full object-cover" 
        onError={() => setLogoError(true)}
      />
    )
  }
  return <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-container/20 text-lg font-bold text-primary">{name?.charAt(0) || '?'}</span>
}

export function MatchScoreboard({ match, compact = false, className = '' }: MatchScoreboardProps) {
  const homeName = match.homeTeamName || match.home_club_name
  const awayName = match.awayTeamName || match.away_club_name
  const homeScore = match.score?.home ?? match.home_score
  const awayScore = match.score?.away ?? match.away_score
  const hasScore = homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined
  const currentMinute = match.events?.length ? Math.max(...match.events.map(event => event.minute)) : null

  if (compact) {
    return <div className={`flex flex-shrink-0 items-center gap-xs ${className}`} aria-label={`Resultado ${homeName} ${homeScore ?? '-'} a ${awayScore ?? '-'} ${awayName}`}>
      {hasScore ? <><span className="min-w-[2ch] text-center font-mono text-lg font-bold tabular-nums text-on-surface">{homeScore}</span><span className="text-on-surface-variant">-</span><span className="min-w-[2ch] text-center font-mono text-lg font-bold tabular-nums text-on-surface">{awayScore}</span></> : <Activity className="h-4 w-4 text-primary" />}
    </div>
  }

  return <div className={`rounded-2xl border border-outline-variant/20 bg-surface-container p-lg sm:p-xl ${className}`}>
    <div className="mb-lg flex justify-center"><MatchStatusBadge status={match.status} currentMinute={currentMinute} /></div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-md sm:gap-xl">
      <div className="flex min-w-0 flex-col items-center gap-sm text-center"><TeamBadge name={homeName} logo={match.homeTeamLogo || match.home_club_logo} /><span className="max-w-full truncate text-sm font-semibold text-on-surface sm:text-base">{homeName}</span></div>
      <div className="text-center"><div className="flex items-center gap-sm font-mono text-4xl font-bold tabular-nums text-on-surface sm:text-6xl">{hasScore ? <><span>{homeScore}</span><span className="text-on-surface-variant">-</span><span>{awayScore}</span></> : <span className="text-2xl text-on-surface-variant">VS</span>}</div>{match.score?.homeFirstHalf !== undefined && <span className="text-xs text-on-surface-variant">Intervalo {match.score.homeFirstHalf}-{match.score.awayFirstHalf}</span>}</div>
      <div className="flex min-w-0 flex-col items-center gap-sm text-center"><TeamBadge name={awayName} logo={match.awayTeamLogo || match.away_club_logo} /><span className="max-w-full truncate text-sm font-semibold text-on-surface sm:text-base">{awayName}</span></div>
    </div>
  </div>
}
