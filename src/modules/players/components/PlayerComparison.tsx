import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Legend, Tooltip } from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { X, Plus } from 'lucide-react'
import {
  usePlayerComparison,
  useComparisonPlayers,
  normalizeComparisonData,
  getComparisonStats,
  comparePlayersDirectly,
  type PlayerComparisonData,
} from '../hooks/usePlayerComparison'

interface PlayerComparisonProps {
  onPlayerSelect?: (playerId: string) => void
}

const RADAR_METRICS = [
  { key: 'goals', label: 'Golos', color: '#FCD34D' },
  { key: 'assists', label: 'Assistências', color: '#10B981' },
  { key: 'passAccuracy', label: 'Precisão Passes', color: '#3B82F6' },
  { key: 'tackles', label: 'Cortes', color: '#F97316' },
  { key: 'interceptions', label: 'Interceções', color: '#8B5CF6' },
  { key: 'aerialWinPercentage', label: 'Vitórias Aéreas', color: '#EF4444' },
]

function PlayerComparisonCard({ player }: { player: PlayerComparisonData }) {
  return (
    <Card className="flex-1">
      <CardHeader>
        <CardTitle className="truncate">{player.name}</CardTitle>
        <CardDescription>{player.position} • {player.nationality}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-md">
        <div className="grid grid-cols-2 gap-md">
          {/* Age */}
          <div>
            <p className="text-xs text-on-surface-variant">Idade</p>
            <p className="text-lg font-semibold text-on-surface">{player.age}</p>
          </div>

          {/* Height */}
          <div>
            <p className="text-xs text-on-surface-variant">Altura</p>
            <p className="text-lg font-semibold text-on-surface">{player.height} cm</p>
          </div>

          {/* Weight */}
          <div>
            <p className="text-xs text-on-surface-variant">Peso</p>
            <p className="text-lg font-semibold text-on-surface">{player.weight} kg</p>
          </div>

          {/* Position */}
          <div>
            <p className="text-xs text-on-surface-variant">Posição</p>
            <p className="text-lg font-semibold text-on-surface">{player.position}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-sm border-t border-outline pt-md">
          <div className="flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">Golos</span>
            <span className="font-semibold text-amber-600">{player.goals}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">Assistências</span>
            <span className="font-semibold text-emerald-600">{player.assists}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">Partidas</span>
            <span className="font-semibold text-blue-600">{player.matches}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">Precisão Passes</span>
            <span className="font-semibold text-primary">{player.passAccuracy.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">Cortes</span>
            <span className="font-semibold text-orange-600">{player.tackles}</span>
          </div>
          <div className="flex justify-between items-center text-sm">
            <span className="text-on-surface-variant">Interceções</span>
            <span className="font-semibold text-purple-600">{player.interceptions}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

function RadarChartComparison({ players }: { players: PlayerComparisonData[] }) {
  const normalized = normalizeComparisonData(players)

  if (Object.keys(normalized).length === 0) {
    return null
  }

  const radarData = RADAR_METRICS.map((metric) => {
    const dataPoint: any = {
      metric: metric.label,
    }

    players.forEach((player, index) => {
      const values = normalized[metric.key] || []
      dataPoint[`player${index}`] = values[index] || 0
    })

    return dataPoint
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparação de Desempenho</CardTitle>
        <CardDescription>Análise normalizada de métricas principais</CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center">
        <RadarChart width={500} height={400} data={radarData}>
          <PolarGrid stroke="#e5e7eb" />
          <PolarAngleAxis dataKey="metric" tick={{ fill: '#6b7280', fontSize: 12 }} />
          <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af' }} />

          {players.map((player, index) => (
            <Radar
              key={`${player.id}-${index}`}
              name={player.name}
              dataKey={`player${index}`}
              stroke={RADAR_METRICS[index % RADAR_METRICS.length].color}
              fill={RADAR_METRICS[index % RADAR_METRICS.length].color}
              fillOpacity={0.25}
            />
          ))}

          <Tooltip
            contentStyle={{
              backgroundColor: '#fff',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
            }}
            formatter={(value: any) => value?.toFixed(1)}
          />
          <Legend />
        </RadarChart>
      </CardContent>
    </Card>
  )
}

function PlayerSelectionInput({
  onAdd,
  maxPlayers = 5,
  currentCount = 0,
}: {
  onAdd: (playerId: string) => void
  maxPlayers?: number
  currentCount?: number
}) {
  const { t } = useTranslation()
  const [input, setInput] = useState('')

  const handleAdd = () => {
    if (input.trim()) {
      onAdd(input.trim())
      setInput('')
    }
  }

  if (currentCount >= maxPlayers) {
    return null
  }

  return (
    <div className="flex gap-sm">
      <Input
        placeholder="ID ou slug do jogador"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyPress={(e) => {
          if (e.key === 'Enter') {
            handleAdd()
          }
        }}
      />
      <Button onClick={handleAdd} disabled={!input.trim()}>
        <Plus className="h-4 w-4" />
      </Button>
    </div>
  )
}

export function PlayerComparison({ onPlayerSelect }: PlayerComparisonProps) {
  const { t } = useTranslation()
  const { selectedPlayerIds, addPlayer, removePlayer, clearComparison, canAddMore } =
    usePlayerComparison()

  const { data: comparisonData, isLoading } = useComparisonPlayers(selectedPlayerIds)
  const players = comparisonData?.results || []

  const stats = useMemo(() => {
    return players.length > 0 ? getComparisonStats(players) : null
  }, [players])

  const isTwoPlayerComparison = players.length === 2

  return (
    <div className="space-y-lg">
      {/* Player Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Selecionar Jogadores</CardTitle>
          <CardDescription>
            {selectedPlayerIds.length}/5 jogadores selecionados
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-md">
          {/* Selected Players */}
          {selectedPlayerIds.length > 0 && (
            <div className="flex flex-wrap gap-sm">
              {selectedPlayerIds.map((id) => (
                <div
                  key={id}
                  className="inline-flex items-center gap-sm rounded-full bg-primary-container px-md py-sm text-sm"
                >
                  <span>{id}</span>
                  <button
                    onClick={() => removePlayer(id)}
                    className="hover:text-primary transition-colors"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add Player */}
          {canAddMore && <PlayerSelectionInput onAdd={addPlayer} currentCount={selectedPlayerIds.length} />}

          {/* Actions */}
          {selectedPlayerIds.length > 0 && (
            <div className="flex gap-sm">
              {players.length > 1 && (
                <Button variant="outline" onClick={clearComparison}>
                  Limpar Comparação
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Loading State */}
      {isLoading && (
        <div className="rounded-lg bg-surface-container p-lg text-center">
          <p className="text-on-surface-variant">Carregando dados...</p>
        </div>
      )}

      {/* Player Cards */}
      {players.length > 0 && !isLoading && (
        <div className="flex flex-col gap-lg md:flex-row md:gap-md">
          {players.map((player) => (
            <PlayerComparisonCard key={player.id} player={player} />
          ))}
        </div>
      )}

      {/* Radar Chart */}
      {players.length > 1 && !isLoading && <RadarChartComparison players={players} />}

      {/* Detailed Comparison (Two Players) */}
      {isTwoPlayerComparison && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Comparação Detalhada</CardTitle>
            <CardDescription>Diferenças entre jogadores</CardDescription>
          </CardHeader>
          <CardContent>
            {(() => {
              const comparison = comparePlayersDirectly(players[0], players[1])
              const metrics = [
                { key: 'age', label: 'Idade' },
                { key: 'height', label: 'Altura (cm)' },
                { key: 'weight', label: 'Peso (kg)' },
                { key: 'goals', label: 'Golos' },
                { key: 'assists', label: 'Assistências' },
                { key: 'matches', label: 'Partidas' },
                { key: 'passAccuracy', label: 'Precisão Passes (%)' },
                { key: 'tackles', label: 'Cortes' },
                { key: 'interceptions', label: 'Interceções' },
              ]

              return (
                <div className="space-y-md">
                  {metrics.map((metric) => {
                    const data = (comparison as any)[metric.key]
                    const isDifference = data.difference !== 0
                    const isPositive = data.difference > 0

                    return (
                      <div key={metric.key} className="flex items-center justify-between border-b border-outline pb-md">
                        <span className="text-sm font-medium text-on-surface">{metric.label}</span>
                        <div className="flex items-center gap-lg">
                          <div className="text-right">
                            <p className="text-xs text-on-surface-variant">
                              {players[0].name}
                            </p>
                            <p className="font-semibold text-on-surface">{data.player1}</p>
                          </div>
                          <div
                            className={`w-12 text-center font-bold text-sm ${
                              isPositive ? 'text-emerald-600' : isDifference ? 'text-red-600' : 'text-gray-500'
                            }`}
                          >
                            {isPositive && '+'}
                            {data.difference.toFixed(1)}
                          </div>
                          <div className="text-left">
                            <p className="text-xs text-on-surface-variant">
                              {players[1].name}
                            </p>
                            <p className="font-semibold text-on-surface">{data.player2}</p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
            })()}
          </CardContent>
        </Card>
      )}

      {/* Statistics Summary */}
      {stats && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle>Estatísticas Agregadas</CardTitle>
            <CardDescription>Médias dos {players.length} jogadores selecionados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-md sm:grid-cols-3 md:grid-cols-4">
              <div>
                <p className="text-xs text-on-surface-variant">Idade Média</p>
                <p className="text-lg font-semibold text-on-surface">{stats.averageAge}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Altura Média</p>
                <p className="text-lg font-semibold text-on-surface">{stats.averageHeight} cm</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Peso Médio</p>
                <p className="text-lg font-semibold text-on-surface">{stats.averageWeight} kg</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Total Golos</p>
                <p className="text-lg font-semibold text-amber-600">{stats.totalGoals}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Total Assistências</p>
                <p className="text-lg font-semibold text-emerald-600">{stats.totalAssists}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Total Partidas</p>
                <p className="text-lg font-semibold text-blue-600">{stats.totalMatches}</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Precisão Passes</p>
                <p className="text-lg font-semibold text-primary">{stats.averagePassAccuracy}%</p>
              </div>
              <div>
                <p className="text-xs text-on-surface-variant">Cortes Médios</p>
                <p className="text-lg font-semibold text-orange-600">{stats.averageTackles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {selectedPlayerIds.length === 0 && (
        <Card>
          <CardContent className="py-lg text-center">
            <p className="text-on-surface-variant">
              Selecione jogadores para começar a comparação
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
