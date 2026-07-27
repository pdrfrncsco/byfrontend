import { z } from 'zod'

export const tiebreakerRuleSchema = z.enum([
  'head_to_head_points',
  'head_to_head_goal_difference',
  'goal_difference',
  'goals_scored',
  'fair_play',
  'random_draw'
])

export const leagueConfigSchema = z.object({
  format: z.literal('league'),
  rounds: z.number().int().min(1, 'Mínimo 1 jornada.').max(100),
  homeAndAway: z.boolean().default(true),
  pointsWin: z.number().int().nonnegative().default(3),
  pointsDraw: z.number().int().nonnegative().default(1),
  pointsLoss: z.number().int().nonnegative().default(0),
  tiebreakers: z.array(tiebreakerRuleSchema).default([
    'head_to_head_points',
    'head_to_head_goal_difference',
    'goal_difference',
    'goals_scored',
    'fair_play',
    'random_draw'
  ]),
  relegationZone: z.number().int().nonnegative().default(0),
  promotionZone: z.number().int().nonnegative().default(0),
})

export type LeagueConfigFormData = z.infer<typeof leagueConfigSchema>
