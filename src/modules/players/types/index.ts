// Players module — TypeScript types

export type PlayerPosition =
  | 'gk'
  | 'cb' | 'lb' | 'rb' | 'lwb' | 'rwb'
  | 'cm' | 'cdm' | 'cam' | 'lm' | 'rm' | 'lw' | 'rw'
  | 'st' | 'cf'
  | 'multiple'

export type PlayerStatus = 'active' | 'retired' | 'banned' | 'inactive'

export type PlayerFoot = 'left' | 'right' | 'both'

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
