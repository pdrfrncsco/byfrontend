import { BarChart3 } from 'lucide-react'
import { Card } from '@/components/ui'
import type { MatchStats, TeamMatchStats } from '../types'

export interface MatchStatsPanelProps {
  stats: MatchStats | null
  homeName: string
  awayName: string
  isLoading?: boolean
}

const METRICS: Array<{ label: string; key: keyof TeamMatchStats; suffix?: string }> = [
  { label: 'Posse', key: 'possession', suffix: '%' },
  { label: 'Remates', key: 'shots' },
  { label: 'Remates à baliza', key: 'shotsOnTarget' },
  { label: 'Cantos', key: 'corners' },
  { label: 'Faltas', key: 'fouls' },
  { label: 'Cartões amarelos', key: 'yellowCards' },
]

export function MatchStatsPanel({ stats, homeName, awayName, isLoading = false }: MatchStatsPanelProps) {
  if (isLoading) {
    return <Card variant="flat" padding="lg"><div className="h-48 animate-pulse rounded-lg bg-surface-container-high" /></Card>
  }

  if (!stats) {
    return <Card variant="flat" padding="lg"><div className="flex flex-col items-center gap-sm py-xl text-center"><BarChart3 className="h-10 w-10 text-on-surface-variant/30" /><p className="font-medium text-on-surface-variant">Estatísticas ainda não disponíveis</p><p className="text-sm text-on-surface-variant/70">Os dados serão apresentados quando o relatório for actualizado.</p></div></Card>
  }

  return (
    <Card variant="flat" padding="lg">
      <div className="space-y-lg">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-sm text-lg font-semibold text-on-surface"><BarChart3 className="h-5 w-5" />Estatísticas da partida</h2><span className="text-xs text-on-surface-variant">Casa · Fora</span></div>
        <div className="grid grid-cols-2 gap-md text-sm font-semibold text-on-surface"><span>{homeName}</span><span className="text-right">{awayName}</span></div>
        <div className="space-y-md">
          {METRICS.map(metric => {
            const homeValue = Number(stats.home[metric.key] ?? 0)
            const awayValue = Number(stats.away[metric.key] ?? 0)
            const total = homeValue + awayValue || 1
            return <div key={metric.key} className="space-y-xs"><div className="flex justify-between text-sm"><span className="font-mono tabular-nums text-on-surface">{homeValue}{metric.suffix}</span><span className="text-on-surface-variant">{metric.label}</span><span className="font-mono tabular-nums text-on-surface">{awayValue}{metric.suffix}</span></div><div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-surface-container-high"><span className="bg-primary" style={{ width: `${homeValue / total * 100}%` }} /><span className="bg-red-500" style={{ width: `${awayValue / total * 100}%` }} /></div></div>
          })}
        </div>
      </div>
    </Card>
  )
}
