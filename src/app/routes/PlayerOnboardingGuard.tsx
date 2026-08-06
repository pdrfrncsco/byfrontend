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
 * - Redirects already-complete players to player dashboard
 * - Prevents skipping steps: if a user tries to access /football without completing /profile,
 *   they are redirected back to the correct step
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

  // ── Welcome page: always accessible (entry point of the flow) ─────────────────
  const isWelcomePath = location.pathname === ROUTES.ONBOARDING_PLAYER

  if (isWelcomePath) {
    // If already complete, send to dashboard
    if (onboardingState?.isComplete) {
      return <Navigate to={ROUTES.DASHBOARD_PLAYER} replace />
    }
    return <>{children}</>
  }

  // ── Onboarding complete: redirect away from any onboarding step ────────────────
  if (onboardingState?.isComplete) {
    return <Navigate to={ROUTES.ONBOARDING_PLAYER_COMPLETE} replace />
  }

  // ── Step access control: prevent jumping ahead ─────────────────────────────────
  const hasBasicInfo = Boolean(data?.has_basic_info)
  const hasFootballInfo = Boolean(data?.has_football_info)

  const pathname = location.pathname

  // Trying to access Football step without completing Profile
  if (
    pathname === ROUTES.ONBOARDING_PLAYER_FOOTBALL &&
    !hasBasicInfo
  ) {
    return <Navigate to={ROUTES.ONBOARDING_PLAYER_PROFILE} replace />
  }

  // Trying to access Review step without completing Profile or Football
  if (pathname === ROUTES.ONBOARDING_PLAYER_REVIEW) {
    if (!hasBasicInfo) return <Navigate to={ROUTES.ONBOARDING_PLAYER_PROFILE} replace />
    if (!hasFootballInfo) return <Navigate to={ROUTES.ONBOARDING_PLAYER_FOOTBALL} replace />
  }

  // Trying to access Complete page without finishing all steps
  if (pathname === ROUTES.ONBOARDING_PLAYER_COMPLETE) {
    if (!hasBasicInfo) return <Navigate to={ROUTES.ONBOARDING_PLAYER_PROFILE} replace />
    if (!hasFootballInfo) return <Navigate to={ROUTES.ONBOARDING_PLAYER_FOOTBALL} replace />
  }

  return <>{children}</>
}
