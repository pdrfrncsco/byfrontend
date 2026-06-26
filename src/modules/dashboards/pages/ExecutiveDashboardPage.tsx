import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { useDashboardOverview } from '../hooks/useDashboard'
import { 
  Network, 
  Building2, 
  Trophy, 
  Users, 
  Heart, 
  BarChart3,
  DollarSign,
  Clock
} from 'lucide-react'

export function ExecutiveDashboardPage() {
  const { data, isLoading } = useDashboardOverview()


  const sidebarLinks = [
    { label: 'Ecossistema', href: '#ecosystem', icon: <Network className="w-5 h-5" />, active: true },
    { label: 'Organizações', href: '#organizations', icon: <Building2 className="w-5 h-5" /> },
    { label: 'Clubes', href: '#clubs', icon: <Trophy className="w-5 h-5" /> },
    { label: 'Jogadores', href: '#players', icon: <Users className="w-5 h-5" /> },
    { label: 'Fan Zone', href: '#fanzone', icon: <Heart className="w-5 h-5" /> },
    { label: 'Estatísticas', href: '#analytics', icon: <BarChart3 className="w-5 h-5" /> },
  ]

  const headerActions = (
    <div className="flex items-center gap-sm bg-[#1b2b3f] p-1 rounded-lg border border-[#26364a] text-xs">
      <button className="px-md py-1.5 rounded bg-primary text-on-primary font-semibold">Temporada 23/24</button>
      <button className="px-md py-1.5 rounded text-on-surface-variant font-semibold hover:bg-[#26364a] transition-all">Histórico</button>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#031427] flex items-center justify-center">
        <div className="text-center space-y-md">
          <div className="w-12 h-12 border-4 border-[#94d3c1] border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-on-surface-variant text-xs font-semibold uppercase tracking-widest mt-4">Carregando dados da API...</p>
        </div>
      </div>
    )
  }

  // Formatting helpers
  const formatKz = (value: number) => {
    if (value >= 1000000) {
      return `Kz ${(value / 1000000).toFixed(1)}M`
    }
    if (value >= 1000) {
      return `Kz ${(value / 1000).toFixed(0)}K`
    }
    return `Kz ${value}`
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat('pt-AO').format(value)
  }

  const kpis = data?.kpis || {
    total_clubs: 0,
    total_players: 0,
    active_tournaments: 0,
    total_revenue: 0,
    players_this_month: 0
  }

  return (
    <DashboardLayout
      title="Estatuto do Ecossistema BolaYetu"
      subtitle="Dados globais e monitoramento de desempenho integrado para todas as ligas e escalões de Angola."
      dashboardType="executive"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      {/* KPI Section */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-md animate-fade-in">
        {/* Competitions */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <Trophy className="text-primary w-5 h-5" />
            <span className="text-[10px] px-2 py-0.5 bg-[#94d3c1]/10 text-[#94d3c1] rounded-full font-bold">Ativas</span>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Competições</p>
            <h3 className="font-display text-2xl font-bold text-on-surface">{kpis.active_tournaments}</h3>
          </div>
        </div>

        {/* Clubs */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <Building2 className="text-[#e9c349] w-5 h-5" />
            <span className="text-[10px] px-2 py-0.5 bg-[#e9c349]/10 text-[#e9c349] rounded-full font-bold">Registados</span>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Clubes Registados</p>
            <h3 className="font-display text-2xl font-bold text-on-surface">{kpis.total_clubs}</h3>
          </div>
        </div>

        {/* Players */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <Users className="text-primary w-5 h-5" />
            <span className="text-[10px] px-2 py-0.5 bg-[#94d3c1]/10 text-[#94d3c1] rounded-full font-bold">
              +{kpis.players_this_month} este mês
            </span>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Atletas Inscritos</p>
            <h3 className="font-display text-2xl font-bold text-on-surface">{formatNumber(kpis.total_players)}</h3>
          </div>
        </div>

        {/* Revenue */}
        <div className="glass-card p-md rounded-xl flex flex-col justify-between h-32">
          <div className="flex justify-between items-start">
            <DollarSign className="text-[#e9c349] w-5 h-5" />
            <span className="text-[10px] px-2 py-0.5 bg-[#e9c349]/10 text-[#e9c349] rounded-full font-bold">Faturação</span>
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Receitas Totais</p>
            <h3 className="font-display text-2xl font-bold text-on-surface">{formatKz(kpis.total_revenue)}</h3>
          </div>
        </div>
      </div>

      {/* Main Grid: Competitions Table & Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
        {/* Competitions List */}
        <section className="glass-card rounded-xl overflow-hidden flex flex-col p-0">
          <div className="p-md border-b border-[#26364a]/50 flex justify-between items-center bg-[#102034]/50">
            <h4 className="font-display text-base font-bold">Gestão de Provas</h4>
            <button className="text-primary hover:underline text-xs font-semibold">Ver Todas</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-[#1b2b3f]/40 border-b border-[#26364a]/40 text-on-surface-variant">
                  <th className="px-md py-3 uppercase tracking-wider font-semibold">Competição</th>
                  <th className="px-md py-3 uppercase tracking-wider font-semibold text-center">Status</th>
                  <th className="px-md py-3 uppercase tracking-wider font-semibold text-center">Clubes</th>
                  <th className="px-md py-3 uppercase tracking-wider font-semibold text-right">Progresso</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26364a]/30 font-mono text-[11px]">
                {data?.tournaments.map((tour) => (
                  <tr key={tour.id} className="hover:bg-[#1b2b3f]/20 transition-colors">
                    <td className="px-md py-3.5 font-display text-xs text-on-surface font-semibold flex items-center gap-sm">
                      {tour.logo ? (
                        <img src={tour.logo} alt={tour.name} className="w-6 h-6 object-contain rounded" />
                      ) : (
                        <Trophy className="w-5 h-5 text-primary-fixed-dim" />
                      )}
                      {tour.name}
                    </td>
                    <td className="px-md py-3.5 text-center">
                      <span className={`px-2 py-0.5 rounded font-bold text-[9px] ${
                        tour.status === 'Em andamento' || tour.status === 'LIVE'
                          ? 'bg-primary/20 text-[#94d3c1]'
                          : 'bg-[#26364a] text-on-surface-variant'
                      }`}>
                        {tour.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-md py-3.5 text-center">{tour.teams}</td>
                    <td className="px-md py-3.5 text-right font-semibold text-on-surface-variant">
                      {tour.progress}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Simplified Bar Chart */}
        <section className="glass-card rounded-xl flex flex-col p-0 overflow-hidden">
          <div className="p-md border-b border-[#26364a]/50 flex justify-between items-center bg-[#102034]/50">
            <h4 className="font-display text-base font-bold">Métricas de Golos por Torneio</h4>
            <div className="flex gap-sm text-[9px] font-bold tracking-wider">
              <div className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 bg-primary rounded-full"></span>
                <span>GOLOS REAIS</span>
              </div>
            </div>
          </div>
          <div className="flex-1 p-md flex items-end gap-md relative h-48 mt-2">
            <div className="absolute inset-0 pointer-events-none opacity-5" style={{ backgroundImage: 'linear-gradient(#bfc9c4 1px, transparent 1px), linear-gradient(90deg, #bfc9c4 1px, transparent 1px)', backgroundSize: '30px 30px' }}></div>
            
            {data?.goals_evolution.map((evol, idx) => (
              <div key={idx} className="flex-1 flex flex-col justify-end gap-1 group cursor-pointer text-center">
                {evol.data.map((d, dIdx) => (
                  <div key={dIdx} className="w-full space-y-1">
                    <div 
                      className="bg-primary rounded-t transition-all group-hover:brightness-110 mx-auto w-12"
                      style={{ height: `${Math.min(d.goals * 2, 120)}px` }}
                      title={`${evol.tournament_name}: ${d.goals} golos`}
                    ></div>
                    <span className="text-[10px] text-on-surface-variant font-bold block">{d.goals}G</span>
                  </div>
                ))}
                <span className="text-[9px] text-center text-on-surface-variant truncate mt-1 block max-w-[120px] mx-auto">
                  {evol.tournament_name}
                </span>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* Rankings, Players and Calendar Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-lg">
        {/* Top Clubs Ranking */}
        <div className="glass-card rounded-xl flex flex-col p-md">
          <div className="border-b border-[#26364a]/50 pb-sm mb-sm">
            <h4 className="font-display text-sm font-bold">Top Clubes por Performance</h4>
          </div>
          <div className="space-y-sm text-xs">
            {data?.top_clubs_by_players.map((club, idx) => (
              <div key={club.id} className="flex items-center gap-md p-1.5 hover:bg-[#1b2b3f]/20 rounded-lg transition-colors">
                <div className="w-6 font-display text-primary italic font-bold">
                  {String(idx + 1).padStart(2, '0')}
                </div>
                {club.logo ? (
                  <img src={club.logo} alt={club.name} className="w-8 h-8 object-contain rounded" />
                ) : (
                  <div className="w-8 h-8 rounded-lg bg-[#26364a] flex items-center justify-center font-bold text-[10px]">
                    {club.acronym || club.name.slice(0, 2)}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">{club.name}</p>
                  <div className="w-full h-1 bg-[#26364a] rounded-full mt-1.5 overflow-hidden">
                    <div 
                      className="h-full bg-primary rounded-full" 
                      style={{ width: `${Math.min((club.goals / 50) * 100, 100)}%` }}
                    ></div>
                  </div>
                </div>
                <span className="font-mono text-primary font-bold">{club.goals}G</span>
              </div>
            ))}
          </div>
        </div>

        {/* Top Scorers */}
        <div className="glass-card rounded-xl flex flex-col p-md">
          <div className="border-b border-[#26364a]/50 pb-sm mb-sm">
            <h4 className="font-display text-sm font-bold">Melhores Marcadores</h4>
          </div>
          <div className="space-y-sm overflow-y-auto max-h-56 custom-scrollbar pr-1">
            {data?.top_scorers.map((scorer) => (
              <div key={scorer.id} className="flex items-center gap-md p-1.5 hover:bg-[#1b2b3f]/20 rounded-lg transition-all text-xs">
                {scorer.avatar ? (
                  <img src={scorer.avatar} alt={scorer.name} className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">
                    {scorer.name.split(' ').map(n => n[0]).join('')}
                  </div>
                )}
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">{scorer.nickname || scorer.name}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase">{scorer.club}</p>
                </div>
                <span className="font-mono text-primary font-bold">{scorer.goals} Golos</span>
              </div>
            ))}
          </div>
        </div>

        {/* Competition Calendar */}
        <div className="glass-card rounded-xl flex flex-col p-md">
          <div className="border-b border-[#26364a]/50 pb-sm mb-sm">
            <h4 className="font-display text-sm font-bold">Calendário de Jogos</h4>
          </div>
          <div className="space-y-sm text-xs">
            {data?.upcoming_matches.map((match) => {
              const matchDate = new Date(match.date)
              const month = matchDate.toLocaleString('pt-AO', { month: 'short' })
              const day = matchDate.getDate()
              const time = matchDate.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })

              return (
                <div key={match.id} className="flex gap-md items-center p-1.5 hover:bg-[#1b2b3f]/20 rounded-lg transition-all">
                  <div className="flex flex-col items-center justify-center min-w-[44px] h-10 rounded bg-[#26364a] border border-[#3f4945]">
                    <span className="text-[9px] font-bold text-on-surface-variant uppercase leading-none">{month}</span>
                    <span className="font-display text-base font-bold text-primary">{day}</span>
                  </div>
                  <div>
                    <p className="font-semibold text-on-surface leading-none truncate max-w-[150px]">
                      {match.home_name} vs {match.away_name}
                    </p>
                    <p className="text-[10px] text-on-surface-variant mt-1.5 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-primary-fixed-dim" /> {time} • {match.tournament}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
