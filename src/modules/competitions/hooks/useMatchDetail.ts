import { useQuery } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'
import type { Match } from '../types'
import { MATCH_QUERY_KEYS } from './useMatchCenter'

export function useMatchDetail(competitionId: string, matchId: string) {
  return useQuery<Match | undefined>({
    queryKey: MATCH_QUERY_KEYS.detail(matchId),
    queryFn: async () => {
      const matches = await competitionApi.listMatches(competitionId)
      const match = matches.find((item) => {
        const idMatches = item.id === matchId
        const legacyMatches = String((item as any)?.match_id ?? '') === String(matchId)
        return idMatches || legacyMatches
      })

      if (!match) {
        return undefined
      }

      return match
    },
    enabled: Boolean(competitionId) && Boolean(matchId),
    staleTime: 30_000,
    retry: 1,
  })
}
