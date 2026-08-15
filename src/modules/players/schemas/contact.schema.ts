import { z } from 'zod'

// ─── Player Contact Schema ────────────────────────────────────────────────────

export const playerContactSchema = z.object({
  primary_email: z
    .string()
    .email('Email inválido.')
    .optional()
    .or(z.literal('')),

  secondary_email: z
    .string()
    .email('Email secundário inválido.')
    .optional()
    .or(z.literal('')),

  mobile_phone: z
    .string()
    .min(7, 'Telefone inválido.')
    .max(20, 'Telefone não pode exceder 20 caracteres.')
    .optional()
    .or(z.literal('')),

  secondary_phone: z
    .string()
    .min(7, 'Telefone inválido.')
    .max(20, 'Telefone não pode exceder 20 caracteres.')
    .optional()
    .or(z.literal('')),

  country_code: z
    .string()
    .max(5, 'Código de país inválido.')
    .optional()
    .or(z.literal('')),

  address: z
    .string()
    .max(500, 'Morada não pode exceder 500 caracteres.')
    .optional()
    .or(z.literal('')),

  city: z
    .string()
    .max(100, 'Cidade não pode exceder 100 caracteres.')
    .optional()
    .or(z.literal('')),

  province: z
    .string()
    .max(100, 'Província/Estado não pode exceder 100 caracteres.')
    .optional()
    .or(z.literal('')),

  postal_code: z
    .string()
    .max(20, 'Código postal não pode exceder 20 caracteres.')
    .optional()
    .or(z.literal('')),

  country: z
    .string()
    .max(3, 'Use o código ISO 3166-1 alpha-3 (ex: PRT).')
    .optional()
    .or(z.literal('')),
})

export type PlayerContactFormData = z.infer<typeof playerContactSchema>

// ─── Emergency Contact Schema ─────────────────────────────────────────────────

export const emergencyContactSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres.')
    .max(255, 'Nome não pode exceder 255 caracteres.'),

  relationship: z
    .string()
    .min(1, 'Relação é obrigatória.')
    .max(100, 'Relação não pode exceder 100 caracteres.'),

  phone: z
    .string()
    .min(7, 'Telefone inválido.')
    .max(20, 'Telefone não pode exceder 20 caracteres.'),

  email: z
    .string()
    .email('Email inválido.')
    .optional()
    .or(z.literal('')),

  country: z
    .string()
    .max(3, 'Use o código ISO 3166-1 alpha-3 (ex: PRT).')
    .optional()
    .or(z.literal('')),
})

export type EmergencyContactFormData = z.infer<typeof emergencyContactSchema>
