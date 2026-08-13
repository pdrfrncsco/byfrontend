// Players module — TypeScript types
// Sprint 1 refactor: aligned with backend models (all phases)

// ─── Primitive Union Types ────────────────────────────────────────────────────

export type PlayerPosition =
  | 'gk'
  | 'cb' | 'lb' | 'rb' | 'lwb' | 'rwb'
  | 'cm' | 'cdm' | 'cam' | 'lm' | 'rm' | 'lw' | 'rw'
  | 'st' | 'cf'
  | 'multiple'

export type PlayerStatus = 'active' | 'retired' | 'banned' | 'inactive'

export type PlayerFoot = 'left' | 'right' | 'both'

export type PlayerLinkStatus =
  | 'none'
  | 'pending_approval'
  | 'active'
  | 'rejected'
  | 'terminated'

export type VerificationStatus = 'pending' | 'verified' | 'rejected'

export type VisibilityLevel = 'public' | 'club' | 'organization' | 'agent' | 'private'

// ─── Onboarding Step Types ────────────────────────────────────────────────────

export type OnboardingStep =
  | 'account'
  | 'identity'
  | 'personal'
  | 'football'
  | 'contact'
  | 'guardian'
  | 'documents'
  | 'club'
  | 'review'
  | null

/** Ordered list of all 9 onboarding steps */
export const ONBOARDING_STEPS_ORDER: NonNullable<OnboardingStep>[] = [
  'account', 'identity', 'personal', 'football',
  'contact', 'guardian', 'documents', 'club', 'review',
]

// ─── Player Base Types ────────────────────────────────────────────────────────

export interface PlayerCurrentClub {
  id: string
  name: string
  slug: string
  registered_since: string
  shirt_number: number | null
}

export interface Player {
  id: string
  /** Global unique identifier: BY-PLY-... */
  global_id: string
  slug: string
  first_name: string
  last_name: string
  full_name: string
  /** @deprecated Use PlayerContact.primary_email instead. Removed September 2026. */
  email: string | null
  date_of_birth: string | null
  age: number | null
  is_minor: boolean
  nationality: string | null
  height_cm: number | null
  weight_kg: number | null
  foot: PlayerFoot | null
  primary_position: PlayerPosition
  position_label: string
  shirt_number: number | null
  bio: string | null
  /** Resolved URL: prefers profile_photo asset, fallback to avatar URL */
  profile_photo_url: string | null
  /** @deprecated Use profile_photo_url instead */
  avatar: string | null
  is_public: boolean
  status: PlayerStatus
  status_label: string
  total_matches: number
  total_goals: number
  total_assists: number
  created_at: string
  current_club?: PlayerCurrentClub | null
}

export interface PlayerDetail extends Player {
  /** @deprecated Use PlayerContact.mobile_phone instead. Removed September 2026. */
  phone: string | null
  updated_at: string
  current_club: PlayerCurrentClub | null
  career_history: PlayerCareerEntry[]
  videos: PlayerVideo[]
  documents: PlayerDocument[]
  achievements: PlayerAchievement[]
}

// ─── Career Entry (legacy / serialized from PlayerRegistration) ───────────────

export interface PlayerCareerEntry {
  club: string
  club_slug: string
  joined: string
  left: string | null
  status: string
  matches: number
  goals: number
  assists: number
}

// ─── Phase 2: Career & Statistics ─────────────────────────────────────────────

export interface PlayerCareer {
  id: string
  player: string
  club: string
  club_name: string
  season: string
  competition: string | null
  competition_name: string | null
  position: PlayerPosition | null
  appearances: number
  starts: number
  minutes_played: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
}

export interface PlayerSeasonStatistics {
  id: string
  player: string
  season: string
  club: string
  club_name: string
  competition: string | null
  competition_name: string | null
  appearances: number
  starts: number
  minutes: number
  goals: number
  assists: number
  shots: number
  shots_on_target: number
  yellow_cards: number
  red_cards: number
}

export interface PlayerFootballProfile {
  player: string
  primary_position: PlayerPosition
  shirt_number: number | null
  height_cm: number | null
  weight_kg: number | null
  foot: PlayerFoot | null
  total_matches: number
  total_goals: number
  total_assists: number
}

// ─── Phase 1: Contact & Identity ──────────────────────────────────────────────

export interface PlayerContact {
  player: string
  primary_email: string | null
  secondary_email: string | null
  mobile_phone: string | null
  secondary_phone: string | null
  country_code: string | null
  address: string | null
  city: string | null
  province: string | null
  postal_code: string | null
  country: string | null
}

export interface PlayerContactUpdate {
  primary_email?: string
  secondary_email?: string
  mobile_phone?: string
  secondary_phone?: string
  country_code?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  country?: string
}

export interface EmergencyContact {
  id: string
  player: string
  name: string
  relationship: string
  phone: string
  email: string | null
  country: string | null
}

export interface EmergencyContactCreate {
  name: string
  relationship: string
  phone: string
  email?: string
  country?: string
}

export type IdentityDocumentType =
  | 'national_id'
  | 'passport'
  | 'birth_certificate'
  | 'residence_permit'
  | 'other'

export interface PlayerIdentityDocument {
  id: string
  player: string
  document_type: IdentityDocumentType
  document_number: string | null
  issuing_country: string | null
  issuing_country_label: string | null
  issuing_authority: string | null
  issue_date: string | null
  expiry_date: string | null
  document_front_url: string | null
  document_back_url: string | null
  verification_status: VerificationStatus
  verified_by: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface PlayerIdentityDocumentCreate {
  document_type: IdentityDocumentType
  document_number?: string
  issuing_country?: string
  issuing_authority?: string
  issue_date?: string
  expiry_date?: string
  document_front?: File
  document_back?: File
  /** Alternative: provide existing MediaAsset UUID */
  asset?: string
}

export interface PlayerIdentityDocumentUpdate {
  document_type?: IdentityDocumentType
  document_number?: string
  issuing_country?: string
  issuing_authority?: string
  issue_date?: string
  expiry_date?: string
}

// ─── Phase 1: Guardian ────────────────────────────────────────────────────────

export type GuardianConsentStatus = 'pending' | 'given' | 'revoked'

export interface LegalGuardian {
  id: string
  player: string
  name: string
  relationship: string
  document_number: string | null
  phone: string
  email: string | null
  address: string | null
  consent_status: GuardianConsentStatus
  consent_document_url: string | null
  consent_given_at: string | null
}

// ─── Phase 1: Privacy ─────────────────────────────────────────────────────────

export interface PlayerPrivacySettings {
  player: string
  profile_visibility: VisibilityLevel
  contact_visibility: VisibilityLevel
  contract_visibility: VisibilityLevel
  salary_visibility: VisibilityLevel
  medical_visibility: VisibilityLevel
  documents_visibility: VisibilityLevel
  statistics_visibility: VisibilityLevel
}

export interface PlayerPrivacySettingsUpdate {
  profile_visibility?: VisibilityLevel
  contact_visibility?: VisibilityLevel
  contract_visibility?: VisibilityLevel
  salary_visibility?: VisibilityLevel
  medical_visibility?: VisibilityLevel
  documents_visibility?: VisibilityLevel
  statistics_visibility?: VisibilityLevel
}

// ─── Phase 1: Onboarding Status ───────────────────────────────────────────────

export interface PlayerOnboardingStatus {
  player: PlayerDetail | null
  current_step: OnboardingStep
  account_complete: boolean
  identity_complete: boolean
  personal_complete: boolean
  football_complete: boolean
  contact_complete: boolean
  guardian_complete: boolean
  documents_complete: boolean
  club_complete: boolean
  review_complete: boolean
  completed_at: string | null
  is_complete: boolean
  progress_percentage: number
  next_step: OnboardingStep
  /** Compat flag: true when onboarding is not complete */
  onboarding_required: boolean
  has_player_profile: boolean
}

/**
 * @deprecated Use PlayerOnboardingStatus instead.
 * Kept for backwards compatibility with existing hooks.
 */
export type PlayerOnboardingResponse = PlayerOnboardingStatus & {
  has_basic_info?: boolean
  has_football_info?: boolean
}

// ─── Phase 1: Invite ──────────────────────────────────────────────────────────

export interface PlayerInvite {
  token: string
  email: string
  first_name: string
  last_name: string
  club: string | null
  club_name: string | null
  expires_at: string
  redeemed: boolean
  redeemed_at: string | null
}

// ─── Player List & CRUD Types ─────────────────────────────────────────────────

export interface PlayerRegistration {
  id: string
  player: string
  player_name: string
  player_slug: string
  shirt_number: number | null
  position: PlayerPosition
  position_label: string
  joined_date: string
  left_date: string | null
  status: string
  status_label: string
  matches_played: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
}

export interface PlayerListParams {
  page?: number
  page_size?: number
  search?: string
  position?: PlayerPosition
  nationality?: string
  without_club?: boolean
  status?: PlayerStatus
}

export interface PlayerListResponse {
  count: number
  next: string | null
  previous: string | null
  results: Player[]
}

export interface PlayerCreate {
  first_name: string
  last_name: string
  date_of_birth?: string
  nationality?: string
  primary_position?: PlayerPosition
  height_cm?: number
  weight_kg?: number
  foot?: PlayerFoot
  bio?: string
  avatar?: string
  is_public?: boolean
}

export interface PlayerUpdate {
  first_name?: string
  last_name?: string
  date_of_birth?: string
  nationality?: string
  primary_position?: PlayerPosition
  height_cm?: number
  weight_kg?: number
  foot?: PlayerFoot
  bio?: string
  avatar?: string
  is_public?: boolean
  status?: PlayerStatus
}

export interface PlayerRegisterPayload {
  club_id: string
  joined_date: string
  shirt_number?: number
  competition_id?: string
}

export type PlayerRegistrationRequestStatus = 'pending' | 'approved' | 'rejected'

export interface PlayerRegistrationRequest {
  id: string
  player: string
  player_name: string
  player_slug: string
  player_position_label?: string
  club: string
  club_name: string
  club_slug: string
  tenant: string
  competition?: string | null
  competition_name?: string | null
  submitted_by?: string | null
  submitted_by_email?: string | null
  joined_date: string
  shirt_number?: number | null
  status: PlayerRegistrationRequestStatus | string
  status_label?: string
  review_notes?: string
  reviewed_by?: string | null
  reviewed_by_email?: string | null
  reviewed_at?: string | null
  registration?: string | null
  created_at?: string
  updated_at?: string
}

export interface PlayerRegistrationRequestCreate {
  club_id: string
  joined_date: string
  shirt_number?: number
  competition_id?: string
}

export interface PlayerRegistrationRequestReview {
  approve: boolean
  review_notes?: string
}

// ─── Player Document Types ────────────────────────────────────────────────────

export type DocumentCategory =
  | 'contract'
  | 'passport'
  | 'medical'
  | 'license'
  | 'certificate'
  | 'transfer'
  | 'insurance'
  | 'other'

export type DocumentStatus = 'pending' | 'verified' | 'rejected' | 'expired'

export interface PlayerDocument {
  id: string
  title: string
  category: DocumentCategory
  category_label: string
  description: string | null
  asset_url: string | null
  status: DocumentStatus
  status_label: string
  valid_from: string | null
  valid_until: string | null
  is_valid: boolean
  club: string | null
  club_name: string | null
  is_private: boolean
  uploaded_by: string | null
  uploaded_by_name: string | null
  verified_by: string | null
  verified_by_name: string | null
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface PlayerDocumentCreate {
  title: string
  category: DocumentCategory
  description?: string
  document?: File
  asset?: string
  valid_from?: string
  valid_until?: string
  club?: string
  is_private?: boolean
}

export interface PlayerDocumentUpdate {
  title?: string
  category?: DocumentCategory
  description?: string
  valid_from?: string
  valid_until?: string
  is_private?: boolean
}

// ─── Player Video Types ───────────────────────────────────────────────────────

export type VideoType = 'highlights' | 'skills' | 'interview' | 'match_clip' | 'training' | 'other'

export type VideoStatus = 'draft' | 'published' | 'archived'

export interface PlayerVideoMatchInfo {
  id: string
  home_club: string
  away_club: string
  date: string
  competition: string | null
}

export interface PlayerVideo {
  id: string
  title: string
  description: string | null
  video_type: VideoType
  video_type_label: string
  url: string | null
  thumbnail_url: string | null
  thumbnail: string | null
  video_url: string | null
  media_asset: string | null
  duration_seconds: number | null
  status: VideoStatus
  status_label: string
  is_featured: boolean
  order: number
  match: string | null
  match_info: PlayerVideoMatchInfo | null
  created_at: string
  updated_at: string
}

export interface PlayerVideoCreate {
  title: string
  description?: string
  video_type: VideoType
  video_url?: string
  thumbnail_url?: string
  video?: File
  media_asset?: string
  match?: string
  is_featured?: boolean
  order?: number
}

export interface PlayerVideoUpdate {
  title?: string
  description?: string
  video_type?: VideoType
  video_url?: string
  thumbnail_url?: string
  media_asset?: string
  match?: string
  is_featured?: boolean
  order?: number
  status?: VideoStatus
}

// ─── Player Achievement Types ─────────────────────────────────────────────────

export type AchievementType =
  | 'league_title'
  | 'cup_title'
  | 'super_cup'
  | 'tournament'
  | 'international_club'
  | 'top_scorer'
  | 'best_player'
  | 'mvp'
  | 'best_goalkeeper'
  | 'best_young_player'
  | 'golden_boot'
  | 'golden_ball'
  | 'milestone_100_goals'
  | 'milestone_500_appearances'
  | 'milestone_100_caps'
  | 'national_team_cap'
  | 'world_cup'
  | 'continental_cup'
  | 'olympics'
  | 'other'

export type AchievementLevel = 'club' | 'national' | 'continental' | 'international' | 'world'

export interface PlayerAchievement {
  id: string
  title: string
  achievement_type: AchievementType
  achievement_type_label: string
  level: AchievementLevel
  level_label: string
  description: string | null
  date_achieved: string | null
  year: number | null
  season: string | null
  competition: string | null
  competition_name: string | null
  club: string | null
  club_name: string | null
  trophy_image: string | null
  certificate_url: string | null
  stats_snapshot: Record<string, unknown> | null
  is_verified: boolean
  created_at: string
  updated_at: string
}

export interface PlayerAchievementCreate {
  title: string
  achievement_type: AchievementType
  level: AchievementLevel
  description?: string
  date_achieved?: string
  season?: string
  competition?: string
  club?: string
  trophy_image?: File
  trophy_image_url?: string
  certificate?: File
  certificate_url?: string
  stats_snapshot?: Record<string, unknown>
}

export interface PlayerAchievementUpdate {
  title?: string
  achievement_type?: AchievementType
  level?: AchievementLevel
  description?: string
  date_achieved?: string
  season?: string
  competition?: string
  club?: string
  trophy_image?: string
  certificate_url?: string
  stats_snapshot?: Record<string, unknown>
}

// ─── Phase 3: Contracts ───────────────────────────────────────────────────────

export type ContractType =
  | 'professional'
  | 'youth'
  | 'amateur'
  | 'short_term'
  | 'trial'
  | 'loan'
  | 'extension'

export type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'suspended'

export interface PlayerContract {
  id: string
  player: string
  player_name: string
  club: string
  club_name: string
  contract_type: ContractType
  status: ContractStatus
  start_date: string
  end_date: string
  signed_date: string | null
  salary: number | null
  currency: string
  bonuses: Record<string, number> | null
  release_clause: number | null
  has_image_rights: boolean
  option_year: boolean
  termination_clause: string | null
  signed_by_player: boolean
  signed_by_club: boolean
  is_active: boolean
  is_fully_signed: boolean
  verified_at: string | null
  created_at: string
  updated_at: string
}

export interface PlayerContractCreate {
  club: string
  contract_type: ContractType
  status?: ContractStatus
  start_date: string
  end_date: string
  salary?: number
  currency?: string
  bonuses?: Record<string, number>
  release_clause?: number
  has_image_rights?: boolean
  option_year?: boolean
  termination_clause?: string
}

export interface PlayerContractUpdate extends Partial<PlayerContractCreate> {
  signed_by_player?: boolean
  signed_by_club?: boolean
}

export interface PlayerContractSign {
  signed_by_player?: boolean
  signed_by_club?: boolean
  signature_date?: string
}

export interface PlayerContractRenew {
  new_end_date: string
  renewal_bonuses?: Record<string, number>
}

export interface PlayerContractTerminate {
  reason: string
}

// ─── Phase 3: Agents ──────────────────────────────────────────────────────────

export type AgentType = 'individual' | 'agency' | 'firm'
export type RelationshipStatus = 'active' | 'expired' | 'terminated' | 'suspended'

export interface Agent {
  id: string
  name: string
  agency_name: string | null
  agency_type: AgentType
  license_number: string | null
  fifa_agent_id: string | null
  country: string | null
  email: string | null
  phone: string | null
  website: string | null
  city: string | null
  is_active: boolean
  verified: boolean
  verified_at: string | null
}

export interface PlayerAgentRelationship {
  id: string
  player: string
  player_name: string
  agent: string
  agent_name: string
  start_date: string
  end_date: string | null
  status: RelationshipStatus
  commission_rate: number | null
  is_active: boolean
  notes: string | null
  created_at: string
}

export interface PlayerAgentRelationshipCreate {
  agent: string
  start_date: string
  end_date?: string
  commission_rate?: number
  notes?: string
}

// ─── Phase 3: Training History ────────────────────────────────────────────────

export type TrainingCategory = 'amateur' | 'youth' | 'academy' | 'professional'

export interface PlayerTrainingHistory {
  id: string
  player: string
  player_name: string
  club: string | null
  club_name: string | null
  academy_name: string | null
  country: string
  training_category: TrainingCategory
  training_category_label: string
  start_date: string
  end_date: string | null
  duration_years: number
  verified: boolean
  verified_at: string | null
  notes: string | null
  created_at: string
}

export interface PlayerTrainingHistoryCreate {
  /** Either club or academy_name is required */
  club?: string
  academy_name?: string
  country: string
  training_category: TrainingCategory
  start_date: string
  end_date?: string
  notes?: string
}

export interface TrainingCompensationClub {
  club_id: string | null
  club_name: string
  years: number
  category: TrainingCategory
  country: string
  verified: boolean
  start_date: string
  end_date: string | null
}

export interface TrainingCompensationData {
  total_years: number
  clubs: TrainingCompensationClub[]
}

// ─── Phase 4: Medical ─────────────────────────────────────────────────────────

export type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'
export type MedicalStatus = 'fit' | 'injured' | 'recovering' | 'suspended_medical'
export type MedicalDocumentType =
  | 'medical_certificate'
  | 'injury_report'
  | 'scan_result'
  | 'lab_result'
  | 'vaccination_record'
  | 'surgery_report'
  | 'physical_exam'
  | 'cardiac_screening'
  | 'other'

export interface PlayerMedicalProfile {
  id: string
  player: string
  blood_type: BloodType
  medical_status: MedicalStatus
  injury_status: string | null
  medical_clearance: boolean
  fitness_status: string | null
  /** Confidential — only visible to medical staff */
  medical_notes: string | null
  last_medical_exam: string | null
  next_medical_exam: string | null
  allergies: string | null
  current_medications: string | null
  medical_conditions: string | null
  is_fit_to_play: boolean
  needs_medical_exam: boolean
  updated_at: string
}

export interface PlayerMedicalProfileUpdate {
  blood_type?: BloodType
  medical_status?: MedicalStatus
  injury_status?: string
  medical_clearance?: boolean
  fitness_status?: string
  medical_notes?: string
  last_medical_exam?: string
  next_medical_exam?: string
  allergies?: string
  current_medications?: string
  medical_conditions?: string
}

export interface MedicalDocument {
  id: string
  player: string
  document_type: MedicalDocumentType
  title: string
  description: string | null
  file_url: string | null
  issued_at: string
  expires_at: string | null
  verification_status: VerificationStatus
  verified_by: string | null
  verified_at: string | null
  is_confidential: boolean
  is_valid: boolean
  is_expired: boolean
  created_at: string
  updated_at: string
}

export interface MedicalDocumentCreate {
  document_type: MedicalDocumentType
  title: string
  description?: string
  issued_at: string
  expires_at?: string
  is_confidential?: boolean
  file: File
}

export interface MedicalDocumentReject {
  reason: string
}

export interface PlayerMedicalHistory {
  profile: PlayerMedicalProfile | null
  documents: MedicalDocument[]
  is_fit_to_play: boolean
  pending_exams: number
}

// ─── Phase 4: National Team ───────────────────────────────────────────────────
// NOTE: endpoint /players/{id}/national-team-call-ups/ not yet in backend urls.py
// Types kept for future use when backend endpoint is implemented.

export type NationalTeamCategory = 'senior' | 'u23' | 'u20' | 'u17' | 'u15'
export type NationalTeamCallUpStatus = 'called' | 'released' | 'declined' | 'injured' | 'completed'

export interface NationalTeamCallUp {
  id: string
  player: string
  national_team: string
  category: NationalTeamCategory
  call_up_date: string
  release_date: string | null
  status: NationalTeamCallUpStatus
  caps: number
  goals: number
  assists: number
  notes: string | null
  created_at: string
  updated_at: string
}

// ─── Phase 4: Performance ─────────────────────────────────────────────────────

export interface PlayerPerformanceMetric {
  id: string
  player: string
  recorded_at: string
  metric_type: string
  value: number
  unit: string
  source: string
  device_id: string | null
  training_session: string | null
  position_during_metric: string | null
  notes: string | null
  created_at: string
  updated_at: string
}

export interface PlayerPerformanceSummary {
  speed_metrics: PlayerPerformanceMetricGroup
  distance_metrics: PlayerPerformanceMetricGroup
  physical_metrics: PlayerPerformanceMetricGroup
  biometric_metrics: PlayerPerformanceMetricGroup
  workload_metrics: PlayerPerformanceMetricGroup
}

export interface PlayerPerformanceMetricGroup {
  category: string
  metrics: PlayerPerformanceMetric[]
  average: number
  max: number
  min: number
}

// ─── Phase 4: Compliance ──────────────────────────────────────────────────────

export type CompliancePriority = 'low' | 'medium' | 'high' | 'critical'
export type ComplianceStatus =
  | 'compliant'
  | 'non_compliant'
  | 'pending_review'
  | 'exemption_granted'
  | 'requires_approval'

export interface PlayerComplianceRecord {
  id: string
  player: string
  transfer: string | null
  rule_type: string
  rule_reference: string | null
  priority: CompliancePriority
  status: ComplianceStatus
  description: string
  notes: string | null
  resolution_notes: string | null
  exemption_reason: string | null
  deadline: string | null
  reviewed_at: string | null
  reviewed_by: string | null
  created_at: string
  updated_at: string
}

export interface PlayerComplianceSummary {
  total: number
  compliant: number
  non_compliant: number
  pending_review: number
  overdue: number
  critical_issues: number
}
