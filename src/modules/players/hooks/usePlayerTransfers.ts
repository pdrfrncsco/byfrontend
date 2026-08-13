// Players module — Transfer hooks
// ⚠️  DISABLED: The backend endpoint /players/{id}/transfers/ does not exist in
//     urls.py. Player transfers are handled via PlayerRegistration.
//     The PlayerTransferSection has been removed from the dashboard.
//     These hooks are stubs that return empty data without making any API call.
//     Re-enable when the backend implements a dedicated transfer endpoint.

import { useQuery } from '@tanstack/react-query'

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

// ─── Disabled Hooks ───────────────────────────────────────────────────────────

export function usePlayerTransfers(_playerId: string, _enabled = true) {
  return useQuery<PlayerTransfer[]>({
    queryKey: ['player-transfers-disabled'],
    queryFn: () => Promise.resolve([]),
    enabled: false,
    staleTime: Infinity,
  })
}

export function useTransferDetails(_playerId: string, _transferId: string, _enabled = true) {
  return useQuery<PlayerTransfer | null>({
    queryKey: ['transfer-disabled'],
    queryFn: () => Promise.resolve(null),
    enabled: false,
    staleTime: Infinity,
  })
}

const disabledMutation = {
  mutate: () => { console.warn('[PlayerTransfers] Endpoint not implemented in backend yet.') },
  mutateAsync: () => Promise.reject(new Error('Endpoint not implemented in backend yet.')),
  isPending: false,
  isError: false,
  isSuccess: false,
  reset: () => {},
} as const

/** @deprecated Endpoint not yet available. */
export function useCreateTransfer(_playerId: string) { return disabledMutation }
/** @deprecated Endpoint not yet available. */
export function useUpdateTransfer(_playerId: string, _transferId: string) { return disabledMutation }
/** @deprecated Endpoint not yet available. */
export function useCancelTransfer(_playerId: string) { return disabledMutation }

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
