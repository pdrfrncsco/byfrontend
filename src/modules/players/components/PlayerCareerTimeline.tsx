import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Activity, Calendar, Clock, Target, Trophy, Zap, Medal } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import type { PlayerCareerEntry } from '../types'

interface PlayerCareerTimelineProps {
  career: PlayerCareerEntry[]
  maxVisibleItems?: number
}

// Competition type to color mapping
const COMPETITION_COLORS: Record<string, { bg: string; border: string; dot: string; text: string }> = {
  'league': {
    bg: 'bg-primary-container/20',
    border: 'border-primary/30',
    dot: 'bg-primary',
    text: 'text-primary',
  },
  'cup': {
    bg: 'bg-secondary-container/20',
    border: 'border-secondary/30',
    dot: 'bg-secondary',
    text: 'text-secondary',
  },
  'european': {
    bg: 'bg-tertiary-container/20',
    border: 'border-tertiary/30',
    dot: 'bg-tertiary',
    text: 'text-tertiary',
  },
  'international': {
    bg: 'bg-primary-container/15',
    border: 'border-primary/20',
    dot: 'bg-primary',
    text: 'text-primary',
  },
  'other': {
    bg: 'bg-surface-container',
    border: 'border-outline-variant/40',
    dot: 'bg-on-surface-variant',
    text: 'text-on-surface-variant',
  },
}

// Status to badge color
const STATUS_COLORS: Record<string, string> = {
  'active': 'bg-primary-container/20 text-on-primary-container',
  'loaned': 'bg-secondary-container/20 text-on-secondary-container',
  'transferred': 'bg-tertiary-container/20 text-on-tertiary-container',
  'retired': 'bg-surface-container text-on-surface-variant',
  'inactive': 'bg-surface-container-high text-on-surface-variant',
}

function getCompetitionType(competition?: string | null): string {
  if (!competition) return 'other'
  const comp = competition.toLowerCase()
  if (comp.includes('liga') || comp.includes('league') || comp.includes('championship')) return 'league'
  if (comp.includes('copa') || comp.includes('cup') || comp.includes('taça')) return 'cup'
  if (comp.includes('europa') || comp.includes('champions') || comp.includes('conference')) return 'european'
  if (comp.includes('seleção') || comp.includes('national') || comp.includes('internacional')) return 'international'
  return 'other'
}

function TimelineEntry({
  entry,
  index,
  total,
  colors,
}: {
  entry: PlayerCareerEntry
  index: number
  total: number
  colors: typeof COMPETITION_COLORS['league']
}) {
  const { t } = useTranslation()
  const [isHovered, setIsHovered] = useState(false)

  const joinedDate = new Date(entry.joined)
  const leftDate = entry.left ? new Date(entry.left) : null
  const duration = leftDate
    ? Math.floor((leftDate.getTime() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))
    : Math.floor((Date.now() - joinedDate.getTime()) / (1000 * 60 * 60 * 24 * 365.25))

  const statusColor = STATUS_COLORS[entry.status?.toLowerCase() || 'active'] || STATUS_COLORS['active']
  const clubHref = entry.club_slug ? `/clubs/${entry.club_slug}` : undefined

  return (
    <div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`flex gap-md transition-all ${isHovered ? 'scale-105' : ''}`}
    >
      {/* Timeline dot and connector */}
      <div className="flex flex-col items-center pt-1">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <div className={`h-3 w-3 rounded-full ${colors.dot} shadow-lg shadow-opacity-50 cursor-help`} />
            </TooltipTrigger>
            <TooltipContent>
              <p className="text-xs">{entry.competition || 'Competição'}</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
        {index < total - 1 && (
          <div className={`mt-1 w-px flex-1 ${isHovered ? colors.border : 'border-outline-variant/30'} border-l`} />
        )}
      </div>

      {/* Content */}
      <div
        className={`min-w-0 flex-1 rounded-xl border-2 p-lg transition-all ${colors.border} ${
          isHovered ? colors.bg : 'bg-surface-container'
        }`}
      >
        <div className="space-y-sm">
          {/* Club and Status */}
          <div className="flex flex-wrap items-center gap-sm">
            {clubHref ? (
              <Link
                to={clubHref}
                className="font-semibold text-on-surface transition-colors hover:text-primary"
              >
                {entry.club}
              </Link>
            ) : (
              <span className="font-semibold text-on-surface">{entry.club}</span>
            )}
            <span className={`rounded-full px-sm py-0.5 text-xs font-medium ${statusColor}`}>
              {entry.status}
            </span>
            {isHovered && entry.competition && (
              <span className={`rounded-full px-sm py-0.5 text-xs font-medium ${colors.text}`}>
                {entry.competition}
              </span>
            )}
          </div>

          {/* Timeline and Duration */}
          <div className="flex flex-col gap-xs text-sm text-on-surface-variant">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              <span>
                {joinedDate.toLocaleDateString('pt-PT')}
                {leftDate ? ` → ${leftDate.toLocaleDateString('pt-PT')}` : ` → ${t('players.common.present')}`}
              </span>
            </div>
            <div className="flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              <span>{duration} ano{duration !== 1 ? 's' : ''}</span>
            </div>
          </div>

          {/* Statistics */}
          <div className="flex flex-wrap gap-md text-xs text-on-surface-variant pt-sm">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <Trophy className="h-3.5 w-3.5 text-amber-400" />
                    {entry.goals} {t('players.common.goalsShort')}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{entry.goals} golos marcados</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <Target className="h-3.5 w-3.5 text-emerald-400" />
                    {entry.assists} {t('players.common.assistsShort')}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{entry.assists} assistências</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="inline-flex items-center gap-1 cursor-help">
                    <Activity className="h-3.5 w-3.5 text-blue-400" />
                    {entry.matches} {t('players.common.matchesShort')}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{entry.matches} partidas</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            {/* Performance indicator */}
            {entry.goals > 0 && entry.matches > 0 && (
              <span className="inline-flex items-center gap-1 text-xs font-medium">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                {(entry.goals / entry.matches).toFixed(2)} g/j
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function PlayerCareerTimeline({ career, maxVisibleItems = 50 }: PlayerCareerTimelineProps) {
  const { t } = useTranslation()
  const [showAll, setShowAll] = useState(false)

  const visibleCareer = useMemo(() => {
    return showAll ? career : career.slice(0, maxVisibleItems)
  }, [career, showAll, maxVisibleItems])

  const hasMore = career.length > maxVisibleItems

  if (career.length === 0) {
    return (
      <EmptyState
        icon={Clock}
        title={t('players.career.emptyTitle')}
        description={t('players.career.emptyDescription')}
      />
    )
  }

  return (
    <div className="space-y-lg">
      <div className="space-y-md">
        {visibleCareer.map((entry, index) => {
          const competitionType = getCompetitionType(entry.competition)
          const colors = COMPETITION_COLORS[competitionType]

          return (
            <TimelineEntry
              key={`${entry.club_slug ?? entry.club}-${entry.joined}-${index}`}
              entry={entry}
              index={index}
              total={visibleCareer.length}
              colors={colors}
            />
          )
        })}
      </div>

      {/* Show more button */}
      {hasMore && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="w-full rounded-lg border border-primary/30 py-md text-sm font-medium text-primary transition-colors hover:bg-primary/5"
        >
          {showAll ? `← Mostrar menos (${maxVisibleItems} de ${career.length})` : `Ver mais (${career.length - maxVisibleItems} restantes)`}
        </button>
      )}

      {/* Statistics footer */}
      {career.length > 0 && (
        <div className="rounded-lg bg-surface-container/50 p-md">
          <div className="grid grid-cols-2 gap-md sm:grid-cols-4 text-center">
            <div>
              <p className="text-xs text-on-surface-variant">Clubes</p>
              <p className="text-lg font-semibold text-on-surface">{career.length}</p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Total de Golos</p>
              <p className="text-lg font-semibold text-amber-600">
                {career.reduce((sum, e) => sum + (e.goals || 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Total de Assistências</p>
              <p className="text-lg font-semibold text-emerald-600">
                {career.reduce((sum, e) => sum + (e.assists || 0), 0)}
              </p>
            </div>
            <div>
              <p className="text-xs text-on-surface-variant">Partidas</p>
              <p className="text-lg font-semibold text-blue-600">
                {career.reduce((sum, e) => sum + (e.matches || 0), 0)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
