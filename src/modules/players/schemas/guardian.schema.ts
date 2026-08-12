import { z } from 'zod'

// ─── Guardian Form Schema ─────────────────────────────────────────────────────

export const playerGuardianSchema = z.object({
  guardian_name: z
    .string()
    .min(2, 'O nome do responsável deve ter pelo menos 2 caracteres.')
    .max(255, 'O nome não pode exceder 255 caracteres.'),
  
  guardian_relationship: z.enum(
    ['parent', 'legal_guardian', 'other'],
    { errorMap: () => ({ message: 'Selecione uma relação válida.' }) }
  ),
  
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
    .refine((file) => file !== undefined, 'Documento de identidade do responsável é obrigatório.'),
  
  guardian_consent: z
    .boolean()
    .refine((val) => val === true, 'O consentimento do responsável é obrigatório.'),
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

export const playerPrivacySchema = z.object({
  profile_visibility: z
    .enum(['public', 'private', 'clubs_only'], {
      errorMap: () => ({ message: 'Selecione uma opção de visibilidade válida.' }),
    })
    .default('private'),
  
  show_contact_info: z.boolean().default(false),
  
  show_medical_data: z.boolean().default(false),
  
  show_contract_data: z.boolean().default(false),
  
  allow_scout_contact: z.boolean().default(false),
  
  allow_agent_contact: z.boolean().default(false),
  
  allow_data_export: z.boolean().default(false),
})

export type PlayerPrivacyFormData = z.infer<typeof playerPrivacySchema>
