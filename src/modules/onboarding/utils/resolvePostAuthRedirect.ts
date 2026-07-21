import { organizationApi } from '@/modules/organizations'
import { getPlayerOnboardingStatus } from '@/modules/players'
import { ROUTES } from '@/constants/routes'
import type { User } from '@/types'

/**
 * Decide where to send the user immediately after login/register.
 */
export async function resolvePostAuthRedirect(user?: User): Promise<string> {
  if (user?.profile_type === 'player') {
    try {
      const status = await getPlayerOnboardingStatus()
      return status.onboarding_required ? ROUTES.ONBOARDING_PLAYER : ROUTES.DASHBOARD_PLAYER
    } catch {
      return ROUTES.DASHBOARD_PLAYER
    }
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
