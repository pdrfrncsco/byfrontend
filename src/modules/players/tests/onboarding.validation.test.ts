import { describe, it, expect } from 'vitest'
import { playerCreateSchema } from '../schemas/player.schema'
import { playerGuardianSchema, playerMedicalConsentSchema } from '../schemas/guardian.schema'

/**
 * Player Onboarding Validation Tests
 * Tests Zod schema validations for all onboarding forms
 */

describe('Player Onboarding Validation', () => {
  describe('Player Create Schema', () => {
    it('should validate minimum first_name length', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'A',
        last_name: 'Silva',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('pelo menos 2 caracteres')
      }
    })

    it('should validate minimum last_name length', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'S',
      })
      expect(result.success).toBe(false)
    })

    it('should validate maximum name length', () => {
      const longName = 'A'.repeat(256)
      const result = playerCreateSchema.safeParse({
        first_name: longName,
        last_name: 'Silva',
      })
      expect(result.success).toBe(false)
    })

    it('should validate email format', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        email: 'invalid-email',
      })
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('Email')
      }
    })

    it('should accept valid email', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        email: 'joao@example.com',
      })
      expect(result.success).toBe(true)
    })

    it('should validate height range', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        height_cm: 50, // Too short
      })
      expect(result.success).toBe(false)

      const result2 = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        height_cm: 300, // Too tall
      })
      expect(result2.success).toBe(false)
    })

    it('should validate weight range', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        weight_kg: 20, // Too light
      })
      expect(result.success).toBe(false)

      const result2 = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        weight_kg: 300, // Too heavy
      })
      expect(result2.success).toBe(false)
    })

    it('should accept valid height and weight', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        height_cm: 185,
        weight_kg: 82,
      })
      expect(result.success).toBe(true)
    })

    it('should validate phone format', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        phone: '+244923456789',
      })
      expect(result.success).toBe(true)
    })

    it('should validate primary_position enum', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        primary_position: 'invalid_position',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid position', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        primary_position: 'st',
      })
      expect(result.success).toBe(true)
    })

    it('should validate foot enum', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        foot: 'invalid_foot',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid foot values', () => {
      const feet = ['left', 'right', 'both']
      feet.forEach((foot) => {
        const result = playerCreateSchema.safeParse({
          first_name: 'João',
          last_name: 'Silva',
          foot,
        })
        expect(result.success).toBe(true)
      })
    })

    it('should allow optional fields', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
      })
      expect(result.success).toBe(true)
    })

    it('should allow empty string as optional field', () => {
      const result = playerCreateSchema.safeParse({
        first_name: 'João',
        last_name: 'Silva',
        bio: '',
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Guardian Schema', () => {
    it('should validate guardian_name minimum length', () => {
      const result = playerGuardianSchema.safeParse({
        guardian_name: 'A',
        guardian_relationship: 'parent',
        guardian_email: 'parent@example.com',
        guardian_phone: '+244923456789',
        guardian_id_document: new File([], 'id.pdf'),
        guardian_consent: true,
      })
      expect(result.success).toBe(false)
    })

    it('should validate email format', () => {
      const result = playerGuardianSchema.safeParse({
        guardian_name: 'João Silva',
        guardian_relationship: 'parent',
        guardian_email: 'invalid-email',
        guardian_phone: '+244923456789',
        guardian_id_document: new File([], 'id.pdf'),
        guardian_consent: true,
      })
      expect(result.success).toBe(false)
    })

    it('should validate phone format', () => {
      const result = playerGuardianSchema.safeParse({
        guardian_name: 'João Silva',
        guardian_relationship: 'parent',
        guardian_email: 'parent@example.com',
        guardian_phone: '123', // Too short
        guardian_id_document: new File([], 'id.pdf'),
        guardian_consent: true,
      })
      expect(result.success).toBe(false)
    })

    it('should require guardian_consent to be true', () => {
      const result = playerGuardianSchema.safeParse({
        guardian_name: 'João Silva',
        guardian_relationship: 'parent',
        guardian_email: 'parent@example.com',
        guardian_phone: '+244923456789',
        guardian_id_document: new File([], 'id.pdf'),
        guardian_consent: false,
      })
      expect(result.success).toBe(false)
    })

    it('should require document upload', () => {
      const result = playerGuardianSchema.safeParse({
        guardian_name: 'João Silva',
        guardian_relationship: 'parent',
        guardian_email: 'parent@example.com',
        guardian_phone: '+244923456789',
        guardian_id_document: undefined,
        guardian_consent: true,
      })
      expect(result.success).toBe(false)
    })

    it('should validate relationship enum', () => {
      const result = playerGuardianSchema.safeParse({
        guardian_name: 'João Silva',
        guardian_relationship: 'invalid_relationship',
        guardian_email: 'parent@example.com',
        guardian_phone: '+244923456789',
        guardian_id_document: new File([], 'id.pdf'),
        guardian_consent: true,
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid guardian data', () => {
      const result = playerGuardianSchema.safeParse({
        guardian_name: 'João Silva',
        guardian_relationship: 'parent',
        guardian_email: 'parent@example.com',
        guardian_phone: '+244923456789',
        guardian_id_document: new File([], 'id.pdf'),
        guardian_consent: true,
      })
      expect(result.success).toBe(true)
    })
  })

  describe('Medical Consent Schema', () => {
    it('should validate blood_type enum', () => {
      const result = playerMedicalConsentSchema.safeParse({
        blood_type: 'invalid_blood_type',
        medical_consent: true,
        emergency_contact_name: 'Maria Silva',
        emergency_contact_phone: '+244923456789',
        emergency_contact_relationship: 'Mãe',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid blood types', () => {
      const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-']
      bloodTypes.forEach((bloodType) => {
        const result = playerMedicalConsentSchema.safeParse({
          blood_type: bloodType,
          medical_consent: true,
          emergency_contact_name: 'Maria Silva',
          emergency_contact_phone: '+244923456789',
          emergency_contact_relationship: 'Mãe',
        })
        expect(result.success).toBe(true)
      })
    })

    it('should require medical_consent to be true', () => {
      const result = playerMedicalConsentSchema.safeParse({
        blood_type: 'O+',
        medical_consent: false,
        emergency_contact_name: 'Maria Silva',
        emergency_contact_phone: '+244923456789',
        emergency_contact_relationship: 'Mãe',
      })
      expect(result.success).toBe(false)
    })

    it('should validate emergency contact name minimum length', () => {
      const result = playerMedicalConsentSchema.safeParse({
        blood_type: 'O+',
        medical_consent: true,
        emergency_contact_name: 'A',
        emergency_contact_phone: '+244923456789',
        emergency_contact_relationship: 'Mãe',
      })
      expect(result.success).toBe(false)
    })

    it('should validate emergency contact phone', () => {
      const result = playerMedicalConsentSchema.safeParse({
        blood_type: 'O+',
        medical_consent: true,
        emergency_contact_name: 'Maria Silva',
        emergency_contact_phone: '123', // Too short
        emergency_contact_relationship: 'Mãe',
      })
      expect(result.success).toBe(false)
    })

    it('should allow optional medical fields', () => {
      const result = playerMedicalConsentSchema.safeParse({
        medical_consent: true,
        emergency_contact_name: 'Maria Silva',
        emergency_contact_phone: '+244923456789',
        emergency_contact_relationship: 'Mãe',
      })
      expect(result.success).toBe(true)
    })

    it('should accept allergies and conditions when provided', () => {
      const result = playerMedicalConsentSchema.safeParse({
        blood_type: 'O+',
        medical_consent: true,
        allergies: 'Penicilina',
        medical_conditions: 'Asma',
        medication: 'Inalador',
        emergency_contact_name: 'Maria Silva',
        emergency_contact_phone: '+244923456789',
        emergency_contact_relationship: 'Mãe',
      })
      expect(result.success).toBe(true)
    })
  })
})
