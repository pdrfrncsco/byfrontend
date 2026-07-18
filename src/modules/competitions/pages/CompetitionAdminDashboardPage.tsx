import { Link, useParams } from 'react-router-dom'
import {
  Calendar,
  CheckCircle2,
  ExternalLink,
  Loader2,
  RefreshCw,
  Settings,
  Shield,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { useTopScorers, useFairPlayRanking, useSuspensions, useRecalculateRankings } from '../hooks/useCompetitionAdvanced'
import { useCompetitionStandings } from '../hooks/useCompetitionPhase3'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import type { Suspension } from '../types'

// ─── KPI Card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string
  value: string | number
  icon: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'danger'
}

function StatCard({ label, value, icon, variant = 'default' }: StatCardProps) {
  const colorMap = {
    default: 'bg-primary/10 text-primary',
    success: 'bg-emerald-500/10 text-emerald-600',
    warning: 'bg-amber-500/10 text-amber-600',
    danger: 'bg-red-500/10 text-red-600',
  }
  return (
    <div className="flex items-center gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md">
      <div className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${colorMap[variant]}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-on-surface-variant">{label}</p>
        <p className="text-xl font-bold text-on-surface">{value}</p>
      </div>
    </div>
  )
}

// ─── Quick Action Button ───────────────────────────────────────────────────────

interface QuickActionProps {
  label: string
  description: string
  href: string
  icon: React.ReactNode
}

function QuickAction({ label, description, href, icon }: QuickActionProps) {
  return (
    <Link
      to={href}
      className="group flex items-center gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-all hover:border-primary/40 hover:bg-surface-container-high"
    >
      <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-on-primary">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-on-surface">{label}</p>
        <p className="text-xs text-on-surface-variant">{description}</p>
      </div>
    </Link>
  )
}

// ─── CompetitionAdminDashboardPage ────────────────────────────────────────────

/**
 * CompetitionAdminDashboardPage — per-competition admin panel.
 * Shows KPIs (clubs, standings, active suspensions), top scorer preview,
 * and quick access to all admin operations.
 */
export function CompetitionAdminDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)
  const { isAdmin } = useCompetitionAccess()

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(competitionId)
  const { data: topScorers = [], isLoading: loadingScorers } = useTopScorers(competitionId)
  const { data: suspensions = [] } = useSuspensions(competitionId)
  const { data: fairPlay = [] } = useFairPlayRanking(competitionId)
  const recalculate = useRecalculateRankings(competitionId)

  const activeSuspensions = (suspensions as Suspension[]).filter(s => s.is_active)
  const clubsCount = standings.length
  const leader = standings[0]
  const topScorer = topScorers[0]

  const statusConfig: Record<string, { label: string; variant: 'success' | 'warning' | 'default' }> = {
    active: { label: 'Em Curso', variant: 'success' },
    draft: { label: 'Rascunho', variant: 'warning' },
    completed: { label: 'Concluída', variant: 'default' },
  }
  const competitionStatus = competition?.status
    ? (statusConfig[competition.status] ?? { label: competition.status, variant: 'default' })
    : null

  return (
    <DashboardLayout
      title={
        loadingComp
          ? 'Painel da Competição'
          : (competition?.name ?? 'Painel da Competição')
      }
      subtitle={
        loadingComp
          ? 'A carregar dados...'
          : competition
            ? `${competition.season} • Visão geral administrativa`
            : 'Painel administrativo da competição'
      }
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={
        <div className="flex items-center gap-sm">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => recalculate.mutate()}
              disabled={recalculate.isPending}
              id="recalculate-rankings-btn"
            >
              {recalculate.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Recalcular</span>
            </Button>
          )}
          <Button asChild variant="secondary" size="sm">
            <Link to={competitionRoutes.detail(competitionId)}>
              <ExternalLink className="h-4 w-4" />
              <span>Página Pública</span>
            </Link>
          </Button>
        </div>
      }
    >
      {/* Status + Competition Info */}
      {competition && (
        <div className="mb-lg flex flex-wrap items-center gap-sm rounded-xl border border-outline-variant/20 bg-surface-container p-md">
          <div className="flex items-center gap-sm">
            <Trophy className="h-5 w-5 text-primary" />
            <span className="font-semibold text-on-surface">{competition.name}</span>
            {competitionStatus && (
              <Badge variant={competitionStatus.variant}>{competitionStatus.label}</Badge>
            )}
          </div>
          <span className="ml-auto text-xs text-on-surface-variant">
            Época: <strong className="text-on-surface">{competition.season}</strong>
          </span>
        </div>
      )}

      {/* ── KPI Grid ───────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-2 gap-md sm:grid-cols-4">
        <StatCard
          label="Clubes Inscritos"
          value={loadingStandings ? '…' : clubsCount}
          icon={<Shield className="h-5 w-5" />}
          variant="default"
        />
        <StatCard
          label="Suspensões Ativas"
          value={activeSuspensions.length}
          icon={<Users className="h-5 w-5" />}
          variant={activeSuspensions.length > 0 ? 'danger' : 'success'}
        />
        <StatCard
          label="Classificações Fair Play"
          value={fairPlay.length}
          icon={<CheckCircle2 className="h-5 w-5" />}
          variant="success"
        />
        <StatCard
          label="Top Marcadores"
          value={loadingScorers ? '…' : topScorers.length}
          icon={<Target className="h-5 w-5" />}
          variant="default"
        />
      </div>

      <div className="mt-lg grid grid-cols-1 gap-lg lg:grid-cols-12">

        {/* ── Standings Preview ──────────────────────────────────────────────── */}
        <Card variant="flat" padding="none" className="lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-sm">
            <CardTitle className="flex items-center gap-sm">
              <Trophy className="h-4 w-4 text-primary" />
              Classificação
            </CardTitle>
            <Button asChild variant="link" size="sm" className="text-xs">
              <Link to={competitionRoutes.adminRankings(competitionId)}>Ver todos</Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {loadingStandings ? (
              <div className="space-y-xs p-md">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-10 animate-pulse rounded-lg bg-surface-container-high" />
                ))}
              </div>
            ) : standings.length === 0 ? (
              <div className="flex flex-col items-center gap-sm py-xl text-on-surface-variant">
                <Trophy className="h-10 w-10 opacity-20" />
                <p className="text-sm">Sem jogos realizados ainda.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-outline-variant/20 bg-surface-container-high text-xs">
                      <th className="w-8 px-md py-sm text-center font-semibold text-on-surface-variant">#</th>
                      <th className="px-md py-sm text-left font-semibold text-on-surface-variant">Clube</th>
                      <th className="w-10 px-sm py-sm text-center font-semibold text-on-surface-variant">J</th>
                      <th className="w-10 px-sm py-sm text-center font-semibold text-on-surface-variant">V</th>
                      <th className="w-10 px-sm py-sm text-center font-semibold text-on-surface-variant">D</th>
                      <th className="w-10 px-sm py-sm text-center font-bold text-on-surface">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.slice(0, 6).map((s, idx) => (
                      <tr
                        key={s.id ?? idx}
                        className={`border-b border-outline-variant/10 transition-colors last:border-0 hover:bg-surface-container-high/50 ${idx === 0 ? 'bg-primary/5' : ''}`}
                      >
                        <td className="px-md py-sm text-center text-xs font-semibold text-on-surface-variant">{idx + 1}</td>
                        <td className="px-md py-sm font-medium text-on-surface">{s.club_name}</td>
                        <td className="px-sm py-sm text-center text-xs text-on-surface-variant">{s.played}</td>
                        <td className="px-sm py-sm text-center text-xs text-emerald-600">{s.won}</td>
                        <td className="px-sm py-sm text-center text-xs text-red-500">{s.lost}</td>
                        <td className="px-sm py-sm text-center">
                          <span className="rounded-md bg-primary/10 px-sm py-xs text-xs font-bold text-primary">{s.points}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* ── Right Column ──────────────────────────────────────────────────── */}
        <div className="flex flex-col gap-lg lg:col-span-5">

          {/* Quick Actions */}
          <Card variant="flat" padding="md">
            <CardHeader className="pb-sm">
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-sm">
              <QuickAction
                label="Configurações"
                description="Editar dados e estado da competição"
                href={competitionRoutes.settings(competitionId)}
                icon={<Settings className="h-4 w-4" />}
              />
              <QuickAction
                label="Inscrições de Clubes"
                description="Gerir clubes inscritos"
                href={competitionRoutes.registration(competitionId)}
                icon={<Shield className="h-4 w-4" />}
              />
              <QuickAction
                label="Calendário de Jogos"
                description="Gerar e gerir partidas"
                href={competitionRoutes.schedule(competitionId)}
                icon={<Calendar className="h-4 w-4" />}
              />
              <QuickAction
                label="Suspensões"
                description={activeSuspensions.length > 0 ? `${activeSuspensions.length} suspensão(ões) ativas` : 'Gerir suspensões de jogadores'}
                href={competitionRoutes.adminSuspensions(competitionId)}
                icon={<Users className="h-4 w-4" />}
              />
            </CardContent>
          </Card>

          {/* Top Scorer Highlight */}
          {!loadingScorers && topScorer && (
            <Card variant="flat" padding="md">
              <CardHeader className="pb-sm">
                <CardTitle className="flex items-center gap-sm">
                  <Target className="h-4 w-4 text-primary" />
                  Melhor Marcador
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-md">
                  <div>
                    <p className="font-semibold text-on-surface">{topScorer.player_name}</p>
                    <p className="text-xs text-on-surface-variant">{topScorer.club_name}</p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <span className="text-lg font-bold text-primary">{topScorer.goals}</span>
                  </div>
                </div>
                <Button asChild variant="link" size="sm" className="mt-sm text-xs p-0">
                  <Link to={competitionRoutes.adminRankings(competitionId)}>
                    Ver todos os marcadores →
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Leader Highlight */}
          {!loadingStandings && leader && (
            <Card variant="flat" padding="md">
              <CardHeader className="pb-sm">
                <CardTitle className="flex items-center gap-sm">
                  <Trophy className="h-4 w-4 text-amber-500" />
                  Líder da Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between gap-md">
                  <div>
                    <p className="font-semibold text-on-surface">{leader.club_name}</p>
                    <p className="text-xs text-on-surface-variant">
                      {leader.played} jogos • {leader.won}V {leader.drawn}E {leader.lost}D
                    </p>
                  </div>
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-500/10">
                    <span className="text-lg font-bold text-amber-600">{leader.points}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
