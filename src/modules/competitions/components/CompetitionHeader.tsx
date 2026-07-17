import { Calendar, Trophy } from 'lucide-react'
import { Badge } from '@/components/ui'
import { DetailHeroCard } from '@/modules/shared/components/DetailHeroCard'
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
 * CompetitionHeader
 * hero section for the Competition Detail page.
 * Shows name, type, season, and status badge.
 * @example
 * <CompetitionHeader competition={competition} />
 */
export function CompetitionHeader({ competition, isLoading = false }: CompetitionHeaderProps) {
  if (isLoading) {
    return (
      <div className="container py-xl">
        <div className="grid animate-pulse gap-xl rounded-[2rem] border border-outline-variant/20 bg-surface-container/75 p-xl shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] md:grid-cols-[auto_1fr_auto]">
          <div className="h-16 w-16 rounded-2xl bg-surface-container-highest" />
          <div className="space-y-sm">
            <div className="h-5 w-24 rounded-full bg-surface-container-highest" />
            <div className="h-8 w-64 rounded bg-surface-container-highest" />
            <div className="h-4 w-32 rounded bg-surface-container-highest" />
          </div>
          <div className="h-10 w-32 rounded-full bg-surface-container-highest" />
        </div>
      </div>
    )
  }

  const statusCfg = STATUS_CONFIG[competition.status] ?? STATUS_CONFIG.draft
  const typeLabel = TYPE_LABELS[competition.competition_type] ?? competition.competition_type

  return (
    <div className="container py-xl">
      <DetailHeroCard
        eyebrow="Competição pública"
        title={competition.name}
        description={`Temporada ${competition.season}. Explore a classificação, os jogos, as estatísticas e os regulamentos desta competição.`}
        visual={
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-container/30 shadow-sm">
            <Trophy className="h-8 w-8 text-primary" />
          </div>
        }
        chips={[
          { label: statusCfg.label },
          { label: typeLabel },
          { icon: Calendar, label: `Época ${competition.season}` },
        ]}
        backgroundClassName="bg-[radial-gradient(circle_at_top_left,rgba(66,153,225,0.14),transparent_38%),radial-gradient(circle_at_top_right,rgba(17,94,89,0.12),transparent_36%),linear-gradient(180deg,rgba(7,16,29,0.92),rgba(7,16,29,0.78))]"
        actions={
          <Badge variant={statusCfg.variant} className="self-start">
            {statusCfg.label}
          </Badge>
        }
      />
    </div>
  )
}

/**
 * CompetitionHeaderSkeleton
 * loading placeholder for CompetitionHeader.
 */
export function CompetitionHeaderSkeleton() {
  return (
    <div className="container py-xl">
      <div className="grid animate-pulse gap-xl rounded-[2rem] border border-outline-variant/20 bg-surface-container/75 p-xl shadow-[0_24px_80px_-40px_rgba(0,0,0,0.7)] md:grid-cols-[auto_1fr_auto]">
        <div className="h-16 w-16 rounded-2xl bg-surface-container-highest" />
        <div className="space-y-sm">
          <div className="h-5 w-24 rounded-full bg-surface-container-highest" />
          <div className="h-8 w-64 rounded bg-surface-container-highest" />
          <div className="h-4 w-32 rounded bg-surface-container-highest" />
        </div>
        <div className="h-10 w-32 rounded-full bg-surface-container-highest" />
      </div>
    </div>
  )
}
