import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/app/providers'
import { organizationApi } from '../services/organization.api'
import type {
  OrganizationListParams,
  OrganizationUpdateData,
  OrgMemberInviteData,
  ClubAffiliationReviewData,
} from '../types'

/**
 * Query keys factory for organization queries.
 */
export const organizationKeys = {
  all: ['organizations'] as const,
  me: ['organization', 'me'] as const,
  onboardingStatus: ['organization', 'onboarding-status'] as const,
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
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: organizationKeys.me,
    queryFn: () => organizationApi.getMe(),
    enabled: isAuthenticated,
  })
}

export function useOnboardingStatus(enabled = true) {
  return useQuery({
    queryKey: organizationKeys.onboardingStatus,
    queryFn: () => organizationApi.getOnboardingStatus(),
    enabled,
    staleTime: 30_000,
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
      queryClient.invalidateQueries({ queryKey: organizationKeys.onboardingStatus })
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
      queryClient.invalidateQueries({ queryKey: organizationKeys.onboardingStatus })
    },
  })
}

export function useUploadBanner() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => organizationApi.uploadBanner(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: organizationKeys.me })
      queryClient.invalidateQueries({ queryKey: organizationKeys.onboardingStatus })
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
      queryClient.invalidateQueries({ queryKey: organizationKeys.onboardingStatus })
      queryClient.invalidateQueries({ queryKey: organizationKeys.all })
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

// ── Phase C: Member Management ────────────────────────────────────────────────

/**
 * Hook para listar membros da organização
 */
export function useOrganizationMembers() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['organization', 'members'],
    queryFn: () => organizationApi.getMembers(),
    enabled: isAuthenticated,
  })
}

/**
 * Hook para convidar membro
 */
export function useAddMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: OrgMemberInviteData) => organizationApi.addMember(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'members'] })
      toast.success('Membro convidado com sucesso.')
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao convidar membro.'
      toast.error(message)
    },
  })
}

/**
 * Hook para atualizar membro
 */
export function useUpdateMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<{ role: string; is_active: boolean }> }) =>
      organizationApi.updateMember(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization', 'members'] })
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao atualizar membro.'
      toast.error(message)
    },
  })
}

/**
 * Hook para remover membro
 */
export function useRemoveMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => organizationApi.removeMember(id),
    onSuccess: () => {
      toast.success('Membro removido com sucesso.')
      queryClient.invalidateQueries({ queryKey: ['organization', 'members'] })
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao remover membro.'
      toast.error(message)
    },
  })
}

// ── Phase C: Club Affiliation Requests ────────────────────────────────────────

/**
 * Hook para listar pedidos de filiação de clubes
 */
export function useOrganizationClubRequests() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: ['organization', 'club-requests'],
    queryFn: () => organizationApi.getClubRequests(),
    enabled: isAuthenticated,
  })
}

/**
 * Hook para rever pedido de filiação de clube
 */
export function useReviewClubRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: ClubAffiliationReviewData }) =>
      organizationApi.reviewClubRequest(id, data),
    onSuccess: (_result, variables) => {
      const action = variables.data.approve ? 'aprovado' : 'rejeitado'
      toast.success(`Pedido ${action} com sucesso.`)
      queryClient.invalidateQueries({ queryKey: ['organization', 'club-requests'] })
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao processar pedido.'
      toast.error(message)
    },
  })
}
