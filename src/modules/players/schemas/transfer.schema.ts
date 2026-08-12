import { z } from 'zod'

/**
 * Transfer request validation schema
 * Validações para solicitações de transferência
 */
export const transferRequestSchema = z.object({
  to_club: z
    .string({
      required_error: 'Clube destino é obrigatório',
      invalid_type_error: 'Clube destino deve ser uma string',
    })
    .min(1, 'Selecione um clube destino')
    .describe('ID do clube destino'),

  transfer_type: z
    .enum(['permanent', 'loan', 'free', 'youth'], {
      required_error: 'Tipo de transferência é obrigatório',
      invalid_enum_value: 'Tipo de transferência inválido',
    })
    .describe('Tipo de transferência'),

  effective_date: z
    .string({
      invalid_type_error: 'Data efetiva deve ser uma data válida',
    })
    .datetime()
    .optional()
    .nullable()
    .describe('Data em que a transferência entra em vigor'),

  transfer_fee: z
    .number({
      invalid_type_error: 'Valor da transferência deve ser um número',
    })
    .positive('Valor da transferência deve ser positivo')
    .optional()
    .nullable()
    .describe('Valor da transferência em EUR'),

  currency: z
    .string()
    .max(3, 'Moeda deve ter no máximo 3 caracteres')
    .optional()
    .default('EUR')
    .describe('Código ISO da moeda (EUR, USD, GBP, etc.)'),

  loan_duration_months: z
    .number({
      invalid_type_error: 'Duração deve ser um número',
    })
    .int('Duração deve ser um número inteiro')
    .positive('Duração deve ser positiva')
    .max(60, 'Duração máxima é 60 meses')
    .optional()
    .nullable()
    .describe('Duração do empréstimo em meses (apenas para empréstimos)'),

  notes: z
    .string()
    .max(1000, 'Observações não podem exceder 1000 caracteres')
    .optional()
    .nullable()
    .describe('Observações adicionais sobre a transferência'),
})
  .refine(
    (data) => {
      // Loan transfers must have loan_duration_months
      if (data.transfer_type === 'loan' && !data.loan_duration_months) {
        return false
      }
      return true
    },
    {
      message: 'Empréstimos devem ter duração especificada',
      path: ['loan_duration_months'],
    }
  )
  .refine(
    (data) => {
      // Effective date should be in the future
      if (data.effective_date) {
        const effectiveDate = new Date(data.effective_date)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (effectiveDate < today) {
          return false
        }
      }
      return true
    },
    {
      message: 'Data efetiva deve ser no futuro',
      path: ['effective_date'],
    }
  )

export type TransferRequest = z.infer<typeof transferRequestSchema>

/**
 * Transfer update schema
 * Validações para atualizações de transferência
 */
export const transferUpdateSchema = transferRequestSchema
  .partial()
  .extend({
    status: z
      .enum(['requested', 'pending', 'approved', 'rejected', 'completed'], {
        invalid_enum_value: 'Status de transferência inválido',
      })
      .optional()
      .describe('Novo status da transferência'),
  })

export type TransferUpdate = z.infer<typeof transferUpdateSchema>

/**
 * Club search/selection schema
 * Validações para busca e seleção de clubes
 */
export const clubSelectionSchema = z.object({
  id: z.string().min(1, 'ID do clube é obrigatório'),
  name: z.string().min(1, 'Nome do clube é obrigatório'),
  slug: z.string().optional(),
  country: z.string().optional(),
  league: z.string().optional(),
})

export type ClubSelection = z.infer<typeof clubSelectionSchema>

/**
 * Transfer timeline event schema
 * Validações para eventos na linha do tempo
 */
export const transferTimelineEventSchema = z.object({
  date: z.string().datetime(),
  status: z.enum(['requested', 'pending', 'approved', 'rejected', 'completed']),
  notes: z.string().optional(),
})

export type TransferTimelineEvent = z.infer<typeof transferTimelineEventSchema>
