import { useState } from 'react'
import { Clock3, Loader2, Pause, Play, StopCircle, X } from 'lucide-react'
import { Button, Card } from '@/components/ui'
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

interface ConfirmModalData {
  action: MatchClockAction
  title: string
  message: string
}

export function MatchClockControls({
  match,
  canControl,
  extraTimeAllowed = false,
  penaltiesAllowed = false,
  onUpdated,
}: MatchClockControlsProps) {
  const [pendingAction, setPendingAction] = useState<MatchClockAction | null>(null)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalData | null>(null)
  const [showStoppageModal, setShowStoppageModal] = useState(false)
  const [stoppageInput, setStoppageInput] = useState(String(match.stoppage_time_minutes ?? 0))

  const [showPenaltiesModal, setShowPenaltiesModal] = useState(false)
  const [homePenalties, setHomePenalties] = useState('')
  const [awayPenalties, setAwayPenalties] = useState('')

  if (!canControl) return null

  const action: MatchClockAction | null =
    match.status === 'pre_match'
      ? 'start_first_half'
      : match.status === 'halftime'
      ? match.current_period === 'extra_halftime'
        ? 'start_extra_second_half'
        : 'start_second_half'
      : match.status === 'live' && match.current_period === 'first_half'
      ? match.clock_running
        ? 'end_first_half'
        : 'resume_clock'
      : match.status === 'live' && match.current_period === 'second_half'
      ? match.clock_running
        ? 'finish_match'
        : 'resume_clock'
      : match.status === 'live' && match.current_period === 'extra_time'
      ? (match.home_score ?? 0) !== (match.away_score ?? 0) || !penaltiesAllowed
        ? 'finish_match'
        : null
      : match.status === 'live' && match.current_period === 'extra_first_half'
      ? 'end_extra_first_half'
      : match.status === 'live' && match.current_period === 'extra_second_half'
      ? (match.home_score ?? 0) !== (match.away_score ?? 0) || !penaltiesAllowed
        ? 'finish_match'
        : null
      : match.status === 'live' && match.current_period === 'penalties'
      ? null
      : null

  if (!action && !(match.status === 'live' || match.status === 'halftime')) return null

  const executeAction = async (
    nextAction: MatchClockAction,
    options?: { stoppageTimeMinutes?: number; homePenaltyScore?: number; awayPenaltyScore?: number }
  ) => {
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

  const handleActionClick = (nextAction: MatchClockAction) => {
    const confirmationMap: Record<string, { title: string; message: string }> = {
      finish_match: {
        title: 'Terminar Partida',
        message: 'Tem a certeza que deseja terminar a partida e registar o resultado final?',
      },
      end_first_half: {
        title: 'Terminar 1.º Tempo',
        message: 'Deseja terminar o primeiro tempo e iniciar o intervalo?',
      },
      start_second_half: {
        title: 'Iniciar 2.º Tempo',
        message: 'Deseja iniciar o segundo tempo da partida?',
      },
      end_extra_first_half: {
        title: 'Terminar 1.º Prolongamento',
        message: 'Deseja terminar a primeira parte do prolongamento?',
      },
      start_extra_second_half: {
        title: 'Iniciar 2.º Prolongamento',
        message: 'Deseja iniciar a segunda parte do prolongamento?',
      },
      start_first_half: {
        title: 'Iniciar Jogo',
        message: 'Deseja dar o pontapé de saída e iniciar a partida?',
      },
    }

    const conf = confirmationMap[nextAction]
    if (conf) {
      setConfirmModal({ action: nextAction, title: conf.title, message: conf.message })
    } else {
      executeAction(nextAction)
    }
  }

  const submitStoppageTime = async (e: React.FormEvent) => {
    e.preventDefault()
    const minutes = Number(stoppageInput)
    if (!Number.isInteger(minutes) || minutes < 0 || minutes > 30) {
      toast.error('Indique um valor inteiro entre 0 e 30 minutos.')
      return
    }
    setShowStoppageModal(false)
    await executeAction('set_stoppage_time', { stoppageTimeMinutes: minutes })
  }

  const startExtraTime = () => executeAction('start_extra_time')

  const handlePenaltiesClick = () => {
    if (match.current_period === 'extra_time' || match.current_period === 'second_half') {
      void executeAction('start_penalties')
      return
    }
    setHomePenalties('')
    setAwayPenalties('')
    setShowPenaltiesModal(true)
  }

  const submitPenalties = async (e: React.FormEvent) => {
    e.preventDefault()
    const home = Number(homePenalties)
    const away = Number(awayPenalties)
    if (
      !Number.isInteger(home) ||
      !Number.isInteger(away) ||
      home < 0 ||
      away < 0 ||
      home === away
    ) {
      toast.error('O desempate por grandes penalidades necessita de dois valores inteiros distintos.')
      return
    }
    setShowPenaltiesModal(false)
    await executeAction('finish_match', { homePenaltyScore: home, awayPenaltyScore: away })
  }

  return (
    <>
      <div
        className="flex flex-wrap items-center justify-center gap-sm rounded-xl border border-primary/20 bg-primary/5 p-sm"
        aria-label="Controlo do relógio da partida"
      >
        {action && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => handleActionClick(action)}
            disabled={pendingAction !== null}
          >
            {pendingAction === action ? (
              <Loader2 className="mr-xs h-4 w-4 animate-spin" />
            ) : action === 'end_first_half' ? (
              <Pause className="mr-xs h-4 w-4" />
            ) : action === 'finish_match' ? (
              <StopCircle className="mr-xs h-4 w-4" />
            ) : (
              <Play className="mr-xs h-4 w-4" />
            )}
            {action === 'start_first_half'
              ? 'Iniciar 1.º tempo'
              : action === 'end_first_half'
              ? 'Terminar 1.º tempo'
              : action === 'start_second_half'
              ? 'Iniciar 2.º tempo'
              : action === 'end_extra_first_half'
              ? 'Terminar 1.º prolongamento'
              : action === 'start_extra_second_half'
              ? 'Iniciar 2.º prolongamento'
              : action === 'resume_clock'
              ? 'Retomar relógio'
              : 'Terminar partida'}
          </Button>
        )}

        {match.status === 'live' &&
          match.current_period === 'second_half' &&
          match.clock_running &&
          extraTimeAllowed && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => void startExtraTime()}
              disabled={pendingAction !== null}
            >
              Iniciar prolongamento
            </Button>
          )}

        {match.status === 'live' &&
          (match.current_period === 'extra_time' ||
            match.current_period === 'extra_second_half' ||
            match.current_period === 'penalties') &&
          penaltiesAllowed &&
          ((match.home_score ?? 0) === (match.away_score ?? 0) || match.current_period === 'penalties') && (
            <Button
              variant="secondary"
              size="sm"
              onClick={handlePenaltiesClick}
              disabled={pendingAction !== null}
            >
              {match.current_period === 'extra_time' ? 'Iniciar penáltis' : 'Finalizar penáltis'}
            </Button>
          )}

        {(match.status === 'live' || match.status === 'halftime') && (
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setStoppageInput(String(match.stoppage_time_minutes ?? 0))
              setShowStoppageModal(true)
            }}
            disabled={pendingAction !== null}
          >
            {pendingAction === 'set_stoppage_time' ? (
              <Loader2 className="mr-xs h-4 w-4 animate-spin" />
            ) : (
              <Clock3 className="mr-xs h-4 w-4" />
            )}
            Acréscimo{match.stoppage_time_minutes ? `: ${match.stoppage_time_minutes} min` : ''}
          </Button>
        )}
      </div>

      {/* Confirmation Modal */}
      {confirmModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-surface-container/70 backdrop-blur-[2px]"
            onClick={() => setConfirmModal(null)}
          />
          <Card padding="lg" className="relative z-10 w-full max-w-md shadow-2xl">
            <h3 className="text-lg font-bold text-on-surface">{confirmModal.title}</h3>
            <p className="mt-sm text-sm text-on-surface-variant">{confirmModal.message}</p>
            <div className="mt-lg flex justify-end gap-sm">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setConfirmModal(null)}
                disabled={pendingAction !== null}
              >
                Cancelar
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  const act = confirmModal.action
                  setConfirmModal(null)
                  executeAction(act)
                }}
                disabled={pendingAction !== null}
              >
                Confirmar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {/* Stoppage Time Modal */}
      {showStoppageModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-surface-container/70 backdrop-blur-[2px]"
            onClick={() => setShowStoppageModal(false)}
          />
          <Card padding="lg" className="relative z-10 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">Minutos de Acréscimo</h3>
              <button
                type="button"
                onClick={() => setShowStoppageModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={submitStoppageTime} className="mt-md space-y-md">
              <div>
                <label className="text-xs font-semibold text-on-surface-variant">Tempo extra a atribuir (0-30 minutos):</label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  required
                  value={stoppageInput}
                  onChange={(e) => setStoppageInput(e.target.value)}
                  className="mt-xs w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface font-bold text-center"
                  placeholder="Minutos de compensação"
                />
              </div>
              <div className="flex justify-end gap-sm">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowStoppageModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Definir Acréscimo
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}

      {/* Penalties Shootout Modal */}
      {showPenaltiesModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-surface-container/70 backdrop-blur-[2px]"
            onClick={() => setShowPenaltiesModal(false)}
          />
          <Card padding="lg" className="relative z-10 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-on-surface">Desempate por Grandes Penalidades</h3>
              <button
                type="button"
                onClick={() => setShowPenaltiesModal(false)}
                className="text-on-surface-variant hover:text-on-surface"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="mt-xs text-xs text-on-surface-variant">
              Registe os penáltis convertidos para apurar o vencedor da eliminatória.
            </p>
            <form onSubmit={submitPenalties} className="mt-md space-y-md">
              <div className="grid grid-cols-2 gap-md">
                <div>
                  <label className="block text-xs font-semibold text-on-surface truncate">
                    {match.home_club_name || 'Casa'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={homePenalties}
                    onChange={(e) => setHomePenalties(e.target.value)}
                    className="mt-xs w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-center text-lg font-bold text-on-surface"
                    placeholder="0"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-on-surface truncate">
                    {match.away_club_name || 'Fora'}
                  </label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={awayPenalties}
                    onChange={(e) => setAwayPenalties(e.target.value)}
                    className="mt-xs w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-center text-lg font-bold text-on-surface"
                    placeholder="0"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-sm">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowPenaltiesModal(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" variant="primary" size="sm">
                  Confirmar Vencedor
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </>
  )
}
