import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Trophy, Activity, ShieldCheck, Flame } from 'lucide-react'

interface HeroSectionProps {
  onGetStarted?: () => void
  onViewDemo?: () => void
}

export function HeroSection({ onGetStarted, onViewDemo }: HeroSectionProps) {
  const { t } = useTranslation()

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-md md:px-xl overflow-hidden bg-gradient-to-b from-background via-background/95 to-card/50"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl text-center space-y-md">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-xs rounded-full border border-primary/30 bg-primary/10 px-md py-xs text-xs font-bold text-primary shadow-sm backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Plataforma Oficial BolaYetu 2026</span>
          <span className="rounded-full bg-primary/20 px-xs py-0.5 text-[10px] uppercase tracking-wider font-extrabold text-primary">
            NOVO
          </span>
        </div>

        {/* Main Heading */}
        <h1
          id="hero-title"
          className="font-display-lg text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-foreground tracking-tight leading-[1.05]"
        >
          O ECOSSISTEMA DO <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-300 bg-clip-text text-transparent">
            FUTEBOL MODERNO
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
          Plataforma SaaS para Federações, Ligas e Clubes. Gerencie campeonatos ao vivo, fichas técnicas de atletas e relatórios de inteligência desportiva num só lugar.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-sm sm:gap-md justify-center pt-xs">
          <Button asChild size="lg" className="h-12 px-xl font-bold shadow-lg shadow-primary/25 text-base">
            <Link to={ROUTES.REGISTER_ORGANIZATION}>
              Criar Organização
              <ArrowRight className="ml-xs h-5 w-5" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12 px-xl font-bold text-base backdrop-blur-sm">
            <Link to={ROUTES.PUBLIC_EXPLORE}>
              Explorar Diretório Público
            </Link>
          </Button>
        </div>

        {/* Trust tags */}
        <div className="flex flex-wrap items-center justify-center gap-md pt-sm text-xs font-semibold text-muted-foreground">
          <span className="flex items-center gap-xs">
            <ShieldCheck className="h-4 w-4 text-primary" /> Dados Verificados
          </span>
          <span className="flex items-center gap-xs">
            <Flame className="h-4 w-4 text-amber-500" /> +10.000 Atletas Registados
          </span>
          <span className="flex items-center gap-xs">
            <Trophy className="h-4 w-4 text-primary" /> +50 Ligas e Torneios
          </span>
        </div>
      </div>

      {/* Interactive Mockup */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mt-xl group">
        <div className="absolute inset-0 bg-primary/20 blur-[100px] rounded-3xl group-hover:bg-primary/30 transition-all duration-700 pointer-events-none" />

        <div className="relative rounded-2xl border border-border/80 bg-card/90 backdrop-blur-xl shadow-2xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-1">
          {/* Browser Window Topbar */}
          <div className="h-10 border-b border-border/80 bg-muted/50 px-md flex items-center justify-between">
            <div className="flex items-center gap-xs">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="rounded-md border border-border bg-background/60 px-md py-0.5 text-xs text-muted-foreground font-mono truncate max-w-xs sm:max-w-md">
              app.bolayetu.co.ao/live-match/girabola-2026
            </div>
            <div className="flex items-center gap-xs text-xs font-bold text-primary">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span className="hidden sm:inline">AO VIVO</span>
            </div>
          </div>

          {/* Inner Dashboard Content */}
          <div className="p-md sm:p-lg grid grid-cols-1 md:grid-cols-3 gap-md bg-background/50">
            {/* Live Score Widget */}
            <div className="md:col-span-2 rounded-xl border border-border/70 bg-card p-md space-y-md shadow-sm">
              <div className="flex items-center justify-between border-b border-border pb-xs">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-xs">
                  <Trophy className="h-3.5 w-3.5 text-primary" /> Girabola 2026 · Jornada 18
                </span>
                <span className="rounded-full bg-destructive/10 text-destructive px-xs py-0.5 text-[10px] font-bold animate-pulse">
                  78' EM JOGO
                </span>
              </div>

              <div className="grid grid-cols-3 items-center text-center py-xs">
                <div className="space-y-xs">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                    PET
                  </div>
                  <div className="font-bold text-sm">Petro de Luanda</div>
                </div>

                <div className="space-y-xs">
                  <div className="text-3xl font-black tracking-tight text-foreground">2 - 1</div>
                  <div className="text-xs text-muted-foreground font-mono">Estádio 11 de Novembro</div>
                </div>

                <div className="space-y-xs">
                  <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-primary text-sm">
                    PRI
                  </div>
                  <div className="font-bold text-sm">1º de Agosto</div>
                </div>
              </div>

              {/* Stats Bar */}
              <div className="space-y-xs pt-xs border-t border-border/50 text-xs">
                <div className="flex justify-between font-semibold text-muted-foreground">
                  <span>Posse de Bola (58%)</span>
                  <span>(42%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-muted overflow-hidden flex">
                  <div className="h-full bg-primary" style={{ width: '58%' }} />
                  <div className="h-full bg-muted-foreground/30" style={{ width: '42%' }} />
                </div>
              </div>
            </div>

            {/* Scout Card Widget */}
            <div className="rounded-xl border border-border/70 bg-card p-md space-y-sm shadow-sm flex flex-col justify-between">
              <div className="flex items-center gap-sm">
                <div className="h-10 w-10 rounded-full bg-primary/20 border border-primary/40 flex items-center justify-center font-bold text-primary text-xs">
                  10
                </div>
                <div>
                  <div className="font-bold text-sm">Mateus Gondo</div>
                  <div className="text-xs text-muted-foreground">Avançado · Petro Luanda</div>
                </div>
              </div>

              <div className="space-y-xs text-xs">
                <div className="flex justify-between border-b border-border/40 py-1">
                  <span className="text-muted-foreground">Golos na Época</span>
                  <span className="font-bold text-primary">14 Golos</span>
                </div>
                <div className="flex justify-between border-b border-border/40 py-1">
                  <span className="text-muted-foreground">Assistências</span>
                  <span className="font-bold">8 Assistências</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-muted-foreground">Classificação Média</span>
                  <span className="font-bold text-emerald-500">8.6 / 10</span>
                </div>
              </div>

              <div className="rounded-lg bg-primary/10 p-xs text-center text-[11px] font-bold text-primary">
                Perfil de Olheiro Verificado
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
