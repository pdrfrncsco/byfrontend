import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Legend,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/empty-state'
import {
  Check,
  Plus,
  Search,
  Scale,
  Sparkles,
  Users,
  X,
} from 'lucide-react'
import { resolveMediaUrl } from '@/lib/media'
import { usePlayers } from '../hooks/usePlayerQueries'
import {
  usePlayerComparison,
  useComparisonPlayers,
  normalizeComparisonData,
  getComparisonStats,
  comparePlayersDirectly,
  type PlayerComparisonData,
} from '../hooks/usePlayerComparison'
import type { Player, PlayerPosition } from '../types'

interface PlayerComparisonProps {
  onPlayerSelect?: (playerId: string) => void
}

const RADAR_METRICS = [
  { key: 'goals', label: 'Golos', color: '#F59E0B' },
  { key: 'assists', label: 'Assistências', color: '#10B981' },
  { key: 'passAccuracy', label: 'Precisão Passes', color: '#3B82F6' },
  { key: 'tackles', label: 'Cortes', color: '#F97316' },
  { key: 'interceptions', label: 'Interceções', color: '#8B5CF6' },
  { key: 'aerialWinPercentage', label: 'Vitórias Aéreas', color: '#EF4444' },
]

const POSITION_FILTERS = [
  { label: 'Todos', value: '' },
  { label: 'Guarda-Redes', value: 'gk' },
  { label: 'Defesas', value: 'df' },
  { label: 'Médios', value: 'mf' },
  { label: 'Avançados', value: 'fw' },
]

function PlayerComparisonCard({ player }: { player: PlayerComparisonData }) {
  const avatar = resolveMediaUrl(player.avatarUrl)
  const initials = player.name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0])
    .join('')
    .toUpperCase() || '?'

  return (
    <Card className="flex-1 min-w-[260px] border border-outline-variant/30 bg-surface">
      <CardHeader className="pb-sm">
        <div className="flex items-center gap-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center overflow-hidden rounded-full bg-primary/20 text-base font-bold text-primary">
            {avatar ? (
              <img src={avatar} alt={player.name} className="h-full w-full object-cover" />
            ) : (
              initials
            )}
          </div>
          <div className="min-w-0 flex-1">
            <CardTitle className="truncate text-base font-bold">{player.name}</CardTitle>
            <CardDescription className="truncate text-xs">
              {player.position} {player.club ? `• ${player.club}` : ''}
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-md text-sm">
        <div className="grid grid-cols-2 gap-sm rounded-xl bg-surface-container/50 p-sm text-xs">
          <div>
            <p className="text-on-surface-variant">Idade</p>
            <p className="text-sm font-semibold text-on-surface">{player.age > 0 ? `${player.age} anos` : '—'}</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Nacionalidade</p>
            <p className="text-sm font-semibold text-on-surface">{player.nationality || '—'}</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Altura</p>
            <p className="text-sm font-semibold text-on-surface">{player.height > 0 ? `${player.height} cm` : '—'}</p>
          </div>
          <div>
            <p className="text-on-surface-variant">Peso</p>
            <p className="text-sm font-semibold text-on-surface">{player.weight > 0 ? `${player.weight} kg` : '—'}</p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="space-y-xs border-t border-outline-variant/20 pt-sm">
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-on-surface-variant">Partidas Disputadas</span>
            <span className="font-semibold text-on-surface">{player.matches}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-on-surface-variant">Minutos Jogados</span>
            <span className="font-semibold text-on-surface">{player.minutesPlayed}'</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-on-surface-variant">Golos</span>
            <span className="font-bold text-amber-500">{player.goals}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-on-surface-variant">Assistências</span>
            <span className="font-bold text-emerald-500">{player.assists}</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-on-surface-variant">Precisão de Passes</span>
            <span className="font-semibold text-primary">{player.passAccuracy.toFixed(0)}%</span>
          </div>
          <div className="flex justify-between items-center py-1">
            <span className="text-xs text-on-surface-variant">Cortes / Desarmes</span>
            <span className="font-semibold text-orange-500">{player.tackles}</span>
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

    players.forEach((_, index) => {
      const values = normalized[metric.key] || []
      dataPoint[`player${index}`] = values[index] || 0
    })

    return dataPoint
  })

  return (
    <Card className="border border-outline-variant/30">
      <CardHeader>
        <CardTitle className="text-lg">Polígono de Rendimento (Radar Chart)</CardTitle>
        <CardDescription>
          Métricas normalizadas (0 a 100) para visualização multidimensional dos atletas selecionados
        </CardDescription>
      </CardHeader>
      <CardContent className="flex justify-center p-sm sm:p-md">
        <div className="h-[360px] w-full max-w-2xl">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="#e5e7eb" strokeOpacity={0.3} />
              <PolarAngleAxis dataKey="metric" tick={{ fill: 'currentColor', fontSize: 11 }} />
              <PolarRadiusAxis angle={90} domain={[0, 100]} tick={{ fill: '#9ca3af', fontSize: 10 }} />

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
                  backgroundColor: '#1f2937',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontSize: '12px',
                }}
                formatter={(value: any) => [`${Number(value).toFixed(1)} pts`, 'Pontuação']}
              />
              <Legend wrapperStyle={{ paddingTop: '10px' }} />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}

export function PlayerComparison({ onPlayerSelect }: PlayerComparisonProps) {
  const { t } = useTranslation()
  const [searchTerm, setSearchTerm] = useState('')
  const [positionFilter, setPositionFilter] = useState('')

  const { selectedPlayerIds, addPlayer, removePlayer, clearComparison, canAddMore } =
    usePlayerComparison()

  // Query catalog players
  const { data: playersListResponse, isLoading: isCatalogLoading } = usePlayers({
    search: searchTerm || undefined,
    position: (positionFilter || undefined) as PlayerPosition | undefined,
    page_size: 18,
  })

  const catalogPlayers: Player[] = useMemo(() => {
    if (!playersListResponse) return []
    return (playersListResponse as any).results ?? (Array.isArray(playersListResponse) ? playersListResponse : [])
  }, [playersListResponse])

  // Fetch full details of selected players
  const { data: comparisonData, isLoading: isComparisonLoading } = useComparisonPlayers(selectedPlayerIds)
  const comparedPlayers = comparisonData?.results || []

  const stats = useMemo(() => {
    return comparedPlayers.length > 0 ? getComparisonStats(comparedPlayers) : null
  }, [comparedPlayers])

  const isTwoPlayerComparison = comparedPlayers.length === 2

  return (
    <div className="space-y-xl">
      {/* ─── Selected Players Dock ─────────────────────────────────── */}
      <Card className="border border-outline-variant/30 bg-surface shadow-sm">
        <CardHeader className="pb-sm">
          <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <CardTitle className="flex items-center gap-sm text-lg">
                <Users className="h-5 w-5 text-primary" />
                Jogadores em Comparação
              </CardTitle>
              <CardDescription>
                {selectedPlayerIds.length}/5 atletas selecionados. Adicione jogadores a partir do catálogo abaixo.
              </CardDescription>
            </div>
            {selectedPlayerIds.length > 0 && (
              <Button variant="ghost" size="sm" onClick={clearComparison} className="text-error hover:bg-error/10">
                Limpar Comparação
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {selectedPlayerIds.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-outline-variant/40 py-lg text-center">
              <Scale className="h-8 w-8 text-on-surface-variant/50" />
              <p className="mt-2 text-sm font-medium text-on-surface">Nenhum jogador selecionado ainda</p>
              <p className="text-xs text-on-surface-variant">
                Selecione pelo menos 2 atletas no catálogo abaixo para gerar a análise comparativa.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-center gap-sm">
              {comparedPlayers.map((player) => {
                const avatar = resolveMediaUrl(player.avatarUrl)
                const initials = player.name
                  .split(' ')
                  .slice(0, 2)
                  .map((n) => n[0])
                  .join('')
                  .toUpperCase() || '?'

                return (
                  <div
                    key={player.slug}
                    className="inline-flex items-center gap-sm rounded-full border border-primary/20 bg-primary/10 py-1 pl-1 pr-3 shadow-xs"
                  >
                    <div className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-primary text-xs font-bold text-on-primary">
                      {avatar ? (
                        <img src={avatar} alt={player.name} className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <span className="text-xs font-semibold text-on-surface">{player.name}</span>
                    <Badge variant="outline" className="text-[10px] py-0 px-1">
                      {player.position}
                    </Badge>
                    <button
                      onClick={() => removePlayer(player.slug)}
                      className="ml-1 rounded-full p-0.5 text-on-surface-variant hover:bg-error/20 hover:text-error transition-colors"
                      title="Remover da comparação"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                )
              })}

              {/* Fallback for IDs loading */}
              {isComparisonLoading && (
                <div className="text-xs text-on-surface-variant animate-pulse">A carregar dados dos atletas...</div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ─── Comparison Results (if >= 2 players) ─────────────────── */}
      {comparedPlayers.length >= 2 && !isComparisonLoading && (
        <div className="space-y-lg">
          {/* Comparison Cards Grid */}
          <div>
            <h3 className="mb-md text-lg font-bold text-on-surface flex items-center gap-xs">
              <Sparkles className="h-5 w-5 text-amber-500" />
              Comparação Direta Lado a Lado
            </h3>
            <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {comparedPlayers.map((player) => (
                <PlayerComparisonCard key={player.id} player={player} />
              ))}
            </div>
          </div>

          {/* Radar Chart */}
          <RadarChartComparison players={comparedPlayers} />

          {/* Detailed Differences (Head-to-Head when 2 players) */}
          {isTwoPlayerComparison && (
            <Card className="border border-outline-variant/30">
              <CardHeader>
                <CardTitle className="text-lg">Duelo Direto (Head-to-Head)</CardTitle>
                <CardDescription>
                  Diferenças métricas entre {comparedPlayers[0].name} e {comparedPlayers[1].name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {(() => {
                  const comparison = comparePlayersDirectly(comparedPlayers[0], comparedPlayers[1])
                  const metrics = [
                    { key: 'age', label: 'Idade (anos)' },
                    { key: 'height', label: 'Altura (cm)' },
                    { key: 'weight', label: 'Peso (kg)' },
                    { key: 'matches', label: 'Partidas' },
                    { key: 'goals', label: 'Golos' },
                    { key: 'assists', label: 'Assistências' },
                    { key: 'passAccuracy', label: 'Precisão Passes (%)' },
                    { key: 'tackles', label: 'Cortes / Desarmes' },
                    { key: 'interceptions', label: 'Interceções' },
                  ]

                  return (
                    <div className="divide-y divide-outline-variant/20">
                      {metrics.map((metric) => {
                        const data = (comparison as any)[metric.key]
                        const isDiff = data.difference !== 0
                        const isPositive = data.difference > 0

                        return (
                          <div
                            key={metric.key}
                            className="flex items-center justify-between py-sm text-sm"
                          >
                            <span className="font-medium text-on-surface">{metric.label}</span>
                            <div className="flex items-center gap-md">
                              <div className="text-right">
                                <p className="text-xs text-on-surface-variant truncate max-w-[100px]">
                                  {comparedPlayers[0].name}
                                </p>
                                <p className="font-bold text-on-surface">{data.player1}</p>
                              </div>
                              <div
                                className={`w-14 text-center text-xs font-bold px-1.5 py-0.5 rounded-full ${
                                  isPositive
                                    ? 'bg-emerald-500/10 text-emerald-600'
                                    : isDiff
                                    ? 'bg-amber-500/10 text-amber-600'
                                    : 'bg-surface-container text-on-surface-variant'
                                }`}
                              >
                                {isPositive && '+'}
                                {data.difference.toFixed(1)}
                              </div>
                              <div className="text-left">
                                <p className="text-xs text-on-surface-variant truncate max-w-[100px]">
                                  {comparedPlayers[1].name}
                                </p>
                                <p className="font-bold text-on-surface">{data.player2}</p>
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

          {/* Aggregated Stats */}
          {stats && (
            <Card className="border border-outline-variant/30">
              <CardHeader>
                <CardTitle className="text-lg">Médias e Totais do Grupo Selecionado</CardTitle>
                <CardDescription>Valores combinados dos {comparedPlayers.length} atletas em análise</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-md sm:grid-cols-3 md:grid-cols-4">
                  <div className="rounded-xl bg-surface-container/40 p-md">
                    <p className="text-xs text-on-surface-variant">Idade Média</p>
                    <p className="text-xl font-bold text-on-surface">{stats.averageAge} anos</p>
                  </div>
                  <div className="rounded-xl bg-surface-container/40 p-md">
                    <p className="text-xs text-on-surface-variant">Altura Média</p>
                    <p className="text-xl font-bold text-on-surface">{stats.averageHeight} cm</p>
                  </div>
                  <div className="rounded-xl bg-surface-container/40 p-md">
                    <p className="text-xs text-on-surface-variant">Total de Partidas</p>
                    <p className="text-xl font-bold text-blue-500">{stats.totalMatches}</p>
                  </div>
                  <div className="rounded-xl bg-surface-container/40 p-md">
                    <p className="text-xs text-on-surface-variant">Total de Golos</p>
                    <p className="text-xl font-bold text-amber-500">{stats.totalGoals}</p>
                  </div>
                  <div className="rounded-xl bg-surface-container/40 p-md">
                    <p className="text-xs text-on-surface-variant">Total de Assistências</p>
                    <p className="text-xl font-bold text-emerald-500">{stats.totalAssists}</p>
                  </div>
                  <div className="rounded-xl bg-surface-container/40 p-md">
                    <p className="text-xs text-on-surface-variant">Precisão Média de Passes</p>
                    <p className="text-xl font-bold text-primary">{stats.averagePassAccuracy}%</p>
                  </div>
                  <div className="rounded-xl bg-surface-container/40 p-md">
                    <p className="text-xs text-on-surface-variant">Média de Cortes</p>
                    <p className="text-xl font-bold text-orange-500">{stats.averageTackles}</p>
                  </div>
                  <div className="rounded-xl bg-surface-container/40 p-md">
                    <p className="text-xs text-on-surface-variant">Média de Interceções</p>
                    <p className="text-xl font-bold text-purple-500">{stats.averageInterceptions}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* ─── Player Catalog & Selection Browser ────────────────────── */}
      <div className="space-y-md">
        <div className="flex flex-col gap-sm sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h3 className="text-lg font-bold text-on-surface">Catálogo de Jogadores</h3>
            <p className="text-sm text-on-surface-variant">
              Escolha atletas para adicionar ou remover da mesa de comparação
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
            <Input
              type="search"
              placeholder="Pesquisar atleta por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9"
            />
          </div>
        </div>

        {/* Position Filter Pills */}
        <div className="flex flex-wrap gap-xs">
          {POSITION_FILTERS.map((filter) => (
            <Button
              key={filter.value}
              variant={positionFilter === filter.value ? 'primary' : 'outline'}
              size="sm"
              className="text-xs rounded-full"
              onClick={() => setPositionFilter(filter.value)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        {/* Players Catalog Grid */}
        {isCatalogLoading ? (
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-2xl" />
            ))}
          </div>
        ) : catalogPlayers.length === 0 ? (
          <EmptyState
            icon={Users}
            title="Nenhum jogador encontrado"
            description="Tente ajustar os termos de pesquisa ou selecionar outra posição."
          />
        ) : (
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-3">
            {catalogPlayers.map((player) => {
              const isSelected = selectedPlayerIds.includes(player.slug) || selectedPlayerIds.includes(player.id)
              const avatar = resolveMediaUrl(player.avatar || player.profile_photo_url)
              const initials =
                `${player.first_name?.[0] ?? ''}${player.last_name?.[0] ?? ''}`.toUpperCase() || '?'

              return (
                <div
                  key={player.id}
                  className={`flex items-center justify-between gap-md rounded-2xl border p-md transition-all ${
                    isSelected
                      ? 'border-primary bg-primary/5 shadow-xs'
                      : 'border-outline-variant/30 bg-surface hover:border-primary/40'
                  }`}
                >
                  <div className="flex items-center gap-md min-w-0">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-surface-container text-sm font-bold text-on-surface">
                      {avatar ? (
                        <img src={avatar} alt={player.full_name} className="h-full w-full object-cover" />
                      ) : (
                        initials
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate font-semibold text-sm text-on-surface">{player.full_name}</p>
                      <div className="flex items-center gap-xs text-xs text-on-surface-variant">
                        <Badge variant="outline" className="text-[10px] py-0 px-1">
                          {player.position_label || player.primary_position}
                        </Badge>
                        {player.current_club && (
                          <span className="truncate max-w-[120px]">{player.current_club.name}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <Button
                    size="sm"
                    variant={isSelected ? 'outline' : 'primary'}
                    className={`shrink-0 gap-xs text-xs ${
                      isSelected ? 'border-primary/40 text-primary hover:bg-error/10 hover:text-error hover:border-error/40' : ''
                    }`}
                    disabled={!isSelected && !canAddMore}
                    onClick={() => {
                      if (isSelected) {
                        removePlayer(player.slug)
                        removePlayer(player.id)
                      } else {
                        addPlayer(player.slug)
                      }
                      if (onPlayerSelect) {
                        onPlayerSelect(player.id)
                      }
                    }}
                  >
                    {isSelected ? (
                      <>
                        <Check className="h-3.5 w-3.5" />
                        Selecionado
                      </>
                    ) : (
                      <>
                        <Plus className="h-3.5 w-3.5" />
                        Comparar
                      </>
                    )}
                  </Button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
