import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { ClubKpis } from '@/modules/clubs/types'

const items: Array<{ key: keyof ClubKpis; label: string; tone?: 'default' | 'primary' | 'secondary' | 'warning' | 'danger' }> = [
  { key: 'squad_size', label: 'Plantel', tone: 'primary' },
  { key: 'staff_count', label: 'Staff', tone: 'secondary' },
  { key: 'total_matches', label: 'Jogos', tone: 'default' },
  { key: 'wins', label: 'Vitórias', tone: 'primary' },
  { key: 'draws', label: 'Empates', tone: 'warning' },
  { key: 'losses', label: 'Derrotas', tone: 'danger' },
  { key: 'goals_for', label: 'Golos marcados', tone: 'primary' },
  { key: 'goals_against', label: 'Golos sofridos', tone: 'danger' },
  { key: 'clean_sheets', label: 'Clean sheets', tone: 'secondary' },
  { key: 'active_competitions', label: 'Competições ativas', tone: 'default' },
]

export function ClubKpisCard({ kpis }: { kpis: ClubKpis }) {
  return (
    <Card variant="flat" padding="none">
      <CardHeader>
        <CardTitle>KPIs do clube</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-sm sm:grid-cols-3 lg:grid-cols-5">
          {items.map((item) => (
            <div key={item.key} className="rounded-xl border border-outline-variant/20 bg-surface-container/40 p-md">
              <Badge variant={item.tone === 'danger' ? 'danger' : item.tone === 'warning' ? 'warning' : item.tone === 'secondary' ? 'secondary' : item.tone === 'primary' ? 'primary' : 'default'}>
                {item.label}
              </Badge>
              <p className="mt-sm text-2xl font-bold text-on-surface">{kpis[item.key]}</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
