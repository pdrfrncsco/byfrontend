import { Link } from 'react-router-dom'
import { Activity, Calendar, Clock, Target, Trophy } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import type { PlayerCareerEntry } from '../types'

interface PlayerCareerTimelineProps {
  career: PlayerCareerEntry[]
}

export function PlayerCareerTimeline({ career }: PlayerCareerTimelineProps) {
  if (career.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title="Sem registos de carreira"
        description="Este jogador ainda não tem histórico de clubes publicado."
      />
    )
  }

  return (
    <div className="space-y-md">
      {career.map((entry, index) => (
        <div
          key={`${entry.club_slug}-${entry.joined}-${index}`}
          className="flex gap-md rounded-2xl border border-outline-variant/20 bg-surface-container p-lg"
        >
          <div className="flex flex-col items-center pt-1">
            <div className="h-3 w-3 rounded-full bg-primary shadow-[0_0_0_4px_rgba(148,211,193,0.15)]" />
            {index < career.length - 1 && <div className="mt-1 w-px flex-1 bg-outline-variant/30" />}
          </div>

          <div className="min-w-0 flex-1 space-y-sm">
            <div className="flex flex-wrap items-center gap-sm">
              <Link
                to={`/clubs/${entry.club_slug}`}
                className="font-semibold text-on-surface transition-colors hover:text-primary"
              >
                {entry.club}
              </Link>
              <span className="rounded-full border border-outline-variant/30 bg-surface-container-high px-sm py-0.5 text-xs font-medium text-on-surface-variant">
                {entry.status}
              </span>
            </div>

            <div className="flex items-center gap-1 text-sm text-on-surface-variant">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(entry.joined).getFullYear()}
              {entry.left ? ` → ${new Date(entry.left).getFullYear()}` : ' → Presente'}
            </div>

            <div className="flex flex-wrap gap-md text-xs text-on-surface-variant">
              <span className="inline-flex items-center gap-1">
                <Trophy className="h-3.5 w-3.5 text-amber-400" />
                {entry.goals} golos
              </span>
              <span className="inline-flex items-center gap-1">
                <Target className="h-3.5 w-3.5 text-emerald-400" />
                {entry.assists} ass.
              </span>
              <span className="inline-flex items-center gap-1">
                <Activity className="h-3.5 w-3.5" />
                {entry.matches} jogos
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
