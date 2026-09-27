import React from 'react'
import { Trophy, Award, Medal, Flame, Star, ShieldCheck, Sparkles, HelpCircle } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import { useFanFavorites } from '../hooks/useFanFavorites'
import { getFanSidebarLinks } from '../constants/navigation'
import { FanLeaderboardCard } from '../components/FanLeaderboardCard'

export function FanCommunityPage() {
  const { leaderboard, stats } = useFanFavorites()
  const sidebarLinks = getFanSidebarLinks()

  return (
    <DashboardLayout
      title="Liga de Palpites & Comunidade"
      subtitle="Competição amigável entre adeptos · Acerte os resultados dos jogos e ganhe prémios"
      dashboardType="fan"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-6 pb-12">
        {/* Top Badges / Level Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="p-5 bg-gradient-to-br from-amber-500/15 via-surface-container to-surface-container border border-amber-500/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Pontuação Total</p>
              <h3 className="text-2xl font-black text-amber-400">{stats.points} pts</h3>
              <p className="text-[11px] text-emerald-400 font-semibold">+60 pts esta semana</p>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-primary/15 via-surface-container to-surface-container border border-primary/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-primary/20 text-primary flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Precisão de Palpites</p>
              <h3 className="text-2xl font-black text-white">
                {stats.totalPredictions > 0
                  ? `${Math.round((stats.correctPredictions / stats.totalPredictions) * 100)}%`
                  : '0%'}
              </h3>
              <p className="text-[11px] text-slate-400">
                {stats.correctPredictions} acertos em {stats.totalPredictions} jogos
              </p>
            </div>
          </Card>

          <Card className="p-5 bg-gradient-to-br from-purple-500/15 via-surface-container to-surface-container border border-purple-500/30 flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center shrink-0">
              <Medal className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-400 font-medium">Posição Nacional</p>
              <h3 className="text-2xl font-black text-purple-300">#{stats.rank} Lugar</h3>
              <p className="text-[11px] text-purple-400 font-semibold">Top 5% dos Adeptos</p>
            </div>
          </Card>
        </div>

        {/* Rules & Leaderboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border border-outline/30 bg-surface-container-low p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <h3 className="text-lg font-bold text-on-surface">Como Funciona o Bolão de Palpites?</h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="p-4 rounded-xl bg-surface-container border border-outline/20 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">1</span>
                  <h4 className="font-bold text-sm text-white">Registe os Resultados</h4>
                  <p className="text-xs text-slate-300">Antes do início de cada partida, indique o número de golos de cada equipa.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container border border-outline/20 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center text-xs font-bold">2</span>
                  <h4 className="font-bold text-sm text-white">Acumule Pontos</h4>
                  <p className="text-xs text-slate-300">50 pontos pelo placar exato, 20 pontos por acertar o vencedor ou empate.</p>
                </div>
                <div className="p-4 rounded-xl bg-surface-container border border-outline/20 space-y-2">
                  <span className="w-6 h-6 rounded-full bg-purple-500/20 text-purple-400 flex items-center justify-center text-xs font-bold">3</span>
                  <h4 className="font-bold text-sm text-white">Ganhe Prémios</h4>
                  <p className="text-xs text-slate-300">Suba no ranking mensal para receber camisolas oficiais e ingressos para finais.</p>
                </div>
              </div>
            </Card>

            <Card className="border border-outline/30 bg-surface-container-low p-6 space-y-4">
              <h3 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Seus Crachás de Conquista
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-center space-y-1">
                  <Flame className="w-6 h-6 text-emerald-400 mx-auto" />
                  <p className="text-xs font-bold text-white">Adepto Fiel</p>
                  <p className="text-[10px] text-slate-400">Seguiu 2+ clubes</p>
                </div>
                <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-center space-y-1">
                  <Trophy className="w-6 h-6 text-amber-400 mx-auto" />
                  <p className="text-xs font-bold text-white">Primeiro Acerto</p>
                  <p className="text-[10px] text-slate-400">1º placar exato</p>
                </div>
                <div className="p-3 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-center space-y-1">
                  <Star className="w-6 h-6 text-cyan-400 mx-auto" />
                  <p className="text-xs font-bold text-white">Olheiro do Povo</p>
                  <p className="text-[10px] text-slate-400">Seguiu 2+ atletas</p>
                </div>
                <div className="p-3 rounded-xl bg-surface-container border border-outline/20 text-center space-y-1 opacity-50">
                  <Medal className="w-6 h-6 text-slate-500 mx-auto" />
                  <p className="text-xs font-bold text-slate-400">Top 10 Nacional</p>
                  <p className="text-[10px] text-slate-500">Em progresso (14º)</p>
                </div>
              </div>
            </Card>
          </div>

          <div>
            <FanLeaderboardCard leaderboard={leaderboard} />
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
