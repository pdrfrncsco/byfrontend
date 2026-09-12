import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Input } from '@/components/ui'
import { useDashboardOverview } from '@/modules/dashboards/hooks/useDashboard'
import { useCompetitions } from '../hooks/useCompetitions'
import { ROUTES } from '@/constants'
import { getCompetitionSidebarSections } from '../constants/navigation'
import { competitionRoutes } from '../routes'
import type { Competition, CompetitionStatus, CompetitionType } from '../types'
import { 
  Trophy, 
  Calendar, 
  Gavel, 
  ArrowRight, 
  TrendingUp, 
  Loader2, 
  FolderOpen, 
  Users, 
  PlusCircle,
  Search,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  PauseCircle,
  SlidersHorizontal,
  ExternalLink,
  ChevronRight,
  Sparkles,
  ClipboardList
} from 'lucide-react'

const STATUS_CONFIG: Record<CompetitionStatus, { label: string; bg: string; text: string; border: string; dot: string }> = {
  active: {
    label: 'EM CURSO',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    dot: 'bg-emerald-500 animate-pulse',
  },
  draft: {
    label: 'RASCUNHO',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    dot: 'bg-amber-500',
  },
  completed: {
    label: 'CONCLUÍDO',
    bg: 'bg-slate-500/10',
    text: 'text-slate-400',
    border: 'border-slate-500/30',
    dot: 'bg-slate-500',
  },
  inactive: {
    label: 'INATIVA',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    dot: 'bg-rose-500',
  },
}

const TYPE_CONFIG: Record<CompetitionType, { label: string; icon: typeof Trophy; color: string; bg: string }> = {
  league: {
    label: 'Campeonato (Liga)',
    icon: Trophy,
    color: 'text-amber-400',
    bg: 'bg-amber-400/10 border-amber-500/20',
  },
  tournament: {
    label: 'Torneio',
    icon: TrendingUp,
    color: 'text-sky-400',
    bg: 'bg-sky-400/10 border-sky-500/20',
  },
  cup: {
    label: 'Taça / Copa',
    icon: Shield,
    color: 'text-emerald-400',
    bg: 'bg-emerald-400/10 border-emerald-500/20',
  },
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'A definir'
  try {
    const parts = dateStr.split('-')
    if (parts.length === 3) {
      return `${parts[2]}/${parts[1]}/${parts[0]}`
    }
    return new Date(dateStr).toLocaleDateString('pt-PT')
  } catch {
    return dateStr
  }
}

export function CompetitionDashboardPage() {
  const { data: overviewData, isLoading: isOverviewLoading } = useDashboardOverview()
  const { data: competitionsData, isLoading: isCompetitionsLoading } = useCompetitions()

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | CompetitionStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | CompetitionType>('all')

  const sidebarSections = useMemo(() => getCompetitionSidebarSections(), [])

  // Consolidate competitions list
  const competitions: Competition[] = useMemo(() => {
    return competitionsData ?? []
  }, [competitionsData])

  // Real-time filtered competitions
  const filteredCompetitions = useMemo(() => {
    return competitions.filter((comp) => {
      const matchesSearch =
        searchQuery === '' ||
        comp.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        comp.season.toLowerCase().includes(searchQuery.toLowerCase())

      const matchesStatus = statusFilter === 'all' || comp.status === statusFilter
      const matchesType = typeFilter === 'all' || comp.competition_type === typeFilter

      return matchesSearch && matchesStatus && matchesType
    })
  }, [competitions, searchQuery, statusFilter, typeFilter])

  // Count breakdowns
  const counts = useMemo(() => {
    const total = competitions.length
    const active = competitions.filter((c) => c.status === 'active').length
    const draft = competitions.filter((c) => c.status === 'draft').length
    const inactive = competitions.filter((c) => c.status === 'inactive').length
    const completed = competitions.filter((c) => c.status === 'completed').length
    return { total, active, draft, inactive, completed }
  }, [competitions])

  // KPIs
  const kpis = overviewData?.kpis ?? {
    active_tournaments: counts.active,
    tournaments_upcoming: counts.draft,
    tournaments_completed: counts.completed,
    total_matches: 0,
    matches_finished: 0,
    total_clubs: 0,
    total_players: 0,
    matches_today: 0,
    matches_live: 0,
    goals_total: 0,
    avg_goals_per_match: 0,
  }

  const upcomingMatches = overviewData?.upcoming_matches ?? []
  const liveMatches = overviewData?.live_matches ?? []
  const isLoading = isOverviewLoading || isCompetitionsLoading

  // Calculate overall match completion percentage
  const matchCompletionPct = useMemo(() => {
    if (!kpis.total_matches || kpis.total_matches === 0) return 0
    return Math.min(100, Math.round(((kpis.matches_finished ?? 0) / kpis.total_matches) * 100))
  }, [kpis.total_matches, kpis.matches_finished])

  const headerActions = (
    <div className="flex items-center gap-xs flex-wrap">
      <Button asChild variant="secondary" size="sm">
        <Link to={competitionRoutes.list} className="flex items-center gap-xs">
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Portal Público</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="primary">
        <Link to={ROUTES.COMPETITION_CREATE} className="flex items-center gap-xs">
          <PlusCircle className="w-4 h-4" />
          <span>Criar Nova Competição</span>
        </Link>
      </Button>
    </div>
  )

  return (
    <DashboardLayout
      title="Organizador de Competições"
      subtitle="Gestão desportiva de torneios, escalamento de arbitragem, conformidade técnica e acompanhamento de jornadas."
      dashboardType="competition"
      sidebarSections={sidebarSections}
      headerActions={headerActions}
    >
      {/* ── KPI Row (5 Executive Cards matching Prototype Scene-Comp) ───────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-md mb-lg">
        {/* KPI 1: Provas Ativas */}
        <div className="glass-card rounded-xl p-md border border-outline/30 flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between gap-xs mb-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-amber-500/10 text-amber-500 flex items-center justify-center">
                <Trophy className="w-3 h-3" />
              </span>
              Em Curso
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-emerald-500/10 text-emerald-400">
              {isLoading ? '…' : `${counts.active} ativas`}
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-on-surface">
              {isLoading ? '…' : counts.active}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3 text-amber-400" />
              <span>{counts.draft} em planeamento</span>
            </p>
          </div>
        </div>

        {/* KPI 2: Clubes & Atletas */}
        <div className="glass-card rounded-xl p-md border border-outline/30 flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between gap-xs mb-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-sky-500/10 text-sky-400 flex items-center justify-center">
                <Users className="w-3 h-3" />
              </span>
              Clubes Inscritos
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-on-surface">
              {isLoading ? '…' : kpis.total_clubs}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">
              {isLoading ? '—' : `${kpis.total_players} atletas federados`}
            </p>
          </div>
        </div>

        {/* KPI 3: Jogos Disputados */}
        <div className="glass-card rounded-xl p-md border border-outline/30 flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between gap-xs mb-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                <Calendar className="w-3 h-3" />
              </span>
              Jogos Disputados
            </span>
            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold bg-primary/10 text-primary">
              {matchCompletionPct}%
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-on-surface">
              {isLoading ? '…' : (kpis.matches_finished ?? 0)}
              <span className="text-xs font-normal text-on-surface-variant ml-1">
                / {kpis.total_matches || '0'}
              </span>
            </div>
            <div className="w-full bg-surface-container-high h-1.5 rounded-full overflow-hidden mt-1.5">
              <div
                className="bg-primary h-full rounded-full transition-all duration-500"
                style={{ width: `${matchCompletionPct}%` }}
              />
            </div>
          </div>
        </div>

        {/* KPI 4: Golos e Média */}
        <div className="glass-card rounded-xl p-md border border-outline/30 flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between gap-xs mb-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-purple-500/10 text-purple-400 flex items-center justify-center">
                <TrendingUp className="w-3 h-3" />
              </span>
              Golos Marcados
            </span>
          </div>
          <div>
            <div className="text-2xl font-bold font-display text-on-surface">
              {isLoading ? '…' : kpis.goals_total}
            </div>
            <p className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3 h-3" />
              <span>{kpis.avg_goals_per_match ?? '0.0'} por partida</span>
            </p>
          </div>
        </div>

        {/* KPI 5: Estado Operacional & Conformidade */}
        <div className="glass-card rounded-xl p-md border border-outline/30 flex flex-col justify-between hover:border-primary/40 transition-colors">
          <div className="flex items-center justify-between gap-xs mb-xs">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-md bg-slate-500/10 text-slate-400 flex items-center justify-center">
                <Shield className="w-3 h-3" />
              </span>
              Conformidade
            </span>
          </div>
          <div>
            <div className="text-xl font-bold font-display text-on-surface flex items-center gap-1.5">
              {counts.inactive > 0 ? (
                <>
                  <PauseCircle className="w-4 h-4 text-rose-400" />
                  <span className="text-rose-400">{counts.inactive} Inativas</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-emerald-400">Regular</span>
                </>
              )}
            </div>
            <p className="text-[11px] text-on-surface-variant mt-1">
              {counts.total} competições no sistema
            </p>
          </div>
        </div>
      </div>

      {/* ── Main Layout: Col-m (8 cols) + Col-s (4 cols) ────────────────────── */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-lg">
        {/* ── Coluna Principal: Gestão de Competições & Provas ────────────────── */}
        <div className="xl:col-span-8 space-y-md">
          <section className="glass-card rounded-xl p-md border border-outline/30">
            {/* Header com Filtros e Pesquisa */}
            <div className="flex flex-col gap-md pb-md border-b border-outline/20">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-sm">
                <div>
                  <h3 className="font-display text-base font-bold text-on-surface flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-primary" />
                    Quadro Geral de Provas
                  </h3>
                  <p className="text-xs text-on-surface-variant">
                    {filteredCompetitions.length} de {competitions.length} competições visíveis
                  </p>
                </div>

                {/* Search Input */}
                <div className="relative w-full sm:w-64">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant" />
                  <Input
                    placeholder="Pesquisar por nome ou época..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-9 h-9 text-xs"
                  />
                </div>
              </div>

              {/* Status & Type Filter Pills */}
              <div className="flex flex-wrap items-center justify-between gap-sm pt-xs text-xs">
                {/* Status Chips */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[11px] font-semibold text-on-surface-variant mr-1">Estado:</span>
                  <button
                    onClick={() => setStatusFilter('all')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      statusFilter === 'all'
                        ? 'bg-primary text-on-primary shadow-sm'
                        : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                    }`}
                  >
                    Todas ({counts.total})
                  </button>
                  <button
                    onClick={() => setStatusFilter('active')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      statusFilter === 'active'
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-surface-container hover:bg-surface-container-high text-emerald-400'
                    }`}
                  >
                    Ativas ({counts.active})
                  </button>
                  <button
                    onClick={() => setStatusFilter('draft')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      statusFilter === 'draft'
                        ? 'bg-amber-600 text-white shadow-sm'
                        : 'bg-surface-container hover:bg-surface-container-high text-amber-400'
                    }`}
                  >
                    Rascunho ({counts.draft})
                  </button>
                  <button
                    onClick={() => setStatusFilter('inactive')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      statusFilter === 'inactive'
                        ? 'bg-rose-600 text-white shadow-sm'
                        : 'bg-surface-container hover:bg-surface-container-high text-rose-400'
                    }`}
                  >
                    Inativas ({counts.inactive})
                  </button>
                  <button
                    onClick={() => setStatusFilter('completed')}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      statusFilter === 'completed'
                        ? 'bg-slate-600 text-white shadow-sm'
                        : 'bg-surface-container hover:bg-surface-container-high text-slate-400'
                    }`}
                  >
                    Concluídas ({counts.completed})
                  </button>
                </div>

                {/* Type Chips */}
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-[11px] font-semibold text-on-surface-variant mr-1">Formato:</span>
                  <button
                    onClick={() => setTypeFilter('all')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      typeFilter === 'all'
                        ? 'bg-primary/20 text-primary border border-primary/30'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setTypeFilter('league')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      typeFilter === 'league'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Liga
                  </button>
                  <button
                    onClick={() => setTypeFilter('tournament')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      typeFilter === 'tournament'
                        ? 'bg-sky-500/20 text-sky-400 border border-sky-500/30'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Torneio
                  </button>
                  <button
                    onClick={() => setTypeFilter('cup')}
                    className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                      typeFilter === 'cup'
                        ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                  >
                    Taça
                  </button>
                </div>
              </div>
            </div>

            {/* List / Cards of Competitions */}
            <div className="pt-md">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center py-2xl gap-sm text-on-surface-variant">
                  <Loader2 className="w-8 h-8 animate-spin text-primary" />
                  <p className="text-xs">A carregar competições...</p>
                </div>
              ) : filteredCompetitions.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-2xl text-center">
                  <FolderOpen className="w-12 h-12 text-on-surface-variant/30 mb-sm" />
                  <h4 className="text-sm font-semibold text-on-surface">Nenhuma competição encontrada</h4>
                  <p className="text-xs text-on-surface-variant max-w-sm mt-1 mb-md">
                    {searchQuery || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Não existem provas com os filtros selecionados. Tente ajustar a pesquisa.'
                      : 'A sua organização ainda não registou competições desportivas.'}
                  </p>
                  {searchQuery || statusFilter !== 'all' || typeFilter !== 'all' ? (
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => {
                        setSearchQuery('')
                        setStatusFilter('all')
                        setTypeFilter('all')
                      }}
                    >
                      Limpar Filtros
                    </Button>
                  ) : (
                    <Button asChild size="sm" variant="primary">
                      <Link to={ROUTES.COMPETITION_CREATE}>Criar Primeira Competição</Link>
                    </Button>
                  )}
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                  {filteredCompetitions.map((comp) => {
                    const statusCfg = STATUS_CONFIG[comp.status] ?? STATUS_CONFIG.draft
                    const typeCfg = TYPE_CONFIG[comp.competition_type] ?? TYPE_CONFIG.league
                    const TypeIcon = typeCfg.icon

                    return (
                      <div
                        key={comp.id}
                        className="bg-surface-container rounded-xl border border-outline/25 p-md flex flex-col justify-between hover:border-primary/50 hover:bg-surface-container-high transition-all shadow-sm group"
                      >
                        <div>
                          {/* Top Header Card: Type Icon + Badges */}
                          <div className="flex items-start justify-between gap-sm mb-sm">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <div
                                className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 border ${typeCfg.bg}`}
                              >
                                <TypeIcon className={`w-4 h-4 ${typeCfg.color}`} />
                              </div>
                              <div className="min-w-0">
                                <Link
                                  to={competitionRoutes.adminDashboard(comp.id)}
                                  className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors truncate block"
                                  title={comp.name}
                                >
                                  {comp.name}
                                </Link>
                                <div className="flex items-center gap-1.5 text-[11px] text-on-surface-variant mt-0.5">
                                  <span>{comp.season}</span>
                                  <span>•</span>
                                  <span className="truncate">{typeCfg.label}</span>
                                </div>
                              </div>
                            </div>

                            {/* Status Badge with colored dot */}
                            <span
                              className={`text-[10px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1 border flex-shrink-0 ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                            >
                              <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dot}`} />
                              {statusCfg.label}
                            </span>
                          </div>

                          {/* Dates & Deadlines */}
                          <div className="grid grid-cols-2 gap-xs py-sm border-t border-b border-outline/15 text-[11px] text-on-surface-variant my-xs">
                            <div>
                              <span className="block text-[10px] text-on-surface-variant/70 uppercase">
                                Calendário Prova
                              </span>
                              <span className="font-semibold text-on-surface">
                                {comp.start_date ? formatDate(comp.start_date) : 'A definir'}
                                {comp.end_date && ` → ${formatDate(comp.end_date)}`}
                              </span>
                            </div>

                            <div>
                              <span className="block text-[10px] text-on-surface-variant/70 uppercase">
                                Inscrições
                              </span>
                              <span className="font-semibold text-on-surface">
                                {comp.registration_end_date
                                  ? `Até ${formatDate(comp.registration_end_date)}`
                                  : 'Abertas'}
                              </span>
                            </div>
                          </div>

                          {/* Short Description or Sports Specs */}
                          {comp.description ? (
                            <p className="text-[11px] text-on-surface-variant line-clamp-2 my-xs italic">
                              "{comp.description}"
                            </p>
                          ) : (
                            <div className="flex items-center gap-2 text-[10px] text-on-surface-variant my-xs">
                              <span className="bg-surface-container-highest px-1.5 py-0.5 rounded">
                                {comp.config?.matchDuration ?? 90} min / jogo
                              </span>
                              <span className="bg-surface-container-highest px-1.5 py-0.5 rounded">
                                {comp.config?.maxSubstitutes ?? 5} substituições
                              </span>
                              {comp.config?.allowPublicRegistration && (
                                <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded font-medium">
                                  Inscrições Online
                                </span>
                              )}
                            </div>
                          )}
                        </div>

                        {/* Quick Card Actions */}
                        <div className="pt-sm mt-xs border-t border-outline/15 flex items-center justify-between gap-xs">
                          <Link
                            to={competitionRoutes.adminDashboard(comp.id)}
                            className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary-hover transition-colors"
                          >
                            <span>Painel de Gestão</span>
                            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                          </Link>

                          <div className="flex items-center gap-1">
                            <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                              <Link to={competitionRoutes.adminRankings(comp.id)}>Tabela</Link>
                            </Button>
                            <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                              <Link to={competitionRoutes.schedule(comp.id)}>Jogos</Link>
                            </Button>
                            <Button asChild size="sm" variant="ghost" className="h-7 px-2 text-[11px]">
                              <Link to={competitionRoutes.settings(comp.id)}>Ajustes</Link>
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </section>
        </div>

        {/* ── Coluna Lateral (Col-s): Match Center & Ações Rápidas ───────────── */}
        <div className="xl:col-span-4 space-y-md">
          {/* Match Center: Jogos ao Vivo ou Próximos */}
          <section className="glass-card rounded-xl p-md border border-outline/30 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center border-b border-outline/25 pb-sm mb-md">
                <h3 className="font-display text-sm font-bold text-on-surface flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-primary" />
                  {liveMatches.length > 0 ? 'Jogos em Direto' : 'Próximos Jogos'}
                </h3>
                {liveMatches.length > 0 && (
                  <span className="text-[10px] text-emerald-400 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE {liveMatches.length}
                  </span>
                )}
              </div>

              {isLoading ? (
                <div className="flex items-center justify-center py-xl">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : liveMatches.length === 0 && upcomingMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-xl text-center text-on-surface-variant">
                  <Calendar className="w-8 h-8 opacity-30 mb-sm" />
                  <p className="text-xs font-semibold">Sem jogos agendados no momento</p>
                  <p className="text-[11px] opacity-75 mt-0.5">
                    Gere ou importe o calendário numa prova ativa.
                  </p>
                </div>
              ) : (
                <div className="space-y-sm text-xs">
                  {/* Live matches */}
                  {liveMatches.map((match) => (
                    <Link
                      key={match.id}
                      to={`/competitions/${match.competition_id}/matches/${match.id}`}
                      className="p-3 bg-emerald-950/20 rounded-lg border border-emerald-500/25 block hover:border-emerald-400/50 hover:bg-emerald-950/30 transition-all group"
                    >
                      <div className="flex justify-between items-center text-[10px] text-on-surface-variant mb-1">
                        <span className="font-semibold text-emerald-400 truncate max-w-[140px]">
                          {match.tournament}
                        </span>
                        <span className="text-emerald-400 font-bold flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          AO VIVO
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-on-surface font-semibold">
                        <span className="truncate max-w-[80px]">{match.home_name}</span>
                        <span className="text-primary font-bold text-sm px-sm bg-surface-container rounded">
                          {match.home_score ?? 0} – {match.away_score ?? 0}
                        </span>
                        <span className="truncate max-w-[80px] text-right">{match.away_name}</span>
                      </div>
                    </Link>
                  ))}

                  {/* Upcoming matches */}
                  {upcomingMatches.slice(0, liveMatches.length > 0 ? 2 : 4).map((match) => (
                    <Link
                      key={match.id}
                      to={`/competitions/${match.competition_id}/matches/${match.id}`}
                      className="p-2.5 bg-surface-container rounded-lg border border-outline/25 block hover:border-primary/40 hover:bg-surface-container-high transition-all group"
                    >
                      <div className="flex justify-between items-center text-[10px] text-on-surface-variant mb-1">
                        <span className="font-semibold text-primary truncate max-w-[140px]">
                          {match.tournament}
                        </span>
                        <span>
                          {new Date(match.date).toLocaleDateString('pt-PT', {
                            day: '2-digit',
                            month: 'short',
                          })}{' '}
                          {new Date(match.date).toLocaleTimeString('pt-PT', {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-on-surface text-xs font-medium">
                        <span className="truncate max-w-[85px]">{match.home_name}</span>
                        <span className="text-on-surface-variant text-[10px] px-2 bg-surface-container-high rounded">
                          vs
                        </span>
                        <span className="truncate max-w-[85px] text-right">{match.away_name}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Button asChild variant="secondary" size="sm" className="w-full mt-md">
              <Link to={ROUTES.DASHBOARD_COMPETITIONS_LIST} className="flex items-center justify-center gap-1">
                <span>Ver Todas as Competições</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </Button>
          </section>

          {/* Quick Actions Card (QA from prototype) */}
          <section className="glass-card rounded-xl p-md border border-outline/30">
            <h3 className="font-display text-sm font-bold text-on-surface mb-sm flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-amber-400" />
              Ações Rápidas
            </h3>
            <div className="grid grid-cols-2 gap-sm">
              <Link
                to={ROUTES.COMPETITION_CREATE}
                className="p-2.5 bg-surface-container rounded-lg border border-outline/25 hover:border-primary/40 hover:bg-surface-container-high transition-all flex flex-col gap-1 group"
              >
                <div className="w-7 h-7 rounded bg-primary/10 text-primary flex items-center justify-center">
                  <PlusCircle className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-on-surface group-hover:text-primary transition-colors">
                  Nova Prova
                </div>
                <div className="text-[10px] text-on-surface-variant">Lançar campeonato</div>
              </Link>

              <Link
                to="/competitions"
                className="p-2.5 bg-surface-container rounded-lg border border-outline/25 hover:border-primary/40 hover:bg-surface-container-high transition-all flex flex-col gap-1 group"
              >
                <div className="w-7 h-7 rounded bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <Gavel className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-on-surface group-hover:text-amber-400 transition-colors">
                  Arbitragem
                </div>
                <div className="text-[10px] text-on-surface-variant">Nomeações & escala</div>
              </Link>

              <Link
                to={ROUTES.DASHBOARD_COMPETITIONS_LIST}
                className="p-2.5 bg-surface-container rounded-lg border border-outline/25 hover:border-primary/40 hover:bg-surface-container-high transition-all flex flex-col gap-1 group"
              >
                <div className="w-7 h-7 rounded bg-sky-500/10 text-sky-400 flex items-center justify-center">
                  <ClipboardList className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-on-surface group-hover:text-sky-400 transition-colors">
                  Inscrições
                </div>
                <div className="text-[10px] text-on-surface-variant">Validar clubes</div>
              </Link>

              <Link
                to={ROUTES.DASHBOARD_COMPETITIONS_LIST}
                className="p-2.5 bg-surface-container rounded-lg border border-outline/25 hover:border-primary/40 hover:bg-surface-container-high transition-all flex flex-col gap-1 group"
              >
                <div className="w-7 h-7 rounded bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="font-semibold text-xs text-on-surface group-hover:text-emerald-400 transition-colors">
                  Regulamentos
                </div>
                <div className="text-[10px] text-on-surface-variant">Normas e PDF</div>
              </Link>
            </div>
          </section>

          {/* Compliance & Regulation Advisory Card */}
          <section className="glass-card rounded-xl p-md border border-outline/30 bg-surface-container/50">
            <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-2 flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              Diretrizes Técnicas
            </h4>
            <ul className="space-y-1.5 text-[11px] text-on-surface-variant">
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>As provas ativas são visíveis no portal público e nos portais de clubes.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Datas de início e fim servem para controle de validade das fichas de jogo.</span>
              </li>
              <li className="flex items-start gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                <span>Provas pausadas podem ser marcadas como "Inativas" sem perda de dados.</span>
              </li>
            </ul>
          </section>
        </div>
      </div>
    </DashboardLayout>
  )
}
