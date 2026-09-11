import { useState, useEffect, Suspense, lazy } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import {
  Users,
  BarChart3,
  FileText,
  LayoutDashboard,
  Loader2,
  AlertCircle,
  Calendar,
  MapPin,
  Trophy,
  Shield,
  UserCheck,
  Activity,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useAuth } from '@/app/providers'
import { PublicDetailPageShell } from '@/modules/shared/components'
import {
  SportDetailLayout,
  SportSidebar,
  SportSidebarCard,
  SportTabs,
  SportTabsList,
  SportTabsTrigger,
  SportTabsContent,
} from '@/modules/shared/components/sport'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionStandings } from '../hooks/useCompetitionMatches'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { useMatchDetail } from '../hooks/useMatchDetail'
import { useMatchLive } from '../hooks/useMatchLive'
import { useMatchStats } from '../hooks/useMatchStats'
import { useLineups } from '../hooks/useLineups'
import { matchApi } from '../services/match.api'
import { toast } from 'sonner'
import { useSeo } from '@/hooks/useSeo'
import {
  MatchCountdown,
  MatchClockControls,
  MatchOverviewPanel,
  MatchStatsWorkspace,
  MatchHeroHeader,
  MatchStandingsCard,
  StandingsTable,
} from '../components'

// Lazy load heavier components
const MatchLineupPage = lazy(() => import('./MatchLineupPage').then(m => ({ default: m.MatchLineupPage })))
const MatchReportPage = lazy(() => import('./MatchReportPage').then(m => ({ default: m.MatchReportPage })))

// ─── Tab Configuration ───────────────────────────────────────────────────────

type TabId = 'overview' | 'lineup' | 'stats' | 'standings' | 'h2h' | 'report'

interface TabConfig {
  id: TabId
  label: string
  icon: any
  roles: string[] // '*' means all roles
}

const TABS: TabConfig[] = [
  { id: 'overview', label: 'Resumo', icon: LayoutDashboard, roles: ['*'] },
  { id: 'lineup', label: 'Formações', icon: Users, roles: ['*'] },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3, roles: ['*'] },
  { id: 'standings', label: 'Classificação', icon: Trophy, roles: ['*'] },
  { id: 'h2h', label: 'H2H', icon: Shield, roles: ['*'] },
  { id: 'report', label: 'Relatório', icon: FileText, roles: ['referee', 'match_referee', 'manager', 'org_admin', 'delegate', 'owner', 'admin'] },
]

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
      <Button variant="secondary" size="sm" className="w-full" onClick={() => setConfirmOpen(true)} disabled={isArchiving}>
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
        className="w-full"
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

// ─── Match Detail Page (SofaScore Style) ───────────────────────────────────

export function MatchDetailPage() {
  const { compId, matchId } = useParams<{ compId: string; matchId: string }>()
  const competitionId = compId ?? ''
  const matchIdValue = matchId ?? ''
  const { user } = useAuth()
  const { isAdmin, isMatchOperator } = useCompetitionAccess()
  const userRoles = [...(user?.roles ?? []), user?.role ?? ''].filter(Boolean) as string[]
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  const getInitialTab = (): TabId => {
    if (location.pathname.includes('/lineup')) return 'lineup'
    if (location.pathname.includes('/stats')) return 'stats'
    if (location.pathname.includes('/report')) return 'report'
    return 'overview'
  }

  const [activeTab, setActiveTab] = useState<TabId>(getInitialTab)

  // Data fetching
  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: match, isLoading: loadingMatch } = useMatchDetail(competitionId, matchIdValue)
  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(competitionId)
  const { data: lineups = [] } = useLineups(matchIdValue)

  useSeo({
    title: match ? `${match.home_club_name || match.homeTeamName} vs ${match.away_club_name || match.awayTeamName} — Partida` : 'Detalhe da partida',
    description: 'Acompanhe o placar ao vivo, formações, eventos e estatísticas em estilo SofaScore.',
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
    homeTeamId: match?.home_club ?? match?.homeTeamId ?? '',
    awayTeamId: match?.away_club ?? match?.awayTeamId ?? '',
    isLive: match?.status === 'live' || match?.status === 'halftime',
  })

  const sidebarLinks = getCompetitionSidebarLinks(competitionId)
  const competitionConfig = (competition as any)?.config ?? {}
  const extraTimeAllowed = Boolean(competitionConfig.extraTimeOnDraw || competitionConfig.knockoutStage?.extraTimeOnDraw)
  const penaltiesAllowed = Boolean(competitionConfig.penaltiesOnDraw || competitionConfig.knockoutStage?.penaltiesOnDraw)

  const activeMatch = liveState.match ?? match

  // Coaches extraction from lineups or match
  const homeClubId = activeMatch?.home_club ?? activeMatch?.homeTeamId ?? ''
  const awayClubId = activeMatch?.away_club ?? activeMatch?.awayTeamId ?? ''
  const homeLineupSubmission = lineups.find(l => String(l.club) === String(homeClubId))
  const awayLineupSubmission = lineups.find(l => String(l.club) === String(awayClubId))
  const homeCoach = (homeLineupSubmission as any)?.coach || activeMatch?.homeLineup?.coach || (activeMatch as any)?.home_coach
  const awayCoach = (awayLineupSubmission as any)?.coach || activeMatch?.awayLineup?.coach || (activeMatch as any)?.away_coach

  // Guard: missing ID
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

  // Loading State
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

  // Not Found State
  if (!activeMatch) {
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

  // ─── Render Tab Contents ──────────────────────────────────────────────────

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <MatchOverviewPanel
            match={activeMatch}
            events={liveState.events}
            stats={stats}
            loadingEvents={liveState.isLoading}
            loadingStats={loadingStats}
            onCountdownExpire={() => liveState.refetch()}
          />
        )

      case 'lineup':
        return (
          <Suspense
            fallback={
              <div className="flex min-h-[300px] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            }
          >
            <MatchLineupPage embedded />
          </Suspense>
        )

      case 'stats':
        return (
          <MatchStatsWorkspace
            stats={stats}
            homeName={activeMatch.home_club_name || activeMatch.homeTeamName}
            awayName={activeMatch.away_club_name || activeMatch.awayTeamName}
            homeTeamId={activeMatch.home_club || activeMatch.homeTeamId}
            awayTeamId={activeMatch.away_club || activeMatch.awayTeamId}
            canEdit={isMatchOperator && activeMatch.status !== 'archived' && activeMatch.status !== 'cancelled'}
            isLoading={loadingStats}
            isUpdating={updatingStats}
            updateStats={updateStats}
          />
        )

      case 'standings':
        return (
          <div className="space-y-md">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-on-surface">Tabela Classificativa</h2>
              <Link
                to={competitionRoutes.detail(competitionId)}
                className="inline-flex items-center gap-1 text-xs text-primary hover:underline"
              >
                Ver competição completa <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
            <StandingsTable
              standings={standings}
              qualifyingSpots={(competition?.config as any)?.advancementRule?.qualifyCount ?? 3}
              relegationSpots={(competition?.config as any)?.advancementRule?.relegateCount ?? 0}
              competitionId={competitionId}
            />
          </div>
        )

      case 'h2h':
        return (
          <div className="space-y-lg">
            <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-lg">
              <h3 className="text-sm font-bold text-on-surface mb-sm">Confronto Direto</h3>
              <p className="text-xs text-on-surface-variant leading-relaxed">
                Histórico de confrontos e métricas comparativas entre as equipas nesta competição.
              </p>
              <div className="mt-lg grid grid-cols-2 gap-md text-center">
                <div className="rounded-lg bg-surface-container-high p-md">
                  <p className="text-xs text-on-surface-variant font-medium">Clube da Casa</p>
                  <p className="text-sm font-bold text-on-surface mt-1">
                    {activeMatch.home_club_name || activeMatch.homeTeamName}
                  </p>
                </div>
                <div className="rounded-lg bg-surface-container-high p-md">
                  <p className="text-xs text-on-surface-variant font-medium">Clube Visitante</p>
                  <p className="text-sm font-bold text-on-surface mt-1">
                    {activeMatch.away_club_name || activeMatch.awayTeamName}
                  </p>
                </div>
              </div>
            </div>
            <MatchStandingsCard
              standings={standings}
              homeClubId={homeClubId}
              awayClubId={awayClubId}
              isLoading={loadingStandings}
            />
          </div>
        )

      case 'report':
        return (
          <Suspense
            fallback={
              <div className="flex min-h-[300px] items-center justify-center">
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

  // ─── Sidebar Content (SofaScore Cards) ────────────────────────────────────

  const sidebarContent = (
    <SportSidebar>
      {/* 1. Match Info Card */}
      <SportSidebarCard title="Informações da Partida" icon={Calendar}>
        <div className="space-y-sm text-xs">
          {(activeMatch.match_date || activeMatch.scheduledAt) && (
            <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
              <span className="text-on-surface-variant">Data e Hora</span>
              <span className="font-semibold text-on-surface">
                {new Date(activeMatch.scheduledAt || activeMatch.match_date!).toLocaleString('pt-PT', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          )}

          <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
            <span className="text-on-surface-variant">Competição</span>
            <Link
              to={competitionRoutes.detail(competitionId)}
              className="font-semibold text-primary hover:underline truncate max-w-[160px]"
            >
              {competition?.name || (activeMatch as any).competition_name || 'Competição'}
            </Link>
          </div>

          {(activeMatch.roundNumber || activeMatch.round_number) && (
            <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
              <span className="text-on-surface-variant">Jornada</span>
              <span className="font-semibold text-on-surface">
                {activeMatch.roundNumber || activeMatch.round_number}ª Rodada
              </span>
            </div>
          )}

          {activeMatch.venue && (
            <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
              <span className="text-on-surface-variant">Estádio</span>
              <span className="font-semibold text-on-surface truncate max-w-[160px]">
                {activeMatch.venue}
              </span>
            </div>
          )}

          <div className="pt-2">
            <Link
              to={competitionRoutes.tacticalView(competitionId, matchIdValue)}
              className="flex items-center justify-center gap-1.5 w-full py-1.5 rounded-lg border border-outline-variant/20 bg-surface-container-high text-xs font-semibold text-on-surface hover:bg-surface-container-highest transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 text-primary" />
              <span>Ver no Quadro Tático</span>
            </Link>
          </div>
        </div>
      </SportSidebarCard>

      {/* 2. Referee Card */}
      <SportSidebarCard title="Equipa de Arbitragem" icon={UserCheck}>
        <div className="space-y-sm text-xs">
          <div className="flex items-center justify-between py-1">
            <span className="text-on-surface-variant">Árbitro Principal</span>
            <span className="font-semibold text-on-surface">
              {activeMatch.refereeName || (activeMatch as any).referee_name || 'Não designado'}
            </span>
          </div>
        </div>
      </SportSidebarCard>

      {/* 3. Coaches Card */}
      {(homeCoach || awayCoach) && (
        <SportSidebarCard title="Treinadores" icon={Shield}>
          <div className="space-y-xs text-xs">
            <div className="flex items-center justify-between py-1 border-b border-outline-variant/10">
              <span className="text-on-surface-variant truncate max-w-[110px]">
                {activeMatch.home_club_name || activeMatch.homeTeamName}
              </span>
              <span className="font-semibold text-on-surface truncate max-w-[140px]">
                {homeCoach || '—'}
              </span>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-on-surface-variant truncate max-w-[110px]">
                {activeMatch.away_club_name || activeMatch.awayTeamName}
              </span>
              <span className="font-semibold text-on-surface truncate max-w-[140px]">
                {awayCoach || '—'}
              </span>
            </div>
          </div>
        </SportSidebarCard>
      )}

      {/* 4. Standings Card */}
      {standings.length > 0 && (
        <SportSidebarCard
          title="Classificação"
          icon={Trophy}
          action={
            <Link
              to={competitionRoutes.detail(competitionId)}
              className="text-[10px] font-bold text-primary hover:underline uppercase"
            >
              Ver Tudo
            </Link>
          }
        >
          <MatchStandingsCard
            standings={standings.slice(0, 8)}
            homeClubId={homeClubId}
            awayClubId={awayClubId}
            isLoading={loadingStandings}
          />
        </SportSidebarCard>
      )}

      {/* 5. Operator / Admin Card */}
      {(isMatchOperator || isAdmin) && (
        <SportSidebarCard title="Gestão da Partida" icon={Activity}>
          <div className="space-y-sm">
            {activeMatch.status === 'scheduled' && isMatchOperator && (
              <StartMatchButton
                competitionId={competitionId}
                matchId={matchIdValue}
                currentStatus={activeMatch.status}
                onStarted={() => liveState.refetch()}
              />
            )}

            <MatchClockControls
              match={activeMatch}
              canControl={isMatchOperator}
              extraTimeAllowed={extraTimeAllowed}
              penaltiesAllowed={penaltiesAllowed}
              onUpdated={() => liveState.refetch()}
            />

            {activeMatch.status === 'pre_match' && isMatchOperator && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setActiveTab('lineup')}
              >
                <Users className="mr-xs h-3.5 w-3.5" /> Gerir escalações
              </Button>
            )}

            {activeMatch.status === 'finished' && hasRequiredRole(userRoles, ['referee', 'match_referee', 'manager', 'org_admin', 'delegate', 'owner', 'admin']) && (
              <Button
                variant="secondary"
                size="sm"
                className="w-full"
                onClick={() => setActiveTab('report')}
              >
                <FileText className="mr-xs h-3.5 w-3.5" /> Submeter relatório
              </Button>
            )}

            {activeMatch.status === 'finished' && isAdmin && (
              <ArchiveMatchButton matchId={matchIdValue} onArchived={() => liveState.refetch()} />
            )}

            {activeMatch.status === 'archived' && (
              <p className="text-center text-xs text-on-surface-variant/70 italic py-1">
                Partida arquivada (somente leitura).
              </p>
            )}
          </div>
        </SportSidebarCard>
      )}
    </SportSidebar>
  )

  // ─── Main Content with SportTabs ──────────────────────────────────────────

  const mainContent = (
    <SportTabs value={activeTab} onValueChange={(val) => setActiveTab(val as TabId)}>
      <SportTabsList className="mb-md">
        {TABS.map((tab) => {
          if (!hasRequiredRole(userRoles, tab.roles)) return null
          return (
            <SportTabsTrigger key={tab.id} value={tab.id} icon={tab.icon}>
              {tab.label}
            </SportTabsTrigger>
          )
        })}
      </SportTabsList>

      {TABS.map((tab) => {
        if (!hasRequiredRole(userRoles, tab.roles)) return null
        return (
          <SportTabsContent key={tab.id} value={tab.id}>
            {renderTabContent()}
          </SportTabsContent>
        )
      })}
    </SportTabs>
  )

  // ─── Dashboard Route Fallback (Keeps Dashboard View Intact) ───────────────

  if (isDashboard) {
    return (
      <DashboardLayout
        title={`${activeMatch.home_club_name || activeMatch.homeTeamName} vs ${activeMatch.away_club_name || activeMatch.awayTeamName}`}
        subtitle={`Jornada ${activeMatch.round_number || activeMatch.roundNumber || ''}`}
        dashboardType="competition"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg pb-xl">
          <MatchHeroHeader
            match={activeMatch}
            competition={competition}
            events={liveState.events}
          />
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-lg">
            <div>{mainContent}</div>
            <div>{sidebarContent}</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  // ─── Public SofaScore View ────────────────────────────────────────────────

  const breadcrumb = (
    <div className="flex items-center gap-xs text-xs sm:text-sm text-on-surface-variant overflow-x-auto whitespace-nowrap scrollbar-hide py-1">
      <Link to="/competitions" className="hover:text-primary transition-colors">
        Competições
      </Link>
      <span aria-hidden="true" className="opacity-40">/</span>
      <Link to={competitionRoutes.detail(competitionId)} className="hover:text-primary transition-colors">
        {competition?.name || 'Competição'}
      </Link>
      <span aria-hidden="true" className="opacity-40">/</span>
      <span className="truncate font-semibold text-on-surface">
        {activeMatch.home_club_name || activeMatch.homeTeamName} vs {activeMatch.away_club_name || activeMatch.awayTeamName}
      </span>
    </div>
  )

  return (
    <SportDetailLayout
      breadcrumb={breadcrumb}
      header={
        <MatchHeroHeader
          match={activeMatch}
          competition={competition}
          events={liveState.events}
        />
      }
      main={mainContent}
      sidebar={sidebarContent}
    />
  )
}
