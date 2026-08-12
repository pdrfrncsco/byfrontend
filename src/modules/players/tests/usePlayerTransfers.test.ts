import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import {
  getTransferStatusInfo,
  getTransferTypeLabel,
  formatTransferFee,
  getDaysUntilEffective,
  isTransferPendingApproval,
  canCancelTransfer,
  getTransferTimelineSteps,
  type PlayerTransfer,
} from '../hooks/usePlayerTransfers'

describe('usePlayerTransfers helpers', () => {
  describe('getTransferStatusInfo', () => {
    it('should return correct status info for requested status', () => {
      const result = getTransferStatusInfo('requested')
      expect(result).toEqual({
        label: 'Solicitado',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: '📋',
      })
    })

    it('should return correct status info for pending status', () => {
      const result = getTransferStatusInfo('pending')
      expect(result).toEqual({
        label: 'Pendente',
        color: 'text-yellow-700',
        bgColor: 'bg-yellow-100',
        icon: '⏳',
      })
    })

    it('should return correct status info for approved status', () => {
      const result = getTransferStatusInfo('approved')
      expect(result).toEqual({
        label: 'Aprovado',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '✅',
      })
    })

    it('should return correct status info for rejected status', () => {
      const result = getTransferStatusInfo('rejected')
      expect(result).toEqual({
        label: 'Rejeitado',
        color: 'text-red-700',
        bgColor: 'bg-red-100',
        icon: '❌',
      })
    })

    it('should return correct status info for completed status', () => {
      const result = getTransferStatusInfo('completed')
      expect(result).toEqual({
        label: 'Concluído',
        color: 'text-purple-700',
        bgColor: 'bg-purple-100',
        icon: '🎉',
      })
    })

    it('should return pending status info for unknown status', () => {
      const result = getTransferStatusInfo('unknown')
      expect(result.label).toEqual('Pendente')
    })
  })

  describe('getTransferTypeLabel', () => {
    it('should return label for permanent transfer', () => {
      expect(getTransferTypeLabel('permanent')).toEqual('Transferência Permanente')
    })

    it('should return label for loan transfer', () => {
      expect(getTransferTypeLabel('loan')).toEqual('Empréstimo')
    })

    it('should return label for free transfer', () => {
      expect(getTransferTypeLabel('free')).toEqual('Transferência Livre')
    })

    it('should return label for youth transfer', () => {
      expect(getTransferTypeLabel('youth')).toEqual('Transferência de Formação')
    })

    it('should return original type for unknown transfer type', () => {
      expect(getTransferTypeLabel('unknown')).toEqual('unknown')
    })
  })

  describe('formatTransferFee', () => {
    it('should format fee with default EUR currency', () => {
      const result = formatTransferFee(5000000)
      expect(result).toBe('5.000.000 €')
    })

    it('should format fee with USD currency', () => {
      const result = formatTransferFee(5000000, 'USD')
      expect(result).toBe('$5,000,000')
    })

    it('should format fee with GBP currency', () => {
      const result = formatTransferFee(5000000, 'GBP')
      expect(result).toBe('£5,000,000')
    })

    it('should return dash for undefined amount', () => {
      expect(formatTransferFee(undefined)).toEqual('—')
    })

    it('should return dash for zero amount', () => {
      expect(formatTransferFee(0)).toBe('0 €')
    })

    it('should handle small amounts', () => {
      const result = formatTransferFee(250000)
      expect(result).toBe('250.000 €')
    })
  })

  describe('getDaysUntilEffective', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-08-12'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should calculate days until future effective date', () => {
      const futureDate = new Date('2024-08-22').toISOString()
      const result = getDaysUntilEffective(futureDate)
      expect(result).toBe(10)
    })

    it('should return 0 for today', () => {
      const today = new Date('2024-08-12').toISOString()
      const result = getDaysUntilEffective(today)
      expect(result).toBe(0)
    })

    it('should return null for undefined effective date', () => {
      expect(getDaysUntilEffective(undefined)).toBeNull()
    })

    it('should handle past dates correctly', () => {
      const pastDate = new Date('2024-08-05').toISOString()
      const result = getDaysUntilEffective(pastDate)
      expect(result).toBeLessThan(0)
    })
  })

  describe('isTransferPendingApproval', () => {
    const mockTransfer = (status: string): PlayerTransfer => ({
      id: '1',
      player: 'player-1',
      from_club: { id: 'club-1', name: 'Club A', slug: 'club-a' },
      to_club: { id: 'club-2', name: 'Club B', slug: 'club-b' },
      transfer_type: 'permanent',
      status: status as any,
      requested_at: '2024-08-12T00:00:00Z',
      created_at: '2024-08-12T00:00:00Z',
      updated_at: '2024-08-12T00:00:00Z',
    })

    it('should return true for requested status', () => {
      expect(isTransferPendingApproval(mockTransfer('requested'))).toBe(true)
    })

    it('should return true for pending status', () => {
      expect(isTransferPendingApproval(mockTransfer('pending'))).toBe(true)
    })

    it('should return false for approved status', () => {
      expect(isTransferPendingApproval(mockTransfer('approved'))).toBe(false)
    })

    it('should return false for rejected status', () => {
      expect(isTransferPendingApproval(mockTransfer('rejected'))).toBe(false)
    })

    it('should return false for completed status', () => {
      expect(isTransferPendingApproval(mockTransfer('completed'))).toBe(false)
    })
  })

  describe('canCancelTransfer', () => {
    const mockTransfer = (status: string): PlayerTransfer => ({
      id: '1',
      player: 'player-1',
      from_club: { id: 'club-1', name: 'Club A', slug: 'club-a' },
      to_club: { id: 'club-2', name: 'Club B', slug: 'club-b' },
      transfer_type: 'permanent',
      status: status as any,
      requested_at: '2024-08-12T00:00:00Z',
      created_at: '2024-08-12T00:00:00Z',
      updated_at: '2024-08-12T00:00:00Z',
    })

    it('should return true for requested status', () => {
      expect(canCancelTransfer(mockTransfer('requested'))).toBe(true)
    })

    it('should return true for pending status', () => {
      expect(canCancelTransfer(mockTransfer('pending'))).toBe(true)
    })

    it('should return false for approved status', () => {
      expect(canCancelTransfer(mockTransfer('approved'))).toBe(false)
    })

    it('should return false for rejected status', () => {
      expect(canCancelTransfer(mockTransfer('rejected'))).toBe(false)
    })

    it('should return false for completed status', () => {
      expect(canCancelTransfer(mockTransfer('completed'))).toBe(false)
    })
  })

  describe('getTransferTimelineSteps', () => {
    it('should return all timeline steps', () => {
      const steps = getTransferTimelineSteps()
      expect(steps).toHaveLength(4)
    })

    it('should have correct status values', () => {
      const steps = getTransferTimelineSteps()
      const statuses = steps.map((s) => s.status)
      expect(statuses).toEqual(['requested', 'pending', 'approved', 'completed'])
    })

    it('should have labels and descriptions for all steps', () => {
      const steps = getTransferTimelineSteps()
      steps.forEach((step) => {
        expect(step.label).toBeTruthy()
        expect(step.description).toBeTruthy()
      })
    })

    it('should have correct first step', () => {
      const steps = getTransferTimelineSteps()
      expect(steps[0]).toEqual({
        status: 'requested',
        label: 'Solicitado',
        description: 'Solicitação de transferência enviada',
      })
    })

    it('should have correct last step', () => {
      const steps = getTransferTimelineSteps()
      expect(steps[3]).toEqual({
        status: 'completed',
        label: 'Concluído',
        description: 'Transferência finalizada',
      })
    })
  })
})
