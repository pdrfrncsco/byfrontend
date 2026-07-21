// Players module — React Query query hooks

import { useQuery, keepPreviousData } from '@tanstack/react-query'
import {
  listPlayers,
  getPlayer,
  searchPlayers,
  listPlayerDocuments,
  listPlayerVideos,
  listPlayerAchievements,
  getPlayerMe,
  getPlayerOnboardingStatus,
} from '../services'
import type { PlayerListParams } from '../types'

export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (params: PlayerListParams) => [...playerKeys.lists(), params] as const,
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (slug: string) => [...playerKeys.details(), slug] as const,
  search: (q: string) => [...playerKeys.all, 'search', q] as const,
  documents: (slug: string) => [...playerKeys.all, 'documents', slug] as const,
  videos: (slug: string) => [...playerKeys.all, 'videos', slug] as const,
  achievements: (slug: string) => [...playerKeys.all, 'achievements', slug] as const,
  me: () => [...playerKeys.all, 'me'] as const,
  onboardingStatus: () => [...playerKeys.all, 'onboarding-status'] as const,
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

/**
 * Hook: list player documents.
 */
export function usePlayerDocuments(slug: string) {
  return useQuery({
    queryKey: playerKeys.documents(slug),
    queryFn: () => listPlayerDocuments(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

/**
 * Hook: list player videos.
 */
export function usePlayerVideos(slug: string) {
  return useQuery({
    queryKey: playerKeys.videos(slug),
    queryFn: () => listPlayerVideos(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

/**
 * Hook: list player achievements.
 */
export function usePlayerAchievements(slug: string) {
  return useQuery({
    queryKey: playerKeys.achievements(slug),
    queryFn: () => listPlayerAchievements(slug),
    enabled: Boolean(slug),
    staleTime: 60_000,
  })
}

/**
 * Hook: get the authenticated user's linked player profile.
 */
export function usePlayerMe() {
  return useQuery({
    queryKey: playerKeys.me(),
    queryFn: () => getPlayerMe(),
    staleTime: 60_000,
  })
}

/**
 * Hook: get onboarding status for the authenticated user's linked player profile.
 */
export function usePlayerOnboardingStatus(enabled = true) {
  return useQuery({
    queryKey: playerKeys.onboardingStatus(),
    queryFn: () => getPlayerOnboardingStatus(),
    enabled,
    staleTime: 30_000,
  })
}
