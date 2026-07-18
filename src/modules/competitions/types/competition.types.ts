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

// ─── Lineup Types ──────────────────────────────────────────────────────────

export type LineupStatus = 'draft' | 'submitted' | 'confirmed' | 'locked'
export type LineupPlayerStatus = 'starter' | 'substitute'

export interface LineupPlayer {
  id: string
  player: {
    id: string
    full_name: string
    position: string
    date_of_birth?: string
    nationality?: string
  }
  player_id: string
  status: LineupPlayerStatus
  status_display?: string
  position: string
  position_display?: string
  shirt_number: number
  is_captain: boolean
  is_goalkeeper: boolean
  formation_position?: number
  minutes_played?: number
  substituted_in_minute?: number
  substituted_out_minute?: number
}

export interface LineupSubmission {
  id: string
  match: string
  club: string
  club_name?: string
  match_str?: string
  formation?: string
  status: LineupStatus
  status_display?: string
  submitted_at?: string
  submitted_by?: string
  confirmed_at?: string
  locked_at?: string
  lineup_players?: LineupPlayer[]
  starters?: LineupPlayer[]
  substitutes?: LineupPlayer[]
  created_at?: string
  updated_at?: string
}

export interface LineupSubmissionData {
  formation?: string
  players: {
    player_id: string
    status: LineupPlayerStatus
    position: string
    shirt_number: number
    is_captain?: boolean
    is_goalkeeper?: boolean
    formation_position?: number
  }[]
}

// ─── Match Report Types ────────────────────────────────────────────────────

export type GoalType = 'normal' | 'penalty' | 'own_goal'
export type MatchReportStatus = 'draft' | 'ongoing' | 'completed' | 'validated'

export interface Goal {
  id: string
  match: string
  player: string
  player_name?: string
  club: string
  minute: number
  goal_type: GoalType
  goal_type_display?: string
  assist_player?: string | null
  created_at?: string
}

export interface GoalCreateData {
  player_id: string
  club_id: string
  minute: number
  goal_type: GoalType
  assist_player_id?: string | null
}

export interface MatchStats {
  id: string
  match: string
  club: string
  possession?: number
  possession_display?: string
  shots_on_goal?: number
  shots_off_goal?: number
  passes?: number
  passes_accuracy?: number
  fouls?: number
  yellow_cards?: number
  red_cards?: number
  corner_kicks?: number
  created_at?: string
  updated_at?: string
}

export interface MatchReport {
  id: string
  match: string
  status: MatchReportStatus
  status_display?: string
  home_score: number
  away_score: number
  home_goals_against?: number
  away_goals_against?: number
  match_duration?: number
  goals?: Goal[]
  home_stats?: MatchStats | null
  away_stats?: MatchStats | null
  created_at?: string
  updated_at?: string
}

export interface MatchReportCreateData {
  home_score: number
  away_score: number
  match_duration?: number
}

// ─── Suspension & Fair Play Types ──────────────────────────────────────────

export type SuspensionType = 'yellow_cards' | 'red_card' | 'double_yellow'

export interface Suspension {
  id: string
  player: string
  player_name?: string
  club: string
  club_name?: string
  competition: string
  suspension_type: SuspensionType
  matches_total: number
  matches_served: number
  matches_remaining: number
  reason?: string
  is_active: boolean
  cancelled_at?: string
  created_at?: string
}

export interface FairPlayRanking {
  id: string
  club: string
  club_name: string
  club_logo?: string | null
  competition: string
  points: number
  yellow_cards: number
  red_cards: number
  fair_play_score: number
  position: number
}

// ─── Rankings Types ────────────────────────────────────────────────────────

export interface TopScorer {
  player_id: string
  player_name: string
  player_avatar?: string | null
  club_id: string
  club_name: string
  club_logo?: string | null
  goals: number
  penalties?: number
  assists?: number
  matches_played?: number
}

export interface SeasonRanking {
  player_id: string
  player_name: string
  club_id: string
  club_name: string
  total_goals: number
  total_assists: number
  total_matches: number
  total_yellow_cards: number
  total_red_cards: number
  mvp_count?: number
}

// ─── Regulation Types ──────────────────────────────────────────────────────

export type RegulationStatus = 'draft' | 'published' | 'archived'

export interface CompetitionRegulation {
  id: string
  competition: string
  title: string
  summary?: string
  version: string
  status: RegulationStatus
  status_label?: string
  document?: string | null
  published_at?: string | null
  created_at?: string
  updated_at?: string
}

export interface CompetitionRegulationCreateData {
  title: string
  summary?: string
  version?: string
  status?: RegulationStatus
  document?: File | string
}

export interface ManualSuspensionCreateData {
  player: string
  club: string
  suspension_type: SuspensionType
  matches_suspended: number
  effective_from: string
  reason?: string
}

// ─── Utility Types ─────────────────────────────────────────────────────────

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface CompetitionListParams {
  page?: number
  page_size?: number
  search?: string
  competition_type?: CompetitionType
  status?: CompetitionStatus
  season?: string
}

export interface MatchListParams {
  competition_id: string
  status?: MatchStatus
  round_number?: number
}
