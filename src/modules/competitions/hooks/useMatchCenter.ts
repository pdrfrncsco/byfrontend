import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'
import type { MatchEventCreateData } from '../types'
import { toast } from 'sonner'

export const matchCenterKeys = {
  all: ['match-center'] as const,
  events: (compId: string, matchId: string) => [...matchCenterKeys.all, compId, 'events', matchId] as const,
  playerStats: (compId: string) => [...matchCenterKeys.all, compId, 'stats'] as const,
}

export function useMatchEvents(competitionId: string, matchId: string) {
  return useQuery({
    queryKey: matchCenterKeys.events(competitionId, matchId),
    queryFn: () => competitionApi.listMatchEvents(competitionId, matchId),
    enabled: !!competitionId && !!matchId,
  })
}

export function useAddMatchEvent(competitionId: string, matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MatchEventCreateData) => competitionApi.addMatchEvent(competitionId, matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchCenterKeys.events(competitionId, matchId) })
      // Invalidating match query as well since score might have changed
      queryClient.invalidateQueries({ queryKey: ['competitions', competitionId, 'matches'] })
      queryClient.invalidateQueries({ queryKey: ['competitions', competitionId, 'standings'] })
      toast.success('Evento adicionado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao adicionar evento.')
    },
  })
}

export function useDeleteMatchEvent(competitionId: string, matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) => competitionApi.deleteMatchEvent(competitionId, matchId, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchCenterKeys.events(competitionId, matchId) })
      queryClient.invalidateQueries({ queryKey: ['competitions', competitionId, 'matches'] })
      queryClient.invalidateQueries({ queryKey: ['competitions', competitionId, 'standings'] })
      toast.success('Evento removido com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover evento.')
    },
  })
}

export function usePlayerStats(competitionId: string) {
  return useQuery({
    queryKey: matchCenterKeys.playerStats(competitionId),
    queryFn: () => competitionApi.getPlayerStats(competitionId),
    enabled: !!competitionId,
  })
}
