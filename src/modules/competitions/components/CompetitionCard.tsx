import { Link } from 'react-router-dom'
import { Trophy, Activity, Calendar, ChevronRight } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import type { Competition, CompetitionStatus, CompetitionType } from '../types'

const STATUS_CONFIG: Record<CompetitionStatus, { label: string; tone: 'default' | 'success' | 'secondary' }> = {
  draft: { label: 'Rascunho', tone: 'default' },
  active: { label: 'Em curso', tone: 'success' },
  completed: { label: 'Concluída', tone: 'secondary' },
}

const TYPE_CONFIG: Record<CompetitionType, { icon: typeof Trophy; label: string; gradient: string }> = {
  league: { icon: Trophy, label: 'Campeonato', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
  tournament: { icon: Activity, label: 'Torneio', gradient: 'linear-gradient(135deg, #8b5cf6, #ec4899)' },
  cup: { icon: Trophy, label: 'Taça', gradient: 'linear-gradient(135deg, #f59e0b, #f97316)' },
}

interface CompetitionCardProps {
  competition: Competition
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const statusCfg = STATUS_CONFIG[competition.status] ?? STATUS_CONFIG.draft
  const typeCfg = TYPE_CONFIG[competition.competition_type] ?? TYPE_CONFIG.league
  const Icon = typeCfg.icon

  return (
    <Link to={`/competitions/${competition.id}`} className="group block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-2xl">
      <Card
        variant="flat"
        padding="none"
        className="group relative overflow-hidden rounded-[1.5rem] border border-outline-variant/80 bg-surface-container-low shadow-[0_18px_40px_-28px_rgba(15,23,42,0.35)] transition-all duration-300 hover:-translate-y-1 hover:border-primary/40 hover:bg-surface-container-high"
      >
        <div className="h-1.5 w-full" style={{ background: typeCfg.gradient }} />

        <div className="p-lg">
          <div className="relative flex items-center gap-md">
            <div
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-on-primary shadow-[0_10px_24px_rgba(15,23,42,0.12)] transition-transform duration-300 group-hover:scale-105"
              style={{ background: typeCfg.gradient }}
            >
              <Icon className="h-6 w-6" />
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-sm">
                <h3 className="truncate text-xl font-bold text-on-surface transition-colors group-hover:text-primary">
                  {competition.name}
                </h3>
                <ChevronRight className="h-5 w-5 shrink-0 text-on-surface-variant transition-all duration-300 group-hover:translate-x-1 group-hover:text-primary" />
              </div>

              <div className="mt-sm flex flex-wrap items-center gap-sm text-sm text-on-surface-variant">
                <span className="inline-flex items-center gap-xs font-medium">
                  <Calendar className="h-4 w-4" />
                  {competition.season}
                </span>
                <span className="text-outline">•</span>
                <span>{typeCfg.label}</span>
              </div>
            </div>
          </div>

          <div className="mt-md flex items-center justify-between gap-sm border-t border-outline-variant/70 pt-sm">
            <Badge variant={statusCfg.tone}>{statusCfg.label}</Badge>
            <span className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">Ver curso</span>
          </div>
        </div>
      </Card>
    </Link>
  )
}