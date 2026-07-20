// Validated API client for Competitions
// This wraps the existing competitionApi with Zod validation and error handling

import { z } from 'zod'
import { competitionApi } from './competition.api'
import { ApiError } from './error'
import {
  CompetitionCreateSchema,
  CompetitionUpdateSchema,
  MatchScoreUpdateSchema,
  MatchEventCreateSchema,
  GoalCreateSchema,
  LineupSubmissionDataSchema,
  MatchReportCreateSchema,
  ManualSuspensionCreateSchema,
  CompetitionRegulationCreateSchema,
} from '../schemas/competition.schemas'
import type {
  Competition,
  CompetitionCreateData,
  CompetitionUpdateData,
  Match,
  Standing,
  LineupSubmission,
  LineupSubmissionData,
  MatchReport,
  MatchReportCreateData,
  MatchEvent,
  MatchEventCreateData,
  Goal,
  GoalCreateData,
  Suspension,
  ManualSuspensionCreateData,
  FairPlayRanking,
  TopScorer,
  SeasonRanking,
  CompetitionRegulation,
  CompetitionRegulationCreateData,
  PaginatedResponse,
} from '../types'

/**
 * Validates data before sending to API
 */
function validateData<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data)
  if (!result.success) {
    const details = result.error.errors.map((err) => ({
      field: err.path.join('.'),
      message: err.message,
    }))
    throw new ApiError(400, 'Validation failed', 'VALIDATION_ERROR', {
      errors: details,
    })
  }
  return result.data
}

/**
 * Catches API errors and converts them to ApiError
 */
async function handleApiCall<T>(fn: () => Promise<T>): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    throw ApiError.from(error)
  }
}

export const competitionApiValidated = {
  // ─── Competition CRUD ────────────────────────────────────────────────────

  async list(params?: any): Promise<PaginatedResponse<Competition>> {
    return handleApiCall(() => competitionApi.list(params))
  },

  async get(id: string): Promise<Competition> {
    if (!id || !id.match(/^[0-9a-f-]+$/i)) {
      throw new ApiError(400, 'Invalid competition ID', 'INVALID_ID')
    }
    return handleApiCall(() => competitionApi.get(id))
  },

  async create(data: CompetitionCreateData): Promise<Competition> {
    const validated = validateData<CompetitionCreateData>(CompetitionCreateSchema, data)
    return handleApiCall(() => competitionApi.create(validated))
  },

  async update(id: string, data: CompetitionUpdateData): Promise<Competition> {
    if (!id || !id.match(/^[0-9a-f-]+$/i)) {
      throw new ApiError(400, 'Invalid competition ID', 'INVALID_ID')
    }
    const validated = validateData<CompetitionUpdateData>(CompetitionUpdateSchema, data)
    return handleApiCall(() => competitionApi.update(id, validated))
  },

  // ─── Registration & Schedule ─────────────────────────────────────────────

  async registerClub(competitionId: string, clubId: string): Promise<any> {
    if (!competitionId || !clubId) {
      throw new ApiError(400, 'Competition ID and Club ID are required', 'MISSING_FIELDS')
    }
    return handleApiCall(() => competitionApi.registerClub(competitionId, clubId))
  },

  async generateSchedule(
    competitionId: string,
    startDate: string,
    roundsIntervalDays: number = 7,
    doubleRound: boolean = true
  ): Promise<any> {
    if (!competitionId || !startDate) {
      throw new ApiError(400, 'Competition ID and start date are required', 'MISSING_FIELDS')
    }
    if (roundsIntervalDays < 1 || roundsIntervalDays > 30) {
      throw new ApiError(400, 'Rounds interval must be between 1 and 30 days', 'INVALID_INTERVAL')
    }
    return handleApiCall(() =>
      competitionApi.generateSchedule(competitionId, startDate, roundsIntervalDays, doubleRound)
    )
  },

  // ─── Matches & Standings ────────────────────────────────────────────────

  async listMatches(competitionId: string): Promise<Match[]> {
    if (!competitionId) {
      throw new ApiError(400, 'Competition ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.listMatches(competitionId))
  },

  async getStandings(competitionId: string): Promise<Standing[]> {
    if (!competitionId) {
      throw new ApiError(400, 'Competition ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.getStandings(competitionId))
  },

  async updateMatchScore(
    matchId: string,
    homeScore: number,
    awayScore: number,
    status: string = 'finished'
  ): Promise<any> {
    const validated = validateData<{ home_score: number; away_score: number; status?: string }>(
      MatchScoreUpdateSchema,
      {
        home_score: homeScore,
        away_score: awayScore,
        status: status,
      }
    )
    return handleApiCall(() =>
      competitionApi.updateMatchScore(
        matchId,
        validated.home_score,
        validated.away_score,
        validated.status
      )
    )
  },

  // ─── Match Events ────────────────────────────────────────────────────────

  async listMatchEvents(compId: string, matchId: string): Promise<MatchEvent[]> {
    if (!compId || !matchId) {
      throw new ApiError(400, 'Competition ID and Match ID are required', 'MISSING_FIELDS')
    }
    return handleApiCall(() => competitionApi.listMatchEvents(compId, matchId))
  },

  async addMatchEvent(
    compId: string,
    matchId: string,
    data: MatchEventCreateData
  ): Promise<MatchEvent> {
    const validated = validateData<MatchEventCreateData>(MatchEventCreateSchema, data)
    return handleApiCall(() => competitionApi.addMatchEvent(compId, matchId, validated))
  },

  async deleteMatchEvent(compId: string, matchId: string, eventId: string): Promise<void> {
    if (!eventId) {
      throw new ApiError(400, 'Event ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.deleteMatchEvent(compId, matchId, eventId))
  },

  // ─── Player Stats ────────────────────────────────────────────────────────

  async getPlayerStats(compId: string): Promise<any[]> {
    if (!compId) {
      throw new ApiError(400, 'Competition ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.getPlayerStats(compId))
  },

  // ─── Lineups ─────────────────────────────────────────────────────────────

  async getLineups(matchId: string): Promise<LineupSubmission[]> {
    if (!matchId) {
      throw new ApiError(400, 'Match ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.getLineups(matchId))
  },

  async getLineup(matchId: string, lineupId: string): Promise<LineupSubmission> {
    if (!matchId || !lineupId) {
      throw new ApiError(400, 'Match ID and Lineup ID are required', 'MISSING_FIELDS')
    }
    return handleApiCall(() => competitionApi.getLineup(matchId, lineupId))
  },

  async submitLineup(matchId: string, data: LineupSubmissionData): Promise<LineupSubmission> {
    if (!matchId) {
      throw new ApiError(400, 'Match ID is required', 'MISSING_FIELD')
    }
    const validated = validateData<LineupSubmissionData>(LineupSubmissionDataSchema, data)
    return handleApiCall(() => competitionApi.submitLineup(matchId, validated))
  },

  async confirmLineup(matchId: string): Promise<LineupSubmission> {
    if (!matchId) {
      throw new ApiError(400, 'Match ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.confirmLineup(matchId))
  },

  async lockLineup(matchId: string): Promise<LineupSubmission> {
    if (!matchId) {
      throw new ApiError(400, 'Match ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.lockLineup(matchId))
  },

  // ─── Match Reports ───────────────────────────────────────────────────────

  async getMatchReport(matchId: string): Promise<MatchReport> {
    if (!matchId) {
      throw new ApiError(400, 'Match ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.getMatchReport(matchId))
  },

  async createMatchReport(
    matchId: string,
    data: MatchReportCreateData
  ): Promise<MatchReport> {
    if (!matchId) {
      throw new ApiError(400, 'Match ID is required', 'MISSING_FIELD')
    }
    const validated = validateData<MatchReportCreateData>(MatchReportCreateSchema, data)
    return handleApiCall(() => competitionApi.createMatchReport(matchId, validated))
  },

  async addGoal(matchId: string, data: GoalCreateData): Promise<Goal> {
    if (!matchId) {
      throw new ApiError(400, 'Match ID is required', 'MISSING_FIELD')
    }
    const validated = validateData<GoalCreateData>(GoalCreateSchema, data)
    return handleApiCall(() => competitionApi.addGoal(matchId, validated))
  },

  async updateMatchStats(matchId: string, data: Record<string, any>): Promise<any> {
    if (!matchId) {
      throw new ApiError(400, 'Match ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.updateMatchStats(matchId, data))
  },

  // ─── Regulations ─────────────────────────────────────────────────────────

  async getRegulations(competitionId: string): Promise<CompetitionRegulation[]> {
    if (!competitionId) {
      throw new ApiError(400, 'Competition ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.getRegulations(competitionId))
  },

  async createRegulation(
    competitionId: string,
    data: CompetitionRegulationCreateData
  ): Promise<CompetitionRegulation> {
    if (!competitionId) {
      throw new ApiError(400, 'Competition ID is required', 'MISSING_FIELD')
    }
    const validated = validateData<CompetitionRegulationCreateData>(
      CompetitionRegulationCreateSchema,
      data
    )
    return handleApiCall(() => competitionApi.createRegulation(competitionId, validated))
  },

  async deleteRegulation(competitionId: string, regulationId: string): Promise<void> {
    if (!competitionId || !regulationId) {
      throw new ApiError(400, 'Competition ID and Regulation ID are required', 'MISSING_FIELDS')
    }
    return handleApiCall(() => competitionApi.deleteRegulation(competitionId, regulationId))
  },

  // ─── Suspensions & Fair Play ─────────────────────────────────────────────

  async getSuspensions(competitionId: string): Promise<Suspension[]> {
    if (!competitionId) {
      throw new ApiError(400, 'Competition ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.getSuspensions(competitionId))
  },

  async createSuspension(
    competitionId: string,
    data: ManualSuspensionCreateData
  ): Promise<Suspension> {
    if (!competitionId) {
      throw new ApiError(400, 'Competition ID is required', 'MISSING_FIELD')
    }
    const validated = validateData<ManualSuspensionCreateData>(
      ManualSuspensionCreateSchema,
      data
    )
    return handleApiCall(() => competitionApi.createSuspension(competitionId, validated))
  },

  async checkEligibility(
    competitionId: string,
    playerId: string
  ): Promise<{ eligible: boolean; reason?: string }> {
    if (!competitionId || !playerId) {
      throw new ApiError(400, 'Competition ID and Player ID are required', 'MISSING_FIELDS')
    }
    return handleApiCall(() => competitionApi.checkEligibility(competitionId, playerId))
  },

  async cancelSuspension(suspensionId: string): Promise<Suspension> {
    if (!suspensionId) {
      throw new ApiError(400, 'Suspension ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.cancelSuspension(suspensionId))
  },

  async getFairPlayRanking(competitionId: string): Promise<FairPlayRanking[]> {
    if (!competitionId) {
      throw new ApiError(400, 'Competition ID is required', 'MISSING_FIELD')
    }
    return handleApiCall(() => competitionApi.getFairPlayRanking(competitionId))
  },

  // ─── Rankings ────────────────────────────────────────────────────────────

  async getTopScorers(competitionId?: string): Promise<TopScorer[]> {
    return handleApiCall(() => competitionApi.getTopScorers(competitionId))
  },

  async getSeasonRanking(season?: string): Promise<SeasonRanking[]> {
    return handleApiCall(() => competitionApi.getSeasonRanking(season))
  },

  async recalculateRankings(competitionId?: string): Promise<{ message: string }> {
    return handleApiCall(() => competitionApi.recalculateRankings(competitionId))
  },
}
