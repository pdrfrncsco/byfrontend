import { organizationApi } from '@/modules/organizations'

/**
 * Decide where to send the user immediately after login/register.
 */
export async function resolvePostAuthRedirect(): Promise<string> {
  try {
    const status = await organizationApi.getOnboardingStatus()
    if (status.onboarding_required) {
      return '/onboarding'
    }
    return '/dashboard'
  } catch {
    return '/dashboard'
  }
}
