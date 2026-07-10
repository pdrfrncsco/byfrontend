import { Trophy, Calendar } from 'lucide-react'
import { Badge } from '@/components/ui'
import type { Competition, CompetitionStatus, CompetitionType } from '../types'

const STATUS_CONFIG: Record<CompetitionStatus, { label: string; variant: 'default' | 'success' | 'secondary' }> = {
  draft: { label: 'Rascunho', variant: 'default' },
  active: { label: 'Em Curso', variant: 'success' },
  completed: { label: 'Concluída', variant: 'secondary' },
}

const TYPE_LABELS: Record<CompetitionType, string> = {
  league: 'Campeonato',
  tournament: 'Torneio',
  cup: 'Taça',
}

interface CompetitionHeaderProps {
  competition: Competition
  isLoading?: boolean
}

/**
 * CompetitionHeader — hero section for the Competition Detail page.
 * Shows name, type, season, and status badge.
 *
 * @example
 * <CompetitionHeader competition={competition} />
 */
export function CompetitionHeader({ competition, isLoading = false }: CompetitionHeaderProps) {
  if (isLoading) {
    return (
      <div className="space-y-md p-xl">
        <div className="flex animate-pulse items-center gap-md">
          <div className="h-16 w-16 rounded-2xl bg-surface-container-highest" />
          <div className="flex-1 space-y-sm">
            <div className="h-6 w-48 rounded bg-surface-container-highest" />
            <div className="h-4 w-32 rounded bg-surface-container-highest" />
          </div>
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[competition.status] ?? STATUS_CONFIG.draft
  const typeLabel = TYPE_LABELS[competition.competition_type] ?? competition.competition_type

  return (
    <div className="border-b border-outline-variant/20 bg-gradient-to-br from-surface-container to-surface-container-high">
      <div className="mx-auto max-w-6xl px-xl py-xl">
        <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:gap-xl">
          {/* Icon */}
          <div className="flex h-16 w-16 flex-shrink-0 items-center justify-center rounded-2xl bg-primary-container/30 shadow-sm">
            <Trophy className="h-8 w-8 text-primary" />
          </div>

          {/* Details */}
          <div className="flex-1 space-y-xs">
            <div className="flex flex-wrap items-center gap-sm">
              <Badge variant={statusCfg.variant}>{statusCfg.label}</Badge>
              <span className="text-xs text-on-surface-variant">{typeLabel}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-on-surface sm:text-3xl">
              {competition.name}
            </h1>
            <div className="flex items-center gap-sm text-sm text-on-surface-variant">
              <Calendar className="h-4 w-4" />
              <span>Época {competition.season}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/**
 * CompetitionHeaderSkeleton — loading placeholder for CompetitionHeader.
 */
export function CompetitionHeaderSkeleton() {
  return (
    <div className="border-b border-outline-variant/20 bg-surface-container p-xl">
      <div className="mx-auto max-w-6xl">
        <div className="flex animate-pulse items-center gap-xl">
          <div className="h-16 w-16 rounded-2xl bg-surface-container-highest" />
          <div className="flex-1 space-y-sm">
            <div className="h-5 w-20 rounded-full bg-surface-container-highest" />
            <div className="h-8 w-64 rounded bg-surface-container-highest" />
            <div className="h-4 w-32 rounded bg-surface-container-highest" />
          </div>
        </div>
      </div>
    </div>
  )
}
