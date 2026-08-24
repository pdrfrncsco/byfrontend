import { useMemo, useState } from 'react'
import { Activity, Clock3, Goal, Loader2, ShieldAlert, Trash2, UserRound } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useAddMatchEvent, useDeleteMatchEvent, useLineups } from '../hooks'
import type { EventType, Match, MatchEvent } from '../types'

interface MatchEventCenterProps {
  competitionId: string
  match: Match
  events: MatchEvent[]
  canOperate: boolean
  canDelete: boolean
  onChanged?: () => void
}

type SelectablePlayer = { id: string; name: string; number?: number }

const EVENT_OPTIONS: Array<{ value: EventType; label: string; icon: typeof Goal }> = [
  { value: 'goal', label: 'Golo', icon: Goal },
  { value: 'own_goal', label: 'Auto-golo', icon: Goal },
  { value: 'penalty_scored', label: 'Penálti marcado', icon: Goal },
  { value: 'penalty_missed', label: 'Penálti falhado', icon: Goal },
  { value: 'yellow_card', label: 'Cartão amarelo', icon: ShieldAlert },
  { value: 'red_card', label: 'Cartão vermelho', icon: ShieldAlert },
  { value: 'yellow_red', label: 'Segundo amarelo', icon: ShieldAlert },
  { value: 'substitution_in', label: 'Substituição', icon: Activity },
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

function getPlayers(lineup: any): SelectablePlayer[] {
  const players = lineup?.starters ?? lineup?.lineup_players ?? []
  const substitutes = lineup?.substitutes ?? []
  return [...players, ...substitutes].map((player: any) => ({
    id: String(player.player_id ?? player.playerId ?? player.player?.id ?? player.id),
    name: player.player_name ?? player.playerName ?? player.player?.full_name ?? 'Jogador',
    number: player.shirt_number ?? player.playerNumber ?? player.player?.shirt_number,
  })).filter(player => player.id && player.id !== 'undefined')
}

export function MatchEventCenter({ competitionId, match, events, canOperate, canDelete, onChanged }: MatchEventCenterProps) {
  const { data: lineups = [], isLoading: loadingLineups } = useLineups(match.id)
  const addEvent = useAddMatchEvent(competitionId, match.id)
  const deleteEvent = useDeleteMatchEvent(competitionId, match.id)
  const [eventType, setEventType] = useState<EventType>('goal')
  const [clubId, setClubId] = useState(match.home_club)
  const [playerId, setPlayerId] = useState('')
  const [playerOffId, setPlayerOffId] = useState('')
  const [minute, setMinute] = useState(String(match.current_minute ?? 0))
  const [notes, setNotes] = useState('')

  const players = useMemo(() => {
    const lineup = (lineups as any[]).find(item => String(item.club ?? item.club_id) === String(clubId))
    return getPlayers(lineup)
  }, [lineups, clubId])
  const selectedPlayer = players.find(player => player.id === playerId)
  const isSubstitution = eventType === 'substitution_in' || eventType === 'substitution_out'
  const canAdd = canOperate && (match.status === 'live' || match.status === 'halftime')

  const submit = (event: React.FormEvent) => {
    event.preventDefault()
    const minuteValue = Number(minute)
    if (!canAdd || !playerId || !Number.isInteger(minuteValue) || minuteValue < 0 || minuteValue > 130) return
    addEvent.mutate({
      event_type: eventType,
      minute: minuteValue,
      extra_time: minuteValue > 90,
      club: clubId,
      player: playerId,
      player_off: isSubstitution ? playerOffId || null : null,
      notes: notes || undefined,
    }, {
      onSuccess: () => {
        setPlayerId('')
        setPlayerOffId('')
        setNotes('')
        onChanged?.()
      },
    })
  }

  return (
    <div className="grid gap-lg xl:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="space-y-sm" aria-labelledby="match-events-title">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-sm"><Activity className="h-5 w-5 text-primary" /><h2 id="match-events-title" className="text-lg font-semibold text-on-surface">Registos de eventos</h2></div>
          <span className="text-xs text-on-surface-variant">{events.length} registo(s)</span>
        </div>
        {events.length === 0 ? <Card variant="flat" padding="lg"><div className="py-xl text-center text-sm text-on-surface-variant">Ainda não existem eventos registados.</div></Card> : (
          <div className="relative space-y-sm before:absolute before:bottom-3 before:left-[3.25rem] before:top-3 before:w-0.5 before:bg-primary/20">
            {[...events].sort((a, b) => a.minute - b.minute).map(event => {
              const eventPlayer = event.player_name || event.playerId || event.event_type_label
              const home = event.club === match.home_club
              const eventColor = EVENT_COLORS[event.event_type] ?? '#64748b'
              return <div key={event.id} className={`group relative grid grid-cols-[3rem_1fr_auto] items-center gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-container-low hover:shadow-[0_10px_22px_-18px_rgba(15,17,23,0.5)] ${home ? '' : 'text-right'}`}>
                <div className="z-10 flex h-8 w-8 flex-col items-center justify-center rounded-full border-2 border-surface-container bg-surface-container-high text-xs font-bold text-on-surface transition-colors group-hover:bg-primary group-hover:text-on-primary"><Clock3 className="h-3.5 w-3.5" />{event.minute}{event.extra_time ? '+' : "'"}</div>
                <div className={`flex items-center gap-sm ${home ? '' : 'flex-row-reverse'}`}><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ backgroundColor: `${eventColor}20`, color: eventColor }}><UserRound className="h-4 w-4" /></span><div><p className="text-sm font-semibold text-on-surface">{eventPlayer}</p><p className="text-xs text-on-surface-variant">{event.event_type_label} · {event.club_name}</p>{event.notes && <p className="text-xs text-on-surface-variant">{event.notes}</p>}</div></div>
                {canDelete && <button type="button" className="text-error opacity-60 transition-opacity hover:opacity-100" aria-label="Remover evento" onClick={() => { if (window.confirm('Remover este evento?')) deleteEvent.mutate(event.id, { onSuccess: onChanged }) }}><Trash2 className="h-4 w-4" /></button>}
              </div>
            })}
          </div>
        )}
      </section>

      {canOperate && <Card variant="flat" padding="lg">
        <form onSubmit={submit} className="space-y-md">
          <div><h3 className="font-semibold text-on-surface">Registar evento</h3><p className="mt-xs text-xs text-on-surface-variant">Seleccione a equipa e o jogador envolvidos.</p></div>
          <select value={eventType} onChange={event => { setEventType(event.target.value as EventType); setPlayerId(''); setPlayerOffId('') }} disabled={!canAdd} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface">
            {EVENT_OPTIONS.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          <select value={clubId} onChange={event => { setClubId(event.target.value); setPlayerId(''); setPlayerOffId('') }} disabled={!canAdd} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface">
            <option value={match.home_club}>{match.home_club_name}</option><option value={match.away_club}>{match.away_club_name}</option>
          </select>
          <select required value={playerId} onChange={event => setPlayerId(event.target.value)} disabled={!canAdd || loadingLineups} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface">
            <option value="">{loadingLineups ? 'A carregar jogadores...' : 'Seleccionar jogador'}</option>{players.map(player => <option key={player.id} value={player.id}>{player.number ? `#${player.number} ` : ''}{player.name}</option>)}
          </select>
          {isSubstitution && <select required value={playerOffId} onChange={event => setPlayerOffId(event.target.value)} disabled={!canAdd || loadingLineups} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface"><option value="">Jogador que sai</option>{players.filter(player => player.id !== playerId).map(player => <option key={player.id} value={player.id}>{player.number ? `#${player.number} ` : ''}{player.name}</option>)}</select>}
          {selectedPlayer && <div className="rounded-lg bg-primary/10 px-sm py-xs text-xs text-primary">Jogador seleccionado: <strong>{selectedPlayer.name}</strong></div>}
          <input required type="number" min="0" max="130" value={minute} onChange={event => setMinute(event.target.value)} disabled={!canAdd} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface" placeholder="Minuto" />
          <textarea value={notes} onChange={event => setNotes(event.target.value)} disabled={!canAdd} className="min-h-20 w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface" placeholder="Observação opcional" />
          <Button type="submit" variant="primary" className="w-full" disabled={!canAdd || addEvent.isPending || !playerId}>{addEvent.isPending ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : 'Guardar evento'}</Button>
          {!canAdd && <p className="text-xs text-on-surface-variant">O registo só está disponível durante a partida ao vivo.</p>}
        </form>
      </Card>}
    </div>
  )
}
