import client from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type { LineupSubmission, LineupSubmissionData } from '../types'

export type LineupSubmissionRequest = LineupSubmissionData & {
  club_id?: string
}

function unwrap<T>(payload: ApiResponse<T> | T): T {
  return (payload && typeof payload === 'object' && 'data' in payload && 'success' in payload)
    ? payload.data
    : payload as T
}

export const lineupApi = {
  async list(matchId: string): Promise<LineupSubmission[]> {
    const response = await client.get<unknown>(`/competitions/matches/${matchId}/lineups/`)
    const raw = unwrap(response.data as ApiResponse<unknown> | unknown)
    if (Array.isArray(raw)) return raw as LineupSubmission[]
    if (raw && typeof raw === 'object' && Array.isArray((raw as { lineups?: unknown[] }).lineups)) {
      return (raw as { lineups: LineupSubmission[] }).lineups
    }
    return []
  },

  async get(matchId: string, clubId: string): Promise<LineupSubmission> {
    const response = await client.get<ApiResponse<LineupSubmission>>(
      `/competitions/matches/${matchId}/lineups/${clubId}/`
    )
    return unwrap(response.data)
  },

  async submit(matchId: string, data: LineupSubmissionRequest): Promise<LineupSubmission> {
    const response = await client.post<ApiResponse<LineupSubmission>>(
      `/competitions/matches/${matchId}/lineups/`,
      data
    )
    return unwrap(response.data)
  },

  async confirm(matchId: string, clubId: string): Promise<LineupSubmission> {
    const response = await client.post<ApiResponse<LineupSubmission>>(
      `/competitions/matches/${matchId}/lineups/confirm/`,
      { club_id: clubId }
    )
    return unwrap(response.data)
  },

  async lock(matchId: string, clubId?: string): Promise<LineupSubmission> {
    const response = await client.post<ApiResponse<LineupSubmission> | LineupSubmission>(
      `/competitions/matches/${matchId}/lineups/lock/`,
      clubId ? { club_id: clubId } : undefined
    )
    const data = unwrap(response.data)
    if (data && typeof data === 'object' && 'lineup' in data) {
      return (data as { lineup: LineupSubmission }).lineup
    }
    if (data && typeof data === 'object' && 'lineups' in data) {
      return (data as { lineups: LineupSubmission[] }).lineups[0]
    }
    return data as LineupSubmission
  },
}
