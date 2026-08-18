import client from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type {
  Competition,
  CompetitionCreateData,
  CompetitionUpdateData,
  CompetitionListParams,
  PaginatedResponse,
  Match,
  MatchEvent,
  MatchEventCreateData,
  MatchListParams,
  MatchStatus,
  PlayerStats,
  Standing,
  LineupSubmission,
  LineupSubmissionData,
  MatchReport,
  MatchReportCreateData,
  Goal,
  GoalCreateData,
  CompetitionRegulation,
  CompetitionRegulationCreateData,
  Suspension,
  ManualSuspensionCreateData,
  FairPlayRanking,
  TopScorer,
  SeasonRanking,
} from '../types'

type PaginatedEnvelope<T> =
  | ApiResponse<PaginatedResponse<T>>
  | PaginatedResponse<T>
  | { count?: number; next?: string | null; previous?: string | null; results?: T[] }
  | T[]

function normalizeMatch(raw: Partial<Match> & Record<string, any>): Match {
  const status = (raw.status ?? raw.status_label ?? 'scheduled') as MatchStatus

  return {
    ...raw,
    id: raw.id ?? raw.match_id ?? '',
    competitionId: raw.competitionId ?? raw.competition ?? '',
    competition: raw.competition ?? raw.competitionId ?? '',
    roundNumber: raw.roundNumber ?? raw.round_number ?? 0,
    round_number: raw.round_number ?? raw.roundNumber ?? 0,
    roundLabel: raw.roundLabel ?? raw.round_name ?? undefined,
    round_name: raw.round_name ?? raw.roundLabel ?? undefined,
    homeTeamId: raw.homeTeamId ?? raw.home_club ?? '',
    home_club: raw.home_club ?? raw.homeTeamId ?? '',
    homeTeamName: raw.homeTeamName ?? raw.home_club_name ?? '',
    home_club_name: raw.home_club_name ?? raw.homeTeamName ?? '',
    homeTeamLogo: raw.homeTeamLogo ?? raw.home_club_logo ?? null,
    home_club_logo: raw.home_club_logo ?? raw.homeTeamLogo ?? null,
    awayTeamId: raw.awayTeamId ?? raw.away_club ?? '',
    away_club: raw.away_club ?? raw.awayTeamId ?? '',
    awayTeamName: raw.awayTeamName ?? raw.away_club_name ?? '',
    away_club_name: raw.away_club_name ?? raw.awayTeamName ?? '',
    awayTeamLogo: raw.awayTeamLogo ?? raw.away_club_logo ?? null,
    away_club_logo: raw.away_club_logo ?? raw.awayTeamLogo ?? null,
    scheduledAt: raw.scheduledAt ?? raw.match_date ?? new Date().toISOString(),
    match_date: raw.match_date ?? raw.scheduledAt ?? new Date().toISOString(),
    status,
    status_label: raw.status_label ?? status,
    home_score: raw.home_score ?? raw.score?.home ?? raw.homeScore ?? null,
    away_score: raw.away_score ?? raw.score?.away ?? raw.awayScore ?? null,
    score: raw.score ?? {
      home: raw.home_score ?? raw.homeScore ?? 0,
      away: raw.away_score ?? raw.awayScore ?? 0,
    },
  } as Match
}

function unwrapPaginated<T>(payload: PaginatedEnvelope<T>): PaginatedResponse<T> {
  const data = 'data' in payload && 'success' in payload ? payload.data : payload

  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    }
  }

  if (data && typeof data === 'object' && 'results' in data) {
    const results = Array.isArray((data as { results?: T[] }).results) ? (data as { results: T[] }).results : []
    return {
      count: typeof (data as { count?: number }).count === 'number' ? (data as { count: number }).count : results.length,
      next: (data as { next?: string | null }).next ?? null,
      previous: (data as { previous?: string | null }).previous ?? null,
      results,
    }
  }

  return {
    count: 0,
    next: null,
    previous: null,
    results: [],
  }
}

export const competitionApi = {
  // ─── Competition CRUD ────────────────────────────────────────────────────

  async list(params?: CompetitionListParams): Promise<PaginatedResponse<Competition>> {
    const response = await client.get<PaginatedEnvelope<Competition>>(API_ROUTES.COMPETITIONS.LIST, {
      params,
    })
    return unwrapPaginated(response.data)
  },

  async get(id: string): Promise<Competition> {
    const response = await client.get<ApiResponse<Competition>>(API_ROUTES.COMPETITIONS.GET(id))
    return response.data.data
  },

  async create(data: CompetitionCreateData): Promise<Competition> {
    const response = await client.post<ApiResponse<Competition>>(
      API_ROUTES.COMPETITIONS.CREATE,
      data,
    )
    return response.data.data
  },

  async update(id: string, data: CompetitionUpdateData): Promise<Competition> {
    const response = await client.patch<ApiResponse<Competition>>(
      API_ROUTES.COMPETITIONS.UPDATE(id),
      data,
    )
    return response.data.data
  },

  // ─── Registration & Schedule ─────────────────────────────────────────────

  async registerClub(competitionId: string, clubId: string): Promise<any> {
    const response = await client.post<ApiResponse<any>>(
      API_ROUTES.COMPETITIONS.REGISTER_CLUB(competitionId),
      { club: clubId }
    )
    return response.data
  },

  async generateSchedule(
    competitionId: string,
    startDate: string,
    roundsIntervalDays: number = 7,
    doubleRound: boolean = true,
    seed?: string
  ): Promise<any> {
    const response = await client.post<ApiResponse<any>>(
      API_ROUTES.COMPETITIONS.GENERATE_SCHEDULE(competitionId),
      {
        start_date: startDate,
        rounds_interval_days: roundsIntervalDays,
        double_round: doubleRound,
        ...(seed ? { seed } : {}),
      }
    )
    return response.data
  },

  async createMatch(
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
    const response = await client.post<ApiResponse<Match>>(
      API_ROUTES.COMPETITIONS.CREATE_MATCH(competitionId),
      data
    )
    return response.data.data
  },

  // ─── Matches & Standings ────────────────────────────────────────────────

  async listMatches(
    competitionId: string,
    params?: MatchListParams | Record<string, any>
  ): Promise<Match[]> {
    const normalizedParams: Record<string, any> = {
      ...(params ?? {}),
      competition_id: params?.competition_id ?? params?.competitionId ?? competitionId,
      competitionId: params?.competitionId ?? competitionId,
    }

    if (Array.isArray(normalizedParams.status)) {
      normalizedParams.status = normalizedParams.status.join(',')
    }

    if (normalizedParams.roundNumber !== undefined && normalizedParams.round_number === undefined) {
      normalizedParams.round_number = normalizedParams.roundNumber
    }

    if (normalizedParams.teamId !== undefined && normalizedParams.team_id === undefined) {
      normalizedParams.team_id = normalizedParams.teamId
    }

    if (normalizedParams.groupId !== undefined && normalizedParams.group_id === undefined) {
      normalizedParams.group_id = normalizedParams.groupId
    }

    const response = await client.get<
      ApiResponse<Match[]> | { data?: Match[]; results?: Match[] } | Match[]
    >(
      API_ROUTES.COMPETITIONS.MATCHES(competitionId),
      { params: normalizedParams }
    )

    const rawPayload = response.data as
      | ApiResponse<Match[]>
      | { data?: Match[]; results?: Match[] }
      | Match[]
      | undefined

    const list = Array.isArray((rawPayload as { data?: Match[] })?.data)
      ? (rawPayload as { data: Match[] }).data
      : Array.isArray((rawPayload as { results?: Match[] })?.results)
        ? (rawPayload as { results: Match[] }).results
        : Array.isArray(rawPayload)
          ? rawPayload
          : []

    return list.map((item: Partial<Match> & Record<string, any>) => normalizeMatch(item))
  },
  
  async listAllMatches(params?: Record<string, any>): Promise<PaginatedResponse<Match>> {
    const response = await client.get<PaginatedEnvelope<Match>>(API_ROUTES.MATCHES.LIST, {
      params,
    })
    return unwrapPaginated(response.data)
  },

  async getStandings(
    competitionId: string,
    params?: { groupId?: string; group_id?: string; phase?: string; format?: string }
  ): Promise<Standing[]> {
    const response = await client.get<ApiResponse<Standing[]>>(
      API_ROUTES.COMPETITIONS.STANDINGS(competitionId),
      { params }
    )
    return response.data.data
  },

  async getBracket(
    competitionId: string,
    params?: { groupId?: string; group_id?: string; phase?: string }
  ): Promise<any> {
    const response = await client.get<ApiResponse<any>>(
      API_ROUTES.COMPETITIONS.BRACKET(competitionId),
      { params }
    )
    return response.data.data
  },

  async getRounds(
    competitionId: string,
    params?: { groupId?: string; group_id?: string; phase?: string }
  ): Promise<any> {
    const response = await client.get<ApiResponse<any>>(
      API_ROUTES.COMPETITIONS.ROUNDS(competitionId),
      { params }
    )
    return response.data.data
  },

  async updateMatchScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: string = 'finished'
  ): Promise<any> {
    const response = await client.patch<ApiResponse<any>>(
      API_ROUTES.COMPETITIONS.UPDATE_MATCH(matchId),
      {
        home_score: homeScore,
        away_score: awayScore,
        status: status,
      }
    )
    return response.data
  },

  // ─── Match Events ────────────────────────────────────────────────────────

  async listMatchEvents(compId: string, matchId: string): Promise<MatchEvent[]> {
    const response = await client.get<ApiResponse<MatchEvent[]>>(
      API_ROUTES.COMPETITIONS.MATCH_EVENTS(compId, matchId)
    )
    return response.data.data
  },

  async addMatchEvent(compId: string, matchId: string, data: MatchEventCreateData): Promise<MatchEvent> {
    const response = await client.post<ApiResponse<MatchEvent>>(
      API_ROUTES.COMPETITIONS.MATCH_EVENTS(compId, matchId),
      data
    )
    return response.data.data
  },

  async deleteMatchEvent(compId: string, matchId: string, eventId: string): Promise<void> {
    await client.delete(API_ROUTES.COMPETITIONS.DELETE_EVENT(compId, matchId, eventId))
  },

  // ─── Player Stats ────────────────────────────────────────────────────────

  async getPlayerStats(compId: string): Promise<PlayerStats[]> {
    const response = await client.get<ApiResponse<PlayerStats[]>>(
      API_ROUTES.COMPETITIONS.PLAYER_STATS(compId)
    )
    return response.data.data
  },

  // ─── Lineups ─────────────────────────────────────────────────────────────

  async getLineups(matchId: string): Promise<LineupSubmission[]> {
    const response = await client.get<any>(
      `/competitions/matches/${matchId}/lineups/`
    )
    const raw = response.data?.data ?? response.data
    if (Array.isArray(raw)) return raw
    if (raw && Array.isArray(raw.lineups)) return raw.lineups
    return []
  },

  async getLineup(matchId: string, lineupId: string): Promise<LineupSubmission> {
    const response = await client.get<ApiResponse<LineupSubmission>>(
      `/competitions/matches/${matchId}/lineups/${lineupId}/`
    )
    return response.data.data
  },

  async submitLineup(matchId: string, data: LineupSubmissionData): Promise<LineupSubmission> {
    const response = await client.post<ApiResponse<LineupSubmission>>(
      `/competitions/matches/${matchId}/lineups/`,
      data
    )
    return response.data.data
  },

  async confirmLineup(matchId: string, clubId: string): Promise<LineupSubmission> {
    const response = await client.post<ApiResponse<LineupSubmission>>(
      `/competitions/matches/${matchId}/lineups/confirm/`,
      { club_id: clubId }          // backend exige club_id no payload
    )
    return response.data.data
  },

  async lockLineup(matchId: string, clubId?: string): Promise<LineupSubmission> {
    const payload: Record<string, any> = {}
    if (clubId) payload.club_id = clubId
    const response = await client.post<ApiResponse<LineupSubmission>>(
      `/competitions/matches/${matchId}/lineups/lock/`,
      Object.keys(payload).length ? payload : undefined
    )
    return response.data.data
  },

  // ─── Match Reports ───────────────────────────────────────────────────────

  async getMatchReport(matchId: string): Promise<MatchReport> {
    const response = await client.get<ApiResponse<MatchReport>>(
      `/competitions/matches/${matchId}/report/`
    )
    return response.data.data
  },

  async createMatchReport(matchId: string, data: MatchReportCreateData): Promise<MatchReport> {
    const response = await client.post<ApiResponse<MatchReport>>(
      `/competitions/matches/${matchId}/report/create/`,
      data
    )
    return response.data.data
  },

  async addGoal(matchId: string, data: GoalCreateData): Promise<Goal> {
    const response = await client.post<ApiResponse<Goal>>(
      `/competitions/matches/${matchId}/report/add-goal/`,
      data
    )
    return response.data.data
  },

  async updateMatchStats(matchId: string, data: Record<string, any>): Promise<any> {
    const response = await client.post<ApiResponse<any>>(
      `/competitions/matches/${matchId}/report/update-stats/`,
      data
    )
    return response.data.data
  },

  // ─── Regulations ─────────────────────────────────────────────────────────

  async getRegulations(competitionId: string): Promise<CompetitionRegulation[]> {
    const response = await client.get<ApiResponse<CompetitionRegulation[]>>(
      `/competitions/${competitionId}/regulations/`
    )
    return response.data.data
  },

  async createRegulation(competitionId: string, data: CompetitionRegulationCreateData): Promise<CompetitionRegulation> {
    const response = await client.post<ApiResponse<CompetitionRegulation>>(
      `/competitions/${competitionId}/regulations/`,
      data
    )
    return response.data.data
  },

  async deleteRegulation(competitionId: string, regulationId: string): Promise<void> {
    await client.delete(`/competitions/${competitionId}/regulations/${regulationId}/`)
  },

  // ─── Suspensions & Fair Play ─────────────────────────────────────────────

  async getSuspensions(competitionId: string): Promise<Suspension[]> {
    const response = await client.get<ApiResponse<Suspension[]>>(
      `/competitions/${competitionId}/suspensions/`
    )
    return response.data.data
  },

  async createSuspension(competitionId: string, data: ManualSuspensionCreateData): Promise<Suspension> {
    const response = await client.post<ApiResponse<Suspension>>(
      `/competitions/${competitionId}/suspensions/`,
      data
    )
    return response.data.data
  },

  // ─── Tactical positions (dedicated endpoints) ───────────────────────────
  async getTacticalPositions(matchId: string, clubId?: string): Promise<any> {
    const params: Record<string, any> = {}
    if (clubId) params.club = clubId
    const response = await client.get<ApiResponse<any>>(`/competitions/matches/${matchId}/tactical_positions/`, { params })
    return response.data.data
  },

  async upsertTacticalPositions(matchId: string, data: any, force: boolean = false): Promise<any> {
    const url = `/competitions/matches/${matchId}/tactical_positions/` + (force ? '?force=true' : '')
    const response = await client.post<ApiResponse<any>>(url, data)
    return response.data.data
  },

  async checkEligibility(competitionId: string, playerId: string): Promise<{ eligible: boolean; reason?: string }> {
    const response = await client.get<ApiResponse<{ eligible: boolean; reason?: string }>>(
      `/competitions/${competitionId}/eligibility/${playerId}/`
    )
    return response.data.data
  },

  async cancelSuspension(suspensionId: string): Promise<Suspension> {
    const response = await client.post<ApiResponse<Suspension>>(
      `/competitions/suspensions/${suspensionId}/cancel/`
    )
    return response.data.data
  },

  async getFairPlayRanking(competitionId: string): Promise<FairPlayRanking[]> {
    const response = await client.get<ApiResponse<FairPlayRanking[]>>(
      `/competitions/${competitionId}/fair-play-ranking/`
    )
    return response.data.data
  },

  // ─── Rankings ────────────────────────────────────────────────────────────

  async getTopScorers(competitionId?: string): Promise<TopScorer[]> {
    const response = await client.get<ApiResponse<TopScorer[]>>(
      '/competitions/rankings/top-scorers/',
      { params: competitionId ? { competition_id: competitionId } : {} }
    )
    return response.data.data
  },

  async getSeasonRanking(season?: string): Promise<SeasonRanking[]> {
    const response = await client.get<ApiResponse<SeasonRanking[]>>(
      '/competitions/rankings/season/',
      { params: season ? { season } : {} }
    )
    return response.data.data
  },

  async recalculateRankings(competitionId?: string): Promise<{ message: string }> {
    const response = await client.post<ApiResponse<{ message: string }>>(
      '/competitions/rankings/recalculate/',
      competitionId ? { competition_id: competitionId } : {}
    )
    return response.data.data
  },
  
  async draw(
    competitionId: string,
    startDate: string = new Date().toISOString().slice(0, 10),
    roundsIntervalDays: number = 7,
    seed?: string
  ): Promise<any> {
    const response = await client.post<ApiResponse<any>>(
      API_ROUTES.COMPETITIONS.DRAW(competitionId),
      {
        start_date: startDate,
        rounds_interval_days: roundsIntervalDays,
        ...(seed ? { seed } : {}),
      }
    )
    return response.data.data
  },
}
