import { Trophy, UserCheck, ShieldAlert, CheckCircle, BarChart3, Activity, Users, FileSpreadsheet, LayoutTemplate } from 'lucide-react'

export function FeaturesGrid() {
  return (
    <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 space-y-3">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-xs font-bold uppercase tracking-wider">
          <LayoutTemplate className="h-3.5 w-3.5" />
          <span>Solução Desportiva Integral</span>
        </div>
        <h2 className="font-display-lg text-3xl sm:text-4xl md:text-5xl font-black text-on-surface tracking-tight">
          Tudo o que o Futebol Precisa num Único Ecossistema
        </h2>
        <p className="text-on-surface-variant text-sm sm:text-base leading-relaxed">
          Desenvolvido a pensar na realidade do desporto africano: robusto, intuitivo e com dados oficiais em tempo real para federações, clubes, adeptos e olheiros.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Card 1: Large - Centro de Jogos SofaScore */}
        <div className="md:col-span-2 rounded-2xl border border-outline-variant/20 bg-surface-container p-6 sm:p-8 space-y-5 shadow-xs hover:border-primary/40 transition-all group">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-primary/10 text-primary border border-primary/20">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-on-surface group-hover:text-primary transition-colors">
                Centro de Jogos ao Vivo estilo SofaScore
              </h3>
              <p className="text-xs text-on-surface-variant">Súmula eletrónica oficial, cronómetro e eventos minuto a minuto.</p>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            Acompanhe golos, substituições, cartões e estatísticas de jogo em direto com relógio sincronizado. A nossa central de jogos fornece uma experiência idêntica às maiores plataformas globais de desporto.
          </p>

          {/* Interactive Preview Bar */}
          <div className="rounded-xl border border-outline-variant/15 bg-surface-container-high/60 p-4 space-y-2 font-mono text-xs">
            <div className="flex justify-between items-center bg-surface-container p-2.5 rounded-lg border border-outline-variant/10">
              <span className="font-bold text-on-surface flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-destructive animate-pulse" />
                Girabola · 2T 74'
              </span>
              <span className="text-primary font-bold">Petro de Luanda 2 - 1 1º de Agosto</span>
            </div>
            <div className="flex justify-between items-center text-[11px] text-on-surface-variant px-1">
              <span>⚽ Mateus Gondo 23', 61'</span>
              <span>⚽ Zito Luvumbo 45'</span>
            </div>
          </div>
        </div>

        {/* Card 2: Medium - Campo Tático e Escalações */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 sm:p-8 space-y-5 shadow-xs hover:border-primary/40 transition-all flex flex-col justify-between">
          <div className="space-y-4">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 w-fit">
              <Users className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-on-surface">Escalações em Campo Tático Único</h3>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Visualização simultânea dos dois plantéis frente a frente no mesmo relvado regulamentar SVG, com formações, fotos, titulares e suplentes em colunas paralelas.
            </p>
          </div>

          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 text-xs font-semibold text-emerald-500 flex items-center gap-2">
            <CheckCircle className="h-4 w-4 shrink-0" /> Formações 4-3-3, 4-4-2 e 3-5-2
          </div>
        </div>

        {/* Card 3: Small - Arbitragem & Súmulas */}
        <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-6 sm:p-8 space-y-4 shadow-xs hover:border-primary/40 transition-all">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500 border border-amber-500/20 w-fit">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-xl text-on-surface">Súmulas Digitais & Arbitragem</h3>
          <p className="text-sm text-on-surface-variant leading-relaxed">
            Emissão oficial de relatórios de jogo com registo instantâneo pelos árbitros, controlo de suspensões e assinaturas eletrónicas após o apito final.
          </p>
        </div>

        {/* Card 4: Large - Gestão de Torneios e Classificações */}
        <div className="md:col-span-2 rounded-2xl border border-outline-variant/20 bg-surface-container p-6 sm:p-8 space-y-5 shadow-xs hover:border-primary/40 transition-all">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 border border-sky-500/20">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-on-surface">Gestão de Provas, Sorteios & Tabelas</h3>
              <p className="text-xs text-on-surface-variant">Classificação automática com critérios de desempate da FAF/FIFA.</p>
            </div>
          </div>

          <p className="text-sm text-on-surface-variant leading-relaxed">
            Configure campeonatos em pontos corridos, fases de grupos e eliminatórias da Taça. O motor da BolaYetu calcula pontuações, saldo de golos e confrontos diretos automaticamente.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-semibold pt-1">
            <div className="rounded-xl border border-outline-variant/15 p-3 bg-surface-container-high/40 flex items-center gap-2 text-on-surface">
              <FileSpreadsheet className="h-4 w-4 text-sky-500 shrink-0" /> Sorteios Automáticos
            </div>
            <div className="rounded-xl border border-outline-variant/15 p-3 bg-surface-container-high/40 flex items-center gap-2 text-on-surface">
              <BarChart3 className="h-4 w-4 text-primary shrink-0" /> Tabelas em Tempo Real
            </div>
            <div className="rounded-xl border border-outline-variant/15 p-3 bg-surface-container-high/40 flex items-center gap-2 text-on-surface">
              <UserCheck className="h-4 w-4 text-emerald-500 shrink-0" /> Controlo de Suspensões
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
