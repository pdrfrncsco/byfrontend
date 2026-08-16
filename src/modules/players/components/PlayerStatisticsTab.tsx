import { useMemo } from 'react'
import { Activity, Clock3, Target, Trophy } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Skeleton } from '@/components/ui/skeleton'
import { usePlayerStatistics } from '../hooks'
import type { PlayerSeasonStatistics } from '../types'

function StatItem({ label, value, icon: Icon }: { label: string; value: number; icon: typeof Activity }) {
  return (
    <div className="rounded-2xl border border-outline-variant/20 bg-surface-container p-md">
      <Icon className="mb-sm h-4 w-4 text-primary" />
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-on-surface-variant">{label}</p>
      <p className="mt-1 text-2xl font-bold text-on-surface">{value}</p>
    </div>
  )
}

function sum(statistics: PlayerSeasonStatistics[], field: keyof PlayerSeasonStatistics) {
  return statistics.reduce((total, item) => total + Number(item[field] ?? 0), 0)
}

export function PlayerStatisticsTab({ slug }: { slug: string }) {
  const { t } = useTranslation()
  const { data = [], isLoading } = usePlayerStatistics(slug)

  const totals = useMemo(() => ({
    appearances: sum(data, 'appearances'),
    minutes: sum(data, 'minutes'),
    goals: sum(data, 'goals'),
    assists: sum(data, 'assists'),
  }), [data])

  if (isLoading && data.length === 0) {
    return (
      <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <Skeleton key={index} className="h-28 rounded-2xl" />)}
      </div>
    )
  }

  if (data.length === 0) {
    return (
      <EmptyState
        icon={Activity}
        title="Sem estatísticas publicadas"
        description="As estatísticas por época serão apresentadas aqui quando estiverem disponíveis."
      />
    )
  }

  return (
    <div className="space-y-lg">
      <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-4">
        <StatItem label="Participações" value={totals.appearances} icon={Activity} />
        <StatItem label="Minutos" value={totals.minutes} icon={Clock3} />
        <StatItem label={t('players.detail.stats.goals')} value={totals.goals} icon={Trophy} />
        <StatItem label={t('players.detail.stats.assists')} value={totals.assists} icon={Target} />
      </div>

      <Card variant="flat" padding="none">
        <CardHeader><CardTitle>Desempenho por época</CardTitle></CardHeader>
        <CardContent className="space-y-sm">
          {data.map((item) => (
            <div key={item.id} className="flex flex-col gap-md rounded-2xl border border-outline-variant/20 bg-surface-container p-md md:flex-row md:items-center md:justify-between">
              <div className="space-y-xs">
                <div className="flex flex-wrap items-center gap-sm">
                  <p className="font-semibold text-on-surface">{item.season}</p>
                  {item.club_name && <Badge variant="outline">{item.club_name}</Badge>}
                  {item.competition_name && <Badge variant="secondary">{item.competition_name}</Badge>}
                </div>
                <p className="text-sm text-on-surface-variant">{item.minutes} minutos · {item.starts} titularidades</p>
              </div>
              <div className="grid grid-cols-3 gap-lg text-center text-sm">
                <div><p className="font-bold text-on-surface">{item.appearances}</p><p className="text-xs text-on-surface-variant">Jogos</p></div>
                <div><p className="font-bold text-amber-500">{item.goals}</p><p className="text-xs text-on-surface-variant">Golos</p></div>
                <div><p className="font-bold text-emerald-500">{item.assists}</p><p className="text-xs text-on-surface-variant">Assistências</p></div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}
