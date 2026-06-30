import { z } from 'zod'

/* ──────────────────────────────────────────────
 * Login Schema
 * ────────────────────────────────────────────── */
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório.')
    .email('Introduza um email válido.'),
  password: z
    .string()
    .min(1, 'A palavra-passe é obrigatória.'),
})

export type LoginFormData = z.infer<typeof loginSchema>

/* ──────────────────────────────────────────────
 * Register Schema
 * ────────────────────────────────────────────── */
export const registerSchema = z
  .object({
    first_name: z
      .string()
      .min(1, 'O nome é obrigatório.')
      .max(50, 'O nome não pode exceder 50 caracteres.'),
    last_name: z
      .string()
      .min(1, 'O apelido é obrigatório.')
      .max(50, 'O apelido não pode exceder 50 caracteres.'),
    email: z
      .string()
      .min(1, 'O email é obrigatório.')
      .email('Introduza um email válido.'),
    phone: z
      .string()
      .optional()
      .refine(
        (val) => !val || /^\+?[\d\s()-]{6,20}$/.test(val),
        'Introduza um número de telefone válido.',
      ),
    password: z
      .string()
      .min(8, 'A palavra-passe deve ter no mínimo 8 caracteres.')
      .regex(/[A-Z]/, 'A palavra-passe deve conter pelo menos uma letra maiúscula.')
      .regex(/[0-9]/, 'A palavra-passe deve conter pelo menos um dígito.')
      .regex(/[^A-Za-z0-9]/, 'A palavra-passe deve conter pelo menos um carácter especial.'),
    password_confirm: z
      .string()
      .min(1, 'A confirmação da palavra-passe é obrigatória.'),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'As palavras-passe não coincidem.',
    path: ['password_confirm'],
  })

export type RegisterFormData = z.infer<typeof registerSchema>

export const registerOrganizationSchema = z
  .object({
    first_name: z.string().min(1, 'O nome é obrigatório.').max(50),
    last_name: z.string().min(1, 'O apelido é obrigatório.').max(50),
    email: z.string().min(1, 'O email é obrigatório.').email('Introduza um email válido.'),
    phone: z.string().optional().refine(
      (val) => !val || /^\+?[\d\s()-]{6,20}$/.test(val),
      'Introduza um número de telefone válido.',
    ),
    password: z
      .string()
      .min(8, 'A palavra-passe deve ter no mínimo 8 caracteres.')
      .regex(/[A-Z]/, 'A palavra-passe deve conter pelo menos uma letra maiúscula.')
      .regex(/[0-9]/, 'A palavra-passe deve conter pelo menos um dígito.')
      .regex(/[^A-Za-z0-9]/, 'A palavra-passe deve conter pelo menos um carácter especial.'),
    password_confirm: z.string().min(1, 'A confirmação da palavra-passe é obrigatória.'),
    organization_name: z
      .string()
      .min(2, 'O nome da organização é obrigatório.')
      .max(255, 'O nome não pode exceder 255 caracteres.'),
    organization_type: z.enum([
      'federation',
      'association',
      'league',
      'organizer',
      'academy',
    ]),
    country: z.string().min(1, 'O país é obrigatório.'),
    city: z.string().optional(),
  })
  .refine((data) => data.password === data.password_confirm, {
    message: 'As palavras-passe não coincidem.',
    path: ['password_confirm'],
  })

export type RegisterOrganizationFormData = z.infer<typeof registerOrganizationSchema>

/* ──────────────────────────────────────────────
 * Forgot Password Schema
 * ────────────────────────────────────────────── */
export const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, 'O email é obrigatório.')
    .email('Introduza um email válido.'),
})

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

/* ──────────────────────────────────────────────
 * Reset Password Schema
 * ────────────────────────────────────────────── */
export const resetPasswordSchema = z
  .object({
    token: z.string().min(1, 'Token inválido.'),
    new_password: z
      .string()
      .min(8, 'A palavra-passe deve ter no mínimo 8 caracteres.')
      .regex(/[A-Z]/, 'A palavra-passe deve conter pelo menos uma letra maiúscula.')
      .regex(/[0-9]/, 'A palavra-passe deve conter pelo menos um dígito.')
      .regex(/[^A-Za-z0-9]/, 'A palavra-passe deve conter pelo menos um carácter especial.'),
    new_password_confirm: z
      .string()
      .min(1, 'A confirmação da palavra-passe é obrigatória.'),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: 'As palavras-passe não coincidem.',
    path: ['new_password_confirm'],
  })

export type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>

/* ──────────────────────────────────────────────
 * Profile Update Schema
 * ────────────────────────────────────────────── */
export const profileUpdateSchema = z.object({
  first_name: z
    .string()
    .min(1, 'O nome é obrigatório.')
    .max(50, 'O nome não pode exceder 50 caracteres.'),
  last_name: z
    .string()
    .min(1, 'O apelido é obrigatório.')
    .max(50, 'O apelido não pode exceder 50 caracteres.'),
  phone: z
    .string()
    .nullable()
    .refine(
      (val) => !val || /^\+?[\d\s()-]{6,20}$/.test(val),
      'Introduza um número de telefone válido.',
    ),
  language: z.string().min(1, 'O idioma é obrigatório.'),
  timezone: z.string().optional(),
})

export type ProfileUpdateFormData = z.infer<typeof profileUpdateSchema>

/* ──────────────────────────────────────────────
 * Change Password Schema
 * ────────────────────────────────────────────── */
export const changePasswordSchema = z
  .object({
    old_password: z
      .string()
      .min(1, 'A palavra-passe atual é obrigatória.'),
    new_password: z
      .string()
      .min(8, 'A palavra-passe deve ter no mínimo 8 caracteres.')
      .regex(/[A-Z]/, 'A palavra-passe deve conter pelo menos uma letra maiúscula.')
      .regex(/[0-9]/, 'A palavra-passe deve conter pelo menos um dígito.')
      .regex(/[^A-Za-z0-9]/, 'A palavra-passe deve conter pelo menos um carácter especial.'),
    new_password_confirm: z
      .string()
      .min(1, 'A confirmação da palavra-passe é obrigatória.'),
  })
  .refine((data) => data.new_password === data.new_password_confirm, {
    message: 'As novas palavras-passe não coincidem.',
    path: ['new_password_confirm'],
  })

export type ChangePasswordFormData = z.infer<typeof changePasswordSchema>
