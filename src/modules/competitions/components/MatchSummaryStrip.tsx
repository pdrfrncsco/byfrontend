import { WifiOff, RefreshCw, Radio } from 'lucide-react'
import { Button } from '@/components/ui'
import type { Match } from '../types'

interface MatchSummaryStripProps {
  match: Match
  isOnline: boolean
  realtimeConnected: boolean
  hasError?: boolean
  lastUpdated?: Date | null
  onRetry: () => void
}

export function MatchSummaryStrip({ match, isOnline, realtimeConnected, hasError = false, lastUpdated, onRetry }: MatchSummaryStripProps) {
  const active = match.status === 'live' || match.status === 'halftime'
  const degraded = !isOnline || hasError

  return (
    <div className={`mb-lg flex flex-wrap items-center justify-between gap-sm rounded-xl border px-md py-sm text-xs ${degraded ? 'border-warning/30 bg-warning/5' : 'border-outline-variant/20 bg-surface-container-low'}`}>
      <div className="flex min-w-0 flex-wrap items-center gap-x-md gap-y-xs text-on-surface-variant">
        <span className="font-semibold text-on-surface">Estado da partida</span>
        {active && (
          <span className="inline-flex items-center gap-xs">
            <Radio className={`h-3.5 w-3.5 ${realtimeConnected ? 'text-emerald-600' : 'text-warning'}`} />
            <span className={realtimeConnected ? 'text-emerald-700' : 'text-warning'}>
              {realtimeConnected ? 'Tempo real ligado' : 'Activo'}
            </span>
          </span>
        )}
        {lastUpdated && <span className="whitespace-nowrap">Actualizado às {lastUpdated.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>}
        {degraded && <span className="inline-flex items-center gap-xs text-warning"><WifiOff className="h-3.5 w-3.5" /> Dados podem estar desactualizados</span>}
      </div>
      {degraded && (
        <Button variant="secondary" size="sm" className="shrink-0" onClick={onRetry}>
          <RefreshCw className="mr-xs h-3.5 w-3.5" /> Tentar novamente
        </Button>
      )}
    </div>
  )
}
