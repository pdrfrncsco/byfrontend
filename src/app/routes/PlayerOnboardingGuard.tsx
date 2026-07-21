import { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { usePlayerOnboardingStatus } from '@/modules/players'
import { ROUTES } from '@/constants/routes'

interface PlayerOnboardingGuardProps {
  children: ReactNode
}

export function PlayerOnboardingGuard({ children }: PlayerOnboardingGuardProps) {
  const location = useLocation()
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  const isPlayer = Boolean(user?.roles.includes('player') || user?.profileType === 'player')
  const { data, isLoading } = usePlayerOnboardingStatus(isAuthenticated && isPlayer)

  if (authLoading || (isAuthenticated && isPlayer && isLoading)) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        A carregar...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  if (!isPlayer) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  if (data && !data.onboarding_required) {
    return <Navigate to={ROUTES.DASHBOARD_PLAYER} replace />
  }

  if (location.pathname === ROUTES.ONBOARDING_PLAYER && data?.next_step === 'football') {
    return <Navigate to={ROUTES.ONBOARDING_PLAYER_FOOTBALL} replace />
  }

  return <>{children}</>
}
