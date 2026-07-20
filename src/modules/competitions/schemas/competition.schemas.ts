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

// Aliases para API validation
export const CompetitionCreateSchema = createCompetitionSchema
export const CompetitionUpdateSchema = updateCompetitionSchema

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

// Alias for API validation
export const MatchReportCreateSchema = matchReportSchema

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

// Alias for API validation
export const CompetitionRegulationCreateSchema = regulationSchema

export type RegulationFormData = z.infer<typeof regulationSchema>

// ─── Goal Schema ─────────────────────────────────────────────────────────────

export const goalSchema = z.object({
  player_id: z.string({ required_error: 'O jogador é obrigatório.' }).uuid('ID de jogador inválido.'),
  club_id: z.string({ required_error: 'O clube é obrigatório.' }).uuid('ID de clube inválido.'),
  minute: z.number().int().min(1).max(120),
  goal_type: z.enum(['normal', 'penalty', 'own_goal']).default('normal'),
  assist_player_id: z.string().uuid().optional().nullable(),
})

// Alias for API validation
export const GoalCreateSchema = goalSchema

export type GoalFormData = z.infer<typeof goalSchema>

// ─── Event Schema ─────────────────────────────────────────────────────────────

export const matchEventSchema = z.object({
  event_type: z.enum(['goal', 'own_goal', 'yellow_card', 'red_card', 'yellow_red', 'substitution_in', 'substitution_out', 'penalty_scored', 'penalty_missed'], {
    required_error: 'O tipo de evento é obrigatório.',
  }),
  minute: z
    .number()
    .int()
    .min(1, 'O minuto deve ser positivo.')
    .max(150, 'O minuto não pode exceder 150.'),
  extra_time: z.boolean().default(false).optional(),
  club: z.string({ required_error: 'O clube é obrigatório.' }),
  player: z.string().optional().nullable(),
  player_off: z.string().optional().nullable(),
  notes: z.string().max(500).optional(),
})

// Alias for API validation
export const MatchEventCreateSchema = matchEventSchema

export type MatchEventFormData = z.infer<typeof matchEventSchema>

// ─── Lineup Schema ────────────────────────────────────────────────────────────

export const lineupPlayerSchema = z.object({
  player_id: z.string({ required_error: 'O jogador é obrigatório.' }),
  status: z.enum(['starter', 'substitute'], {
    required_error: 'O status do jogador é obrigatório.',
  }),
  position: z.string({ required_error: 'A posição é obrigatória.' }),
  shirt_number: z
    .number()
    .int()
    .min(1, 'O número da camisa deve ser entre 1 e 99.')
    .max(99),
  is_captain: z.boolean().optional(),
  is_goalkeeper: z.boolean().optional(),
  formation_position: z.number().int().nonnegative().optional(),
})

export const lineupSubmissionSchema = z.object({
  formation: z.string().optional(),
  players: z
    .array(lineupPlayerSchema, {
      required_error: 'A escalação é obrigatória.',
    })
    .min(11, 'A escalação deve ter pelo menos 11 jogadores'),
})

// Alias for API validation
export const LineupSubmissionDataSchema = lineupSubmissionSchema

export type LineupFormData = z.infer<typeof lineupSubmissionSchema>

// ─── Suspension Schema ─────────────────────────────────────────────────────────

export const suspensionSchema = z.object({
  player: z.string({ required_error: 'O jogador é obrigatório.' }),
  club: z.string({ required_error: 'O clube é obrigatório.' }),
  suspension_type: z.enum(['yellow_cards', 'red_card', 'double_yellow'], {
    required_error: 'O tipo de suspensão é obrigatório.',
  }),
  matches_suspended: z
    .number()
    .int()
    .min(1, 'Mínimo 1 jogo.')
    .max(50),
  effective_from: z.string({ required_error: 'A data efectiva é obrigatória.' }),
  reason: z.string().max(500).optional(),
})

// Alias for API validation
export const ManualSuspensionCreateSchema = suspensionSchema

export type SuspensionFormData = z.infer<typeof suspensionSchema>

// ─── Match Score Update Schema ─────────────────────────────────────────────────

export const matchScoreUpdateSchema = z.object({
  home_score: z.number().int().min(0, 'Resultado inválido.'),
  away_score: z.number().int().min(0, 'Resultado inválido.'),
  status: z.enum(['scheduled', 'live', 'finished', 'postponed', 'cancelled']).optional(),
})

// Alias for API validation
export const MatchScoreUpdateSchema = matchScoreUpdateSchema

export type MatchScoreUpdateFormData = z.infer<typeof matchScoreUpdateSchema>

// ─── Registration Schema ───────────────────────────────────────────────────────

export const registerClubSchema = z.object({
  club: z.string({ required_error: 'O clube é obrigatório.' }).uuid('ID de clube inválido.'),
})

export type RegisterClubFormData = z.infer<typeof registerClubSchema>

// ─── Utility Schemas for API responses ─────────────────────────────────────────

export const paginatedResponseSchema = <T extends z.ZodType>(itemSchema: T) =>
  z.object({
    count: z.number().int().nonnegative(),
    next: z.string().url().nullable().optional(),
    previous: z.string().url().nullable().optional(),
    results: z.array(itemSchema),
  })

// Response wrapper for API success
export const apiSuccessResponseSchema = <T extends z.ZodType>(dataSchema: T) =>
  z.object({
    success: z.boolean(),
    data: dataSchema,
    message: z.string().optional(),
  })

// Response wrapper for API error
export const apiErrorResponseSchema = z.object({
  success: z.literal(false),
  error: z.object({
    message: z.string(),
    code: z.string().optional(),
    details: z.record(z.any()).optional(),
  }),
})
