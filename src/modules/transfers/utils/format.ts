import type { TransferStatus } from '../types'

export function transferStatusVariant(status?: TransferStatus) {
  switch (status) {
    case 'approved':
    case 'completed':
      return 'primary' as const
    case 'pending':
      return 'warning' as const
    case 'cancelled':
    case 'returned':
      return 'danger' as const
    default:
      return 'secondary' as const
  }
}

export function formatTransferDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-AO')
}

export function formatTransferFee(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—'
  const amount = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(amount)) return String(value)
  return amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
}
