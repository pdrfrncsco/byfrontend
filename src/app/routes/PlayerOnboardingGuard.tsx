import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { usePlayerOnboardingState, STEP_ROUTE_MAP, STEP_ORDER } from '@/modules/players'
import { ROUTES } from '@/constants/routes'
import type { OnboardingStep } from '@/modules/players'

interface PlayerOnboardingGuardProps {
  children: ReactNode
}

/**
 * Guards the 9-step player onboarding flow.
 *
 * Rules:
 * 1. Unauthenticated → /login
 * 2. Non-player      → /dashboard
 * 3. /complete       → always renders (no redirect loop)
 * 4. Fully complete  → /dashboard/player (except on /complete)
 * 5. /welcome        → renders; if complete goes to dashboard
 * 6. Any other step  → if the user hasn't reached that step yet,
 *                      redirect to the earliest incomplete step.
 */
export function PlayerOnboardingGuard({ children }: PlayerOnboardingGuardProps) {
  const location = useLocation()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const isPlayer = Boolean(user?.roles.includes('player') || user?.profileType === 'player')
  const { onboardingState, isLoading, data } = usePlayerOnboardingState(isAuthenticated && isPlayer)

  // ── Loading ───────────────────────────────────────────────────────────────────
  if (authLoading || (isAuthenticated && isPlayer && isLoading)) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-md">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-on-surface-variant">A verificar perfil...</span>
      </div>
    )
  }

  // ── Auth ──────────────────────────────────────────────────────────────────────
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />
  if (!isPlayer)        return <Navigate to={ROUTES.DASHBOARD} replace />

  const pathname = location.pathname

  // ── /complete: always render — end-of-flow page handles its own navigation ───
  if (pathname === ROUTES.ONBOARDING_PLAYER_COMPLETE) {
    return <>{children}</>
  }

  // ── Fully complete: redirect to portal (skip /complete to avoid loop) ─────────
  if (onboardingState?.isComplete) {
    return <Navigate to={ROUTES.DASHBOARD_PLAYER} replace />
  }

  // ── Welcome/entry page: always allow; the user hasn't started yet ─────────────
  if (pathname === ROUTES.ONBOARDING_PLAYER) {
    return <>{children}</>
  }

  // ── Enforce sequential step access ───────────────────────────────────────────
  // Find which step this pathname corresponds to.
  const targetStep = (Object.entries(STEP_ROUTE_MAP) as [NonNullable<OnboardingStep>, string][])
    .find(([, route]) => route === pathname)?.[0]

  if (targetStep) {
    const targetIndex  = STEP_ORDER.indexOf(targetStep)

    // Determine the furthest step the user is allowed to access.
    // The backend's next_step is the first *incomplete* step, so the user
    // may access anything UP TO (but not past) that step.
    const nextStep     = (onboardingState?.nextStep ?? 'account') as NonNullable<OnboardingStep>
    const allowedIndex = STEP_ORDER.indexOf(nextStep)

    // If the user tries to jump ahead of what's allowed, redirect them to the
    // correct next incomplete step.
    if (targetIndex > allowedIndex) {
      const redirectRoute = onboardingState?.nextRoute ?? ROUTES.ONBOARDING_PLAYER
      return <Navigate to={redirectRoute} replace />
    }
  }

  return <>{children}</>
}
