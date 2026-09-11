import { useState, useEffect } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import { Calendar, Activity, Filter, ArrowLeft } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { MatchScoreWidget } from '@/modules/shared/components/sport'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useMatchCenter } from '../hooks/useMatchCenter'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import type { MatchStatus } from '../types'
import { useSeo } from '@/hooks/useSeo'

// ─── Status Filter Configuration ─────────────────────────────────────────────

const STATUS_FILTERS: Array<{ 
  id: MatchStatus[] | null 
  label: string 
  icon: typeof Activity 
}> = [
  { id: ['live', 'halftime'], label: 'Ao vivo', icon: Activity },
  { id: ['scheduled', 'pre_match'], label: 'A seguir', icon: Calendar },
  { id: ['finished', 'archived', 'walkover', 'cancelled', 'postponed'], label: 'Finalizados', icon: Calendar },
  { id: null, label: 'Todos', icon: Filter },
]

// ─── MatchCenterPage (Hub de Partidas por Jornada) ───────────────────────────

export function MatchCenterPage() {
  const { compId } = useParams<{ compId: string }>()
  const competitionId = compId ?? ''
  const navigate = useNavigate()
  const { isAdmin } = useCompetitionAccess()
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')
  useSeo({ title: 'Centro de Jogos', description: 'Acompanhe jogos, jornadas e resultados desta competição.', path: `/competitions/${competitionId}/match-center` })

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const [statusFilter, setStatusFilter] = useState<MatchStatus[] | null>(null)

  const {
    matches,
    rounds,
    selectedRound,
    setSelectedRound,
    liveMatches,
    upcomingMatches,
    finishedMatches,
    isLoading: loadingMatches,
  } = useMatchCenter({ competitionId, status: statusFilter ?? undefined })

  const [statusCounts, setStatusCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    if (statusFilter === null && matches.length > 0) {
      setStatusCounts({
        live: matches.filter(m => ['live', 'halftime'].includes(m.status)).length,
        scheduled: matches.filter(m => ['scheduled', 'pre_match'].includes(m.status)).length,
        finished: matches.filter(m => ['finished', 'archived', 'walkover', 'cancelled', 'postponed'].includes(m.status)).length,
        total: matches.length,
      })
    }
  }, [matches, statusFilter])

  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  // ─── Loading State ──────────────────────────────────────────────────────

  if (loadingComp || loadingMatches) {
    const LoadingComponent = () => (
      <div className="space-y-lg">
        {/* Jornada selector skeleton */}
        <div className="flex gap-xs">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-8 w-20 animate-pulse rounded-full bg-surface-container-high" />
          ))}
        </div>
        {/* Match cards skeleton */}
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-container-high" />
          ))}
        </div>
      </div>
    )
    if (isDashboard) {
      return (
        <DashboardLayout
          title="Centro de Jogos"
          subtitle="A carregar..."
          dashboardType="competition"
          sidebarLinks={sidebarLinks}
        >
          <LoadingComponent />
        </DashboardLayout>
      )
    }
    return (
      <div className="min-h-screen bg-background pb-2xl">
        <nav aria-label="Breadcrumb" className="max-w-7xl mx-auto px-lg py-sm flex items-center gap-xs text-sm text-on-surface-variant">
          <Link to={competitionRoutes.list} className="hover:text-primary">Competições</Link>
          <span aria-hidden="true">/</span>
          <Link to={competitionRoutes.detail(competitionId)} className="hover:text-primary">Competição</Link>
          <span aria-hidden="true">/</span>
          <span aria-current="page" className="text-on-surface">Centro de Jogos</span>
        </nav>
        <main className="max-w-7xl mx-auto px-lg">
          <LoadingComponent />
        </main>
      </div>
    )
  }

  // ─── No Matches State ───────────────────────────────────────────────────

  if (matches.length === 0) {
    const hasActiveFilter = statusFilter !== null

    const NoMatchesComponent = () => (
      <Card variant="flat" padding="lg" className="border border-outline-variant/20 bg-surface-container">
        <div className="flex flex-col items-center gap-md py-xl text-center">
          <Calendar className="h-12 w-12 text-on-surface-variant/30" />
          <h3 className="text-lg font-semibold text-on-surface">
            {hasActiveFilter ? 'Nenhuma partida encontrada para este filtro' : 'Sem partidas registadas'}
          </h3>
          <p className="max-w-xs text-sm text-on-surface-variant">
            {hasActiveFilter
              ? 'Não existem partidas neste estado para a competição atual. Tente outro filtro ou limpe a seleção.'
              : 'As partidas da competição serão apresentadas aqui assim que forem criadas.'}
          </p>
          {hasActiveFilter ? (
            <Button variant="secondary" size="sm" className="mt-md" onClick={() => setStatusFilter(null)}>
              Limpar filtro
            </Button>
          ) : isAdmin ? (
            <Link to={competitionRoutes.schedule(competitionId)}>
              <Button variant="primary" size="sm" className="mt-md">
                Criar Jornada
              </Button>
            </Link>
          ) : null}
        </div>
      </Card>
    )

    if (isDashboard) {
      return (
        <DashboardLayout
          title="Centro de Jogos"
          subtitle="Sem partidas"
          dashboardType="competition"
          sidebarLinks={sidebarLinks}
        >
          <NoMatchesComponent />
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
          <span aria-current="page" className="text-on-surface font-medium">Centro de Jogos</span>
        </nav>
        <main className="max-w-7xl mx-auto px-lg">
          <NoMatchesComponent />
        </main>
      </div>
    )
  }

  // ─── Page Content ───────────────────────────────────────────────────────

  const pageContent = (
    <>
      {/* Header */}
      <div className="mb-lg flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-on-surface">Centro de Jogos</h1>
          <p className="text-sm text-on-surface-variant">
            {competition?.name ? `${competition.name} • ` : ''}Jornada {selectedRound ?? 'Todas'} • {matches.length} partidas
          </p>
        </div>
        <Link
          to={isDashboard ? competitionRoutes.adminDashboard(competitionId) : competitionRoutes.detail(competitionId)}
          className="inline-flex items-center gap-xs text-sm text-on-surface-variant hover:text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à competição
        </Link>
      </div>

      {/* Jornada Selector */}
      <div className="mb-md flex flex-wrap items-center gap-xs overflow-x-auto pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mr-sm">Jornada:</span>
        <button
          type="button"
          onClick={() => setSelectedRound(null)}
          className={`rounded-full px-sm py-1 text-xs font-medium transition-colors ${
            selectedRound === null
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'
          }`}
        >
          Todas
        </button>
        {rounds.map(round => (
          <button
            key={round.number}
            type="button"
            onClick={() => setSelectedRound(round.number)}
            className={`rounded-full px-sm py-1 text-xs font-medium transition-colors ${
              selectedRound === round.number
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'
            }`}
          >
            J{round.number} — {round.label}
          </button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="mb-lg flex flex-wrap items-center gap-xs overflow-x-auto pb-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mr-sm">Filtrar:</span>
        {STATUS_FILTERS.map(filter => {
          const isActive = 
            (statusFilter === null && filter.id === null) ||
            (filter.id !== null && statusFilter?.every(s => filter.id?.includes(s)))
          
          let count = matches.length
          if (filter.id) {
            if (filter.id.includes('live')) {
              count = statusFilter ? (statusCounts.live ?? matches.filter(m => filter.id?.includes(m.status)).length) : matches.filter(m => filter.id?.includes(m.status)).length
            } else if (filter.id.includes('scheduled')) {
              count = statusFilter ? (statusCounts.scheduled ?? matches.filter(m => filter.id?.includes(m.status)).length) : matches.filter(m => filter.id?.includes(m.status)).length
            } else {
              count = statusFilter ? (statusCounts.finished ?? matches.filter(m => filter.id?.includes(m.status)).length) : matches.filter(m => filter.id?.includes(m.status)).length
            }
          } else {
            count = statusFilter ? (statusCounts.total ?? matches.length) : matches.length
          }

          const Icon = filter.icon

          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`flex items-center gap-xs rounded-full px-sm py-1 text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container border border-outline-variant/20 text-on-surface-variant hover:bg-surface-container-high'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {filter.label}
              <span className={`ml-xs rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? 'bg-white/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="mb-xl">
          <h2 className="mb-md flex items-center gap-xs text-sm font-bold uppercase tracking-wider text-emerald-500">
            <Activity className="h-4 w-4 text-emerald-500" />
            <span>AO VIVO ({liveMatches.length})</span>
          </h2>
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map(match => (
              <MatchScoreWidget
                key={match.id}
                match={match}
                onClick={() => navigate(competitionRoutes.matchDetail(competitionId, match.id))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Matches Section */}
      {upcomingMatches.length > 0 && (
        <div className="mb-xl">
          <h2 className="mb-md text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Próximas Partidas ({upcomingMatches.length})
          </h2>
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map(match => (
              <MatchScoreWidget
                key={match.id}
                match={match}
                onClick={() => navigate(competitionRoutes.matchDetail(competitionId, match.id))}
              />
            ))}
          </div>
        </div>
      )}

      {/* Finished Matches Section */}
      {finishedMatches.length > 0 && (
        <div>
          <h2 className="mb-md text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Resultados ({finishedMatches.length})
          </h2>
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {finishedMatches.map(match => (
              <MatchScoreWidget
                key={match.id}
                match={match}
                onClick={() => navigate(competitionRoutes.matchDetail(competitionId, match.id))}
              />
            ))}
          </div>
        </div>
      )}
    </>
  )

  // ─── Layout Wrapper ─────────────────────────────────────────────────────

  if (isDashboard) {
    return (
      <DashboardLayout
        title="Centro de Jogos"
        subtitle="Partidas por jornada"
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
        <span aria-current="page" className="truncate text-on-surface font-medium">Centro de Jogos</span>
      </nav>
      <main aria-label="Centro de jogos" className="max-w-7xl mx-auto px-lg">{pageContent}</main>
    </div>
  )
}
