// Players module — TypeScript types

export type PlayerPosition =
  | 'gk'
  | 'cb' | 'lb' | 'rb' | 'lwb' | 'rwb'
  | 'cm' | 'cdm' | 'cam' | 'lm' | 'rm' | 'lw' | 'rw'
  | 'st' | 'cf'
  | 'multiple'

export type PlayerStatus = 'active' | 'retired' | 'banned' | 'inactive'

export type PlayerFoot = 'left' | 'right' | 'both'

// ─── Player Base Types ───────────────────────────────────────────────────────

export interface Player {
  id: string
  slug: string
  first_name: string
  last_name: string
  full_name: string
  email: string | null
  date_of_birth: string | null
  age: number | null
  nationality: string | null
  height_cm: number | null
  weight_kg: number | null
  foot: PlayerFoot | null
  primary_position: PlayerPosition
  position_label: string
  shirt_number: number | null
  bio: string | null
  avatar: string | null
  status: PlayerStatus
  status_label: string
  total_matches: number
  total_goals: number
  total_assists: number
  created_at: string
}

export interface PlayerCareerEntry {
  club: string
  club_slug: string
  joined: string
  left: string | null
  status: string
  matches: number
  goals: number
  assists: number
}

export interface PlayerCurrentClub {
  id: string
  name: string
  slug: string
  registered_since: string
  shirt_number: number | null
}

export interface PlayerDetail extends Player {
  phone: string | null
  updated_at: string
  current_club: PlayerCurrentClub | null
  career_history: PlayerCareerEntry[]
  videos: PlayerVideo[]
  documents: PlayerDocument[]
  achievements: PlayerAchievement[]
}

export interface PlayerRegistration {
  id: string
  player: string
  player_name: string
  player_slug: string
  shirt_number: number | null
  position: PlayerPosition
  position_label: string
  joined_date: string
  left_date: string | null
  status: string
  status_label: string
  matches_played: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
}

export interface PlayerListParams {
  page?: number
  page_size?: number
  position?: PlayerPosition
  nationality?: string
}

export interface PlayerListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Player[]
}

// ─── Player Document Types ───────────────────────────────────────────────────

export type DocumentCategory =
  | 'contract'
  | 'passport'
  | 'medical'
  | 'license'
  | 'certificate'
  | 'transfer'
  | 'insurance'
  | 'other'

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired'

export interface PlayerDocument {
  id: string
  title: string
  category: DocumentCategory
  category_label: string
  description: string | null
  asset_url: string | null
  status: DocumentStatus
  status_label: string
  valid_from: string | null
  valid_until: string | null
  is_valid: boolean
  club: string | null
  club_name: string | null
  is_private: boolean
  uploaded_by: string | null
  uploaded_by_name: string | null
  verified_by: string | null
  verified_by_name: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface PlayerDocumentCreate {
  title: string
  category: DocumentCategory
  description?: string
  document?: File
  asset?: string
  valid_from?: string
  valid_until?: string
  club?: string
  is_private?: boolean
}

export interface PlayerDocumentUpdate {
  title?: string
  category?: DocumentCategory
  description?: string
  valid_from?: string
  valid_until?: string
  is_private?: boolean
}

// ─── Player Video Types ──────────────────────────────────────────────────────

export type VideoType = 'highlights' | 'skills' | 'interview' | 'match_clip' | 'training' | 'other'

export type VideoStatus = 'draft' | 'published' | 'archived'

export interface PlayerVideoMatchInfo {
  id: string
  home_club: string
  away_club: string
  date: string
  competition: string | null
}

export interface PlayerVideo {
  id: string
  title: string
  description: string | null
  video_type: VideoType
  video_type_label: string
  url: string | null
  thumbnail_url: string | null
  thumbnail: string | null
  video_url: string | null
  media_asset: string | null
  duration_seconds: number | null
  status: VideoStatus
  status_label: string
  is_featured: boolean
  order: number
  match: string | null
  match_info: PlayerVideoMatchInfo | null
  created_at: string
  updated_at: string
}

export interface PlayerVideoCreate {
  title: string
  description?: string
  video_type: VideoType
  video_url?: string
  thumbnail_url?: string
  video?: File
  media_asset?: string
  match?: string
  is_featured?: boolean
  order?: number
}

export interface PlayerVideoUpdate {
  title?: string
  description?: string
  video_type?: VideoType
  video_url?: string
  thumbnail_url?: string
  media_asset?: string
  match?: string
  is_featured?: boolean
  order?: number
  status?: VideoStatus
}

// ─── Player Achievement Types ────────────────────────────────────────────────

export type AchievementType =
  | 'league_title'
  | 'cup_title'
  | 'super_cup'
  | 'tournament'
  | 'international_club'
  | 'top_scorer'
  | 'best_player'
  | 'mvp'
  | 'best_goalkeeper'
  | 'best_young_player'
  | 'golden_boot'
  | 'golden_ball'
  | 'milestone_100_goals'
  | 'milestone_500_appearances'
  | 'milestone_100_caps'
  | 'national_team_cap'
  | 'world_cup'
  | 'continental_cup'
  | 'olympics'
  | 'other'

export type AchievementLevel = 'club' | 'national' | 'continental' | 'international' | 'world'

export interface PlayerAchievement {
  id: string
  title: string
  achievement_type: AchievementType
  achievement_type_label: string
  level: AchievementLevel
  level_label: string
  description: string | null
  date_achieved: string | null
  year: number | null
  season: string | null
  competition: string | null
  competition_name: string | null
  club: string | null
  club_name: string | null
  trophy_image: string | null
  certificate_url: string | null
  stats_snapshot: Record<string, unknown> | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface PlayerAchievementCreate {
  title: string
  achievement_type: AchievementType
  level: AchievementLevel
  description?: string
  date_achieved?: string
  season?: string
  competition?: string
  club?: string
  trophy_image?: string
  certificate_url?: string
  stats_snapshot?: Record<string, unknown>
}

export interface PlayerAchievementUpdate {
  title?: string
  achievement_type?: AchievementType
  level?: AchievementLevel
  description?: string
  date_achieved?: string
  season?: string
  competition?: string
  club?: string
  trophy_image?: string
  certificate_url?: string
  stats_snapshot?: Record<string, unknown>
}

// ─── Player Create/Update Types ──────────────────────────────────────────────

export interface PlayerCreate {
  first_name: string
  last_name: string
  date_of_birth?: string
  nationality?: string
  primary_position?: PlayerPosition
  email?: string
  phone?: string
  height_cm?: number
  weight_kg?: number
  foot?: PlayerFoot
  bio?: string
  avatar?: string
}

export interface PlayerUpdate {
  first_name?: string
  last_name?: string
  date_of_birth?: string
  nationality?: string
  primary_position?: PlayerPosition
  email?: string
  phone?: string
  height_cm?: number
  weight_kg?: number
  foot?: PlayerFoot
  bio?: string
  avatar?: string
  status?: PlayerStatus
}

export interface PlayerRegisterPayload {
  club_id: string
  joined_date: string
  shirt_number?: number
  competition_id?: string
}

export type PlayerRegistrationRequestStatus = 'pending' | 'approved' | 'rejected'

export interface PlayerRegistrationRequest {
  id: string
  player: string
  player_name: string
  player_slug: string
  player_position_label?: string
  club: string
  club_name: string
  club_slug: string
  tenant: string
  competition?: string | null
  competition_name?: string | null
  submitted_by?: string | null
  submitted_by_email?: string | null
  joined_date: string
  shirt_number?: number | null
  status: PlayerRegistrationRequestStatus | string
  status_label?: string
  review_notes?: string
  reviewed_by?: string | null
  reviewed_by_email?: string | null
  reviewed_at?: string | null
  registration?: string | null
  created_at?: string
  updated_at?: string
}

export interface PlayerRegistrationRequestCreate {
  club_id: string
  joined_date: string
  shirt_number?: number
  competition_id?: string
}

export interface PlayerRegistrationRequestReview {
  approve: boolean
  review_notes?: string
}
