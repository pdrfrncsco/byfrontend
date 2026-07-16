import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { useOnboardingStatus } from '@/modules/organizations'
import { ROUTES } from '@/constants/routes'

/**
 * Redirects organization admins/owners/executives with pending onboarding to the wizard.
 * Render inside dashboard (or other post-auth entry points).
 */
export function PendingOnboardingRedirect() {
  const { isAuthenticated, user } = useAuth()
  
  // Onboarding is only relevant for organization owners, admins, or executives
  const deservesOnboardingCheck = isAuthenticated && user && (
    user.roles.includes('owner') || 
    user.roles.includes('admin') || 
    user.roles.includes('executive')
  )

  const { data, isLoading } = useOnboardingStatus(Boolean(deservesOnboardingCheck))

  if (!deservesOnboardingCheck || isLoading) return null

  if (data?.onboarding_required) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return null
}
