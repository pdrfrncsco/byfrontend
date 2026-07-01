import client from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type {
  Competition,
  CompetitionCreateData,
  CompetitionUpdateData,
} from '../types'

export const competitionApi = {
  async list(): Promise<Competition[]> {
    const response = await client.get<ApiResponse<Competition[]>>(API_ROUTES.COMPETITIONS.LIST)
    return response.data.data
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

  async listMatches(competitionId: string): Promise<any> {
    const response = await client.get<ApiResponse<any>>(
      API_ROUTES.COMPETITIONS.MATCHES(competitionId)
    )
    return response.data.data
  },

  async getStandings(competitionId: string): Promise<any> {
    const response = await client.get<ApiResponse<any>>(
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
}
