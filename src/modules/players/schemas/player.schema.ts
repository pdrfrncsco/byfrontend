import { z } from 'zod'

// ─── Player Form Schema ───────────────────────────────────────────────────────

export const playerCreateSchema = z.object({
  first_name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(255, 'O nome não pode exceder 255 caracteres.'),
  last_name: z
    .string()
    .min(2, 'O apelido deve ter pelo menos 2 caracteres.')
    .max(255, 'O apelido não pode exceder 255 caracteres.'),
  date_of_birth: z.string().optional().or(z.literal('')),
  nationality: z.string().max(100, 'A nacionalidade não pode exceder 100 caracteres.').optional().or(z.literal('')),
  primary_position: z.enum(
    ['gk', 'cb', 'lb', 'rb', 'lwb', 'rwb', 'cm', 'cdm', 'cam', 'lm', 'rm', 'lw', 'rw', 'st', 'cf', 'multiple'],
    { errorMap: () => ({ message: 'Selecione uma posição válida.' }) }
  ).optional(),
  email: z.string().email('Email inválido.').optional().or(z.literal('')),
  phone: z.string().max(20, 'O telefone não pode exceder 20 caracteres.').optional().or(z.literal('')),
  height_cm: z.union([z.coerce.number().int().min(100).max(250), z.literal('')]).optional(),
  weight_kg: z.union([z.coerce.number().int().min(30).max(200), z.literal('')]).optional(),
  foot: z.enum(['left', 'right', 'both'], { errorMap: () => ({ message: 'Selecione um pé preferido.' }) }).optional(),
  bio: z.string().max(2000, 'A biografia não pode exceder 2000 caracteres.').optional().or(z.literal('')),
  avatar: z.string().url('URL inválida.').optional().or(z.literal('')),
  is_public: z.boolean().optional(),
})

export type PlayerCreateFormData = z.infer<typeof playerCreateSchema>

export const playerUpdateSchema = playerCreateSchema.extend({
  status: z.enum(['active', 'retired', 'banned', 'inactive'], {
    errorMap: () => ({ message: 'Selecione um estado válido.' }),
  }).optional(),
})

export type PlayerUpdateFormData = z.infer<typeof playerUpdateSchema>

// ─── Player Registration Schema ───────────────────────────────────────────────

export const playerRegisterSchema = z.object({
  club_id: z.string().min(1, 'Selecione um clube.'),
  joined_date: z.string().min(1, 'A data de entrada é obrigatória.'),
  shirt_number: z.union([z.coerce.number().int().min(1).max(99), z.literal('')]).optional(),
  competition_id: z.string().optional().or(z.literal('')),
})

export type PlayerRegisterFormData = z.infer<typeof playerRegisterSchema>

export const playerLinkRequestSchema = z.object({
  club_id: z.string().min(1, 'Selecione um clube.'),
  joined_date: z.string().min(1, 'A data de entrada é obrigatória.'),
  shirt_number: z.union([z.coerce.number().int().min(1).max(99), z.literal('')]).optional(),
  competition_id: z.string().optional().or(z.literal('')),
})

export type PlayerLinkRequestFormData = z.infer<typeof playerLinkRequestSchema>

// ─── Player Document Schema ───────────────────────────────────────────────────

export const playerDocumentSchema = z.object({
  title: z
    .string()
    .min(2, 'O título deve ter pelo menos 2 caracteres.')
    .max(255, 'O título não pode exceder 255 caracteres.'),
  category: z.enum(
    ['contract', 'passport', 'medical', 'license', 'certificate', 'transfer', 'insurance', 'other'],
    { errorMap: () => ({ message: 'Selecione uma categoria válida.' }) }
  ),
  description: z.string().max(1000, 'A descrição não pode exceder 1000 caracteres.').optional().or(z.literal('')),
  valid_from: z.string().optional().or(z.literal('')),
  valid_until: z.string().optional().or(z.literal('')),
  club: z.string().optional().or(z.literal('')),
  is_private: z.boolean(),
  document: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, 'Selecione um ficheiro válido.')
    .optional(),
}).refine((data) => data.document instanceof File, {
  message: 'O documento é obrigatório.',
  path: ['document'],
})

export type PlayerDocumentFormData = z.infer<typeof playerDocumentSchema>

// ─── Player Video Schema ──────────────────────────────────────────────────────

export const playerVideoSchema = z.object({
  title: z
    .string()
    .min(2, 'O título deve ter pelo menos 2 caracteres.')
    .max(255, 'O título não pode exceder 255 caracteres.'),
  description: z.string().max(1000, 'A descrição não pode exceder 1000 caracteres.').optional().or(z.literal('')),
  video_type: z.enum(['highlights', 'skills', 'interview', 'match_clip', 'training', 'other'], {
    errorMap: () => ({ message: 'Selecione um tipo de vídeo válido.' }),
  }),
  video_url: z.string().url('URL do vídeo inválida.').optional().or(z.literal('')),
  thumbnail_url: z.string().url('URL da miniatura inválida.').optional().or(z.literal('')),
  video: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, 'Selecione um ficheiro válido.')
    .optional(),
  media_asset: z.string().optional().or(z.literal('')),
  match: z.string().optional().or(z.literal('')),
  is_featured: z.boolean(),
  order: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
}).refine((data) => data.video_url || data.video instanceof File, {
  message: 'Indique uma URL do vídeo ou carregue um ficheiro.',
  path: ['video'],
})

export type PlayerVideoFormData = z.infer<typeof playerVideoSchema>

// ─── Player Achievement Schema ────────────────────────────────────────────────

export const playerAchievementSchema = z.object({
  title: z
    .string()
    .min(2, 'O título deve ter pelo menos 2 caracteres.')
    .max(255, 'O título não pode exceder 255 caracteres.'),
  achievement_type: z.enum(
    [
      'league_title', 'cup_title', 'super_cup', 'tournament', 'international_club',
      'top_scorer', 'best_player', 'mvp', 'best_goalkeeper', 'best_young_player',
      'golden_boot', 'golden_ball',
      'milestone_100_goals', 'milestone_500_appearances', 'milestone_100_caps',
      'national_team_cap', 'world_cup', 'continental_cup', 'olympics', 'other'
    ],
    { errorMap: () => ({ message: 'Selecione um tipo de conquista válido.' }) }
  ),
  level: z.enum(['club', 'national', 'continental', 'international', 'world'], {
    errorMap: () => ({ message: 'Selecione um nível válido.' }),
  }),
  description: z.string().max(1000, 'A descrição não pode exceder 1000 caracteres.').optional().or(z.literal('')),
  date_achieved: z.string().optional().or(z.literal('')),
  season: z.string().max(20, 'A época não pode exceder 20 caracteres.').optional().or(z.literal('')),
  competition: z.string().optional().or(z.literal('')),
  club: z.string().optional().or(z.literal('')),
  trophy_image: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, 'Selecione uma imagem válida.')
    .optional(),
  trophy_image_url: z.string().url('URL da imagem inválida.').optional().or(z.literal('')),
  certificate: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, 'Selecione um ficheiro válido.')
    .optional(),
  certificate_url: z.string().url('URL do certificado inválida.').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.trophy_image instanceof File && data.trophy_image_url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Indique uma URL ou carregue uma imagem do troféu, não ambos.',
      path: ['trophy_image'],
    })
  }
  if (data.certificate instanceof File && data.certificate_url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Indique uma URL ou carregue um certificado, não ambos.',
      path: ['certificate'],
    })
  }
})

export type PlayerAchievementFormData = z.infer<typeof playerAchievementSchema>
