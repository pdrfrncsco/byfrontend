import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { useOnboardingStatus } from '@/modules/organizations'
import { ROUTES } from '@/constants/routes'

interface OnboardingGuardProps {
  children: ReactNode
}

/**
 * Protects onboarding wizard routes.
 * - Requires authentication (outer ProtectedRoute handles login redirect)
 * - Requires organization membership → otherwise register as org owner
 * - Blocks access when onboarding is already complete
 */
export function OnboardingGuard({ children }: OnboardingGuardProps) {
  const { isAuthenticated, user, loading: authLoading } = useAuth()
  
  // Onboarding is only relevant for organization owners, admins, or executives
  const deservesOnboardingCheck = isAuthenticated && user && (
    user.roles.includes('owner') || 
    user.roles.includes('admin') || 
    user.roles.includes('executive')
  )

  const { data, isLoading, isError } = useOnboardingStatus(Boolean(deservesOnboardingCheck))

  if (authLoading || (deservesOnboardingCheck && isLoading)) {
    return (
      <div className="min-h-screen bg-background text-on-surface flex items-center justify-center">
        A carregar...
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to={ROUTES.LOGIN} replace />
  }

  // If user doesn't belong to onboarding target roles, send them to dashboard
  if (!deservesOnboardingCheck) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  if (isError || !data?.has_organization) {
    return <Navigate to={ROUTES.REGISTER_ORGANIZATION} replace />
  }

  if (!data.onboarding_required) {
    return <Navigate to={ROUTES.DASHBOARD} replace />
  }

  return <>{children}</>
}
