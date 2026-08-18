import { useState } from 'react'
import { useParams, Link, useLocation } from 'react-router-dom'
import { Calendar, Activity, Filter, ArrowLeft } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useMatchCenter } from '../hooks/useMatchCenter'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import type { MatchStatus } from '../types'
import { MatchCard } from '../components'

// ─── Status Filter Configuration ─────────────────────────────────────────────

const STATUS_FILTERS: Array<{ 
  id: MatchStatus[] | null 
  label: string 
  icon: typeof Activity 
}> = [
  { id: ['live', 'halftime'], label: 'Ao vivo', icon: Activity },
  { id: ['scheduled', 'pre_match'], label: 'A seguir', icon: Calendar },
  { id: ['finished', 'walkover', 'cancelled', 'postponed'], label: 'Finalizados', icon: Calendar },
  { id: null, label: 'Todos', icon: Filter },
]

// ─── MatchCenterPage (Hub de Partidas por Jornada) ───────────────────────────

export function MatchCenterPage() {
  const { compId } = useParams<{ compId: string }>()
  const competitionId = compId ?? ''
  const { isAdmin } = useCompetitionAccess()
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')

  const { isLoading: loadingComp } = useCompetition(competitionId)
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
            <div key={i} className="h-32 animate-pulse rounded-xl bg-surface-container-high" />
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
      <div className="min-h-screen bg-background p-lg">
        <LoadingComponent />
      </div>
    )
  }

  // ─── No Matches State ───────────────────────────────────────────────────

  if (matches.length === 0) {
    const NoMatchesComponent = () => (
      <Card variant="flat" padding="lg">
        <div className="flex flex-col items-center gap-md py-xl text-center">
          <Calendar className="h-12 w-12 text-on-surface-variant/30" />
          <h3 className="text-lg font-semibold text-on-surface">Sem partidas registadas</h3>
          <p className="max-w-xs text-sm text-on-surface-variant">
            As partidas da competição serão apresentadas aqui assim que forem criadas.
          </p>
          {isAdmin && (
            <Link to={competitionRoutes.schedule(competitionId)}>
              <Button variant="primary" size="sm" className="mt-md">
                Criar Jornada
              </Button>
            </Link>
          )}
        </div>
      </Card>
    )
    return (
      <div className="mx-auto max-w-5xl px-lg py-xl">
        <NoMatchesComponent />
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
            Jornada {selectedRound ?? 'Todas'} • {matches.length} partidas
          </p>
        </div>
        <Link
          to={isDashboard ? competitionRoutes.adminDashboard(competitionId) : competitionRoutes.detail(competitionId)}
          className="inline-flex items-center gap-xs text-sm text-on-surface-variant hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar à competição
        </Link>
      </div>

      {/* Jornada Selector */}
      <div className="mb-lg flex flex-wrap items-center gap-xs overflow-x-auto pb-2">
        <span className="text-sm font-medium text-on-surface-variant mr-sm">Jornada:</span>
        <button
          type="button"
          onClick={() => setSelectedRound(null)}
          className={`rounded-full px-sm py-xs text-xs font-medium transition-colors ${
            selectedRound === null
              ? 'bg-primary text-on-primary'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
          }`}
        >
          Todas
        </button>
        {rounds.map(round => (
          <button
            key={round.number}
            type="button"
            onClick={() => setSelectedRound(round.number)}
            className={`rounded-full px-sm py-xs text-xs font-medium transition-colors ${
              selectedRound === round.number
                ? 'bg-primary text-on-primary'
                : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
            }`}
          >
            J{round.number} — {round.label}
          </button>
        ))}
      </div>

      {/* Status Filters */}
      <div className="mb-lg flex flex-wrap items-center gap-xs overflow-x-auto pb-2">
        <span className="text-sm font-medium text-on-surface-variant mr-sm">Filtrar:</span>
        {STATUS_FILTERS.map(filter => {
          const isActive = 
            (statusFilter === null && filter.id === null) ||
            (filter.id !== null && statusFilter?.every(s => filter.id?.includes(s)))
          const count = filter.id
            ? matches.filter(m => filter.id?.includes(m.status)).length
            : matches.length

          const Icon = filter.icon

          return (
            <button
              key={filter.label}
              type="button"
              onClick={() => setStatusFilter(filter.id)}
              className={`flex items-center gap-xs rounded-full px-sm py-xs text-xs font-medium transition-colors ${
                isActive
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container'
              }`}
            >
              <Icon className="h-3.5 w-3.5" />
              {filter.label}
              <span className={`ml-xs rounded-full px-xs py-0.5 text-[10px] ${isActive ? 'bg-white/20' : 'bg-on-surface-variant/20'}`}>
                {count}
              </span>
            </button>
          )
        })}
      </div>

      {/* Live Matches Section */}
      {liveMatches.length > 0 && (
        <div className="mb-xl">
          <h2 className="mb-md flex items-center gap-xs text-lg font-semibold text-on-surface">
            <Activity className="h-5 w-5 text-emerald-500" />
            <span className="text-emerald-500">AO VIVO ({liveMatches.length})</span>
          </h2>
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {liveMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                competitionId={competitionId}
                showLink
              />
            ))}
          </div>
        </div>
      )}

      {/* Upcoming Matches Section */}
      {upcomingMatches.length > 0 && (
        <div className="mb-xl">
          <h2 className="mb-md text-lg font-semibold text-on-surface">
            Próximas Partidas ({upcomingMatches.length})
          </h2>
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {upcomingMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                competitionId={competitionId}
                showLink
              />
            ))}
          </div>
        </div>
      )}

      {/* Finished Matches Section */}
      {finishedMatches.length > 0 && (
        <div>
          <h2 className="mb-md text-lg font-semibold text-on-surface">
            Resultados ({finishedMatches.length})
          </h2>
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {finishedMatches.map(match => (
              <MatchCard
                key={match.id}
                match={match}
                competitionId={competitionId}
                showLink
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

  return <div className="mx-auto max-w-5xl px-lg py-xl bg-background">{pageContent}</div>
}
