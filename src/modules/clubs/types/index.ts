// Types for Clubs module

export interface Club {
  id: string
  name: string
  slug?: string
  short_name?: string | null
  logo?: string | null
  primary_color?: string | null
  secondary_color?: string | null
  founded_year?: number | null
  stadium_name?: string | null
  stadium_capacity?: number | null
  country?: string
  city?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  description?: string | null
  is_public?: boolean
  is_verified?: boolean
  status?: string
  created_at?: string
  updated_at?: string
}

export interface ClubMember {
  id: string
  club: string
  user?: string | null
  full_name?: string | null
  role?: string
  jersey_number?: number | null
  position?: string | null
  is_active?: boolean
  joined_at?: string | null
  left_at?: string | null
}

export interface ClubKpis {
  squad_size: number
  staff_count: number
  total_matches: number
  wins: number
  draws: number
  losses: number
  goals_for: number
  goals_against: number
  clean_sheets: number
  active_competitions: number
}

