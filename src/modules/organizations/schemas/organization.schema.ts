/**
 * Organization Zod schemas with Portuguese validation messages.
 */

import { z } from 'zod'

export const organizationUpdateSchema = z.object({
  name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(255, 'O nome não pode exceder 255 caracteres.'),
  type: z.enum(['federation', 'association', 'league', 'organizer', 'academy'], {
    errorMap: () => ({ message: 'Selecione um tipo válido.' }),
  }),
  primary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'A cor primária deve estar no formato #RRGGBB.'),
  secondary_color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, 'A cor secundária deve estar no formato #RRGGBB.'),
  country: z
    .string()
    .min(2, 'O país é obrigatório.')
    .max(100, 'O país não pode exceder 100 caracteres.'),
  city: z
    .string()
    .max(255, 'A cidade não pode exceder 255 caracteres.')
    .optional()
    .or(z.literal('')),
  email: z
    .string()
    .email('Email inválido.')
    .optional()
    .or(z.literal('')),
  phone: z
    .string()
    .max(20, 'O telefone não pode exceder 20 caracteres.')
    .optional()
    .or(z.literal('')),
  website: z
    .string()
    .url('Website inválido.')
    .optional()
    .or(z.literal('')),
  description: z
    .string()
    .max(2000, 'A descrição não pode exceder 2000 caracteres.')
    .optional()
    .or(z.literal('')),
  is_public: z.boolean(),
  language: z
    .string()
    .max(5, 'O código de idioma não pode exceder 5 caracteres.')
    .optional()
    .or(z.literal('')),
  timezone: z
    .string()
    .max(50, 'O fuso horário não pode exceder 50 caracteres.')
    .optional()
    .or(z.literal('')),
})

export type OrganizationUpdateFormData = z.infer<typeof organizationUpdateSchema>
