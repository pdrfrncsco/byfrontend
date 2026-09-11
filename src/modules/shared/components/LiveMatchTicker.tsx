import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Activity, ChevronRight, Trophy, Flame } from 'lucide-react'
import type { Match } from '@/modules/competitions/types'

export interface LiveMatchTickerProps {
  matches?: Match[]
  isLoading?: boolean
  competitionName?: string
  competitionId?: string
  className?: string
}

function TeamLogo({ logo, name }: { logo?: string; name: string }) {
  const [imgError, setImgError] = useState(false)
  const initial = name?.charAt(0)?.toUpperCase() || '?'

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        className="h-5 w-5 rounded-full object-cover shrink-0 border border-outline-variant/20"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div className="h-5 w-5 rounded-full bg-surface-container-highest flex items-center justify-center text-[10px] font-bold text-on-surface shrink-0">
      {initial}
    </div>
  )
}

export function LiveMatchTicker({
  matches = [],
  isLoading = false,
  competitionName,
  competitionId,
  className = '',
}: LiveMatchTickerProps) {
  const liveCount = matches.filter(m => m.status === 'live' || m.status === 'halftime').length

  if (isLoading) {
    return (
      <div className={`w-full bg-surface-container-low/90 border-y border-outline-variant/20 py-2.5 px-4 ${className}`}>
        <div className="max-w-7xl mx-auto flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="h-5 w-24 bg-outline-variant/20 rounded animate-pulse shrink-0" />
          <div className="h-10 w-48 bg-outline-variant/15 rounded-xl animate-pulse shrink-0" />
          <div className="h-10 w-48 bg-outline-variant/15 rounded-xl animate-pulse shrink-0" />
          <div className="h-10 w-48 bg-outline-variant/15 rounded-xl animate-pulse shrink-0 hidden sm:block" />
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full bg-surface-container/70 border-y border-outline-variant/20 backdrop-blur-sm py-2 px-3 sm:px-6 select-none ${className}`}>
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left Label */}
        <div className="flex items-center gap-2 shrink-0">
          {liveCount > 0 ? (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-destructive/10 text-destructive text-[11px] font-extrabold uppercase tracking-wider">
              <span className="h-2 w-2 rounded-full bg-destructive animate-ping" />
              {liveCount} AO VIVO
            </span>
          ) : (
            <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
              <Trophy className="h-3.5 w-3.5" />
              {competitionName || 'JOGOS DA SEMANA'}
            </span>
          )}
        </div>

        {/* Matches Horizontal Strip */}
        <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-0.5 flex-1">
          {matches.length > 0 ? (
            matches.slice(0, 6).map(match => {
              const compId = match.competitionId || (match as any).competition_id || competitionId || 'competitions'
              const homeName = match.homeTeamName || (match as any).home_club_name || 'Casa'
              const awayName = match.awayTeamName || (match as any).away_club_name || 'Fora'
              const homeLogo = match.homeTeamLogo || (match as any).home_club_logo
              const awayLogo = match.awayTeamLogo || (match as any).away_club_logo
              const homeScore = match.score?.home ?? (match as any).home_score ?? 0
              const awayScore = match.score?.away ?? (match as any).away_score ?? 0
              const isLive = match.status === 'live' || match.status === 'halftime'
              const isFinished = match.status === 'finished' || match.status === 'archived'

              return (
                <Link
                  key={match.id}
                  to={`/competitions/${compId}/matches/${match.id}`}
                  className="group flex items-center gap-3 px-3 py-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-high/60 hover:bg-surface-container-high hover:border-primary/40 transition-all shrink-0 text-xs shadow-xs"
                >
                  {/* Home Team */}
                  <div className="flex items-center gap-1.5 max-w-[100px] truncate">
                    <TeamLogo logo={homeLogo} name={homeName} />
                    <span className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors">
                      {homeName}
                    </span>
                  </div>

                  {/* Score or Status */}
                  <div className="flex flex-col items-center justify-center min-w-[42px] px-1">
                    {isLive ? (
                      <>
                        <span className="font-mono font-black text-xs text-primary">
                          {homeScore} - {awayScore}
                        </span>
                        <span className="text-[9px] font-bold text-destructive uppercase animate-pulse">
                          {match.current_minute ? `${match.current_minute}'` : 'AO VIVO'}
                        </span>
                      </>
                    ) : isFinished ? (
                      <>
                        <span className="font-mono font-bold text-xs text-on-surface">
                          {homeScore} - {awayScore}
                        </span>
                        <span className="text-[9px] font-semibold text-on-surface-variant uppercase">
                          Final
                        </span>
                      </>
                    ) : (
                      <span className="font-mono text-[11px] font-semibold text-on-surface-variant">
                        VS
                      </span>
                    )}
                  </div>

                  {/* Away Team */}
                  <div className="flex items-center gap-1.5 max-w-[100px] truncate">
                    <span className="font-semibold text-on-surface truncate group-hover:text-primary transition-colors text-right">
                      {awayName}
                    </span>
                    <TeamLogo logo={awayLogo} name={awayName} />
                  </div>
                </Link>
              )
            })
          ) : (
            <div className="flex items-center gap-2 text-xs text-on-surface-variant py-1">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
              <span>Acompanhe as próximas jornadas do Girabola e Taça de Angola em tempo real</span>
            </div>
          )}
        </div>

        {/* Right CTA */}
        <Link
          to={competitionId ? `/competitions/${competitionId}/match-center` : '/competitions'}
          className="hidden md:inline-flex items-center gap-1 text-xs font-bold text-primary hover:underline shrink-0"
        >
          <span>Centro de Jogos</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  )
}
