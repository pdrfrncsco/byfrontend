import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { PlayerCareerEntry } from '../types'

/**
 * Hook to fetch player career statistics
 * Retrieves career history, registrations, and statistics
 */
export function usePlayerCareerStats(playerSlug: string, enabled = true) {
  return useQuery({
    queryKey: ['player-career-stats', playerSlug],
    queryFn: async () => {
      const response = await apiClient.get<PlayerCareerEntry[]>(`/players/${playerSlug}/career/`)
      return response.data
    },
    enabled: !!playerSlug && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch player registrations
 * Retrieves all player registrations in clubs
 */
export function usePlayerRegistrations(playerSlug: string, enabled = true) {
  return useQuery({
    queryKey: ['player-registrations', playerSlug],
    queryFn: async () => {
      const response = await apiClient.get(`/players/${playerSlug}/registrations/`)
      return response.data
    },
    enabled: !!playerSlug && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch player statistics
 * Retrieves aggregated statistics (goals, assists, matches, etc.)
 */
export function usePlayerStatistics(playerSlug: string, enabled = true) {
  return useQuery({
    queryKey: ['player-statistics', playerSlug],
    queryFn: async () => {
      const response = await apiClient.get(`/players/${playerSlug}/statistics/`)
      return response.data
    },
    enabled: !!playerSlug && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
