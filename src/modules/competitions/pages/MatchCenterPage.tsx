import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Calendar,
  Activity,
  Filter,
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Trophy,
  Zap,
  Settings,
  Clock,
  CheckCircle2,
} from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import {
  SportDetailLayout,
  SportEntityHeader,
  SportSidebar,
  SportSidebarCard,
  SportStatRow,
  MatchScoreWidget,
} from '@/modules/shared/components/sport'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarSections } from '../constants'
import { useCompetition } from '../hooks/useCompetitions'
import { useMatchCenter } from '../hooks/useMatchCenter'
import { useCompetitionRounds } from '../hooks/useCompetitionMatches'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import type { MatchStatus } from '../types'
import { useSeo } from '@/hooks/useSeo'

// ─── Status & Type Configurations ───────────────────────────────────────────

const STATUS_LABELS: Record<string, string> = {
  draft: 'Rascunho',
  active: 'Em Curso',
  completed: 'Concluída',
  archived: 'Arquivada',
}

const TYPE_LABELS: Record<string, string> = {
  league: 'Campeonato',
  tournament: 'Torneio',
  cup: 'Taça',
}

const STATUS_FILTERS: Array<{ 
  id: MatchStatus[] | null 
  label: string 
  icon: any 
}> = [
  { id: null, label: 'Todos', icon: Filter },
  { id: ['live', 'halftime'], label: 'Ao Vivo', icon: Activity },
  { id: ['scheduled', 'pre_match'], label: 'A Seguir', icon: Clock },
  { id: ['finished', 'archived', 'walkover', 'cancelled', 'postponed'], label: 'Finalizados', icon: CheckCircle2 },
]

// ─── MatchCenterPage (Hub de Partidas por Jornada — SofaScore Style) ─────────

export function MatchCenterPage() {
  const { compId } = useParams<{ compId: string }>()
  const competitionId = compId ?? ''
  const navigate = useNavigate()
  const { isAdmin } = useCompetitionAccess()
  const location = useLocation()
  const isDashboard = location.pathname.startsWith('/dashboard')
  const sidebarSections = useMemo(() => getCompetitionSidebarSections(competitionId), [competitionId])

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const compSlugOrId = competition?.slug || competitionId

  useSeo({
    title: competition?.name ? `Centro de Jogos • ${competition.name}` : 'Centro de Jogos — BolaYetu',
    description: competition?.name 
      ? `Acompanhe os resultados ao vivo, calendário de jogos e jornadas de ${competition.name}.`
      : 'Acompanhe jogos, jornadas e resultados em direto.',
    path: `/competitions/${compSlugOrId}/match-center`,
  })

  const [statusFilter, setStatusFilter] = useState<MatchStatus[] | null>(null)
  const [selectedRound, setSelectedRound] = useState<number | null>(null)

  // Full rounds view so navigator always knows all available rounds
  const { data: roundsView } = useCompetitionRounds(competitionId)

  const {
    matches,
    rounds: matchCenterRounds,
    liveMatches,
    upcomingMatches,
    finishedMatches,
    isLoading: loadingMatches,
  } = useMatchCenter({ 
    competitionId, 
    status: statusFilter ?? undefined,
    roundNumber: selectedRound ?? undefined,
  })

  // Normalize full list of rounds from API or fallback
  const allRounds = useMemo(() => {
    if (roundsView?.rounds && roundsView.rounds.length > 0) {
      return roundsView.rounds.map(r => ({
        number: r.number,
        label: r.label || `Jornada ${r.number}`,
      }))
    }
    return matchCenterRounds.map(r => ({
      number: r.number,
      label: r.label,
    }))
  }, [roundsView, matchCenterRounds])

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

  const typeLabel = competition ? (TYPE_LABELS[competition.competition_type] ?? competition.competition_type) : ''
  const statusLabel = competition ? (STATUS_LABELS[competition.status] ?? competition.status) : ''

  // Round navigation step helpers
  const handlePrevRound = () => {
    if (allRounds.length === 0) return
    if (selectedRound === null) {
      setSelectedRound(allRounds[allRounds.length - 1].number)
      return
    }
    const currIdx = allRounds.findIndex(r => r.number === selectedRound)
    if (currIdx > 0) {
      setSelectedRound(allRounds[currIdx - 1].number)
    }
  }

  const handleNextRound = () => {
    if (allRounds.length === 0) return
    if (selectedRound === null) {
      setSelectedRound(allRounds[0].number)
      return
    }
    const currIdx = allRounds.findIndex(r => r.number === selectedRound)
    if (currIdx >= 0 && currIdx < allRounds.length - 1) {
      setSelectedRound(allRounds[currIdx + 1].number)
    }
  }

  // ─── Main Content Renderer ───────────────────────────────────────────────

  const renderContent = () => {
    if (loadingComp || loadingMatches) {
      return (
        <div className="space-y-lg">
          {/* Round selector skeleton */}
          <div className="flex items-center gap-xs overflow-x-auto pb-2">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-8 w-24 animate-pulse rounded-full bg-surface-container-high" />
            ))}
          </div>
          {/* Match cards skeleton */}
          <div className="grid gap-md sm:grid-cols-2">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-28 animate-pulse rounded-xl bg-surface-container-high border border-outline-variant/15" />
            ))}
          </div>
        </div>
      )
    }

    return (
      <div className="space-y-lg">
        {/* Round Navigator (SofaScore Style) */}
        <div className="rounded-xl border border-outline-variant/15 bg-surface-container p-3">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-primary" />
              Navegar por Jornadas
            </span>
            {allRounds.length > 0 && (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-on-surface-variant hover:text-on-surface"
                  onClick={handlePrevRound}
                  title="Jornada anterior"
                  disabled={selectedRound === (allRounds[0]?.number ?? null)}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 rounded-lg text-on-surface-variant hover:text-on-surface"
                  onClick={handleNextRound}
                  title="Próxima jornada"
                  disabled={selectedRound === (allRounds[allRounds.length - 1]?.number ?? null)}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-hide">
            <button
              type="button"
              onClick={() => setSelectedRound(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedRound === null
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
              }`}
            >
              Todas
            </button>
            {allRounds.map(round => (
              <button
                key={round.number}
                type="button"
                onClick={() => setSelectedRound(round.number)}
                className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedRound === round.number
                    ? 'bg-primary text-on-primary font-bold shadow-xs'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest hover:text-on-surface'
                }`}
              >
                {round.label}
              </button>
            ))}
          </div>
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
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
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors border ${
                  isActive
                    ? 'bg-primary text-on-primary border-primary font-semibold shadow-xs'
                    : 'bg-surface-container border-outline-variant/15 text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'
                }`}
              >
                <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-white' : ''} ${filter.label === 'Ao Vivo' ? 'text-emerald-500' : ''}`} />
                <span>{filter.label}</span>
                <span className={`ml-1 rounded-full px-1.5 py-0.2 text-[10px] ${isActive ? 'bg-white/20' : 'bg-surface-container-highest text-on-surface-variant'}`}>
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* Empty State */}
        {matches.length === 0 ? (
          <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-8 text-center flex flex-col items-center gap-3">
            <Calendar className="h-10 w-10 text-on-surface-variant/30" />
            <h3 className="text-base font-semibold text-on-surface">
              {statusFilter !== null ? 'Nenhuma partida encontrada para este filtro' : 'Sem partidas registadas'}
            </h3>
            <p className="max-w-md text-xs text-on-surface-variant">
              {statusFilter !== null
                ? 'Não foram encontradas partidas neste estado na seleção atual. Tente alterar o filtro ou ver todas as jornadas.'
                : 'As partidas desta prova serão apresentadas assim que forem homologadas no calendário oficial.'}
            </p>
            {statusFilter !== null ? (
              <Button variant="secondary" size="sm" onClick={() => setStatusFilter(null)}>
                Limpar Filtro
              </Button>
            ) : isAdmin ? (
              <Button asChild variant="primary" size="sm">
                <Link to={competitionRoutes.schedule(competitionId)}>
                  Criar Jornada
                </Link>
              </Button>
            ) : null}
          </div>
        ) : (
          <div className="space-y-xl">
            {/* Live Matches */}
            {liveMatches.length > 0 && (
              <section className="space-y-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    Jogos a Decorrer ({liveMatches.length})
                  </h2>
                </div>
                <div className="grid gap-md sm:grid-cols-2">
                  {liveMatches.map(match => (
                    <MatchScoreWidget
                      key={match.id}
                      match={match}
                      onClick={() => navigate(competitionRoutes.matchDetail(competitionId, match.id))}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Upcoming Matches */}
            {upcomingMatches.length > 0 && (
              <section className="space-y-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-primary" />
                  Próximas Partidas ({upcomingMatches.length})
                </h2>
                <div className="grid gap-md sm:grid-cols-2">
                  {upcomingMatches.map(match => (
                    <MatchScoreWidget
                      key={match.id}
                      match={match}
                      onClick={() => navigate(competitionRoutes.matchDetail(competitionId, match.id))}
                    />
                  ))}
                </div>
              </section>
            )}

            {/* Finished Matches */}
            {finishedMatches.length > 0 && (
              <section className="space-y-sm">
                <h2 className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500" />
                  Resultados Registados ({finishedMatches.length})
                </h2>
                <div className="grid gap-md sm:grid-cols-2">
                  {finishedMatches.map(match => (
                    <MatchScoreWidget
                      key={match.id}
                      match={match}
                      onClick={() => navigate(competitionRoutes.matchDetail(competitionId, match.id))}
                    />
                  ))}
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    )
  }

  // ─── Dashboard Layout (Admin view) ────────────────────────────────────────

  if (isDashboard) {
    return (
      <DashboardLayout
        title="Centro de Jogos"
        subtitle={competition?.name ? `${competition.name} • Partidas por jornada` : 'Partidas por jornada'}
        dashboardType="competition"
        sidebarSections={sidebarSections}
      >
        {renderContent()}
      </DashboardLayout>
    )
  }

  // ─── Public 2-Column SofaScore Layout ────────────────────────────────────

  return (
    <SportDetailLayout
      breadcrumb={
        <div className="flex items-center gap-xs text-sm text-on-surface-variant">
          <Link to={competitionRoutes.list} className="hover:text-primary">Competições</Link>
          <span aria-hidden="true">/</span>
          <Link to={competitionRoutes.detail(compSlugOrId)} className="hover:text-primary">
            {competition?.name ?? 'Competição'}
          </Link>
          <span aria-hidden="true">/</span>
          <span className="text-on-surface font-medium">Centro de Jogos</span>
        </div>
      }
      header={
        <SportEntityHeader
          visual={
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-md">
              <Trophy className="h-7 w-7" />
            </div>
          }
          title={`Centro de Jogos • ${competition?.name ?? 'Competição'}`}
          subtitle={`Acompanhe o calendário, resultados e partidas ao vivo da época ${competition?.season ?? ''}.`}
          chips={[
            { label: typeLabel },
            { label: statusLabel },
            { icon: Calendar, label: `Época ${competition?.season ?? ''}` },
            { icon: Activity, label: `${matches.length} Jogos` },
          ]}
          actions={
            <div className="flex items-center gap-sm">
              <Button asChild variant="secondary" size="sm">
                <Link to={competitionRoutes.detail(compSlugOrId)}>
                  <ArrowLeft className="mr-1.5 h-3.5 w-3.5" />
                  Voltar à Prova
                </Link>
              </Button>
            </div>
          }
        />
      }
      main={renderContent()}
      sidebar={
        <SportSidebar>
          <SportSidebarCard title="Sobre a Prova" icon={Trophy}>
            <SportStatRow label="Temporada" value={competition?.season ?? '—'} />
            <SportStatRow label="Formato" value={typeLabel} />
            <SportStatRow label="Estado" value={statusLabel} />
            <SportStatRow
              label="Filtro Ativo"
              value={selectedRound !== null ? `Jornada ${selectedRound}` : 'Todas as Jornadas'}
            />
          </SportSidebarCard>

          <SportSidebarCard title="Acesso Rápido" icon={Zap}>
            <div className="space-y-2">
              <Link
                to={competitionRoutes.detail(compSlugOrId)}
                className="flex items-center justify-between rounded-lg border border-outline-variant/15 bg-surface-container-low p-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                <span>Classificação & Grupos</span>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </Link>
              <Link
                to={competitionRoutes.rankings(competitionId)}
                className="flex items-center justify-between rounded-lg border border-outline-variant/15 bg-surface-container-low p-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                <span>Melhores Marcadores</span>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </Link>
              <Link
                to={competitionRoutes.suspensions(competitionId)}
                className="flex items-center justify-between rounded-lg border border-outline-variant/15 bg-surface-container-low p-2.5 text-sm font-medium hover:border-primary/40 hover:text-primary transition-colors"
              >
                <span>Suspensões & Disciplina</span>
                <ChevronRight className="h-4 w-4 text-on-surface-variant" />
              </Link>
            </div>
          </SportSidebarCard>

          {isAdmin && (
            <SportSidebarCard title="Administração" icon={Settings}>
              <div className="space-y-2">
                <p className="text-xs text-on-surface-variant">
                  Tem permissão para gerir os jogos, calendário e súmulas desta competição.
                </p>
                <Button asChild variant="primary" size="sm" className="w-full">
                  <Link to={competitionRoutes.schedule(competitionId)}>
                    Gerir Calendário
                  </Link>
                </Button>
              </div>
            </SportSidebarCard>
          )}
        </SportSidebar>
      }
    />
  )
}
