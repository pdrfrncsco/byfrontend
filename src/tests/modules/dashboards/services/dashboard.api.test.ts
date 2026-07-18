import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'

// Mock the API client
vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(),
  },
}))

// Mock the dashboard mock module (lazy import in api)
vi.mock('@/modules/dashboards/services/dashboard.mock', () => ({
  getMockDashboardData: vi.fn(() => ({
    kpis: {
      total_clubs: 99,
      total_players: 999,
      total_news: 10,
      active_tournaments: 5,
      tournaments_upcoming: 2,
      tournaments_completed: 3,
      matches_finished: 50,
      matches_scheduled: 10,
      matches_live: 1,
      total_matches: 61,
      matches_today: 3,
      players_this_month: 12,
      players_last_month: 8,
      goals_total: 200,
      avg_goals_per_match: 3.2,
      organization_subscribers: 500,
      total_revenue: 12000,
      avg_subscribers_per_tournament: 100,
    },
    tournaments: [],
    top_clubs_by_players: [],
    top_scorers: [],
    goals_evolution: [],
    live_matches: [],
    upcoming_matches: [],
  })),
  getMockPublicStats: vi.fn(() => ({
    total_clubs: 99,
    total_players: 999,
    active_tournaments: 5,
    total_matches: 61,
  })),
}))

import apiClient from '@/lib/api-client'
import { dashboardApi } from '@/modules/dashboards/services/dashboard.api'
import type {
  DashboardOverviewResponse,
  PublicStatsResponse,
} from '@/modules/dashboards/types/dashboard.types'

const createResponse = <T>(data: T): AxiosResponse<T> =>
  ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }) as AxiosResponse<T>

const mockOverview: DashboardOverviewResponse = {
  kpis: {
    total_clubs: 10,
    total_players: 100,
    total_news: 5,
    active_tournaments: 3,
    tournaments_upcoming: 1,
    tournaments_completed: 2,
    matches_finished: 20,
    matches_scheduled: 5,
    matches_live: 0,
    total_matches: 25,
    matches_today: 2,
    players_this_month: 4,
    players_last_month: 3,
    goals_total: 60,
    avg_goals_per_match: 2.4,
    organization_subscribers: 200,
    total_revenue: 5000,
    avg_subscribers_per_tournament: 66,
  },
  tournaments: [],
  top_clubs_by_players: [],
  top_scorers: [],
  goals_evolution: [],
  live_matches: [],
  upcoming_matches: [],
}

const mockPublicStats: PublicStatsResponse = {
  total_clubs: 10,
  total_players: 100,
  active_tournaments: 3,
  total_matches: 25,
}

describe('dashboardApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('getDashboardOverview', () => {
    it('returns API data on successful request', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(mockOverview))

      const result = await dashboardApi.getDashboardOverview()

      expect(result).toEqual(mockOverview)
      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/overview/')
    })

    it('throws error in production mode when API fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Network Error'))

      await expect(dashboardApi.getDashboardOverview()).rejects.toThrow(
        'Dashboard temporariamente indisponível. Tente novamente mais tarde.',
      )
    })
  })

  describe('getPublicStats', () => {
    it('returns public stats data on successful request', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(mockPublicStats))

      const result = await dashboardApi.getPublicStats()

      expect(result).toEqual(mockPublicStats)
      expect(apiClient.get).toHaveBeenCalledWith('/dashboard/public-stats/')
    })

    it('throws error when public stats API fails', async () => {
      vi.mocked(apiClient.get).mockRejectedValueOnce(new Error('Server Error'))

      await expect(dashboardApi.getPublicStats()).rejects.toThrow(
        'Estatísticas temporariamente indisponíveis.',
      )
    })
  })

  describe('getEmptyDashboard', () => {
    it('returns an empty dashboard response with zero values', () => {
      const result = dashboardApi.getEmptyDashboard()

      expect(result.kpis.total_clubs).toBe(0)
      expect(result.kpis.total_players).toBe(0)
      expect(result.tournaments).toEqual([])
      expect(result.top_scorers).toEqual([])
      expect(result.live_matches).toEqual([])
    })
  })

  describe('getEmptyPublicStats', () => {
    it('returns public stats with all zeros', () => {
      const result = dashboardApi.getEmptyPublicStats()

      expect(result.total_clubs).toBe(0)
      expect(result.total_players).toBe(0)
      expect(result.active_tournaments).toBe(0)
      expect(result.total_matches).toBe(0)
    })
  })
})
