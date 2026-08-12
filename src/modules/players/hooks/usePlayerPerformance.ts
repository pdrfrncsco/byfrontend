import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface PerformanceMetric {
  id: string
  player: string
  recorded_at: string
  metric_type: string
  value: number
  unit: string
  source: string
  device_id?: string
  training_session?: string
  position_during_metric?: string
  notes?: string
  created_at: string
  updated_at: string
}

export interface PerformanceMetricGroup {
  category: string
  metrics: PerformanceMetric[]
  average: number
  max: number
  min: number
}

export interface PerformanceSummary {
  speed_metrics: PerformanceMetricGroup
  distance_metrics: PerformanceMetricGroup
  physical_metrics: PerformanceMetricGroup
  biometric_metrics: PerformanceMetricGroup
  workload_metrics: PerformanceMetricGroup
}

/**
 * Fetch performance metrics for a player
 */
export function usePlayerPerformanceMetrics(
  playerId: string,
  metricType?: string,
  enabled = true
) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-performance-metrics', playerId, metricType],
    queryFn: async () => {
      let url = `${apiUrl}/players/${playerId}/performance-metrics/`
      if (metricType) {
        url += `?metric_type=${encodeURIComponent(metricType)}`
      }

      const response = await fetch(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch performance metrics: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Fetch performance summary/dashboard
 */
export function usePlayerPerformanceSummary(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-performance-summary', playerId],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/performance/summary/`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch performance summary: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 10,
  })
}

/**
 * Fetch performance trends
 */
export function usePlayerPerformanceTrends(playerId: string, days = 30, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-performance-trends', playerId, days],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/performance/trends/?days=${days}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch performance trends: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 15,
  })
}

/**
 * Get metric type label
 */
export function getMetricTypeLabel(metricType: string): string {
  const metricMap: Record<string, string> = {
    // Speed
    max_speed: 'Velocidade Máxima',
    avg_speed: 'Velocidade Média',
    sprint_speed: 'Velocidade em Sprint',

    // Distance
    total_distance: 'Distância Total',
    sprint_distance: 'Distância em Sprint',
    high_speed_distance: 'Distância em Alta Velocidade',

    // Physical
    sprints_count: 'Número de Sprints',
    accelerations: 'Acelerações',
    decelerations: 'Desacelerações',
    jumps: 'Saltos',

    // Biometric
    max_heart_rate: 'Frequência Cardíaca Máxima',
    avg_heart_rate: 'Frequência Cardíaca Média',
    heart_rate_zones: 'Zonas de Frequência Cardíaca',

    // Workload
    player_load: 'Carga do Jogador',
    training_load: 'Carga de Treino',
    match_load: 'Carga de Jogo',

    // Recovery
    recovery_time: 'Tempo de Recuperação',
    fatigue_index: 'Índice de Fadiga',
  }

  return metricMap[metricType] || metricType
}

/**
 * Get metric category
 */
export function getMetricCategory(metricType: string): string {
  if (
    ['max_speed', 'avg_speed', 'sprint_speed'].includes(metricType)
  ) {
    return 'Velocidade'
  }
  if (
    ['total_distance', 'sprint_distance', 'high_speed_distance'].includes(
      metricType
    )
  ) {
    return 'Distância'
  }
  if (
    ['sprints_count', 'accelerations', 'decelerations', 'jumps'].includes(
      metricType
    )
  ) {
    return 'Física'
  }
  if (
    ['max_heart_rate', 'avg_heart_rate', 'heart_rate_zones'].includes(
      metricType
    )
  ) {
    return 'Biométrica'
  }
  if (['player_load', 'training_load', 'match_load'].includes(metricType)) {
    return 'Carga de Trabalho'
  }
  if (['recovery_time', 'fatigue_index'].includes(metricType)) {
    return 'Recuperação'
  }
  return 'Outro'
}

/**
 * Get metric unit
 */
export function getMetricUnit(metricType: string): string {
  const unitMap: Record<string, string> = {
    // Speed (km/h)
    max_speed: 'km/h',
    avg_speed: 'km/h',
    sprint_speed: 'km/h',

    // Distance (m)
    total_distance: 'm',
    sprint_distance: 'm',
    high_speed_distance: 'm',

    // Count
    sprints_count: 'sprints',
    accelerations: 'acelerations',
    decelerations: 'decelerations',
    jumps: 'jumps',

    // Heart rate (bpm)
    max_heart_rate: 'bpm',
    avg_heart_rate: 'bpm',

    // Workload
    player_load: 'index',
    training_load: 'index',
    match_load: 'index',

    // Recovery
    recovery_time: 'hours',
    fatigue_index: '%',
  }

  return unitMap[metricType] || 'unit'
}

/**
 * Get metric source label
 */
export function getMetricSourceLabel(source: string): string {
  const sourceMap: Record<string, string> = {
    gps: 'GPS',
    wearable: 'Dispositivo Portátil',
    manual: 'Entrada Manual',
    video_analysis: 'Análise de Vídeo',
    club_system: 'Sistema do Clube',
    other: 'Outro',
  }

  return sourceMap[source] || source
}

/**
 * Calculate metric average
 */
export function calculateMetricAverage(metrics: PerformanceMetric[]): number {
  if (metrics.length === 0) return 0
  const sum = metrics.reduce((acc, m) => acc + m.value, 0)
  return parseFloat((sum / metrics.length).toFixed(2))
}

/**
 * Get metric color based on value and type
 */
export function getMetricColor(
  metricType: string,
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

/**
 * Format metric value
 */
export function formatMetricValue(value: number, unit: string): string {
  if (unit === 'bpm' || unit === 'index' || unit === '%') {
    return `${value.toFixed(0)} ${unit}`
  }
  if (unit === 'km/h') {
    return `${value.toFixed(1)} ${unit}`
  }
  if (unit === 'm') {
    return `${(value / 1000).toFixed(2)} km`
  }
  if (unit === 'hours') {
    return `${value.toFixed(1)} h`
  }
  return `${value.toFixed(2)} ${unit}`
}
