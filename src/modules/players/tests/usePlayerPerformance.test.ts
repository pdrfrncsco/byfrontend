import { describe, it, expect } from 'vitest'
import {
  getMetricTypeLabel,
  getMetricCategory,
  getMetricUnit,
  getMetricSourceLabel,
  calculateMetricAverage,
  getMetricColor,
  formatMetricValue,
  type PerformanceMetric,
} from '../hooks/usePlayerPerformance'

describe('usePlayerPerformance helpers', () => {
  describe('getMetricTypeLabel', () => {
    it('should return label for speed metrics', () => {
      expect(getMetricTypeLabel('max_speed')).toBe('Velocidade Máxima')
      expect(getMetricTypeLabel('avg_speed')).toBe('Velocidade Média')
    })

    it('should return label for distance metrics', () => {
      expect(getMetricTypeLabel('total_distance')).toBe('Distância Total')
      expect(getMetricTypeLabel('sprint_distance')).toBe('Distância em Sprint')
    })

    it('should return label for physical metrics', () => {
      expect(getMetricTypeLabel('sprints_count')).toBe('Número de Sprints')
      expect(getMetricTypeLabel('jumps')).toBe('Saltos')
    })

    it('should return metric type for unknown', () => {
      expect(getMetricTypeLabel('unknown_metric')).toBe('unknown_metric')
    })
  })

  describe('getMetricCategory', () => {
    it('should categorize speed metrics', () => {
      expect(getMetricCategory('max_speed')).toBe('Velocidade')
      expect(getMetricCategory('sprint_speed')).toBe('Velocidade')
    })

    it('should categorize distance metrics', () => {
      expect(getMetricCategory('total_distance')).toBe('Distância')
      expect(getMetricCategory('high_speed_distance')).toBe('Distância')
    })

    it('should categorize physical metrics', () => {
      expect(getMetricCategory('sprints_count')).toBe('Física')
      expect(getMetricCategory('accelerations')).toBe('Física')
    })

    it('should categorize biometric metrics', () => {
      expect(getMetricCategory('max_heart_rate')).toBe('Biométrica')
      expect(getMetricCategory('avg_heart_rate')).toBe('Biométrica')
    })

    it('should categorize workload metrics', () => {
      expect(getMetricCategory('player_load')).toBe('Carga de Trabalho')
      expect(getMetricCategory('training_load')).toBe('Carga de Trabalho')
    })

    it('should categorize recovery metrics', () => {
      expect(getMetricCategory('recovery_time')).toBe('Recuperação')
      expect(getMetricCategory('fatigue_index')).toBe('Recuperação')
    })
  })

  describe('getMetricUnit', () => {
    it('should return km/h for speed metrics', () => {
      expect(getMetricUnit('max_speed')).toBe('km/h')
      expect(getMetricUnit('avg_speed')).toBe('km/h')
    })

    it('should return m for distance metrics', () => {
      expect(getMetricUnit('total_distance')).toBe('m')
      expect(getMetricUnit('sprint_distance')).toBe('m')
    })

    it('should return bpm for heart rate metrics', () => {
      expect(getMetricUnit('max_heart_rate')).toBe('bpm')
      expect(getMetricUnit('avg_heart_rate')).toBe('bpm')
    })

    it('should return % for fatigue index', () => {
      expect(getMetricUnit('fatigue_index')).toBe('%')
    })

    it('should return index for workload metrics', () => {
      expect(getMetricUnit('player_load')).toBe('index')
    })
  })

  describe('getMetricSourceLabel', () => {
    it('should return label for GPS source', () => {
      expect(getMetricSourceLabel('gps')).toBe('GPS')
    })

    it('should return label for wearable source', () => {
      expect(getMetricSourceLabel('wearable')).toBe('Dispositivo Portátil')
    })

    it('should return label for manual source', () => {
      expect(getMetricSourceLabel('manual')).toBe('Entrada Manual')
    })

    it('should return source for unknown', () => {
      expect(getMetricSourceLabel('unknown')).toBe('unknown')
    })
  })

  describe('calculateMetricAverage', () => {
    it('should calculate average for multiple metrics', () => {
      const metrics: PerformanceMetric[] = [
        {
          id: '1',
          player: 'p1',
          recorded_at: '2024-01-01',
          metric_type: 'max_speed',
          value: 30,
          unit: 'km/h',
          source: 'gps',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
        {
          id: '2',
          player: 'p1',
          recorded_at: '2024-01-02',
          metric_type: 'max_speed',
          value: 28,
          unit: 'km/h',
          source: 'gps',
          created_at: '2024-01-02',
          updated_at: '2024-01-02',
        },
      ]

      expect(calculateMetricAverage(metrics)).toBe(29)
    })

    it('should return 0 for empty array', () => {
      expect(calculateMetricAverage([])).toBe(0)
    })

    it('should handle single metric', () => {
      const metrics: PerformanceMetric[] = [
        {
          id: '1',
          player: 'p1',
          recorded_at: '2024-01-01',
          metric_type: 'max_speed',
          value: 25.5,
          unit: 'km/h',
          source: 'gps',
          created_at: '2024-01-01',
          updated_at: '2024-01-01',
        },
      ]

      expect(calculateMetricAverage(metrics)).toBe(25.5)
    })
  })

  describe('getMetricColor', () => {
    it('should return green for high performance', () => {
      expect(getMetricColor('max_speed', 36, 30)).toBe('text-green-700')
    })

    it('should return blue for normal performance', () => {
      expect(getMetricColor('max_speed', 30, 30)).toBe('text-blue-700')
    })

    it('should return yellow for below average', () => {
      expect(getMetricColor('max_speed', 24, 30)).toBe('text-yellow-700')
    })

    it('should return red for poor performance', () => {
      expect(getMetricColor('max_speed', 20, 30)).toBe('text-red-700')
    })

    it('should return gray when no average', () => {
      expect(getMetricColor('max_speed', 30)).toBe('text-gray-700')
    })
  })

  describe('formatMetricValue', () => {
    it('should format km/h metrics', () => {
      expect(formatMetricValue(30.5, 'km/h')).toBe('30.5 km/h')
    })

    it('should format bpm metrics', () => {
      expect(formatMetricValue(155.5, 'bpm')).toBe('156 bpm')
    })

    it('should format meters to km', () => {
      expect(formatMetricValue(5000, 'm')).toBe('5.00 km')
    })

    it('should format hours', () => {
      expect(formatMetricValue(2.5, 'hours')).toBe('2.5 h')
    })

    it('should format percentage', () => {
      expect(formatMetricValue(75.3, '%')).toBe('75 %')
    })

    it('should format index', () => {
      expect(formatMetricValue(42.7, 'index')).toBe('43 index')
    })
  })
})
