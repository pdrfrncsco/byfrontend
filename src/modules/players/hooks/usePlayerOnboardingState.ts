import { useMemo } from 'react'
import { usePlayerOnboardingStatus } from './usePlayerQueries'
import type { OnboardingStep } from '../types'

const LEGACY_STEP_MAP: Record<string, NonNullable<OnboardingStep>> = {
  profile: 'personal',
  personal: 'personal',
  football: 'football',
  review: 'review',
}

/**
 * usePlayerOnboardingState — derives a compact onboarding state used by the guard and pages
 */
export function usePlayerOnboardingState(enabled = true) {
  const query = usePlayerOnboardingStatus(enabled)
  const data = query.data

  const state = useMemo(() => {
    if (!data) return { step: 'not_started', isComplete: false, nextStep: 'account' as const }

    if (!data.onboarding_required) return { step: 'complete', isComplete: true, nextStep: null }

    const next = data.next_step
      ? (LEGACY_STEP_MAP[data.next_step] ?? data.next_step)
      : 'account'
    return { step: next, isComplete: false, nextStep: next }
  }, [data])

  return {
    ...query,
    onboardingState: state,
  }
}
