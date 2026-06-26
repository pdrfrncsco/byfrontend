import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { 
  Home, 
  Trophy, 
  Calendar, 
  Gavel, 
  MapPin, 
  ShieldAlert, 
  ArrowRight,
  TrendingUp,
  Award
} from 'lucide-react'

export function CompetitionDashboardPage() {
  const sidebarLinks = [
    { label: 'Geral', href: '#home', icon: <Home className="w-5 h-5" />, active: true },
    { label: 'Torneios', href: '#tournaments', icon: <Trophy className="w-5 h-5" /> },
    { label: 'Partidas', href: '#matches', icon: <Calendar className="w-5 h-5" /> },
    { label: 'Árbitros', href: '#referees', icon: <Gavel className="w-5 h-5" /> },
    { label: 'Estádios', href: '#venues', icon: <MapPin className="w-5 h-5" /> },
    { label: 'Conformidade', href: '#compliance', icon: <ShieldAlert className="w-5 h-5" /> },
  ]

  const headerActions = (
    <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold flex items-center gap-sm hover:brightness-110 transition-all text-xs">
      Criar Nova Competição
    </button>
  )

  return (
    <DashboardLayout
      title="Organizador de Competições"
      subtitle="Gestão desportiva de torneios, escalamento de arbitragem, vistorias de recintos e conformidade técnica."
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Tournament Management block */}
        <section className="glass-card rounded-xl p-md lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h3 className="font-display text-lg text-on-surface">Torneios Ativos</h3>
              <span className="text-xs text-on-surface-variant font-semibold">4 Competições em Curso</span>
            </div>
            
            <div className="space-y-sm text-xs">
              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-on-surface">Taça de Angola 2026</p>
                  <p className="text-[10px] text-on-surface-variant">Fase de Grupos • 32 Equipas • Próxima Jornada: 05 Nov</p>
                </div>
                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">EM CURSO</span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex items-center justify-between">
                <div>
                  <p className="font-semibold text-on-surface">Campeonato Nacional de Sub-17</p>
                  <p className="text-[10px] text-on-surface-variant">Fase Final • 8 Equipas • Próxima Jornada: Hoje 16:00</p>
                </div>
                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">EM CURSO</span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex items-center justify-between opacity-70">
                <div>
                  <p className="font-semibold text-on-surface">Supertaça de Angola</p>
                  <p className="text-[10px] text-on-surface-variant">Final de Jogo Único • Petro vs 1º de Agosto • 15 Nov</p>
                </div>
                <span className="text-[10px] text-[#e9c349] bg-[#e9c349]/10 px-2 py-0.5 rounded font-bold">PREPARADA</span>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-on-surface py-2 rounded-lg text-xs font-semibold transition-colors mt-lg flex items-center justify-center gap-1">
            Visualizar Todos os Torneios <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Referee and Technical Delegation */}
        <section className="glass-card rounded-xl p-md lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h3 className="font-display text-lg text-on-surface">Escalamento de Arbitragem</h3>
              <Gavel className="text-primary w-5 h-5" />
            </div>
            
            <div className="space-y-sm text-xs">
              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30">
                <p className="font-semibold text-on-surface">Jogo: Petro de Luanda vs 1º de Agosto</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Árbitro: Manuel Dembo (Elite FIFA)</p>
                <span className="text-[9px] text-primary font-bold uppercase tracking-wider block mt-1">NOMEAÇÃO ATRIBUÍDA</span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 opacity-70">
                <p className="font-semibold text-on-surface">Jogo: Wiliete SC vs Desp. Huíla</p>
                <p className="text-[10px] text-on-surface-variant mt-1">Árbitro: Teresa Kiala (VAR)</p>
                <span className="text-[9px] text-[#e9c349] font-bold uppercase tracking-wider block mt-1">AGUARDA CONFIRMAÇÃO</span>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-on-surface py-2 rounded-lg text-xs font-semibold transition-colors mt-lg flex items-center justify-center gap-1">
            Painel de Nomeação Arbitral
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
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Total Torneios Realizados</p>
            <h3 className="font-display text-xl font-bold">14 na Plataforma</h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Jogos Agendados (Esta Semana)</p>
            <h3 className="font-display text-xl font-bold">24 Partidas</h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Award className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Árbitros Registados</p>
            <h3 className="font-display text-xl font-bold">96 Árbitros Activos</h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
