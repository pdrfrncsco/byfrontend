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
  is_subscribed?: boolean
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

export interface OrganizationClub {
  id: string
  name: string
  slug: string
  short_name?: string | null
  logo_url?: string | null
  primary_color?: string | null
  city?: string | null
  country?: string
  location?: string
  stadium_name?: string | null
  status?: string
  status_label?: string
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

// ── Phase C: Member Management ────────────────────────────────────────────────

export interface OrgMember {
  id: string
  user: { id: string; email: string; full_name: string }
  role: string
  is_active: boolean
  joined_at: string
}

export interface OrgMemberInviteData {
  email: string
  role?: string
}

// ── Phase C: Club Affiliation Requests ───────────────────────────────────────

export interface ClubAffiliationRequest {
  id: string
  name: string
  short_name?: string
  city?: string
  country?: string
  email?: string
  phone?: string
  stadium_name?: string
  status: string
  status_label?: string
  submitted_by_email?: string
  review_notes?: string
  reviewed_by_email?: string
  reviewed_at?: string
  created_at?: string
}

export interface ClubAffiliationCreateData {
  name: string
  short_name?: string
  founded_year?: number | null
  city?: string | null
  country?: string
  email?: string | null
  phone?: string | null
  website?: string | null
  description?: string | null
  primary_color?: string
  secondary_color?: string
  stadium_name?: string | null
  stadium_capacity?: number | null
}

export interface ClubAffiliationReviewData {
  approve: boolean
  review_notes?: string
}
