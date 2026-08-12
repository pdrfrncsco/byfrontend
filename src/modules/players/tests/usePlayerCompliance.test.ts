import { describe, it, expect } from 'vitest'
import {
  getRuleTypeLabel,
  getPriorityInfo,
  getComplianceStatusInfo,
  requiresAction,
  isRecordOverdue,
  getDaysUntilDeadline,
  getCompliancePercentage,
  getComplianceHealthStatus,
  type ComplianceRecord,
} from '../hooks/usePlayerCompliance'

describe('usePlayerCompliance helpers', () => {
  describe('getRuleTypeLabel', () => {
    it('should return label for minor_transfer', () => {
      expect(getRuleTypeLabel('minor_transfer')).toBe('Transferência de Menores')
    })

    it('should return label for work_permit', () => {
      expect(getRuleTypeLabel('work_permit')).toBe('Autorização de Trabalho')
    })

    it('should return label for training_compensation', () => {
      expect(getRuleTypeLabel('training_compensation')).toBe('Compensação de Formação (EPP)')
    })

    it('should return original for unknown type', () => {
      expect(getRuleTypeLabel('unknown_rule')).toBe('unknown_rule')
    })
  })

  describe('getPriorityInfo', () => {
    it('should return info for low priority', () => {
      const result = getPriorityInfo('low')
      expect(result).toEqual({
        label: 'Baixa',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: '📋',
      })
    })

    it('should return info for critical priority', () => {
      const result = getPriorityInfo('critical')
      expect(result.label).toBe('Crítica')
      expect(result.icon).toBe('🚨')
      expect(result.color).toBe('text-red-700')
    })

    it('should return info for medium priority', () => {
      const result = getPriorityInfo('medium')
      expect(result.label).toBe('Média')
    })

    it('should return info for high priority', () => {
      const result = getPriorityInfo('high')
      expect(result.label).toBe('Alta')
    })
  })

  describe('getComplianceStatusInfo', () => {
    it('should return info for compliant status', () => {
      const result = getComplianceStatusInfo('compliant')
      expect(result).toEqual({
        label: 'Conforme',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '✅',
      })
    })

    it('should return info for non_compliant status', () => {
      const result = getComplianceStatusInfo('non_compliant')
      expect(result.label).toBe('Não Conforme')
      expect(result.icon).toBe('❌')
    })

    it('should return info for pending_review status', () => {
      const result = getComplianceStatusInfo('pending_review')
      expect(result.label).toBe('Pendente de Revisão')
    })
  })

  describe('requiresAction', () => {
    const createRecord = (status: string, deadline?: string): ComplianceRecord => ({
      id: '1',
      player: 'p1',
      rule_type: 'work_permit',
      priority: 'medium',
      status: status as any,
      description: 'Test',
      deadline,
      created_at: '2024-01-01',
      updated_at: '2024-01-01',
    })

    it('should return true for non_compliant status', () => {
      expect(requiresAction(createRecord('non_compliant'))).toBe(true)
    })

    it('should return true for pending_review status', () => {
      expect(requiresAction(createRecord('pending_review'))).toBe(true)
    })

    it('should return true for requires_approval status', () => {
      expect(requiresAction(createRecord('requires_approval'))).toBe(true)
    })

    it('should return false for compliant status', () => {
      expect(requiresAction(createRecord('compliant'))).toBe(false)
    })

    it('should return true for overdue deadline', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 10)
      expect(requiresAction(createRecord('compliant', pastDate.toISOString()))).toBe(true)
    })
  })

  describe('isRecordOverdue', () => {
    it('should return true for past deadline', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)

      const record: ComplianceRecord = {
        id: '1',
        player: 'p1',
        rule_type: 'work_permit',
        priority: 'high',
        status: 'non_compliant',
        description: 'Test',
        deadline: pastDate.toISOString(),
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      expect(isRecordOverdue(record)).toBe(true)
    })

    it('should return false for future deadline', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)

      const record: ComplianceRecord = {
        id: '1',
        player: 'p1',
        rule_type: 'work_permit',
        priority: 'medium',
        status: 'pending_review',
        description: 'Test',
        deadline: futureDate.toISOString(),
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      expect(isRecordOverdue(record)).toBe(false)
    })

    it('should return false for compliant record', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)

      const record: ComplianceRecord = {
        id: '1',
        player: 'p1',
        rule_type: 'work_permit',
        priority: 'low',
        status: 'compliant',
        description: 'Test',
        deadline: pastDate.toISOString(),
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      expect(isRecordOverdue(record)).toBe(false)
    })

    it('should return false for no deadline', () => {
      const record: ComplianceRecord = {
        id: '1',
        player: 'p1',
        rule_type: 'work_permit',
        priority: 'medium',
        status: 'pending_review',
        description: 'Test',
        created_at: '2024-01-01',
        updated_at: '2024-01-01',
      }

      expect(isRecordOverdue(record)).toBe(false)
    })
  })

  describe('getDaysUntilDeadline', () => {
    it('should calculate days until future deadline', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 10)

      const result = getDaysUntilDeadline(futureDate.toISOString())
      expect(result).toBe(10)
    })

    it('should return negative for past deadline', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 5)

      const result = getDaysUntilDeadline(pastDate.toISOString())
      expect(result).toBeLessThan(0)
    })

    it('should return null for undefined deadline', () => {
      expect(getDaysUntilDeadline(undefined)).toBeNull()
    })
  })

  describe('getCompliancePercentage', () => {
    it('should calculate percentage correctly', () => {
      expect(getCompliancePercentage(8, 10)).toBe(80)
    })

    it('should return 100 for full compliance', () => {
      expect(getCompliancePercentage(10, 10)).toBe(100)
    })

    it('should return 0 for no compliance', () => {
      expect(getCompliancePercentage(0, 10)).toBe(0)
    })

    it('should handle zero total', () => {
      expect(getCompliancePercentage(0, 0)).toBe(100)
    })

    it('should round percentage', () => {
      expect(getCompliancePercentage(1, 3)).toBe(33)
    })
  })

  describe('getComplianceHealthStatus', () => {
    it('should return excellent for 100%', () => {
      const result = getComplianceHealthStatus(100)
      expect(result.label).toBe('✅ Totalmente Conforme')
      expect(result.color).toBe('text-green-700')
    })

    it('should return good for 80%+', () => {
      const result = getComplianceHealthStatus(85)
      expect(result.label).toBe('⚠️ Maioria Conforme')
      expect(result.color).toBe('text-yellow-700')
    })

    it('should return fair for 50%+', () => {
      const result = getComplianceHealthStatus(60)
      expect(result.label).toBe('🔶 Parcialmente Conforme')
      expect(result.color).toBe('text-orange-700')
    })

    it('should return poor for <50%', () => {
      const result = getComplianceHealthStatus(30)
      expect(result.label).toBe('❌ Não Conforme')
      expect(result.color).toBe('text-red-700')
    })
  })
})
