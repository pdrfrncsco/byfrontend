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

export type EventType =
  | 'goal'
  | 'own_goal'
  | 'yellow_card'
  | 'red_card'
  | 'yellow_red'
  | 'substitution_in'
  | 'substitution_out'
  | 'penalty_scored'
  | 'penalty_missed'

export interface MatchEvent {
  id: string
  event_type: EventType
  event_type_label: string
  minute: number
  extra_time: boolean
  player: string | null
  player_name: string | null
  player_off: string | null
  player_off_name: string | null
  club: string
  club_name: string
  club_logo: string | null
  notes: string
  created_at: string
}

export interface MatchEventCreateData {
  event_type: EventType
  minute: number
  extra_time?: boolean
  club: string
  player?: string | null
  player_off?: string | null
  notes?: string
}

export interface PlayerStats {
  player_id: string
  player__first_name: string
  player__last_name: string
  player__avatar: string | null
  club_id: string
  club__name: string
  goals: number
  own_goals: number
  yellow_cards: number
  red_cards: number
  appearances: number
}
