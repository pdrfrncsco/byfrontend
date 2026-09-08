import { useTranslation } from 'react-i18next'
import { Trophy, UserCheck, ShieldAlert, Newspaper, Flame, CheckCircle, BarChart3, Activity } from 'lucide-react'

export function FeaturesGrid() {
  const { t } = useTranslation()

  return (
    <section id="features" className="py-24 max-w-7xl mx-auto px-md md:px-xl">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-xl space-y-sm">
        <span className="text-xs font-bold uppercase tracking-wider text-primary">Plataforma Completa</span>
        <h2 className="font-display-lg text-3xl sm:text-5xl font-black text-foreground tracking-tight">
          Tudo o que a sua Organização precisa num só lugar
        </h2>
        <p className="text-muted-foreground text-base sm:text-lg">
          Ferramentas concebidas para modernizar a gestão do futebol, acelerar o recrutamento e conectar o ecossistema.
        </p>
      </div>

      {/* Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
        {/* Card 1: Large - Torneios */}
        <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card p-lg space-y-md shadow-sm hover:border-primary/50 transition-all group">
          <div className="flex items-center gap-sm">
            <div className="p-sm rounded-xl bg-primary/10 text-primary">
              <Trophy className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground">Gestão de Torneios & Tabela ao Vivo</h3>
              <p className="text-xs text-muted-foreground">Classificação automática, jornadas e resultados em tempo real.</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Configure formatos de fase de grupos, eliminatórias e pontos corridos. O sistema gera automaticamente os calendários e atualiza pontuações instantly.
          </p>

          {/* Interactive Preview */}
          <div className="rounded-xl border border-border/60 bg-muted/30 p-md space-y-xs font-mono text-xs">
            <div className="flex justify-between items-center bg-card p-sm rounded-lg border border-border/40">
              <span className="font-bold">1. Petro de Luanda</span>
              <span className="text-primary font-bold">18J · 44 PTS</span>
            </div>
            <div className="flex justify-between items-center bg-card p-sm rounded-lg border border-border/40 opacity-80">
              <span>2. Sagrada Esperança</span>
              <span className="font-bold">18J · 41 PTS</span>
            </div>
            <div className="flex justify-between items-center bg-card p-sm rounded-lg border border-border/40 opacity-60">
              <span>3. 1º de Agosto</span>
              <span className="font-bold">18J · 39 PTS</span>
            </div>
          </div>
        </div>

        {/* Card 2: Medium - Perfil Atletas */}
        <div className="rounded-2xl border border-border/80 bg-card p-lg space-y-md shadow-sm hover:border-primary/50 transition-all flex flex-col justify-between">
          <div className="space-y-sm">
            <div className="p-sm rounded-xl bg-primary/10 text-primary w-fit">
              <UserCheck className="h-6 w-6" />
            </div>
            <h3 className="font-bold text-xl text-foreground">Perfil de Atletas & Olheirismo</h3>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Fichas completas com histórico de jogos, estatísticas biométricas, contratos e relatórios para agentes e equipas técnicas.
            </p>
          </div>

          <div className="rounded-xl border border-primary/20 bg-primary/5 p-sm text-xs font-semibold text-primary flex items-center gap-xs">
            <CheckCircle className="h-4 w-4" /> Cartão Digital Verificado
          </div>
        </div>

        {/* Card 3: Small - Arbitragem & Súmulas */}
        <div className="rounded-2xl border border-border/80 bg-card p-lg space-y-md shadow-sm hover:border-primary/50 transition-all">
          <div className="p-sm rounded-xl bg-amber-500/10 text-amber-500 w-fit">
            <ShieldAlert className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-xl text-foreground">Súmulas Eletrónicas</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Emissão digital de relatórios de jogo com registo instantâneo de golos, substituições e cartões emitidos pelos árbitros.
          </p>
        </div>

        {/* Card 4: Large - Transferências e Mídia */}
        <div className="md:col-span-2 rounded-2xl border border-border/80 bg-card p-lg space-y-md shadow-sm hover:border-primary/50 transition-all">
          <div className="flex items-center gap-sm">
            <div className="p-sm rounded-xl bg-emerald-500/10 text-emerald-500">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h3 className="font-bold text-xl text-foreground">Mercado de Transferências & Vínculos</h3>
              <p className="text-xs text-muted-foreground">Validação oficial de afiliações entre atletas e clubes.</p>
            </div>
          </div>

          <p className="text-sm text-muted-foreground leading-relaxed">
            Submeta e acompanhe pedidos de vínculo desportivo de forma transparente com histórico contratual e rastreabilidade total.
          </p>

          <div className="grid grid-cols-2 gap-sm text-xs font-semibold pt-xs">
            <div className="rounded-lg border border-border p-sm bg-muted/20 flex items-center gap-xs">
              <BarChart3 className="h-4 w-4 text-primary" /> Relatórios de Carreira
            </div>
            <div className="rounded-lg border border-border p-sm bg-muted/20 flex items-center gap-xs">
              <Flame className="h-4 w-4 text-amber-500" /> Mercado em Tempo Real
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
