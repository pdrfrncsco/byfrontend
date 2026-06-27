import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { organizationApi } from '../services/organization.api'
import type { OrganizationListParams, OrganizationUpdateData } from '../types'

/**
 * Hook para obter a organização do usuário autenticado
 */
export function useOrganizationMe() {
  return useQuery({
    queryKey: ['organization', 'me'],
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
      queryClient.invalidateQueries({ queryKey: ['organization', 'me'] })
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
      queryClient.invalidateQueries({ queryKey: ['organization', 'me'] })
    },
  })
}

/**
 * Hook para listar organizações públicas
 */
export function usePublicOrganizations(params?: OrganizationListParams) {
  return useQuery({
    queryKey: ['organizations', 'public', params],
    queryFn: () => organizationApi.listPublic(params),
  })
}

/**
 * Hook para detalhes de uma organização pública
 */
export function usePublicOrganizationDetail(slug: string | undefined) {
  return useQuery({
    queryKey: ['organization', 'public', slug],
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
      queryClient.invalidateQueries({ queryKey: ['organizations', 'public'] })
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
      queryClient.invalidateQueries({ queryKey: ['organizations', 'public'] })
    },
  })
}

/**
 * Hook para torneios de uma organização
 */
export function useOrganizationTournaments(slug: string | undefined) {
  return useQuery({
    queryKey: ['organization', slug, 'tournaments'],
    queryFn: () => organizationApi.getTournaments(slug!),
    enabled: !!slug,
  })
}

/**
 * Hook para clubes de uma organização
 */
export function useOrganizationClubs(slug: string | undefined) {
  return useQuery({
    queryKey: ['organization', slug, 'clubs'],
    queryFn: () => organizationApi.getClubs(slug!),
    enabled: !!slug,
  })
}

/**
 * Hook para histórico de uma organização
 */
export function useOrganizationHistory(slug: string | undefined) {
  return useQuery({
    queryKey: ['organization', slug, 'history'],
    queryFn: () => organizationApi.getHistory(slug!),
    enabled: !!slug,
  })
}

/**
 * Hook para KPIs de uma organização
 */
export function useOrganizationKpis(slug: string | undefined) {
  return useQuery({
    queryKey: ['organization', slug, 'kpis'],
    queryFn: () => organizationApi.getKpis(slug!),
    enabled: !!slug,
  })
}
