import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { organizationApi } from '../services/organization.api'
import type { OrganizationListParams, OrganizationUpdateData } from '../types'

/**
 * Query keys factory for organization queries.
 */
export const organizationKeys = {
  all: ['organizations'] as const,
  me: ['organization', 'me'] as const,
  publicList: (params?: OrganizationListParams) =>
    ['organizations', 'public', params] as const,
  publicDetail: (slug: string) => ['organization', 'public', slug] as const,
  kpis: (slug: string) => ['organization', slug, 'kpis'] as const,
  history: (slug: string) => ['organization', slug, 'history'] as const,
  tournaments: (slug: string) => ['organization', slug, 'tournaments'] as const,
  clubs: (slug: string) => ['organization', slug, 'clubs'] as const,
}

/**
 * Hook para obter a organização do usuário autenticado
 */
export function useOrganizationMe() {
  return useQuery({
    queryKey: organizationKeys.me,
    queryFn: () => organizationApi.getMe(),
  })
}

/**
 * Hook para atualizar a organização do usuário
 */
export function useUpdateOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OrganizationUpdateData) => organizationApi.updateMe(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.me })
    },
  })
}

/**
 * Hook para upload do logo
 */
export function useUploadLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => organizationApi.uploadLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.me })
    },
  })
}

/**
 * Hook para lançar o portal após onboarding
 */
export function useLaunchOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: () => organizationApi.launchPortal(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.me })
    },
  })
}

/**
 * Hook para listar organizações públicas
 */
export function usePublicOrganizations(params?: OrganizationListParams) {
  return useQuery({
    queryKey: organizationKeys.publicList(params),
    queryFn: () => organizationApi.listPublic(params),
  })
}

/**
 * Hook para detalhes de uma organização pública
 */
export function usePublicOrganizationDetail(slug: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.publicDetail(slug || ''),
    queryFn: () => organizationApi.getPublicDetail(slug!),
    enabled: !!slug,
  })
}

/**
 * Hook para subscrever a uma organização
 */
export function useSubscribeOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => organizationApi.subscribe(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all })
      toast.success('Subscrito com sucesso.')
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Erro ao subscrever.'
      toast.error(message)
    },
  })
}

/**
 * Hook para cancelar subscrição
 */
export function useUnsubscribeOrganization() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => organizationApi.unsubscribe(slug),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.all })
      toast.success('Subscrição cancelada com sucesso.')
    },
    onError: (error: any) => {
      const message =
        error?.response?.data?.message || 'Erro ao cancelar subscrição.'
      toast.error(message)
    },
  })
}

/**
 * Hook para torneios de uma organização
 */
export function useOrganizationTournaments(slug: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.tournaments(slug || ''),
    queryFn: () => organizationApi.getTournaments(slug!),
    enabled: !!slug,
  })
}

/**
 * Hook para clubes de uma organização
 */
export function useOrganizationClubs(slug: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.clubs(slug || ''),
    queryFn: () => organizationApi.getClubs(slug!),
    enabled: !!slug,
  })
}

/**
 * Hook para histórico de uma organização
 */
export function useOrganizationHistory(slug: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.history(slug || ''),
    queryFn: () => organizationApi.getHistory(slug!),
    enabled: !!slug,
  })
}

/**
 * Hook para KPIs de uma organização
 */
export function useOrganizationKpis(slug: string | undefined) {
  return useQuery({
    queryKey: organizationKeys.kpis(slug || ''),
    queryFn: () => organizationApi.getKpis(slug!),
    enabled: !!slug,
  })
}
