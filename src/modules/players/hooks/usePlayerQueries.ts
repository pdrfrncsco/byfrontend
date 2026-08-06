import { useQuery, useSuspenseQuery } from "@tanstack/react-query";
import { playerApi } from "@/modules/players/services/player.api";
import type { PlayerListParams } from "@/modules/players/types";

// ─── Query key factory ────────────────────────────────────────────────────────

export const PLAYER_QUERY_KEYS = {
  all: ["players"] as const,
  lists: () => [...PLAYER_QUERY_KEYS.all, "list"] as const,
  list: (params?: PlayerListParams) =>
    [...PLAYER_QUERY_KEYS.lists(), params ?? {}] as const,
  details: () => [...PLAYER_QUERY_KEYS.all, "detail"] as const,
  detail: (id: string) => [...PLAYER_QUERY_KEYS.details(), id] as const,
  current: () => [...PLAYER_QUERY_KEYS.all, "current"] as const,
  career: (id: string) => [...PLAYER_QUERY_KEYS.detail(id), "career"] as const,
  achievements: (id: string) =>
    [...PLAYER_QUERY_KEYS.detail(id), "achievements"] as const,
  documents: (id: string) =>
    [...PLAYER_QUERY_KEYS.detail(id), "documents"] as const,
  videos: (id: string) => [...PLAYER_QUERY_KEYS.detail(id), "videos"] as const,
  completion: (id: string) =>
    [...PLAYER_QUERY_KEYS.detail(id), "completion"] as const,
  registrationRequests: (id: string) =>
    [...PLAYER_QUERY_KEYS.detail(id), "registration-requests"] as const,
  onboarding: () => [...PLAYER_QUERY_KEYS.current(), 'onboarding'] as const,
};


// Backwards-compatible alias for older imports
export const playerKeys = PLAYER_QUERY_KEYS;

// ─── Stale-time constants ─────────────────────────────────────────────────────

const STALE_SHORT = 30_000;      // 30 s — live data (availability, status)
const STALE_MEDIUM = 60_000 * 5; // 5 min — profile sections
const STALE_LONG = 60_000 * 15;  // 15 min — rarely-changing data (career, achievements)

// ─── List ─────────────────────────────────────────────────────────────────────

export function usePlayers(params?: PlayerListParams) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.list(params),
    queryFn: () => playerApi.list(params),
    staleTime: STALE_SHORT,
  });
}

// ─── Single player ────────────────────────────────────────────────────────────

export function usePlayer(id: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.detail(id),
    queryFn: () => playerApi.getById(id),
    staleTime: STALE_MEDIUM,
    enabled: !!id,
  });
}

/**
 * Suspense variant — use inside pages that are already wrapped in a Suspense boundary.
 */
export function usePlayerSuspense(id: string) {
  return useSuspenseQuery({
    queryKey: PLAYER_QUERY_KEYS.detail(id),
    queryFn: () => playerApi.getById(id),
    staleTime: STALE_MEDIUM,
  });
}

// ─── Current authenticated user's player profile (provided from separate hook) ──
import { useCurrentPlayer } from './useCurrentPlayer'

// Backwards-compatible alias expected by older code
export const usePlayerMe = useCurrentPlayer;

// ─── Career history ───────────────────────────────────────────────────────────

export function usePlayerCareer(playerId: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.career(playerId),
    queryFn: () => playerApi.getCareerHistory(playerId),
    staleTime: STALE_LONG,
    enabled: !!playerId,
  });
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export function usePlayerAchievements(playerId: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.achievements(playerId),
    queryFn: () => playerApi.getAchievements(playerId),
    staleTime: STALE_LONG,
    enabled: !!playerId,
  });
}

// ─── Documents ───────────────────────────────────────────────────────────────

export function usePlayerDocuments(playerId: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.documents(playerId),
    queryFn: () => playerApi.getDocuments(playerId),
    staleTime: STALE_MEDIUM,
    enabled: !!playerId,
  });
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export function usePlayerVideos(playerId: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.videos(playerId),
    queryFn: () => playerApi.getVideos(playerId),
    staleTime: STALE_MEDIUM,
    enabled: !!playerId,
  });
}

// ─── Profile completion ───────────────────────────────────────────────────────

export function usePlayerProfileCompletion(playerId: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.completion(playerId),
    queryFn: () => playerApi.getProfileCompletion(playerId),
    staleTime: STALE_SHORT,
    enabled: !!playerId,
  });
}

// ─── Onboarding status (current user) ─────────────────────────────────────────

export function usePlayerOnboardingStatus(enabled = true) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.onboarding(),
    queryFn: () => playerApi.getPlayerOnboardingStatus(),
    staleTime: STALE_SHORT,
    enabled: !!enabled,
  });
}

// ─── Registration requests ────────────────────────────────────────────────────

export function usePlayerRegistrationRequests(playerId: string) {
  return useQuery({
    queryKey: PLAYER_QUERY_KEYS.registrationRequests(playerId),
    queryFn: () => playerApi.getRegistrationRequests(playerId),
    staleTime: STALE_SHORT,
    enabled: !!playerId,
  });
}
