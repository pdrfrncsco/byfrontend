import { useEffect, useState } from 'react'
import { Activity } from 'lucide-react'
import type { Match } from '../types'
import { MatchStatusBadge } from './MatchStatusBadge'
import { formatMatchClock, getMatchClockInfo } from '../utils/match-clock'

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

function LiveClockDisplay({ match, now }: { match: Match; now: number }) {
  const clockText = formatMatchClock(match, now)
  const isLive = match.status === 'live'
  const isHalftime = match.status === 'halftime'

  if (!isLive && !isHalftime && match.status !== 'finished') {
    return null
  }

  const tone = isHalftime ? 'bg-amber-500/10 text-amber-700 border-amber-500/30' : 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30'

  return (
    <div className={`mb-md inline-flex items-center gap-xs rounded-full border px-3 py-1.5 font-mono text-sm font-bold tabular-nums shadow-sm ${tone}`}>
      {isLive && <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-500" />}
      {isHalftime && <span className="h-2 w-2 rounded-full bg-amber-500" />}
      <span>{clockText}</span>
    </div>
  )
}

export function MatchScoreboard({ match, compact = false, className = '' }: MatchScoreboardProps) {
  const [now, setNow] = useState(Date.now())
  const homeName = match.homeTeamName || match.home_club_name
  const awayName = match.awayTeamName || match.away_club_name
  const homeScore = match.score?.home ?? match.home_score
  const awayScore = match.score?.away ?? match.away_score
  const hasScore = homeScore !== null && homeScore !== undefined && awayScore !== null && awayScore !== undefined
  const clockInfo = getMatchClockInfo(match, now)
  const currentMinute = clockInfo.minute
  const currentPeriod = clockInfo.period
  const clockText = formatMatchClock(match, now)

  useEffect(() => {
    if (match.status !== 'live' && match.status !== 'halftime') return
    const timer = window.setInterval(() => setNow(Date.now()), 1_000)
    return () => window.clearInterval(timer)
  }, [match.status])

  if (compact) {
    return <div className={`flex flex-shrink-0 items-center gap-xs ${className}`} aria-label={`Resultado ${homeName} ${homeScore ?? '-'} a ${awayScore ?? '-'} ${awayName}`}>
      {hasScore ? <><span className="min-w-[2ch] text-center font-mono text-lg font-bold tabular-nums text-on-surface">{homeScore}</span><span className="text-on-surface-variant">-</span><span className="min-w-[2ch] text-center font-mono text-lg font-bold tabular-nums text-on-surface">{awayScore}</span></> : <Activity className="h-4 w-4 text-primary" />}
    </div>
  }

  return <div className={`rounded-2xl border border-outline-variant/20 bg-surface-container p-lg shadow-[0_18px_40px_-30px_rgba(15,17,23,0.35)] sm:p-xl ${className}`}>
    <div className="mb-lg flex flex-col items-center justify-center gap-sm">
      <MatchStatusBadge status={match.status} currentMinute={currentMinute} period={currentPeriod} />
      {(match.status === 'live' || match.status === 'halftime' || match.status === 'finished') && (
        <div className="rounded-xl border border-outline-variant/20 bg-surface-container-high px-4 py-2 shadow-inner">
          <div className="font-mono text-2xl font-black tracking-tight text-on-surface tabular-nums sm:text-4xl">{clockText}</div>
        </div>
      )}
    </div>
    <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-md sm:gap-xl">
      <div className="flex min-w-0 flex-col items-center gap-sm text-center"><TeamBadge name={homeName} logo={match.homeTeamLogo || match.home_club_logo} /><span className="max-w-full truncate text-sm font-semibold text-on-surface sm:text-base">{homeName}</span></div>
      <div className="text-center"><div className="flex items-center gap-sm font-mono text-5xl font-black tabular-nums tracking-tight text-on-surface sm:text-7xl">{hasScore ? <><span>{homeScore}</span><span className="text-on-surface-variant/60">-</span><span>{awayScore}</span></> : <span className="text-2xl text-on-surface-variant">VS</span>}</div>{match.score?.homeFirstHalf !== undefined && <span className="text-xs text-on-surface-variant">Intervalo {match.score?.homeFirstHalf ?? '-'}-{match.score?.awayFirstHalf ?? '-'}</span>}</div>
      <div className="flex min-w-0 flex-col items-center gap-sm text-center"><TeamBadge name={awayName} logo={match.awayTeamLogo || match.away_club_logo} /><span className="max-w-full truncate text-sm font-semibold text-on-surface sm:text-base">{awayName}</span></div>
    </div>
  </div>
}
