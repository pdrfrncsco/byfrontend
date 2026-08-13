// Players module — Contract hooks (using services layer)

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  listPlayerContracts,
  getContractDetail,
  createPlayerContract,
  updatePlayerContract,
  deletePlayerContract,
  signPlayerContract,
  renewPlayerContract,
  terminatePlayerContract,
} from '../services'
import { playerKeys } from './usePlayerQueries'

// Re-export playerKeys contracts for backward compatibility
export const contractKeys = {
  all: ['player-contracts'] as const,
  list: (playerId: string) => [...contractKeys.all, playerId] as const,
  detail: (playerId: string, contractId: string) => [...contractKeys.all, playerId, contractId] as const,
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function usePlayerContracts(playerId: string, enabled = true) {
  return useQuery({
    queryKey: playerKeys.contracts(playerId),
    queryFn: () => listPlayerContracts(playerId),
    enabled: enabled && !!playerId,
    staleTime: 5 * 60_000,
  })
}

export function useContractDetails(playerId: string, contractId: string, enabled = true) {
  return useQuery({
    queryKey: playerKeys.contractDetail(playerId, contractId),
    queryFn: () => getContractDetail(playerId, contractId),
    enabled: enabled && !!playerId && !!contractId,
    staleTime: 5 * 60_000,
  })
}

// ─── Mutation Hooks ───────────────────────────────────────────────────────────

export function useCreateContract(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof createPlayerContract>[1]) =>
      createPlayerContract(playerId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
    },
  })
}

export function useUpdateContract(playerId: string, contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof updatePlayerContract>[2]) =>
      updatePlayerContract(playerId, contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.contractDetail(playerId, contractId) })
    },
  })
}

export function useDeleteContract(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (contractId: string) => deletePlayerContract(playerId, contractId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
    },
  })
}

export function useSignContract(playerId: string, contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof signPlayerContract>[2]) =>
      signPlayerContract(playerId, contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.contractDetail(playerId, contractId) })
    },
  })
}

export function useRenewContract(playerId: string, contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof renewPlayerContract>[2]) =>
      renewPlayerContract(playerId, contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.contractDetail(playerId, contractId) })
    },
  })
}

export function useTerminateContract(playerId: string, contractId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (data: Parameters<typeof terminatePlayerContract>[2]) =>
      terminatePlayerContract(playerId, contractId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: playerKeys.contracts(playerId) })
      queryClient.invalidateQueries({ queryKey: playerKeys.contractDetail(playerId, contractId) })
    },
  })
}

// ─── Utility Functions ────────────────────────────────────────────────────────

export function getActiveContract(contracts: PlayerContract[]): PlayerContract | null {
  return contracts.find((c) => c.status === 'active') ?? null
}

export function formatCurrency(amount: number | undefined | null, currency = 'USD'): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function getContractStatusInfo(status: string): {
  label: string
  color: string
  bgColor: string
  borderColor: string
} {
  const map: Record<string, ReturnType<typeof getContractStatusInfo>> = {
    draft:      { label: 'Rascunho',  color: 'text-gray-700',   bgColor: 'bg-gray-100',   borderColor: 'border-gray-200' },
    active:     { label: 'Ativo',     color: 'text-green-700',  bgColor: 'bg-green-100',  borderColor: 'border-green-200' },
    expired:    { label: 'Expirado',  color: 'text-orange-700', bgColor: 'bg-orange-100', borderColor: 'border-orange-200' },
    terminated: { label: 'Terminado', color: 'text-red-700',    bgColor: 'bg-red-100',    borderColor: 'border-red-200' },
    suspended:  { label: 'Suspenso',  color: 'text-yellow-700', bgColor: 'bg-yellow-100', borderColor: 'border-yellow-200' },
  }
  return map[status] ?? map['draft']
}

export function getContractTypeLabel(type: string): string {
  const map: Record<string, string> = {
    professional: 'Profissional',
    youth:        'Juniores',
    amateur:      'Amador',
    short_term:   'Curto Prazo',
    trial:        'Período de Teste',
    loan:         'Empréstimo',
    extension:    'Renovação',
  }
  return map[type] ?? type
}

export function getContractDuration(startDate: string, endDate: string): number {
  return Math.ceil(
    Math.abs(new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  )
}

export function isContractExpiringSoon(endDate: string): boolean {
  const days = Math.floor(
    (new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  return days > 0 && days <= 90
}

export function isContractFullySigned(contract: PlayerContract): boolean {
  return contract.signed_by_player && contract.signed_by_club
}
