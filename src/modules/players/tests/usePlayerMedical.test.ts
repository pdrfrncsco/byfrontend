import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import {
  getMedicalStatusInfo,
  getMedicalDocumentTypeLabel,
  getDocumentVerificationStatusInfo,
  getBloodTypeOptions,
  formatExamDate,
  isExamOverdue,
  getDaysUntilExam,
  isMedicalProfileComplete,
  type MedicalProfile,
} from '../hooks/usePlayerMedical'

describe('usePlayerMedical helpers', () => {
  describe('getMedicalStatusInfo', () => {
    it('should return info for fit status', () => {
      const result = getMedicalStatusInfo('fit')
      expect(result).toEqual({
        label: 'Apto',
        color: 'text-green-700',
        bgColor: 'bg-green-100',
        icon: '✅',
      })
    })

    it('should return info for injured status', () => {
      const result = getMedicalStatusInfo('injured')
      expect(result.label).toBe('Lesionado')
      expect(result.color).toBe('text-red-700')
      expect(result.icon).toBe('🤕')
    })

    it('should return info for recovering status', () => {
      const result = getMedicalStatusInfo('recovering')
      expect(result.label).toBe('Em Recuperação')
      expect(result.color).toBe('text-yellow-700')
    })

    it('should return info for suspended status', () => {
      const result = getMedicalStatusInfo('suspended_medical')
      expect(result.label).toBe('Suspenso (Médico)')
      expect(result.icon).toBe('⛔')
    })

    it('should return fit status for unknown status', () => {
      const result = getMedicalStatusInfo('unknown')
      expect(result.label).toBe('Apto')
    })
  })

  describe('getMedicalDocumentTypeLabel', () => {
    it('should return label for medical_certificate', () => {
      expect(getMedicalDocumentTypeLabel('medical_certificate')).toBe('Certificado Médico')
    })

    it('should return label for injury_report', () => {
      expect(getMedicalDocumentTypeLabel('injury_report')).toBe('Relatório de Lesão')
    })

    it('should return label for scan_result', () => {
      expect(getMedicalDocumentTypeLabel('scan_result')).toBe('Resultado de Exame')
    })

    it('should return label for vaccination_record', () => {
      expect(getMedicalDocumentTypeLabel('vaccination_record')).toBe('Registo de Vacinação')
    })

    it('should return original type for unknown type', () => {
      expect(getMedicalDocumentTypeLabel('custom_type')).toBe('custom_type')
    })
  })

  describe('getDocumentVerificationStatusInfo', () => {
    it('should return info for pending status', () => {
      const result = getDocumentVerificationStatusInfo('pending')
      expect(result).toEqual({
        label: 'Pendente',
        color: 'text-blue-700',
        bgColor: 'bg-blue-100',
        icon: '⏳',
      })
    })

    it('should return info for verified status', () => {
      const result = getDocumentVerificationStatusInfo('verified')
      expect(result.label).toBe('Verificado')
      expect(result.icon).toBe('✅')
      expect(result.color).toBe('text-green-700')
    })

    it('should return info for rejected status', () => {
      const result = getDocumentVerificationStatusInfo('rejected')
      expect(result.label).toBe('Rejeitado')
      expect(result.icon).toBe('❌')
    })

    it('should return info for expired status', () => {
      const result = getDocumentVerificationStatusInfo('expired')
      expect(result.label).toBe('Expirado')
      expect(result.color).toBe('text-gray-700')
    })
  })

  describe('getBloodTypeOptions', () => {
    it('should return all 9 blood type options', () => {
      const options = getBloodTypeOptions()
      expect(options).toHaveLength(9)
    })

    it('should include all blood types', () => {
      const options = getBloodTypeOptions()
      const values = options.map((o) => o.value)
      expect(values).toContain('A+')
      expect(values).toContain('A-')
      expect(values).toContain('B+')
      expect(values).toContain('B-')
      expect(values).toContain('AB+')
      expect(values).toContain('AB-')
      expect(values).toContain('O+')
      expect(values).toContain('O-')
      expect(values).toContain('unknown')
    })

    it('should have labels for all options', () => {
      const options = getBloodTypeOptions()
      options.forEach((option) => {
        expect(option.label).toBeTruthy()
        expect(option.value).toBeTruthy()
      })
    })
  })

  describe('formatExamDate', () => {
    it('should format valid date', () => {
      const result = formatExamDate('2024-08-12')
      expect(result).toMatch(/\d{2}\/\d{2}\/\d{4}/)
    })

    it('should return dash for undefined date', () => {
      expect(formatExamDate(undefined)).toBe('—')
    })

    it('should return dash for empty string', () => {
      expect(formatExamDate('')).toBe('—')
    })
  })

  describe('isExamOverdue', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-08-12'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should return true for past date', () => {
      const pastDate = '2024-08-01'
      expect(isExamOverdue(pastDate)).toBe(true)
    })

    it('should return false for future date', () => {
      const futureDate = '2024-09-01'
      expect(isExamOverdue(futureDate)).toBe(false)
    })

    it('should return false for today', () => {
      const today = '2024-08-12'
      expect(isExamOverdue(today)).toBe(false)
    })

    it('should return false for undefined date', () => {
      expect(isExamOverdue(undefined)).toBe(false)
    })
  })

  describe('getDaysUntilExam', () => {
    beforeEach(() => {
      vi.useFakeTimers()
      vi.setSystemTime(new Date('2024-08-12'))
    })

    afterEach(() => {
      vi.useRealTimers()
    })

    it('should calculate days until future exam', () => {
      const examDate = '2024-08-22'
      const result = getDaysUntilExam(examDate)
      expect(result).toBe(10)
    })

    it('should return 0 for today', () => {
      const today = '2024-08-12'
      const result = getDaysUntilExam(today)
      expect(result).toBe(0)
    })

    it('should return null for undefined date', () => {
      expect(getDaysUntilExam(undefined)).toBeNull()
    })

    it('should handle negative days (past dates)', () => {
      const pastDate = '2024-08-05'
      const result = getDaysUntilExam(pastDate)
      expect(result).toBeLessThan(0)
    })
  })

  describe('isMedicalProfileComplete', () => {
    it('should return true for complete profile', () => {
      const profile: Partial<MedicalProfile> = {
        blood_type: 'A+',
        medical_status: 'fit',
        last_medical_exam: '2024-08-01',
        allergies: 'None',
        current_medications: 'None',
      }
      expect(isMedicalProfileComplete(profile)).toBe(true)
    })

    it('should return false for unknown blood type', () => {
      const profile: Partial<MedicalProfile> = {
        blood_type: 'unknown',
        medical_status: 'fit',
        last_medical_exam: '2024-08-01',
        allergies: 'None',
        current_medications: 'None',
      }
      expect(isMedicalProfileComplete(profile)).toBe(false)
    })

    it('should return false if missing blood type', () => {
      const profile: Partial<MedicalProfile> = {
        medical_status: 'fit',
        last_medical_exam: '2024-08-01',
        allergies: 'None',
        current_medications: 'None',
      }
      expect(isMedicalProfileComplete(profile)).toBe(false)
    })

    it('should return false if missing medical_status', () => {
      const profile: Partial<MedicalProfile> = {
        blood_type: 'A+',
        last_medical_exam: '2024-08-01',
        allergies: 'None',
        current_medications: 'None',
      }
      expect(isMedicalProfileComplete(profile)).toBe(false)
    })

    it('should return false if missing exam date', () => {
      const profile: Partial<MedicalProfile> = {
        blood_type: 'A+',
        medical_status: 'fit',
        allergies: 'None',
        current_medications: 'None',
      }
      expect(isMedicalProfileComplete(profile)).toBe(false)
    })

    it('should return false if allergies undefined', () => {
      const profile: Partial<MedicalProfile> = {
        blood_type: 'A+',
        medical_status: 'fit',
        last_medical_exam: '2024-08-01',
        current_medications: 'None',
      }
      expect(isMedicalProfileComplete(profile)).toBe(false)
    })
  })
})
