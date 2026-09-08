import { createWizardStore } from '@/components/ui/wizard'
import type { OrganizationOnboardingData } from '../types/onboarding.types'

export const useOrganizationWizard = createWizardStore<OrganizationOnboardingData>('organization')
