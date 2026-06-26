import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { 
  Home, 
  Search, 
  RefreshCw, 
  Activity, 
  GraduationCap, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Star, 
  ShieldCheck, 
  MapPin, 
  Gavel, 
  ArrowRight,
  BookOpen
} from 'lucide-react'

export function FederationDashboardPage() {
  const sidebarLinks = [
    { label: 'Home', href: '#home', icon: <Home className="w-5 h-5" />, active: true },
    { label: 'Scouting', href: '#scouting', icon: <Search className="w-5 h-5" /> },
    { label: 'Transfers', href: '#transfers', icon: <RefreshCw className="w-5 h-5" /> },
    { label: 'Médico', href: '#medical', icon: <Activity className="w-5 h-5" /> },
    { label: 'Academia', href: '#academy', icon: <GraduationCap className="w-5 h-5" /> },
    { label: 'Finanças', href: '#finance', icon: <DollarSign className="w-5 h-5" /> },
  ]

  const headerActions = (
    <>
      <button className="bg-[#1b2b3f] border border-[#26364a] text-[#d3e4fe] px-md py-sm rounded-lg flex items-center gap-sm hover:bg-[#26364a] transition-all text-xs font-semibold">
        Exportar Auditoria
      </button>
      <button className="bg-[#D1102B] text-white px-md py-sm rounded-lg font-bold flex items-center gap-sm hover:opacity-90 transition-all shadow-lg text-xs">
        Gerir Conformidade
      </button>
    </>
  )

  return (
    <DashboardLayout
      title="Visão Geral da Federação"
      subtitle="Monitorização em tempo real da governação e auditoria de desempenho do ecossistema da Federação Angolana de Futebol (FAF)."
      dashboardType="federation"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-12 gap-gutter">
        {/* National Team Performance Bento Card */}
        <div className="md:col-span-4 lg:col-span-8 glass-card rounded-xl p-lg flex flex-col justify-between group overflow-hidden relative min-h-[250px]">
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-lg">
              <div>
                <p className="text-xs uppercase tracking-widest text-[#94d3c1] mb-1 font-semibold">Performance de Elite</p>
                <h3 className="font-display text-2xl md:text-3xl text-on-surface">Radar da Seleção Nacional</h3>
              </div>
              <div className="flex items-center gap-2 px-3 py-1 bg-[#94d3c1]/10 rounded-full border border-[#94d3c1]/20">
                <span className="w-2 h-2 rounded-full bg-[#94d3c1] animate-pulse"></span>
                <span className="text-[10px] text-[#94d3c1] font-bold tracking-wider">JOGOS AO VIVO</span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-md mb-lg">
              <div className="bg-[#0b1c30] p-md border border-[#26364a]/40 rounded-lg">
                <span className="text-on-surface-variant text-[11px] uppercase tracking-wider block">Rácio de Vitórias</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-display text-3xl text-on-surface font-bold">68%</span>
                  <span className="text-[#94d3c1] text-xs flex items-center gap-0.5"><TrendingUp className="w-3.5 h-3.5" /> +4%</span>
                </div>
              </div>
              <div className="bg-[#0b1c30] p-md border border-[#26364a]/40 rounded-lg">
                <span className="text-on-surface-variant text-[11px] uppercase tracking-wider block">Ranking FIFA</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-display text-3xl text-[#e9c349] font-bold">92</span>
                  <span className="text-[#ffb4ab] text-xs flex items-center gap-0.5"><TrendingDown className="w-3.5 h-3.5" /> -2</span>
                </div>
              </div>
              <div className="bg-[#0b1c30] p-md border border-[#26364a]/40 rounded-lg">
                <span className="text-on-surface-variant text-[11px] uppercase tracking-wider block">Diferença de Golos</span>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="font-display text-3xl text-on-surface font-bold">+14</span>
                  <span className="text-[#94d3c1] text-xs flex items-center gap-0.5"><Star className="w-3.5 h-3.5 fill-[#94d3c1]" /> Peak</span>
                </div>
              </div>
            </div>
          </div>

          <div className="h-24 w-full mt-auto opacity-40 group-hover:opacity-85 transition-opacity duration-300">
            {/* SVG Wave */}
            <svg className="w-full h-full text-[#94d3c1] stroke-current fill-none" preserveAspectRatio="none" viewBox="0 0 800 100">
              <path d="M0,50 Q100,20 200,50 T400,50 T600,50 T800,50" strokeWidth="2.5" className="animate-pulse"></path>
              <path d="M0,60 Q100,30 200,60 T400,60 T600,60 T800,60" opacity="0.4" strokeWidth="1.5"></path>
            </svg>
          </div>
          <div className="absolute -right-12 -bottom-12 w-48 h-48 bg-[#D1102B]/5 rounded-full blur-3xl group-hover:bg-[#D1102B]/10 transition-all duration-300"></div>
        </div>

        {/* CAF Compliance Gauge Card */}
        <div className="md:col-span-4 lg:col-span-4 glass-card rounded-xl p-lg border-l-4 border-l-[#e9c349] flex flex-col justify-between">
          <div className="flex justify-between items-center mb-md">
            <h3 className="font-display text-xl text-on-surface">Conformidade CAF</h3>
            <ShieldCheck className="text-[#e9c349] w-6 h-6" />
          </div>
          
          <div className="flex flex-col items-center justify-center py-4 relative">
            <svg className="w-32 h-32 transform -rotate-90">
              <circle className="text-[#26364a]/40" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeWidth="10"></circle>
              <circle className="text-[#e9c349]" cx="64" cy="64" fill="transparent" r="54" stroke="currentColor" strokeDasharray="339.3" strokeDashoffset="33.9" strokeWidth="10" strokeLinecap="round"></circle>
            </svg>
            <div className="absolute text-center">
              <span className="font-display text-3xl font-bold block text-on-surface">90<span className="text-xs text-on-surface-variant font-normal">%</span></span>
              <span className="text-[10px] text-on-surface-variant uppercase tracking-widest font-semibold">Audit Score</span>
            </div>
          </div>
          
          <ul className="space-y-sm mt-md">
            <li className="flex items-center justify-between text-xs p-2.5 bg-[#0b1c30] rounded-lg border border-[#26364a]/20">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#94d3c1]"></span> Licenciamento de Clubes</span>
              <span className="font-mono text-[#94d3c1] font-semibold">100%</span>
            </li>
            <li className="flex items-center justify-between text-xs p-2.5 bg-[#0b1c30] rounded-lg border border-[#26364a]/20">
              <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-[#94d3c1]"></span> Infraestrutura</span>
              <span className="font-mono text-[#94d3c1] font-semibold">82%</span>
            </li>
          </ul>
        </div>

        {/* Regional Associations */}
        <div className="md:col-span-4 lg:col-span-4 glass-card rounded-xl p-lg flex flex-col justify-between">
          <div className="flex justify-between items-start mb-lg">
            <h3 className="font-display text-xl text-on-surface">Associações Regionais</h3>
            <button className="text-[#94d3c1] hover:underline text-xs font-bold uppercase tracking-wider">Ver Mapa</button>
          </div>
          
          <div className="space-y-md">
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 bg-[#26364a] rounded-lg flex items-center justify-center font-bold text-xs text-on-surface">LU</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <p>Assoc. Luanda</p>
                  <span className="text-[#94d3c1]">ATIVO</span>
                </div>
                <div className="w-full bg-[#26364a] h-1.5 rounded-full mt-2">
                  <div className="bg-[#94d3c1] h-full w-[85%] rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-md">
              <div className="w-10 h-10 bg-[#26364a] rounded-lg flex items-center justify-center font-bold text-xs text-on-surface">BE</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <p>Assoc. Benguela</p>
                  <span className="text-[#e9c349]">PENDENTE</span>
                </div>
                <div className="w-full bg-[#26364a] h-1.5 rounded-full mt-2">
                  <div className="bg-[#e9c349] h-full w-[60%] rounded-full"></div>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-md opacity-60">
              <div className="w-10 h-10 bg-[#26364a] rounded-lg flex items-center justify-center font-bold text-xs text-on-surface">HU</div>
              <div className="flex-1">
                <div className="flex justify-between text-xs font-semibold">
                  <p>Assoc. Huíla</p>
                  <span className="text-on-surface-variant">INATIVO</span>
                </div>
                <div className="w-full bg-[#26364a] h-1.5 rounded-full mt-2">
                  <div className="bg-on-surface-variant h-full w-[30%] rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Referee Management Card */}
        <div className="md:col-span-4 lg:col-span-5 glass-card rounded-xl p-lg flex flex-col gap-lg justify-between">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-on-surface">Corpo de Arbitragem</h3>
            <Gavel className="text-on-surface-variant w-5 h-5" />
          </div>
          
          <div className="grid grid-cols-2 gap-md">
            <div className="p-md bg-[#0b1c30]/50 border border-[#26364a]/30 rounded-lg text-center">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Elite FIFA</span>
              <p className="font-display text-2xl font-bold mt-1 text-on-surface">12</p>
            </div>
            <div className="p-md bg-[#0b1c30]/50 border border-[#26364a]/30 rounded-lg text-center">
              <span className="text-[10px] text-on-surface-variant uppercase tracking-wider block">Nacional A</span>
              <p className="font-display text-2xl font-bold mt-1 text-on-surface">84</p>
            </div>
          </div>
          
          <div className="flex-1">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-on-surface uppercase">Certificações Recentes</span>
              <span className="text-[#94d3c1] text-[9px] tracking-widest font-bold">LIVE UPDATE</span>
            </div>
            <div className="space-y-2 overflow-y-auto max-h-32 custom-scrollbar pr-1">
              <div className="flex items-center justify-between p-2.5 bg-[#1b2b3f]/30 rounded-lg border border-[#26364a]/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#94d3c1]"></div>
                  <span className="font-semibold text-on-surface">Manuel D.</span>
                </div>
                <span className="text-on-surface-variant text-[11px]">Grau 1 Aprovado</span>
              </div>
              <div className="flex items-center justify-between p-2.5 bg-[#1b2b3f]/30 rounded-lg border border-[#26364a]/10 text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#94d3c1]"></div>
                  <span className="font-semibold text-on-surface">Teresa K.</span>
                </div>
                <span className="text-on-surface-variant text-[11px]">Certificação VAR</span>
              </div>
            </div>
          </div>
        </div>

        {/* Infrastructure Roadmap Card */}
        <div className="md:col-span-4 lg:col-span-3 glass-card relative rounded-xl overflow-hidden group min-h-[220px] flex flex-col justify-end p-0">
          <img 
            alt="Stadium" 
            className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBdTyFTiYAYO6LxsOjFr3fF46LqEICVJbZ_gO-n4paWExpR2Im6S1iBKLqXJncjKVm8nlm9E4C6LpqkZVxyMRbH4ERSNlaTMxiLglDc3n4r268VfqGEN0DLWrCuA6KVqbbz2IqxjoUpmdq11MVoSFCcucPbShZbfyYryDrhtfgkWcLpt5Ly-BEpLjv3ueaobMp5RC2nSUVinve8XnVU3o-u4L8uKS782jJgeTNrpQ0bzZ2EUCpkr-JiC7EG0bDP29pt3IMO5-b9jOs"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#031427] via-[#031427]/40 to-transparent"></div>
          <div className="relative z-10 p-lg w-full">
            <span className="bg-[#D1102B] text-white text-[9px] font-bold px-2 py-0.5 rounded uppercase tracking-wider mb-2 inline-block">
              ESTRATÉGICO
            </span>
            <h4 className="font-display text-lg text-on-surface leading-tight font-bold">
              Plano de Expansão de Estádios 2026
            </h4>
            <div className="flex items-center gap-1.5 mt-2 text-[#94d3c1] cursor-pointer group/link">
              <span className="text-xs font-bold uppercase tracking-widest group-hover/link:underline">Saber Mais</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/link:translate-x-1" />
            </div>
          </div>
        </div>

        {/* Document Audit Portal / Quick Actions */}
        <div className="md:col-span-4 lg:col-span-4 glass-card rounded-xl p-lg flex flex-col justify-between">
          <div className="flex items-center justify-between mb-md">
            <h3 className="font-display text-xl text-on-surface">Biblioteca de Licenças</h3>
            <BookOpen className="text-on-surface-variant w-5 h-5" />
          </div>
          
          <div className="space-y-sm text-xs">
            <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex justify-between items-center cursor-pointer hover:border-[#94d3c1]/40 transition-colors">
              <div>
                <p className="font-semibold text-on-surface">Regulamento Girabola 2025/26</p>
                <p className="text-[10px] text-on-surface-variant">PDF • 4.2 MB</p>
              </div>
              <ArrowRight className="w-4 h-4 text-on-surface-variant" />
            </div>
            
            <div className="p-3 bg-[#0b1c30] rounded-lg border border-[#26364a]/30 flex justify-between items-center cursor-pointer hover:border-[#94d3c1]/40 transition-colors">
              <div>
                <p className="font-semibold text-on-surface">Diretivas CAF Licenciamento</p>
                <p className="text-[10px] text-on-surface-variant">PDF • 1.8 MB</p>
              </div>
              <ArrowRight className="w-4 h-4 text-on-surface-variant" />
            </div>
          </div>
          
          <button className="w-full bg-[#1b2b3f] hover:bg-[#26364a] text-[#d3e4fe] py-2.5 rounded-lg border border-[#26364a] font-semibold text-xs transition-colors mt-lg flex items-center justify-center gap-1.5">
            Ver Todos os Documentos <BookOpen className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Financials Summary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-gutter mt-xl">
        <div className="bg-[#1b2b3f]/30 p-lg rounded-xl border border-[#26364a]/40 flex items-center justify-between hover:border-[#94d3c1]/30 transition-all duration-300">
          <div>
            <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">FIFA Forward Funds</p>
            <p className="font-display text-2xl text-on-surface font-bold mt-1">
              $2.45M <span className="text-xs text-[#94d3c1] bg-[#94d3c1]/10 px-2 py-0.5 rounded ml-1 font-semibold">Alocado</span>
            </p>
          </div>
          <div className="w-10 h-10 bg-[#94d3c1]/10 rounded-full flex items-center justify-center text-[#94d3c1]">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-[#1b2b3f]/30 p-lg rounded-xl border border-[#26364a]/40 flex items-center justify-between hover:border-[#94d3c1]/30 transition-all duration-300">
          <div>
            <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">Solidariedade de Clubes</p>
            <p className="font-display text-2xl text-on-surface font-bold mt-1">
              $420K <span className="text-xs text-[#ffb4ab] bg-[#ffb4ab]/10 px-2 py-0.5 rounded ml-1 font-semibold">Distribuído</span>
            </p>
          </div>
          <div className="w-10 h-10 bg-[#D1102B]/10 rounded-full flex items-center justify-center text-[#D1102B]">
            <Activity className="w-5 h-5" />
          </div>
        </div>
        
        <div className="bg-[#1b2b3f]/30 p-lg rounded-xl border border-[#26364a]/40 flex items-center justify-between hover:border-[#94d3c1]/30 transition-all duration-300">
          <div>
            <p className="text-on-surface-variant text-[11px] uppercase tracking-wider">Investimento de Base</p>
            <p className="font-display text-2xl text-on-surface font-bold mt-1">
              $890K <span className="text-xs text-[#e9c349] bg-[#e9c349]/10 px-2 py-0.5 rounded ml-1 font-semibold">Investido</span>
            </p>
          </div>
          <div className="w-10 h-10 bg-[#e9c349]/10 rounded-full flex items-center justify-center text-[#e9c349]">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
