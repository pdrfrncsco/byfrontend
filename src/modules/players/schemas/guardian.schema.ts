import { z } from 'zod'

// ─── Legal Guardian Schema ────────────────────────────────────────────────────
// Required for ALL minor players (is_minor === true), regardless of who manages the profile.

export const playerGuardianSchema = z.object({
  guardian_name: z
    .string()
    .min(2, 'O nome do responsável deve ter pelo menos 2 caracteres.')
    .max(255, 'O nome não pode exceder 255 caracteres.'),

  guardian_relationship: z.enum(['parent', 'legal_guardian', 'other'], {
    errorMap: () => ({ message: 'Selecione uma relação válida.' }),
  }),

  guardian_email: z
    .string()
    .email('Email do responsável inválido.')
    .min(1, 'Email é obrigatório.'),

  guardian_phone: z
    .string()
    .min(7, 'Telefone inválido.')
    .max(20, 'Telefone não pode exceder 20 caracteres.'),

  guardian_id_document: z
    .custom<File | undefined>(
      (value) => value === undefined || value instanceof File,
      'Selecione um ficheiro válido.'
    )
    .refine(
      (file) => file !== undefined,
      'Documento de identidade do responsável é obrigatório.'
    ),

  guardian_consent: z
    .boolean()
    .refine(
      (val) => val === true,
      'O consentimento do responsável é obrigatório.'
    ),
})

export type PlayerGuardianFormData = z.infer<typeof playerGuardianSchema>

// ─── Medical Consent Schema ───────────────────────────────────────────────────

export const playerMedicalConsentSchema = z.object({
  blood_type: z
    .enum(['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'], {
      errorMap: () => ({ message: 'Selecione um tipo de sangue válido.' }),
    })
    .optional(),

  medical_consent: z
    .boolean()
    .refine((val) => val === true, 'O consentimento médico é obrigatório.'),

  allergies: z
    .string()
    .max(1000, 'Alergias não podem exceder 1000 caracteres.')
    .optional()
    .or(z.literal('')),

  medical_conditions: z
    .string()
    .max(1000, 'Condições médicas não podem exceder 1000 caracteres.')
    .optional()
    .or(z.literal('')),

  medication: z
    .string()
    .max(1000, 'Medicação não pode exceder 1000 caracteres.')
    .optional()
    .or(z.literal('')),

  emergency_contact_name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres.')
    .max(255, 'Nome não pode exceder 255 caracteres.'),

  emergency_contact_phone: z
    .string()
    .min(7, 'Telefone inválido.')
    .max(20, 'Telefone não pode exceder 20 caracteres.'),

  emergency_contact_relationship: z
    .string()
    .min(1, 'Relação com o contacto de emergência é obrigatória.')
    .max(100, 'Relação não pode exceder 100 caracteres.'),
})

export type PlayerMedicalConsentFormData = z.infer<typeof playerMedicalConsentSchema>

// ─── Privacy Settings Schema ──────────────────────────────────────────────────
// Aligned with backend PlayerPrivacySettings visibility levels

const visibilityLevel = z.enum(
  ['public', 'club', 'organization', 'agent', 'private'],
  { errorMap: () => ({ message: 'Selecione um nível de visibilidade válido.' }) }
)

export const playerPrivacySchema = z.object({
  profile_visibility: visibilityLevel.default('public'),
  contact_visibility: visibilityLevel.default('club'),
  contract_visibility: visibilityLevel.default('club'),
  salary_visibility: visibilityLevel.default('agent'),
  medical_visibility: visibilityLevel.default('private'),
  documents_visibility: visibilityLevel.default('club'),
  statistics_visibility: visibilityLevel.default('public'),
})

export type PlayerPrivacyFormData = z.infer<typeof playerPrivacySchema>
