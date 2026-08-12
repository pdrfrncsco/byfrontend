import { useCallback, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { Player } from '../types'

export interface PlayerContract {
  id: string
  player: string
  club: {
    id: string
    name: string
    slug: string
    logo?: string
  }
  contract_type: 'professional' | 'youth' | 'amateur' | 'short_term' | 'trial' | 'loan' | 'extension'
  status: 'draft' | 'active' | 'expired' | 'terminated' | 'suspended'
  start_date: string
  end_date: string
  signed_date?: string
  salary?: number
  currency: string
  bonuses?: Record<string, number>
  release_clause?: number
  has_image_rights: boolean
  option_year: boolean
  termination_clause?: string
  contract_document?: {
    id: string
    url: string
    name: string
  }
  signed_by_player: boolean
  signed_by_club: boolean
  verified_at?: string
  verified_by?: {
    id: string
    name: string
  }
  created_at: string
  updated_at: string
}

export interface CreateContractInput {
  club: string
  contract_type: string
  status?: string
  start_date: string
  end_date: string
  salary?: number
  currency?: string
  bonuses?: Record<string, number>
  release_clause?: number
  has_image_rights?: boolean
  option_year?: boolean
  termination_clause?: string
}

export interface UpdateContractInput extends Partial<CreateContractInput> {
  signed_by_player?: boolean
  signed_by_club?: boolean
}

/**
 * Hook to fetch player contracts
 */
export function usePlayerContracts(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-contracts', playerId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/players/${playerId}/contracts/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch contracts: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  })
}

/**
 * Hook to fetch single contract details
 */
export function useContractDetails(playerId: string, contractId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['contract', playerId, contractId],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/contracts/${contractId}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch contract: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId && !!contractId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to create a new contract
 */
export function useCreateContract(playerId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (data: CreateContractInput) => {
      const response = await fetch(`${apiUrl}/players/${playerId}/contracts/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to create contract: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-contracts', playerId] })
    },
  })
}

/**
 * Hook to update a contract
 */
export function useUpdateContract(playerId: string, contractId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (data: UpdateContractInput) => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/contracts/${contractId}/`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
          body: JSON.stringify(data),
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to update contract: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-contracts', playerId] })
      queryClient.invalidateQueries({ queryKey: ['contract', playerId, contractId] })
    },
  })
}

/**
 * Hook to delete a contract
 */
export function useDeleteContract(playerId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (contractId: string) => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/contracts/${contractId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to delete contract: ${response.statusText}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-contracts', playerId] })
    },
  })
}

/**
 * Get active contract from list
 */
export function getActiveContract(contracts: PlayerContract[]): PlayerContract | null {
  return contracts.find((c) => c.status === 'active') || null
}

/**
 * Format currency amount
 */
export function formatCurrency(amount: number | undefined, currency = 'USD'): string {
  if (amount === undefined) return '—'
  
  const formatter = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: currency || 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return formatter.format(amount)
}

/**
 * Get contract status label and color
 */
export function getContractStatusInfo(status: string): {
  label: string
  color: string
  bgColor: string
  borderColor: string
} {
  const statusMap: Record<string, any> = {
    draft: {
      label: 'Rascunho',
      color: 'text-gray-700',
      bgColor: 'bg-gray-100',
      borderColor: 'border-gray-200',
    },
    active: {
      label: 'Ativo',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200',
    },
    expired: {
      label: 'Expirado',
      color: 'text-orange-700',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200',
    },
    terminated: {
      label: 'Terminado',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      borderColor: 'border-red-200',
    },
    suspended: {
      label: 'Suspenso',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      borderColor: 'border-yellow-200',
    },
  }

  return statusMap[status] || statusMap['draft']
}

/**
 * Get contract type label
 */
export function getContractTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    professional: 'Profissional',
    youth: 'Juniores',
    amateur: 'Amador',
    short_term: 'Curto Prazo',
    trial: 'Período de Teste',
    loan: 'Empréstimo',
    extension: 'Renovação',
  }

  return typeMap[type] || type
}

/**
 * Calculate contract duration in days
 */
export function getContractDuration(startDate: string, endDate: string): number {
  const start = new Date(startDate)
  const end = new Date(endDate)
  const diffTime = Math.abs(end.getTime() - start.getTime())
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  return diffDays
}

/**
 * Check if contract is expiring soon (within 90 days)
 */
export function isContractExpiringSoon(endDate: string): boolean {
  const end = new Date(endDate)
  const today = new Date()
  const daysUntilExpiry = Math.floor((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24))
  return daysUntilExpiry > 0 && daysUntilExpiry <= 90
}

/**
 * Check if contract is fully signed
 */
export function isContractFullySigned(contract: PlayerContract): boolean {
  return contract.signed_by_player && contract.signed_by_club
}
