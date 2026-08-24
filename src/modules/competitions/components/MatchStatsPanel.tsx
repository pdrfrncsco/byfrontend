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

function teamAccent(teamId: string, fallback: string) {
  const hash = [...teamId].reduce((total, character) => total + character.charCodeAt(0), 0)
  const accents = ['#0f766e', '#2563eb', '#b45309', '#be123c', '#4338ca']
  return accents[hash % accents.length] ?? fallback
}

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
            const homeAccent = teamAccent(stats.home.teamId, '#0f766e')
            const awayAccent = teamAccent(stats.away.teamId, '#be123c')
            return <div key={metric.key} className="group space-y-xs rounded-lg px-xs py-1 transition-colors hover:bg-surface-container-low"><div className="flex justify-between text-sm"><span className="font-mono font-semibold tabular-nums text-on-surface">{homeValue}{metric.suffix}</span><span className="text-center text-xs text-on-surface-variant">{metric.label}</span><span className="font-mono font-semibold tabular-nums text-on-surface">{awayValue}{metric.suffix}</span></div><div className="flex h-2 gap-0.5 overflow-hidden rounded-full bg-surface-container-high"><span className="transition-[width] duration-500" style={{ width: `${homeValue / total * 100}%`, backgroundColor: homeAccent }} /><span className="transition-[width] duration-500" style={{ width: `${awayValue / total * 100}%`, backgroundColor: awayAccent }} /></div></div>
          })}
        </div>
      </div>
    </Card>
  )
}
