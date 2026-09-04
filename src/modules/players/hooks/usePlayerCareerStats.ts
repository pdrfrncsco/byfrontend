import { useQuery } from '@tanstack/react-query'
import { getStoredAuthToken } from '@/lib/storage'
import type { PlayerCareerEntry } from '../types'

/**
 * Hook to fetch player career statistics
 * Retrieves career history, registrations, and statistics
 */
export function usePlayerCareerStats(playerSlug: string, enabled = true) {
  return useQuery({
    queryKey: ['player-career-stats', playerSlug],
    queryFn: async () => {
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/players/${playerSlug}/career/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getStoredAuthToken() || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch career stats: ${response.statusText}`)
      }

      return response.json() as Promise<PlayerCareerEntry[]>
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/players/${playerSlug}/registrations/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getStoredAuthToken() || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch registrations: ${response.statusText}`)
      }

      return response.json()
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
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'}/players/${playerSlug}/statistics/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getStoredAuthToken() || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch statistics: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: !!playerSlug && enabled,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}
