import React from 'react'
import { Trophy, Medal, Flame, Star, Award } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui'
import type { FanLeaderboardUser } from '../types'

interface FanLeaderboardCardProps {
  leaderboard: FanLeaderboardUser[]
}

export function FanLeaderboardCard({ leaderboard }: FanLeaderboardCardProps) {
  return (
    <Card className="border border-outline/30 bg-surface-container-low overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline/20 pb-4">
        <div className="flex items-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <CardTitle className="text-base md:text-lg font-bold text-on-surface">
            Ranking da Liga de Palpites
          </CardTitle>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
          Mês de Setembro
        </span>
      </CardHeader>

      <CardContent className="p-4 md:p-5 space-y-2.5">
        {leaderboard.map((user) => {
          const isTop3 = user.rank <= 3
          const rankBadgeColor =
            user.rank === 1
              ? 'text-amber-400 bg-amber-500/20 border-amber-500/30'
              : user.rank === 2
              ? 'text-slate-300 bg-slate-500/20 border-slate-400/30'
              : user.rank === 3
              ? 'text-amber-600 bg-amber-700/20 border-amber-700/30'
              : 'text-slate-400 bg-surface-container-high border-outline/20'

          return (
            <div
              key={user.id}
              className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition ${
                user.isCurrentUser
                  ? 'bg-primary/10 border-primary/40 shadow-md shadow-primary/5'
                  : 'bg-surface-container border-outline/20'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Rank Number */}
                <span
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black border shrink-0 ${rankBadgeColor}`}
                >
                  {user.rank}
                </span>

                <div className="min-w-0">
                  <p className={`text-xs md:text-sm font-bold truncate ${user.isCurrentUser ? 'text-primary' : 'text-on-surface'}`}>
                    {user.name}
                  </p>
                  <p className="text-[11px] text-on-surface-variant truncate">
                    {user.favoriteClub} · {user.correctPredictions} acertos
                  </p>
                </div>
              </div>

              {/* Points */}
              <div className="text-right shrink-0">
                <span className="text-sm font-black text-amber-400 block">
                  {user.points} pts
                </span>
              </div>
            </div>
          )
        })}

        <div className="pt-2 text-center">
          <p className="text-[11px] text-on-surface-variant">
            Os 3 melhores do mês ganham camisolas oficiais e ingressos VIP!
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
