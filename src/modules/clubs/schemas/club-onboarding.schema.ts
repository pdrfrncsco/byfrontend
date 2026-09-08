import { z } from 'zod'

export const clubInstitutionalStepSchema = z.object({
  name: z.string().min(2, 'O nome do clube é obrigatório.'),
  short_name: z.string().optional().or(z.literal('')),
  founded_year: z.union([z.coerce.number().int().min(1800).max(2100), z.literal('')]).optional(),
  country: z.string().optional().or(z.literal('')),
  city: z.string().optional().or(z.literal('')),
})

export type ClubInstitutionalStepFormData = z.infer<typeof clubInstitutionalStepSchema>

export const clubFacilitiesStepSchema = z.object({
  stadium_name: z.string().optional().or(z.literal('')),
  stadium_capacity: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
})

export type ClubFacilitiesStepFormData = z.infer<typeof clubFacilitiesStepSchema>

export const clubIdentityStepSchema = z.object({
  primary_color: z.string().optional().or(z.literal('')),
  secondary_color: z.string().optional().or(z.literal('')),
  email: z.string().email('Email inválido.').optional().or(z.literal('')),
  phone: z.string().optional().or(z.literal('')),
  website: z.string().url('URL inválida.').optional().or(z.literal('')),
  description: z.string().optional().or(z.literal('')),
})

export type ClubIdentityStepFormData = z.infer<typeof clubIdentityStepSchema>

export const clubAffiliationStepSchema = z.object({
  organization_slug: z.string().min(1, 'Escolha uma organização.'),
})

export type ClubAffiliationStepFormData = z.infer<typeof clubAffiliationStepSchema>
