import { createWizardStore } from '@/components/ui/wizard'

export interface ClubOnboardingData {
  organization_slug?: string
  name?: string
  short_name?: string
  founded_year?: number | string
  country?: string
  city?: string
  email?: string
  phone?: string
  website?: string
  description?: string
  primary_color?: string
  secondary_color?: string
  stadium_name?: string
  stadium_capacity?: number | string
}

export const useClubWizard = createWizardStore<ClubOnboardingData>('club')
