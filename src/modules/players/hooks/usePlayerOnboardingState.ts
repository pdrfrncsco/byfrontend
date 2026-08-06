import { useMemo } from 'react'
import { usePlayerOnboardingStatus } from './usePlayerQueries'

/**
 * usePlayerOnboardingState — derives a compact onboarding state used by the guard and pages
 */
export function usePlayerOnboardingState(enabled = true) {
  const query = usePlayerOnboardingStatus(enabled)
  const data = query.data

  const state = useMemo(() => {
    if (!data) return { step: 'not_started', isComplete: false, nextStep: 'profile' }

    if (!data.onboarding_required) return { step: 'complete', isComplete: true, nextStep: null }

    // data.next_step may be 'profile' | 'football' | 'review' — map to our step names
    const next = data.next_step ?? 'profile'
    return { step: next, isComplete: false, nextStep: next }
  }, [data])

  return {
    ...query,
    onboardingState: state,
  }
}
