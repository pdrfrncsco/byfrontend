import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/app/providers'
import {
  listClubPlayerRegistrationRequests,
  listClubCompetitions,
  listMyRegistrationRequests,
  acceptRegistrationRequest,
  reviewClubPlayerRegistrationRequest,
  submitRegistrationRequest,
} from '../services'
import { playerKeys } from './usePlayerQueries'
import type { PlayerRegistrationRequestCreate, PlayerRegistrationRequestReview } from '../types'

export const registrationRequestKeys = {
  all: ['player-registration-requests'] as const,
  mine: () => [...registrationRequestKeys.all, 'mine'] as const,
  club: (clubId: string) => [...registrationRequestKeys.all, 'club', clubId] as const,
  competitions: (clubId: string) => [...registrationRequestKeys.all, 'competitions', clubId] as const,
}

export function useClubCompetitions(clubId?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: registrationRequestKeys.competitions(clubId ?? ''),
    queryFn: () => listClubCompetitions(clubId ?? ''),
    enabled: isAuthenticated && !!clubId,
  })
}

export function useMyRegistrationRequests() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: registrationRequestKeys.mine(),
    queryFn: listMyRegistrationRequests,
    enabled: isAuthenticated,
  })
}

// Backwards-compatible alias: outgoing requests from the player
export function usePlayerOutgoingRequests() {
  return useMyRegistrationRequests()
}

export function useSubmitRegistrationRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: PlayerRegistrationRequestCreate) => submitRegistrationRequest(data),
    onSuccess: () => {
      toast.success('Pedido de vínculo enviado com sucesso.')
      queryClient.invalidateQueries({ queryKey: registrationRequestKeys.mine() })
      queryClient.invalidateQueries({ queryKey: playerKeys.me() })
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Não foi possível enviar o pedido de vínculo.'
      toast.error(message)
    },
  })
}

export function useClubPlayerRegistrationRequests(clubId?: string) {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: registrationRequestKeys.club(clubId ?? ''),
    queryFn: () => listClubPlayerRegistrationRequests(clubId ?? ''),
    enabled: isAuthenticated && !!clubId,
  })
}

// Backwards-compatible alias: incoming requests for clubs
export function useClubIncomingRequests(clubId?: string) {
  return useClubPlayerRegistrationRequests(clubId)
}

export function useReviewClubPlayerRegistrationRequest(clubId?: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlayerRegistrationRequestReview }) =>
      reviewClubPlayerRegistrationRequest(clubId ?? '', id, data),
    onSuccess: (_result, variables) => {
      const action = variables.data.approve ? 'aprovado' : 'rejeitado'
      toast.success(`Pedido ${action} com sucesso.`)
      queryClient.invalidateQueries({ queryKey: registrationRequestKeys.club(clubId ?? '') })
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao processar pedido.'
      toast.error(message)
    },
  })
}

export function useAcceptRegistrationRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (requestId: string) => acceptRegistrationRequest(requestId),
    onSuccess: () => {
      toast.success('Vínculo aceito com sucesso.')
      queryClient.invalidateQueries({ queryKey: registrationRequestKeys.mine() })
      queryClient.invalidateQueries({ queryKey: playerKeys.me() })
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao aceitar o vínculo.'
      toast.error(message)
    },
  })
}
