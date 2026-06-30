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
