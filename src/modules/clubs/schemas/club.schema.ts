import { z } from 'zod'

export const clubSettingsSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').max(255, 'O nome não pode exceder 255 caracteres.'),
  short_name: z
    .string()
    .max(20, 'A sigla não pode exceder 20 caracteres.')
    .optional()
    .or(z.literal('')),
  founded_year: z
    .union([z.coerce.number().int().min(1800).max(2100), z.literal('')])
    .optional(),
  stadium_name: z.string().max(255, 'O estádio não pode exceder 255 caracteres.').optional().or(z.literal('')),
  stadium_capacity: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
  country: z.string().min(2, 'O país é obrigatório.').max(100, 'O país não pode exceder 100 caracteres.'),
  city: z.string().max(255, 'A cidade não pode exceder 255 caracteres.').optional().or(z.literal('')),
  email: z.string().email('Email inválido.').optional().or(z.literal('')),
  phone: z.string().max(20, 'O telefone não pode exceder 20 caracteres.').optional().or(z.literal('')),
  website: z.string().url('Website inválido.').optional().or(z.literal('')),
  description: z.string().max(2000, 'A descrição não pode exceder 2000 caracteres.').optional().or(z.literal('')),
  primary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use o formato #RRGGBB.'),
  secondary_color: z.string().regex(/^#[0-9a-fA-F]{6}$/, 'Use o formato #RRGGBB.'),
  is_public: z.boolean(),
})

export type ClubSettingsFormData = z.infer<typeof clubSettingsSchema>

export const clubMemberSchema = z.object({
  full_name: z.string().min(2, 'Indique o nome completo.').max(255, 'O nome não pode exceder 255 caracteres.'),
  role: z.enum(['coach', 'assistant_coach', 'manager', 'physio', 'staff', 'president'], {
    errorMap: () => ({ message: 'Selecione um papel válido.' }),
  }),
  jersey_number: z.union([z.coerce.number().int().min(0).max(99), z.literal('')]).optional(),
  position: z.string().max(50, 'A posição não pode exceder 50 caracteres.').optional().or(z.literal('')),
  is_active: z.boolean(),
})

export type ClubMemberFormData = z.infer<typeof clubMemberSchema>

export const clubDocumentSchema = z.object({
  title: z.string().min(2, 'O título deve ter pelo menos 2 caracteres.').max(255, 'O título não pode exceder 255 caracteres.'),
  category: z.enum(['contract', 'certificate', 'license', 'regulation', 'other'], {
    errorMap: () => ({ message: 'Selecione uma categoria válida.' }),
  }),
  description: z.string().max(1000, 'A descrição não pode exceder 1000 caracteres.').optional().or(z.literal('')),
  is_public: z.boolean(),
  valid_until: z.string().optional().or(z.literal('')),
  document: z
    .custom<File>((value) => value instanceof File, 'Selecione um ficheiro válido.')
    .refine((file) => file.size > 0, 'Selecione um ficheiro válido.'),
})

export type ClubDocumentFormData = z.infer<typeof clubDocumentSchema>

export const clubSponsorSchema = z.object({
  name: z.string().min(2, 'O nome deve ter pelo menos 2 caracteres.').max(255, 'O nome não pode exceder 255 caracteres.'),
  sponsor_type: z.enum(['main', 'official', 'partner', 'technical', 'media', 'other'], {
    errorMap: () => ({ message: 'Selecione um tipo válido.' }),
  }),
  description: z.string().max(1000, 'A descrição não pode exceder 1000 caracteres.').optional().or(z.literal('')),
  website: z.string().url('Website inválido.').optional().or(z.literal('')),
  is_active: z.boolean(),
  sort_order: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
  logo: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, 'Selecione um ficheiro válido.')
    .optional(),
})

export type ClubSponsorFormData = z.infer<typeof clubSponsorSchema>
