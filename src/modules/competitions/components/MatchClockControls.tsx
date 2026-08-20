import { useState } from 'react'
import { Clock3, Loader2, Pause, Play, StopCircle } from 'lucide-react'
import { Button } from '@/components/ui'
import { toast } from 'sonner'
import { matchApi } from '../services/match.api'
import type { Match, MatchClockAction } from '../types'

interface MatchClockControlsProps {
  match: Match
  canControl: boolean
  extraTimeAllowed?: boolean
  penaltiesAllowed?: boolean
  onUpdated?: (match: Match) => void
}

export function MatchClockControls({ match, canControl, extraTimeAllowed = false, penaltiesAllowed = false, onUpdated }: MatchClockControlsProps) {
  const [pendingAction, setPendingAction] = useState<MatchClockAction | null>(null)

  if (!canControl) return null

  const action = match.status === 'pre_match'
    ? 'start_first_half'
    : match.status === 'halftime'
      ? (match.current_period === 'extra_halftime' ? 'start_extra_second_half' : 'start_second_half')
      : match.status === 'live' && match.current_period === 'first_half'
        ? (match.clock_running ? 'end_first_half' : 'resume_clock')
      : match.status === 'live' && match.current_period === 'second_half'
          ? (match.clock_running ? 'finish_match' : 'resume_clock')
          : match.status === 'live' && match.current_period === 'extra_time'
            ? ((match.home_score ?? 0) !== (match.away_score ?? 0) || !penaltiesAllowed ? 'finish_match' : null)
            : match.status === 'live' && match.current_period === 'extra_first_half'
              ? 'end_extra_first_half'
              : match.status === 'live' && match.current_period === 'extra_second_half'
                  ? ((match.home_score ?? 0) !== (match.away_score ?? 0) || !penaltiesAllowed ? 'finish_match' : null)
            : match.status === 'live' && match.current_period === 'penalties'
              ? null
          : null

  if (!action && !(match.status === 'live' || match.status === 'halftime')) return null

  const execute = async (nextAction: MatchClockAction, options?: { stoppageTimeMinutes?: number; homePenaltyScore?: number; awayPenaltyScore?: number }) => {
    const confirmation = nextAction === 'finish_match'
      ? 'Terminar a partida e abrir o resultado final?'
      : nextAction === 'end_first_half'
        ? 'Terminar o primeiro tempo e iniciar o intervalo?'
      : nextAction === 'start_second_half'
          ? 'Iniciar o segundo tempo?'
          : nextAction === 'end_extra_first_half'
            ? 'Terminar o primeiro período do prolongamento?'
            : nextAction === 'start_extra_second_half'
              ? 'Iniciar o segundo período do prolongamento?'
          : nextAction === 'start_first_half'
            ? 'Iniciar o primeiro tempo?'
            : null
    if (confirmation && !window.confirm(confirmation)) return

    try {
      setPendingAction(nextAction)
      const updated = await matchApi.clockAction(match.id, nextAction, {
        expectedVersion: match.clock_version,
        stoppageTimeMinutes: options?.stoppageTimeMinutes,
        homePenaltyScore: options?.homePenaltyScore,
        awayPenaltyScore: options?.awayPenaltyScore,
      })
      onUpdated?.(updated)
      toast.success(nextAction === 'finish_match' ? 'Partida terminada.' : 'Relógio actualizado.')
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || 'Não foi possível actualizar o relógio.')
    } finally {
      setPendingAction(null)
    }
  }

  const setStoppageTime = async () => {
    const value = window.prompt('Quantos minutos de acréscimo? (0–30)', String(match.stoppage_time_minutes ?? 0))
    if (value === null) return
    const minutes = Number(value)
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 30) {
      toast.error('Indique um valor inteiro entre 0 e 30 minutos.')
      return
    }
    await execute('set_stoppage_time', { stoppageTimeMinutes: minutes })
  }

  const startExtraTime = () => execute('start_extra_time')
  const handlePenalties = () => {
    if (match.current_period === 'extra_time' || match.current_period === 'second_half') {
      return execute('start_penalties')
    }
    const home = window.prompt('Penáltis marcados — ' + (match.home_club_name || 'Casa'))
    const away = window.prompt('Penáltis marcados — ' + (match.away_club_name || 'Fora'))
    if (home === null || away === null) return
    const homeScore = Number(home)
    const awayScore = Number(away)
    if (!Number.isInteger(homeScore) || !Number.isInteger(awayScore) || homeScore < 0 || awayScore < 0 || homeScore === awayScore) {
      toast.error('O desempate por penáltis precisa de dois resultados inteiros e diferentes.')
      return
    }
    return execute('finish_match', { homePenaltyScore: homeScore, awayPenaltyScore: awayScore })
  }

  return (
    <div className="flex flex-wrap items-center justify-center gap-sm rounded-xl border border-primary/20 bg-primary/5 p-sm" aria-label="Controlo do relógio da partida">
      {action && (
        <Button variant="primary" size="sm" onClick={() => void execute(action)} disabled={pendingAction !== null}>
          {pendingAction === action ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : action === 'end_first_half' ? <Pause className="mr-xs h-4 w-4" /> : action === 'finish_match' ? <StopCircle className="mr-xs h-4 w-4" /> : <Play className="mr-xs h-4 w-4" />}
          {action === 'start_first_half' ? 'Iniciar 1.º tempo' : action === 'end_first_half' ? 'Terminar 1.º tempo' : action === 'start_second_half' ? 'Iniciar 2.º tempo' : action === 'end_extra_first_half' ? 'Terminar 1.º prolongamento' : action === 'start_extra_second_half' ? 'Iniciar 2.º prolongamento' : action === 'resume_clock' ? 'Retomar relógio' : 'Terminar partida'}
        </Button>
      )}
      {match.status === 'live' && match.current_period === 'second_half' && match.clock_running && extraTimeAllowed && (
        <Button variant="secondary" size="sm" onClick={() => void startExtraTime()} disabled={pendingAction !== null}>
          Iniciar prolongamento
        </Button>
      )}
      {match.status === 'live' && (match.current_period === 'extra_time' || match.current_period === 'extra_second_half' || match.current_period === 'penalties') && penaltiesAllowed && ((match.home_score ?? 0) === (match.away_score ?? 0) || match.current_period === 'penalties') && (
        <Button variant="secondary" size="sm" onClick={() => void handlePenalties()} disabled={pendingAction !== null}>
          {match.current_period === 'extra_time' ? 'Iniciar penáltis' : 'Finalizar penáltis'}
        </Button>
      )}
      {(match.status === 'live' || match.status === 'halftime') && (
        <Button variant="secondary" size="sm" onClick={() => void setStoppageTime()} disabled={pendingAction !== null}>
          {pendingAction === 'set_stoppage_time' ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : <Clock3 className="mr-xs h-4 w-4" />}
          Acréscimo{match.stoppage_time_minutes ? `: ${match.stoppage_time_minutes} min` : ''}
        </Button>
      )}
    </div>
  )
}
