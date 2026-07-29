// src/modules/competitions/services/match.api.ts

import client from '@/lib/api-client'
import type { ApiResponse } from '@/types'
import type {
  Match,
  MatchStatus,
  MatchEvent,
  MatchLineup,
  LineupPlayer,
  MatchStats,
  TeamMatchStats,
  MatchEventFormData,
} from '../types'

// Helper function to map Match score from backend
export function mapMatchFromBackend(data: any): Match {
  if (!data) return data

  const score = (data.home_score !== undefined && data.home_score !== null) ||
                (data.away_score !== undefined && data.away_score !== null)
    ? {
        home: data.home_score ?? 0,
        away: data.away_score ?? 0,
        homeFirstHalf: data.home_first_half,
        awayFirstHalf: data.away_first_half,
        homePenalties: data.home_penalties,
        awayPenalties: data.away_penalties,
      }
    : undefined

  return {
    id: data.id,
    competitionId: data.competition,
    roundNumber: data.round_number,
    roundLabel: data.round_name || undefined,
    homeTeamId: data.home_club,
    homeTeamName: data.home_club_name,
    homeTeamLogo: data.home_club_logo || undefined,
    awayTeamId: data.away_club,
    awayTeamName: data.away_club_name,
    awayTeamLogo: data.away_club_logo || undefined,
    scheduledAt: data.match_date,
    venue: data.venue || undefined,
    status: data.status,
    score,
    
    // Legacy properties for backward compatibility
    ...data,
  }
}

// Helper function to map MatchEvent from backend
export function mapMatchEventFromBackend(data: any): MatchEvent {
  if (!data) return data

  const typeMapping: Record<string, string> = {
    'goal': 'goal',
    'own_goal': 'own_goal',
    'penalty_scored': 'penalty_goal',
    'penalty_missed': 'penalty_missed',
    'yellow_card': 'yellow_card',
    'red_card': 'red_card',
    'yellow_red': 'yellow_red_card',
    'substitution_in': 'substitution',
    'substitution_out': 'substitution',
  }

  const type = typeMapping[data.event_type] || data.event_type || 'goal'

  return {
    id: data.id,
    matchId: data.match || '',
    type: type as any,
    minute: data.minute,
    minuteExtra: data.minute_extra || undefined,
    period: data.period || (data.minute > 45 ? 'second_half' : 'first_half'),
    teamId: data.club,
    playerId: data.player || undefined,
    assistPlayerId: data.assist_player || undefined,
    substitutedPlayerId: data.player_off || undefined,
    description: data.notes || undefined,
    createdBy: data.created_by || 'system',
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    
    // Legacy fields
    ...data,
  }
}

// Helper function to map LineupPlayer from backend
export function mapLineupPlayerFromBackend(data: any): LineupPlayer {
  if (!data) return data

  let position: 'GK' | 'DF' | 'MF' | 'FW' = 'MF'
  const posUpper = (data.player?.position || data.position || '').toUpperCase()
  if (data.is_goalkeeper || posUpper === 'GK' || posUpper === 'GOLO') {
    position = 'GK'
  } else if (['DF', 'LD', 'LE', 'CB'].includes(posUpper)) {
    position = 'DF'
  } else if (['MF', 'MC', 'MD', 'ME', 'CM', 'DM', 'AM'].includes(posUpper)) {
    position = 'MF'
  } else if (['FW', 'PL', 'ST', 'CF', 'LW', 'RW'].includes(posUpper)) {
    position = 'FW'
  }

  return {
    playerId: data.player_id || data.player?.id || '',
    playerName: data.player?.full_name || '',
    playerNumber: data.shirt_number || 0,
    position,
    positionSpecific: data.position || undefined,
    eligible: data.eligible !== undefined ? data.eligible : true,
    eligibilityWarning: data.eligibility_warning || undefined,
    avatarUrl: data.player?.avatar || undefined,
    
    // Legacy fields
    ...data,
  }
}

// Helper function to map Lineup from backend
export function mapLineupFromBackend(data: any): MatchLineup {
  if (!data) return data

  const players = (data.lineup_players || []).map(mapLineupPlayerFromBackend)
  const startingXI = players.filter((p: any) => p.status === 'starter')
  const substitutes = players.filter((p: any) => p.status === 'substitute')

  return {
    matchId: data.match || '',
    teamId: data.club || '',
    formation: data.formation || '4-3-3',
    startingXI,
    substitutes,
    coach: data.coach || undefined,
    submittedAt: data.submitted_at,
    lockedAt: data.locked_at,
  }
}

export function mapTeamMatchStatsFromBackend(clubId: string, backendStats: any): TeamMatchStats {
  const defaultStats: TeamMatchStats = {
    teamId: clubId,
    shots: 0,
    shotsOnTarget: 0,
    possession: 0,
    corners: 0,
    fouls: 0,
    offsides: 0,
    yellowCards: 0,
    redCards: 0,
    passes: 0,
    passAccuracy: 0,
  }

  if (!backendStats) return defaultStats

  return {
    teamId: clubId,
    shots: (backendStats.shots_on_goal ?? 0) + (backendStats.shots_off_goal ?? 0),
    shotsOnTarget: backendStats.shots_on_goal ?? 0,
    possession: backendStats.possession ?? 0,
    corners: backendStats.corner_kicks ?? 0,
    fouls: backendStats.fouls ?? 0,
    offsides: backendStats.offsides ?? 0,
    yellowCards: backendStats.yellow_cards ?? 0,
    redCards: backendStats.red_cards ?? 0,
    passes: backendStats.passes ?? 0,
    passAccuracy: backendStats.passes_accuracy ?? 0,
  }
}

export const matchApi = {
  // GET /competitions/:id/matches → lista paginada com filtros
  async list(competitionId: string, params?: any): Promise<Match[]> {
    const response = await client.get<ApiResponse<any[]>>(
      `/competitions/${competitionId}/matches/`,
      { params }
    )
    const matches = response.data.data || []
    return matches.map(mapMatchFromBackend)
  },

  // GET /competitions/:id/matches/:matchId → detalhe completo
  async get(competitionId: string, matchId: string): Promise<Match> {
    const matches = await this.list(competitionId)
    const match = matches.find(m => m.id === matchId)
    if (!match) {
      throw new Error('Match not found')
    }
    return match
  },

  // POST /competitions/:id/matches → criar partida
  async create(
    competitionId: string,
    data: {
      home_club: string
      away_club: string
      match_date: string
      round_number?: number
      round_name?: string
      phase?: string
      group_id?: string
      venue?: string
      status?: string
    }
  ): Promise<Match> {
    const response = await client.post<ApiResponse<any>>(
      `/competitions/${competitionId}/matches/`,
      data
    )
    return mapMatchFromBackend(response.data.data)
  },

  // PATCH /matches/:id/status → mudar estado (árbitro/admin)
  async updateStatus(competitionId: string, matchId: string, status: MatchStatus): Promise<Match> {
    const match = await this.get(competitionId, matchId)
    const homeScore = match.home_score ?? 0
    const awayScore = match.away_score ?? 0

    const response = await client.patch<ApiResponse<any>>(
      `/competitions/matches/${matchId}/`,
      {
        home_score: homeScore,
        away_score: awayScore,
        status,
      }
    )
    return mapMatchFromBackend(response.data.data)
  },

  // GET /matches/:id/events → eventos da partida
  async listEvents(competitionId: string, matchId: string): Promise<MatchEvent[]> {
    const response = await client.get<ApiResponse<any[]>>(
      `/competitions/${competitionId}/matches/${matchId}/events/`
    )
    const events = response.data.data || []
    return events.map(mapMatchEventFromBackend)
  },

  // POST /matches/:id/events → registar evento
  async createEvent(
    competitionId: string,
    matchId: string,
    data: MatchEventFormData
  ): Promise<MatchEvent> {
    const eventTypeMap: Record<string, string> = {
      'goal': 'goal',
      'own_goal': 'own_goal',
      'penalty_goal': 'penalty_scored',
      'penalty_missed': 'penalty_missed',
      'yellow_card': 'yellow_card',
      'red_card': 'red_card',
      'yellow_red_card': 'yellow_red',
      'substitution': 'substitution_in',
    }

    const payload = {
      event_type: eventTypeMap[data.type] || data.type,
      minute: data.minute,
      extra_time: data.period === 'extra_time' || !!data.minuteExtra,
      club: data.teamId,
      player: data.playerId || null,
      player_off: data.substitutedPlayerId || null,
      notes: data.description || '',
    }

    const response = await client.post<ApiResponse<any>>(
      `/competitions/${competitionId}/matches/${matchId}/events/`,
      payload
    )
    return mapMatchEventFromBackend(response.data.data)
  },

  // DELETE /matches/:id/events/:eventId → remover evento
  async deleteEvent(competitionId: string, matchId: string, eventId: string): Promise<void> {
    await client.delete(
      `/competitions/${competitionId}/matches/${matchId}/events/${eventId}/`
    )
  },

  // GET /matches/:id/lineup/:teamId → escalação
  async getLineup(matchId: string, teamId: string): Promise<MatchLineup | null> {
    try {
      const response = await client.get<ApiResponse<any>>(
        `/competitions/matches/${matchId}/lineups/${teamId}/`
      )
      return mapLineupFromBackend(response.data.data || response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        return null
      }
      throw error
    }
  },

  // POST /matches/:id/lineup/:teamId → submeter escalação
  async submitLineup(
    matchId: string,
    teamId: string,
    data: {
      formation: string
      players: {
        player_id: string
        status: 'starter' | 'substitute'
        position: string
        shirt_number: number
        is_captain?: boolean
        is_goalkeeper?: boolean
        formation_position?: number
      }[]
    }
  ): Promise<MatchLineup> {
    const response = await client.post<ApiResponse<any>>(
      `/competitions/matches/${matchId}/lineups/`,
      {
        club_id: teamId,
        formation: data.formation,
        players: data.players,
      }
    )
    return mapLineupFromBackend(response.data.data || response.data)
  },

  // PATCH /matches/:id/lineup/:teamId/lock → bloquear escalação
  async lockLineup(matchId: string, teamId: string): Promise<void> {
    await client.post(
      `/competitions/matches/${matchId}/lineups/lock/`,
      { club_id: teamId }
    )
  },

  // GET /matches/:id/stats → estatísticas
  async getStats(matchId: string, homeTeamId: string, awayTeamId: string): Promise<MatchStats> {
    const response = await client.get<ApiResponse<any>>(
      `/competitions/matches/${matchId}/report/`
    )
    const responseData = response.data as any
    const reportData = responseData.data || responseData.report || responseData
    const homeStats = reportData.home_stats || null
    const awayStats = reportData.away_stats || null

    return {
      matchId,
      home: mapTeamMatchStatsFromBackend(homeTeamId, homeStats),
      away: mapTeamMatchStatsFromBackend(awayTeamId, awayStats),
    }
  },

  // PUT /matches/:id/stats → actualizar estatísticas
  async updateStats(
    matchId: string,
    teamId: string,
    stats: Partial<TeamMatchStats>
  ): Promise<any> {
    const payload = {
      club_id: teamId,
      possession: stats.possession,
      shots_on_goal: stats.shotsOnTarget,
      shots_off_goal: stats.shots ? stats.shots - (stats.shotsOnTarget ?? 0) : undefined,
      passes: stats.passes,
      passes_accuracy: stats.passAccuracy,
      fouls: stats.fouls,
      yellow_cards: stats.yellowCards,
      red_cards: stats.redCards,
      corner_kicks: stats.corners,
    }

    const response = await client.post<ApiResponse<any>>(
      `/competitions/matches/${matchId}/report/update-stats/`,
      payload
    )
    return response.data.data || response.data
  },

  // GET /matches/:id/report → relatório árbitro
  async getReport(matchId: string): Promise<any> {
    const response = await client.get<ApiResponse<any>>(
      `/competitions/matches/${matchId}/report/`
    )
    return response.data.data || response.data
  },

  // POST /matches/:id/report → submeter relatório
  async submitReport(
    matchId: string,
    data: {
      home_score: number
      away_score: number
      match_duration?: number
    }
  ): Promise<any> {
    const response = await client.post<ApiResponse<any>>(
      `/competitions/matches/${matchId}/report/create/`,
      data
    )
    return response.data.data || response.data
  },

  // PATCH /matches/:id/report/approve → aprovar relatório
  async approveReport(matchId: string): Promise<any> {
    const response = await client.post<ApiResponse<any>>(
      `/competitions/matches/${matchId}/report/create/`,
      {
        status: 'finalized',
      }
    )
    return response.data.data || response.data
  },

  // GET /matches/live → partidas ao vivo (global)
  async getLiveMatches(): Promise<Match[]> {
    // If a global endpoint is not supported by the backend, list from all matches of all active competitions
    const response = await client.get<ApiResponse<any[]>>('/competitions/')
    const competitions = response.data.data || []
    
    const matchesPromises = competitions.map((comp: any) =>
      client.get<ApiResponse<any[]>>(`/competitions/${comp.id}/matches/`)
        .then(res => res.data.data || [])
        .catch(() => [])
    )

    const allMatchesLists = await Promise.all(matchesPromises)
    const allMatches = allMatchesLists.flat()
    
    return allMatches
      .filter((m: any) => m.status === 'live')
      .map(mapMatchFromBackend)
  },
}
