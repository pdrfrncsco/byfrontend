import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Globe, TrendingUp, Loader2, AlertCircle } from 'lucide-react'
import {
  usePlayerNationalTeamCallUps,
  getNationalTeamStatusInfo,
  getCategoryLabel,
  getCountryFlagEmoji,
  getCountryName,
  getCallUpStats,
  isCallUpActive,
  type NationalTeamCallUp,
} from '../../hooks/usePlayerNationalTeam'
import {
  usePlayerPerformanceSummary,
  getMetricTypeLabel,
  getMetricCategory,
  formatMetricValue,
  type PerformanceMetric,
} from '../../hooks/usePlayerPerformance'

interface PlayerNationalTeamPerformanceSectionProps {
  playerId: string
  readOnly?: boolean
}

export function PlayerNationalTeamPerformanceSection({
  playerId,
  readOnly = false,
}: PlayerNationalTeamPerformanceSectionProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('national-team')

  const {
    data: callUpsData,
    isLoading: callUpsLoading,
    error: callUpsError,
  } = usePlayerNationalTeamCallUps(playerId)

  const {
    data: performanceData,
    isLoading: performanceLoading,
    error: performanceError,
  } = usePlayerPerformanceSummary(playerId)

  const callUps = useMemo(() => (Array.isArray(callUpsData) ? callUpsData : ((callUpsData as { results?: NationalTeamCallUp[] } | undefined)?.results ?? [])) as NationalTeamCallUp[], [callUpsData])
  const activeCallUps = useMemo(() => callUps.filter(isCallUpActive), [callUps])
  const historicalCallUps = useMemo(
    () => callUps.filter((cu) => !isCallUpActive(cu)),
    [callUps]
  )

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger value="national-team" className="flex items-center gap-md">
          <Globe className="h-4 w-4" />
          Equipa Nacional
        </TabsTrigger>
        <TabsTrigger value="performance" className="flex items-center gap-md">
          <TrendingUp className="h-4 w-4" />
          Performance
        </TabsTrigger>
      </TabsList>

      {/* National Team Tab */}
      <TabsContent value="national-team" className="space-y-lg">
        {callUpsLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : callUpsError ? (
          <Card className="border-error/20">
            <CardHeader>
              <CardTitle className="text-error">Erro ao Carregar Equipa Nacional</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant">
                Não foi possível carregar os dados da equipa nacional.
              </p>
            </CardContent>
          </Card>
        ) : (
          <>
            {/* Active Call-ups */}
            {activeCallUps.length > 0 && (
              <Card className="border-l-4 border-green-400">
                <CardHeader>
                  <CardTitle>Chamadas Ativas</CardTitle>
                  <CardDescription>Jogador está convocado para a equipa nacional</CardDescription>
                </CardHeader>
                <CardContent className="space-y-md">
                  {activeCallUps.map((callUp) => (
                    <CallUpCard key={callUp.id} callUp={callUp} />
                  ))}
                </CardContent>
              </Card>
            )}

            {/* Historical Call-ups */}
            {historicalCallUps.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Convocações</CardTitle>
                  <CardDescription>
                    {historicalCallUps.length} convocação{historicalCallUps.length !== 1 ? 's' : ''} anterior{historicalCallUps.length !== 1 ? 'es' : ''}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-md">
                  {historicalCallUps.map((callUp) => (
                    <CallUpCard key={callUp.id} callUp={callUp} />
                  ))}
                </CardContent>
              </Card>
            )}

            {callUps.length === 0 && (
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-lg gap-md">
                  <Globe className="h-8 w-8 text-on-surface-variant/50" />
                  <p className="text-sm text-on-surface-variant">
                    Sem chamadas de equipa nacional registadas
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </TabsContent>

      {/* Performance Tab */}
      <TabsContent value="performance" className="space-y-lg">
        {performanceLoading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-lg">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </Card>
        ) : performanceError ? (
          <Card className="border-error/20">
            <CardHeader>
              <CardTitle className="text-error">Erro ao Carregar Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-on-surface-variant">
                Não foi possível carregar as métricas de performance.
              </p>
            </CardContent>
          </Card>
        ) : performanceData && Object.keys(performanceData).length > 0 ? (
          <div className="space-y-md">
            {renderPerformanceMetrics(performanceData)}
          </div>
        ) : (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-lg gap-md">
              <TrendingUp className="h-8 w-8 text-on-surface-variant/50" />
              <p className="text-sm text-on-surface-variant">
                Sem métricas de performance registadas
              </p>
            </CardContent>
          </Card>
        )}
      </TabsContent>
    </Tabs>
  )
}

function CallUpCard({ callUp }: { callUp: NationalTeamCallUp }) {
  const statusInfo = getNationalTeamStatusInfo(callUp.status)
  const stats = getCallUpStats(callUp)
  const isActive = isCallUpActive(callUp)

  return (
    <div
      className={`rounded-lg border p-md ${
        isActive ? 'border-green-300 bg-green-50' : 'border-outline bg-surface/50'
      }`}
    >
      <div className="space-y-md">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-md">
            <span className="text-3xl">{getCountryFlagEmoji(callUp.national_team)}</span>
            <div>
              <h3 className="font-semibold text-on-surface">
                {getCountryName(callUp.national_team)}
              </h3>
              <p className="text-xs text-on-surface-variant">
                {getCategoryLabel(callUp.category)}
              </p>
            </div>
          </div>

          <Badge
            className={`${statusInfo.bgColor} ${statusInfo.color}`}
            variant="secondary"
          >
            {statusInfo.label}
          </Badge>
        </div>

        {/* Timeline */}
        <div className="grid gap-md sm:grid-cols-2 text-sm">
          <div>
            <p className="text-xs text-on-surface-variant">Chamado</p>
            <p className="font-medium text-on-surface">
              {new Date(callUp.call_up_date).toLocaleDateString('pt-PT')}
            </p>
          </div>

          {callUp.release_date && (
            <div>
              <p className="text-xs text-on-surface-variant">Libertado</p>
              <p className="font-medium text-on-surface">
                {new Date(callUp.release_date).toLocaleDateString('pt-PT')}
              </p>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid gap-md sm:grid-cols-4 pt-md border-t border-outline">
          <div className="text-center">
            <p className="text-xs text-on-surface-variant">Jogos</p>
            <p className="text-lg font-semibold text-on-surface">{stats.totalMatches}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-on-surface-variant">Golos</p>
            <p className="text-lg font-semibold text-on-surface">{callUp.goals}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-on-surface-variant">Assistências</p>
            <p className="text-lg font-semibold text-on-surface">{callUp.assists}</p>
          </div>

          <div className="text-center">
            <p className="text-xs text-on-surface-variant">Média/Jogo</p>
            <p className="text-lg font-semibold text-on-surface">
              {stats.goalsPerMatch.toFixed(2)}
            </p>
          </div>
        </div>

        {callUp.notes && (
          <div className="p-md bg-blue-50 rounded text-xs text-blue-900">
            {callUp.notes}
          </div>
        )}
      </div>
    </div>
  )
}

function renderPerformanceMetrics(data: any) {
  const categories = Object.keys(data).filter((key) => data[key] && typeof data[key] === 'object')

  return categories.map((category) => (
    <Card key={category}>
      <CardHeader>
        <CardTitle className="text-base capitalize">
          {category.replace(/_/g, ' ')}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-md sm:grid-cols-2 md:grid-cols-3">
          {data[category].map((metric: any, index: number) => (
            <MetricCard key={index} metric={metric} />
          ))}
        </div>
      </CardContent>
    </Card>
  ))
}

function MetricCard({ metric }: { metric: any }) {
  return (
    <div className="rounded-lg border border-outline p-md">
      <p className="text-xs text-on-surface-variant mb-sm">
        {getMetricTypeLabel(metric.metric_type)}
      </p>
      <p className="text-lg font-semibold text-on-surface">
        {formatMetricValue(metric.value, metric.unit)}
      </p>
      {metric.source && (
        <p className="text-xs text-on-surface-variant mt-sm">
          Fonte: {metric.source}
        </p>
      )}
    </div>
  )
}
