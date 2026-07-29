import { useState } from 'react'
import { Loader2, Plus, Zap } from 'lucide-react'
import { Button, Card } from '@/components/ui'
import { useAddMatchEvent } from '../hooks/useMatchCenter'
import type { EventType, Match } from '../types'

export interface MatchEventFormProps { competitionId: string; match: Match; onSuccess: () => void; onCancel: () => void }

export function MatchEventForm({ competitionId, match, onSuccess, onCancel }: MatchEventFormProps) {
  const addEvent = useAddMatchEvent(competitionId, match.id)
  const [eventType, setEventType] = useState<EventType>('goal')
  const [minute, setMinute] = useState('')
  const [clubId, setClubId] = useState(match.home_club)
  const [extraTime, setExtraTime] = useState(false)
  const [notes, setNotes] = useState('')
  const submit = (event: React.FormEvent) => { event.preventDefault(); const value = Number(minute); if (!Number.isInteger(value) || value < 0 || value > 120) return; addEvent.mutate({ event_type: eventType, minute: value, extra_time: extraTime, club: clubId, notes: notes || undefined }, { onSuccess }) }
  return <Card variant="flat" padding="lg"><form onSubmit={submit} className="space-y-md"><div className="flex items-center gap-sm"><Plus className="h-4 w-4" /><h3 className="font-semibold text-on-surface">Registar evento</h3></div><div className="grid gap-md sm:grid-cols-3"><label className="space-y-xs text-sm text-on-surface-variant">Tipo<select value={eventType} onChange={event => setEventType(event.target.value as EventType)} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface"><option value="goal">Golo</option><option value="own_goal">Auto-golo</option><option value="penalty_scored">Penálti marcado</option><option value="yellow_card">Cartão amarelo</option><option value="red_card">Cartão vermelho</option><option value="substitution_in">Substituição</option></select></label><label className="space-y-xs text-sm text-on-surface-variant">Minuto<input required type="number" min="0" max="120" value={minute} onChange={event => setMinute(event.target.value)} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface" /></label><label className="space-y-xs text-sm text-on-surface-variant">Equipa<select value={clubId} onChange={event => setClubId(event.target.value)} className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-on-surface"><option value={match.home_club}>{match.home_club_name}</option><option value={match.away_club}>{match.away_club_name}</option></select></label></div><label className="flex items-center gap-xs text-sm text-on-surface-variant"><input type="checkbox" checked={extraTime} onChange={event => setExtraTime(event.target.checked)} />Tempo adicional</label><input value={notes} onChange={event => setNotes(event.target.value)} placeholder="Observação opcional" className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface" /><div className="flex justify-end gap-sm"><Button type="button" variant="secondary" size="sm" onClick={onCancel}>Cancelar</Button><Button type="submit" variant="primary" size="sm" disabled={addEvent.isPending}>{addEvent.isPending ? <Loader2 className="mr-xs h-4 w-4 animate-spin" /> : <Zap className="mr-xs h-4 w-4" />}Guardar evento</Button></div></form></Card>
}
