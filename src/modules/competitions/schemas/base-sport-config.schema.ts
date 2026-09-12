import { z } from 'zod'

export const baseSportConfigSchema = z.object({
  matchDuration: z.number().int().min(10, 'Mínimo 10 minutos.').max(180, 'Máximo 180 minutos.').optional(),
  extraTimeMinutes: z.number().int().min(0).max(60).optional(),
  maxSubstitutes: z.number().int().min(1, 'Mínimo 1 substituição.').max(15).optional(),
  extraTimeSubstitutions: z.boolean().optional(),
  yellowCardsPerSuspension: z.number().int().min(1).max(10).optional(),
  redCardSuspensionMatches: z.number().int().min(1).max(10).optional(),
  maxClubs: z.number().int().min(2).max(128).optional(),
  maxPlayersPerSquad: z.number().int().min(5).max(50).optional(),
  allowPublicRegistration: z.boolean().optional(),
})

export type BaseSportConfigFormData = z.infer<typeof baseSportConfigSchema>
