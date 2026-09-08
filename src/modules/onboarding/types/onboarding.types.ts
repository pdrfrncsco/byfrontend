export enum OnboardingStatus {
  NOT_STARTED = 'NOT_STARTED',
  IN_PROGRESS = 'IN_PROGRESS',
  PENDING_APPROVAL = 'PENDING_APPROVAL',
  COMPLETED = 'COMPLETED',
}

export interface OrganizationPayload {
  name: string;
  type: string;
  location: string;
  slug?: string;
}

export interface BrandingPayload {
  primaryColor: string;
  secondaryColor: string;
  logoUrl?: string;
}

export interface CompetitionPayload {
  name?: string;
  competition_type: 'league' | 'tournament' | 'cup';
  modality: 'futebol_11' | 'futebol_7' | 'futsal' | 'praia';
  season: string;
}

export interface OrganizationOnboardingData {
  organization: OrganizationPayload;
  branding: BrandingPayload;
  competition: CompetitionPayload;
}
