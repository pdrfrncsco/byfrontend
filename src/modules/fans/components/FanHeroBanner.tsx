import React from 'react'
import { Link } from 'react-router-dom'
import { Sparkles, Trophy, Calendar, Flame, ArrowRight, ShieldCheck, Heart } from 'lucide-react'
import { Button, Badge } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import type { FanStats } from '../types'

interface FanHeroBannerProps {
  userName: string
  stats: FanStats
}

export function FanHeroBanner({ userName, stats }: FanHeroBannerProps) {
  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#0c243b] via-[#091a2b] to-[#040e17] border border-[#1e3a5a]/60 p-6 md:p-8 shadow-2xl shadow-black/40">
      {/* Decorative Glow Elements */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* Left Welcome Details */}
        <div className="space-y-3 max-w-2xl">
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-primary/15 text-primary border border-primary/25">
              <Sparkles className="w-3.5 h-3.5 text-primary" />
              Portal do Adepto Oficial
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/15 text-amber-400 border border-amber-500/25">
              <Flame className="w-3.5 h-3.5" />
              Nível 3 · Adepto Fiel
            </span>
          </div>

          <h1 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
            Olá, <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-300">{userName}</span>!
          </h1>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed">
            Acompanhe em primeira mão os jogos dos seus clubes de coração, palpite os resultados da jornada e descubra os novos talentos do futebol angolano.
          </p>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap gap-3 pt-2">
            <Link to={ROUTES.PUBLIC_EXPLORE}>
              <Button size="sm" className="bg-primary text-surface font-semibold hover:bg-primary-hover shadow-lg shadow-primary/20">
                <Heart className="w-3.5 h-3.5 mr-1.5 fill-current" />
                Explorar Novos Favoritos
              </Button>
            </Link>
            <Link to={ROUTES.COMPETITIONS}>
              <Button size="sm" variant="outline" className="border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800 hover:text-white">
                <Calendar className="w-3.5 h-3.5 mr-1.5 text-cyan-400" />
                Ver Calendário de Jogos
              </Button>
            </Link>
          </div>
        </div>

        {/* Right Stats Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-3 shrink-0 lg:w-80">
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Clubes a Seguir</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-white">{stats.followedClubsCount}</span>
              <span className="text-[10px] text-emerald-400 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded">Ativo</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Atletas Seguidos</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-white">{stats.followedPlayersCount}</span>
              <span className="text-[10px] text-cyan-400 font-semibold bg-cyan-500/10 px-1.5 py-0.5 rounded">Talentos</span>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Pontos de Palpites</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-amber-400">{stats.points}</span>
              <Trophy className="w-4 h-4 text-amber-400" />
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-3.5 flex flex-col justify-between">
            <span className="text-xs text-slate-400 font-medium">Posição no Ranking</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-white">#{stats.rank}</span>
              <span className="text-[10px] text-purple-400 font-semibold bg-purple-500/10 px-1.5 py-0.5 rounded">Geral</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
