import { Link } from 'react-router-dom'
import { Trophy, Activity, Calendar, ChevronRight } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import type { Competition, CompetitionStatus, CompetitionType } from '../types'

const STATUS_CONFIG: Record<CompetitionStatus, { color: string; bg: string; label: string }> = {
  draft: { color: '#94a3b8', bg: '#94a3b822', label: 'Rascunho' },
  active: { color: '#10b981', bg: '#10b98122', label: 'Em Curso' },
  completed: { color: '#6b7280', bg: '#6b728022', label: 'Concluída' },
}

const TYPE_CONFIG: Record<CompetitionType, { icon: typeof Trophy; label: string }> = {
  league: { icon: Trophy, label: 'Campeonato' },
  tournament: { icon: Activity, label: 'Torneio' },
  cup: { icon: Trophy, label: 'Taça' },
}

interface CompetitionCardProps {
  competition: Competition
}

export function CompetitionCard({ competition }: CompetitionCardProps) {
  const statusCfg = STATUS_CONFIG[competition.status] ?? STATUS_CONFIG.draft
  const typeCfg = TYPE_CONFIG[competition.competition_type] ?? TYPE_CONFIG.league
  const Icon = typeCfg.icon

  return (
    <Link to={`/competitions/${competition.id}`}>
      <Card
        variant="flat"
        padding="lg"
        className="group transition-all hover:border-primary/30 hover:bg-surface-container-high"
      >
        <div className="flex items-center gap-lg">
          {/* Icon */}
          <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-xl bg-primary-container/20 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
            <Icon className="h-6 w-6" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-base font-semibold text-on-surface">
              {competition.name}
            </h3>
            <div className="mt-1 flex items-center gap-sm text-sm text-on-surface-variant">
              <Calendar className="h-3.5 w-3.5" />
              <span>{competition.season}</span>
              <span className="text-outline">•</span>
              <span>{typeCfg.label}</span>
            </div>
          </div>

          {/* Status & Arrow */}
          <div className="flex flex-shrink-0 items-center gap-md">
            <Badge
              variant={
                competition.status === 'active'
                  ? 'success'
                  : competition.status === 'completed'
                    ? 'secondary'
                    : 'default'
              }
            >
              {statusCfg.label}
            </Badge>
            <ChevronRight className="h-5 w-5 text-outline transition-transform group-hover:translate-x-1 group-hover:text-primary" />
          </div>
        </div>
      </Card>
    </Link>
  )
}