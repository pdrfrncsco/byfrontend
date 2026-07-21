import { Link } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button } from '@/components/ui'
import { useDashboardOverview } from '../hooks/useDashboard'
import { dashboardRoutes } from '@/modules/dashboards/routes'
import { ROUTES } from '@/constants'
import { 
  Home, 
  Trophy, 
  Calendar, 
  Gavel, 
  MapPin, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Loader2,
  FolderOpen,
  Users,
  PlusCircle
} from 'lucide-react'

const STATUS_CONFIG: Record<string, { label: string; className: string }> = {
  draft:     { label: 'RASCUNHO',  className: 'text-amber-500 bg-amber-500/10' },
  active:    { label: 'EM CURSO',  className: 'text-emerald-500 bg-emerald-500/10' },
  completed: { label: 'CONCLUÍDO', className: 'text-slate-400 bg-slate-500/10' },
}

export function CompetitionDashboardPage() {
  const { data, isLoading } = useDashboardOverview()

  const sidebarLinks = [
    { label: 'Painel da Organização', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Home className="w-5 h-5" /> },
    { label: 'Geral de Provas',       href: dashboardRoutes.competition, icon: <Trophy className="w-5 h-5" />, active: true },
    { label: 'Torneios',              href: ROUTES.DASHBOARD_COMPETITIONS_LIST, icon: <Trophy className="w-5 h-5" /> },
    { label: 'Partidas',              href: ROUTES.DASHBOARD_COMPETITIONS_MATCHES, icon: <Calendar className="w-5 h-5" /> },
    { label: 'Árbitros',              href: dashboardRoutes.competition, icon: <Gavel className="w-5 h-5" />, disabled: true },
    { label: 'Estádios',              href: dashboardRoutes.competition, icon: <MapPin className="w-5 h-5" />, disabled: true },
    { label: 'Conformidade',          href: dashboardRoutes.competition, icon: <ShieldAlert className="w-5 h-5" />, disabled: true },
  ]

  const headerActions = (
    <Button asChild size="sm">
      <Link to={ROUTES.COMPETITION_CREATE} className="flex items-center gap-xs">
        <PlusCircle className="w-4 h-4" />
        Criar Nova Competição
      </Link>
    </Button>
  )

  // Extract KPIs with safe defaults
  const kpis = data?.kpis ?? {
    active_tournaments:       0,
    tournaments_upcoming:     0,
    tournaments_completed:    0,
    total_matches:            0,
    total_clubs:              0,
    total_players:            0,
    matches_today:            0,
    matches_live:             0,
    goals_total:              0,
    avg_goals_per_match:      0,
  }

  const tournaments    = data?.tournaments       ?? []
  const upcomingMatches = data?.upcoming_matches ?? []
  const liveMatches     = data?.live_matches     ?? []

  return (
    <DashboardLayout
      title="Organizador de Competições"
      subtitle="Gestão desportiva de torneios, escalamento de arbitragem, vistorias de recintos e conformidade técnica."
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">

        {/* ── Tournaments block ─────────────────────────────────────────────────── */}
        <section className="glass-card rounded-xl p-md lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h3 className="font-display text-lg text-on-surface">Torneios Recentes</h3>
              <span className="text-xs text-on-surface-variant font-semibold">
                {isLoading ? '—' : (
                  `${kpis.active_tournaments} Competiç${kpis.active_tournaments === 1 ? 'ão' : 'ões'} em Curso`
                )}
              </span>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-xl">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
              </div>
            ) : tournaments.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-xl text-center text-on-surface-variant">
                <FolderOpen className="w-10 h-10 opacity-30 mb-sm" />
                <p className="text-sm font-semibold">Nenhuma competição registada</p>
                <p className="text-xs opacity-75 mt-xs">Crie a sua primeira competição para começar.</p>
              </div>
            ) : (
              <div className="space-y-sm text-xs">
                {tournaments.slice(0, 4).map(comp => {
                  const statusCfg = STATUS_CONFIG[comp.status] ?? STATUS_CONFIG.draft
                  return (
                    <Link
                      key={comp.id}
                      to={ROUTES.COMPETITION_SETTINGS(comp.id)}
                      className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex items-center justify-between hover:border-primary/40 hover:bg-[#102034] transition-all group"
                    >
                      <div className="flex items-center gap-sm min-w-0">
                        {comp.logo ? (
                          <img src={comp.logo} alt={comp.name} className="w-7 h-7 rounded object-contain flex-shrink-0" />
                        ) : (
                          <div className="w-7 h-7 rounded bg-primary-container/20 flex items-center justify-center flex-shrink-0">
                            <Trophy className="w-4 h-4 text-primary" />
                          </div>
                        )}
                        <div className="min-w-0">
                          <p className="font-semibold text-on-surface group-hover:text-primary transition-colors truncate">
                            {comp.name}
                          </p>
                          <p className="text-[10px] text-on-surface-variant mt-0.5">
                            {comp.teams} Equipas
                            {comp.progress > 0 && ` • Progresso: ${comp.progress}%`}
                          </p>
                        </div>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold flex-shrink-0 ml-sm ${statusCfg.className}`}>
                        {statusCfg.label}
                      </span>
                    </Link>
                  )
                })}
              </div>
            )}
          </div>

          <Link to={ROUTES.DASHBOARD_COMPETITIONS_LIST} className="w-full mt-lg">
            <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-on-surface py-2 rounded-lg text-xs font-semibold transition-colors flex items-center justify-center gap-1">
              Visualizar Todos os Torneios <ArrowRight className="w-4 h-4" />
            </button>
          </Link>
        </section>

        {/* ── Upcoming / Live Matches ───────────────────────────────────────────── */}
        <section className="glass-card rounded-xl p-md lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h3 className="font-display text-lg text-on-surface">
                {liveMatches.length > 0 ? 'Jogos em Direto' : 'Próximos Jogos'}
              </h3>
              {liveMatches.length > 0 ? (
                <span className="text-[10px] text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded font-bold animate-pulse">
                  LIVE {liveMatches.length}
                </span>
              ) : (
                <Calendar className="text-primary w-5 h-5" />
              )}
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center py-xl">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : (liveMatches.length === 0 && upcomingMatches.length === 0) ? (
              <div className="flex flex-col items-center justify-center py-lg text-center text-on-surface-variant">
                <Calendar className="w-8 h-8 opacity-30 mb-sm" />
                <p className="text-xs font-semibold">Sem jogos agendados</p>
              </div>
            ) : (
              <div className="space-y-sm text-xs">
                {/* Show live matches first */}
                {liveMatches.slice(0, 2).map(match => (
                  <div
                    key={match.id}
                    className="p-3 bg-emerald-900/20 rounded-lg border border-emerald-500/20 block"
                  >
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant mb-1">
                      <span className="font-semibold text-emerald-400 truncate max-w-28">{match.tournament}</span>
                      <span className="text-emerald-500 font-bold">● AO VIVO</span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface font-semibold">
                      <span className="truncate max-w-20">{match.home_name}</span>
                      <span className="text-primary font-bold text-sm px-sm">
                        {match.home_score ?? 0} – {match.away_score ?? 0}
                      </span>
                      <span className="truncate max-w-20 text-right">{match.away_name}</span>
                    </div>
                  </div>
                ))}

                {/* Upcoming matches */}
                {upcomingMatches.slice(0, liveMatches.length > 0 ? 1 : 3).map(match => (
                  <div
                    key={match.id}
                    className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 block"
                  >
                    <div className="flex justify-between items-center text-[10px] text-on-surface-variant mb-1">
                      <span className="font-semibold text-primary truncate max-w-28">{match.tournament}</span>
                      <span>
                        {new Date(match.date).toLocaleDateString('pt-PT', { day: '2-digit', month: 'short' })}
                        {' '}
                        {new Date(match.date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-on-surface font-semibold">
                      <span className="truncate max-w-20">{match.home_name}</span>
                      <span className="text-on-surface-variant text-[10px] px-sm">vs</span>
                      <span className="truncate max-w-20 text-right">{match.away_name}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-on-surface py-2 rounded-lg text-xs font-semibold transition-colors mt-lg flex items-center justify-center gap-1">
            <Gavel className="w-4 h-4" />
            Painel de Nomeação Arbitral
          </button>
        </section>
      </div>

      {/* ── KPI Cards ─────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-lg">

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Clubes Inscritos</p>
            <h3 className="font-display text-xl font-bold">
              {isLoading ? '…' : `${kpis.total_clubs} Clubes`}
            </h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Torneios Ativos</p>
            <h3 className="font-display text-xl font-bold">
              {isLoading ? '…' : `${kpis.active_tournaments} em curso`}
            </h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Atletas Registados</p>
            <h3 className="font-display text-xl font-bold">
              {isLoading ? '…' : `${kpis.total_players} Jogadores`}
            </h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
