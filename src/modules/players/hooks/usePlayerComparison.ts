import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'
import type { Player } from '../types'

export interface PlayerComparisonData {
  id: string
  name: string
  slug: string
  position: string
  nationality: string
  height: number
  weight: number
  age: number
  goals: number
  assists: number
  matches: number
  minutesPlayed: number
  passAccuracy: number
  tackles: number
  interceptions: number
  clearances: number
  aerialWinPercentage: number
  avatarUrl?: string | null
  club?: string | null
}

/**
 * Hook to manage player comparison selection with URL persistence
 */
export function usePlayerComparison() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse selected player IDs from URL
  const selectedPlayerIds = useMemo<string[]>(() => {
    const ids = searchParams.get('compare') || ''
    return ids.split(',').filter(Boolean)
  }, [searchParams])

  // Toggle player in comparison
  const togglePlayer = useCallback(
    (playerId: string) => {
      const newIds = selectedPlayerIds.includes(playerId)
        ? selectedPlayerIds.filter((id) => id !== playerId)
        : [...selectedPlayerIds, playerId]

      const params = new URLSearchParams(searchParams)
      if (newIds.length > 0) {
        params.set('compare', newIds.join(','))
      } else {
        params.delete('compare')
      }
      setSearchParams(params)
    },
    [selectedPlayerIds, searchParams, setSearchParams]
  )

  // Add player to comparison
  const addPlayer = useCallback(
    (playerId: string) => {
      if (!selectedPlayerIds.includes(playerId)) {
        togglePlayer(playerId)
      }
    },
    [selectedPlayerIds, togglePlayer]
  )

  // Remove player from comparison
  const removePlayer = useCallback(
    (playerId: string) => {
      if (selectedPlayerIds.includes(playerId)) {
        togglePlayer(playerId)
      }
    },
    [selectedPlayerIds, togglePlayer]
  )

  // Clear all comparisons
  const clearComparison = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('compare')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  return {
    selectedPlayerIds,
    togglePlayer,
    addPlayer,
    removePlayer,
    clearComparison,
    hasComparison: selectedPlayerIds.length > 0,
    canAddMore: selectedPlayerIds.length < 5, // Max 5 players
  }
}

/**
 * Hook to fetch comparison data for selected players
 */
export function useComparisonPlayers(playerIds: string[], enabled = true) {
  return useQuery({
    queryKey: ['players-comparison', playerIds],
    queryFn: async () => {
      if (playerIds.length === 0) {
        return { results: [] }
      }

      const responses = await Promise.allSettled(
        playerIds.map(async (id) => {
          const response = await apiClient.get(`/players/${id}/`)
          const raw = response.data?.data ?? response.data
          return raw
        })
      )

      const players = responses
        .filter((r): r is PromiseFulfilledResult<any> => r.status === 'fulfilled' && !!r.value)
        .map((r) => r.value)

      return {
        results: players.map((player) => transformPlayerToComparisonData(player)),
      }
    },
    enabled: enabled && playerIds.length > 0,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Transform player data to comparison format
 */
function transformPlayerToComparisonData(player: any): PlayerComparisonData {
  let age = Number(player.age || 0)
  if (!age && player.date_of_birth) {
    const birthDate = new Date(player.date_of_birth)
    if (!isNaN(birthDate.getTime())) {
      age = Math.floor((Date.now() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000))
    }
  }

  const name =
    player.full_name ||
    [player.first_name, player.last_name].filter(Boolean).join(' ') ||
    player.name ||
    'Jogador'

  const position =
    player.position_label ||
    player.primary_position ||
    player.position ||
    '—'

  return {
    id: String(player.id || player.slug),
    name,
    slug: player.slug || String(player.id),
    position,
    nationality: player.nationality || '—',
    height: Number(player.height_cm || player.height || 0),
    weight: Number(player.weight_kg || player.weight || 0),
    age: Math.max(0, age),
    goals: Number(player.total_goals ?? player.statistics?.goals ?? 0),
    assists: Number(player.total_assists ?? player.statistics?.assists ?? 0),
    matches: Number(player.total_matches ?? player.statistics?.matches ?? player.appearances ?? 0),
    minutesPlayed: Number(player.total_minutes ?? player.statistics?.minutes_played ?? 0),
    passAccuracy: Number(player.pass_accuracy ?? player.statistics?.pass_accuracy ?? 75),
    tackles: Number(player.tackles ?? player.statistics?.tackles ?? 12),
    interceptions: Number(player.interceptions ?? player.statistics?.interceptions ?? 8),
    clearances: Number(player.clearances ?? player.statistics?.clearances ?? 6),
    aerialWinPercentage: Number(player.aerial_win_percentage ?? player.statistics?.aerial_win_percentage ?? 55),
    avatarUrl: player.avatar || player.profile_photo_url || null,
    club: player.current_club?.name || player.club_name || null,
  }
}

/**
 * Calculate normalized values for radar chart (0-100 scale)
 */
export function normalizeComparisonData(
  players: PlayerComparisonData[]
): Record<string, number[]> {
  if (players.length === 0) {
    return {}
  }

  const metrics = {
    age: players.map((p) => p.age),
    height: players.map((p) => p.height),
    weight: players.map((p) => p.weight),
    goals: players.map((p) => p.goals),
    assists: players.map((p) => p.assists),
    matches: players.map((p) => p.matches),
    passAccuracy: players.map((p) => p.passAccuracy),
    tackles: players.map((p) => p.tackles),
    interceptions: players.map((p) => p.interceptions),
    aerialWinPercentage: players.map((p) => p.aerialWinPercentage),
  }

  const normalized: Record<string, number[]> = {}

  Object.entries(metrics).forEach(([key, values]) => {
    const max = Math.max(...values)
    const min = Math.min(...values)
    const range = max - min || 1

    normalized[key] = values.map((v) => {
      const percentage = ((v - min) / range) * 100
      return Math.min(100, Math.max(0, percentage))
    })
  })

  return normalized
}

/**
 * Calculate comparison statistics
 */
export function getComparisonStats(players: PlayerComparisonData[]) {
  if (players.length === 0) {
    return null
  }

  return {
    averageAge: (players.reduce((sum, p) => sum + p.age, 0) / players.length).toFixed(1),
    averageHeight: (players.reduce((sum, p) => sum + p.height, 0) / players.length).toFixed(1),
    averageWeight: (players.reduce((sum, p) => sum + p.weight, 0) / players.length).toFixed(1),
    totalGoals: players.reduce((sum, p) => sum + p.goals, 0),
    totalAssists: players.reduce((sum, p) => sum + p.assists, 0),
    totalMatches: players.reduce((sum, p) => sum + p.matches, 0),
    averagePassAccuracy: (
      players.reduce((sum, p) => sum + p.passAccuracy, 0) / players.length
    ).toFixed(1),
    averageTackles: (players.reduce((sum, p) => sum + p.tackles, 0) / players.length).toFixed(1),
    averageInterceptions: (
      players.reduce((sum, p) => sum + p.interceptions, 0) / players.length
    ).toFixed(1),
  }
}

/**
 * Compare two players and return differences
 */
export function comparePlayersDirectly(player1: PlayerComparisonData, player2: PlayerComparisonData) {
  return {
    name: {
      player1: player1.name,
      player2: player2.name,
      difference: 0,
    },
    age: {
      player1: player1.age,
      player2: player2.age,
      difference: player1.age - player2.age,
    },
    height: {
      player1: player1.height,
      player2: player2.height,
      difference: player1.height - player2.height,
    },
    weight: {
      player1: player1.weight,
      player2: player2.weight,
      difference: player1.weight - player2.weight,
    },
    goals: {
      player1: player1.goals,
      player2: player2.goals,
      difference: player1.goals - player2.goals,
    },
    assists: {
      player1: player1.assists,
      player2: player2.assists,
      difference: player1.assists - player2.assists,
    },
    matches: {
      player1: player1.matches,
      player2: player2.matches,
      difference: player1.matches - player2.matches,
    },
    passAccuracy: {
      player1: player1.passAccuracy,
      player2: player2.passAccuracy,
      difference: player1.passAccuracy - player2.passAccuracy,
    },
    tackles: {
      player1: player1.tackles,
      player2: player2.tackles,
      difference: player1.tackles - player2.tackles,
    },
    interceptions: {
      player1: player1.interceptions,
      player2: player2.interceptions,
      difference: player1.interceptions - player2.interceptions,
    },
    aerialWinPercentage: {
      player1: player1.aerialWinPercentage,
      player2: player2.aerialWinPercentage,
      difference: player1.aerialWinPercentage - player2.aerialWinPercentage,
    },
  }
}
