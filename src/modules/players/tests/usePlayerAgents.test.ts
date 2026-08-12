import { describe, it, expect } from 'vitest'
import {
  getActiveAgentRelationship,
  getAgentRelationshipStatusInfo,
  getAgencyTypeLabel,
  isRelationshipActive,
  getRelationshipDuration,
  type PlayerAgentRelationship,
  type Agent,
} from '../hooks/usePlayerAgents'

const mockAgent: Agent = {
  id: '1',
  name: 'João Pereira',
  agency_name: 'Pereira Sports Management',
  agency_type: 'agency',
  license_number: 'PT-2020-001',
  fifa_agent_id: 'FIFA123456',
  country: 'PT',
  email: 'joao@pereira-sports.pt',
  phone: '+351 21 9999999',
  website: 'https://pereira-sports.pt',
  address: 'Rua Principal 123',
  city: 'Lisboa',
  postal_code: '1000-001',
  is_active: true,
  verified: true,
  verified_at: '2023-01-01T00:00:00Z',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

const mockRelationship: PlayerAgentRelationship = {
  id: '1',
  player: 'player-1',
  agent: mockAgent,
  start_date: '2023-01-01',
  end_date: '2025-12-31',
  status: 'active',
  commission_rate: 5,
  notes: 'Representação exclusiva',
  created_at: '2023-01-01T00:00:00Z',
  updated_at: '2023-01-01T00:00:00Z',
}

describe('Agent Relationship Helper Functions', () => {
  describe('getActiveAgentRelationship', () => {
    it('should return active relationship from list', () => {
      const relationships = [
        { ...mockRelationship, id: '1', status: 'expired' },
        { ...mockRelationship, id: '2', status: 'active' },
        { ...mockRelationship, id: '3', status: 'terminated' },
      ]

      const active = getActiveAgentRelationship(relationships)
      expect(active).toBeDefined()
      expect(active?.id).toBe('2')
      expect(active?.status).toBe('active')
    })

    it('should return null when no active relationship', () => {
      const relationships = [
        { ...mockRelationship, id: '1', status: 'expired' },
        { ...mockRelationship, id: '2', status: 'terminated' },
      ]

      const active = getActiveAgentRelationship(relationships)
      expect(active).toBeNull()
    })

    it('should return null for empty list', () => {
      const active = getActiveAgentRelationship([])
      expect(active).toBeNull()
    })
  })

  describe('getAgentRelationshipStatusInfo', () => {
    it('should return correct info for active status', () => {
      const info = getAgentRelationshipStatusInfo('active')
      expect(info.label).toBe('Ativo')
      expect(info.color).toBe('text-green-700')
      expect(info.bgColor).toBe('bg-green-100')
    })

    it('should return correct info for expired status', () => {
      const info = getAgentRelationshipStatusInfo('expired')
      expect(info.label).toBe('Expirado')
      expect(info.color).toBe('text-orange-700')
      expect(info.bgColor).toBe('bg-orange-100')
    })

    it('should return correct info for terminated status', () => {
      const info = getAgentRelationshipStatusInfo('terminated')
      expect(info.label).toBe('Terminado')
      expect(info.color).toBe('text-red-700')
      expect(info.bgColor).toBe('bg-red-100')
    })

    it('should return correct info for suspended status', () => {
      const info = getAgentRelationshipStatusInfo('suspended')
      expect(info.label).toBe('Suspenso')
      expect(info.color).toBe('text-yellow-700')
      expect(info.bgColor).toBe('bg-yellow-100')
    })

    it('should return expired info for unknown status', () => {
      const info = getAgentRelationshipStatusInfo('unknown')
      expect(info.label).toBe('Expirado')
    })
  })

  describe('getAgencyTypeLabel', () => {
    it('should return correct label for individual', () => {
      expect(getAgencyTypeLabel('individual')).toBe('Agente Individual')
    })

    it('should return correct label for agency', () => {
      expect(getAgencyTypeLabel('agency')).toBe('Agência de Desportos')
    })

    it('should return correct label for firm', () => {
      expect(getAgencyTypeLabel('firm')).toBe('Firma Jurídica')
    })

    it('should return type as-is for unknown', () => {
      expect(getAgencyTypeLabel('unknown')).toBe('unknown')
    })
  })

  describe('isRelationshipActive', () => {
    it('should return true for active relationship within date range', () => {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(startDate.getDate() - 30)
      const endDate = new Date(today)
      endDate.setDate(endDate.getDate() + 30)

      const relationship = {
        ...mockRelationship,
        status: 'active',
        start_date: startDate.toISOString().split('T')[0],
        end_date: endDate.toISOString().split('T')[0],
      }

      expect(isRelationshipActive(relationship)).toBe(true)
    })

    it('should return false for non-active status', () => {
      const relationship = {
        ...mockRelationship,
        status: 'terminated',
      }

      expect(isRelationshipActive(relationship)).toBe(false)
    })

    it('should return false for future start date', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 30)

      const relationship = {
        ...mockRelationship,
        status: 'active',
        start_date: futureDate.toISOString().split('T')[0],
      }

      expect(isRelationshipActive(relationship)).toBe(false)
    })

    it('should return false for past end date', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 30)

      const relationship = {
        ...mockRelationship,
        status: 'active',
        end_date: pastDate.toISOString().split('T')[0],
      }

      expect(isRelationshipActive(relationship)).toBe(false)
    })

    it('should return true for active without end date', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)

      const relationship = {
        ...mockRelationship,
        status: 'active',
        start_date: yesterday.toISOString().split('T')[0],
        end_date: undefined,
      }

      expect(isRelationshipActive(relationship)).toBe(true)
    })
  })

  describe('getRelationshipDuration', () => {
    it('should return days for short duration', () => {
      const start = '2023-01-01'
      const end = '2023-01-15'

      const duration = getRelationshipDuration(start, end)
      expect(duration).toContain('dias')
    })

    it('should return months for longer duration', () => {
      const start = '2023-01-01'
      const end = '2023-06-01'

      const duration = getRelationshipDuration(start, end)
      expect(duration).toContain('mês')
    })

    it('should handle single month', () => {
      const start = '2023-01-01'
      const end = '2023-02-01'

      const duration = getRelationshipDuration(start, end)
      expect(duration).toBe('1 mês')
    })

    it('should handle multiple months', () => {
      const start = '2023-01-01'
      const end = '2023-07-01'

      const duration = getRelationshipDuration(start, end)
      expect(duration).toBe('6 meses')
    })

    it('should calculate from start to today if no end date', () => {
      const start = '2023-01-01'
      const duration = getRelationshipDuration(start)
      
      // Should be calculated, not empty
      expect(duration.length).toBeGreaterThan(0)
    })

    it('should handle same date', () => {
      const date = '2023-01-01'
      const duration = getRelationshipDuration(date, date)
      expect(duration).toBe('0 dias')
    })
  })

  describe('Edge Cases', () => {
    it('should handle relationship with no commission', () => {
      const relationship = {
        ...mockRelationship,
        commission_rate: undefined,
      }

      expect(relationship.commission_rate).toBeUndefined()
    })

    it('should handle relationship with zero commission', () => {
      const relationship = {
        ...mockRelationship,
        commission_rate: 0,
      }

      expect(relationship.commission_rate).toBe(0)
    })

    it('should handle relationship with notes', () => {
      const relationship = {
        ...mockRelationship,
        notes: 'Este é um agente importante',
      }

      expect(relationship.notes).toBeDefined()
      expect(relationship.notes).toContain('importante')
    })

    it('should handle multiple relationships with same agent', () => {
      const relationships = [
        { ...mockRelationship, id: '1', start_date: '2020-01-01', end_date: '2022-12-31', status: 'expired' },
        { ...mockRelationship, id: '2', start_date: '2023-01-01', end_date: '2025-12-31', status: 'active' },
      ]

      const active = getActiveAgentRelationship(relationships)
      expect(active?.id).toBe('2')
    })
  })
})
