import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { lineupApi } from '../services/lineup.api'
import type { LineupSubmissionData } from '../types'

export const lineupKeys = {
  all: ['lineups'] as const,
  byMatch: (matchId: string) => ['lineups', 'match', matchId] as const,
  detail: (matchId: string, clubId: string) => ['lineups', 'match', matchId, clubId] as const,
}

export function useLineups(matchId: string) {
  return useQuery({
    queryKey: lineupKeys.byMatch(matchId),
    queryFn: () => lineupApi.list(matchId),
    enabled: Boolean(matchId),
  })
}

export function useLineup(matchId: string, clubId: string) {
  return useQuery({
    queryKey: lineupKeys.detail(matchId, clubId),
    queryFn: () => lineupApi.get(matchId, clubId),
    enabled: Boolean(matchId) && Boolean(clubId),
  })
}

export function useSubmitLineup(matchId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: LineupSubmissionData) => lineupApi.submit(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lineupKeys.byMatch(matchId) })
      toast.success('Escalação submetida com sucesso!')
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Erro ao submeter escalação.'),
  })
}

export function useConfirmLineup(matchId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clubId: string) => lineupApi.confirm(matchId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lineupKeys.byMatch(matchId) })
      toast.success('Escalação confirmada!')
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Erro ao confirmar escalação.'),
  })
}

export function useLockLineup(matchId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clubId?: string) => lineupApi.lock(matchId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lineupKeys.byMatch(matchId) })
      toast.success('Escalação bloqueada!')
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || 'Erro ao bloquear escalação.'),
  })
}
