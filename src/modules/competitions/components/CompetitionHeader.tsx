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
      <div className="mx-auto max-w-8xl px-md py-xl sm:px-xl relative z-10">
        <div className="grid animate-pulse gap-xl rounded-[2rem] border border-outline-variant/20 bg-surface-container p-xl shadow-[0_18px_40px_-30px_rgba(15,17,23,0.18)] md:grid-cols-[auto_1fr_auto]">
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
    <div className="mx-auto max-w-8xl px-md py-xl sm:px-xl relative z-10">
      <DetailHeroCard
        eyebrow="Competição pública"
        title={competition.name}
        description={`Temporada ${competition.season}. Explore a classificação, os jogos, as estatísticas e os regulamentos desta competição.`}
        visual={
          <div className="flex h-20 w-20 items-center justify-center rounded-[1.5rem] bg-gradient-to-br from-amber-500 to-orange-600 text-on-primary shadow-[0_16px_28px_rgba(245,158,11,0.28)]">
            <Trophy className="h-9 w-9" />
          </div>
        }
        chips={[
          { label: statusCfg.label },
          { label: typeLabel },
          { icon: Calendar, label: `Época ${competition.season}` },
        ]}
        backgroundClassName="bg-[radial-gradient(circle_at_top_left,rgba(245,158,11,0.12),transparent_35%),radial-gradient(circle_at_top_right,rgba(59,130,246,0.10),transparent_30%),linear-gradient(180deg,rgba(255,255,255,0.96),rgba(240,246,245,0.84))]"
        actions={
          <Badge variant={statusCfg.variant} className="self-start rounded-full px-sm py-1 text-xs font-semibold">
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
    <div className="mx-auto max-w-8xl px-md py-xl sm:px-xl relative z-10">
      <div className="grid animate-pulse gap-xl rounded-[2rem] border border-outline-variant/20 bg-surface-container p-xl shadow-[0_18px_40px_-30px_rgba(15,17,23,0.18)] md:grid-cols-[auto_1fr_auto]">
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
