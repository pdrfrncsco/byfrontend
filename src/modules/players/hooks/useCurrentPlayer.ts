import { useMemo } from 'react'
import { useAuth } from '@/app/providers'
import { usePlayerMe } from './usePlayerQueries'

/**
 * useCurrentPlayer — combined hook that returns the authenticated user's player profile (if any)
 * along with derived convenience flags.
 */
export function useCurrentPlayer() {
  const { user } = useAuth()
  const playerQuery = usePlayerMe()

  const isPlayerUser = Boolean(user?.roles?.includes('player') || user?.profileType === 'player')

  const data = playerQuery.data ?? null

  const derived = useMemo(() => ({
    hasPlayer: Boolean(data && data.slug),
    onboardingRequired: (playerQuery as any)?.data?.onboarding_required ?? false,
  }), [data, playerQuery])

  return {
    ...playerQuery,
    isPlayerUser,
    player: data,
    ...derived,
  }
}
