import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'
import type { CompetitionCreateData, CompetitionUpdateData } from '../types'

export const competitionKeys = {
  all: ['competitions'] as const,
  list: ['competitions', 'list'] as const,
  detail: (id: string) => ['competitions', id] as const,
}

export function useCompetitions() {
  return useQuery({
    queryKey: competitionKeys.list,
    queryFn: () => competitionApi.list(),
  })
}

export function useCreateCompetition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: CompetitionCreateData) => competitionApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.all })
    },
  })
}

export function useUpdateCompetition() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: CompetitionUpdateData }) =>
      competitionApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: competitionKeys.all })
    },
  })
}
