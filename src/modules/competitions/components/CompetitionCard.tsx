import { Link } from 'react-router-dom'
import { Trophy, Activity, Calendar, ChevronRight } from 'lucide-react'
import { Badge, Card } from '@/components/ui'
import type { Competition, CompetitionStatus, CompetitionType } from '../types'

const STATUS_CONFIG: Record<CompetitionStatus, { color: string; bg: string; label: string }> = {
  draft: { color: '#94a3b8', bg: '#94a3b822', label: 'Rascunho' },
  active: { color: '#10b981', bg: '#10b98122', label: 'Em Curso' },
  completed: { color: '#6b7280', bg: '#6b728022', label: 'Concluída' },
}

const TYPE_CONFIG: Record<CompetitionType, { icon: typeof Trophy; label: string; gradient: string }> = {
  league: { icon: Trophy, label: 'Campeonato', gradient: 'from-blue-500 to-indigo-600' },
  tournament: { icon: Activity, label: 'Torneio', gradient: 'from-purple-500 to-pink-600' },
  cup: { icon: Trophy, label: 'Taça', gradient: 'from-amber-500 to-orange-600' },
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
        className="group relative overflow-hidden transition-all duration-300 hover:border-primary/40 hover:bg-surface-container-high hover:shadow-lg hover:-translate-y-1"
      >
        {/* Gradient Accent */}
        <div
          className={`absolute -left-10 top-1/2 h-32 w-32 -translate-y-1/2 rounded-full bg-gradient-to-br ${typeCfg.gradient} opacity-10 blur-2xl transition-opacity duration-300 group-hover:opacity-20`}
        />

        <div className="relative flex items-center gap-lg">
          {/* Icon with Gradient */}
          <div className={`flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${typeCfg.gradient} text-white shadow-lg transition-transform duration-300 group-hover:scale-110`}>
            <Icon className="h-7 w-7" />
          </div>

          {/* Content */}
          <div className="min-w-0 flex-1">
            <h3 className="truncate text-lg font-bold text-on-surface group-hover:text-primary transition-colors">
              {competition.name}
            </h3>
            <div className="mt-2 flex items-center gap-sm text-sm text-on-surface-variant">
              <Calendar className="h-4 w-4" />
              <span className="font-medium">{competition.season}</span>
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
            <ChevronRight className="h-6 w-6 text-outline transition-all duration-300 group-hover:translate-x-2 group-hover:text-primary" />
          </div>
        </div>
      </Card>
    </Link>
  )
}