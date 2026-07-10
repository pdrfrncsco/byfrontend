import { z } from 'zod'

// ─── Competition Schemas ────────────────────────────────────────────────────

export const createCompetitionSchema = z.object({
  name: z
    .string({ required_error: 'O nome é obrigatório.' })
    .min(3, 'O nome deve ter pelo menos 3 caracteres.')
    .max(100, 'O nome não pode ter mais de 100 caracteres.'),
  competition_type: z.enum(['league', 'tournament', 'cup'], {
    required_error: 'O tipo é obrigatório.',
    invalid_type_error: 'Tipo inválido.',
  }),
  season: z
    .string({ required_error: 'A época é obrigatória.' })
    .regex(/^\d{4}(-\d{4})?$/, 'Formato inválido. Use AAAA ou AAAA-AAAA (ex: 2024 ou 2024-2025).'),
  status: z.enum(['draft', 'active', 'completed']).default('draft').optional(),
})

export const updateCompetitionSchema = createCompetitionSchema.partial()

export type CreateCompetitionFormData = z.infer<typeof createCompetitionSchema>
export type UpdateCompetitionFormData = z.infer<typeof updateCompetitionSchema>

// ─── Schedule Schema ─────────────────────────────────────────────────────────

export const generateScheduleSchema = z.object({
  start_date: z
    .string({ required_error: 'A data de início é obrigatória.' })
    .min(1, 'A data de início é obrigatória.'),
  rounds_interval_days: z
    .number()
    .int()
    .min(1, 'O intervalo deve ser de pelo menos 1 dia.')
    .max(30, 'O intervalo não pode exceder 30 dias.')
    .default(7),
  double_round: z.boolean().default(true),
})

export type GenerateScheduleFormData = z.infer<typeof generateScheduleSchema>

// ─── Match Report Schema ─────────────────────────────────────────────────────

export const matchReportSchema = z.object({
  home_score: z.number().int().min(0, 'Resultado inválido.'),
  away_score: z.number().int().min(0, 'Resultado inválido.'),
  match_duration: z.number().int().min(1).max(180).optional(),
})

export type MatchReportFormData = z.infer<typeof matchReportSchema>

// ─── Regulation Schema ────────────────────────────────────────────────────────

export const regulationSchema = z.object({
  title: z
    .string({ required_error: 'O título é obrigatório.' })
    .min(3, 'O título deve ter pelo menos 3 caracteres.')
    .max(200, 'O título não pode exceder 200 caracteres.'),
  content: z
    .string({ required_error: 'O conteúdo é obrigatório.' })
    .min(10, 'O conteúdo deve ter pelo menos 10 caracteres.'),
  category: z.string().optional(),
  order: z.number().int().min(0).optional(),
})

export type RegulationFormData = z.infer<typeof regulationSchema>

// ─── Goal Schema ─────────────────────────────────────────────────────────────

export const goalSchema = z.object({
  player_id: z.string({ required_error: 'O jogador é obrigatório.' }).uuid('ID de jogador inválido.'),
  club_id: z.string({ required_error: 'O clube é obrigatório.' }).uuid('ID de clube inválido.'),
  minute: z.number().int().min(1).max(120),
  goal_type: z.enum(['normal', 'penalty', 'own_goal']).default('normal'),
  assist_player_id: z.string().uuid().optional().nullable(),
})

export type GoalFormData = z.infer<typeof goalSchema>
