import React, { useState } from 'react'
import { Trophy, Award, Sparkles, Check, Flame, ChevronUp, ChevronDown } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button } from '@/components/ui'
import type { FanMatch, FanPrediction } from '../types'

interface FanMatchPredictionCardProps {
  featuredMatch: FanMatch
  currentPrediction?: FanPrediction
  onSubmitPrediction: (matchId: string, homeScore: number, awayScore: number) => void
}

export function FanMatchPredictionCard({
  featuredMatch,
  currentPrediction,
  onSubmitPrediction,
}: FanMatchPredictionCardProps) {
  const [homeScore, setHomeScore] = useState<number>(currentPrediction?.homeScore ?? 2)
  const [awayScore, setAwayScore] = useState<number>(currentPrediction?.awayScore ?? 1)
  const [savedSuccess, setSavedSuccess] = useState(false)

  const handleIncrement = (team: 'home' | 'away') => {
    if (team === 'home') setHomeScore((prev) => Math.min(prev + 1, 15))
    else setAwayScore((prev) => Math.min(prev + 1, 15))
  }

  const handleDecrement = (team: 'home' | 'away') => {
    if (team === 'home') setHomeScore((prev) => Math.max(prev - 1, 0))
    else setAwayScore((prev) => Math.max(prev - 1, 0))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmitPrediction(featuredMatch.id, homeScore, awayScore)
    setSavedSuccess(true)
    setTimeout(() => setSavedSuccess(false), 3000)
  }

  return (
    <Card className="border border-amber-500/30 bg-gradient-to-b from-[#141b24] to-[#0c141d] overflow-hidden shadow-xl">
      <CardHeader className="bg-gradient-to-r from-amber-500/15 via-transparent to-transparent border-b border-amber-500/20 pb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400 animate-pulse" />
            <CardTitle className="text-base md:text-lg font-bold text-white">
              Palpite da Jornada · Ganhe +50 pts
            </CardTitle>
          </div>
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-300 bg-amber-500/20 border border-amber-500/30 px-2 py-0.5 rounded-full">
            Destaque
          </span>
        </div>
        <p className="text-xs text-slate-300 mt-1">
          {featuredMatch.competitionName} · {featuredMatch.round}
        </p>
      </CardHeader>

      <CardContent className="p-5 md:p-6 space-y-6">
        {/* Score Adjuster Grid */}
        <div className="grid grid-cols-7 items-center gap-3">
          {/* Home Team */}
          <div className="col-span-3 text-center space-y-2">
            <p className="font-bold text-sm md:text-base text-white truncate">
              {featuredMatch.homeTeam.name}
            </p>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleIncrement('home')}
                className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-white/5 transition"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high border-2 border-amber-500/40 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                {homeScore}
              </div>
              <button
                type="button"
                onClick={() => handleDecrement('home')}
                className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-white/5 transition"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* VS Divider */}
          <div className="col-span-1 text-center font-black text-slate-500 text-sm">
            X
          </div>

          {/* Away Team */}
          <div className="col-span-3 text-center space-y-2">
            <p className="font-bold text-sm md:text-base text-white truncate">
              {featuredMatch.awayTeam.name}
            </p>
            <div className="flex flex-col items-center">
              <button
                type="button"
                onClick={() => handleIncrement('away')}
                className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-white/5 transition"
              >
                <ChevronUp className="w-5 h-5" />
              </button>
              <div className="w-14 h-14 rounded-2xl bg-surface-container-high border-2 border-amber-500/40 flex items-center justify-center text-2xl font-black text-white shadow-inner">
                {awayScore}
              </div>
              <button
                type="button"
                onClick={() => handleDecrement('away')}
                className="p-1 rounded-md text-slate-400 hover:text-amber-400 hover:bg-white/5 transition"
              >
                <ChevronDown className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Submit Prediction */}
        <div className="space-y-2">
          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-bold py-2.5 rounded-xl shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2"
          >
            {savedSuccess ? (
              <>
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                Palpite Registado com Sucesso!
              </>
            ) : (
              <>
                <Award className="w-4 h-4 text-slate-950" />
                {currentPrediction ? 'Atualizar Meu Palpite' : 'Confirmar Palpite (+50 pts)'}
              </>
            )}
          </Button>
          <p className="text-[11px] text-center text-slate-400">
            Regras: 50 pts por acertar o placar exato · 20 pts por acertar o vencedor ou empate.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
