import { z } from 'zod'

export const knockoutRoundSchema = z.enum([
  'final',
  'semi-final',
  'quarter-final',
  'round-of-16',
  'round-of-32'
])

export const tournamentConfigSchema = z.object({
  format: z.literal('tournament'),
  groupStage: z.object({
    numberOfGroups: z.number().int().min(1, 'Mínimo 1 grupo.').max(32),
    teamsPerGroup: z.number().int().min(2, 'Mínimo 2 equipas por grupo.').max(20),
    qualifiersPerGroup: z.number().int().min(1, 'Mínimo 1 qualificado por grupo.').max(10),
    homeAndAway: z.boolean().default(true),
  }),
  knockoutStage: z.object({
    rounds: z.array(knockoutRoundSchema).default(['final']),
    twoLegs: z.boolean().default(false),
    extraTimeOnDraw: z.boolean().default(true),
    penaltiesOnDraw: z.boolean().default(true),
  }),
})

export type TournamentConfigFormData = z.infer<typeof tournamentConfigSchema>
