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
  asset: z.string().min(1, 'O documento é obrigatório.'),
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
  media_asset: z.string().optional().or(z.literal('')),
  match: z.string().optional().or(z.literal('')),
  is_featured: z.boolean(),
  order: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
}).refine((data) => data.video_url || data.media_asset, {
  message: 'Indique uma URL do vídeo ou carregue um ficheiro.',
  path: ['video_url'],
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
  trophy_image: z.string().url('URL da imagem inválida.').optional().or(z.literal('')),
  certificate_url: z.string().url('URL do certificado inválida.').optional().or(z.literal('')),
})

export type PlayerAchievementFormData = z.infer<typeof playerAchievementSchema>
