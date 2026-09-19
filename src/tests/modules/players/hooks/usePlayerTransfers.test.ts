import { describe, expect, it } from 'vitest'
import {
  adaptTransferToPlayerTransfer,
  canCancelTransfer,
  formatTransferFee,
  getDaysUntilEffective,
  getTransferStatusInfo,
  getTransferTimelineSteps,
  getTransferTypeLabel,
  isTransferPendingApproval,
  type PlayerTransfer,
} from '@/modules/players/hooks/usePlayerTransfers'

describe('usePlayerTransfers utilities and adapter', () => {
  it('adapts nested backend transfer object correctly', () => {
    const raw = {
      id: 'tf-1',
      player: { id: 'p-1', full_name: 'Zito Luvumbo' },
      from_club: { id: 'c-1', name: '1º de Agosto', slug: '1-de-agosto' },
      to_club: { id: 'c-2', name: 'Petro de Luanda', slug: 'petro-luanda' },
      transfer_type: 'permanent',
      status: 'pending',
      request_date: '2026-06-01T10:00:00Z',
      joined_date: '2026-07-01',
      fee: '250000',
      currency: 'EUR',
      notes: 'Transferência acordada',
    }

    const adapted = adaptTransferToPlayerTransfer(raw)

    expect(adapted.id).toBe('tf-1')
    expect(adapted.player).toBe('p-1')
    expect(adapted.from_club.name).toBe('1º de Agosto')
    expect(adapted.to_club.name).toBe('Petro de Luanda')
    expect(adapted.transfer_fee).toBe(250000)
    expect(adapted.effective_date).toBe('2026-07-01')
    expect(adapted.status).toBe('pending')
  })

  it('adapts flat backend transfer and free agent gracefully', () => {
    const raw = {
      id: 'tf-2',
      player: 'p-2',
      player_name: 'Gelson Dala',
      from_club: null,
      from_club_name: null,
      to_club: 'c-3',
      to_club_name: 'Sagrada Esperança',
      status: 'approved',
      fee: null,
    }

    const adapted = adaptTransferToPlayerTransfer(raw)

    expect(adapted.id).toBe('tf-2')
    expect(adapted.from_club.name).toBe('Agente Livre')
    expect(adapted.to_club.name).toBe('Sagrada Esperança')
    expect(adapted.transfer_fee).toBeUndefined()
  })

  it('calculates canCancelTransfer and isTransferPendingApproval', () => {
    const pendingTransfer: PlayerTransfer = {
      id: '1',
      player: 'p-1',
      from_club: { id: 'c1', name: 'Club A', slug: 'a' },
      to_club: { id: 'c2', name: 'Club B', slug: 'b' },
      transfer_type: 'loan',
      status: 'pending',
      requested_at: '2026-01-01',
      created_at: '2026-01-01',
      updated_at: '2026-01-01',
    }

    expect(canCancelTransfer(pendingTransfer)).toBe(true)
    expect(isTransferPendingApproval(pendingTransfer)).toBe(true)

    const completedTransfer: PlayerTransfer = {
      ...pendingTransfer,
      status: 'completed',
    }
    expect(canCancelTransfer(completedTransfer)).toBe(false)
    expect(isTransferPendingApproval(completedTransfer)).toBe(false)
  })

  it('returns proper labels and formatting', () => {
    expect(getTransferTypeLabel('permanent')).toBe('Transferência Permanente')
    expect(getTransferTypeLabel('loan')).toBe('Empréstimo')
    expect(getTransferStatusInfo('approved').label).toBe('Aprovado')
    expect(getTransferTimelineSteps().length).toBe(4)
    expect(formatTransferFee(undefined)).toBe('—')
    expect(formatTransferFee(150000, 'EUR')).toContain('150')
  })
})
