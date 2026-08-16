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

  // ── Enforce step access: user can navigate to completed steps or the next pending step ──
  const targetStep = (Object.entries(STEP_ROUTE_MAP) as [NonNullable<OnboardingStep>, string][])
    .find(([, route]) => route === pathname)?.[0]

  if (targetStep && onboardingState?.nextStep) {
    const targetIndex = STEP_ORDER.indexOf(targetStep)
    const allowedIndex = STEP_ORDER.indexOf(onboardingState.nextStep)

    // Only block if trying to jump past the current incomplete step
    if (targetIndex > allowedIndex) {
      const redirectRoute = onboardingState.nextRoute ?? ROUTES.ONBOARDING_PLAYER
      return <Navigate to={redirectRoute} replace />
    }
  }

  return <>{children}</>
}
