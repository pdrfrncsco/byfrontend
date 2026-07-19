export type TransferType = 'permanent' | 'loan' | 'free_agent'
export type TransferStatus = 'pending' | 'approved' | 'completed' | 'cancelled' | 'returned'

export interface TransferPlayer {
  id: string
  full_name: string
  primary_position?: string | null
  date_of_birth?: string | null
  slug?: string | null
}

export interface TransferClub {
  id: string
  name: string
  slug: string
}

export interface Transfer {
  id: string
  player: TransferPlayer
  from_club?: TransferClub | null
  to_club: TransferClub
  transfer_type: TransferType
  transfer_type_display?: string
  transfer_date: string
  status: TransferStatus
  status_display?: string
  loan_end_date?: string | null
  loan_return_mandatory?: boolean
  fee?: string | number | null
  salary_contribution?: boolean
  approved_at?: string | null
  completed_at?: string | null
  cancelled_at?: string | null
  rejected_at?: string | null
  returned_at?: string | null
  rejection_reason?: string | null
  notes?: string
  created_at?: string
  updated_at?: string
}

export interface TransferListParams {
  page?: number
  page_size?: number
  club_id?: string
  player_id?: string
  from_club_id?: string
  to_club_id?: string
  status?: TransferStatus | string
  transfer_type?: TransferType | string
}

export interface CreateTransferPayload {
  player_id: string
  to_club_id: string
  from_club_id?: string | null
  transfer_type?: TransferType
  transfer_date: string
  loan_end_date?: string | null
  salary_contribution?: boolean
  fee?: number | string | null
  notes?: string
}

export interface PaginatedTransfers {
  count: number
  next: string | null
  previous: string | null
  results: Transfer[]
}

/** Flat list shape returned by TransferListSerializer — normalised in the API layer. */
export interface TransferListFlat {
  id: string
  player_name: string
  from_club_name?: string | null
  to_club_name: string
  transfer_type: TransferType
  transfer_type_display?: string
  transfer_date: string
  status: TransferStatus
  status_display?: string
  loan_end_date?: string | null
  fee?: string | number | null
}
