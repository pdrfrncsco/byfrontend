// Players module — Performance hooks (migrated to apiClient)

import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { PlayerPerformanceMetric, PlayerPerformanceSummary } from '../types'
import { playerKeys } from './usePlayerQueries'

// ─── Query Keys ───────────────────────────────────────────────────────────────

export const performanceKeys = {
  all: playerKeys.all,
  metrics: playerKeys.performance,
  summary: playerKeys.performanceSummary,
  trends: playerKeys.performanceTrends,
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function usePlayerPerformanceMetrics(
  playerId: string,
  metricType?: string,
  enabled = true
) {
  return useQuery({
    queryKey: performanceKeys.metrics(playerId, metricType),
    queryFn: async () => {
      const res = await apiClient.get<PlayerPerformanceMetric[]>(
        `/players/${playerId}/performance-metrics/`,
        { params: metricType ? { metric_type: metricType } : undefined }
      )
      const data = res.data
      return Array.isArray(data) ? data : (data as any)?.results ?? []
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

export function usePlayerPerformanceSummary(playerId: string, enabled = true) {
  return useQuery({
    queryKey: performanceKeys.summary(playerId),
    queryFn: async () => {
      const res = await apiClient.get<PlayerPerformanceSummary>(
        `/players/${playerId}/performance/summary/`
      )
      return res.data
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 10,
  })
}

export function usePlayerPerformanceTrends(playerId: string, days = 30, enabled = true) {
  return useQuery({
    queryKey: performanceKeys.trends(playerId, days),
    queryFn: async () => {
      const res = await apiClient.get(`/players/${playerId}/performance/trends/`, {
        params: { days },
      })
      return res.data
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 15,
  })
}

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getMetricTypeLabel(metricType: string): string {
  const map: Record<string, string> = {
    max_speed:            'Velocidade Máxima',
    avg_speed:            'Velocidade Média',
    sprint_speed:         'Velocidade em Sprint',
    total_distance:       'Distância Total',
    sprint_distance:      'Distância em Sprint',
    high_speed_distance:  'Distância em Alta Velocidade',
    sprints_count:        'Número de Sprints',
    accelerations:        'Acelerações',
    decelerations:        'Desacelerações',
    jumps:                'Saltos',
    max_heart_rate:       'Frequência Cardíaca Máxima',
    avg_heart_rate:       'Frequência Cardíaca Média',
    heart_rate_zones:     'Zonas de Frequência Cardíaca',
    player_load:          'Carga do Jogador',
    training_load:        'Carga de Treino',
    match_load:           'Carga de Jogo',
    recovery_time:        'Tempo de Recuperação',
    fatigue_index:        'Índice de Fadiga',
  }
  return map[metricType] ?? metricType
}

export function getMetricCategory(metricType: string): string {
  if (['max_speed', 'avg_speed', 'sprint_speed'].includes(metricType)) return 'Velocidade'
  if (['total_distance', 'sprint_distance', 'high_speed_distance'].includes(metricType)) return 'Distância'
  if (['sprints_count', 'accelerations', 'decelerations', 'jumps'].includes(metricType)) return 'Física'
  if (['max_heart_rate', 'avg_heart_rate', 'heart_rate_zones'].includes(metricType)) return 'Biométrica'
  if (['player_load', 'training_load', 'match_load'].includes(metricType)) return 'Carga de Trabalho'
  if (['recovery_time', 'fatigue_index'].includes(metricType)) return 'Recuperação'
  return 'Outro'
}

export function getMetricUnit(metricType: string): string {
  const map: Record<string, string> = {
    max_speed: 'km/h', avg_speed: 'km/h', sprint_speed: 'km/h',
    total_distance: 'm', sprint_distance: 'm', high_speed_distance: 'm',
    sprints_count: 'sprints', accelerations: 'acelerações', decelerations: 'desacelerações', jumps: 'saltos',
    max_heart_rate: 'bpm', avg_heart_rate: 'bpm',
    player_load: 'index', training_load: 'index', match_load: 'index',
    recovery_time: 'horas', fatigue_index: '%',
  }
  return map[metricType] ?? 'unit'
}

export function formatMetricValue(value: number, unit: string): string {
  if (['bpm', 'index', '%'].includes(unit)) return `${value.toFixed(0)} ${unit}`
  if (unit === 'km/h') return `${value.toFixed(1)} ${unit}`
  if (unit === 'm') return `${(value / 1000).toFixed(2)} km`
  if (unit === 'horas') return `${value.toFixed(1)} h`
  return `${value.toFixed(2)} ${unit}`
}

export function getMetricColor(
  _metricType: string,
  value: number,
  average?: number
): string {
  if (!average) return 'text-gray-700'
  const ratio = value / average
  if (ratio >= 1.2) return 'text-green-700'
  if (ratio >= 1.0) return 'text-blue-700'
  if (ratio >= 0.8) return 'text-yellow-700'
  return 'text-red-700'
}
