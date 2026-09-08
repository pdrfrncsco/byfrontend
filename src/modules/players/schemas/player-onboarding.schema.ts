import { z } from 'zod'

const POSITIONS = ['gk', 'cb', 'lb', 'rb', 'lwb', 'rwb', 'cm', 'cdm', 'cam', 'lm', 'rm', 'lw', 'rw', 'st', 'cf', 'multiple'] as const

export const playerProfileStepSchema = z.object({
  first_name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(255, 'O nome não pode exceder 255 caracteres.'),
  last_name: z
    .string()
    .min(2, 'O apelido deve ter pelo menos 2 caracteres.')
    .max(255, 'O apelido não pode exceder 255 caracteres.'),
  date_of_birth: z.string().optional().or(z.literal('')),
  nationality: z
    .string()
    .max(100, 'A nacionalidade não pode exceder 100 caracteres.')
    .optional()
    .or(z.literal('')),
  bio: z
    .string()
    .max(2000, 'A biografia não pode exceder 2000 caracteres.')
    .optional()
    .or(z.literal('')),
})

export type PlayerProfileStepFormData = z.infer<typeof playerProfileStepSchema>

export const playerFootballStepSchema = z.object({
  primary_position: z
    .enum(POSITIONS, { errorMap: () => ({ message: 'Selecione uma posição válida.' }) })
    .optional(),
  height_cm: z
    .union([z.coerce.number().int().min(100, 'Mínimo 100 cm.').max(250, 'Máximo 250 cm.'), z.literal('')])
    .optional(),
  weight_kg: z
    .union([z.coerce.number().int().min(30, 'Mínimo 30 kg.').max(200, 'Máximo 200 kg.'), z.literal('')])
    .optional(),
  foot: z
    .enum(['left', 'right', 'both'], { errorMap: () => ({ message: 'Selecione um pé preferido.' }) })
    .optional(),
})

export type PlayerFootballStepFormData = z.infer<typeof playerFootballStepSchema>

export const playerContactStepSchema = z.object({
  phone: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido.').optional().or(z.literal('')),
  emergency_contact_name: z.string().optional().or(z.literal('')),
  emergency_contact_phone: z.string().optional().or(z.literal('')),
})

export type PlayerContactStepFormData = z.infer<typeof playerContactStepSchema>

export const playerIdentityStepSchema = z.object({
  document_type: z.string().optional().or(z.literal('')),
  document_number: z.string().optional().or(z.literal('')),
  expiration_date: z.string().optional().or(z.literal('')),
})

export type PlayerIdentityStepFormData = z.infer<typeof playerIdentityStepSchema>

export const playerGuardianStepSchema = z.object({
  guardian_name: z.string().optional().or(z.literal('')),
  guardian_relation: z.string().optional().or(z.literal('')),
  guardian_phone: z.string().optional().or(z.literal('')),
  guardian_email: z.string().email('Email inválido.').optional().or(z.literal('')),
})

export type PlayerGuardianStepFormData = z.infer<typeof playerGuardianStepSchema>

export const playerClubStepSchema = z.object({
  club_id: z.string().optional().or(z.literal('')),
  organization_slug: z.string().optional().or(z.literal('')),
})

export type PlayerClubStepFormData = z.infer<typeof playerClubStepSchema>
