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
        onError: () => {
          alert('Ocorreu um erro ao tentar adicionar o evento. Tente novamente.')
        }
      }
    )
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-xl">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="border-t border-outline-variant/20 bg-surface-container-low p-md">
      <div className="mb-md flex items-center justify-between">
        <h4 className="text-sm font-semibold text-on-surface">Súmula de Jogo</h4>
        {isAdmin && !isAdding && (
          <button 
            className="flex items-center gap-xs rounded-lg border border-outline-variant px-sm py-xs text-xs font-medium text-on-surface transition-colors hover:bg-surface-container-high"
            onClick={() => setIsAdding(true)}
          >
            <Plus size={12} /> Adicionar
          </button>
        )}
      </div>

      {isAdding && isAdmin && (
        <form onSubmit={handleAdd} className="mb-md flex flex-wrap items-center gap-sm">
          <select 
            className="rounded-lg border border-outline-variant bg-surface px-sm py-xs text-sm text-on-surface focus:border-primary focus:outline-none" 
            value={eventType} 
            onChange={e => setEventType(e.target.value as EventType)} 
            required
          >
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
            className="w-20 rounded-lg border border-outline-variant bg-surface px-sm py-xs text-sm text-on-surface focus:border-primary focus:outline-none"
            value={minute}
            onChange={e => setMinute(e.target.value)}
            placeholder="Minuto"
            min="0"
            max="120"
            required
          />
          
          <select 
            className="rounded-lg border border-outline-variant bg-surface px-sm py-xs text-sm text-on-surface focus:border-primary focus:outline-none" 
            value={clubId} 
            onChange={e => setClubId(e.target.value)} 
            required
          >
            <option value={match.home_club}>{match.home_club_name}</option>
            <option value={match.away_club}>{match.away_club_name}</option>
          </select>
          
          <button 
            type="submit" 
            className="flex min-w-[70px] items-center justify-center rounded-lg bg-primary px-sm py-xs text-xs font-medium text-on-primary transition-colors hover:bg-primary/90 disabled:opacity-50" 
            disabled={addEvent.isPending}
          >
            {addEvent.isPending ? <Loader2 size={12} className="animate-spin" /> : 'Guardar'}
          </button>
          
          <button 
            type="button" 
            className="rounded-lg px-sm py-xs text-xs font-medium text-on-surface-variant transition-colors hover:bg-surface-container-high" 
            onClick={() => setIsAdding(false)}
          >
            Cancelar
          </button>
        </form>
      )}

      {events.length === 0 ? (
        <p className="py-xl text-center text-sm text-on-surface-variant">
          Nenhum evento registado nesta partida.
        </p>
      ) : (
        <div className="flex flex-col gap-sm">
          {(events as MatchEvent[]).map(ev => {
            const isHome = ev.club === match.home_club
            const Icon = EVENT_ICONS[ev.event_type]?.icon || ShieldAlert
            const iconColor = EVENT_ICONS[ev.event_type]?.color || '#64748b'
            
            return (
              <div 
                key={ev.id} 
                className={`flex items-center gap-md rounded-lg border border-outline-variant/20 bg-surface p-sm ${isHome ? 'flex-row' : 'flex-row-reverse'}`}
              >
                <div className="flex items-center gap-xs text-sm font-semibold text-on-surface">
                  {ev.extra_time ? `${ev.minute}+'` : `${ev.minute}'`} 
                  <Clock size={12} className="text-on-surface-variant" />
                </div>
                
                <div className={`flex flex-1 items-center gap-sm ${isHome ? 'justify-start' : 'justify-end'}`}>
                  <Icon size={14} style={{ color: iconColor }} />
                  <span className="text-sm text-on-surface">
                    {ev.player_name || ev.event_type_label}
                  </span>
                  <span className="text-xs text-on-surface-variant">
                    ({ev.club_name})
                  </span>
                </div>
                
                {isAdmin && (
                  <button
                    onClick={() => {
                      if (window.confirm('Tem a certeza que deseja apagar este evento?')) {
                        deleteEvent.mutate(ev.id)
                      }
                    }}
                    disabled={deleteEvent.isPending}
                    className="flex h-6 w-6 items-center justify-center rounded-md transition-colors hover:bg-red-50 disabled:opacity-50"
                    aria-label="Apagar evento"
                  >
                    {deleteEvent.isPending ? (
                      <Loader2 size={14} className="animate-spin text-red-500" />
                    ) : (
                      <Trash2 size={14} className="text-red-500" />
                    )}
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