import { useState, useEffect, Suspense, lazy } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
  Users,
  Activity,
  BarChart3,
  FileText,
  LayoutDashboard,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuth } from '@/app/providers'
import { PublicDetailPageShell } from '@/modules/shared/components'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { useMatchDetail } from '../hooks/useMatchDetail'
import { useMatchLive } from '../hooks/useMatchLive'
import { useMatchStats } from '../hooks/useMatchStats'
import { matchApi } from '../services/match.api'
import { toast } from 'sonner'
import { useSeo } from '@/hooks/useSeo'
import type { Match } from '../types'
import { MatchStatsPanel, MatchCountdown, MatchClockControls, MatchDetailHeader, MatchSummaryStrip, MatchOverviewPanel, MatchEventCenter, MatchStatsWorkspace } from '../components'
import type { ReactNode } from 'react'

// Lazy load heavier components
const MatchLineupPage = lazy(() => import('./MatchLineupPage').then(m => ({ default: m.MatchLineupPage })))
const MatchReportPage = lazy(() => import('./MatchReportPage').then(m => ({ default: m.MatchReportPage })))

// ─── Tab Configuration ───────────────────────────────────────────────────────

type TabId = 'overview' | 'lineup' | 'events' | 'stats' | 'report'

interface TabConfig {
  id: TabId
  label: string
  icon: typeof Activity
  roles: string[] // '*' means all roles
}

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Resumo', icon: LayoutDashboard, roles: ['*'] },
  { id: 'lineup', label: 'Escalação', icon: Users, roles: ['*'] },
  { id: 'events', label: 'Eventos', icon: Activity, roles: ['*'] },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3, roles: ['*'] },
  { id: 'report', label: 'Relatório', icon: FileText, roles: ['referee', 'match_referee', 'manager', 'org_admin', 'delegate', 'owner', 'admin'] },
]

// Helper to check if user has required role
function hasRequiredRole(userRoles: string[], requiredRoles: string[]): boolean {
  if (requiredRoles.includes('*')) return true
  return userRoles.some(role => requiredRoles.includes(role))
}

function ArchiveMatchButton({ matchId, onArchived }: { matchId: string; onArchived?: () => void }) {
  const [isArchiving, setIsArchiving] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleArchive = async () => {
    try {
      setIsArchiving(true)
      await matchApi.transition(matchId, 'archived')
      toast.success('Partida arquivada.')
      setConfirmOpen(false)
      onArchived?.()
    } catch (err: any) {
      toast.error('Não foi possível arquivar a partida: ' + (err?.message || String(err)))
    } finally {
      setIsArchiving(false)
    }
  }

  return (
    <>
      <Button variant="secondary" size="sm" onClick={() => setConfirmOpen(true)} disabled={isArchiving}>
        Arquivar partida
      </Button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-display text-lg font-bold text-on-surface">Arquivar Partida</h3>
            <p className="mt-sm text-sm text-on-surface-variant">
              Tem a certeza de que deseja arquivar esta partida? O resultado ficará disponível apenas como histórico imutável.
            </p>
            <div className="mt-lg flex items-center justify-end gap-sm">
              <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={isArchiving}>
                Cancelar
              </Button>
              <Button variant="danger" size="sm" onClick={handleArchive} loading={isArchiving}>
                Confirmar Arquivo
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// Small start-match button component (keeps page code focused)
function StartMatchButton({
  competitionId: _competitionId,
  matchId,
  currentStatus,
  onStarted,
}: {
  competitionId: string
  matchId: string
  currentStatus: 'scheduled' | 'pre_match'
  onStarted?: () => void
}) {
  const [isStarting, setIsStarting] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const isScheduled = currentStatus === 'scheduled'
  const nextStatus = isScheduled ? 'pre_match' : 'live'
  const dialogTitle = isScheduled ? 'Abrir Pré-Jogo' : 'Iniciar Partida ao Vivo'
  const dialogMessage = isScheduled
    ? 'Deseja abrir o pré-jogo e libertar a preparação das escalações para os clubes?'
    : 'Confirma iniciar a partida? Esta ação mudará o estado para "live" e libertará o registo de eventos em tempo real.'

  const handleStart = async () => {
    try {
      setIsStarting(true)
      await matchApi.transition(
        matchId,
        nextStatus,
        nextStatus === 'live' ? { currentPeriod: 'first_half', currentMinute: 0 } : undefined
      )
      toast.success(
        nextStatus === 'live'
          ? 'Partida iniciada. Eventos ao vivo podem agora ser registados.'
          : 'Pré-jogo aberto para submissão das escalações.'
      )
      setConfirmOpen(false)
      onStarted?.()
    } catch (err: any) {
      console.error(err)
      toast.error('Erro ao iniciar a partida: ' + (err?.message || String(err)))
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <>
      <Button
        variant="primary"
        size="sm"
        onClick={() => setConfirmOpen(true)}
        disabled={isStarting}
      >
        {isScheduled ? 'Abrir pré-jogo' : 'Iniciar partida'}
      </Button>

      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-md" role="dialog" aria-modal="true">
          <div className="relative w-full max-w-md rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <h3 className="font-display text-lg font-bold text-on-surface">{dialogTitle}</h3>
            <p className="mt-sm text-sm text-on-surface-variant leading-relaxed">
              {dialogMessage}
            </p>
            <div className="mt-lg flex items-center justify-end gap-sm">
              <Button variant="outline" size="sm" onClick={() => setConfirmOpen(false)} disabled={isStarting}>
                Cancelar
              </Button>
              <Button variant="primary" size="sm" onClick={handleStart} loading={isStarting}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

// ─── Match Detail Page (Hub Unificado) ───────────────────────────────────────

export function MatchDetailPage() {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''
  const { user } = useAuth()
  const { isAdmin, isMatchOperator } = useCompetitionAccess()
  const userRoles = [...(user?.roles ?? []), user?.role ?? ''].filter(Boolean) as string[]
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')
  const [isOnline, setIsOnline] = useState(() => typeof navigator === 'undefined' ? true : navigator.onLine)

  useEffect(() => {
    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  // Determine initial tab from URL or state
  const getInitialTab = (): TabId => {
    if (location.pathname.includes('/lineup')) return 'lineup'
    if (location.pathname.includes('/events')) return 'events'
    if (location.pathname.includes('/stats')) return 'stats'
    if (location.pathname.includes('/report')) return 'report'
    return 'overview'
  }

  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab)

  // Data fetching (hooks must be called unconditionally to preserve hook order)
  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: match, isLoading: loadingMatch } = useMatchDetail(competitionId, matchIdValue)
  useSeo({
    title: match ? `${match.home_club_name} vs ${match.away_club_name} — Partida` : 'Detalhe da partida',
    description: 'Acompanhe o placar, eventos, escalações e estatísticas desta partida.',
    path: `/competitions/${competitionId}/matches/${matchIdValue}`,
  })

  // Live state for scoreboard
  const liveState = useMatchLive({
    competitionId,
    matchId: matchIdValue,
    initialMatch: match,
  })

  // Stats
  const { stats, isLoading: loadingStats, isUpdating: updatingStats, updateStats } = useMatchStats({
    matchId: matchIdValue,
    homeTeamId: match?.home_club ?? '',
    awayTeamId: match?.away_club ?? '',
    isLive: match?.status === 'live' || match?.status === 'halftime',
  })

  const sidebarLinks = getCompetitionSidebarLinks(competitionId)
  const competitionConfig = (competition as any)?.config ?? {}
  const extraTimeAllowed = Boolean(competitionConfig.extraTimeOnDraw || competitionConfig.knockoutStage?.extraTimeOnDraw)
  const penaltiesAllowed = Boolean(competitionConfig.penaltiesOnDraw || competitionConfig.knockoutStage?.penaltiesOnDraw)

  // Guard: redirect if no matchId or competitionId (hooks above are safe due to enabled flags)
  if (!matchId || !compId) {
    return (
      <div className="min-h-screen bg-background">
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-lg py-sm flex items-center gap-xs text-sm text-on-surface-variant">
          <Link to={competitionRoutes.detail(competitionId)} className="hover:text-primary">Competição</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-on-surface">Partida</span>
        </nav>
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-md">
          <AlertCircle className="h-12 w-12 text-error opacity-70" />
          <p className="text-lg font-medium text-on-surface">ID do jogo não especificado</p>
          <Link to="/competitions">
            <Button variant="secondary" size="sm">
              Voltar às competições
            </Button>
          </Link>
        </div>
      </div>
    )
  }

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loadingComp || loadingMatch) {
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
      <PublicDetailPageShell
        breadcrumb={
          <nav aria-label="Breadcrumb" className="flex items-center gap-xs text-sm text-on-surface-variant">
            <Link to={competitionRoutes.detail(competitionId)} className="hover:text-primary">Competição</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="text-on-surface">A carregar...</span>
          </nav>
        }
      >
        <LoadingComponent />
      </PublicDetailPageShell>
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
      <div className="min-h-screen bg-background">
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-lg py-sm flex items-center gap-xs text-sm text-on-surface-variant">
          <Link to={competitionRoutes.detail(competitionId)} className="hover:text-primary">Competição</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-on-surface">Partida</span>
        </nav>
        <NotFoundComponent />
      </div>
    )
  }

  // ─── Tab Content Renderer ───────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <MatchOverviewPanel
            match={liveState.match ?? match}
            events={liveState.events}
            stats={stats}
            loadingEvents={liveState.isLoading}
            loadingStats={loadingStats}
          />
        )

      case 'lineup':
        return (
          <Suspense
            fallback={
              <div className="flex min-h-[40vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <MatchLineupPage embedded />
          </Suspense>
        )

      case 'events':
        return (
          <MatchEventCenter
            competitionId={competitionId}
            match={liveState.match ?? match}
            events={liveState.events}
            canOperate={isMatchOperator}
            canDelete={isAdmin}
            onChanged={() => liveState.refetch()}
          />
        )

      case 'stats':
        return (
          <MatchStatsWorkspace
            stats={stats}
            homeName={match.home_club_name}
            awayName={match.away_club_name}
            homeTeamId={match.home_club}
            awayTeamId={match.away_club}
            canEdit={isMatchOperator && match.status !== 'archived' && match.status !== 'cancelled'}
            isLoading={loadingStats}
            isUpdating={updatingStats}
            updateStats={updateStats}
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
            <MatchReportPage embedded />
          </Suspense>
        )

      default:
        return null
    }
  }

  // ─── Page Content ───────────────────────────────────────────────────────

  const pageContent = (
    <>
      <MatchDetailHeader
        match={liveState.match ?? match}
        backTo={isDashboard ? competitionRoutes.adminDashboard(competitionId) : competitionRoutes.detail(competitionId)}
      >
        <MatchSummaryStrip
          match={liveState.match ?? match}
          isOnline={isOnline}
          realtimeConnected={liveState.isRealtimeConnected}
          hasError={Boolean(liveState.error)}
          lastUpdated={liveState.lastUpdated}
          onRetry={() => liveState.refetch()}
        />

        <div className="flex flex-wrap justify-center gap-sm" aria-label="Ações da fase da partida">
            {match.status === 'scheduled' && isMatchOperator && (
              <StartMatchButton
                competitionId={competitionId}
                matchId={matchIdValue}
                currentStatus={match.status}
                onStarted={() => liveState.refetch()}
              />
            )}
            <MatchClockControls
              match={liveState.match ?? match}
              canControl={isMatchOperator}
              extraTimeAllowed={extraTimeAllowed}
              penaltiesAllowed={penaltiesAllowed}
              onUpdated={() => liveState.refetch()}
            />
            {match.status === 'pre_match' && isMatchOperator && (
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('lineup')}>
                <Users className="mr-xs h-4 w-4" /> Gerir escalações
              </Button>
            )}
            {(match.status === 'live' || match.status === 'halftime') && isMatchOperator && (
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('events')}>
                <Activity className="mr-xs h-4 w-4" /> Registar evento
              </Button>
            )}
            {match.status === 'finished' && hasRequiredRole(userRoles, ['referee', 'match_referee', 'manager', 'org_admin', 'delegate', 'owner', 'admin']) && (
              <Button variant="secondary" size="sm" onClick={() => setActiveTab('report')}>
                <FileText className="mr-xs h-4 w-4" /> Submeter relatório
              </Button>
            )}
            {match.status === 'finished' && isAdmin && (
              <ArchiveMatchButton matchId={matchIdValue} onArchived={() => liveState.refetch()} />
            )}
            {match.status === 'archived' && (
              <span className="rounded-lg bg-surface-container-high px-sm py-xs text-xs text-on-surface-variant">
                Partida arquivada: edição desativada.
              </span>
            )}
        </div>

        <div className="mt-sm flex justify-center gap-sm">
            <Link to={competitionRoutes.tacticalView(competitionId, matchIdValue)}>
              <Button variant="secondary" size="sm">Vista Táctica</Button>
            </Link>
        </div>

          {/* Countdown — shown when scheduled, auto-refetches on expiry */}
        {(liveState.match ?? match).status === 'scheduled' && ((liveState.match ?? match).scheduledAt || (liveState.match ?? match).match_date) && (
          <div className="mt-sm flex justify-center">
              <MatchCountdown
                scheduledAt={(liveState.match ?? match).scheduledAt ?? (liveState.match ?? match).match_date!}
                onExpire={() => liveState.refetch()}
              />
          </div>
        )}

          {/* Live indicator */}
        {liveState.lastUpdated && (liveState.isLive || liveState.isHalftime) && (
          <div className="mt-sm flex justify-center">
              <span className="text-xs text-on-surface-variant" title={liveState.lastUpdated.toLocaleString('pt-PT')}>
                Última actualização: {liveState.lastUpdated.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
              </span>
          </div>
        )}
      </MatchDetailHeader>

      {/* Tabs Navigation */}
      <div className="mx-auto max-w-4xl px-lg">
        <div className="flex gap-0 border-b border-outline-variant/20 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Conteúdo da partida">
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
                className={`group relative flex items-center gap-2 px-4 py-2.5 text-sm font-medium transition-colors whitespace-nowrap ${
                  isActive
                    ? 'text-primary font-semibold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                {isActive && (
                  <span className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full bg-primary" />
                )}
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

  return (
    <div className="min-h-screen bg-background pb-2xl">
      <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-lg py-sm flex items-center gap-xs text-sm text-on-surface-variant">
        <Link to={competitionRoutes.list} className="hover:text-primary">Competições</Link>
        <span aria-hidden="true">/</span>
        <Link to={competitionRoutes.detail(competitionId)} className="hover:text-primary">
          {competition?.name ?? 'Competição'}
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="truncate text-on-surface font-medium">
          {match.home_club_name} vs {match.away_club_name}
        </span>
      </nav>
      <main aria-label="Detalhe da partida">{pageContent}</main>
    </div>
  )
}
