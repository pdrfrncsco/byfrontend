import client from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type {
  Competition,
  CompetitionCreateData,
  CompetitionUpdateData,
  CompetitionListParams,
  Match,
  MatchEvent,
  MatchEventCreateData,
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
  FairPlayRanking,
  TopScorer,
  SeasonRanking,
} from '../types'

export const competitionApi = {
  // ─── Competition CRUD ────────────────────────────────────────────────────

  async list(params?: CompetitionListParams): Promise<Competition[]> {
    const response = await client.get<ApiResponse<any>>(API_ROUTES.COMPETITIONS.LIST, { params })
    const data = response.data.data
    if (data && typeof data === 'object' && 'results' in data) {
      return data.results
    }
    return Array.isArray(data) ? data : []
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
    doubleRound: boolean = true
  ): Promise<any> {
    const response = await client.post<ApiResponse<any>>(
      API_ROUTES.COMPETITIONS.GENERATE_SCHEDULE(competitionId),
      {
        start_date: startDate,
        rounds_interval_days: roundsIntervalDays,
        double_round: doubleRound,
      }
    )
    return response.data
  },

  // ─── Matches & Standings ────────────────────────────────────────────────

  async listMatches(competitionId: string): Promise<Match[]> {
    const response = await client.get<ApiResponse<Match[]>>(
      API_ROUTES.COMPETITIONS.MATCHES(competitionId)
    )
    return response.data.data
  },

  async getStandings(competitionId: string): Promise<Standing[]> {
    const response = await client.get<ApiResponse<Standing[]>>(
      API_ROUTES.COMPETITIONS.STANDINGS(competitionId)
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
    const response = await client.get<ApiResponse<LineupSubmission[]>>(
      `/competitions/matches/${matchId}/lineups/`
    )
    return response.data.data
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

  async confirmLineup(matchId: string): Promise<LineupSubmission> {
    const response = await client.post<ApiResponse<LineupSubmission>>(
      `/competitions/matches/${matchId}/lineups/confirm/`
    )
    return response.data.data
  },

  async lockLineup(matchId: string): Promise<LineupSubmission> {
    const response = await client.post<ApiResponse<LineupSubmission>>(
      `/competitions/matches/${matchId}/lineups/lock/`
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
}
