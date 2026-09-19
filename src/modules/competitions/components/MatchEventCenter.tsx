import { useState, useEffect } from 'react'
import {
  Activity,
  Clock3,
  Goal,
  Loader2,
  ShieldAlert,
  Trash2,
  UserRound,
  ArrowRightLeft,
  CheckCircle2,
} from 'lucide-react'
import { Button, Card, NativeSelect, Input } from '@/components/ui'
import { useAddMatchEvent, useDeleteMatchEvent } from '../hooks'
import { useMatchPlayers, type MatchSelectablePlayer } from '../hooks/useMatchPlayers'
import type { EventType, Match, MatchEvent } from '../types'

export interface MatchEventCenterProps {
  competitionId: string
  match: Match
  events: MatchEvent[]
  canOperate: boolean
  canDelete: boolean
  onChanged?: () => void
}

const EVENT_OPTIONS: Array<{ value: EventType; label: string; icon: typeof Goal }> = [
  { value: 'goal', label: '⚽ Golo', icon: Goal },
  { value: 'penalty_scored', label: '🎯 Penálti marcado', icon: Goal },
  { value: 'own_goal', label: '🔴 Auto-golo', icon: Goal },
  { value: 'penalty_missed', label: '⚠️ Penálti falhado', icon: Goal },
  { value: 'yellow_card', label: '🟨 Cartão amarelo', icon: ShieldAlert },
  { value: 'red_card', label: '🟥 Cartão vermelho', icon: ShieldAlert },
  { value: 'yellow_red', label: '🟧 Segundo amarelo', icon: ShieldAlert },
  { value: 'substitution_in', label: '🔄 Substituição', icon: ArrowRightLeft },
]

const EVENT_COLORS: Record<string, string> = {
  goal: '#16a34a',
  own_goal: '#dc2626',
  penalty_scored: '#2563eb',
  penalty_missed: '#d97706',
  yellow_card: '#d97706',
  red_card: '#dc2626',
  yellow_red: '#be123c',
  substitution_in: '#4338ca',
  substitution_out: '#4338ca',
}

export function MatchEventCenter({
  competitionId,
  match,
  events,
  canOperate,
  canDelete,
  onChanged,
}: MatchEventCenterProps) {
  const homeClubId = match.home_club || match.homeTeamId || ''
  const awayClubId = match.away_club || match.awayTeamId || ''

  const {
    getPlayersForClub,
    getStartersForClub,
    getSubstitutesForClub,
    isLoading: loadingPlayers,
  } = useMatchPlayers(match.id, homeClubId, awayClubId)

  const addEvent = useAddMatchEvent(competitionId, match.id)
  const deleteEvent = useDeleteMatchEvent(competitionId, match.id)

  const [eventType, setEventType] = useState<EventType>('goal')
  const [clubId, setClubId] = useState(homeClubId)
  const [playerId, setPlayerId] = useState('')
  const [customPlayerName, setCustomPlayerName] = useState('')
  const [playerOffId, setPlayerOffId] = useState('')
  const [minute, setMinute] = useState(String(match.current_minute ?? 1))
  const [notes, setNotes] = useState('')

  // Sync minute with match current minute when it updates
  useEffect(() => {
    if (match.current_minute && match.current_minute > 0) {
      setMinute(String(match.current_minute))
    }
  }, [match.current_minute])

  const isSubstitution = eventType === 'substitution_in' || eventType === 'substitution_out'
  const isCustomPlayer = playerId === 'custom'

  const availablePlayers = getPlayersForClub(clubId)
  const starters = getStartersForClub(clubId)
  const substitutes = getSubstitutesForClub(clubId)
  const otherSquad = availablePlayers.filter(
    (p) => p.status !== 'starter' && p.status !== 'substitute'
  )

  const selectedPlayer = availablePlayers.find((p) => p.id === playerId)
  const selectedPlayerOff = availablePlayers.find((p) => p.id === playerOffId)
  const canAdd =
    canOperate &&
    (match.status === 'live' ||
      match.status === 'halftime' ||
      match.status === 'pre_match' ||
      match.status === 'finished')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const minuteValue = Number(minute)
    if (!canAdd || !Number.isInteger(minuteValue) || minuteValue < 0 || minuteValue > 135) return
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
        notes: resolvedNotes || undefined,
      },
      {
        onSuccess: () => {
          setPlayerId('')
          setPlayerOffId('')
          setCustomPlayerName('')
          setNotes('')
          onChanged?.()
        },
      }
    )
  }

  return (
    <div className="grid gap-lg xl:grid-cols-[minmax(0,1fr)_22rem]">
      {/* Event Timeline */}
      <section className="space-y-sm" aria-labelledby="match-events-title">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm">
            <Activity className="h-5 w-5 text-primary" />
            <h2 id="match-events-title" className="text-lg font-semibold text-on-surface">
              Registos de Eventos em Direto
            </h2>
          </div>
          <span className="text-xs text-on-surface-variant">{events.length} registo(s)</span>
        </div>

        {events.length === 0 ? (
          <Card variant="flat" padding="lg">
            <div className="py-xl text-center text-sm text-on-surface-variant">
              Ainda não existem eventos registados nesta partida.
            </div>
          </Card>
        ) : (
          <div className="relative space-y-sm before:absolute before:bottom-3 before:left-[3.25rem] before:top-3 before:w-0.5 before:bg-primary/20">
            {[...events]
              .sort((a, b) => a.minute - b.minute)
              .map((event) => {
                const eventPlayer =
                  event.player_name ||
                  (event as any).player_full_name ||
                  event.notes ||
                  event.playerId ||
                  event.event_type_label
                const home = event.club === homeClubId
                const eventColor = EVENT_COLORS[event.event_type] ?? '#64748b'

                return (
                  <div
                    key={event.id}
                    className={`group relative grid grid-cols-[3rem_1fr_auto] items-center gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-container-low ${
                      home ? '' : 'text-right'
                    }`}
                  >
                    <div className="z-10 flex h-8 w-8 flex-col items-center justify-center rounded-full border-2 border-surface-container bg-surface-container-high text-xs font-bold text-on-surface transition-colors group-hover:bg-primary group-hover:text-on-primary">
                      <Clock3 className="h-3.5 w-3.5" />
                      {event.minute}
                      {event.extra_time ? '+' : "'"}
                    </div>

                    <div
                      className={`flex items-center gap-sm ${
                        home ? '' : 'flex-row-reverse'
                      }`}
                    >
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full"
                        style={{ backgroundColor: `${eventColor}20`, color: eventColor }}
                      >
                        <UserRound className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-on-surface">
                          {eventPlayer}
                          {event.player_off_name && (
                            <span className="text-xs font-normal text-on-surface-variant ml-1">
                              (sai: {event.player_off_name})
                            </span>
                          )}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {event.event_type_label || event.event_type} · {event.club_name}
                        </p>
                        {event.notes && !event.player_name && (
                          <p className="text-xs text-on-surface-variant italic">
                            {event.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {canDelete && (
                      <button
                        type="button"
                        className="text-error opacity-60 transition-opacity hover:opacity-100 p-1.5"
                        aria-label="Remover evento"
                        onClick={() => {
                          if (window.confirm('Remover este evento?')) {
                            deleteEvent.mutate(event.id, { onSuccess: onChanged })
                          }
                        }}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                )
              })}
          </div>
        )}
      </section>

      {/* Event Registration Form */}
      {canOperate && (
        <Card variant="flat" padding="lg">
          <form onSubmit={submit} className="space-y-md">
            <div>
              <h3 className="font-semibold text-on-surface">Lançar Evento Rápido</h3>
              <p className="mt-xs text-xs text-on-surface-variant">
                Registo de golo, cartão ou substituição com atualização em tempo real.
              </p>
            </div>

            {/* Tipo de Evento */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Tipo de Evento
              </label>
              <NativeSelect
                value={eventType}
                onChange={(e) => {
                  setEventType(e.target.value as EventType)
                  setPlayerId('')
                  setPlayerOffId('')
                  setCustomPlayerName('')
                }}
                disabled={!canAdd}
              >
                {EVENT_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </NativeSelect>
            </div>

            {/* Equipa */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Equipa
              </label>
              <NativeSelect
                value={clubId}
                onChange={(e) => {
                  setClubId(e.target.value)
                  setPlayerId('')
                  setPlayerOffId('')
                  setCustomPlayerName('')
                }}
                disabled={!canAdd}
              >
                <option value={homeClubId}>{match.home_club_name || 'Equipa Visitada'}</option>
                <option value={awayClubId}>{match.away_club_name || 'Equipa Visitante'}</option>
              </NativeSelect>
            </div>

            {/* Jogador Principal (Marcador / Advertido / Entra) */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                {isSubstitution
                  ? 'Jogador que Entra (Suplente / Banco)'
                  : eventType === 'own_goal'
                  ? 'Jogador Autor do Auto-Golo'
                  : 'Jogador / Atleta Envolvido'}
              </label>
              <NativeSelect
                required
                value={playerId}
                onChange={(e) => setPlayerId(e.target.value)}
                disabled={!canAdd || loadingPlayers}
              >
                <option value="">
                  {loadingPlayers
                    ? 'A carregar atletas...'
                    : 'Selecione o jogador...'}
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
                  <option value="custom">Outro / Atleta não listado</option>
                </optgroup>
              </NativeSelect>
            </div>

            {/* Input para atleta custom */}
            {isCustomPlayer && (
              <div>
                <label className="block text-xs font-medium text-primary mb-1">
                  Nome do Atleta
                </label>
                <Input
                  required
                  type="text"
                  placeholder="Nome completo do jogador..."
                  value={customPlayerName}
                  onChange={(e) => setCustomPlayerName(e.target.value)}
                  className="h-9 text-xs"
                />
              </div>
            )}

            {/* Jogador que Sai (Substituição) */}
            {isSubstitution && (
              <div>
                <label className="block text-xs font-medium text-error mb-1">
                  Jogador que Sai (Titular em Campo)
                </label>
                <NativeSelect
                  required
                  value={playerOffId}
                  onChange={(e) => setPlayerOffId(e.target.value)}
                  disabled={!canAdd || loadingPlayers}
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

            {/* Preview do Jogador Selecionado */}
            {selectedPlayer && !isCustomPlayer && (
              <div className="rounded-lg bg-primary/10 px-sm py-xs text-xs text-primary">
                {isSubstitution ? (
                  <>
                    Entra: <strong>#{selectedPlayer.number ?? '-'} {selectedPlayer.name}</strong>
                    {selectedPlayerOff && (
                      <> • Sai: <strong>#{selectedPlayerOff.number ?? '-'} {selectedPlayerOff.name}</strong></>
                    )}
                  </>
                ) : (
                  <>
                    Jogador selecionado:{' '}
                    <strong>
                      #{selectedPlayer.number ?? '-'} {selectedPlayer.name}
                    </strong>{' '}
                    ({selectedPlayer.position ?? 'Jogador'})
                  </>
                )}
              </div>
            )}

            {/* Minuto */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Minuto do Jogo
              </label>
              <div className="flex items-center gap-xs">
                <Input
                  required
                  type="number"
                  min="0"
                  max="135"
                  value={minute}
                  onChange={(e) => setMinute(e.target.value)}
                  disabled={!canAdd}
                  className="h-9 text-xs"
                  placeholder="Minuto (0–135)"
                />
                <span className="text-xs font-semibold text-on-surface-variant">min</span>
              </div>
            </div>

            {/* Observação Opcional */}
            <div>
              <label className="block text-xs font-medium text-on-surface-variant mb-1">
                Observação (Opcional)
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={!canAdd}
                rows={2}
                className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-xs text-on-surface"
                placeholder="Ex.: Assistência do n.º 10, cabeceamento, falta dura..."
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full"
              disabled={!canAdd || addEvent.isPending || !playerId}
            >
              {addEvent.isPending ? (
                <>
                  <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                  A registar evento...
                </>
              ) : (
                <>
                  <CheckCircle2 className="mr-xs h-4 w-4" />
                  Guardar Evento ao Vivo
                </>
              )}
            </Button>

            {!canAdd && (
              <p className="text-xs text-on-surface-variant text-center">
                O registo em direto está disponível para partidas ativas ou finalizadas.
              </p>
            )}
          </form>
        </Card>
      )}
    </div>
  )
}
