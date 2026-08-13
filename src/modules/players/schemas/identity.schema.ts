import { z } from 'zod'

// ─── Identity Document Schema ─────────────────────────────────────────────────

export const playerIdentityDocumentSchema = z
  .object({
    document_type: z.enum(
      ['national_id', 'passport', 'birth_certificate', 'residence_permit', 'other'],
      { errorMap: () => ({ message: 'Selecione um tipo de documento válido.' }) }
    ),

    document_number: z
      .string()
      .max(100, 'Número não pode exceder 100 caracteres.')
      .optional()
      .or(z.literal('')),

    issuing_country: z
      .string()
      .max(3, 'Use o código ISO 3166-1 alpha-3 (ex: PRT).')
      .optional()
      .or(z.literal('')),

    issuing_authority: z
      .string()
      .max(255, 'Autoridade emissora não pode exceder 255 caracteres.')
      .optional()
      .or(z.literal('')),

    issue_date: z
      .string()
      .optional()
      .or(z.literal('')),

    expiry_date: z
      .string()
      .optional()
      .or(z.literal('')),

    document_front: z
      .custom<File | undefined>(
        (val) => val === undefined || val instanceof File,
        'Selecione um ficheiro válido.'
      )
      .optional(),

    document_back: z
      .custom<File | undefined>(
        (val) => val === undefined || val instanceof File,
        'Selecione um ficheiro válido.'
      )
      .optional(),
  })
  .refine(
    (data) => data.document_front instanceof File || !!data.document_number,
    {
      message: 'Carregue a frente do documento ou indique o número do documento.',
      path: ['document_front'],
    }
  )
  .refine(
    (data) => {
      if (!data.issue_date || !data.expiry_date) return true
      return new Date(data.expiry_date) > new Date(data.issue_date)
    },
    {
      message: 'A data de validade deve ser posterior à data de emissão.',
      path: ['expiry_date'],
    }
  )

export type PlayerIdentityDocumentFormData = z.infer<typeof playerIdentityDocumentSchema>

// ─── Document Verification Schema ────────────────────────────────────────────

export const documentVerificationSchema = z.object({
  verification_notes: z
    .string()
    .max(500, 'Notas não podem exceder 500 caracteres.')
    .optional()
    .or(z.literal('')),
})

export type DocumentVerificationFormData = z.infer<typeof documentVerificationSchema>

// ─── Document Rejection Schema ────────────────────────────────────────────────

export const documentRejectionSchema = z.object({
  reason: z
    .string()
    .min(10, 'Indique o motivo da rejeição (mínimo 10 caracteres).')
    .max(500, 'Motivo não pode exceder 500 caracteres.'),
})

export type DocumentRejectionFormData = z.infer<typeof documentRejectionSchema>
