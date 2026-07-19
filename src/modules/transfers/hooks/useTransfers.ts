import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { useAuth } from '@/app/providers'
import { transferApi } from '../services'
import type { TransferListParams, CreateTransferPayload } from '../types'

export const transferKeys = {
  all: ['transfers'] as const,
  lists: () => [...transferKeys.all, 'list'] as const,
  list: (params?: TransferListParams) => [...transferKeys.lists(), params] as const,
  details: () => [...transferKeys.all, 'detail'] as const,
  detail: (id?: string) => [...transferKeys.details(), id] as const,
  pending: (clubId?: string) => [...transferKeys.all, 'pending', clubId] as const,
  activeLoans: (clubId?: string) => [...transferKeys.all, 'active-loans', clubId] as const,
}

function errorMessage(error: unknown, fallback: string) {
  const data = (error as { response?: { data?: { error?: string; message?: string } } })?.response?.data
  return data?.error || data?.message || fallback
}

export function useTransfers(params?: TransferListParams) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: transferKeys.list(params),
    queryFn: () => transferApi.list(params),
    enabled: isAuthenticated,
    staleTime: 60_000,
    retry: false,
  })
}

export function useTransferDetail(id?: string) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: transferKeys.detail(id),
    queryFn: () => transferApi.get(id!),
    enabled: isAuthenticated && !!id,
    staleTime: 30_000,
    retry: false,
  })
}

/** Alias kept for consumers that used the clubs hook name. */
export const useTransfer = useTransferDetail

export function usePendingTransferApprovals(clubId?: string) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: transferKeys.pending(clubId),
    queryFn: () => transferApi.pendingApprovals(clubId),
    enabled: isAuthenticated,
    staleTime: 30_000,
  })
}

export function useActiveLoans(clubId?: string) {
  const { isAuthenticated } = useAuth()

  return useQuery({
    queryKey: transferKeys.activeLoans(clubId),
    queryFn: () => transferApi.activeLoans(clubId),
    enabled: isAuthenticated,
    staleTime: 60_000,
  })
}

export function useCreateTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: CreateTransferPayload) => transferApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      toast.success('Transferência registada com sucesso.')
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, 'Erro ao registar transferência.'))
    },
  })
}

export function useApproveTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transferApi.approve(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.setQueryData(transferKeys.detail(data.id), data)
      toast.success('Transferência aprovada com sucesso.')
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, 'Erro ao aprovar transferência.'))
    },
  })
}

export function useRejectTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      transferApi.reject(id, reason ?? ''),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.setQueryData(transferKeys.detail(data.id), data)
      toast.success('Transferência rejeitada.')
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, 'Erro ao rejeitar transferência.'))
    },
  })
}

export function useCompleteTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transferApi.complete(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.setQueryData(transferKeys.detail(data.id), data)
      toast.success('Transferência concluída.')
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, 'Erro ao concluir transferência.'))
    },
  })
}

export function useCancelTransfer() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, reason }: { id: string; reason?: string }) =>
      transferApi.cancel(id, reason ?? ''),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.setQueryData(transferKeys.detail(data.id), data)
      toast.success('Transferência cancelada.')
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, 'Erro ao cancelar transferência.'))
    },
  })
}

export function useExtendLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, newEndDate }: { id: string; newEndDate: string }) =>
      transferApi.extendLoan(id, newEndDate),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.setQueryData(transferKeys.detail(data.id), data)
      toast.success('Empréstimo prolongado.')
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, 'Erro ao prolongar empréstimo.'))
    },
  })
}

export function useReturnLoan() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => transferApi.returnLoan(id),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.setQueryData(transferKeys.detail(data.id), data)
      toast.success('Empréstimo devolvido.')
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, 'Erro ao devolver empréstimo.'))
    },
  })
}

export function useMakeLoanPermanent() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, fee }: { id: string; fee?: number | null }) =>
      transferApi.makePermanent(id, fee),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: transferKeys.all })
      queryClient.setQueryData(transferKeys.detail(data.id), data)
      toast.success('Empréstimo convertido em transferência permanente.')
    },
    onError: (error: unknown) => {
      toast.error(errorMessage(error, 'Erro ao tornar permanente.'))
    },
  })
}
