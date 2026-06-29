import { useQuery } from '@tanstack/react-query'
import { authApi } from '@/modules/auth/services/auth.api'
import type { User, TenantMembership } from '@/types'

/* ──────────────────────────────────────────────
 * Query Keys
 * ────────────────────────────────────────────── */
export const authKeys = {
  all: ['auth'] as const,
  me: () => [...authKeys.all, 'me'] as const,
  memberships: () => [...authKeys.all, 'memberships'] as const,
}

/* ──────────────────────────────────────────────
 * useMe — Fetch the authenticated user's profile
 * ────────────────────────────────────────────── */
export function useMe(enabled: boolean = true) {
  return useQuery<User>({
    queryKey: authKeys.me(),
    queryFn: () => authApi.getMe(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

/* ──────────────────────────────────────────────
 * useMemberships — Fetch the user's tenant memberships
 * ────────────────────────────────────────────── */
export function useMemberships(enabled: boolean = true) {
  return useQuery<TenantMembership[]>({
    queryKey: authKeys.memberships(),
    queryFn: () => authApi.getMemberships(),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
