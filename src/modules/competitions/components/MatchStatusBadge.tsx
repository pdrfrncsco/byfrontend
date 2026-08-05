import { Activity, CheckCircle2, Clock, Pause, XCircle } from 'lucide-react'
import type { MatchStatus } from '../types'

const STATUS_CONFIG: Record<MatchStatus, { label: string; className: string; icon: typeof Clock }> = {
  scheduled: { label: 'Agendado', className: 'border-outline-variant/40 bg-surface-container-high text-on-surface-variant', icon: Clock },
  pre_match: { label: 'Pré-jogo', className: 'border-blue-500/30 bg-blue-500/10 text-blue-700', icon: Clock },
  live: { label: 'AO VIVO', className: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-700', icon: Activity },
  halftime: { label: 'Intervalo', className: 'border-amber-500/30 bg-amber-500/10 text-amber-700', icon: Pause },
  finished: { label: 'Terminado', className: 'border-outline-variant/40 bg-surface-container-high text-on-surface-variant', icon: CheckCircle2 },
  postponed: { label: 'Adiado', className: 'border-red-500/30 bg-red-500/10 text-red-700', icon: XCircle },
  cancelled: { label: 'Cancelado', className: 'border-red-500/30 bg-red-500/10 text-red-700', icon: XCircle },
  walkover: { label: 'Walkover', className: 'border-red-500/30 bg-red-500/10 text-red-700', icon: XCircle },
}

export interface MatchStatusBadgeProps {
  status: MatchStatus
  currentMinute?: number | null
  className?: string
}

export function MatchStatusBadge({ status, currentMinute, className = '' }: MatchStatusBadgeProps) {
  const config = STATUS_CONFIG[status]
  const Icon = config.icon
  const isLive = status === 'live' || status === 'halftime'

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${config.className} ${className}`}>
      {status === 'live' && <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />}
      {status !== 'live' && <Icon className="h-3.5 w-3.5" aria-hidden="true" />}
      <span>{config.label}</span>
      {isLive && currentMinute !== null && currentMinute !== undefined && (
        <span className="font-mono tabular-nums">{currentMinute}&apos;</span>
      )}
    </span>
  )
}
