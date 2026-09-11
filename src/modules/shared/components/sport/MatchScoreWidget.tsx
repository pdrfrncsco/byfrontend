import * as React from 'react'
import { cn } from '@/lib/utils'

export interface MatchScoreWidgetProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  match?: any
  variant?: 'compact' | 'normal'
  homeTeam?: { name: string; logoUrl?: string }
  awayTeam?: { name: string; logoUrl?: string }
  homeScore?: number | null
  awayScore?: number | null
  status?: string
  statusLabel?: string
  matchDate?: string
  venue?: string
  competitionName?: string
  onClick?: () => void
}

/**
 * Compact match result widget for sidebars and lists.
 */
export const MatchScoreWidget = React.forwardRef<HTMLDivElement, MatchScoreWidgetProps>(
  (
    {
      match,
      variant: _variant,
      homeTeam,
      awayTeam,
      homeScore,
      awayScore,
      status,
      statusLabel,
      matchDate,
      venue,
      competitionName,
      onClick,
      className,
      ...props
    },
    ref
  ) => {
    // Resolve from match prop if provided
    const resolvedHomeTeam = homeTeam || {
      name: match?.home_club_name || match?.home_team_name || match?.home_club?.name || 'Casa',
      logoUrl: match?.home_club_logo || match?.home_team_logo || match?.home_club?.logo_url,
    }
    const resolvedAwayTeam = awayTeam || {
      name: match?.away_club_name || match?.away_team_name || match?.away_club?.name || 'Fora',
      logoUrl: match?.away_club_logo || match?.away_team_logo || match?.away_club?.logo_url,
    }
    const resolvedHomeScore = homeScore !== undefined ? homeScore : match?.home_score ?? null
    const resolvedAwayScore = awayScore !== undefined ? awayScore : match?.away_score ?? null
    const resolvedStatus = (status || match?.status || 'scheduled').toLowerCase()
    const resolvedStatusLabel = statusLabel || match?.status_label || (
      resolvedStatus === 'live' ? 'Ao vivo' :
      resolvedStatus === 'halftime' ? 'Intervalo' :
      resolvedStatus === 'finished' || resolvedStatus === 'played' ? 'Terminado' :
      resolvedStatus === 'scheduled' || resolvedStatus === 'fixture' ? 'Agendado' : resolvedStatus
    )
    const resolvedMatchDate = matchDate || (
      match?.match_date ? new Date(match.match_date).toLocaleDateString('pt-AO') :
      match?.date ? new Date(match.date).toLocaleDateString('pt-AO') : undefined
    )
    const resolvedVenue = venue || match?.venue
    const resolvedCompName = competitionName || match?.competition_name || match?.competition?.name

    const isClickable = typeof onClick === 'function'
    const isLive = resolvedStatus === 'live' || resolvedStatus === 'halftime'
    const isScheduled = resolvedStatus === 'scheduled' || resolvedStatus === 'fixture'
    const isFinished = resolvedStatus === 'finished' || resolvedStatus === 'played'

    const renderLogo = (team: { name: string; logoUrl?: string }) => {
      if (team.logoUrl) {
        return (
          <img
            src={team.logoUrl}
            alt={`${team.name} logo`}
            className="w-7 h-7 object-contain"
          />
        )
      }
      return (
        <div className="w-7 h-7 rounded-full bg-surface-container-highest flex items-center justify-center text-xs font-semibold text-on-surface-variant uppercase overflow-hidden shrink-0">
          {(team.name || '???').substring(0, 3)}
        </div>
      )
    }

    return (
      <div
        ref={ref}
        onClick={onClick}
        className={cn(
          'rounded-lg border border-outline-variant/15 bg-surface-container p-3',
          isClickable && 'hover:bg-surface-container-high transition-colors cursor-pointer',
          className
        )}
        {...props}
      >
        <div className="flex items-center justify-between gap-3 mb-2">
          {/* Home Team */}
          <div className="flex items-center gap-2 flex-1 min-w-0 justify-end">
            <span className="truncate text-sm font-medium text-on-surface">
              {resolvedHomeTeam.name}
            </span>
            {renderLogo(resolvedHomeTeam)}
          </div>

          {/* Score */}
          <div className="flex items-center justify-center px-2 shrink-0">
            {resolvedHomeScore != null && resolvedAwayScore != null ? (
              <span
                className={cn(
                  'text-lg font-bold',
                  isLive ? 'text-primary' : 'text-on-surface'
                )}
              >
                {resolvedHomeScore} - {resolvedAwayScore}
              </span>
            ) : (
              <span className="text-sm font-medium text-on-surface-variant">vs</span>
            )}
          </div>

          {/* Away Team */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {renderLogo(resolvedAwayTeam)}
            <span className="truncate text-sm font-medium text-on-surface">
              {resolvedAwayTeam.name}
            </span>
          </div>
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-center gap-3 text-xs text-on-surface-variant mt-2 border-t border-outline-variant/15 pt-2">
          <div className="flex items-center gap-1.5">
            <span
              className={cn(
                'w-2 h-2 rounded-full',
                isLive && 'bg-green-500 animate-pulse',
                isScheduled && 'bg-gray-400',
                isFinished && 'bg-gray-600'
              )}
            />
            <span className={cn(isLive && 'text-green-500 font-medium')}>
              {resolvedStatusLabel}
            </span>
          </div>

          {(resolvedMatchDate || resolvedVenue || resolvedCompName) && (
            <div className="flex items-center gap-2 truncate">
              {resolvedCompName && <span className="truncate">{resolvedCompName}</span>}
              {resolvedCompName && (resolvedMatchDate || resolvedVenue) && <span>•</span>}
              {resolvedMatchDate && <span>{resolvedMatchDate}</span>}
              {resolvedMatchDate && resolvedVenue && <span>•</span>}
              {resolvedVenue && <span className="truncate">{resolvedVenue}</span>}
            </div>
          )}
        </div>
      </div>
    )
  }
)
MatchScoreWidget.displayName = 'MatchScoreWidget'
