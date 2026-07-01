export type CompetitionType = 'league' | 'tournament' | 'cup'
export type CompetitionStatus = 'draft' | 'active' | 'completed'

export interface Competition {
  id: string
  name: string
  slug: string
  competition_type: CompetitionType
  type_label?: string
  season: string
  status: CompetitionStatus
  status_label?: string
  tenant?: string
  created_at?: string
  updated_at?: string
}

export interface CompetitionCreateData {
  name: string
  competition_type: CompetitionType
  season: string
  status?: CompetitionStatus
}

export interface CompetitionUpdateData {
  name?: string
  competition_type?: CompetitionType
  season?: string
  status?: CompetitionStatus
}

export type MatchStatus = 'scheduled' | 'live' | 'finished' | 'postponed' | 'cancelled'

export interface Match {
  id: string
  competition: string
  round_number: number
  home_club: string
  home_club_name: string
  home_club_logo: string | null
  away_club: string
  away_club_name: string
  away_club_logo: string | null
  match_date: string
  status: MatchStatus
  status_label: string
  home_score: number | null
  away_score: number | null
  venue: string | null
}

export interface Standing {
  id: string
  competition: string
  club: string
  club_name: string
  club_logo: string | null
  played: number
  won: number
  drawn: number
  lost: number
  goals_for: number
  goals_against: number
  goal_difference: number
  points: number
  position: number
}

export interface CompetitionRegistration {
  id: string
  competition: string
  club: string
  club_name: string
  club_logo: string | null
  registered_at: string
}

