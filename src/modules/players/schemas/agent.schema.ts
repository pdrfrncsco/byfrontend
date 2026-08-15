import { z } from 'zod'

// ─── Agent Relationship Schema ────────────────────────────────────────────────

export const agentRelationshipSchema = z
  .object({
    agent: z
      .string()
      .uuid('Selecione um agente válido.')
      .min(1, 'Agente é obrigatório.'),

    start_date: z
      .string()
      .min(1, 'Data de início é obrigatória.'),

    end_date: z
      .string()
      .optional()
      .or(z.literal('')),

    commission_rate: z
      .union([z.coerce.number().min(0, 'Comissão não pode ser negativa.').max(100, 'Comissão não pode exceder 100%.'), z.literal('')])
      .optional(),

    notes: z
      .string()
      .max(1000, 'Notas não podem exceder 1000 caracteres.')
      .optional()
      .or(z.literal('')),
  })
  .refine(
    (data) => {
      if (!data.end_date) return true
      return new Date(data.end_date) > new Date(data.start_date)
    },
    {
      message: 'A data de fim deve ser posterior à data de início.',
      path: ['end_date'],
    }
  )

export type AgentRelationshipFormData = z.infer<typeof agentRelationshipSchema>

// ─── Agent Create Schema ──────────────────────────────────────────────────────

export const agentCreateSchema = z.object({
  name: z
    .string()
    .min(2, 'Nome deve ter pelo menos 2 caracteres.')
    .max(255, 'Nome não pode exceder 255 caracteres.'),

  agency_name: z
    .string()
    .max(255, 'Nome da agência não pode exceder 255 caracteres.')
    .optional()
    .or(z.literal('')),

  agency_type: z.enum(['individual', 'agency', 'firm'], {
    errorMap: () => ({ message: 'Selecione um tipo de agência válido.' }),
  }),

  license_number: z
    .string()
    .max(100, 'Número de licença não pode exceder 100 caracteres.')
    .optional()
    .or(z.literal('')),

  fifa_agent_id: z
    .string()
    .max(100, 'ID FIFA não pode exceder 100 caracteres.')
    .optional()
    .or(z.literal('')),

  country: z
    .string()
    .max(3, 'Use o código ISO 3166-1 alpha-3 (ex: PRT).')
    .optional()
    .or(z.literal('')),

  email: z
    .string()
    .email('Email inválido.')
    .optional()
    .or(z.literal('')),

  phone: z
    .string()
    .max(20, 'Telefone não pode exceder 20 caracteres.')
    .optional()
    .or(z.literal('')),

  website: z
    .string()
    .url('URL inválida.')
    .optional()
    .or(z.literal('')),
})

export type AgentCreateFormData = z.infer<typeof agentCreateSchema>
