import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { useOnboardingStatus } from '@/modules/organizations'
import { ROUTES } from '@/constants/routes'

/**
 * Redirects organization admins with pending onboarding to the wizard.
 * Render inside dashboard (or other post-auth entry points).
 */
export function PendingOnboardingRedirect() {
  const { isAuthenticated } = useAuth()
  const { data, isLoading } = useOnboardingStatus(isAuthenticated)

  if (!isAuthenticated || isLoading) return null

  if (data?.onboarding_required) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return null
}
