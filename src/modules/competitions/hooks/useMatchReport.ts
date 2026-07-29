// src/modules/competitions/hooks/useMatchReport.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchApi } from '../services/match.api'
import { MATCH_QUERY_KEYS } from './useMatchCenter'
import { useCompetitionAccess } from './useCompetitionAccess'
import { useAuth } from '@/app/providers'
import { toast } from 'sonner'
import type { MatchReport } from '../types'

// ─── Types ───────────────────────────────────────────────────────────────────

export interface MatchCenterReportFormData {
  home_score: number
  away_score: number
  match_duration?: number
  incidents?: string
  notes?: string
  documentUrl?: string
}

export interface UseMatchReportReturn {
  report: MatchReport | null
  submitReport: (data: MatchCenterReportFormData) => Promise<void>
  approveReport: () => Promise<void>
  uploadRefereeDocument: (file: File) => Promise<string>
  isSubmitting: boolean
  isApproving: boolean
  canSubmit: boolean
  canApprove: boolean
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// ─── Hook ────────────────────────────────────────────────────────────────────

export function useMatchReport({
  matchId,
}: {
  matchId: string
}): UseMatchReportReturn {
  const queryClient = useQueryClient()
  const { isAdmin } = useCompetitionAccess()
  const { user } = useAuth()
  const roles = new Set([...(user?.roles ?? []), user?.role ?? ''])
  const isReferee = roles.has('referee') || roles.has('match_referee')
  const canApprove = isAdmin || roles.has('federation')

  const query = useQuery({
    queryKey: MATCH_QUERY_KEYS.report(matchId),
    queryFn: () => matchApi.getReport(matchId),
    enabled: Boolean(matchId),
    staleTime: 30_000,
  })

  const submitMutation = useMutation({
    mutationFn: (data: MatchCenterReportFormData) =>
      matchApi.submitReport(matchId, {
        home_score: data.home_score,
        away_score: data.away_score,
        match_duration: data.match_duration,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.report(matchId) })
      toast.success('Relatório submetido com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao submeter relatório.')
    },
  })

  const uploadMutation = useMutation({
    mutationFn: (file: File) => matchApi.uploadRefereeDocument(matchId, file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.report(matchId) })
      toast.success('Documento do árbitro carregado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao carregar documento.')
    },
  })

  const approveMutation = useMutation({
    mutationFn: () => matchApi.approveReport(matchId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.report(matchId) })
      toast.success('Relatório aprovado!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao aprovar relatório.')
    },
  })

  return {
    report: query.data ?? null,
    submitReport: (data: MatchCenterReportFormData) => submitMutation.mutateAsync(data),
    approveReport: () => approveMutation.mutateAsync(),
    isSubmitting: submitMutation.isPending,
    isApproving: approveMutation.isPending,
    uploadRefereeDocument: (file: File) => uploadMutation.mutateAsync(file),
    canSubmit: isReferee,
    canApprove,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
