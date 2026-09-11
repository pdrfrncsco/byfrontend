import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Trophy, Activity, Calendar, ChevronRight, Shield, Award } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { Competition, CompetitionStatus, CompetitionType } from '../types'

export interface CompetitionCardProps {
  competition: Competition
  className?: string
}

const TYPE_CONFIG: Record<
  CompetitionType,
  { label: string; icon: typeof Trophy; bgClass: string; textClass: string; borderClass: string }
> = {
  league: {
    label: 'Campeonato',
    icon: Trophy,
    bgClass: 'bg-amber-500/10',
    textClass: 'text-amber-500',
    borderClass: 'border-amber-500/20',
  },
  cup: {
    label: 'Taça',
    icon: Award,
    bgClass: 'bg-emerald-500/10',
    textClass: 'text-emerald-500',
    borderClass: 'border-emerald-500/20',
  },
  tournament: {
    label: 'Torneio',
    icon: Activity,
    bgClass: 'bg-violet-500/10',
    textClass: 'text-violet-500',
    borderClass: 'border-violet-500/20',
  },
}

export function CompetitionCard({ competition, className = '' }: CompetitionCardProps) {
  const [imgError, setImgError] = useState(false)

  const type = competition.competition_type || 'league'
  const typeCfg = TYPE_CONFIG[type] ?? TYPE_CONFIG.league
  const Icon = typeCfg.icon

  const status = competition.status || 'draft'
  const statusVariant =
    status === 'active' ? 'primary' : status === 'completed' ? 'secondary' : 'warning'
  const statusLabel =
    competition.status_label || (status === 'active' ? 'Em curso' : status === 'completed' ? 'Concluída' : 'Rascunho')

  const logoUrl =
    (competition as any).logo_url ||
    (competition as any).logo ||
    (competition as any).emblem_url ||
    (competition as any).emblem

  return (
    <Link
      to={`/competitions/${competition.slug || competition.id}`}
      className={`group flex items-center justify-between gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-all duration-200 hover:border-primary/40 hover:bg-surface-container-high hover:shadow-md ${className}`}
    >
      <div className="flex items-center gap-md min-w-0">
        {/* Logo or Sports Icon Badge */}
        {logoUrl && !imgError ? (
          <img
            src={logoUrl}
            alt={competition.name}
            className="h-11 w-11 shrink-0 rounded-xl border border-outline-variant/20 object-cover shadow-sm transition-transform duration-200 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgError(true)}
          />
        ) : (
          <div
            className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-transform duration-200 group-hover:scale-105 ${typeCfg.bgClass} ${typeCfg.textClass} ${typeCfg.borderClass}`}
          >
            <Icon className="h-5 w-5" />
          </div>
        )}

        {/* Competition Information */}
        <div className="min-w-0 space-y-0.5">
          <div className="flex items-center gap-1.5">
            <h4 className="truncate font-semibold text-sm text-on-surface group-hover:text-primary transition-colors">
              {competition.name}
            </h4>
          </div>

          <div className="flex items-center gap-xs text-xs text-on-surface-variant truncate">
            <span className="font-medium text-primary text-[11px]">
              {competition.type_label || typeCfg.label}
            </span>

            {competition.season && (
              <>
                <span>•</span>
                <span className="flex items-center gap-1 truncate">
                  <Calendar className="h-3 w-3 shrink-0" />
                  {competition.season}
                </span>
              </>
            )}

            {(competition as any).tenant_name && (
              <>
                <span>•</span>
                <span className="truncate">{(competition as any).tenant_name}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Status Badge & Arrow */}
      <div className="flex items-center gap-sm shrink-0">
        <Badge variant={statusVariant} className="text-[11px] hidden sm:inline-flex">
          {statusLabel}
        </Badge>
        <ChevronRight className="h-4 w-4 text-on-surface-variant group-hover:text-primary transition-colors" />
      </div>
    </Link>
  )
}