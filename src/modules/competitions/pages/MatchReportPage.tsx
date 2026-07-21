import { useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  FileText,
  Clock,
  Zap,
  Target,
  Shield,
  Activity,
  Loader2,
  AlertCircle,
  Download,
  Printer,
  TrendingUp,
} from 'lucide-react'
import { Badge, Button, Card } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches } from '../hooks/useCompetitionPhase3'
import { useMatchReport, useAddGoal } from '../hooks/useCompetitionAdvanced'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import type { Match, Goal, MatchStats, GoalType } from '../types'

// ─── Goal Type Config ─────────────────────────────────────────────────────────

const GOAL_TYPE_CONFIG: Record<
  GoalType,
  { label: string; icon: React.ComponentType<any>; color: string }
> = {
  normal: { label: 'Normal', icon: Zap, color: '#10b981' },
  penalty: { label: 'Penálti', icon: Target, color: '#3b82f6' },
  own_goal: { label: 'Auto-Golo', icon: AlertCircle, color: '#ef4444' },
}

// ─── Stat Bar ─────────────────────────────────────────────────────────────────

interface StatBarProps {
  label: string
  homeValue: number
  awayValue: number
  max?: number
  format?: (v: number) => string
}

function StatBar({ label, homeValue, awayValue, max, format }: StatBarProps) {
  const total = max || homeValue + awayValue || 1
  const homePercent = (homeValue / total) * 100
  const awayPercent = (awayValue / total) * 100

  return (
    <div className="space-y-xs">
      <div className="flex items-center justify-between text-sm">
        <span className="font-semibold text-on-surface">
          {format ? format(homeValue) : homeValue}
        </span>
        <span className="text-on-surface-variant">{label}</span>
        <span className="font-semibold text-on-surface">
          {format ? format(awayValue) : awayValue}
        </span>
      </div>
      <div className="flex h-2 overflow-hidden rounded-full bg-surface-container-high">
        <div
          className="bg-primary transition-all"
          style={{ width: `${homePercent}%` }}
        />
        <div
          className="bg-surface-container-high"
          style={{ width: `${1}%` }}
        />
        <div
          className="bg-error/60 transition-all"
          style={{ width: `${awayPercent}%` }}
        />
      </div>
    </div>
  )
}

// ─── Goal Event Card ──────────────────────────────────────────────────────────

function GoalCard({ goal, isHome }: { goal: Goal; isHome: boolean }) {
  const config = GOAL_TYPE_CONFIG[goal.goal_type] || GOAL_TYPE_CONFIG.normal
  const Icon = config.icon

  return (
    <div
      className={`flex items-center gap-sm rounded-lg border border-outline-variant/20 bg-surface-container p-md ${
        isHome ? '' : 'flex-row-reverse'
      }`}
    >
      <div
        className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full"
        style={{ backgroundColor: `${config.color}20` }}
      >
        <Icon className="h-4 w-4" style={{ color: config.color }} />
      </div>
      <div className={`flex flex-1 flex-col ${isHome ? 'text-left' : 'text-right'}`}>
        <span className="text-sm font-semibold text-on-surface">{goal.player_name}</span>
        <div className="flex items-center gap-xs text-xs text-on-surface-variant">
          <span>
            {goal.minute}&apos;
          </span>
          <span>•</span>
          <span>{config.label}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Match Stats Section ──────────────────────────────────────────────────────

interface MatchStatsSectionProps {
  homeStats: MatchStats | null | undefined
  awayStats: MatchStats | null | undefined
  homeClubName: string
  awayClubName: string
}

function MatchStatsSection({
  homeStats,
  awayStats,
  homeClubName,
  awayClubName,
}: MatchStatsSectionProps) {
  if (!homeStats && !awayStats) {
    return (
      <Card variant="flat" padding="lg">
        <div className="flex flex-col items-center gap-sm py-lg text-center">
          <Activity className="h-10 w-10 text-on-surface-variant/30" />
          <p className="font-medium text-on-surface-variant">Estatísticas não disponíveis</p>
          <p className="text-sm text-on-surface-variant/70">
            As estatísticas do jogo serão apresentadas aqui.
          </p>
        </div>
      </Card>
    )
  }

  const stats: Array<{ label: string; home: number; away: number; format?: (v: number) => string }> = [
    { label: 'Posse de Bola', home: homeStats?.possession || 50, away: awayStats?.possession || 50, format: (v) => `${v}%` },
    { label: 'Remates à Baliza', home: homeStats?.shots_on_goal || 0, away: awayStats?.shots_on_goal || 0 },
    { label: 'Remates Fora', home: homeStats?.shots_off_goal || 0, away: awayStats?.shots_off_goal || 0 },
    { label: 'Passes', home: homeStats?.passes || 0, away: awayStats?.passes || 0 },
    { label: 'Precisão de Passes', home: homeStats?.passes_accuracy || 0, away: awayStats?.passes_accuracy || 0, format: (v) => `${v}%` },
    { label: 'Faltas', home: homeStats?.fouls || 0, away: awayStats?.fouls || 0 },
    { label: 'Cartões Amarelos', home: homeStats?.yellow_cards || 0, away: awayStats?.yellow_cards || 0 },
    { label: 'Cartões Vermelhos', home: homeStats?.red_cards || 0, away: awayStats?.red_cards || 0 },
    { label: 'Cantos', home: homeStats?.corner_kicks || 0, away: awayStats?.corner_kicks || 0 },
  ]

  return (
    <Card variant="flat" padding="lg">
      <div className="space-y-md">
        <h3 className="flex items-center gap-sm text-base font-semibold text-on-surface">
          <TrendingUp className="h-4 w-4" />
          Estatísticas do Jogo
        </h3>

        {/* Team headers */}
        <div className="flex items-center justify-between text-sm font-semibold text-on-surface">
          <span>{homeClubName}</span>
          <span>{awayClubName}</span>
        </div>

        {/* Stats */}
        <div className="space-y-md">
          {stats.map((stat) => (
            <StatBar
              key={stat.label}
              label={stat.label}
              homeValue={stat.home}
              awayValue={stat.away}
              format={stat.format}
            />
          ))}
        </div>
      </div>
    </Card>
  )
}

// ─── Add Goal Form ────────────────────────────────────────────────────────────

interface AddGoalFormProps {
  matchId: string
  homeClubId: string
  awayClubId: string
  onSuccess: () => void
  onCancel: () => void
}

function AddGoalForm({ matchId, homeClubId, awayClubId, onSuccess, onCancel }: AddGoalFormProps) {
  const addGoal = useAddGoal(matchId)
  const [clubId, setClubId] = useState(homeClubId)
  const [minute, setMinute] = useState('')
  const [goalType, setGoalType] = useState<GoalType>('normal')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const minuteNum = parseInt(minute, 10)
    if (isNaN(minuteNum) || minuteNum < 0 || minuteNum > 120) return

    addGoal.mutate(
      {
        player_id: '',
        club_id: clubId,
        minute: minuteNum,
        goal_type: goalType,
      },
      {
        onSuccess: () => {
          setMinute('')
          onSuccess()
        },
      }
    )
  }

  return (
    <Card variant="flat" padding="lg">
      <form onSubmit={handleSubmit} className="space-y-md">
        <h3 className="flex items-center gap-sm text-base font-semibold text-on-surface">
          <Zap className="h-4 w-4" />
          Adicionar Golo
        </h3>

        <div className="grid gap-md sm:grid-cols-3">
          <div className="space-y-xs">
            <label htmlFor="club" className="text-sm font-medium text-on-surface-variant">
              Clube
            </label>
            <select
              id="club"
              value={clubId}
              onChange={(e) => setClubId(e.target.value)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface focus:border-primary focus:outline-none"
            >
              <option value={homeClubId}>Casa</option>
              <option value={awayClubId}>Fora</option>
            </select>
          </div>

          <div className="space-y-xs">
            <label htmlFor="minute" className="text-sm font-medium text-on-surface-variant">
              Minuto
            </label>
            <input
              id="minute"
              type="number"
              min="0"
              max="120"
              value={minute}
              onChange={(e) => setMinute(e.target.value)}
              placeholder="45"
              required
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="space-y-xs">
            <label htmlFor="goal-type" className="text-sm font-medium text-on-surface-variant">
              Tipo
            </label>
            <select
              id="goal-type"
              value={goalType}
              onChange={(e) => setGoalType(e.target.value as GoalType)}
              className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface focus:border-primary focus:outline-none"
            >
              <option value="normal">Normal</option>
              <option value="penalty">Penálti</option>
              <option value="own_goal">Auto-Golo</option>
            </select>
          </div>
        </div>

        <div className="flex justify-end gap-sm">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={onCancel}
            disabled={addGoal.isPending}
          >
            Cancelar
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={addGoal.isPending}>
            {addGoal.isPending ? (
              <>
                <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                A guardar...
              </>
            ) : (
              <>
                <Zap className="mr-xs h-4 w-4" />
                Adicionar
              </>
            )}
          </Button>
        </div>
      </form>
    </Card>
  )
}

// ─── MatchReportPage ─────────────────────────────────────────────────────────

export function MatchReportPage() {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''
  const { isAdmin } = useCompetitionAccess()
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  const { isLoading: loadingComp } = useCompetition(competitionId)
  const { data: matches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)
  const { data: report, isLoading: loadingReport } = useMatchReport(matchIdValue)

  const [showAddGoal, setShowAddGoal] = useState(false)

  // Find the specific match
  const match = (matches as Match[]).find((m) => m.id === matchIdValue)
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  if (loadingComp || loadingMatches) {
    const LoadingComponent = () => (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
    if (isDashboard) {
      return (
        <DashboardLayout
          title="Relatório do Jogo"
          subtitle="A carregar..."
          dashboardType="competition"
          sidebarLinks={sidebarLinks}
        >
          <LoadingComponent />
        </DashboardLayout>
      )
    }
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingComponent />
      </div>
    )
  }

  if (!match) {
    const NotFoundComponent = () => (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-md">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="text-lg font-medium text-on-surface">Jogo não encontrado</p>
        <Link to={isDashboard ? competitionRoutes.adminMatchCenter(competitionId, matchIdValue) : competitionRoutes.matchCenter(competitionId, matchIdValue)}>
          <Button variant="secondary" size="sm">
            Voltar ao jogo
          </Button>
        </Link>
      </div>
    )
    if (isDashboard) {
      return (
        <DashboardLayout
          title="Jogo não encontrado"
          dashboardType="competition"
          sidebarLinks={sidebarLinks}
        >
          <NotFoundComponent />
        </DashboardLayout>
      )
    }
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-md bg-background">
        <NotFoundComponent />
      </div>
    )
  }

  const homeGoals = (report?.goals || []).filter((g) => g.club === match.home_club)
  const awayGoals = (report?.goals || []).filter((g) => g.club === match.away_club)

  const pageContent = (
    <>
      {/* Header */}
      <div className="bg-surface-container rounded-xl mb-lg">
        <div className="mx-auto max-w-4xl px-lg py-lg">
          {/* Breadcrumb */}
          <Link
            to={isDashboard ? competitionRoutes.adminMatchCenter(competitionId, matchIdValue) : competitionRoutes.matchCenter(competitionId, matchIdValue)}
            className="mb-md inline-flex items-center gap-xs text-sm text-on-surface-variant hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar ao jogo
          </Link>

          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="flex items-center gap-sm text-xl font-semibold text-on-surface">
                <FileText className="h-5 w-5" />
                Relatório do Jogo
              </h1>
              <p className="mt-xs text-sm text-on-surface-variant">
                {match.home_club_name} vs {match.away_club_name}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-sm">
              <Button variant="secondary" size="sm">
                <Printer className="mr-xs h-4 w-4" />
                Imprimir
              </Button>
              <Button variant="secondary" size="sm">
                <Download className="mr-xs h-4 w-4" />
                PDF
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto max-w-4xl px-lg py-xl">
        {loadingReport ? (
          <div className="flex items-center justify-center py-xl">
            <Loader2 className="h-6 w-6 animate-spin text-primary" />
          </div>
        ) : (
          <div className="space-y-xl">
            {/* Final Score Card */}
            <Card variant="flat" padding="lg">
              <div className="flex flex-col items-center gap-lg py-md">
                <div className="flex items-center gap-lg">
                  {/* Home */}
                  <div className="flex flex-col items-end gap-sm">
                    <span className="text-lg font-bold text-on-surface">{match.home_club_name}</span>
                    <span className="text-5xl font-bold tabular-nums text-primary">
                      {report?.home_score ?? match.home_score ?? 0}
                    </span>
                  </div>

                  {/* VS */}
                  <div className="flex flex-col items-center gap-xs">
                    <Badge variant="secondary">
                      <Clock className="mr-xs h-3 w-3" />
                      {report?.match_duration || 90}&apos;
                    </Badge>
                    <span className="text-2xl font-bold text-on-surface-variant">—</span>
                  </div>

                  {/* Away */}
                  <div className="flex flex-col items-start gap-sm">
                    <span className="text-lg font-bold text-on-surface">{match.away_club_name}</span>
                    <span className="text-5xl font-bold tabular-nums text-error">
                      {report?.away_score ?? match.away_score ?? 0}
                    </span>
                  </div>
                </div>

                {/* Status */}
                {report?.status && (
                  <Badge variant={report.status === 'completed' ? 'success' : 'default'}>
                    {report.status_display || report.status}
                  </Badge>
                )}
              </div>
            </Card>

            {/* Goals Section */}
            <div className="space-y-md">
              <div className="flex items-center justify-between">
                <h2 className="flex items-center gap-sm text-lg font-semibold text-on-surface">
                  <Zap className="h-5 w-5" />
                  Golos
                </h2>
                {isAdmin && !showAddGoal && (
                  <Button variant="primary" size="sm" onClick={() => setShowAddGoal(true)}>
                    <Zap className="mr-xs h-4 w-4" />
                    Adicionar Golo
                  </Button>
                )}
              </div>

              {showAddGoal && isAdmin && (
                <AddGoalForm
                  matchId={matchIdValue}
                  homeClubId={match.home_club}
                  awayClubId={match.away_club}
                  onSuccess={() => setShowAddGoal(false)}
                  onCancel={() => setShowAddGoal(false)}
                />
              )}

              {homeGoals.length === 0 && awayGoals.length === 0 ? (
                <Card variant="flat" padding="lg">
                  <div className="flex flex-col items-center gap-sm py-lg text-center">
                    <Target className="h-10 w-10 text-on-surface-variant/30" />
                    <p className="font-medium text-on-surface-variant">Sem golos registados</p>
                  </div>
                </Card>
              ) : (
                <div className="grid gap-md sm:grid-cols-2">
                  {/* Home Goals */}
                  <div className="space-y-sm">
                    <h3 className="flex items-center gap-xs text-sm font-semibold text-on-surface-variant">
                      <Shield className="h-4 w-4" />
                      {match.home_club_name}
                    </h3>
                    {homeGoals.length > 0 ? (
                      homeGoals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} isHome />
                      ))
                    ) : (
                      <p className="text-sm text-on-surface-variant/70">Sem golos</p>
                    )}
                  </div>

                  {/* Away Goals */}
                  <div className="space-y-sm">
                    <h3 className="flex items-center gap-xs text-sm font-semibold text-on-surface-variant">
                      <Shield className="h-4 w-4" />
                      {match.away_club_name}
                    </h3>
                    {awayGoals.length > 0 ? (
                      awayGoals.map((goal) => (
                        <GoalCard key={goal.id} goal={goal} isHome={false} />
                      ))
                    ) : (
                      <p className="text-sm text-on-surface-variant/70">Sem golos</p>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Match Statistics */}
            <MatchStatsSection
              homeStats={report?.home_stats}
              awayStats={report?.away_stats}
              homeClubName={match.home_club_name}
              awayClubName={match.away_club_name}
            />
          </div>
        )}
      </div>
    </>
  )

  if (isDashboard) {
    return (
      <DashboardLayout
        title="Relatório do Jogo"
        subtitle={`${match.home_club_name} vs ${match.away_club_name}`}
        dashboardType="competition"
        sidebarLinks={sidebarLinks}
      >
        {pageContent}
      </DashboardLayout>
    )
  }

  return <div className="min-h-screen bg-background">{pageContent}</div>
}
