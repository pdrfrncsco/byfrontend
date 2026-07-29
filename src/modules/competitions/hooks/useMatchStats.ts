// src/modules/competitions/hooks/useMatchStats.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchApi } from '../services/match.api'
import { MATCH_QUERY_KEYS } from './useMatchCenter'
import type { MatchStats, TeamMatchStats } from '../types'
import { toast } from 'sonner'

// ─── Interface ──────────────────────────────────────────────────────────────

export interface UseMatchStatsReturn {
  stats: MatchStats | null
  updateStats: (teamId: string, data: Partial<TeamMatchStats>) => Promise<void>
  isLoading: boolean
  isUpdating: boolean
  error: Error | null
  refetch: () => void
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMatchStats({
  matchId,
  homeTeamId,
  awayTeamId,
  isLive = false,
}: {
  matchId: string
  homeTeamId: string
  awayTeamId: string
  isLive?: boolean
}): UseMatchStatsReturn {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: MATCH_QUERY_KEYS.stats(matchId),
    queryFn: () => matchApi.getStats(matchId, homeTeamId, awayTeamId),
    enabled: Boolean(matchId) && Boolean(homeTeamId) && Boolean(awayTeamId),
    // During live: refresh every 30s; post-match: cache 1h
    staleTime: isLive ? 30_000 : 60 * 60_000,
    refetchInterval: isLive ? 30_000 : false,
  })

  const updateMutation = useMutation({
    mutationFn: ({ teamId, data }: { teamId: string; data: Partial<TeamMatchStats> }) =>
      matchApi.updateStats(matchId, teamId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.stats(matchId) })
      toast.success('Estatísticas actualizadas!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao actualizar estatísticas.')
    },
  })

  return {
    stats: query.data ?? null,
    updateStats: (teamId: string, data: Partial<TeamMatchStats>) =>
      updateMutation.mutateAsync({ teamId, data }),
    isLoading: query.isLoading,
    isUpdating: updateMutation.isPending,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
