// Players module — Transfer hooks
// Connects to /api/v1/transfers/ endpoints with full normalization.

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import apiClient from '@/lib/api-client'

export interface PlayerTransfer {
  id: string
  player: string
  from_club: { id: string; name: string; slug: string }
  to_club: { id: string; name: string; slug: string }
  transfer_type: 'permanent' | 'loan' | 'free' | 'youth'
  status: 'requested' | 'pending' | 'approved' | 'rejected' | 'completed'
  requested_at: string
  effective_date?: string
  transfer_fee?: number
  currency?: string
  loan_duration_months?: number
  notes?: string
  created_at: string
  updated_at: string
}

export interface CreatePlayerTransferPayload {
  player_id: string
  to_club_id: string
  from_club_id?: string | null
  joined_date?: string | null
  fee?: number | string | null
  shirt_number?: number | null
  competition_id?: string | null
}

export function adaptTransferToPlayerTransfer(raw: any): PlayerTransfer {
  const fromClub =
    typeof raw.from_club === 'object' && raw.from_club !== null
      ? {
          id: String(raw.from_club.id ?? ''),
          name: String(raw.from_club.name ?? raw.from_club_name ?? 'Agente Livre'),
          slug: String(raw.from_club.slug ?? ''),
        }
      : {
          id: raw.from_club ? String(raw.from_club) : '',
          name: String(raw.from_club_name ?? (raw.from_club ? 'Clube de Origem' : 'Agente Livre')),
          slug: '',
        }

  const toClub =
    typeof raw.to_club === 'object' && raw.to_club !== null
      ? {
          id: String(raw.to_club.id ?? ''),
          name: String(raw.to_club.name ?? raw.to_club_name ?? 'Clube de Destino'),
          slug: String(raw.to_club.slug ?? ''),
        }
      : {
          id: raw.to_club ? String(raw.to_club) : '',
          name: String(raw.to_club_name ?? 'Clube de Destino'),
          slug: '',
        }

  return {
    id: String(raw.id),
    player: typeof raw.player === 'object' && raw.player !== null ? String(raw.player.id) : String(raw.player ?? ''),
    from_club: fromClub,
    to_club: toClub,
    transfer_type: raw.transfer_type ?? 'permanent',
    status: raw.status ?? 'pending',
    requested_at: raw.request_date ?? raw.requested_at ?? raw.created_at ?? new Date().toISOString(),
    effective_date: raw.joined_date ?? raw.effective_date,
    transfer_fee: raw.fee != null ? Number(raw.fee) : (raw.transfer_fee != null ? Number(raw.transfer_fee) : undefined),
    currency: raw.currency ?? 'EUR',
    loan_duration_months: raw.loan_duration_months != null ? Number(raw.loan_duration_months) : undefined,
    notes: raw.notes ?? raw.rejection_reason ?? undefined,
    created_at: raw.created_at ?? raw.request_date ?? new Date().toISOString(),
    updated_at: raw.updated_at ?? raw.created_at ?? new Date().toISOString(),
  }
}

// ─── Query Hooks ──────────────────────────────────────────────────────────────

export function usePlayerTransfers(playerId: string, enabled = true) {
  return useQuery<PlayerTransfer[]>({
    queryKey: ['player-transfers', playerId],
    queryFn: async () => {
      const res = await apiClient.get<any>('/transfers/', {
        params: { player_id: playerId },
      })
      const payload = res.data
      const rawList = Array.isArray(payload)
        ? payload
        : payload && typeof payload === 'object' && 'results' in payload && Array.isArray(payload.results)
          ? payload.results
          : []
      return rawList.map(adaptTransferToPlayerTransfer)
    },
    enabled: enabled && !!playerId,
    staleTime: 1000 * 60 * 3,
  })
}

export function useTransferDetails(_playerId: string, transferId: string, enabled = true) {
  return useQuery<PlayerTransfer | null>({
    queryKey: ['transfer-detail', transferId],
    queryFn: async () => {
      const res = await apiClient.get<any>(`/transfers/${transferId}/`)
      const payload = res.data?.data ?? res.data
      return payload ? adaptTransferToPlayerTransfer(payload) : null
    },
    enabled: enabled && !!transferId,
    staleTime: 1000 * 60 * 3,
  })
}

export function useCreateTransfer(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (payload: CreatePlayerTransferPayload) => {
      const res = await apiClient.post('/transfers/', payload)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-transfers', playerId] })
    },
  })
}

export function useCancelTransfer(playerId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (transferId: string) => {
      const res = await apiClient.post(`/transfers/${transferId}/cancel/`)
      return res.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-transfers', playerId] })
    },
  })
}

export function useUpdateTransfer(playerId: string, _transferId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: async (_payload: unknown) => {
      console.warn('[useUpdateTransfer] Not implemented directly in backend.')
      return null
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['player-transfers', playerId] })
    },
  })
}

// ─── Utility Functions (kept for future use) ──────────────────────────────────

export function getTransferStatusInfo(status: string): {
  label: string; color: string; bgColor: string; icon: string
} {
  const map: Record<string, ReturnType<typeof getTransferStatusInfo>> = {
    requested: { label: 'Solicitado', color: 'text-blue-700',   bgColor: 'bg-blue-100',   icon: '📋' },
    pending:   { label: 'Pendente',   color: 'text-yellow-700', bgColor: 'bg-yellow-100', icon: '⏳' },
    approved:  { label: 'Aprovado',   color: 'text-green-700',  bgColor: 'bg-green-100',  icon: '✅' },
    rejected:  { label: 'Rejeitado',  color: 'text-red-700',    bgColor: 'bg-red-100',    icon: '❌' },
    completed: { label: 'Concluído',  color: 'text-purple-700', bgColor: 'bg-purple-100', icon: '🎉' },
  }
  return map[status] ?? map['pending']
}

export function getTransferTypeLabel(type: string): string {
  const map: Record<string, string> = {
    permanent: 'Transferência Permanente',
    loan:      'Empréstimo',
    free:      'Transferência Livre',
    youth:     'Transferência de Formação',
  }
  return map[type] ?? type
}

export function formatTransferFee(amount: number | undefined, currency = 'EUR'): string {
  if (amount == null) return '—'
  return new Intl.NumberFormat('pt-PT', {
    style: 'currency',
    currency: currency || 'EUR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function isTransferPendingApproval(transfer: PlayerTransfer): boolean {
  return transfer.status === 'pending' || transfer.status === 'requested'
}

export function canCancelTransfer(transfer: PlayerTransfer): boolean {
  return ['requested', 'pending'].includes(transfer.status)
}

export function getTransferTimelineSteps(): Array<{
  status: string; label: string; description: string
}> {
  return [
    { status: 'requested', label: 'Solicitado', description: 'Solicitação de transferência enviada' },
    { status: 'pending',   label: 'Pendente',   description: 'Aguardando aprovação dos clubes' },
    { status: 'approved',  label: 'Aprovado',   description: 'Transferência aprovada pelas partes' },
    { status: 'completed', label: 'Concluído',  description: 'Transferência finalizada' },
  ]
}

export function getDaysUntilEffective(effectiveDate: string | undefined): number | null {
  if (!effectiveDate) return null
  
  const effective = new Date(effectiveDate)
  const today = new Date()
  
  // Reset time to midnight for accurate day calculation
  effective.setHours(0, 0, 0, 0)
  today.setHours(0, 0, 0, 0)
  
  const diffTime = effective.getTime() - today.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}
