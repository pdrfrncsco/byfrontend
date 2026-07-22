import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/app/providers'
import * as service from '@/modules/clubs/services'
import type {
  ClubListParams,
  ClubCreateData,
  ClubUpdateData,
  ClubMemberCreateData,
  ClubMemberUpdateData,
  ClubDocumentCreateData,
  ClubSponsorCreateData,
} from '@/modules/clubs/types'

export const clubKeys = {
  all: ['clubs'] as const,
  lists: () => [...clubKeys.all, 'list'] as const,
  list: (params?: ClubListParams) => [...clubKeys.lists(), params] as const,
  details: () => [...clubKeys.all, 'detail'] as const,
  detail: (slug: string) => [...clubKeys.details(), slug] as const,
  kpis: (slug: string) => [...clubKeys.all, slug, 'kpis'] as const,
  squad: (slug: string) => [...clubKeys.all, slug, 'squad'] as const,
  staff: (slug: string) => [...clubKeys.all, slug, 'staff'] as const,
  publicDocuments: (slug: string) => [...clubKeys.all, slug, 'documents', 'public'] as const,
  documents: (slug: string) => [...clubKeys.all, slug, 'documents', 'private'] as const,
  publicSponsors: (slug: string) => [...clubKeys.all, slug, 'sponsors', 'public'] as const,
  sponsors: (slug: string) => [...clubKeys.all, slug, 'sponsors', 'private'] as const,
  members: (slug: string) => [...clubKeys.all, slug, 'members'] as const,
  me: () => [...clubKeys.all, 'me'] as const,
  competitions: (slug: string) => [...clubKeys.all, slug, 'competitions'] as const,
  matches: (slug: string, params?: { status?: string; competition_id?: string }) =>
    [...clubKeys.all, slug, 'matches', params] as const,
  standings: (slug: string, competitionId?: string) => [...clubKeys.all, slug, 'standings', competitionId] as const,
  meCompetitions: () => [...clubKeys.all, 'me', 'competitions'] as const,
  meMatches: (params?: { status?: string; competition_id?: string }) =>
    [...clubKeys.all, 'me', 'matches', params] as const,
  meStandings: (competitionId?: string) => [...clubKeys.all, 'me', 'standings', competitionId] as const,
}


export function useClubs(params?: ClubListParams) {
  return useQuery({
    queryKey: clubKeys.list(params),
    queryFn: () => service.listClubs(params),
  })
}

export function useClub(slug?: string) {
  return useQuery({
    queryKey: clubKeys.detail(slug || ''),
    queryFn: () => (slug ? service.getClub(slug) : Promise.resolve(null)),
    enabled: !!slug,
  })
}

export function useClubKpis(slug?: string) {
  return useQuery({
    queryKey: clubKeys.kpis(slug || ''),
    queryFn: () => (slug ? service.getClubKpis(slug) : Promise.resolve(null)),
    enabled: !!slug,
  })
}

export function useClubSquad(slug?: string) {
  return useQuery({
    queryKey: clubKeys.squad(slug || ''),
    queryFn: () => (slug ? service.getClubSquad(slug) : Promise.resolve([])),
    enabled: !!slug,
  })
}

export function useClubStaff(slug?: string) {
  return useQuery({
    queryKey: clubKeys.staff(slug || ''),
    queryFn: () => (slug ? service.getClubStaff(slug) : Promise.resolve([])),
    enabled: !!slug,
  })
}

export function useClubPublicDocuments(slug?: string) {
  return useQuery({
    queryKey: clubKeys.publicDocuments(slug || ''),
    queryFn: () => (slug ? service.getClubPublicDocuments(slug) : Promise.resolve([])),
    enabled: !!slug,
  })
}

export function useClubPublicSponsors(slug?: string) {
  return useQuery({
    queryKey: clubKeys.publicSponsors(slug || ''),
    queryFn: () => (slug ? service.getClubPublicSponsors(slug) : Promise.resolve([])),
    enabled: !!slug,
  })
}

export function useClubMe() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: clubKeys.me(),
    queryFn: () => service.getClubMe(),
    enabled: isAuthenticated,
  })
}

export function useCreateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClubCreateData) => service.createClub(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() })
      queryClient.invalidateQueries({ queryKey: clubKeys.me() })
      toast.success('Clube criado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao criar clube.'
      toast.error(message)
    },
  })
}

export function useUpdateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: ClubUpdateData) => service.updateClub(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.details() })
      queryClient.invalidateQueries({ queryKey: clubKeys.me() })
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() })
      toast.success('Clube atualizado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao atualizar clube.'
      toast.error(message)
    },
  })
}

export function useUploadClubLogo() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (file: File) => service.uploadClubLogo(file),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: clubKeys.details() })
      queryClient.invalidateQueries({ queryKey: clubKeys.me() })
      toast.success('Logo atualizado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao fazer upload do logo.'
      toast.error(message)
    },
  })
}

export function useActivateClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => service.activateClub(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(slug) })
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() })
      toast.success('Clube ativado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao ativar clube.'
      toast.error(message)
    },
  })
}

export function useSuspendClub() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (slug: string) => service.suspendClub(slug),
    onSuccess: (_, slug) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.detail(slug) })
      queryClient.invalidateQueries({ queryKey: clubKeys.lists() })
      toast.success('Clube suspenso com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao suspender clube.'
      toast.error(message)
    },
  })
}

export function useClubMembers(slug?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: clubKeys.members(slug || ''),
    queryFn: () => (slug ? service.listClubMembers(slug) : Promise.resolve([])),
    enabled: !!slug && isAuthenticated,
  })
}

export function useAddClubMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: ClubMemberCreateData }) => service.addClubMember(slug, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.members(variables.slug) })
      toast.success('Membro adicionado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao adicionar membro.'
      toast.error(message)
    },
  })
}

export function useUpdateClubMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, memberId, data }: { slug: string; memberId: string; data: ClubMemberUpdateData }) =>
      service.updateClubMember(slug, memberId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.members(variables.slug) })
      toast.success('Membro atualizado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao atualizar membro.'
      toast.error(message)
    },
  })
}

export function useRemoveClubMember() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, memberId }: { slug: string; memberId: string }) => service.removeClubMember(slug, memberId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.members(variables.slug) })
      toast.success('Membro removido com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao remover membro.'
      toast.error(message)
    },
  })
}

export function useClubDocuments(slug?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: clubKeys.documents(slug || ''),
    queryFn: () => (slug ? service.listClubDocuments(slug) : Promise.resolve([])),
    enabled: !!slug && isAuthenticated,
  })
}

export function useCreateClubDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: ClubDocumentCreateData }) => service.createClubDocument(slug, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.documents(variables.slug) })
      toast.success('Documento adicionado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao adicionar documento.'
      toast.error(message)
    },
  })
}

export function useDeleteClubDocument() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, documentId }: { slug: string; documentId: string }) => service.deleteClubDocument(slug, documentId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.documents(variables.slug) })
      toast.success('Documento eliminado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao eliminar documento.'
      toast.error(message)
    },
  })
}

export function useClubSponsors(slug?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: clubKeys.sponsors(slug || ''),
    queryFn: () => (slug ? service.listClubSponsors(slug) : Promise.resolve([])),
    enabled: !!slug && isAuthenticated,
  })
}

export function useCreateClubSponsor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, data }: { slug: string; data: ClubSponsorCreateData }) => service.createClubSponsor(slug, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.sponsors(variables.slug) })
      toast.success('Patrocinador adicionado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao adicionar patrocinador.'
      toast.error(message)
    },
  })
}

export function useDeleteClubSponsor() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ slug, sponsorId }: { slug: string; sponsorId: string }) => service.deleteClubSponsor(slug, sponsorId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: clubKeys.sponsors(variables.slug) })
      toast.success('Patrocinador eliminado com sucesso.')
    },
    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })?.response?.data?.message || 'Erro ao eliminar patrocinador.'
      toast.error(message)
    },
  })
}

export function useClubPublicCompetitions(slug?: string) {
  return useQuery({
    queryKey: clubKeys.competitions(slug || ''),
    queryFn: () => (slug ? service.getClubPublicCompetitions(slug) : Promise.resolve([])),
    enabled: !!slug,
  })
}

export function useClubPublicMatches(slug?: string, params?: { status?: string; competition_id?: string }) {
  return useQuery({
    queryKey: clubKeys.matches(slug || '', params),
    queryFn: () => (slug ? service.getClubPublicMatches(slug, params) : Promise.resolve([])),
    enabled: !!slug,
  })
}

export function useClubPublicStandings(slug?: string, competitionId?: string) {
  return useQuery({
    queryKey: clubKeys.standings(slug || '', competitionId),
    queryFn: () => (slug ? service.getClubPublicStandings(slug, competitionId) : Promise.resolve([])),
    enabled: !!slug,
  })
}

export function useClubMeCompetitions() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: clubKeys.meCompetitions(),
    queryFn: () => service.getClubMeCompetitions(),
    enabled: isAuthenticated,
  })
}

export function useClubMeMatches(params?: { status?: string; competition_id?: string }) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: clubKeys.meMatches(params),
    queryFn: () => service.getClubMeMatches(params),
    enabled: isAuthenticated,
  })
}

export function useClubMeStandings(competitionId?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: clubKeys.meStandings(competitionId),
    queryFn: () => service.getClubMeStandings(competitionId),
    enabled: isAuthenticated,
  })
}

export const usePublicClubDocuments = useClubPublicDocuments
export const usePublicClubSponsors = useClubPublicSponsors


// Transfer hooks live in `@/modules/transfers` — re-exported for legacy club imports.
export {
  useTransfers,
  useTransfer,
  useTransferDetail,
  useCreateTransfer,
  useApproveTransfer,
  useRejectTransfer,
  useCompleteTransfer,
  useCancelTransfer,
} from '@/modules/transfers/hooks'
