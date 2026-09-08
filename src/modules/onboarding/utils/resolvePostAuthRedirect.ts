import { organizationApi } from '@/modules/organizations'
import { getPlayerOnboardingStatus } from '@/modules/players'
import { ROUTES } from '@/constants/routes'
import type { User } from '@/types'

/**
 * Decide where to send the user immediately after login/register.
 */
export async function resolvePostAuthRedirect(user?: User): Promise<string> {
  const roles = user?.roles ?? []
  const isPlayer = user?.profile_type === 'player' || user?.profileType === 'player' || roles.includes('player')
  const isClubAdmin = roles.includes('club_admin') || roles.includes('club_manager')

  if (isPlayer) {
    try {
      const status = await getPlayerOnboardingStatus()
      if (status.onboarding_required) {
        const nextStep = status.next_step ?? 'welcome'
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
        return stepRoutes[nextStep] || ROUTES.ONBOARDING_PLAYER
      }
      return ROUTES.DASHBOARD_PLAYER
    } catch {
      return ROUTES.DASHBOARD_PLAYER
    }
  }

  if (isClubAdmin) {
    return ROUTES.CLUB_ONBOARDING
  }

  try {
    const status = await organizationApi.getOnboardingStatus()
    if (status.onboarding_required) {
      return ROUTES.ONBOARDING
    }
    return ROUTES.DASHBOARD
  } catch {
    return ROUTES.DASHBOARD
  }
}
