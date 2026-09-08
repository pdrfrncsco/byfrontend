import { createWizardStore } from '@/components/ui/wizard'
import type { PlayerPosition, PlayerFoot } from '../types'

export interface PlayerOnboardingData {
  first_name?: string
  last_name?: string
  date_of_birth?: string
  nationality?: string
  bio?: string
  primary_position?: PlayerPosition
  height_cm?: number | string
  weight_kg?: number | string
  foot?: PlayerFoot
  phone?: string
  email?: string
  emergency_contact_name?: string
  emergency_contact_phone?: string
  document_type?: string
  document_number?: string
  expiration_date?: string
  guardian_name?: string
  guardian_relation?: string
  guardian_phone?: string
  guardian_email?: string
  club_id?: string
  organization_slug?: string
}

export const usePlayerWizard = createWizardStore<PlayerOnboardingData>('player')
