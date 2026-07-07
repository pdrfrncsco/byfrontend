export type TransferStatus = 'pending' | 'approved' | 'rejected' | 'completed' | 'cancelled'

export interface Transfer {
  id: string
  player: string
  player_name: string
  player_slug?: string
  from_club?: string | null
  from_club_name?: string | null
  to_club: string
  to_club_name: string
  competition?: string | null
  joined_date?: string | null
  shirt_number?: number | null
  fee?: string | null
  status: TransferStatus
  status_label?: string
  request_date?: string
  completed_date?: string | null
  rejection_reason?: string | null
}

export interface TransferListParams {
  page?: number
  page_size?: number
  status?: TransferStatus | string
  player_id?: string
  from_club_id?: string
  to_club_id?: string
}
