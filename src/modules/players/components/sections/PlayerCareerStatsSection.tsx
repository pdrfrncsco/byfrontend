import { useMemo } from 'react'
import { LineChart as LineChartIcon, BarChart as BarChartIcon, Activity, Target, Users } from 'lucide-react'
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import type { PlayerCareerEntry } from '../../types'

interface PlayerCareerStatsSectionProps {
  career: PlayerCareerEntry[]
  isLoading?: boolean
}

export function PlayerCareerStatsSection({ career = [], isLoading = false }: PlayerCareerStatsSectionProps) {
  // Calculate statistics
  const stats = useMemo(() => {
    if (!career || career.length === 0) {
      return {
        totalMatches: 0,
        totalGoals: 0,
        totalAssists: 0,
        averageGoalsPerMatch: 0,
        averageAssistsPerMatch: 0,
        clubs: [],
        byClub: {},
      }
    }

    const totalMatches = career.reduce((sum, c) => sum + (c.matches || 0), 0)
    const totalGoals = career.reduce((sum, c) => sum + (c.goals || 0), 0)
    const totalAssists = career.reduce((sum, c) => sum + (c.assists || 0), 0)

    return {
      totalMatches,
      totalGoals,
      totalAssists,
      averageGoalsPerMatch: totalMatches > 0 ? (totalGoals / totalMatches).toFixed(2) : 0,
      averageAssistsPerMatch: totalMatches > 0 ? (totalAssists / totalMatches).toFixed(2) : 0,
      clubs: career.map((c) => c.club),
      byClub: career.reduce(
        (acc, c) => {
          acc[c.club] = { matches: c.matches, goals: c.goals, assists: c.assists }
          return acc
        },
        {} as Record<string, { matches: number; goals: number; assists: number }>
      ),
    }
  }, [career])

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-lg">
          <div className="text-sm text-on-surface-variant">A carregar estatísticas...</div>
        </CardContent>
      </Card>
    )
  }

  if (!career || career.length === 0) {
    return (
      <Card>
        <CardContent className="p-lg text-center">
          <Activity className="mx-auto h-8 w-8 text-on-surface-variant/50" />
          <p className="mt-md text-sm text-on-surface-variant">
            Nenhuma carreira registada. As estatísticas aparecerão aqui.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Summary Stats */}
      <div className="grid gap-md sm:grid-cols-2 xl:grid-cols-5">
        <Card variant="flat" padding="none">
          <CardContent className="space-y-xs p-lg">
            <Activity className="h-5 w-5 text-primary" />
            <p className="text-xs uppercase tracking-wide text-on-surface-variant">Total de Partidas</p>
            <p className="text-3xl font-bold text-on-surface">{stats.totalMatches}</p>
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardContent className="space-y-xs p-lg">
            <Target className="h-5 w-5 text-amber-400" />
            <p className="text-xs uppercase tracking-wide text-on-surface-variant">Total de Golos</p>
            <p className="text-3xl font-bold text-on-surface">{stats.totalGoals}</p>
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardContent className="space-y-xs p-lg">
            <Users className="h-5 w-5 text-emerald-400" />
            <p className="text-xs uppercase tracking-wide text-on-surface-variant">Total de Assist.</p>
            <p className="text-3xl font-bold text-on-surface">{stats.totalAssists}</p>
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardContent className="space-y-xs p-lg">
            <BarChartIcon className="h-5 w-5 text-blue-400" />
            <p className="text-xs uppercase tracking-wide text-on-surface-variant">Média Golos/Jogo</p>
            <p className="text-3xl font-bold text-on-surface">{stats.averageGoalsPerMatch}</p>
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardContent className="space-y-xs p-lg">
            <LineChartIcon className="h-5 w-5 text-pink-400" />
            <p className="text-xs uppercase tracking-wide text-on-surface-variant">Média Assist./Jogo</p>
            <p className="text-3xl font-bold text-on-surface">{stats.averageAssistsPerMatch}</p>
          </CardContent>
        </Card>
      </div>

      {/* Clubs List */}
      <Card>
        <CardHeader>
          <CardTitle>Clubes na Carreira</CardTitle>
          <CardDescription>Histórico de clubes registados</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-md">
            {career.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between rounded-lg border border-outline p-md">
                <div className="flex-1">
                  <p className="font-semibold text-on-surface">{entry.club}</p>
                  <p className="text-xs text-on-surface-variant">
                    {new Date(entry.joined).toLocaleDateString('pt-AO')}
                    {entry.left ? ` - ${new Date(entry.left).toLocaleDateString('pt-AO')}` : ' - Atual'}
                  </p>
                </div>
                <div className="flex gap-md">
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-on-surface-variant">Partidas</p>
                    <p className="text-lg font-bold text-on-surface">{entry.matches}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-on-surface-variant">Golos</p>
                    <p className="text-lg font-bold text-amber-400">{entry.goals}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs uppercase tracking-wide text-on-surface-variant">Assist.</p>
                    <p className="text-lg font-bold text-emerald-400">{entry.assists}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Charts */}
      <div className="grid gap-lg lg:grid-cols-2">
        {/* Goals by Club */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-md">
              <Target className="h-5 w-5" />
              Golos por Clube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={career} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 54, 74, 0.3)" vertical={false} />
                  <XAxis dataKey="club" stroke="#bfc9c4" fontSize={11} tickLine={false} />
                  <YAxis stroke="#bfc9c4" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#102034',
                      borderColor: '#26364a',
                      borderRadius: '0.5rem',
                      color: '#bfc9c4',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#bfc9c4' }} />
                  <Bar dataKey="goals" name="Golos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Assists by Club */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-md">
              <Users className="h-5 w-5" />
              Assistências por Clube
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={career} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 54, 74, 0.3)" vertical={false} />
                  <XAxis dataKey="club" stroke="#bfc9c4" fontSize={11} tickLine={false} />
                  <YAxis stroke="#bfc9c4" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#102034',
                      borderColor: '#26364a',
                      borderRadius: '0.5rem',
                      color: '#bfc9c4',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#bfc9c4' }} />
                  <Bar dataKey="assists" name="Assistências" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Combined Statistics */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-md">
              <LineChartIcon className="h-5 w-5" />
              Estatísticas Combinadas por Clube
            </CardTitle>
            <CardDescription>
              Comparação de partidas, golos e assistências por clube
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-96">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={career} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 54, 74, 0.3)" vertical={false} />
                  <XAxis dataKey="club" stroke="#bfc9c4" fontSize={11} tickLine={false} />
                  <YAxis stroke="#bfc9c4" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#102034',
                      borderColor: '#26364a',
                      borderRadius: '0.5rem',
                      color: '#bfc9c4',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#bfc9c4' }} />
                  <Bar dataKey="matches" name="Partidas" fill="#a855f7" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="goals" name="Golos" fill="#22c55e" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="assists" name="Assistências" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Matches by Club */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-md">
              <Activity className="h-5 w-5" />
              Partidas por Clube
            </CardTitle>
            <CardDescription>
              Total de partidas disputadas em cada clube
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={career} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(38, 54, 74, 0.3)" vertical={false} />
                  <XAxis dataKey="club" stroke="#bfc9c4" fontSize={11} tickLine={false} />
                  <YAxis stroke="#bfc9c4" fontSize={11} tickLine={false} allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#102034',
                      borderColor: '#26364a',
                      borderRadius: '0.5rem',
                      color: '#bfc9c4',
                      fontSize: '12px',
                    }}
                    cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px', color: '#bfc9c4' }} />
                  <Bar dataKey="matches" name="Partidas" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Table */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Estatístico</CardTitle>
          <CardDescription>
            Visualização detalhada das estatísticas de cada clube
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b border-outline text-on-surface-variant">
                <tr>
                  <th className="text-left py-md px-md font-semibold">Clube</th>
                  <th className="text-right py-md px-md font-semibold">Partidas</th>
                  <th className="text-right py-md px-md font-semibold">Golos</th>
                  <th className="text-right py-md px-md font-semibold">Assistências</th>
                  <th className="text-right py-md px-md font-semibold">Média de Golos</th>
                  <th className="text-right py-md px-md font-semibold">Média de Assist.</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline">
                {career.map((entry) => (
                  <tr key={entry.id} className="hover:bg-surface-container-high transition-colors">
                    <td className="py-md px-md text-on-surface font-medium">{entry.club}</td>
                    <td className="text-right py-md px-md text-on-surface">{entry.matches}</td>
                    <td className="text-right py-md px-md text-amber-400 font-semibold">{entry.goals}</td>
                    <td className="text-right py-md px-md text-emerald-400 font-semibold">{entry.assists}</td>
                    <td className="text-right py-md px-md text-on-surface-variant">
                      {entry.matches > 0 ? (entry.goals / entry.matches).toFixed(2) : '0.00'}
                    </td>
                    <td className="text-right py-md px-md text-on-surface-variant">
                      {entry.matches > 0 ? (entry.assists / entry.matches).toFixed(2) : '0.00'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
