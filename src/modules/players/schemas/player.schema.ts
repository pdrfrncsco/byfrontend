import { z } from "zod";

// ─── Enums ────────────────────────────────────────────────────────────────────

export const playerStatusEnum = z.enum([
  "active",
  "free_agent",
  "injured",
  "on_loan",
  "retired",
]);

export const playerFootEnum = z.enum(["right", "left", "both"]);

export const profileVisibilityEnum = z.enum([
  "public",
  "clubs_only",
  "private",
]);

export const footballPositionEnum = z.enum([
  "GK",
  "CB",
  "LB",
  "RB",
  "LWB",
  "RWB",
  "CDM",
  "CM",
  "CAM",
  "LM",
  "RM",
  "LW",
  "RW",
  "SS",
  "ST",
  "CF",
]);

export const achievementTypeEnum = z.enum([
  'league_title',
  'cup_title',
  'super_cup',
  'tournament',
  'international_club',
  'top_scorer',
  'best_player',
  'mvp',
  'best_goalkeeper',
  'best_young_player',
  'golden_boot',
  'golden_ball',
  'milestone_100_goals',
  'milestone_500_appearances',
  'milestone_100_caps',
  'national_team_cap',
  'world_cup',
  'continental_cup',
  'olympics',
  'other',
]);

export const achievementLevelEnum = z.enum(['club', 'national', 'continental', 'international', 'world']);

export const documentTypeEnum = z.enum([
  "passport",
  "id_card",
  "medical",
  "contract",
  "transfer_certificate",
  "other",
]);

export const videoTypeEnum = z.enum([
  "highlight_reel",
  "match_clip",
  "training",
  "interview",
]);

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Optional string that converts empty string → undefined */
const optionalString = z
  .string()
  .optional()
  .transform((v) => (v === "" ? undefined : v));

/** Optional URL with empty-string passthrough */
const optionalUrl = z
  .string()
  .url("Must be a valid URL")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

/** Optional email with empty-string passthrough */
const optionalEmail = z
  .string()
  .email("Must be a valid email")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

/** ISO date string (YYYY-MM-DD) */
const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date (YYYY-MM-DD)")
  .optional()
  .or(z.literal(""))
  .transform((v) => (v === "" ? undefined : v));

// ─── Section schemas ──────────────────────────────────────────────────────────

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
  primaryPosition: footballPositionEnum.optional(),
  secondaryPosition: footballPositionEnum.optional(),
  preferredFoot: playerFootEnum.optional(),
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

export const playerSocialSchema = z
  .object({
    instagram: optionalString,
    twitterX: optionalString,
    linkedin: optionalString,
    website: optionalUrl,
  })
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
  status: playerStatusEnum.optional(),
  contractExpiry: isoDate,
  availableForTransfer: z.boolean().optional(),
});

export const playerPrivacySchema = z.object({
  profileVisibility: profileVisibilityEnum.default("clubs_only"),
  showContactToClubs: z.boolean().default(true),
  showAgentToPublic: z.boolean().default(false),
});

// ─── Full settings schema (all sections merged) ───────────────────────────────

export const playerSettingsSchema = playerIdentitySchema
  .merge(playerContactSchema)
  .merge(playerFootballSchema)
  .merge(playerAgentSchema)
  .merge(playerSocialSchema)
  .merge(playerAvailabilitySchema)
  .merge(z.object({ privacy: playerPrivacySchema }));

export type PlayerSettingsFormData = z.infer<typeof playerSettingsSchema>;

// ─── Career entry ─────────────────────────────────────────────────────────────

export const careerEntrySchema = z
  .object({
    clubName: z.string().min(1, "Club name is required").max(100),
    clubId: optionalString,
    startDate: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, "Must be a valid date")
      .min(1, "Start date is required"),
    endDate: isoDate,
    position: footballPositionEnum.optional(),
    appearances: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : Number(v))),
    goals: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : Number(v))),
    assists: z.coerce
      .number()
      .int()
      .min(0)
      .optional()
      .or(z.literal(""))
      .transform((v) => (v === "" ? undefined : Number(v))),
    isLoan: z.boolean().optional(),
    notes: optionalString,
  })
  .refine(
    (data) => {
      if (data.endDate && data.startDate > data.endDate) {
        return false;
      }
      return true;
    },
    { message: "End date must be after start date", path: ["endDate"] }
  );

export type CareerEntryFormData = z.infer<typeof careerEntrySchema>;

// ─── Achievement ──────────────────────────────────────────────────────────────

export const achievementSchema = z.object({
  type: achievementTypeEnum,
  title: z.string().min(1, "Title is required").max(100),
  season: optionalString,
  clubName: optionalString,
  description: z
    .string()
    .max(300, "Max 300 characters")
    .optional()
    .transform((v) => (v === "" ? undefined : v)),
});

export type AchievementFormData = z.infer<typeof achievementSchema>;

// ─── Onboarding schemas (step-by-step) ────────────────────────────────────────

/** Step 1 — profile basics */
export const onboardingProfileSchema = playerIdentitySchema.pick({
  firstName: true,
  lastName: true,
  dateOfBirth: true,
  nationality: true,
});

/** Step 2 — football profile */
export const onboardingFootballSchema = playerFootballSchema
  .pick({
    primaryPosition: true,
    preferredFoot: true,
  })
  .required({ primaryPosition: true });

export type OnboardingProfileData = z.infer<typeof onboardingProfileSchema>;
export type OnboardingFootballData = z.infer<typeof onboardingFootballSchema>;

// ─── Compatibility exports (legacy names used across the codebase) ─────────────
export const playerAchievementSchema = z.object({
  title: z.string().min(1).max(100),
  achievement_type: achievementTypeEnum, // legacy key
  level: achievementLevelEnum.optional(),
  description: z.string().max(300).optional().transform((v) => (v === "" ? undefined : v)),
  date_achieved: isoDate,
  season: optionalString,
  competition: optionalString,
  club: optionalString,
  trophy_image: z.any().optional(),
  trophy_image_url: optionalUrl.optional(),
  certificate: z.any().optional(),
  certificate_url: optionalUrl.optional(),
});
export type PlayerAchievementFormData = z.infer<typeof playerAchievementSchema>;

// Minimal document schema expected by existing components
export const playerDocumentSchema = z.object({
  title: z.string().min(1).max(200),
  category: documentTypeEnum.optional(),
  description: z.string().max(500).optional().transform((v) => (v === "" ? undefined : v)),
  valid_from: isoDate,
  valid_until: isoDate,
  club: optionalString,
  is_private: z.boolean().optional(),
  document: z.any().optional(),
});
export type PlayerDocumentFormData = z.infer<typeof playerDocumentSchema>;

// Minimal video schema (legacy field names expected by components)
export const playerVideoSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().max(1000).optional().transform((v) => (v === "" ? undefined : v)),
  video_type: z.string().optional(),
  video_url: optionalUrl.optional(),
  thumbnail_url: optionalUrl.optional(),
  video: z.any().optional(),
  match: optionalString.optional(),
  is_featured: z.boolean().optional(),
  order: z.coerce.number().optional().or(z.literal('')).transform((v) => (v === '' ? undefined : Number(v))),
});
export type PlayerVideoFormData = z.infer<typeof playerVideoSchema>;

// Player register / create / update compatibility schemas (map to relevant sections)
export const playerRegisterSchema = playerContactSchema.merge(playerIdentitySchema);
export type PlayerRegisterFormData = z.infer<typeof playerRegisterSchema>;

export const playerCreateSchema = playerRegisterSchema;
export type PlayerCreateFormData = PlayerRegisterFormData;

export const playerUpdateSchema = playerSettingsSchema.partial();
export type PlayerUpdateFormData = Partial<PlayerSettingsFormData>;

export const playerLinkRequestSchema = z.object({
  club_id: z.string(),
  message: optionalString.optional(),
});
export type PlayerLinkRequestFormData = z.infer<typeof playerLinkRequestSchema>;

