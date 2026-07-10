import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'
import type { CompetitionCreateData, CompetitionUpdateData, CompetitionListParams } from '../types'
import { toast } from 'sonner'

export const competitionKeys = {
  all: ['competitions'] as const,
  lists: () => [...competitionKeys.all, 'list'] as const,
  list: (params?: CompetitionListParams) => [...competitionKeys.lists(), params] as const,
  details: () => [...competitionKeys.all, 'detail'] as const,
  detail: (id: string) => [...competitionKeys.details(), id] as const,
}

/**
 * Fetch the paginated/filtered list of competitions.
 */
export function useCompetitions(params?: CompetitionListParams) {
  return useQuery({
    queryKey: competitionKeys.list(params),
    queryFn: () => competitionApi.list(params),
  })
}

/**
 * Fetch a single competition by ID.
 */
export function useCompetition(id: string) {
  return useQuery({
    queryKey: competitionKeys.detail(id),
    queryFn: () => competitionApi.get(id),
    enabled: Boolean(id),
  })
}

/**
 * Mutation: Create a new competition (org admin).
 */
export function useCreateCompetition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CompetitionCreateData) => competitionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.all })
      toast.success('Competição criada com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao criar competição.')
    },
  })
}

/**
 * Mutation: Update an existing competition (org admin).
 */
export function useUpdateCompetition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompetitionUpdateData }) =>
      competitionApi.update(id, data),
    onSuccess: (_data, { id }) => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.detail(id) })
      queryClient.invalidateQueries({ queryKey: competitionKeys.lists() })
      toast.success('Competição atualizada!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao atualizar competição.')
    },
  })
}

