export interface Organization {
  id: string
  name: string
  slug: string
  type: 'federation' | 'association' | 'club' | 'academy'
  logo: string | null
  logoUrl: string
  primary_color: string | null
  secondary_color: string | null
  country: string
  location: string
  email: string | null
  phone: string | null
  website: string | null
  description: string | null
  is_public: boolean
  verified: boolean
}

export interface PublicOrganization extends Organization {
  activeTournaments: number
  totalClubs: number
  last_activity: string | null
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
  type?: string
  primary_color?: string
  secondary_color?: string
  country?: string
  location?: string
  email?: string
  phone?: string
  website?: string
  description?: string
  is_public?: boolean
}
