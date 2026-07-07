/**
 * Organization types — unified and de-duplicated.
 * Matches backend OrganizationSerializer where possible (snake_case).
 */

export type OrganizationType = 'federation' | 'association' | 'league' | 'organizer' | 'academy'
export type OrganizationStatus = 'pending' | 'active' | 'suspended' | 'closed'

export interface Organization {
  id: string
  name: string
  slug: string
  type: OrganizationType
  type_label?: string
  logo?: string | null
  logo_url?: string | null
  banner_url?: string | null
  primary_color?: string | null
  secondary_color?: string | null
  country: string
  city?: string | null
  location?: string
  email?: string | null
  phone?: string | null
  website?: string | null
  description?: string | null
  is_public?: boolean
  is_verified?: boolean
  verified?: boolean
  status?: OrganizationStatus
  status_label?: string
  subdomain?: string | null
  language?: string | null
  timezone?: string | null
  created_at?: string
  updated_at?: string
}

export interface PublicOrganization extends Organization {
  active_subscribers?: number
  last_activity?: string | null
}

export interface OrganizationKpis {
  total_games: number
  total_goals: number
  goals_per_game: number
  live_games: number
  scheduled_games: number
  active_subscribers: number
  total_tournaments: number
  active_tournaments: number
  upcoming_tournaments: number
  completed_tournaments: number
  total_clubs: number
}

export interface OrganizationHistoryEntry {
  season: string
  tournament_name: string
  tournament_id: string
  tournament_format: string
  winner_club_name: string
  runner_up_club_name: string
  winner_club_id: string
  runner_up_club_id: string
}

export interface OrganizationListParams {
  search?: string
  type?: string
}

export interface OrganizationUpdateData {
  name?: string
  type?: OrganizationType | string
  primary_color?: string
  secondary_color?: string
  country?: string
  city?: string
  location?: string
  email?: string | null
  phone?: string | null
  website?: string | null
  description?: string | null
  is_public?: boolean
  language?: string
  timezone?: string
}

export interface OrganizationLaunchResult {
  organization: Organization
  competitions_activated: number
  portal_url: string | null
}

export interface OnboardingStatus {
  onboarding_required: boolean
  has_organization: boolean
  is_organization_admin: boolean
  competitions_count: number
  organization: Organization | null
}
