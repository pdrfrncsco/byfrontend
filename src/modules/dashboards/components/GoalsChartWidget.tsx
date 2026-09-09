import { useMemo } from 'react'
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

interface GoalsChartWidgetProps {
  goalsEvolution: {
    tournament_name: string
    data: {
      period: string
      goals: number
    }[]
  }[]
}

const BAR_COLORS = ['#94d3c1', '#e9c349', '#38bdf8', '#a78bfa', '#f87171']

export function GoalsChartWidget({ goalsEvolution }: GoalsChartWidgetProps) {
  const { chartData, tournamentNames } = useMemo(() => {
    if (!goalsEvolution || goalsEvolution.length === 0) {
      return { chartData: [], tournamentNames: [] }
    }

    const periods = Array.from(
      new Set(goalsEvolution.flatMap(evol => evol.data.map(d => d.period)))
    )

    const data = periods.map(period => {
      const row: Record<string, string | number> = { period }
      goalsEvolution.forEach(evol => {
        const found = evol.data.find(d => d.period === period)
        row[evol.tournament_name] = found ? found.goals : 0
      })
      return row
    })

    const names = goalsEvolution.map(e => e.tournament_name)

    return { chartData: data, tournamentNames: names }
  }, [goalsEvolution])

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-xs text-on-surface-variant">
        Sem dados de golos disponíveis
      </div>
    )
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 54, 74, 0.3)" vertical={false} />
        <XAxis
          dataKey="period"
          stroke="#bfc9c4"
          tick={{ fill: '#bfc9c4', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
          tickLine={false}
          axisLine={{ stroke: '#26364a' }}
        />
        <YAxis
          stroke="#bfc9c4"
          tick={{ fill: '#bfc9c4', fontSize: 10, fontFamily: 'Inter, sans-serif' }}
          tickLine={false}
          axisLine={{ stroke: '#26364a' }}
          allowDecimals={false}
        />
        <Tooltip
          contentStyle={{
            backgroundColor: '#102034',
            borderColor: '#26364a',
            borderRadius: '0.5rem',
            color: '#bfc9c4',
            fontSize: '12px',
          }}
          itemStyle={{ color: '#ffffff' }}
          cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
        />
        <Legend
          wrapperStyle={{ fontSize: '11px', color: '#bfc9c4', paddingTop: '4px' }}
        />
        {tournamentNames.map((name, idx) => (
          <Bar
            key={name}
            dataKey={name}
            fill={BAR_COLORS[idx % BAR_COLORS.length]}
            radius={[4, 4, 0, 0]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  )
}
