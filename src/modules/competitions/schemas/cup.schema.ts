import { z } from 'zod'

export const cupRoundSchema = z.enum([
  'final',
  'semi-final',
  'quarter-final',
  'round-of-16',
  'round-of-32',
  'round-of-64'
])

export const cupConfigSchema = z.object({
  format: z.literal('cup'),
  seeded: z.boolean().default(false),
  twoLegs: z.boolean().default(false),
  twoLegsFinal: z.boolean().default(false),
  extraTimeOnDraw: z.boolean().default(true),
  penaltiesOnDraw: z.boolean().default(true),
  rounds: z.array(cupRoundSchema).default(['final']),
  byeAllowed: z.boolean().default(true),
})

export type CupConfigFormData = z.infer<typeof cupConfigSchema>
