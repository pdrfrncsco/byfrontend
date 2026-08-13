import { z } from 'zod'

/**
 * Medical profile update schema
 * Validações para atualização de perfil médico
 */
export const medicalProfileSchema = z.object({
  blood_type: z
    .string({
      required_error: 'Tipo sanguíneo é obrigatório',
    })
    .refine(
      (val) => ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'unknown'].includes(val),
      'Tipo sanguíneo inválido'
    )
    .describe('Tipo de sangue do jogador'),

  medical_status: z
    .enum(['fit', 'injured', 'recovering', 'suspended_medical'])
    .describe('Estado de saúde atual'),

  injury_status: z
    .string()
    .max(500, 'Descrição de lesão não pode exceder 500 caracteres')
    .optional()
    .nullable()
    .describe('Descrição detalhada da lesão, se aplicável'),

  medical_clearance: z
    .boolean()
    .describe('Se o jogador está medicamente apto para competir'),

  fitness_status: z
    .string()
    .max(255, 'Estado físico não pode exceder 255 caracteres')
    .optional()
    .nullable()
    .describe('Avaliação da condição física'),

  medical_notes: z
    .string()
    .max(1000, 'Notas médicas não podem exceder 1000 caracteres')
    .optional()
    .nullable()
    .describe('Observações médicas (acesso restrito)'),

  last_medical_exam: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .describe('Data do último exame médico'),

  next_medical_exam: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .describe('Data do próximo exame médico'),

  allergies: z
    .string()
    .max(500, 'Alergias não podem exceder 500 caracteres')
    .optional()
    .nullable()
    .describe('Lista de alergias conhecidas'),

  current_medications: z
    .string()
    .max(500, 'Medicamentos não podem exceder 500 caracteres')
    .optional()
    .nullable()
    .describe('Medicamentos em uso'),

  medical_conditions: z
    .string()
    .max(500, 'Condições médicas não podem exceder 500 caracteres')
    .optional()
    .nullable()
    .describe('Condições médicas pré-existentes'),
})
  .refine(
    (data) => {
      // If injured, must have injury status
      if (data.medical_status === 'injured' && !data.injury_status) {
        return false
      }
      return true
    },
    {
      message: 'Lesionado: descrição de lesão é obrigatória',
      path: ['injury_status'],
    }
  )
  .refine(
    (data) => {
      // Next exam date should be in the future
      if (data.next_medical_exam) {
        const nextExam = new Date(data.next_medical_exam)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (nextExam < today) {
          return false
        }
      }
      return true
    },
    {
      message: 'Próximo exame deve ser no futuro',
      path: ['next_medical_exam'],
    }
  )

export type MedicalProfile = z.infer<typeof medicalProfileSchema>

/**
 * Medical document upload schema
 * Validações para upload de documentos médicos
 */
export const medicalDocumentUploadSchema = z.object({
  document_type: z
    .enum([
      'medical_certificate',
      'injury_report',
      'scan_result',
      'lab_result',
      'vaccination_record',
      'surgery_report',
      'physical_exam',
      'cardiac_screening',
      'other',
    ])
    .describe('Tipo de documento médico'),

  title: z
    .string({
      required_error: 'Título é obrigatório',
    })
    .min(5, 'Título deve ter pelo menos 5 caracteres')
    .max(255, 'Título não pode exceder 255 caracteres')
    .describe('Título do documento'),

  description: z
    .string()
    .max(1000, 'Descrição não pode exceder 1000 caracteres')
    .optional()
    .nullable()
    .describe('Descrição adicional'),

  issued_at: z
    .string()
    .datetime()
    .describe('Data de emissão do documento'),

  expires_at: z
    .string()
    .datetime()
    .optional()
    .nullable()
    .describe('Data de validade (se aplicável)'),

  is_confidential: z
    .boolean()
    .default(true)
    .describe('Se o documento é confidencial (acessível apenas a pessoal médico)'),

  file: z
    .instanceof(File, { message: 'Ficheiro é obrigatório' })
    .refine((file) => file.size <= 10 * 1024 * 1024, 'Ficheiro não pode exceder 10MB')
    .refine(
      (file) =>
        [
          'application/pdf',
          'image/jpeg',
          'image/png',
          'image/webp',
          'application/msword',
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        ].includes(file.type),
      'Tipo de ficheiro não suportado (PDF, JPG, PNG, WEBP, DOC, DOCX)'
    )
    .describe('Ficheiro do documento'),
})
  .refine(
    (data) => {
      // Expiry date should be in the future
      if (data.expires_at) {
        const expiryDate = new Date(data.expires_at)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (expiryDate <= today) {
          return false
        }
      }
      return true
    },
    {
      message: 'Data de validade deve ser no futuro',
      path: ['expires_at'],
    }
  )
  .refine(
    (data) => {
      // Issued date should not be in the future
      const issuedDate = new Date(data.issued_at)
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(0, 0, 0, 0)

      return issuedDate <= tomorrow
    },
    {
      message: 'Data de emissão não pode ser no futuro',
      path: ['issued_at'],
    }
  )

export type MedicalDocumentUpload = z.infer<typeof medicalDocumentUploadSchema>

/**
 * Document verification schema (staff-only)
 */
export const medicalDocumentVerificationSchema = z.object({
  verification_notes: z
    .string()
    .max(500, 'Notas não podem exceder 500 caracteres')
    .optional()
    .describe('Notas de verificação'),
})

export type MedicalDocumentVerification = z.infer<typeof medicalDocumentVerificationSchema>

/**
 * Document rejection schema (staff-only)
 */
export const medicalDocumentRejectionSchema = z.object({
  reason: z
    .string({
      required_error: 'Motivo de rejeição é obrigatório',
    })
    .min(10, 'Motivo deve ter pelo menos 10 caracteres')
    .max(500, 'Motivo não pode exceder 500 caracteres')
    .describe('Motivo da rejeição do documento'),
})

export type MedicalDocumentRejection = z.infer<typeof medicalDocumentRejectionSchema>
