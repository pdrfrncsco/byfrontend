// Types for Clubs module

export interface ClubListParams {
  search?: string
  status?: ClubStatus
  organization?: string
  tenant?: string
  page?: number
  page_size?: number
}

export type ClubStatus = 'active' | 'suspended' | 'inactive'

export interface Club {
  id: string
  name: string
  slug: string
  short_name?: string | null
  tenant?: string
  tenant_name?: string
  tenant_slug?: string
  logo_url?: string | null
  primary_color?: string | null
  secondary_color?: string | null
  founded_year?: number | null
  stadium_name?: string | null
  stadium_capacity?: number | null
  country?: string | null
  city?: string | null
  location?: string | null
  email?: string | null
  phone?: string | null
  website?: string | null
  description?: string | null
  is_public?: boolean
  is_verified?: boolean
  status?: ClubStatus
  status_label?: string
  created_at?: string
  updated_at?: string
}

export type ClubMemberRole =
  | 'player'
  | 'coach'
  | 'assistant_coach'
  | 'manager'
  | 'physio'
  | 'staff'
  | 'president'

export interface ClubMember {
  id: string
  club: string
  user?: string | null
  full_name?: string | null
  display_name?: string
  role?: ClubMemberRole
  role_label?: string
  jersey_number?: number | null
  position?: string | null
  position_label?: string
  is_active?: boolean
  joined_at?: string | null
  left_at?: string | null
  created_at?: string
  updated_at?: string
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

export interface ClubSquadMember {
  id: string
  display_name: string
  jersey_number?: number | null
  position?: string | null
  position_label?: string | null
  joined_at?: string | null
}

export interface ClubStaffMember {
  id: string
  display_name: string
  role?: string | null
  role_label?: string | null
  joined_at?: string | null
}

export type ClubDocumentCategory = 'contract' | 'certificate' | 'license' | 'regulation' | 'other'

export interface ClubDocument {
  id: string
  club: string
  tenant?: string
  title: string
  category: ClubDocumentCategory
  category_label?: string
  description?: string
  asset?: string | null
  asset_url?: string
  uploaded_by?: string | null
  uploaded_by_email?: string | null
  is_public: boolean
  valid_until?: string | null
  created_at?: string
  updated_at?: string
}

export interface ClubDocumentCreateData {
  title: string
  category: ClubDocumentCategory
  description?: string
  document: File
  is_public?: boolean
  valid_until?: string
}

export type ClubSponsorType = 'main' | 'official' | 'partner' | 'technical' | 'media' | 'other'

export interface ClubSponsor {
  id: string
  club: string
  tenant?: string
  name: string
  sponsor_type: ClubSponsorType
  sponsor_type_label?: string
  description?: string
  website?: string | null
  logo_asset?: string | null
  logo_url?: string
  uploaded_by?: string | null
  uploaded_by_email?: string | null
  is_active: boolean
  sort_order?: number
  created_at?: string
  updated_at?: string
}

export interface ClubSponsorCreateData {
  name: string
  sponsor_type?: ClubSponsorType
  description?: string
  website?: string
  logo?: File
  is_active?: boolean
  sort_order?: number
}

export type {
  TransferPlayer,
  TransferClub,
  TransferType,
  TransferStatus,
  Transfer,
  TransferListParams,
} from '@/modules/transfers/types'

export type { CreateTransferPayload as TransferCreateData } from '@/modules/transfers/types'

export interface PaginatedResponse<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface ClubCreateData {
  name: string
  short_name?: string
  founded_year?: number
  stadium_name?: string
  stadium_capacity?: number
  country?: string
  city?: string
  email?: string
  phone?: string
  website?: string
  description?: string
  primary_color?: string
  secondary_color?: string
  is_public?: boolean
}

export type ClubUpdateData = Partial<ClubCreateData>

export interface ClubMemberCreateData {
  user?: string
  full_name?: string
  role?: ClubMemberRole
  jersey_number?: number
  position?: string
  is_active?: boolean
}

export type ClubMemberUpdateData = Partial<ClubMemberCreateData>
