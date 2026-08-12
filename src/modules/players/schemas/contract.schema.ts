import { z } from 'zod'

/**
 * Contract Form Validation Schemas
 * Portuguese error messages for BOLAYETU platform
 */

export const contractTypeSchema = z.enum([
  'professional',
  'youth',
  'amateur',
  'short_term',
  'trial',
  'loan',
  'extension',
])

export const contractStatusSchema = z.enum([
  'draft',
  'active',
  'expired',
  'terminated',
  'suspended',
])

export const currencySchema = z.string().min(3).max(3).toUpperCase()

/**
 * Create/Edit Contract Form
 */
export const playerContractFormSchema = z
  .object({
    club: z.string().min(1, 'Clube é obrigatório'),
    contract_type: contractTypeSchema,
    status: contractStatusSchema.optional(),
    start_date: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Data de início inválida'
    ),
    end_date: z.string().refine(
      (date) => !isNaN(Date.parse(date)),
      'Data de fim inválida'
    ),
    salary: z
      .number()
      .positive('Salário deve ser positivo')
      .optional()
      .nullable(),
    currency: currencySchema.default('USD'),
    bonuses: z
      .record(z.number().positive('Bónus deve ser positivo'))
      .optional(),
    release_clause: z
      .number()
      .positive('Cláusula de rescisão deve ser positiva')
      .optional()
      .nullable(),
    has_image_rights: z.boolean().default(false),
    option_year: z.boolean().default(false),
    termination_clause: z.string().optional().nullable(),
  })
  .refine(
    (data) => new Date(data.start_date) < new Date(data.end_date),
    {
      message: 'Data de fim deve ser após data de início',
      path: ['end_date'],
    }
  )

export type PlayerContractFormData = z.infer<typeof playerContractFormSchema>

/**
 * Contract Signature Form
 */
export const contractSignatureFormSchema = z.object({
  contract_id: z.string().min(1, 'ID do contrato obrigatório'),
  signed_by_player: z.boolean().optional(),
  signed_by_club: z.boolean().optional(),
  signature_date: z
    .string()
    .refine(
      (date) => !isNaN(Date.parse(date)),
      'Data de assinatura inválida'
    )
    .optional(),
})

export type ContractSignatureFormData = z.infer<typeof contractSignatureFormSchema>

/**
 * Contract Filter Schema
 */
export const contractFilterSchema = z.object({
  status: z.array(contractStatusSchema).optional(),
  type: z.array(contractTypeSchema).optional(),
  club: z.string().optional(),
  signed: z.enum(['all', 'signed', 'unsigned']).optional(),
  expiring_soon: z.boolean().optional(),
})

export type ContractFilterData = z.infer<typeof contractFilterSchema>

/**
 * Bonus Structure Schema
 */
export const bonusStructureSchema = z.record(
  z.string().min(1, 'Tipo de bónus obrigatório'),
  z.number().positive('Valor de bónus deve ser positivo')
)

export type BonusStructure = z.infer<typeof bonusStructureSchema>

/**
 * Validate contract form data
 */
export function validateContractForm(data: any): {
  valid: boolean
  errors: Record<string, string>
  data?: PlayerContractFormData
} {
  try {
    const validatedData = playerContractFormSchema.parse(data)
    return { valid: true, errors: {}, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { valid: false, errors }
    }
    return { valid: false, errors: { form: 'Erro ao validar formulário' } }
  }
}

/**
 * Validate contract signature
 */
export function validateContractSignature(data: any): {
  valid: boolean
  errors: Record<string, string>
  data?: ContractSignatureFormData
} {
  try {
    const validatedData = contractSignatureFormSchema.parse(data)
    return { valid: true, errors: {}, data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors: Record<string, string> = {}
      error.errors.forEach((err) => {
        const path = err.path.join('.')
        errors[path] = err.message
      })
      return { valid: false, errors }
    }
    return { valid: false, errors: { form: 'Erro ao validar assinatura' } }
  }
}
