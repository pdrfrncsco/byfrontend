import { useState, useEffect } from 'react'
import {
  Zap,
  Goal,
  ShieldAlert,
  ArrowRightLeft,
  Loader2,
  X,
  CheckCircle2,
} from 'lucide-react'
import { Button, Input, NativeSelect } from '@/components/ui'
import { useAddMatchEvent } from '../hooks'
import { useMatchPlayers } from '../hooks/useMatchPlayers'
import { getMatchClockInfo } from '../utils/match-clock'
import type { EventType, Match } from '../types'

interface LiveEventModalProps {
  competitionId: string
  match: Match | null
  isOpen: boolean
  onClose: () => void
  onSuccess?: () => void
}

export function LiveEventModal({
  competitionId,
  match,
  isOpen,
  onClose,
  onSuccess,
}: LiveEventModalProps) {
  const homeClubId = match?.home_club || match?.homeTeamId || ''
  const awayClubId = match?.away_club || match?.awayTeamId || ''

  const {
    getPlayersForClub,
    getStartersForClub,
    getSubstitutesForClub,
    isLoading: loadingPlayers,
  } = useMatchPlayers(match?.id, homeClubId, awayClubId)

  const addEvent = useAddMatchEvent(competitionId, match?.id || '')

  const [eventType, setEventType] = useState<EventType>('goal')
  const [clubId, setClubId] = useState(homeClubId)
  const [playerId, setPlayerId] = useState('')
  const [customPlayerName, setCustomPlayerName] = useState('')
  const [playerOffId, setPlayerOffId] = useState('')
  const [assistPlayerId, setAssistPlayerId] = useState('')
  const [minute, setMinute] = useState(String(match?.current_minute ?? 1))
  const [notes, setNotes] = useState('')

  useEffect(() => {
    if (isOpen && match) {
      setClubId(homeClubId)
      const clock = getMatchClockInfo(match, Date.now())
      const currentMin = clock.minute > 0 ? clock.minute : (match.current_minute || 1)
      setMinute(String(currentMin))
      setPlayerId('')
      setPlayerOffId('')
      setAssistPlayerId('')
      setCustomPlayerName('')
      setNotes('')
    }
  }, [isOpen])

  if (!isOpen || !match) return null

  const isSubstitution = eventType === 'substitution_in' || eventType === 'substitution_out'
  const isAssistableGoal = eventType === 'goal' || eventType === 'penalty_scored'
  const isCustomPlayer = playerId === 'custom'

  const availablePlayers = getPlayersForClub(clubId)
  const starters = getStartersForClub(clubId)
  const substitutes = getSubstitutesForClub(clubId)
  const otherSquad = availablePlayers.filter(
    (p) => p.status !== 'starter' && p.status !== 'substitute'
  )

  const selectedPlayer = availablePlayers.find((p) => p.id === playerId)
  const selectedPlayerOff = availablePlayers.find((p) => p.id === playerOffId)

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const minuteValue = Number(minute)
    if (!Number.isInteger(minuteValue) || minuteValue < 0 || minuteValue > 135) return
    if (!playerId) return
    if (isSubstitution && !playerOffId) return

    const resolvedPlayerId = isCustomPlayer ? null : playerId
    const resolvedNotes = isCustomPlayer
      ? customPlayerName ? `Atleta: ${customPlayerName} ${notes ? `(${notes})` : ''}` : notes
      : notes

    addEvent.mutate(
      {
        event_type: eventType,
        minute: minuteValue,
        extra_time: minuteValue > 90,
        club: clubId,
        player: resolvedPlayerId,
        player_off: isSubstitution ? (playerOffId === 'custom' ? null : playerOffId) : null,
        assist_player: isAssistableGoal && assistPlayerId ? assistPlayerId : null,
        notes: resolvedNotes || undefined,
      },
      {
        onSuccess: () => {
          onClose()
          onSuccess?.()
        },
      }
    )
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-md overflow-y-auto">
      <div className="w-full max-w-lg rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-2xl space-y-md">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-outline-variant/15 pb-sm">
          <div className="flex items-center gap-xs">
            <Zap className="h-5 w-5 text-primary" />
            <div>
              <h3 className="text-base font-bold text-on-surface">
                Registar Evento ao Vivo
              </h3>
              <p className="text-xs text-on-surface-variant">
                Lançamento imediato de golo, cartão ou substituição
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-on-surface-variant hover:text-on-surface p-1 rounded-md"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={submit} className="space-y-md">
          {/* Quick Event Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5">
              Tipo de Evento
            </label>
            <div className="grid grid-cols-4 gap-xs">
              <button
                type="button"
                onClick={() => {
                  setEventType('goal')
                  setPlayerId('')
                  setPlayerOffId('')
                  setAssistPlayerId('')
                }}
                className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs font-semibold transition-all border ${
                  eventType === 'goal'
                    ? 'border-emerald-600 bg-emerald-500/15 text-emerald-700 font-bold'
                    : 'border-outline-variant/20 bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <Goal className="h-4 w-4 mb-1 text-emerald-600" />
                Golo
              </button>

              <button
                type="button"
                onClick={() => {
                  setEventType('yellow_card')
                  setPlayerId('')
                  setPlayerOffId('')
                  setAssistPlayerId('')
                }}
                className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs font-semibold transition-all border ${
                  eventType === 'yellow_card'
                    ? 'border-amber-500 bg-amber-500/15 text-amber-700 font-bold'
                    : 'border-outline-variant/20 bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <ShieldAlert className="h-4 w-4 mb-1 text-amber-500" />
                Amarelo
              </button>

              <button
                type="button"
                onClick={() => {
                  setEventType('red_card')
                  setPlayerId('')
                  setPlayerOffId('')
                  setAssistPlayerId('')
                }}
                className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs font-semibold transition-all border ${
                  eventType === 'red_card'
                    ? 'border-red-600 bg-red-500/15 text-red-700 font-bold'
                    : 'border-outline-variant/20 bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <ShieldAlert className="h-4 w-4 mb-1 text-red-600" />
                Vermelho
              </button>

              <button
                type="button"
                onClick={() => {
                  setEventType('substitution_in')
                  setPlayerId('')
                  setPlayerOffId('')
                  setAssistPlayerId('')
                }}
                className={`flex flex-col items-center justify-center rounded-xl p-2 text-xs font-semibold transition-all border ${
                  isSubstitution
                    ? 'border-indigo-600 bg-indigo-500/15 text-indigo-700 font-bold'
                    : 'border-outline-variant/20 bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                <ArrowRightLeft className="h-4 w-4 mb-1 text-indigo-600" />
                Substituição
              </button>
            </div>

            {/* Opções secundárias */}
            <div className="flex gap-xs mt-1.5">
              <button
                type="button"
                onClick={() => setEventType('penalty_scored')}
                className={`text-[11px] px-2 py-0.5 rounded-md border ${
                  eventType === 'penalty_scored'
                    ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold'
                    : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                🎯 Penálti marcado
              </button>
              <button
                type="button"
                onClick={() => setEventType('own_goal')}
                className={`text-[11px] px-2 py-0.5 rounded-md border ${
                  eventType === 'own_goal'
                    ? 'border-red-500 bg-red-50 text-red-700 font-bold'
                    : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                🔴 Auto-golo
              </button>
              <button
                type="button"
                onClick={() => setEventType('yellow_red')}
                className={`text-[11px] px-2 py-0.5 rounded-md border ${
                  eventType === 'yellow_red'
                    ? 'border-orange-500 bg-orange-50 text-orange-700 font-bold'
                    : 'border-outline-variant/20 text-on-surface-variant hover:bg-surface-container'
                }`}
              >
                🟧 2º Amarelo
              </button>
            </div>
          </div>

          {/* Equipa */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              Equipa Envolvida
            </label>
            <div className="grid grid-cols-2 gap-xs">
              <button
                type="button"
                onClick={() => {
                  setClubId(homeClubId)
                  setPlayerId('')
                  setPlayerOffId('')
                }}
                className={`p-2 rounded-xl text-xs font-bold text-center border transition-all truncate ${
                  clubId === homeClubId
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant/20 bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                {match.home_club_name} (Casa)
              </button>
              <button
                type="button"
                onClick={() => {
                  setClubId(awayClubId)
                  setPlayerId('')
                  setPlayerOffId('')
                }}
                className={`p-2 rounded-xl text-xs font-bold text-center border transition-all truncate ${
                  clubId === awayClubId
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-outline-variant/20 bg-surface-container hover:bg-surface-container-high text-on-surface'
                }`}
              >
                {match.away_club_name} (Fora)
              </button>
            </div>
          </div>

          {/* Jogador Principal */}
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1">
              {isSubstitution
                ? 'Jogador que Entra (Banco)'
                : eventType === 'own_goal'
                ? 'Jogador Autor do Auto-Golo'
                : 'Jogador / Atleta'}
            </label>
            <NativeSelect
              required
              value={playerId}
              onChange={(e) => setPlayerId(e.target.value)}
              disabled={loadingPlayers}
            >
              <option value="">
                {loadingPlayers ? 'A carregar atletas...' : 'Selecione o jogador...'}
              </option>
              {isSubstitution ? (
                <>
                  {substitutes.length > 0 && (
                    <optgroup label="Suplentes no Banco">
                      {substitutes.map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {otherSquad.length > 0 && (
                    <optgroup label="Outros Atletas do Plantel">
                      {otherSquad.map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              ) : (
                <>
                  {starters.length > 0 && (
                    <optgroup label="Titulares em Campo">
                      {starters.map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {substitutes.length > 0 && (
                    <optgroup label="Suplentes">
                      {substitutes.map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                  {otherSquad.length > 0 && (
                    <optgroup label="Plantel Geral">
                      {otherSquad.map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                    </optgroup>
                  )}
                </>
              )}
              <optgroup label="Outros">
                <option value="custom">Outro / Não listado</option>
              </optgroup>
            </NativeSelect>
          </div>

          {/* Atleta não listado */}
          {isCustomPlayer && (
            <div>
              <label className="block text-xs font-semibold text-primary mb-1">
                Nome do Jogador
              </label>
              <Input
                required
                type="text"
                placeholder="Digite o nome completo do jogador..."
                value={customPlayerName}
                onChange={(e) => setCustomPlayerName(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          )}

          {/* Assistência (para golos) */}
          {isAssistableGoal && (
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">
                Assistência (opcional)
              </label>
              <NativeSelect
                value={assistPlayerId}
                onChange={(e) => setAssistPlayerId(e.target.value)}
                disabled={loadingPlayers}
              >
                <option value="">Sem assistência</option>
                {starters.length > 0 && (
                  <optgroup label="Titulares em Campo">
                    {starters
                      .filter((player) => player.id !== playerId)
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                  </optgroup>
                )}
                {substitutes.length > 0 && (
                  <optgroup label="Suplentes">
                    {substitutes
                      .filter((player) => player.id !== playerId)
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                  </optgroup>
                )}
                {otherSquad.length > 0 && (
                  <optgroup label="Plantel Geral">
                    {otherSquad
                      .filter((player) => player.id !== playerId)
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                  </optgroup>
                )}
              </NativeSelect>
            </div>
          )}

          {/* Jogador que Sai (Substituição) */}
          {isSubstitution && (
            <div>
              <label className="block text-xs font-semibold text-error mb-1">
                Jogador que Sai (Campo)
              </label>
              <NativeSelect
                required
                value={playerOffId}
                onChange={(e) => setPlayerOffId(e.target.value)}
                disabled={loadingPlayers}
              >
                <option value="">Selecione quem sai...</option>
                {starters.length > 0 && (
                  <optgroup label="Titulares em Campo">
                    {starters
                      .filter((player) => player.id !== playerId)
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                  </optgroup>
                )}
                {substitutes.length > 0 && (
                  <optgroup label="Outros">
                    {substitutes
                      .filter((player) => player.id !== playerId)
                      .map((player) => (
                        <option key={player.id} value={player.id}>
                          #{player.number ?? '-'} {player.name} ({player.position ?? 'Jogador'})
                        </option>
                      ))}
                  </optgroup>
                )}
              </NativeSelect>
            </div>
          )}

          {/* Minuto e Observação */}
          <div className="grid grid-cols-3 gap-xs">
            <div className="col-span-1">
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Minuto
              </label>
              <Input
                required
                type="number"
                min="0"
                max="135"
                value={minute}
                onChange={(e) => setMinute(e.target.value)}
                className="h-9 text-xs text-center font-bold"
              />
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-semibold text-on-surface mb-1">
                Observação (opcional)
              </label>
              <Input
                type="text"
                placeholder="Ex.: Cabeceamento, de fora da área..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="h-9 text-xs"
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-sm border-t border-outline-variant/15 pt-md">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={addEvent.isPending || !playerId}
            >
              {addEvent.isPending ? (
                <>
                  <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                  A guardar...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-xs h-4 w-4" />
                  Registar Evento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
