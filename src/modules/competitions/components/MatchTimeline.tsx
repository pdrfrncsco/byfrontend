import { Activity, AlertCircle, ArrowRightLeft, Goal, Loader2, ShieldAlert } from 'lucide-react'
import { Card } from '@/components/ui'
import type { Match, MatchEvent } from '../types'

export interface MatchTimelineProps { events: MatchEvent[]; match: Match; isLoading?: boolean }

const EVENT_META: Record<string, { label: string; icon: typeof Goal; color: string }> = {
  goal: { label: 'Golo', icon: Goal, color: '#16a34a' },
  own_goal: { label: 'Auto-golo', icon: Goal, color: '#dc2626' },
  penalty_scored: { label: 'Penálti marcado', icon: Goal, color: '#2563eb' },
  yellow_card: { label: 'Cartão amarelo', icon: ShieldAlert, color: '#d97706' },
  red_card: { label: 'Cartão vermelho', icon: ShieldAlert, color: '#dc2626' },
  substitution_in: { label: 'Substituição', icon: ArrowRightLeft, color: '#4f46e5' },
  substitution_out: { label: 'Substituição', icon: ArrowRightLeft, color: '#4f46e5' },
  injury: { label: 'Lesão', icon: AlertCircle, color: '#ea580c' },
}

export function MatchTimeline({ events, match, isLoading = false }: MatchTimelineProps) {
  if (isLoading) return <div className="flex justify-center py-xl"><Loader2 className="h-6 w-6 animate-spin text-primary" /></div>
  if (events.length === 0) return <Card variant="flat" padding="lg"><div className="flex flex-col items-center gap-sm py-xl text-center"><Activity className="h-10 w-10 text-on-surface-variant/30" /><p className="font-medium text-on-surface-variant">Sem eventos registados</p><p className="text-sm text-on-surface-variant/70">Os eventos aparecem aqui quando forem registados.</p></div></Card>

  return <div className="relative space-y-sm before:absolute before:bottom-2 before:left-[3.25rem] before:top-2 before:w-0.5 before:bg-primary/20">{[...events].sort((a, b) => a.minute - b.minute).map(event => { const meta = EVENT_META[event.event_type] ?? EVENT_META[event.type] ?? { label: event.event_type_label || 'Evento', icon: Activity, color: '#64748b' }; const Icon = meta.icon; const isHome = event.club === match.home_club || event.teamId === match.homeTeamId; return <div key={event.id} className="group relative grid grid-cols-[3rem_1fr] gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-md transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:bg-surface-container-low hover:shadow-[0_10px_22px_-18px_rgba(15,17,23,0.5)]"><div className="z-10 flex h-8 w-8 items-center justify-center rounded-full border-2 border-surface-container bg-surface-container-high text-xs font-bold text-on-surface transition-colors group-hover:bg-primary group-hover:text-on-primary">{event.minute}{event.extra_time ? '+' : ''}&apos;</div><div className={`flex items-center gap-sm ${isHome ? '' : 'flex-row-reverse text-right'}`}><span className="flex h-8 w-8 items-center justify-center rounded-full" style={{ backgroundColor: `${meta.color}20` }}><Icon className="h-4 w-4" style={{ color: meta.color }} /></span><div><p className="text-sm font-semibold text-on-surface">{event.player_name || event.playerId || meta.label}</p><p className="text-xs text-on-surface-variant">{meta.label}{event.notes ? ` · ${event.notes}` : ''}</p></div></div></div> })}</div>
}
