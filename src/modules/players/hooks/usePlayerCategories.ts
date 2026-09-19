/**
 * BOLAYETU — Player Categories Hooks
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { playerCategoryApi } from '../services/player-category.api'
import type { CreateCategoryDto, UpdateCategoryDto } from '../types/player-category.types'

export const playerCategoryKeys = {
  all: ['playerCategories'] as const,
  federation: (orgIdOrSlug: string = 'me') => [...playerCategoryKeys.all, 'federation', orgIdOrSlug] as const,
  club: (clubIdOrSlug: string = 'me') => [...playerCategoryKeys.all, 'club', clubIdOrSlug] as const,
}

/**
 * Fetch official federation categories.
 */
export function useFederationCategories(orgIdOrSlug: string = 'me') {
  return useQuery({
    queryKey: playerCategoryKeys.federation(orgIdOrSlug),
    queryFn: () => playerCategoryApi.getFederationCategories(orgIdOrSlug),
    enabled: !!orgIdOrSlug,
  })
}

/**
 * Fetch all categories available to a club (federation + custom club categories).
 */
export function useClubCategories(clubIdOrSlug: string = 'me') {
  return useQuery({
    queryKey: playerCategoryKeys.club(clubIdOrSlug),
    queryFn: () => playerCategoryApi.getClubCategories(clubIdOrSlug),
    enabled: !!clubIdOrSlug,
  })
}

/**
 * Hook to create a custom category for a club.
 */
export function useCreateClubCategory(clubIdOrSlug: string = 'me') {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateCategoryDto) => playerCategoryApi.createClubCategory(clubIdOrSlug, data),
    onSuccess: (newCategory) => {
      queryClient.invalidateQueries({ queryKey: playerCategoryKeys.club(clubIdOrSlug) })
      toast.success(`Categoria "${newCategory.name}" criada com sucesso!`)
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Falha ao criar categoria.'
      toast.error(message)
    },
  })
}

/**
 * Hook to update a custom category for a club.
 */
export function useUpdateClubCategory(clubIdOrSlug: string = 'me') {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ categoryId, data }: { categoryId: string; data: UpdateCategoryDto }) =>
      playerCategoryApi.updateClubCategory(clubIdOrSlug, categoryId, data),
    onSuccess: (updated) => {
      queryClient.invalidateQueries({ queryKey: playerCategoryKeys.club(clubIdOrSlug) })
      toast.success(`Categoria "${updated.name}" atualizada!`)
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Falha ao atualizar categoria.'
      toast.error(message)
    },
  })
}

/**
 * Hook to delete a custom category for a club.
 */
export function useDeleteClubCategory(clubIdOrSlug: string = 'me') {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (categoryId: string) => playerCategoryApi.deleteClubCategory(clubIdOrSlug, categoryId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerCategoryKeys.club(clubIdOrSlug) })
      toast.success('Categoria eliminada com sucesso.')
    },
    onError: (err: any) => {
      const message = err?.response?.data?.message || 'Falha ao eliminar categoria.'
      toast.error(message)
    },
  })
}
