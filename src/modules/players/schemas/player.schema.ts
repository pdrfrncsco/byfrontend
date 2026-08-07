import { z } from 'zod'

// ─── Player Form Schema ───────────────────────────────────────────────────────

export const playerCreateSchema = z.object({
  first_name: z
    .string()
    .min(2, 'O nome deve ter pelo menos 2 caracteres.')
    .max(255, 'O nome não pode exceder 255 caracteres.'),
  last_name: z
    .string()
    .min(2, 'O apelido deve ter pelo menos 2 caracteres.')
    .max(255, 'O apelido não pode exceder 255 caracteres.'),
  date_of_birth: z.string().optional().or(z.literal('')),
  nationality: z.string().max(100, 'A nacionalidade não pode exceder 100 caracteres.').optional().or(z.literal('')),
  primary_position: z.enum(
    ['gk', 'cb', 'lb', 'rb', 'lwb', 'rwb', 'cm', 'cdm', 'cam', 'lm', 'rm', 'lw', 'rw', 'st', 'cf', 'multiple'],
    { errorMap: () => ({ message: 'Selecione uma posição válida.' }) }
  ).optional(),
  email: z.string().email('Email inválido.').optional().or(z.literal('')),
  phone: z.string().max(20, 'O telefone não pode exceder 20 caracteres.').optional().or(z.literal('')),
  height_cm: z.union([z.coerce.number().int().min(100).max(250), z.literal('')]).optional(),
  weight_kg: z.union([z.coerce.number().int().min(30).max(200), z.literal('')]).optional(),
  foot: z.enum(['left', 'right', 'both'], { errorMap: () => ({ message: 'Selecione um pé preferido.' }) }).optional(),
  bio: z.string().max(2000, 'A biografia não pode exceder 2000 caracteres.').optional().or(z.literal('')),
  avatar: z.string().url('URL inválida.').optional().or(z.literal('')),
  is_public: z.boolean().optional(),
})

export type PlayerCreateFormData = z.infer<typeof playerCreateSchema>

export const playerUpdateSchema = playerCreateSchema.extend({
  status: z.enum(['active', 'retired', 'banned', 'inactive'], {
    errorMap: () => ({ message: 'Selecione um estado válido.' }),
  }).optional(),
})

export type PlayerUpdateFormData = z.infer<typeof playerUpdateSchema>

// ─── Player Registration Schema ───────────────────────────────────────────────

export const playerRegisterSchema = z.object({
  club_id: z.string().min(1, 'Selecione um clube.'),
  joined_date: z.string().min(1, 'A data de entrada é obrigatória.'),
  shirt_number: z.union([z.coerce.number().int().min(1).max(99), z.literal('')]).optional(),
  competition_id: z.string().optional().or(z.literal('')),
})

export type PlayerRegisterFormData = z.infer<typeof playerRegisterSchema>

export const playerLinkRequestSchema = z.object({
  club_id: z.string().min(1, 'Selecione um clube.'),
  joined_date: z.string().min(1, 'A data de entrada é obrigatória.'),
  shirt_number: z.union([z.coerce.number().int().min(1).max(99), z.literal('')]).optional(),
  competition_id: z.string().optional().or(z.literal('')),
})

export type PlayerLinkRequestFormData = z.infer<typeof playerLinkRequestSchema>

// ─── Player Document Schema ───────────────────────────────────────────────────

export const playerDocumentSchema = z.object({
  title: z
    .string()
    .min(2, 'O título deve ter pelo menos 2 caracteres.')
    .max(255, 'O título não pode exceder 255 caracteres.'),
  category: z.enum(
    ['contract', 'passport', 'medical', 'license', 'certificate', 'transfer', 'insurance', 'other'],
    { errorMap: () => ({ message: 'Selecione uma categoria válida.' }) }
  ),
  description: z.string().max(1000, 'A descrição não pode exceder 1000 caracteres.').optional().or(z.literal('')),
  valid_from: z.string().optional().or(z.literal('')),
  valid_until: z.string().optional().or(z.literal('')),
  club: z.string().optional().or(z.literal('')),
  is_private: z.boolean(),
  document: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, 'Selecione um ficheiro válido.')
    .optional(),
}).refine((data) => data.document instanceof File, {
  message: 'O documento é obrigatório.',
  path: ['document'],
})

export type PlayerDocumentFormData = z.infer<typeof playerDocumentSchema>

// ─── Player Video Schema ──────────────────────────────────────────────────────

export const playerVideoSchema = z.object({
  title: z
    .string()
    .min(2, 'O título deve ter pelo menos 2 caracteres.')
    .max(255, 'O título não pode exceder 255 caracteres.'),
  description: z.string().max(1000, 'A descrição não pode exceder 1000 caracteres.').optional().or(z.literal('')),
  video_type: z.enum(['highlights', 'skills', 'interview', 'match_clip', 'training', 'other'], {
    errorMap: () => ({ message: 'Selecione um tipo de vídeo válido.' }),
  }),
  video_url: z.string().url('URL do vídeo inválida.').optional().or(z.literal('')),
  thumbnail_url: z.string().url('URL da miniatura inválida.').optional().or(z.literal('')),
  video: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, 'Selecione um ficheiro válido.')
    .optional(),
  media_asset: z.string().optional().or(z.literal('')),
  match: z.string().optional().or(z.literal('')),
  is_featured: z.boolean(),
  order: z.union([z.coerce.number().int().min(0), z.literal('')]).optional(),
}).refine((data) => data.video_url || data.video instanceof File, {
  message: 'Indique uma URL do vídeo ou carregue um ficheiro.',
  path: ['video'],
})

export type PlayerVideoFormData = z.infer<typeof playerVideoSchema>

// ─── Player Achievement Schema ────────────────────────────────────────────────

export const playerAchievementSchema = z.object({
  title: z
    .string()
    .min(2, 'O título deve ter pelo menos 2 caracteres.')
    .max(255, 'O título não pode exceder 255 caracteres.'),
  achievement_type: z.enum(
    [
      'league_title', 'cup_title', 'super_cup', 'tournament', 'international_club',
      'top_scorer', 'best_player', 'mvp', 'best_goalkeeper', 'best_young_player',
      'golden_boot', 'golden_ball',
      'milestone_100_goals', 'milestone_500_appearances', 'milestone_100_caps',
      'national_team_cap', 'world_cup', 'continental_cup', 'olympics', 'other'
    ],
    { errorMap: () => ({ message: 'Selecione um tipo de conquista válido.' }) }
  ),
  level: z.enum(['club', 'national', 'continental', 'international', 'world'], {
    errorMap: () => ({ message: 'Selecione um nível válido.' }),
  }),
  description: z.string().max(1000, 'A descrição não pode exceder 1000 caracteres.').optional().or(z.literal('')),
  date_achieved: z.string().optional().or(z.literal('')),
  season: z.string().max(20, 'A época não pode exceder 20 caracteres.').optional().or(z.literal('')),
  competition: z.string().optional().or(z.literal('')),
  club: z.string().optional().or(z.literal('')),
  trophy_image: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, 'Selecione uma imagem válida.')
    .optional(),
  trophy_image_url: z.string().url('URL da imagem inválida.').optional().or(z.literal('')),
  certificate: z
    .custom<File | undefined>((value) => value === undefined || value instanceof File, 'Selecione um ficheiro válido.')
    .optional(),
  certificate_url: z.string().url('URL do certificado inválida.').optional().or(z.literal('')),
}).superRefine((data, ctx) => {
  if (data.trophy_image instanceof File && data.trophy_image_url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Indique uma URL ou carregue uma imagem do troféu, não ambos.',
      path: ['trophy_image'],
    })
  }
  if (data.certificate instanceof File && data.certificate_url) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Indique uma URL ou carregue um certificado, não ambos.',
      path: ['certificate'],
    })
  }
})

export type PlayerAchievementFormData = z.infer<typeof playerAchievementSchema>

// ─── Section Schemas (Merged from reference files) ────────────────────────────

const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

const optionalUrl = z
  .string()
  .url("Must be a valid URL")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

const optionalEmail = z
  .string()
  .email("Must be a valid email")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

export const playerIdentitySchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  preferredName: optionalString,
  dateOfBirth: isoDate,
  nationality: optionalString,
  countryOfBirth: optionalString,
  height: z.coerce
    .number()
    .min(140, "Min 140 cm")
    .max(230, "Max 230 cm")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : Number(v) || undefined)),
  weight: z.coerce
    .number()
    .min(40, "Min 40 kg")
    .max(130, "Max 130 kg")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : Number(v) || undefined)),
});

export const playerContactSchema = z.object({
  email: optionalEmail,
  phone: optionalString,
  emergencyContactName: optionalString,
  emergencyContactPhone: optionalString,
});

export const playerFootballSchema = z.object({
  primaryPosition: z.string().optional(),
  secondaryPosition: z.string().optional(),
  preferredFoot: z.enum(["right", "left", "both", ""]).optional(),
  squadNumber: z.coerce
    .number()
    .int()
    .min(1, "Min 1")
    .max(99, "Max 99")
    .optional()
    .or(z.literal(""))
    .transform((v) => (v === "" ? undefined : Number(v) || undefined)),
  bio: z
    .string()
    .max(500, "Bio must be 500 characters or fewer")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export const playerAgentSchema = z.object({
  agentName: optionalString,
  agencyName: optionalString,
  agentEmail: optionalEmail,
  agentPhone: optionalString,
});

const playerSocialBase = z.object({
  instagram: optionalString,
  twitterX: optionalString,
  linkedin: optionalString,
  website: optionalUrl,
});

export const playerSocialSchema = playerSocialBase
  .refine(
    (data) => {
      if (data.instagram && data.instagram.startsWith("@")) {
        return false;
      }
      return true;
    },
    {
      message: "Enter your username without the @ symbol",
      path: ["instagram"],
    }
  )
  .refine(
    (data) => {
      if (data.twitterX && data.twitterX.startsWith("@")) {
        return false;
      }
      return true;
    },
    {
      message: "Enter your username without the @ symbol",
      path: ["twitterX"],
    }
  );

export const playerAvailabilitySchema = z.object({
  status: z.enum(["active", "free_agent", "injured", "on_loan", "retired"]).optional(),
  contractExpiry: isoDate,
  availableForTransfer: z.boolean().optional(),
});

export const playerPrivacySchema = z.object({
  profileVisibility: z.enum(["public", "clubs_only", "private"]).default("clubs_only"),
  showContactToClubs: z.boolean().default(true),
  showAgentToPublic: z.boolean().default(false),
});

export const playerSettingsSchema = playerIdentitySchema
  .merge(playerContactSchema)
  .merge(playerFootballSchema)
  .merge(playerAgentSchema)
  .merge(playerSocialBase)
  .merge(playerAvailabilitySchema)
  .merge(z.object({ privacy: playerPrivacySchema }));

export type PlayerSettingsFormData = z.infer<typeof playerSettingsSchema>;

