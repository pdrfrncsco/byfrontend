import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { 
  Home, 
  Users, 
  RefreshCw, 
  FileText, 
  LineChart, 
  Trophy,
  ArrowRight,
  TrendingUp,
  Award,
  Contact2
} from 'lucide-react'

export function ClubDashboardPage() {
  const sidebarLinks = [
    { label: 'Geral', href: '#home', icon: <Home className="w-5 h-5" />, active: true },
    { label: 'Plantel', href: '#squad', icon: <Users className="w-5 h-5" /> },
    { label: 'Equipa Técnica', href: '#staff', icon: <Contact2 className="w-5 h-5" /> },
    { label: 'Transferências', href: '#transfers', icon: <RefreshCw className="w-5 h-5" /> },
    { label: 'Documentos', href: '#documents', icon: <FileText className="w-5 h-5" /> },
    { label: 'Estatísticas', href: '#stats', icon: <LineChart className="w-5 h-5" /> },
  ]

  const headerActions = (
    <button className="bg-primary text-on-primary px-md py-sm rounded-lg font-bold flex items-center gap-sm hover:brightness-110 transition-all text-xs">
      Registar Novo Jogador
    </button>
  )

  return (
    <DashboardLayout
      title="Portal do Clube | Petro de Luanda"
      subtitle="Painel administrativo de gestão de atletas, contratos, staff técnico e licenciamento do clube."
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-lg">
        {/* Squad management bento block */}
        <section className="glass-card rounded-xl p-md lg:col-span-8 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h3 className="font-display text-lg text-on-surface">Plantel Geral (Elenco Principal)</h3>
              <span className="text-xs text-on-surface-variant font-semibold">28 Jogadores Registados</span>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-sm">
              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex items-center gap-md">
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">TS</div>
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-on-surface">Tiago Santos</p>
                  <p className="text-[10px] text-on-surface-variant">Guarda-Redes • 28 Anos • Contrato: 2027</p>
                </div>
                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">TITULAR</span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex items-center gap-md">
                <div className="w-9 h-9 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs">GM</div>
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-on-surface">Gilberto Mbulu</p>
                  <p className="text-[10px] text-on-surface-variant">Avançado • 24 Anos • Contrato: 2026</p>
                </div>
                <span className="text-[10px] text-primary bg-primary/10 px-2 py-0.5 rounded font-bold">TITULAR</span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex items-center gap-md">
                <div className="w-9 h-9 rounded-full bg-[#e9c349]/20 text-[#e9c349] flex items-center justify-center font-bold text-xs">AC</div>
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-on-surface">António Cruz</p>
                  <p className="text-[10px] text-on-surface-variant">Médio Centro • 19 Anos • Contrato: 2029</p>
                </div>
                <span className="text-[10px] text-[#e9c349] bg-[#e9c349]/10 px-2 py-0.5 rounded font-bold">ACADEMIA</span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex items-center gap-md">
                <div className="w-9 h-9 rounded-full bg-secondary/20 text-secondary flex items-center justify-center font-bold text-xs">ML</div>
                <div className="flex-1 text-xs">
                  <p className="font-semibold text-on-surface">Manuel Lopes</p>
                  <p className="text-[10px] text-on-surface-variant">Defesa Direito • 31 Anos • Contrato: 2025</p>
                </div>
                <span className="text-[10px] text-on-surface-variant bg-[#26364a] px-2 py-0.5 rounded font-bold">SUPLENTE</span>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-on-surface py-2 rounded-lg text-xs font-semibold transition-colors mt-lg flex items-center justify-center gap-1">
            Gerir Plantel Completo <ArrowRight className="w-4 h-4" />
          </button>
        </section>

        {/* Club Licencing / Compliance block */}
        <section className="glass-card rounded-xl p-md lg:col-span-4 flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center border-b border-[#26364a]/50 pb-sm mb-md">
              <h3 className="font-display text-lg text-on-surface">Conformidade e Licenças</h3>
              <Award className="text-primary w-5 h-5" />
            </div>
            
            <div className="space-y-sm text-xs">
              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-on-surface">Licença de Participação Girabola</p>
                  <p className="text-[10px] text-primary font-bold">APROVADA</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex justify-between items-center">
                <div>
                  <p className="font-semibold text-on-surface">Certificação das Finanças do Clube</p>
                  <p className="text-[10px] text-[#e9c349] font-bold">EM AUDITORIA</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-[#e9c349]"></span>
              </div>

              <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex justify-between items-center opacity-60">
                <div>
                  <p className="font-semibold text-on-surface">Licenciamento de Estádio CAF</p>
                  <p className="text-[10px] text-on-surface-variant font-bold">NÃO APLICADO</p>
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-on-surface-variant"></span>
              </div>
            </div>
          </div>
          
          <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-on-surface py-2 rounded-lg text-xs font-semibold transition-colors mt-lg flex items-center justify-center gap-1">
            Submeter Ficheiro de Auditoria
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
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Títulos Girabola</p>
            <h3 className="font-display text-xl font-bold">17 Campeonatos</h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Golos Marcados (Época)</p>
            <h3 className="font-display text-xl font-bold">28 Golos <span className="text-xs text-on-surface-variant font-normal">(1.8 p/ jogo)</span></h3>
          </div>
        </div>

        <div className="glass-card p-md rounded-xl flex items-center gap-md">
          <div className="p-sm bg-primary/10 rounded-lg text-primary">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Jogadores Formados (Academia)</p>
            <h3 className="font-display text-xl font-bold">12 no Plantel A</h3>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
