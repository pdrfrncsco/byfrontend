import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { dashboardRoutes } from '@/modules/dashboards/routes'
import { useDashboardOverview } from '../hooks/useDashboard'
import { 
  Home, 
  Search, 
  RefreshCw, 
  Activity, 
  GraduationCap, 
  DollarSign, 
  Trophy, 
  Calendar,
  ListOrdered,
  Sparkles,
  Users,
  Clock
} from 'lucide-react'

export function LeagueDashboardPage() {
  const { data, isLoading } = useDashboardOverview()

  const sidebarLinks = [
    { label: 'Geral', href: dashboardRoutes.league, icon: <Home className="w-5 h-5" />, active: true },
    { label: 'Scouting', href: ROUTES.PLAYERS, icon: <Search className="w-5 h-5" /> },
    { label: 'Transferências', href: ROUTES.TRANSFERS, icon: <RefreshCw className="w-5 h-5" /> },
    { label: 'Equipa Médica', href: dashboardRoutes.league, icon: <Activity className="w-5 h-5" />, disabled: true },
    { label: 'Academia', href: dashboardRoutes.league, icon: <GraduationCap className="w-5 h-5" />, disabled: true },
    { label: 'Finanças', href: dashboardRoutes.league, icon: <DollarSign className="w-5 h-5" />, disabled: true },
  ]

  const headerActions = (
    <div className="flex items-center gap-sm">
      <button type="button" className="bg-[#1b2b3f] border border-[#26364a] text-on-surface px-md py-sm rounded-lg flex items-center gap-sm opacity-60 cursor-not-allowed transition-all text-xs font-semibold" disabled>
        Imprimir Calendário
      </button>
      <button type="button" className="bg-[#e9c349] text-[#241a00] px-md py-sm rounded-lg font-bold flex items-center gap-sm opacity-60 cursor-not-allowed transition-all shadow-lg text-xs" disabled>
        Painel de Arbitragem
      </button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#031427] flex items-center justify-center">
        <div className="text-center space-y-md">
          <div className="w-12 h-12 border-4 border-[#94d3c1] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mt-4">Carregando liga...</p>
        </div>
      </div>
    )
  }

  const kpis = data?.kpis || {
    goals_total: 0,
    avg_goals_per_match: 0,
    matches_finished: 0,
    total_matches: 0,
    total_clubs: 0
  }

  return (
    <DashboardLayout
      title="Consola da Liga Nacional (Girabola)"
      subtitle="Gestão desportiva, jogos em direto, transferências e conformidade das equipas participantes."
      dashboardType="league"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-lg">
        {/* Standings widget */}
        <section className="glass-card rounded-xl overflow-hidden flex flex-col p-0 lg:col-span-2">
          <div className="p-md border-b border-[#26364a]/50 flex justify-between items-center bg-[#102034]/50">
            <h4 className="font-display text-base font-bold flex items-center gap-2">
              <ListOrdered className="w-5 h-5 text-primary" /> Classificação Geral
            </h4>
            <span className="text-[10px] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-bold">
              Época em Curso ({kpis.total_clubs} Clubes)
            </span>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1b2b3f]/40 border-b border-[#26364a]/40 text-on-surface-variant">
                  <th className="px-md py-3 text-center w-12 font-semibold">Pos</th>
                  <th className="px-md py-3 font-semibold">Clube</th>
                  <th className="px-md py-3 text-center font-semibold">Atletas</th>
                  <th className="px-md py-3 text-center font-semibold">Golos Favor</th>
                  <th className="px-md py-3 text-right font-semibold pr-md">Acronym</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26364a]/30 font-mono text-[11px]">
                {data?.top_clubs_by_players.map((club, idx) => (
                  <tr key={club.id} className="hover:bg-[#1b2b3f]/20 transition-colors">
                    <td className="px-md py-3 text-center font-display font-bold text-primary">{idx + 1}</td>
                    <td className="px-md py-3 font-display font-semibold text-on-surface text-xs flex items-center gap-2">
                      {club.logo ? (
                        <img src={club.logo} alt={club.name} className="w-5 h-5 object-contain rounded" />
                      ) : (
                        <Trophy className="w-4 h-4 text-primary-fixed-dim" />
                      )}
                      {club.name}
                    </td>
                    <td className="px-md py-3 text-center">{club.players}</td>
                    <td className="px-md py-3 text-center">{club.goals}</td>
                    <td className="px-md py-3 text-right font-display font-bold pr-md uppercase">{club.acronym || '---'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Matches Widget */}
        <section className="glass-card rounded-xl p-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h4 className="font-display text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Jogos Ao Vivo
              </h4>
              <span className="w-2 h-2 bg-[#D1102B] rounded-full animate-ping"></span>
            </div>
            
            <div className="space-y-sm text-xs">
              {data?.live_matches.length === 0 ? (
                <p className="text-center text-on-surface-variant py-md text-[11px]">Nenhum jogo a decorrer neste momento.</p>
              ) : (
                data?.live_matches.map((match) => (
                  <div key={match.id} className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/40 text-center space-y-2">
                    <p className="text-[9px] text-on-surface-variant font-bold uppercase tracking-widest">{match.tournament} • EM CURSO</p>
                    <div className="flex justify-between items-center px-sm">
                      <span className="font-semibold truncate max-w-[80px]">{match.home_name}</span>
                      <span className="font-mono bg-primary/20 text-primary px-2.5 py-0.5 rounded font-bold">
                        {match.home_score} - {match.away_score}
                      </span>
                      <span className="font-semibold truncate max-w-[80px]">{match.away_name}</span>
                    </div>
                  </div>
                ))
              )}

              {data?.upcoming_matches.length === 0 ? null : (
                <>
                  <div className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest pt-sm pb-xs">Próximos Confrontos</div>
                  {data?.upcoming_matches.map((match) => {
                    const matchDate = new Date(match.date)
                    const timeStr = matchDate.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
                    const dayStr = matchDate.toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })

                    return (
                      <div key={match.id} className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/40 text-center space-y-1 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex justify-between items-center px-sm text-[11px]">
                          <span className="font-semibold truncate max-w-[90px]">{match.home_name}</span>
                          <span className="font-mono bg-[#1b2b3f] text-on-surface-variant px-2 py-0.5 rounded text-[10px] font-bold">VS</span>
                          <span className="font-semibold truncate max-w-[90px]">{match.away_name}</span>
                        </div>
                        <span className="text-[9px] text-on-surface-variant block mt-1 flex items-center justify-center gap-1">
                          <Clock className="w-3 h-3 text-[#94d3c1]" /> {dayStr} • {timeStr}
                        </span>
                      </div>
                    )
                  })}
                </>
              )}
            </div>
          </div>
          
          <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-on-surface py-2 rounded-lg text-xs font-semibold transition-colors mt-md">
            Ver Todos os Jogos
          </button>
        </section>
      </div>

      {/* KPI Cards / Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg mt-lg">
        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Trophy className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Total de Golos</p>
            <h3 className="font-display text-xl font-bold">
              {kpis.goals_total} Golos <span className="text-xs text-primary font-normal">({kpis.avg_goals_per_match} por jogo)</span>
            </h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Total Atletas Inscritos</p>
            <h3 className="font-display text-xl font-bold">{data?.kpis.total_players || 0}</h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Jogos Realizados</p>
            <h3 className="font-display text-xl font-bold">
              {kpis.matches_finished} de {kpis.total_matches} J.
            </h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
