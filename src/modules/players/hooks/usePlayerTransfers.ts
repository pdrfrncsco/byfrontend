import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'

export interface PlayerTransfer {
  id: string
  player: string
  from_club: {
    id: string
    name: string
    slug: string
  }
  to_club: {
    id: string
    name: string
    slug: string
  }
  transfer_type: 'permanent' | 'loan' | 'free' | 'youth'
  status: 'requested' | 'pending' | 'approved' | 'rejected' | 'completed'
  requested_at: string
  effective_date?: string
  transfer_fee?: number
  currency?: string
  loan_duration_months?: number
  notes?: string
  documents?: Array<{
    id: string
    url: string
    name: string
    type: string
  }>
  created_at: string
  updated_at: string
}

export interface CreateTransferInput {
  to_club: string
  transfer_type: string
  effective_date?: string
  transfer_fee?: number
  currency?: string
  loan_duration_months?: number
  notes?: string
}

export interface UpdateTransferInput extends Partial<CreateTransferInput> {
  status?: string
}

/**
 * Hook to fetch player transfers
 */
export function usePlayerTransfers(playerId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['player-transfers', playerId],
    queryFn: async () => {
      const response = await fetch(`${apiUrl}/players/${playerId}/transfers/`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch transfers: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to fetch single transfer details
 */
export function useTransferDetails(playerId: string, transferId: string, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['transfer', playerId, transferId],
    queryFn: async () => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/transfers/${transferId}/`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to fetch transfer: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && !!playerId && !!transferId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * Hook to create transfer request
 */
export function useCreateTransfer(playerId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (data: CreateTransferInput) => {
      const response = await fetch(`${apiUrl}/players/${playerId}/transfers/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error(`Failed to create transfer: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-transfers', playerId] })
    },
  })
}

/**
 * Hook to update transfer
 */
export function useUpdateTransfer(playerId: string, transferId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (data: UpdateTransferInput) => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/transfers/${transferId}/`,
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
        throw new Error(`Failed to update transfer: ${response.statusText}`)
      }

      return response.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-transfers', playerId] })
      queryClient.invalidateQueries({ queryKey: ['transfer', playerId, transferId] })
    },
  })
}

/**
 * Hook to cancel transfer
 */
export function useCancelTransfer(playerId: string) {
  const queryClient = useQueryClient()
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useMutation({
    mutationFn: async (transferId: string) => {
      const response = await fetch(
        `${apiUrl}/players/${playerId}/transfers/${transferId}/`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
          },
        }
      )

      if (!response.ok) {
        throw new Error(`Failed to cancel transfer: ${response.statusText}`)
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-transfers', playerId] })
    },
  })
}

/**
 * Get transfer status info
 */
export function getTransferStatusInfo(status: string): {
  label: string
  color: string
  bgColor: string
  icon: string
} {
  const statusMap: Record<string, any> = {
    requested: {
      label: 'Solicitado',
      color: 'text-blue-700',
      bgColor: 'bg-blue-100',
      icon: '📋',
    },
    pending: {
      label: 'Pendente',
      color: 'text-yellow-700',
      bgColor: 'bg-yellow-100',
      icon: '⏳',
    },
    approved: {
      label: 'Aprovado',
      color: 'text-green-700',
      bgColor: 'bg-green-100',
      icon: '✅',
    },
    rejected: {
      label: 'Rejeitado',
      color: 'text-red-700',
      bgColor: 'bg-red-100',
      icon: '❌',
    },
    completed: {
      label: 'Concluído',
      color: 'text-purple-700',
      bgColor: 'bg-purple-100',
      icon: '🎉',
    },
  }

  return statusMap[status] || statusMap['pending']
}

/**
 * Get transfer type label
 */
export function getTransferTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    permanent: 'Transferência Permanente',
    loan: 'Empréstimo',
    free: 'Transferência Livre',
    youth: 'Transferência de Formação',
  }

  return typeMap[type] || type
}

/**
 * Format transfer fee
 */
export function formatTransferFee(amount: number | undefined, currency = 'EUR'): string {
  if (amount === undefined) return '—'

  const formatter = new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })

  return formatter.format(amount)
}

/**
 * Calculate days until effective date
 */
export function getDaysUntilEffective(effectiveDate: string | undefined): number | null {
  if (!effectiveDate) return null

  const effective = new Date(effectiveDate)
  const today = new Date()
  const diffTime = effective.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return diffDays
}

/**
 * Check if transfer is pending approval
 */
export function isTransferPendingApproval(transfer: PlayerTransfer): boolean {
  return transfer.status === 'pending' || transfer.status === 'requested'
}

/**
 * Check if transfer can be cancelled
 */
export function canCancelTransfer(transfer: PlayerTransfer): boolean {
  return ['requested', 'pending'].includes(transfer.status)
}

/**
 * Get transfer timeline steps
 */
export function getTransferTimelineSteps(): Array<{
  status: string
  label: string
  description: string
}> {
  return [
    {
      status: 'requested',
      label: 'Solicitado',
      description: 'Solicitação de transferência enviada',
    },
    {
      status: 'pending',
      label: 'Pendente',
      description: 'Aguardando aprovação dos clubes',
    },
    {
      status: 'approved',
      label: 'Aprovado',
      description: 'Transferência aprovada pelas partes',
    },
    {
      status: 'completed',
      label: 'Concluído',
      description: 'Transferência finalizada',
    },
  ]
}
