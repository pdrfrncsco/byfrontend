import { DashboardLayout } from '@/app/layouts/DashboardLayout'
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
  Users
} from 'lucide-react'

export function LeagueDashboardPage() {
  const sidebarLinks = [
    { label: 'Geral', href: '#home', icon: <Home className="w-5 h-5" />, active: true },
    { label: 'Scouting', href: '#scouting', icon: <Search className="w-5 h-5" /> },
    { label: 'Transferências', href: '#transfers', icon: <RefreshCw className="w-5 h-5" /> },
    { label: 'Equipa Médica', href: '#medical', icon: <Activity className="w-5 h-5" /> },
    { label: 'Academia', href: '#academy', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Finanças', href: '#finance', icon: <DollarSign className="w-5 h-5" /> },
  ]

  const headerActions = (
    <div className="flex items-center gap-sm">
      <button className="bg-[#1b2b3f] border border-[#26364a] text-on-surface px-md py-sm rounded-lg flex items-center gap-sm hover:bg-[#26364a] transition-all text-xs font-semibold">
        Imprimir Calendário
      </button>
      <button className="bg-[#e9c349] text-[#241a00] px-md py-sm rounded-lg font-bold flex items-center gap-sm hover:opacity-90 transition-all shadow-lg text-xs">
        Painel de Arbitragem
      </button>
    </div>
  )

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
            <span className="text-[10px] text-primary bg-primary/10 px-2.5 py-0.5 rounded-full font-bold">Ronda 12 de 30</span>
          </div>
          <div className="overflow-x-auto text-xs">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-[#1b2b3f]/40 border-b border-[#26364a]/40 text-on-surface-variant">
                  <th className="px-md py-3 text-center w-12 font-semibold">Pos</th>
                  <th className="px-md py-3 font-semibold">Clube</th>
                  <th className="px-md py-3 text-center font-semibold">J</th>
                  <th className="px-md py-3 text-center font-semibold">V</th>
                  <th className="px-md py-3 text-center font-semibold">E</th>
                  <th className="px-md py-3 text-center font-semibold">D</th>
                  <th className="px-md py-3 text-center font-semibold">GM-GS</th>
                  <th className="px-md py-3 text-right font-semibold pr-md">PTS</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#26364a]/30 font-mono text-[11px]">
                <tr className="hover:bg-[#1b2b3f]/20 transition-colors">
                  <td className="px-md py-3 text-center font-display font-bold text-primary">1</td>
                  <td className="px-md py-3 font-display font-semibold text-on-surface text-xs">Petro de Luanda</td>
                  <td className="px-md py-3 text-center">12</td>
                  <td className="px-md py-3 text-center">9</td>
                  <td className="px-md py-3 text-center">2</td>
                  <td className="px-md py-3 text-center">1</td>
                  <td className="px-md py-3 text-center">24-6</td>
                  <td className="px-md py-3 text-right font-display font-bold text-primary pr-md">29</td>
                </tr>
                <tr className="hover:bg-[#1b2b3f]/20 transition-colors">
                  <td className="px-md py-3 text-center font-display font-bold">2</td>
                  <td className="px-md py-3 font-display font-semibold text-on-surface text-xs">Sagrada Esperança</td>
                  <td className="px-md py-3 text-center">12</td>
                  <td className="px-md py-3 text-center">8</td>
                  <td className="px-md py-3 text-center">3</td>
                  <td className="px-md py-3 text-center">1</td>
                  <td className="px-md py-3 text-center">19-8</td>
                  <td className="px-md py-3 text-right font-display font-bold pr-md">27</td>
                </tr>
                <tr className="hover:bg-[#1b2b3f]/20 transition-colors">
                  <td className="px-md py-3 text-center font-display font-bold">3</td>
                  <td className="px-md py-3 font-display font-semibold text-on-surface text-xs">1º de Agosto</td>
                  <td className="px-md py-3 text-center">12</td>
                  <td className="px-md py-3 text-center">7</td>
                  <td className="px-md py-3 text-center">4</td>
                  <td className="px-md py-3 text-center">1</td>
                  <td className="px-md py-3 text-center">18-7</td>
                  <td className="px-md py-3 text-right font-display font-bold pr-md">25</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Live Matches Widget */}
        <section className="glass-card rounded-xl p-md flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h4 className="font-display text-sm font-bold flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-primary animate-pulse" /> Jogos em Destaque
              </h4>
              <span className="w-2 h-2 bg-[#D1102B] rounded-full animate-ping"></span>
            </div>
            
            <div className="space-y-sm text-xs">
              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/40 text-center space-y-2">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">GIRABOLA • LIVE</p>
                <div className="flex justify-between items-center px-sm">
                  <span className="font-semibold">Petro de Luanda</span>
                  <span className="font-mono bg-primary/20 text-primary px-2.5 py-0.5 rounded font-bold">2 - 1</span>
                  <span className="font-semibold">1º de Agosto</span>
                </div>
                <span className="text-[10px] text-primary block mt-1">74' (Segunda Parte)</span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/40 text-center space-y-2 opacity-70">
                <p className="text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">GIRABOLA • HOJE 17:00</p>
                <div className="flex justify-between items-center px-sm">
                  <span className="font-semibold">Wiliete SC</span>
                  <span className="font-mono bg-[#1b2b3f] text-on-surface-variant px-2.5 py-0.5 rounded font-bold">vs</span>
                  <span className="font-semibold">Desp. Huíla</span>
                </div>
              </div>
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
            <h3 className="font-display text-xl font-bold">264 Golos <span className="text-xs text-primary font-normal">(2.2 por jogo)</span></h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-[#e9c349]/10 rounded-lg text-[#e9c349]">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Espectadores (Média)</p>
            <h3 className="font-display text-xl font-bold">8.420 por J.</h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Jogos Realizados</p>
            <h3 className="font-display text-xl font-bold">96 de 240 J.</h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
