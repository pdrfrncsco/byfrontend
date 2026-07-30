import { useState, Suspense, lazy } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
  ArrowLeft,
  Users,
  Activity,
  BarChart3,
  FileText,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuth } from '@/app/providers'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionMatches } from '../hooks/useCompetitionMatches'
import { useMatchLive } from '../hooks/useMatchLive'
import { useMatchStats } from '../hooks/useMatchStats'
import { useCompetitionMatchEvents } from '../hooks/useMatchCenter'
import type { Match } from '../types'
import { MatchScoreboard, MatchTimeline, MatchStatsPanel } from '../components'

// Lazy load heavier components
const MatchLineupPage = lazy(() => import('./MatchLineupPage').then(m => ({ default: m.MatchLineupPage })))
const MatchReportPage = lazy(() => import('./MatchReportPage').then(m => ({ default: m.MatchReportPage })))

// ─── Tab Configuration ───────────────────────────────────────────────────────

type TabId = 'lineup' | 'events' | 'stats' | 'report'

interface TabConfig {
  id: TabId
  label: string
  icon: typeof Activity
  roles: string[] // '*' means all roles
}

const TABS: TabConfig[] = [
  { id: 'lineup', label: 'Escalação', icon: Users, roles: ['*'] },
  { id: 'events', label: 'Eventos', icon: Activity, roles: ['*'] },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3, roles: ['*'] },
  { id: 'report', label: 'Relatório', icon: FileText, roles: ['referee', 'org_admin', 'delegate', 'owner', 'admin'] },
]

// Helper to check if user has required role
function hasRequiredRole(userRoles: string[], requiredRoles: string[]): boolean {
  if (requiredRoles.includes('*')) return true
  return userRoles.some(role => requiredRoles.includes(role))
}

// ─── Match Detail Page (Hub Unificado) ───────────────────────────────────────

export function MatchDetailPage() {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''
  const { user } = useAuth()
  const userRoles = [...(user?.roles ?? []), user?.role ?? ''].filter(Boolean) as string[]
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  // Guard: redirect if no matchId or competitionId
  if (!matchId || !compId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-md bg-background">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="text-lg font-medium text-on-surface">ID do jogo não especificado</p>
        <Link to="/competitions">
          <Button variant="secondary" size="sm">
            Voltar às competições
          </Button>
        </Link>
      </div>
    )
  }

  // Determine initial tab from URL or state
  const getInitialTab = (): TabId => {
    if (location.pathname.includes('/lineup')) return 'lineup'
    if (location.pathname.includes('/events')) return 'events'
    if (location.pathname.includes('/stats')) return 'stats'
    if (location.pathname.includes('/report')) return 'report'
    return 'events'
  }

  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab)

  // Data fetching
  const { isLoading: loadingComp } = useCompetition(competitionId)
  const { data: matches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)

  // Find the specific match
  const match = (matches as Match[]).find((m) => m.id === matchIdValue)

  // Live state for scoreboard
  const liveState = useMatchLive({
    competitionId,
    matchId: matchIdValue,
    initialMatch: match,
  })

  // Events for timeline
  const { data: events = [], isLoading: loadingEvents } = useCompetitionMatchEvents(competitionId, matchIdValue)

  // Stats
  const { stats, isLoading: loadingStats } = useMatchStats({
    matchId: matchIdValue,
    homeTeamId: match?.home_club ?? '',
    awayTeamId: match?.away_club ?? '',
    isLive: match?.status === 'live' || match?.status === 'halftime',
  })

  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loadingComp || loadingMatches) {
    const LoadingComponent = () => (
      <div className="flex min-h-[40vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
    if (isDashboard) {
      return (
        <DashboardLayout
          title="Jogo"
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

  // ─── Not Found State ────────────────────────────────────────────────────

  if (!match) {
    const NotFoundComponent = () => (
      <div className="flex min-h-[40vh] flex-col items-center justify-center gap-md">
        <AlertCircle className="h-12 w-12 text-error opacity-70" />
        <p className="text-lg font-medium text-on-surface">Jogo não encontrado</p>
        <Link to={isDashboard ? competitionRoutes.adminDashboard(competitionId) : competitionRoutes.detail(competitionId)}>
          <Button variant="secondary" size="sm">
            Voltar à competição
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

  // ─── Tab Content Renderer ───────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      case 'lineup':
        return (
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <MatchLineupPage />
          </Suspense>
        )

      case 'events':
        return (
          <div className="space-y-lg">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-sm text-lg font-semibold text-on-surface">
                <Activity className="h-5 w-5" />
                Cronologia de Eventos
              </h2>
              {(liveState.isLive || liveState.isHalftime) && (
                <span className="inline-flex items-center gap-xs text-xs font-medium text-emerald-600" aria-live="polite">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                  {liveState.isHalftime ? 'Intervalo' : 'A actualizar'}
                </span>
              )}
            </div>
            <MatchTimeline
              events={liveState.events.length > 0 ? liveState.events : events}
              match={liveState.match ?? match}
              isLoading={loadingEvents}
            />
          </div>
        )

      case 'stats':
        return (
          <MatchStatsPanel
            stats={stats}
            homeName={match.home_club_name}
            awayName={match.away_club_name}
            isLoading={loadingStats}
          />
        )

      case 'report':
        return (
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <MatchReportPage />
          </Suspense>
        )

      default:
        return null
    }
  }

  // ─── Page Content ───────────────────────────────────────────────────────

  const pageContent = (
    <>
      {/* Header with Scoreboard */}
      <div className="bg-surface-container rounded-xl mb-lg">
        <div className="mx-auto max-w-4xl px-lg py-lg">
          {/* Breadcrumb */}
          <Link
            to={isDashboard ? competitionRoutes.adminDashboard(competitionId) : competitionRoutes.detail(competitionId)}
            className="mb-md inline-flex items-center gap-xs text-sm text-on-surface-variant hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Voltar à competição
          </Link>

          {/* Scoreboard */}
          <MatchScoreboard match={liveState.match ?? match} />

          {/* Live indicator */}
          {liveState.lastUpdated && (liveState.isLive || liveState.isHalftime) && (
            <div className="mt-sm flex justify-center">
              <span className="text-xs text-on-surface-variant" title={liveState.lastUpdated.toLocaleString('pt-PT')}>
                Última actualização: {liveState.lastUpdated.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="mx-auto max-w-4xl px-lg">
        <div className="flex flex-wrap gap-xs border-b border-outline-variant/20" role="tablist" aria-label="Conteúdo da partida">
          {TABS.map((tab) => {
            // Check role access
            const hasAccess = hasRequiredRole(userRoles, tab.roles)
            if (!hasAccess) return null

            const isActive = activeTab === tab.id
            const Icon = tab.icon

            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-xs border-b-2 px-md py-sm text-sm font-semibold transition-colors ${
                  isActive
                    ? 'border-primary text-primary'
                    : 'border-transparent text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon className="h-4 w-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tab Content */}
      <div className="mx-auto max-w-4xl px-lg py-xl">
        <Suspense
          fallback={
            <div className="flex items-center justify-center py-xl">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          }
        >
          {renderTabContent()}
        </Suspense>
      </div>
    </>
  )

  // ─── Layout Wrapper ─────────────────────────────────────────────────────

  if (isDashboard) {
    return (
      <DashboardLayout
        title={`${match.home_club_name} vs ${match.away_club_name}`}
        subtitle={`Jornada ${match.round_number}`}
        dashboardType="competition"
        sidebarLinks={sidebarLinks}
      >
        {pageContent}
      </DashboardLayout>
    )
  }

  return <div className="min-h-screen bg-background">{pageContent}</div>
}
