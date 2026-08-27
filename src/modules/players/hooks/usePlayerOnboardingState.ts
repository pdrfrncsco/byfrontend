import { useMemo } from 'react'
import { usePlayerOnboardingStatus } from './usePlayerQueries'
import { ROUTES } from '@/constants/routes'
import type { OnboardingStep } from '../types'

/**
 * Maps each OnboardingStep name (as returned by the backend) to the
 * corresponding frontend route path.
 */
export const STEP_ROUTE_MAP: Record<NonNullable<OnboardingStep>, string> = {
  account:   ROUTES.ONBOARDING_PLAYER,
  identity:  ROUTES.ONBOARDING_PLAYER_IDENTITY,
  personal:  ROUTES.ONBOARDING_PLAYER_PROFILE,
  football:  ROUTES.ONBOARDING_PLAYER_FOOTBALL,
  contact:   ROUTES.ONBOARDING_PLAYER_CONTACT,
  guardian:  ROUTES.ONBOARDING_PLAYER_GUARDIAN,
  club:      ROUTES.ONBOARDING_PLAYER_CLUB,
  review:    ROUTES.ONBOARDING_PLAYER_REVIEW,
}

/**
 * Sequential order of the 8 onboarding steps.
 * Used by the guard to compute which step to redirect to when a user
 * tries to skip ahead.
 */
export const STEP_ORDER: NonNullable<OnboardingStep>[] = [
  'account', 'personal', 'football', 'contact',
  'identity', 'guardian', 'club', 'review',
]

/** Normalise backend step names that were renamed on the frontend */
const BACKEND_STEP_ALIAS: Record<string, NonNullable<OnboardingStep>> = {
  profile: 'personal',
}

/**
 * usePlayerOnboardingState — derives a compact onboarding state used by the
 * guard and pages.
 */
export function usePlayerOnboardingState(enabled = true) {
  const query = usePlayerOnboardingStatus(enabled)
  const data = query.data

  const state = useMemo(() => {
    if (!data) return { step: 'not_started' as const, isComplete: false, nextStep: 'account' as const, nextRoute: ROUTES.ONBOARDING_PLAYER }

    if (!data.onboarding_required) return { step: 'complete' as const, isComplete: true, nextStep: null, nextRoute: null }

    const rawNext = data.next_step ?? 'account'
    const next = (BACKEND_STEP_ALIAS[rawNext] ?? rawNext) as NonNullable<OnboardingStep>
    const nextRoute = STEP_ROUTE_MAP[next] ?? ROUTES.ONBOARDING_PLAYER

    return { step: next, isComplete: false, nextStep: next, nextRoute }
  }, [data])

  return {
    ...query,
    onboardingState: state,
  }
}
