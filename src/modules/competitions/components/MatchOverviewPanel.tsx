import { Activity, BarChart3, Goal } from 'lucide-react'
import type { Match, MatchEvent, MatchStats } from '../types'
import { MatchTimeline } from './MatchTimeline'
import { MatchStatsPanel } from './MatchStatsPanel'
import { MatchCountdown } from './MatchCountdown'

interface MatchOverviewPanelProps {
  match: Match
  events: MatchEvent[]
  stats: MatchStats | null
  loadingEvents?: boolean
  loadingStats?: boolean
  onCountdownExpire?: () => void
}

function isGoalType(type: string): boolean {
  return ['goal', 'own_goal', 'penalty_goal', 'penalty_scored'].includes(type)
}

/** Compact goal scorers list */
function GoalScorersSection({ events, match }: { events: MatchEvent[]; match: Match }) {
  const goalEvents = events.filter(e => isGoalType(e.type || e.event_type))
  if (goalEvents.length === 0) return null

  const homeGoals = goalEvents.filter(
    e => e.club === match.home_club || e.teamId === match.homeTeamId
  )
  const awayGoals = goalEvents.filter(
    e => e.club !== match.home_club && e.teamId !== match.homeTeamId
  )

  const formatGoal = (e: MatchEvent) => {
    const name = e.player_name || 'Desconhecido'
    const min = `${e.minute}'`
    const type = String(e.type || (e as any).event_type || '')
    const suffix = type === 'own_goal' ? ' (AG)' : type.includes('penalty') ? ' (P)' : ''
    return `${name} ${min}${suffix}`
  }

  return (
    <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-md">
      <div className="flex items-center gap-sm mb-sm">
        <Goal className="h-4 w-4 text-emerald-500" />
        <h3 className="text-sm font-bold text-on-surface">Marcadores</h3>
      </div>
      <div className="grid grid-cols-2 gap-md">
        <div className="space-y-xs">
          {homeGoals.length > 0 ? (
            homeGoals.map(g => (
              <p key={g.id} className="text-xs text-on-surface-variant">
                <span className="font-medium text-on-surface">{formatGoal(g)}</span>
              </p>
            ))
          ) : (
            <p className="text-xs text-on-surface-variant/50">—</p>
          )}
        </div>
        <div className="space-y-xs text-right">
          {awayGoals.length > 0 ? (
            awayGoals.map(g => (
              <p key={g.id} className="text-xs text-on-surface-variant">
                <span className="font-medium text-on-surface">{formatGoal(g)}</span>
              </p>
            ))
          ) : (
            <p className="text-xs text-on-surface-variant/50">—</p>
          )}
        </div>
      </div>
    </div>
  )
}

export function MatchOverviewPanel({
  match,
  events,
  stats,
  loadingEvents = false,
  loadingStats = false,
  onCountdownExpire,
}: MatchOverviewPanelProps) {
  const isScheduled = match.status === 'scheduled'
  const hasEvents = events.length > 0
  const hasGoals = events.some(e => isGoalType(e.type || e.event_type))

  return (
    <div className="space-y-lg">
      {/* Countdown for scheduled matches */}
      {isScheduled && (match.scheduledAt || match.match_date) && (
        <div className="flex justify-center">
          <MatchCountdown
            scheduledAt={match.scheduledAt ?? match.match_date!}
            onExpire={onCountdownExpire}
          />
        </div>
      )}

      {/* Goal scorers (only if match has started and has goals) */}
      {hasGoals && <GoalScorersSection events={events} match={match} />}

      {/* Events timeline */}
      {hasEvents && (
        <section aria-labelledby="overview-events-title">
          <div className="flex items-center gap-sm mb-sm">
            <Activity className="h-4 w-4 text-primary" />
            <h2 id="overview-events-title" className="text-sm font-bold text-on-surface">
              Acontecimentos
            </h2>
          </div>
          <MatchTimeline events={events} match={match} isLoading={loadingEvents} />
        </section>
      )}

      {/* Stats summary (top metrics) */}
      {!isScheduled && (
        <section aria-labelledby="overview-stats-title">
          <div className="flex items-center gap-sm mb-sm">
            <BarChart3 className="h-4 w-4 text-primary" />
            <h2 id="overview-stats-title" className="text-sm font-bold text-on-surface">
              Estatísticas
            </h2>
          </div>
          <MatchStatsPanel
            stats={stats}
            homeName={match.homeTeamName || match.home_club_name}
            awayName={match.awayTeamName || match.away_club_name}
            isLoading={loadingStats}
          />
        </section>
      )}

      {/* Empty state for scheduled matches with no events */}
      {isScheduled && !hasEvents && (
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-lg text-center">
          <Activity className="mx-auto h-10 w-10 text-on-surface-variant/30" />
          <p className="mt-sm font-medium text-on-surface-variant">Partida ainda não começou</p>
          <p className="text-sm text-on-surface-variant/70">
            Acompanhe os eventos em tempo real quando a partida iniciar.
          </p>
        </div>
      )}
    </div>
  )
}
