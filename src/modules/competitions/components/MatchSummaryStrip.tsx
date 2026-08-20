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
    <div className="mb-lg flex flex-wrap items-center justify-between gap-sm rounded-xl border border-outline-variant/20 bg-surface-container-low px-md py-sm text-xs">
      <div className="flex flex-wrap items-center gap-md text-on-surface-variant">
        <span className="font-medium text-on-surface">Centro da partida</span>
        {active && (
          <span className="inline-flex items-center gap-xs">
            <Radio className={`h-3.5 w-3.5 ${realtimeConnected ? 'text-emerald-600' : 'text-warning'}`} />
            {realtimeConnected ? 'Tempo real ligado' : 'Polling activo'}
          </span>
        )}
        {lastUpdated && <span>Actualizado às {lastUpdated.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}</span>}
        {degraded && <span className="inline-flex items-center gap-xs text-warning"><WifiOff className="h-3.5 w-3.5" /> Dados podem estar desactualizados</span>}
      </div>
      {degraded && (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw className="mr-xs h-3.5 w-3.5" /> Tentar novamente
        </Button>
      )}
    </div>
  )
}
