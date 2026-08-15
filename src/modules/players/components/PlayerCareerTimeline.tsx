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
    bg: 'bg-blue-50 dark:bg-blue-950',
    border: 'border-blue-200 dark:border-blue-800',
    dot: 'bg-blue-500',
    text: 'text-blue-700 dark:text-blue-300',
  },
  'cup': {
    bg: 'bg-amber-50 dark:bg-amber-950',
    border: 'border-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500',
    text: 'text-amber-700 dark:text-amber-300',
  },
  'european': {
    bg: 'bg-purple-50 dark:bg-purple-950',
    border: 'border-purple-200 dark:border-purple-800',
    dot: 'bg-purple-500',
    text: 'text-purple-700 dark:text-purple-300',
  },
  'international': {
    bg: 'bg-green-50 dark:bg-green-950',
    border: 'border-green-200 dark:border-green-800',
    dot: 'bg-green-500',
    text: 'text-green-700 dark:text-green-300',
  },
  'other': {
    bg: 'bg-gray-50 dark:bg-gray-950',
    border: 'border-gray-200 dark:border-gray-800',
    dot: 'bg-gray-500',
    text: 'text-gray-700 dark:text-gray-300',
  },
}

// Status to badge color
const STATUS_COLORS: Record<string, string> = {
  'active': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  'loaned': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  'transferred': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  'retired': 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200',
  'inactive': 'bg-slate-100 text-slate-800 dark:bg-slate-900 dark:text-slate-200',
}

function getCompetitionType(competition?: string): string {
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
            <Link
              to={`/clubs/${entry.club_slug}`}
              className="font-semibold text-on-surface transition-colors hover:text-primary"
            >
              {entry.club}
            </Link>
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
              key={`${entry.club_slug}-${entry.joined}-${index}`}
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
