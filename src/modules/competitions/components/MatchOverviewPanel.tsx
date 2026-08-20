import { Activity, BarChart3 } from 'lucide-react'
import type { Match, MatchEvent, MatchStats } from '../types'
import { MatchTimeline } from './MatchTimeline'
import { MatchStatsPanel } from './MatchStatsPanel'

interface MatchOverviewPanelProps {
  match: Match
  events: MatchEvent[]
  stats: MatchStats | null
  loadingEvents?: boolean
  loadingStats?: boolean
}

export function MatchOverviewPanel({ match, events, stats, loadingEvents = false, loadingStats = false }: MatchOverviewPanelProps) {
  return (
    <div className="grid gap-lg xl:grid-cols-[minmax(0,1.15fr)_minmax(20rem,0.85fr)]">
      <section className="space-y-sm" aria-labelledby="overview-events-title">
        <div className="flex items-center gap-sm">
          <Activity className="h-5 w-5 text-primary" />
          <h2 id="overview-events-title" className="text-lg font-semibold text-on-surface">Últimos acontecimentos</h2>
        </div>
        <MatchTimeline events={events.slice(-5)} match={match} isLoading={loadingEvents} />
      </section>
      <section className="space-y-sm" aria-labelledby="overview-stats-title">
        <div className="flex items-center gap-sm">
          <BarChart3 className="h-5 w-5 text-primary" />
          <h2 id="overview-stats-title" className="text-lg font-semibold text-on-surface">Resumo estatístico</h2>
        </div>
        <MatchStatsPanel stats={stats} homeName={match.home_club_name} awayName={match.away_club_name} isLoading={loadingStats} />
      </section>
    </div>
  )
}
