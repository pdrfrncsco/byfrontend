import { useState } from 'react'
import { Loader2, Plus, Trash2, Clock, ShieldAlert, Goal } from 'lucide-react'
import { useMatchEvents, useAddMatchEvent, useDeleteMatchEvent } from '../hooks'
import type { MatchEvent, EventType, Match } from '../types'

const EVENT_ICONS: Record<string, { icon: React.ComponentType<any>; color: string }> = {
  goal: { icon: Goal, color: '#10b981' },
  own_goal: { icon: Goal, color: '#ef4444' },
  penalty_scored: { icon: Goal, color: '#3b82f6' },
  penalty_missed: { icon: Goal, color: '#9ca3af' },
  yellow_card: { icon: ShieldAlert, color: '#eab308' },
  red_card: { icon: ShieldAlert, color: '#ef4444' },
  yellow_red: { icon: ShieldAlert, color: '#f97316' },
  substitution_in: { icon: ShieldAlert, color: '#10b981' },
  substitution_out: { icon: ShieldAlert, color: '#ef4444' },
}

export function MatchEventsPanel({
  competitionId,
  match,
  isAdmin,
}: {
  competitionId: string
  match: Match
  isAdmin: boolean
}) {
  const { data: events = [], isLoading } = useMatchEvents(competitionId, match.id)
  const addEvent = useAddMatchEvent(competitionId, match.id)
  const deleteEvent = useDeleteMatchEvent(competitionId, match.id)

  const [isAdding, setIsAdding] = useState(false)
  const [eventType, setEventType] = useState<EventType>('goal')
  const [minute, setMinute] = useState('')
  const [clubId, setClubId] = useState(match.home_club)

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault()
    addEvent.mutate(
      {
        event_type: eventType,
        minute: parseInt(minute, 10),
        club: clubId,
      },
      {
        onSuccess: () => {
          setIsAdding(false)
          setMinute('')
        },
      }
    )
  }

  if (isLoading) {
    return (
      <div className="comp-loading" style={{ padding: '20px' }}>
        <Loader2 size={24} className="spin" />
      </div>
    )
  }

  return (
    <div className="comp-match-events" style={{ padding: '16px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h4 style={{ margin: 0, fontSize: '14px', fontWeight: 600, color: '#1e293b' }}>Súmula de Jogo</h4>
        {isAdmin && !isAdding && (
          <button className="comp-btn comp-btn--outline" onClick={() => setIsAdding(true)} style={{ padding: '4px 8px', fontSize: '12px' }}>
            <Plus size={12} /> Adicionar
          </button>
        )}
      </div>

      {isAdding && isAdmin && (
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: '8px', marginBottom: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <select className="comp-input" value={eventType} onChange={e => setEventType(e.target.value as EventType)} required style={{ padding: '4px', fontSize: '13px' }}>
            <option value="goal">Golo</option>
            <option value="own_goal">Golo Contra</option>
            <option value="penalty_scored">Penálti Marcado</option>
            <option value="penalty_missed">Penálti Falhado</option>
            <option value="yellow_card">Cartão Amarelo</option>
            <option value="red_card">Cartão Vermelho</option>
            <option value="yellow_red">Segundo Amarelo</option>
            <option value="substitution_in">Substituição (Entra)</option>
            <option value="substitution_out">Substituição (Sai)</option>
          </select>
          <input
            type="number"
            className="comp-input"
            value={minute}
            onChange={e => setMinute(e.target.value)}
            placeholder="Minuto"
            min="0"
            max="120"
            required
            style={{ width: '70px', padding: '4px', fontSize: '13px' }}
          />
          <select className="comp-input" value={clubId} onChange={e => setClubId(e.target.value)} required style={{ padding: '4px', fontSize: '13px' }}>
            <option value={match.home_club}>{match.home_club_name}</option>
            <option value={match.away_club}>{match.away_club_name}</option>
          </select>
          <button type="submit" className="comp-btn comp-btn--primary" disabled={addEvent.isPending} style={{ padding: '4px 8px', fontSize: '12px' }}>
            {addEvent.isPending ? <Loader2 size={12} className="spin" /> : 'Guardar'}
          </button>
          <button type="button" className="comp-btn comp-btn--ghost" onClick={() => setIsAdding(false)} style={{ padding: '4px 8px', fontSize: '12px' }}>
            Cancelar
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <p style={{ fontSize: '13px', color: '#64748b', margin: 0, textAlign: 'center', padding: '20px 0' }}>Nenhum evento registado nesta partida.</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {(events as MatchEvent[]).map(ev => {
            const isHome = ev.club === match.home_club
            const Icon = EVENT_ICONS[ev.event_type]?.icon || ShieldAlert
            const iconColor = EVENT_ICONS[ev.event_type]?.color || '#64748b'
            
            return (
              <div key={ev.id} style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '8px 12px',
                background: 'white',
                borderRadius: '6px',
                border: '1px solid #e2e8f0',
                flexDirection: isHome ? 'row' : 'row-reverse'
              }}>
                <div style={{ fontWeight: 600, fontSize: '13px', color: '#334155', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  {ev.extra_time ? `${ev.minute}+'` : `${ev.minute}'`} <Clock size={12} color="#94a3b8" />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, justifyContent: isHome ? 'flex-start' : 'flex-end' }}>
                  <Icon size={14} color={iconColor} />
                  <span style={{ fontSize: '13px', color: '#1e293b' }}>
                    {ev.player_name || ev.event_type_label}
                  </span>
                  <span style={{ fontSize: '11px', color: '#94a3b8' }}>({ev.club_name})</span>
                </div>
                {isAdmin && (
                  <button
                    onClick={() => deleteEvent.mutate(ev.id)}
                    disabled={deleteEvent.isPending}
                    style={{ background: 'transparent', border: 'none', cursor: 'pointer', padding: '4px' }}
                  >
                    {deleteEvent.isPending ? <Loader2 size={14} className="spin" color="#ef4444" /> : <Trash2 size={14} color="#ef4444" />}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
