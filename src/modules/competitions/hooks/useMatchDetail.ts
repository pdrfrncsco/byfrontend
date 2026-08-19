import { useQuery } from '@tanstack/react-query'
import { matchApi } from '../services/match.api'
import type { Match } from '../types'
import { MATCH_QUERY_KEYS } from './useMatchCenter'

export function useMatchDetail(competitionId: string, matchId: string) {
  return useQuery<Match | undefined>({
    queryKey: MATCH_QUERY_KEYS.detail(competitionId, matchId),
    queryFn: async () => {
      const match = await matchApi.get(competitionId, matchId)
      return match
    },
    enabled: Boolean(competitionId) && Boolean(matchId),
    staleTime: 30_000,
    retry: 1,
  })
}
