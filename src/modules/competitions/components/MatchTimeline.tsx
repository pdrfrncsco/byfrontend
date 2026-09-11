import { Activity, AlertCircle, ArrowRightLeft, Goal, Loader2, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui'
import type { Match, MatchEvent } from '../types'

export interface MatchTimelineProps {
  events: MatchEvent[]
  match: Match
  isLoading?: boolean
  /** Show all events or limit to N */
  limit?: number
}

const EVENT_META: Record<string, { label: string; icon: typeof Goal; color: string }> = {
  goal: { label: 'Golo', icon: Goal, color: '#16a34a' },
  own_goal: { label: 'Auto-golo', icon: Goal, color: '#dc2626' },
  penalty_goal: { label: 'Penálti', icon: Goal, color: '#2563eb' },
  penalty_scored: { label: 'Penálti', icon: Goal, color: '#2563eb' },
  penalty_missed: { label: 'Penálti falhado', icon: AlertCircle, color: '#f59e0b' },
  yellow_card: { label: 'Cartão amarelo', icon: ShieldAlert, color: '#d97706' },
  red_card: { label: 'Cartão vermelho', icon: ShieldAlert, color: '#dc2626' },
  yellow_red: { label: 'Duplo amarelo', icon: ShieldAlert, color: '#dc2626' },
  yellow_red_card: { label: 'Duplo amarelo', icon: ShieldAlert, color: '#dc2626' },
  substitution_in: { label: 'Substituição', icon: ArrowRightLeft, color: '#4f46e5' },
  substitution_out: { label: 'Substituição', icon: ArrowRightLeft, color: '#4f46e5' },
  substitution: { label: 'Substituição', icon: ArrowRightLeft, color: '#4f46e5' },
  injury: { label: 'Lesão', icon: AlertCircle, color: '#ea580c' },
}

function isGoalType(type: string): boolean {
  return ['goal', 'own_goal', 'penalty_goal', 'penalty_scored'].includes(type)
}

/** Period separator between first/second half */
function PeriodSeparator({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-sm py-xs">
      <div className="h-px flex-1 bg-outline-variant/20" />
      <span className="text-[10px] font-bold uppercase tracking-widest text-on-surface-variant/60">{label}</span>
      <div className="h-px flex-1 bg-outline-variant/20" />
    </div>
  )
}

export function MatchTimeline({ events, match, isLoading = false, limit }: MatchTimelineProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center py-xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <Card variant="flat" padding="lg">
        <div className="flex flex-col items-center gap-sm py-xl text-center">
          <Activity className="h-10 w-10 text-on-surface-variant/30" />
          <p className="font-medium text-on-surface-variant">Sem eventos registados</p>
          <p className="text-sm text-on-surface-variant/70">Os eventos aparecem aqui quando forem registados.</p>
        </div>
      </Card>
    )
  }

  const sortedEvents = [...events].sort((a, b) => a.minute - b.minute)
  const displayEvents = limit ? sortedEvents.slice(-limit) : sortedEvents

  // Track running score for goal events
  let runningHome = 0
  let runningAway = 0
  const eventsWithScore = sortedEvents.map(event => {
    const eventType = event.type || event.event_type
    if (isGoalType(eventType)) {
      const isHome = event.club === match.home_club || event.teamId === match.homeTeamId
      if (isHome) runningHome++
      else runningAway++
    }
    return { event, scoreSnapshot: { home: runningHome, away: runningAway } }
  })

  // Only keep the events we want to display, but with correct running scores
  const displaySet = new Set(displayEvents.map(e => e.id))
  const filteredWithScore = eventsWithScore.filter(({ event }) => displaySet.has(event.id))

  // Group by period for separators
  let lastPeriod = ''

  return (
    <div className="space-y-xs">
      {filteredWithScore.map(({ event, scoreSnapshot }) => {
        const eventType = event.type || event.event_type
        const meta = EVENT_META[eventType] ?? { label: event.event_type_label || 'Evento', icon: Activity, color: '#64748b' }
        const Icon = meta.icon
        const isHome = event.club === match.home_club || event.teamId === match.homeTeamId
        const isGoal = isGoalType(eventType)

        // Period separator
        const eventPeriod = event.period || (event.minute > 45 ? 'second_half' : 'first_half')
        let separator: React.ReactNode = null
        if (eventPeriod !== lastPeriod) {
          lastPeriod = eventPeriod
          const periodLabels: Record<string, string> = {
            first_half: 'Primeira Parte',
            second_half: 'Segunda Parte',
            extra_time: 'Prolongamento',
            extra_first_half: 'Prol. 1ª Parte',
            extra_second_half: 'Prol. 2ª Parte',
            penalties: 'Penáltis',
          }
          separator = <PeriodSeparator label={periodLabels[eventPeriod] || eventPeriod} />
        }

        const playerName = event.player_name || event.playerId || meta.label
        const subNote = event.player_off_name
          ? `↔ ${event.player_off_name}`
          : event.notes || ''

        return (
          <div key={event.id}>
            {separator}
            <div
              className={`group grid gap-sm rounded-lg border border-outline-variant/15 bg-surface-container p-sm transition-all hover:bg-surface-container-low ${
                isHome
                  ? 'grid-cols-[1fr_2.5rem_2.5rem]'
                  : 'grid-cols-[2.5rem_2.5rem_1fr]'
              }`}
            >
              {isHome ? (
                <>
                  {/* Home event — content left, minute right */}
                  <div className="flex items-center gap-sm">
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">{playerName}</p>
                      {subNote && <p className="truncate text-xs text-on-surface-variant">{subNote}</p>}
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-on-surface-variant">
                      {event.minute}{event.extra_time ? '+' : ''}&apos;
                    </span>
                  </div>
                  {isGoal ? (
                    <div className="flex items-center justify-center">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                        {scoreSnapshot.home}-{scoreSnapshot.away}
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}
                </>
              ) : (
                <>
                  {/* Away event — minute left, content right */}
                  {isGoal ? (
                    <div className="flex items-center justify-center">
                      <span className="rounded bg-primary/10 px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary">
                        {scoreSnapshot.home}-{scoreSnapshot.away}
                      </span>
                    </div>
                  ) : (
                    <div />
                  )}
                  <div className="flex items-center justify-center">
                    <span className="font-mono text-xs font-bold text-on-surface-variant">
                      {event.minute}{event.extra_time ? '+' : ''}&apos;
                    </span>
                  </div>
                  <div className="flex items-center justify-end gap-sm text-right">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-on-surface">{playerName}</p>
                      {subNote && <p className="truncate text-xs text-on-surface-variant">{subNote}</p>}
                    </div>
                    <span
                      className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full"
                      style={{ backgroundColor: `${meta.color}15` }}
                    >
                      <Icon className="h-3.5 w-3.5" style={{ color: meta.color }} />
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
