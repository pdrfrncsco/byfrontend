// Players module — React Query hooks

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { listPlayers, getPlayer, searchPlayers } from '../services'
import type { PlayerListParams } from '../types'

export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (params: PlayerListParams) => [...playerKeys.lists(), params] as const,
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (slug: string) => [...playerKeys.details(), slug] as const,
  search: (q: string) => [...playerKeys.all, 'search', q] as const,
}

/**
 * Hook: list players with optional position/nationality/page filter.
 */
export function usePlayers(params: PlayerListParams = {}) {
  return useQuery({
    queryKey: playerKeys.list(params),
    queryFn: () => listPlayers(params),
    placeholderData: keepPreviousData,
    staleTime: 30_000,
  })
}

/**
 * Hook: get a single player detail by slug.
 */
export function usePlayer(slug: string) {
  return useQuery({
    queryKey: playerKeys.detail(slug),
    queryFn: () => getPlayer(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

/**
 * Hook: search players by name (debounce at call site).
 * Only fires when query is >= 2 chars.
 */
export function usePlayerSearch(q: string) {
  return useQuery({
    queryKey: playerKeys.search(q),
    queryFn: () => searchPlayers(q),
    enabled: q.length >= 2,
    staleTime: 15_000,
  })
}
