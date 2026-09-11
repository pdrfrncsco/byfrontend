import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { ArrowRight, Sparkles, Trophy, Activity, ShieldCheck, Flame, Compass, ChevronRight, User } from 'lucide-react'
import type { Match } from '@/modules/competitions/types'

export interface HeroSectionProps {
  onGetStarted?: () => void
  onViewDemo?: () => void
  featuredMatch?: Match | null
  featuredCompetition?: { name: string; slug?: string; id?: string } | null
  featuredPlayer?: {
    name: string
    club?: string
    position?: string
    avatar?: string
    slug?: string
    number?: number
    goals?: number
  } | null
  stats?: {
    clubs?: number
    players?: number
    competitions?: number
    organizations?: number
  }
}

function ClubBadge({ logo, name, code }: { logo?: string; name: string; code?: string }) {
  const [imgError, setImgError] = useState(false)
  const initial = code || name?.substring(0, 3).toUpperCase() || 'FC'

  if (logo && !imgError) {
    return (
      <img
        src={logo}
        alt={name}
        className="h-12 w-12 mx-auto rounded-full object-cover border border-outline-variant/30 shadow-sm"
        onError={() => setImgError(true)}
      />
    )
  }

  return (
    <div className="h-12 w-12 mx-auto rounded-full bg-primary/10 border border-primary/25 flex items-center justify-center font-extrabold text-primary text-xs tracking-wider shadow-sm">
      {initial}
    </div>
  )
}

export function HeroSection({
  featuredMatch,
  featuredCompetition,
  featuredPlayer,
  stats,
}: HeroSectionProps) {
  // Real or fallback match data
  const compName = featuredCompetition?.name || featuredMatch?.roundLabel || 'Girabola 2025/26 · Jornada 18'
  const compId = featuredCompetition?.id || featuredMatch?.competitionId || 'girabola-2025-26-lnfp'
  const matchId = featuredMatch?.id

  const homeName = featuredMatch?.homeTeamName || (featuredMatch as any)?.home_club_name || 'Petro de Luanda'
  const awayName = featuredMatch?.awayTeamName || (featuredMatch as any)?.away_club_name || '1º de Agosto'
  const homeLogo = featuredMatch?.homeTeamLogo || (featuredMatch as any)?.home_club_logo
  const awayLogo = featuredMatch?.awayTeamLogo || (featuredMatch as any)?.away_club_logo
  const homeScore = featuredMatch?.score?.home ?? (featuredMatch as any)?.home_score ?? 2
  const awayScore = featuredMatch?.score?.away ?? (featuredMatch as any)?.away_score ?? 1
  const isLive = featuredMatch?.status === 'live' || featuredMatch?.status === 'halftime'
  const matchVenue = featuredMatch?.venue || 'Estádio 11 de Novembro'
  const minuteText = featuredMatch?.current_minute ? `${featuredMatch.current_minute}'` : '78\''

  // Real or fallback player data
  const playerName = featuredPlayer?.name || 'Mateus Gondo'
  const playerClub = featuredPlayer?.club || 'Petro de Luanda'
  const playerPosition = featuredPlayer?.position || 'Avançado'
  const playerNumber = featuredPlayer?.number ?? 10
  const playerGoals = featuredPlayer?.goals ?? 14
  const playerSlug = featuredPlayer?.slug

  return (
    <section
      id="hero"
      aria-labelledby="hero-title"
      className="relative min-h-screen flex flex-col items-center justify-center pt-24 pb-16 px-4 sm:px-6 md:px-8 overflow-hidden bg-gradient-to-b from-background via-background/95 to-surface-container-low/50"
    >
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 left-1/4 w-[300px] h-[300px] bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl text-center space-y-5">
        {/* Pill Badge */}
        <div className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-4 py-1 text-xs font-bold text-primary shadow-xs backdrop-blur-sm">
          <Sparkles className="h-3.5 w-3.5" />
          <span>O Ecossistema Digital do Futebol Angolano</span>
          <span className="rounded-full bg-primary/20 px-2 py-0.5 text-[10px] uppercase tracking-wider font-extrabold text-primary">
            2026
          </span>
        </div>

        {/* Main Heading */}
        <h1
          id="hero-title"
          className="font-display-lg text-4xl sm:text-6xl md:text-7xl font-black text-on-surface tracking-tight leading-[1.05]"
        >
          O FUTEBOL MODERNO <br className="hidden sm:inline" />
          <span className="bg-gradient-to-r from-primary via-emerald-400 to-teal-400 bg-clip-text text-transparent">
            CONECTADO E EM DIRETO
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-on-surface-variant max-w-2xl mx-auto leading-relaxed">
          Plataforma tecnológica unificada para Federações, Ligas, Clubes e Atletas. Central de jogos ao vivo, escalações táticas, gestão de competições e relatórios de scouting desportivo.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
          <Button asChild size="lg" className="h-12 px-6 font-bold shadow-lg shadow-primary/25 text-sm sm:text-base rounded-xl">
            <Link to={ROUTES.REGISTER}>
              Criar Conta Gratuita
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>

          <Button asChild variant="outline" size="lg" className="h-12 px-6 font-bold text-sm sm:text-base rounded-xl backdrop-blur-sm border-outline-variant/30 hover:bg-surface-container-high">
            <Link to={ROUTES.PUBLIC_EXPLORE} className="flex items-center gap-2">
              <Compass className="h-4 w-4 text-primary" />
              Explorar Ecossistema
            </Link>
          </Button>
        </div>

        {/* Trust tags with real data */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 pt-2 text-xs font-semibold text-on-surface-variant">
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-primary" /> Dados Verificados
          </span>
          <span className="flex items-center gap-1.5">
            <Flame className="h-4 w-4 text-amber-500" />
            {stats?.players ? `+${stats.players} Atletas Registados` : '+1.200 Atletas Registados'}
          </span>
          <span className="flex items-center gap-1.5">
            <Trophy className="h-4 w-4 text-primary" />
            {stats?.competitions ? `+${stats.competitions} Ligas e Provas` : '+15 Ligas e Torneios'}
          </span>
        </div>
      </div>

      {/* Interactive Mockup Preview */}
      <div className="relative z-10 w-full max-w-5xl mx-auto mt-10 group">
        <div className="absolute inset-0 bg-primary/15 blur-[100px] rounded-3xl group-hover:bg-primary/25 transition-all duration-700 pointer-events-none" />

        <div className="relative rounded-2xl border border-outline-variant/30 bg-surface-container/90 backdrop-blur-xl shadow-2xl overflow-hidden transition-transform duration-500 group-hover:-translate-y-0.5">
          {/* Browser Window Topbar */}
          <div className="h-10 border-b border-outline-variant/20 bg-surface-container-high/60 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className="h-3 w-3 rounded-full bg-red-500/80" />
              <div className="h-3 w-3 rounded-full bg-amber-500/80" />
              <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
            </div>
            <div className="rounded-md border border-outline-variant/20 bg-surface-container-lowest/80 px-4 py-0.5 text-xs text-on-surface-variant font-mono truncate max-w-xs sm:max-w-md">
              bolayetu.com/competitions/{compId}/match-center
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
              <Activity className="h-3.5 w-3.5 animate-pulse" />
              <span className="hidden sm:inline">AO VIVO</span>
            </div>
          </div>

          {/* Inner Dashboard Content */}
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-3 gap-4 bg-background/50">
            {/* Live Score Widget */}
            <div className="md:col-span-2 rounded-xl border border-outline-variant/20 bg-surface-container p-4 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-outline-variant/15 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5 truncate">
                  <Trophy className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="truncate">{compName}</span>
                </span>
                <span className="rounded-full bg-destructive/10 text-destructive px-2 py-0.5 text-[10px] font-bold animate-pulse shrink-0">
                  {minuteText} EM JOGO
                </span>
              </div>

              {matchId ? (
                <Link
                  to={`/competitions/${compId}/matches/${matchId}`}
                  className="grid grid-cols-3 items-center text-center py-2 group/match cursor-pointer"
                >
                  <div className="space-y-1">
                    <ClubBadge logo={homeLogo} name={homeName} />
                    <div className="font-bold text-sm text-on-surface group-hover/match:text-primary transition-colors truncate">
                      {homeName}
                    </div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-on-surface">
                      {homeScore} - {awayScore}
                    </div>
                    <div className="text-xs text-on-surface-variant font-mono truncate">{matchVenue}</div>
                  </div>

                  <div className="space-y-1">
                    <ClubBadge logo={awayLogo} name={awayName} />
                    <div className="font-bold text-sm text-on-surface group-hover/match:text-primary transition-colors truncate">
                      {awayName}
                    </div>
                  </div>
                </Link>
              ) : (
                <div className="grid grid-cols-3 items-center text-center py-2">
                  <div className="space-y-1">
                    <ClubBadge logo={homeLogo} name={homeName} />
                    <div className="font-bold text-sm text-on-surface truncate">{homeName}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-3xl sm:text-4xl font-black font-mono tracking-tight text-on-surface">
                      {homeScore} - {awayScore}
                    </div>
                    <div className="text-xs text-on-surface-variant font-mono truncate">{matchVenue}</div>
                  </div>

                  <div className="space-y-1">
                    <ClubBadge logo={awayLogo} name={awayName} />
                    <div className="font-bold text-sm text-on-surface truncate">{awayName}</div>
                  </div>
                </div>
              )}

              {/* Stats Bar */}
              <div className="space-y-1.5 pt-2 border-t border-outline-variant/15 text-xs">
                <div className="flex justify-between font-semibold text-on-surface-variant">
                  <span>Posse de Bola (58%)</span>
                  <span>(42%)</span>
                </div>
                <div className="h-2 w-full rounded-full bg-surface-container-highest overflow-hidden flex">
                  <div className="h-full bg-primary" style={{ width: '58%' }} />
                  <div className="h-full bg-on-surface-variant/30" style={{ width: '42%' }} />
                </div>
              </div>
            </div>

            {/* Scout / Standout Player Card Widget */}
            <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-4 space-y-3 shadow-xs flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3">
                  {featuredPlayer?.avatar ? (
                    <img
                      src={featuredPlayer.avatar}
                      alt={playerName}
                      className="h-11 w-11 rounded-full object-cover border-2 border-primary"
                    />
                  ) : (
                    <div className="h-11 w-11 rounded-full bg-primary/20 border-2 border-primary flex items-center justify-center font-bold text-primary text-xs">
                      #{playerNumber}
                    </div>
                  )}
                  <div className="min-w-0">
                    <div className="font-bold text-sm text-on-surface truncate">{playerName}</div>
                    <div className="text-xs text-on-surface-variant truncate">
                      {playerPosition} · {playerClub}
                    </div>
                  </div>
                </div>

                <div className="mt-3 space-y-1.5 text-xs">
                  <div className="flex justify-between border-b border-outline-variant/15 py-1">
                    <span className="text-on-surface-variant">Golos Marcados</span>
                    <span className="font-bold text-primary">{playerGoals} Golos</span>
                  </div>
                  <div className="flex justify-between border-b border-outline-variant/15 py-1">
                    <span className="text-on-surface-variant">Posição</span>
                    <span className="font-bold text-on-surface">{playerPosition}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-on-surface-variant">Avaliação Média</span>
                    <span className="font-bold text-emerald-500">8.8 / 10</span>
                  </div>
                </div>
              </div>

              {playerSlug ? (
                <Link
                  to={`/players/${playerSlug}`}
                  className="rounded-lg bg-primary/10 p-2 text-center text-xs font-bold text-primary hover:bg-primary/20 transition-colors flex items-center justify-center gap-1"
                >
                  <span>Ver Ficha do Atleta</span>
                  <ChevronRight className="h-3.5 w-3.5" />
                </Link>
              ) : (
                <div className="rounded-lg bg-primary/10 p-2 text-center text-xs font-bold text-primary">
                  Perfil de Atleta Verificado
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
