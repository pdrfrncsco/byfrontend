import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { usePlayerOnboardingState } from '@/modules/players'
import { ROUTES } from '@/constants/routes'

interface PlayerOnboardingGuardProps {
  children: ReactNode
}

/**
 * Guards the player onboarding flow:
 * - Redirects unauthenticated users to login
 * - Redirects non-players to main dashboard
 * - On the /complete route: always renders (no redirect loop)
 * - On the /review route: only renders when steps 1+2 are done; does NOT redirect to complete
 * - Prevents skipping steps: redirects back to the correct incomplete step
 */
export function PlayerOnboardingGuard({ children }: PlayerOnboardingGuardProps) {
  const location = useLocation()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const isPlayer = Boolean(user?.roles.includes('player') || user?.profileType === 'player')
  const { onboardingState, isLoading, data } = usePlayerOnboardingState(isAuthenticated && isPlayer)

  // ── Loading states ────────────────────────────────────────────────────────────
  if (authLoading || (isAuthenticated && isPlayer && isLoading)) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex flex-col items-center justify-center gap-md">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        <span className="text-sm text-on-surface-variant">A verificar perfil...</span>
      </div>
    )
  }

  // ── Auth checks ───────────────────────────────────────────────────────────────
  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!isPlayer) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  const pathname = location.pathname

  // ── /complete: always render — never redirect (prevents loop) ─────────────────
  // The complete page manages its own navigation after showing success.
  if (pathname === ROUTES.ONBOARDING_PLAYER_COMPLETE) {
    return <>{children}</>
  }

  // ── /review: render if steps 1+2 done; redirect if not — but never to /complete
  // The review page itself shows the "Entrar no portal" CTA when everything is done.
  if (pathname === ROUTES.ONBOARDING_PLAYER_REVIEW) {
    const hasBasicInfo = Boolean(data?.has_basic_info ?? data?.personal_complete)
    const hasFootballInfo = Boolean(data?.has_football_info ?? data?.football_complete)
    if (!hasBasicInfo) return <Navigate to={ROUTES.ONBOARDING_PLAYER_PROFILE} replace />
    if (!hasFootballInfo) return <Navigate to={ROUTES.ONBOARDING_PLAYER_FOOTBALL} replace />
    // Both done → let /review render; user decides when to proceed
    return <>{children}</>
  }

  // ── Welcome page: entry point ─────────────────────────────────────────────────
  if (pathname === ROUTES.ONBOARDING_PLAYER) {
    // Already fully complete → go to player dashboard, not to /complete
    if (onboardingState?.isComplete) {
      return <Navigate to={ROUTES.DASHBOARD_PLAYER} replace />
    }
    return <>{children}</>
  }

  // ── For profile + football: if fully complete, go to dashboard (not /complete) ─
  if (onboardingState?.isComplete) {
    return <Navigate to={ROUTES.DASHBOARD_PLAYER} replace />
  }

  // ── Step access control: prevent jumping ahead ─────────────────────────────────
  const hasBasicInfo = Boolean(data?.has_basic_info ?? data?.personal_complete)

  // Trying to access Football step without completing Profile
  if (pathname === ROUTES.ONBOARDING_PLAYER_FOOTBALL && !hasBasicInfo) {
    return <Navigate to={ROUTES.ONBOARDING_PLAYER_PROFILE} replace />
  }

  return <>{children}</>
}
