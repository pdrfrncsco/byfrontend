import { Navigate } from 'react-router-dom'
import { useAuth } from '@/app/providers'
import { useOnboardingStatus } from '@/modules/organizations'
import { usePlayerOnboardingStatus } from '@/modules/players'
import { ROUTES } from '@/constants/routes'

/**
 * Redirects organization admins/owners/executives with pending onboarding to the wizard.
 * Render inside dashboard (or other post-auth entry points).
 */
export function PendingOnboardingRedirect() {
  const { isAuthenticated, user } = useAuth()
  const deservesPlayerOnboardingCheck = Boolean(
    isAuthenticated && user && (user.roles.includes('player') || user.profileType === 'player'),
  )
  
  // Onboarding is only relevant for organization owners, admins, or executives
  const deservesOnboardingCheck = Boolean(
    isAuthenticated && user && !deservesPlayerOnboardingCheck && (
      user.roles.includes('owner') || 
      user.roles.includes('admin') || 
      user.roles.includes('executive')
    )
  )

  const { data, isLoading } = useOnboardingStatus(Boolean(deservesOnboardingCheck))
  const { data: playerData, isLoading: isPlayerLoading } = usePlayerOnboardingStatus(deservesPlayerOnboardingCheck)

  if (deservesPlayerOnboardingCheck) {
    if (isPlayerLoading) return null
    if (playerData?.onboarding_required) {
      const nextStep = playerData.next_step ?? 'welcome'
      const stepRoutes: Record<string, string> = {
        welcome: ROUTES.ONBOARDING_PLAYER,
        account: ROUTES.ONBOARDING_PLAYER,
        identity: ROUTES.ONBOARDING_PLAYER_IDENTITY,
        personal: ROUTES.ONBOARDING_PLAYER_PROFILE,
        profile: ROUTES.ONBOARDING_PLAYER_PROFILE,
        football: ROUTES.ONBOARDING_PLAYER_FOOTBALL,
        contact: ROUTES.ONBOARDING_PLAYER_CONTACT,
        guardian: ROUTES.ONBOARDING_PLAYER_GUARDIAN,
        club: ROUTES.ONBOARDING_PLAYER_CLUB,
        review: ROUTES.ONBOARDING_PLAYER_REVIEW,
      }
      const targetRoute = stepRoutes[nextStep] || ROUTES.ONBOARDING_PLAYER
      return <Navigate to={targetRoute} replace />
    }
    return null
  }

  if (!deservesOnboardingCheck || isLoading) return null

  if (data?.onboarding_required) {
    return <Navigate to={ROUTES.ONBOARDING} replace />
  }

  return null
}
