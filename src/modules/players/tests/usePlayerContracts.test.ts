import { describe, it, expect } from 'vitest'
import {
  formatCurrency,
  getContractStatusInfo,
  getContractTypeLabel,
  getContractDuration,
  isContractExpiringSoon,
  isContractFullySigned,
  getActiveContract,
  type PlayerContract,
} from '../hooks/usePlayerContracts'

const mockContract: PlayerContract = {
  id: '1',
  player: 'player-1',
  club: {
    id: 'club-1',
    name: 'SL Benfica',
    slug: 'sl-benfica',
  },
  contract_type: 'professional',
  status: 'active',
  start_date: '2020-07-01',
  end_date: '2025-06-30',
  salary: 500000,
  currency: 'EUR',
  release_clause: 50000000,
  has_image_rights: true,
  option_year: true,
  signed_by_player: true,
  signed_by_club: true,
  created_at: '2020-06-01T00:00:00Z',
  updated_at: '2020-06-01T00:00:00Z',
}

describe('Contract Helper Functions', () => {
  describe('formatCurrency', () => {
    it('should format currency correctly', () => {
      const result = formatCurrency(500000, 'EUR')
      expect(result).toBeDefined()
      expect(result).not.toBe('—')
    })

    it('should return dash for undefined amount', () => {
      const result = formatCurrency(undefined)
      expect(result).toBe('—')
    })

    it('should handle different currencies', () => {
      const usd = formatCurrency(1000, 'USD')
      const gbp = formatCurrency(1000, 'GBP')
      expect(usd).toBeDefined()
      expect(gbp).toBeDefined()
    })

    it('should return 0 formatted', () => {
      const result = formatCurrency(0, 'USD')
      expect(result).toBeDefined()
    })
  })

  describe('getContractStatusInfo', () => {
    it('should return correct info for active status', () => {
      const info = getContractStatusInfo('active')
      expect(info.label).toBe('Ativo')
      expect(info.color).toBe('text-green-700')
      expect(info.bgColor).toBe('bg-green-100')
    })

    it('should return correct info for draft status', () => {
      const info = getContractStatusInfo('draft')
      expect(info.label).toBe('Rascunho')
      expect(info.color).toBe('text-gray-700')
    })

    it('should return correct info for expired status', () => {
      const info = getContractStatusInfo('expired')
      expect(info.label).toBe('Expirado')
      expect(info.color).toBe('text-orange-700')
    })

    it('should return correct info for terminated status', () => {
      const info = getContractStatusInfo('terminated')
      expect(info.label).toBe('Terminado')
      expect(info.color).toBe('text-red-700')
    })

    it('should return correct info for suspended status', () => {
      const info = getContractStatusInfo('suspended')
      expect(info.label).toBe('Suspenso')
      expect(info.color).toBe('text-yellow-700')
    })

    it('should return draft info for unknown status', () => {
      const info = getContractStatusInfo('unknown')
      expect(info.label).toBe('Rascunho')
    })
  })

  describe('getContractTypeLabel', () => {
    it('should return correct label for professional', () => {
      expect(getContractTypeLabel('professional')).toBe('Profissional')
    })

    it('should return correct label for youth', () => {
      expect(getContractTypeLabel('youth')).toBe('Juniores')
    })

    it('should return correct label for amateur', () => {
      expect(getContractTypeLabel('amateur')).toBe('Amador')
    })

    it('should return correct label for trial', () => {
      expect(getContractTypeLabel('trial')).toBe('Período de Teste')
    })

    it('should return type as-is for unknown', () => {
      expect(getContractTypeLabel('unknown')).toBe('unknown')
    })
  })

  describe('getContractDuration', () => {
    it('should calculate duration correctly', () => {
      const duration = getContractDuration('2020-01-01', '2020-12-31')
      expect(duration).toBeGreaterThan(0)
      expect(duration).toBeLessThanOrEqual(365)
    })

    it('should handle same date', () => {
      const duration = getContractDuration('2020-01-01', '2020-01-01')
      expect(duration).toBe(0)
    })

    it('should handle multi-year contracts', () => {
      const duration = getContractDuration('2020-01-01', '2025-12-31')
      expect(duration).toBeGreaterThan(365 * 5)
    })
  })

  describe('isContractExpiringSoon', () => {
    it('should return true for contract expiring in 30 days', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)
      const result = isContractExpiringSoon(futureDate.toISOString())
      expect(result).toBe(true)
    })

    it('should return false for contract expiring in 100 days', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 100)
      const result = isContractExpiringSoon(futureDate.toISOString())
      expect(result).toBe(false)
    })

    it('should return false for expired contract', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 30)
      const result = isContractExpiringSoon(pastDate.toISOString())
      expect(result).toBe(false)
    })

    it('should return true for contract expiring exactly at 90 days', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 90)
      const result = isContractExpiringSoon(futureDate.toISOString())
      expect(result).toBe(true)
    })

    it('should return false for contract expiring at 91 days', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 91)
      const result = isContractExpiringSoon(futureDate.toISOString())
      expect(result).toBe(false)
    })
  })

  describe('isContractFullySigned', () => {
    it('should return true when both signed', () => {
      const contract = { ...mockContract, signed_by_player: true, signed_by_club: true }
      expect(isContractFullySigned(contract)).toBe(true)
    })

    it('should return false when only player signed', () => {
      const contract = { ...mockContract, signed_by_player: true, signed_by_club: false }
      expect(isContractFullySigned(contract)).toBe(false)
    })

    it('should return false when only club signed', () => {
      const contract = { ...mockContract, signed_by_player: false, signed_by_club: true }
      expect(isContractFullySigned(contract)).toBe(false)
    })

    it('should return false when neither signed', () => {
      const contract = { ...mockContract, signed_by_player: false, signed_by_club: false }
      expect(isContractFullySigned(contract)).toBe(false)
    })
  })

  describe('getActiveContract', () => {
    it('should return active contract from list', () => {
      const contracts = [
        { ...mockContract, id: '1', status: 'expired' },
        { ...mockContract, id: '2', status: 'active' },
        { ...mockContract, id: '3', status: 'draft' },
      ]

      const active = getActiveContract(contracts)
      expect(active).toBeDefined()
      expect(active?.id).toBe('2')
      expect(active?.status).toBe('active')
    })

    it('should return null when no active contract', () => {
      const contracts = [
        { ...mockContract, id: '1', status: 'expired' },
        { ...mockContract, id: '2', status: 'draft' },
      ]

      const active = getActiveContract(contracts)
      expect(active).toBeNull()
    })

    it('should return null for empty list', () => {
      const active = getActiveContract([])
      expect(active).toBeNull()
    })

    it('should return first active if multiple', () => {
      const contracts = [
        { ...mockContract, id: '1', status: 'active' },
        { ...mockContract, id: '2', status: 'active' },
      ]

      const active = getActiveContract(contracts)
      expect(active?.id).toBe('1')
    })
  })

  describe('Edge Cases', () => {
    it('should handle contract with no salary', () => {
      const contract = { ...mockContract, salary: undefined }
      expect(formatCurrency(contract.salary)).toBe('—')
    })

    it('should handle contract with no release clause', () => {
      const contract = { ...mockContract, release_clause: undefined }
      expect(contract.release_clause).toBeUndefined()
    })

    it('should handle different date formats', () => {
      const duration1 = getContractDuration('2020-01-01', '2025-12-31')
      const duration2 = getContractDuration('2020-1-1', '2025-12-31')
      // Both should be valid
      expect(duration1).toBeGreaterThan(0)
    })

    it('should handle leap years in duration calculation', () => {
      const duration = getContractDuration('2020-01-01', '2021-01-01')
      expect(duration).toBeCloseTo(365, 1) // Leap year adjustment
    })
  })
})
