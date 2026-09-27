import React from 'react'
import { Link } from 'react-router-dom'
import { Calendar, MapPin, Clock, ArrowRight, Shield, Award } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Button, Badge } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import type { FanMatch, FanPrediction } from '../types'

interface FanUpcomingMatchesCardProps {
  matches: FanMatch[]
  predictions: Record<string, FanPrediction>
  onOpenPrediction?: (match: FanMatch) => void
}

export function FanUpcomingMatchesCard({
  matches,
  predictions,
  onOpenPrediction,
}: FanUpcomingMatchesCardProps) {
  return (
    <Card className="border border-outline/30 bg-surface-container-low overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline/20 pb-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <CardTitle className="text-lg font-bold text-on-surface">
              Próximos Jogos dos Meus Clubes
            </CardTitle>
          </div>
          <p className="text-xs text-on-surface-variant">
            Partidas agendadas dos clubes e competições que você acompanha
          </p>
        </div>
        <Link to={ROUTES.MATCHES}>
          <Button variant="ghost" size="sm" className="text-xs text-primary hover:text-primary-hover">
            Ver Todos
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Button>
        </Link>
      </CardHeader>

      <CardContent className="p-4 md:p-6 space-y-4">
        {matches.map((match) => {
          const prediction = predictions[match.id]
          const isDerby = match.round?.toLowerCase().includes('dérbi') || match.round?.toLowerCase().includes('derby')

          return (
            <div
              key={match.id}
              className={`group relative rounded-2xl p-4 md:p-5 transition-all duration-200 border ${
                isDerby
                  ? 'bg-gradient-to-r from-amber-500/10 via-surface-container to-surface-container border-amber-500/30'
                  : 'bg-surface-container border-outline/20 hover:border-outline/40'
              }`}
            >
              {/* Competition & Status Header */}
              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-primary tracking-wide">
                    {match.competitionName}
                  </span>
                  {match.round && (
                    <span className="text-[11px] text-on-surface-variant bg-surface-container-high px-2 py-0.5 rounded-full">
                      {match.round}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-on-surface-variant">
                  <span className="flex items-center gap-1 font-medium text-slate-300">
                    <Clock className="w-3.5 h-3.5 text-primary" />
                    {match.time} · {match.date}
                  </span>
                </div>
              </div>

              {/* Match Teams Grid */}
              <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 py-2">
                {/* Home Team */}
                <div className="md:col-span-5 flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline/20 shrink-0">
                    {match.homeTeam.logoUrl ? (
                      <img
                        src={match.homeTeam.logoUrl}
                        alt={match.homeTeam.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Shield className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-on-surface truncate text-sm md:text-base">
                      {match.homeTeam.name}
                    </p>
                    <span className="text-[11px] text-on-surface-variant font-medium">Equipa da Casa</span>
                  </div>
                </div>

                {/* Score or VS in Center */}
                <div className="md:col-span-2 text-center flex flex-col items-center justify-center">
                  <span className="text-xs font-black px-3 py-1 rounded-lg bg-surface-container-high text-on-surface-variant border border-outline/20">
                    VS
                  </span>
                  <div className="flex items-center gap-1 text-[11px] text-on-surface-variant mt-1.5 truncate max-w-full">
                    <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                    <span className="truncate">{match.venue}</span>
                  </div>
                </div>

                {/* Away Team */}
                <div className="md:col-span-5 flex items-center justify-start md:justify-end gap-3 md:text-right">
                  <div className="min-w-0 order-2 md:order-1">
                    <p className="font-bold text-on-surface truncate text-sm md:text-base">
                      {match.awayTeam.name}
                    </p>
                    <span className="text-[11px] text-on-surface-variant font-medium">Visitante</span>
                  </div>
                  <div className="w-10 h-10 rounded-xl bg-surface-container-high flex items-center justify-center overflow-hidden border border-outline/20 shrink-0 order-1 md:order-2">
                    {match.awayTeam.logoUrl ? (
                      <img
                        src={match.awayTeam.logoUrl}
                        alt={match.awayTeam.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <Shield className="w-5 h-5 text-on-surface-variant" />
                    )}
                  </div>
                </div>
              </div>

              {/* Bottom Prediction / Action Bar */}
              <div className="mt-4 pt-3 border-t border-outline/10 flex flex-wrap items-center justify-between gap-3">
                {prediction ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-on-surface-variant">Seu palpite:</span>
                    <span className="text-xs font-black text-amber-400 bg-amber-500/10 border border-amber-500/20 px-2 py-0.5 rounded-md">
                      {match.homeTeam.shortName} {prediction.homeScore} - {prediction.awayScore} {match.awayTeam.shortName}
                    </span>
                    <span className="text-[10px] text-slate-400">· Aguardando jogo</span>
                  </div>
                ) : (
                  <span className="text-xs text-on-surface-variant italic">
                    Ainda não registou o seu palpite para este confronto.
                  </span>
                )}

                <div className="flex items-center gap-2 ml-auto">
                  {onOpenPrediction && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => onOpenPrediction(match)}
                      className="text-xs border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
                    >
                      <Award className="w-3.5 h-3.5 mr-1" />
                      {prediction ? 'Alterar Palpite' : 'Dar Palpite'}
                    </Button>
                  )}
                  <Link to={ROUTES.MATCH_CENTER_HUB(match.competitionId)}>
                    <Button size="sm" variant="ghost" className="text-xs text-primary hover:text-primary-hover">
                      Match Center
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
