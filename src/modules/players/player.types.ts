// ─── Player status ────────────────────────────────────────────────────────────

export type PlayerStatus =
  | "active"
  | "free_agent"
  | "injured"
  | "on_loan"
  | "retired";

export type PlayerFoot = "right" | "left" | "both";

export type ProfileVisibility = "public" | "clubs_only" | "private";

export type FootballPosition =
  | "GK"
  | "CB"
  | "LB"
  | "RB"
  | "LWB"
  | "RWB"
  | "CDM"
  | "CM"
  | "CAM"
  | "LM"
  | "RM"
  | "LW"
  | "RW"
  | "SS"
  | "ST"
  | "CF";

// ─── Sub-types ────────────────────────────────────────────────────────────────

export interface PlayerIdentity {
  firstName: string;
  lastName: string;
  /** Publicly displayed name (e.g. "Ronaldo" vs "Cristiano Ronaldo dos Santos") */
  preferredName?: string;
  dateOfBirth?: string; // ISO date string
  nationality?: string;
  countryOfBirth?: string;
  /** Height in centimetres */
  height?: number;
  /** Weight in kilograms */
  weight?: number;
  avatarUrl?: string;
}

export interface PlayerContact {
  email?: string;
  phone?: string;
  emergencyContactName?: string;
  emergencyContactPhone?: string;
}

export interface PlayerFootballProfile {
  primaryPosition?: FootballPosition;
  secondaryPosition?: FootballPosition;
  preferredFoot?: PlayerFoot;
  squadNumber?: number;
  /** Free-text bio shown on public profile, max 500 chars */
  bio?: string;
}

export interface PlayerAgent {
  agentName?: string;
  agencyName?: string;
  agentEmail?: string;
  agentPhone?: string;
}

export interface PlayerSocial {
  instagram?: string;
  twitterX?: string;
  linkedin?: string;
  website?: string;
}

export interface PlayerAvailability {
  status?: PlayerStatus;
  /** ISO date string */
  contractExpiry?: string;
  availableForTransfer?: boolean;
}

export interface PlayerPrivacy {
  profileVisibility: ProfileVisibility;
  showContactToClubs: boolean;
  showAgentToPublic: boolean;
}

// ─── Career history ───────────────────────────────────────────────────────────

export interface PlayerCareerEntry {
  id: string;
  clubId?: string;
  clubName: string;
  clubLogoUrl?: string;
  /** ISO date string */
  startDate: string;
  /** ISO date string — undefined means current */
  endDate?: string;
  position?: FootballPosition;
  appearances?: number;
  goals?: number;
  assists?: number;
  isLoan?: boolean;
  notes?: string;
}

// ─── Achievements ─────────────────────────────────────────────────────────────

export type AchievementType =
  | "league_title"
  | "cup_title"
  | "individual_award"
  | "international_cap"
  | "promotion"
  | "other";

export interface PlayerAchievement {
  id: string;
  type: AchievementType;
  title: string;
  season?: string;
  clubId?: string;
  clubName?: string;
  description?: string;
}

// ─── Documents ───────────────────────────────────────────────────────────────

export type DocumentType =
  | "passport"
  | "id_card"
  | "medical"
  | "contract"
  | "transfer_certificate"
  | "other";

export interface PlayerDocument {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  uploadedAt: string;
  expiresAt?: string;
  isVerified?: boolean;
}

// ─── Videos ──────────────────────────────────────────────────────────────────

export type VideoType = "highlight_reel" | "match_clip" | "training" | "interview";

export interface PlayerVideo {
  id: string;
  type: VideoType;
  title: string;
  url: string;
  thumbnailUrl?: string;
  duration?: number; // seconds
  uploadedAt: string;
  season?: string;
}

// ─── Registration request ─────────────────────────────────────────────────────

export type RegistrationRequestStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled";

export interface PlayerRegistrationRequest {
  id: string;
  playerId: string;
  clubId: string;
  clubName: string;
  status: RegistrationRequestStatus;
  requestedAt: string;
  respondedAt?: string;
  notes?: string;
}

// ─── Link status ──────────────────────────────────────────────────────────────

export type PlayerLinkStatus = "linked" | "pending" | "none" | "rejected";

// ─── Profile completion ───────────────────────────────────────────────────────

export interface PlayerProfileCompletion {
  overall: number; // 0–100
  sections: {
    identity: number;
    contact: number;
    football: number;
    agent: number;
    social: number;
    availability: number;
    privacy: number;
  };
}

// ─── Full player entity ───────────────────────────────────────────────────────

export interface Player
  extends PlayerIdentity,
    PlayerContact,
    PlayerFootballProfile,
    PlayerAgent,
    PlayerSocial,
    PlayerAvailability {
  id: string;
  userId: string;
  organizationId?: string;

  privacy: PlayerPrivacy;
  careerHistory: PlayerCareerEntry[];
  achievements: PlayerAchievement[];
  documents: PlayerDocument[];
  videos: PlayerVideo[];

  linkStatus: PlayerLinkStatus;
  currentClubId?: string;
  currentClubName?: string;

  profileCompletion: PlayerProfileCompletion;

  createdAt: string;
  updatedAt: string;
}

// ─── API payloads ─────────────────────────────────────────────────────────────

export type UpdatePlayerIdentityPayload = Partial<PlayerIdentity>;
export type UpdatePlayerContactPayload = Partial<PlayerContact>;
export type UpdatePlayerFootballPayload = Partial<PlayerFootballProfile>;
export type UpdatePlayerAgentPayload = Partial<PlayerAgent>;
export type UpdatePlayerSocialPayload = Partial<PlayerSocial>;
export type UpdatePlayerAvailabilityPayload = Partial<PlayerAvailability>;
export type UpdatePlayerPrivacyPayload = Partial<PlayerPrivacy>;

/** Single payload for bulk-updating multiple sections at once */
export type UpdatePlayerProfilePayload = Partial<
  PlayerIdentity &
    PlayerContact &
    PlayerFootballProfile &
    PlayerAgent &
    PlayerSocial &
    PlayerAvailability & { privacy: Partial<PlayerPrivacy> }
>;

export type CreateCareerEntryPayload = Omit<PlayerCareerEntry, "id">;
export type UpdateCareerEntryPayload = Partial<Omit<PlayerCareerEntry, "id">>;

export type CreateAchievementPayload = Omit<PlayerAchievement, "id">;

// ─── List / query params ──────────────────────────────────────────────────────

export interface PlayerListParams {
  page?: number;
  pageSize?: number;
  search?: string;
  position?: FootballPosition;
  status?: PlayerStatus;
  clubId?: string;
  organizationId?: string;
  availableForTransfer?: boolean;
}

export interface PlayerListResponse {
  data: Player[];
  total: number;
  page: number;
  pageSize: number;
}
