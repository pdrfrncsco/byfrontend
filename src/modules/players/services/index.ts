// Players module — API service

import apiClient from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { Player, PlayerDetail, PlayerListParams, PlayerListResponse } from '../types'

/**
 * List active players.
 * Supports filtering by position and nationality.
 */
export async function listPlayers(params?: PlayerListParams): Promise<{ success: boolean; data: PlayerListResponse }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.LIST, { params })
  return res.data
}

/**
 * Get a player's full profile by slug, including career history.
 */
export async function getPlayer(slug: string): Promise<{ success: boolean; data: PlayerDetail }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.GET(slug))
  return res.data
}

/**
 * Search players by name (min 2 chars).
 */
export async function searchPlayers(q: string): Promise<{ success: boolean; data: Player[] }> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.SEARCH, { params: { q } })
  return res.data
}
