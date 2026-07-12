import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/app/providers'
import {
  listClubPlayerRegistrationRequests,
  listMyRegistrationRequests,
  reviewClubPlayerRegistrationRequest,
  submitRegistrationRequest,
} from '../services'
import { playerKeys } from './usePlayerQueries'
import type { PlayerRegistrationRequestCreate, PlayerRegistrationRequestReview } from '../types'

export const registrationRequestKeys = {
  all: ['player-registration-requests'] as const,
  mine: () => [...registrationRequestKeys.all, 'mine'] as const,
  club: () => [...registrationRequestKeys.all, 'club'] as const,
}

export function useMyRegistrationRequests() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: registrationRequestKeys.mine(),
    queryFn: listMyRegistrationRequests,
    enabled: isAuthenticated,
  })
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

export function useClubPlayerRegistrationRequests() {
  const { isAuthenticated } = useAuth()
  return useQuery({
    queryKey: registrationRequestKeys.club(),
    queryFn: listClubPlayerRegistrationRequests,
    enabled: isAuthenticated,
  })
}

export function useReviewClubPlayerRegistrationRequest() {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: PlayerRegistrationRequestReview }) =>
      reviewClubPlayerRegistrationRequest(id, data),
    onSuccess: (_result, variables) => {
      const action = variables.data.approve ? 'aprovado' : 'rejeitado'
      toast.success(`Pedido ${action} com sucesso.`)
      queryClient.invalidateQueries({ queryKey: registrationRequestKeys.club() })
    },
    onError: (error: unknown) => {
      const message =
        (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Erro ao processar pedido.'
      toast.error(message)
    },
  })
}
