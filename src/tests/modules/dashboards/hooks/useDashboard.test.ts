import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import {
  useDashboardOverview,
  usePublicStats,
} from '@/modules/dashboards/hooks/useDashboard'
import type {
  DashboardOverviewResponse,
  PublicStatsResponse,
} from '@/modules/dashboards/types/dashboard.types'

vi.mock('@/modules/dashboards/services/dashboard.api', () => ({
  dashboardApi: {
    getDashboardOverview: vi.fn(),
    getPublicStats: vi.fn(),
  },
}))

import { dashboardApi } from '@/modules/dashboards/services/dashboard.api'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockOverview: DashboardOverviewResponse = {
  kpis: {
    total_clubs: 5,
    total_players: 50,
    total_news: 3,
    active_tournaments: 2,
    tournaments_upcoming: 0,
    tournaments_completed: 2,
    matches_finished: 10,
    matches_scheduled: 4,
    matches_live: 0,
    total_matches: 14,
    matches_today: 1,
    players_this_month: 2,
    players_last_month: 1,
    goals_total: 30,
    avg_goals_per_match: 2.1,
    organization_subscribers: 100,
    total_revenue: 2500,
    avg_subscribers_per_tournament: 50,
  },
  tournaments: [{ id: 't1', name: 'Liga 2026', status: 'active', progress: 60, teams: 8, logo: null }],
  top_clubs_by_players: [],
  top_scorers: [],
  goals_evolution: [],
  live_matches: [],
  upcoming_matches: [],
}

const mockPublicStats: PublicStatsResponse = {
  total_clubs: 5,
  total_players: 50,
  active_tournaments: 2,
  total_matches: 14,
}

describe('dashboard hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useDashboardOverview', () => {
    it('fetches and returns the dashboard overview', async () => {
      vi.mocked(dashboardApi.getDashboardOverview).mockResolvedValueOnce(mockOverview)

      const { result } = renderHook(() => useDashboardOverview(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockOverview)
      expect(dashboardApi.getDashboardOverview).toHaveBeenCalledTimes(1)
    })

    it('enters error state when API throws', async () => {
      vi.mocked(dashboardApi.getDashboardOverview).mockRejectedValueOnce(
        new Error('Dashboard temporariamente indisponível.'),
      )

      const { result } = renderHook(() => useDashboardOverview(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })

  describe('usePublicStats', () => {
    it('fetches and returns public stats', async () => {
      vi.mocked(dashboardApi.getPublicStats).mockResolvedValueOnce(mockPublicStats)

      const { result } = renderHook(() => usePublicStats(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual(mockPublicStats)
      expect(result.current.data?.total_clubs).toBe(5)
    })

    it('uses the correct query key', async () => {
      vi.mocked(dashboardApi.getPublicStats).mockResolvedValueOnce(mockPublicStats)

      const queryClient = new QueryClient({
        defaultOptions: { queries: { retry: false } },
      })
      const wrapper = function Wrapper({ children }: { children: React.ReactNode }) {
        return React.createElement(QueryClientProvider, { client: queryClient }, children)
      }

      renderHook(() => usePublicStats(), { wrapper })
      await waitFor(() =>
        expect(queryClient.getQueryState(['dashboard', 'public-stats'])).toBeDefined(),
      )
    })
  })
})
