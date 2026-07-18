// Competitions Phase 4+ hooks — lineups, reports, regulations, fair play, rankings

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'
import type {
  LineupSubmissionData,
  MatchReportCreateData,
  GoalCreateData,
  CompetitionRegulationCreateData,
} from '../types'
import { toast } from 'sonner'

// ─── Query Keys ────────────────────────────────────────────────────────────

export const lineupKeys = {
  all: ['lineups'] as const,
  byMatch: (matchId: string) => ['lineups', 'match', matchId] as const,
  detail: (matchId: string, lineupId: string) => ['lineups', 'match', matchId, lineupId] as const,
}

export const reportKeys = {
  all: ['reports'] as const,
  byMatch: (matchId: string) => ['reports', 'match', matchId] as const,
}

export const regulationKeys = {
  all: ['regulations'] as const,
  byCompetition: (compId: string) => ['regulations', 'competition', compId] as const,
}

export const suspensionKeys = {
  all: ['suspensions'] as const,
  byCompetition: (compId: string) => ['suspensions', 'competition', compId] as const,
}

export const rankingKeys = {
  all: ['rankings'] as const,
  fairPlay: (compId: string) => ['rankings', 'fair-play', compId] as const,
  topScorers: (compId?: string) => ['rankings', 'top-scorers', compId] as const,
  season: (season?: string) => ['rankings', 'season', season] as const,
}

// ─── Lineup Hooks ──────────────────────────────────────────────────────────

export function useLineups(matchId: string) {
  return useQuery({
    queryKey: lineupKeys.byMatch(matchId),
    queryFn: () => competitionApi.getLineups(matchId),
    enabled: !!matchId,
  })
}

export function useLineup(matchId: string, lineupId: string) {
  return useQuery({
    queryKey: lineupKeys.detail(matchId, lineupId),
    queryFn: () => competitionApi.getLineup(matchId, lineupId),
    enabled: !!matchId && !!lineupId,
  })
}

export function useSubmitLineup(matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: LineupSubmissionData) => competitionApi.submitLineup(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lineupKeys.byMatch(matchId) })
      toast.success('Escalação submetida com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao submeter escalação.')
    },
  })
}

export function useConfirmLineup(matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => competitionApi.confirmLineup(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lineupKeys.byMatch(matchId) })
      toast.success('Escalação confirmada!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao confirmar escalação.')
    },
  })
}

export function useLockLineup(matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => competitionApi.lockLineup(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: lineupKeys.byMatch(matchId) })
      toast.success('Escalação bloqueada!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao bloquear escalação.')
    },
  })
}

// ─── Match Report Hooks ────────────────────────────────────────────────────

export function useMatchReport(matchId: string) {
  return useQuery({
    queryKey: reportKeys.byMatch(matchId),
    queryFn: () => competitionApi.getMatchReport(matchId),
    enabled: !!matchId,
  })
}

export function useCreateMatchReport(matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MatchReportCreateData) => competitionApi.createMatchReport(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.byMatch(matchId) })
      toast.success('Relatório criado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar relatório.')
    },
  })
}

export function useAddGoal(matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: GoalCreateData) => competitionApi.addGoal(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.byMatch(matchId) })
      toast.success('Golo registado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao registar golo.')
    },
  })
}

export function useUpdateMatchStats(matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: Record<string, any>) => competitionApi.updateMatchStats(matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: reportKeys.byMatch(matchId) })
      toast.success('Estatísticas atualizadas!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar estatísticas.')
    },
  })
}

// ─── Regulation Hooks ──────────────────────────────────────────────────────

export function useRegulations(competitionId: string) {
  return useQuery({
    queryKey: regulationKeys.byCompetition(competitionId),
    queryFn: () => competitionApi.getRegulations(competitionId),
    enabled: !!competitionId,
  })
}

export function useCreateRegulation(competitionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CompetitionRegulationCreateData) =>
      competitionApi.createRegulation(competitionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regulationKeys.byCompetition(competitionId) })
      toast.success('Regulamento adicionado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao adicionar regulamento.')
    },
  })
}

export function useDeleteRegulation(competitionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (regulationId: string) =>
      competitionApi.deleteRegulation(competitionId, regulationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: regulationKeys.byCompetition(competitionId) })
      toast.success('Regulamento removido!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover regulamento.')
    },
  })
}

// ─── Suspension Hooks ──────────────────────────────────────────────────────

export function useSuspensions(competitionId: string) {
  return useQuery({
    queryKey: suspensionKeys.byCompetition(competitionId),
    queryFn: () => competitionApi.getSuspensions(competitionId),
    enabled: !!competitionId,
  })
}

export function useCheckEligibility(competitionId: string, playerId: string) {
  return useQuery({
    queryKey: ['eligibility', competitionId, playerId],
    queryFn: () => competitionApi.checkEligibility(competitionId, playerId),
    enabled: !!competitionId && !!playerId,
  })
}

export function useCancelSuspension() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (suspensionId: string) => competitionApi.cancelSuspension(suspensionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suspensionKeys.all })
      toast.success('Suspensão cancelada!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao cancelar suspensão.')
    },
  })
}

export function useCreateSuspension(competitionId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: import('../types').ManualSuspensionCreateData) =>
      competitionApi.createSuspension(competitionId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: suspensionKeys.byCompetition(competitionId) })
      toast.success('Suspensão criada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar suspensão.')
    },
  })
}

// ─── Fair Play & Rankings Hooks ────────────────────────────────────────────

export function useFairPlayRanking(competitionId: string) {
  return useQuery({
    queryKey: rankingKeys.fairPlay(competitionId),
    queryFn: () => competitionApi.getFairPlayRanking(competitionId),
    enabled: !!competitionId,
  })
}

export function useTopScorers(competitionId?: string) {
  return useQuery({
    queryKey: rankingKeys.topScorers(competitionId),
    queryFn: () => competitionApi.getTopScorers(competitionId),
  })
}

export function useSeasonRanking(season?: string) {
  return useQuery({
    queryKey: rankingKeys.season(season),
    queryFn: () => competitionApi.getSeasonRanking(season),
  })
}

export function useRecalculateRankings(competitionId?: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => competitionApi.recalculateRankings(competitionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: rankingKeys.all })
      queryClient.invalidateQueries({ queryKey: ['standings'] })
      toast.success('Classificações recalculadas com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao recalcular classificações.')
    },
  })
}
