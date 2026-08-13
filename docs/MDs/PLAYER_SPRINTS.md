Vou investigar profundamente as duas estruturas para produzir um plano de refatoração sólido.I'll explore the players module thoroughly, reading all relevant files in parallel.Now let me read all the hooks, schemas, and key components in parallel:Tenho toda a informação necessária. Vou agora compilar a resposta completa.Let me explore the players module thoroughly.Tenho agora um quadro completo do módulo. Vou preparar a resposta final.Tenho agora tudo o que preciso. Vou produzir o plano de refatoração completo.---

# Plano de Refatoração — Módulo Player (Frontend)

## Diagnóstico actual

### Gaps críticos identificados

| Categoria | Problema | Impacto |
|-----------|----------|---------|
| **HTTP client inconsistência** | `services/index.ts` usa `apiClient` (axios). Os hooks de contratos, médico, transferências, agentes, compliance, performance e seleção nacional usam `fetch` directo com `localStorage.getItem('token')` | Comportamento diferente em erros, sem interceptors, sem renovação de token |
| **Endpoints inexistentes** | `usePlayerNationalTeamCallUps` chama `/players/{id}/national-team-call-ups/` — esta rota **não existe** no backend (não está em `urls.py`) | 404 garantido em runtime |
| **Lookup inconsistente** | Services usam `<slug>`, mas os hooks de contratos/médico/agentes/training usam `<uuid:player_id>`. O frontend trata tudo como string sem distinção | Chamadas de API erradas |
| **Tipos desactualizados** | `Player` não tem: `global_id`, `profile_photo`, `profile_photo_url`, `age`, `is_minor`, `shirt_number`. `PlayerOnboardingResponse` não cobre todos os passos do `PlayerOnboardingStatus` | Dados em falta, crashes |
| **Onboarding incompleto** | O backend tem 9 passos (`account → identity → personal → football → contact → guardian → documents → club → review`). O frontend só trata 3 (`profile`, `football`, `review`). O `guardian` step (para menores) não existe no frontend | Bloqueio para menores no onboarding |
| **Endpoints em falta** | Backend expõe: career, statistics, football-profile, contact, emergency-contacts, identity-documents, invite, training-history, training-compensation, contracts, agents, medical (tudo). Frontend não tem services/hooks para: `career`, `statistics`, `football-profile`, `contact`, `emergency-contacts`, `identity-documents`, `training-history`, `training-compensation` | Features inacessíveis |
| **Types em falta** | Backend tem modelos: `PlayerContract`, `PlayerMedicalProfile`, `MedicalDocument`, `Agent`, `PlayerAgentRelationship`, `PlayerTrainingHistory`, `NationalTeamCallUp`, `PlayerPerformanceMetric`, `PlayerComplianceRecord`, `PlayerIdentityDocument`, `PlayerContact`, `LegalGuardian`, `PlayerPrivacySettings`, `PlayerOnboardingStatus`, `PlayerFootballProfile`, `PlayerCareer`, `PlayerSeasonStatistics`. Apenas alguns têm types no frontend | TypeScript sem cobertura |
| **Cache keys incompletas** | `playerKeys` não tem keys para: `career`, `statistics`, `footballProfile`, `contact`, `identityDocuments`, `contracts`, `agents`, `medical`, `training`, `compliance`, `performance` | Cache inconsistente entre hooks standalone e React Query |
| **Campos deprecated no frontend** | `PlayerUpdate` ainda inclui `email` e `phone` directamente. Backend marca estes como deprecated em favor de `PlayerContact` | Enviando dados para campos que serão removidos em Set 2026 |
| **Permissões de privacidade** | Backend tem `PlayerPrivacySettings` com 5 visibility levels. Frontend não tem nenhum tipo, schema ou UI para gerir privacidade | A `PlayerPrivacySection` existe mas provavelmente está vazia/incompleta |

---

## Plano de refatoração por fases

### Fase 1 — Fundações (Unificar HTTP client + Types completos)

**Prioridade: Alta. Sem esta fase, as restantes não funcionam correctamente.**

#### 1.1 — Unificar cliente HTTP

Todos os hooks standalone usam `fetch` com token manual. Mover tudo para `apiClient`.

Criar um helper no `apiClient` para endpoints que usam `player_id` (UUID) vs `slug`:

```typescript
// src/lib/api-client.ts  (já existe — apenas adicionar helper)
export const playerIdEndpoint = (playerId: string, path: string) =>
  `/players/${playerId}/${path}`
```

Afecta: `usePlayerContracts`, `usePlayerMedical`, `usePlayerTransfers`, `usePlayerNationalTeam`, `usePlayerPerformance`, `usePlayerCompliance`.

#### 1.2 — Actualizar `API_ROUTES` com todos os endpoints

```typescript
// src/constants/routes.ts — adicionar ao objecto PLAYERS:
PLAYERS: {
  // (existentes mantêm-se)
  CAREER: (slug: string) => `/players/${slug}/career/`,
  STATISTICS: (slug: string) => `/players/${slug}/statistics/`,
  STATISTICS_SEASON: (slug: string, season: string) => `/players/${slug}/statistics/${season}/`,
  FOOTBALL_PROFILE: (slug: string) => `/players/${slug}/football-profile/`,
  CONTACT: (slug: string) => `/players/${slug}/contact/`,
  EMERGENCY_CONTACTS: (slug: string) => `/players/${slug}/emergency-contacts/`,
  IDENTITY_DOCUMENTS: (slug: string) => `/players/${slug}/identity-documents/`,
  IDENTITY_DOCUMENT_DETAIL: (slug: string, docId: string) => `/players/${slug}/identity-documents/${docId}/`,
  IDENTITY_DOCUMENT_VERIFY: (slug: string, docId: string) => `/players/${slug}/identity-documents/${docId}/verify/`,
  // Phase 3 (UUID-based)
  CONTRACTS: (playerId: string) => `/players/${playerId}/contracts/`,
  CONTRACT_DETAIL: (playerId: string, id: string) => `/players/${playerId}/contracts/${id}/`,
  CONTRACT_SIGN: (playerId: string, id: string) => `/players/${playerId}/contracts/${id}/sign/`,
  CONTRACT_RENEW: (playerId: string, id: string) => `/players/${playerId}/contracts/${id}/renew/`,
  CONTRACT_TERMINATE: (playerId: string, id: string) => `/players/${playerId}/contracts/${id}/terminate/`,
  AGENTS: (playerId: string) => `/players/${playerId}/agents/`,
  AGENT_DETAIL: (playerId: string, relId: string) => `/players/${playerId}/agents/${relId}/`,
  AGENTS_LIST: `/players/agents/`,
  AGENT_ENTITY_DETAIL: (agentId: string) => `/players/agents/${agentId}/`,
  TRAINING_HISTORY: (playerId: string) => `/players/${playerId}/training-history/`,
  TRAINING_HISTORY_DETAIL: (playerId: string, id: string) => `/players/${playerId}/training-history/${id}/`,
  TRAINING_COMPENSATION: (playerId: string) => `/players/${playerId}/training-compensation/`,
  // Phase 4 (UUID-based)
  MEDICAL: (playerId: string) => `/players/${playerId}/medical/`,
  MEDICAL_HISTORY: (playerId: string) => `/players/${playerId}/medical/history/`,
  MEDICAL_DOCUMENTS: (playerId: string) => `/players/${playerId}/medical/documents/`,
  MEDICAL_DOCUMENT_DETAIL: (playerId: string, docId: string) => `/players/${playerId}/medical/documents/${docId}/`,
  MEDICAL_DOCUMENT_VERIFY: (playerId: string, docId: string) => `/players/${playerId}/medical/documents/${docId}/verify/`,
  MEDICAL_DOCUMENT_REJECT: (playerId: string, docId: string) => `/players/${playerId}/medical/documents/${docId}/reject/`,
  // Invite
  INVITE: `/players/invite/`,
  INVITE_REDEEM: `/players/invite/redeem/`,
  // NOTE: national-team-call-ups NAO EXISTE no backend actual
  // NATIONAL_TEAM_CALLUPS: (playerId: string) => `/players/${playerId}/national-team-call-ups/`,
}
```

#### 1.3 — Expandir `types/index.ts` com todos os modelos do backend

Adicionar interfaces em falta:

```typescript
// — Player base: campos em falta
interface Player {
  // adicionar:
  id: string          // já existe
  global_id: string   // NOVO — BY-PLY-...
  profile_photo_url: string | null  // NOVO — abstrai profile_photo + avatar
  age: number | null  // NOVO — calculado no backend
  is_minor: boolean   // NOVO
  shirt_number: number | null  // NOVO
  phone: string | null  // mover de PlayerDetail para Player base
}

// — PlayerOnboardingStatus (substituir PlayerOnboardingResponse)
interface PlayerOnboardingStatus {
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
  next_step: OnboardingStep | null
  onboarding_required: boolean    // compat flag
  has_player_profile: boolean
}

type OnboardingStep = 
  | 'account' | 'identity' | 'personal' | 'football' 
  | 'contact' | 'guardian' | 'documents' | 'club' | 'review'
  | null

// — PlayerFootballProfile
interface PlayerFootballProfile {
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

// — PlayerCareer (Fase 2)
interface PlayerCareer {
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

// — PlayerSeasonStatistics
interface PlayerSeasonStatistics {
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

// — PlayerContact
interface PlayerContact {
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

// — EmergencyContact
interface EmergencyContact {
  id: string
  player: string
  name: string
  relationship: string
  phone: string
  email: string | null
  country: string | null
}

// — PlayerIdentityDocument
type IdentityDocumentType = 
  | 'national_id' | 'passport' | 'birth_certificate' 
  | 'residence_permit' | 'other'

type VerificationStatus = 'pending' | 'verified' | 'rejected'

interface PlayerIdentityDocument {
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
}

// — LegalGuardian
type GuardianConsentStatus = 'pending' | 'given' | 'revoked'

interface LegalGuardian {
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

// — PlayerPrivacySettings
type VisibilityLevel = 'public' | 'club' | 'organization' | 'agent' | 'private'

interface PlayerPrivacySettings {
  player: string
  profile_visibility: VisibilityLevel
  contact_visibility: VisibilityLevel
  contract_visibility: VisibilityLevel
  salary_visibility: VisibilityLevel
  medical_visibility: VisibilityLevel
  documents_visibility: VisibilityLevel
  statistics_visibility: VisibilityLevel
}

// — PlayerContract (Fase 3) — substituir o tipo inline de usePlayerContracts
type ContractType = 
  | 'professional' | 'youth' | 'amateur' | 'short_term' 
  | 'trial' | 'loan' | 'extension'

type ContractStatus = 'draft' | 'active' | 'expired' | 'terminated' | 'suspended'

interface PlayerContract {
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
  bonuses: Record<string, unknown> | null
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
}

// — Agent / PlayerAgentRelationship (Fase 3)
type AgentType = 'individual' | 'agency' | 'firm'
type RelationshipStatus = 'active' | 'expired' | 'terminated' | 'suspended'

interface Agent {
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
  is_active: boolean
  verified: boolean
}

interface PlayerAgentRelationship {
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
}

// — PlayerTrainingHistory (Fase 3)
type TrainingCategory = 'amateur' | 'youth' | 'academy' | 'professional'

interface PlayerTrainingHistory {
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
}

interface TrainingCompensationData {
  total_years: number
  clubs: Array<{
    club_id: string | null
    club_name: string
    years: number
    category: TrainingCategory
    country: string
    verified: boolean
    start_date: string
    end_date: string | null
  }>
}

// — PlayerMedicalProfile / MedicalDocument (Fase 4)
type BloodType = 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'O+' | 'O-' | 'unknown'
type MedicalStatus = 'fit' | 'injured' | 'recovering' | 'suspended_medical'
type MedicalDocumentType = 
  | 'medical_certificate' | 'injury_report' | 'scan_result' | 'lab_result' 
  | 'vaccination_record' | 'surgery_report' | 'physical_exam' 
  | 'cardiac_screening' | 'other'

interface PlayerMedicalProfile {
  id: string
  player: string
  blood_type: BloodType
  medical_status: MedicalStatus
  injury_status: string | null
  medical_clearance: boolean
  fitness_status: string | null
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

interface MedicalDocument {
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
}

interface PlayerMedicalHistory {
  profile: PlayerMedicalProfile | null
  documents: MedicalDocument[]
  is_fit_to_play: boolean
  pending_exams: number
}

// — NationalTeamCallUp (Fase 4) — corrigir endpoint quando disponível
// Backend: NationalTeamCallUp existe mas endpoint não está mapeado ainda
interface NationalTeamCallUp {
  id: string
  player: string
  national_team: string
  category: 'senior' | 'u23' | 'u20' | 'u17' | 'u15'
  call_up_date: string
  release_date: string | null
  status: 'called' | 'released' | 'declined' | 'injured' | 'completed'
  caps: number
  goals: number
  assists: number
  notes: string | null
}
```

#### 1.4 — Actualizar schemas Zod

Adicionar schemas para funcionalidades em falta:

```typescript
// schemas/contact.schema.ts — NOVO
export const playerContactSchema = z.object({
  primary_email: z.string().email().optional().or(z.literal('')),
  secondary_email: z.string().email().optional().or(z.literal('')),
  mobile_phone: z.string().max(20).optional().or(z.literal('')),
  secondary_phone: z.string().max(20).optional().or(z.literal('')),
  address: z.string().max(500).optional().or(z.literal('')),
  city: z.string().max(100).optional().or(z.literal('')),
  province: z.string().max(100).optional().or(z.literal('')),
  postal_code: z.string().max(20).optional().or(z.literal('')),
  country: z.string().max(3).optional().or(z.literal('')),
})

// schemas/identity.schema.ts — NOVO
export const playerIdentityDocumentSchema = z.object({
  document_type: z.enum(['national_id', 'passport', 'birth_certificate', 'residence_permit', 'other']),
  document_number: z.string().max(100).optional().or(z.literal('')),
  issuing_country: z.string().max(3).optional().or(z.literal('')),
  issuing_authority: z.string().max(255).optional().or(z.literal('')),
  issue_date: z.string().optional().or(z.literal('')),
  expiry_date: z.string().optional().or(z.literal('')),
  document_front: z.custom<File>().optional(),
  document_back: z.custom<File>().optional(),
})

// schemas/privacy.schema.ts — actualizar playerPrivacySchema para alinhar com backend
const visibilityLevel = z.enum(['public', 'club', 'organization', 'agent', 'private'])
export const playerPrivacySchema = z.object({
  profile_visibility: visibilityLevel,
  contact_visibility: visibilityLevel,
  contract_visibility: visibilityLevel,
  salary_visibility: visibilityLevel,
  medical_visibility: visibilityLevel,
  documents_visibility: visibilityLevel,
  statistics_visibility: visibilityLevel,
})

// schemas/agent.schema.ts — NOVO
export const agentRelationshipSchema = z.object({
  agent: z.string().uuid('Selecione um agente válido.'),
  start_date: z.string().min(1, 'Data de início obrigatória.'),
  end_date: z.string().optional().or(z.literal('')),
  commission_rate: z.coerce.number().min(0).max(100).optional(),
})
```

Actualizar `playerUpdateSchema` para remover `email` e `phone` directos (deprecated):

```typescript
// schemas/player.schema.ts — actualizar playerUpdateSchema
export const playerUpdateSchema = playerCreateSchema
  .omit({ email: true, phone: true })  // deprecated — usar PlayerContact
  .extend({
    status: z.enum(['active', 'retired', 'banned', 'inactive']).optional(),
  })
```

---

### Fase 2 — Services e Query Keys completos

#### 2.1 — Expandir `services/index.ts`

Adicionar todos os endpoints em falta, usando `apiClient` e as novas `API_ROUTES`:

```typescript
// Adicionar ao services/index.ts:

// ─── Career & Statistics ──────────────────────────────────────────────────────
export async function getPlayerCareer(slug: string): Promise<PlayerCareer[]> { ... }
export async function getPlayerStatistics(slug: string, season?: string): Promise<PlayerSeasonStatistics[]> { ... }
export async function getPlayerFootballProfile(slug: string): Promise<PlayerFootballProfile> { ... }
export async function updatePlayerFootballProfile(slug: string, data: Partial<PlayerFootballProfile>): Promise<PlayerFootballProfile> { ... }

// ─── Contact ─────────────────────────────────────────────────────────────────
export async function getPlayerContact(slug: string): Promise<PlayerContact> { ... }
export async function updatePlayerContact(slug: string, data: Partial<PlayerContact>): Promise<PlayerContact> { ... }
export async function listPlayerEmergencyContacts(slug: string): Promise<EmergencyContact[]> { ... }
export async function createPlayerEmergencyContact(slug: string, data: Omit<EmergencyContact, 'id' | 'player'>): Promise<EmergencyContact> { ... }

// ─── Identity ────────────────────────────────────────────────────────────────
export async function listPlayerIdentityDocuments(slug: string): Promise<PlayerIdentityDocument[]> { ... }
export async function createPlayerIdentityDocument(slug: string, data: FormData): Promise<PlayerIdentityDocument> { ... }
export async function updatePlayerIdentityDocument(slug: string, docId: string, data: Partial<PlayerIdentityDocument>): Promise<PlayerIdentityDocument> { ... }
export async function deletePlayerIdentityDocument(slug: string, docId: string): Promise<void> { ... }
export async function verifyPlayerIdentityDocument(slug: string, docId: string): Promise<PlayerIdentityDocument> { ... }

// ─── Contracts (Phase 3 — UUID) ───────────────────────────────────────────────
export async function listPlayerContracts(playerId: string): Promise<PlayerContract[]> { ... }
export async function createPlayerContract(playerId: string, data: PlayerContractCreate): Promise<PlayerContract> { ... }
export async function updatePlayerContract(playerId: string, contractId: string, data: Partial<PlayerContractCreate>): Promise<PlayerContract> { ... }
export async function deletePlayerContract(playerId: string, contractId: string): Promise<void> { ... }
export async function signPlayerContract(playerId: string, contractId: string, data: { signed_by_player?: boolean, signed_by_club?: boolean }): Promise<PlayerContract> { ... }
export async function renewPlayerContract(playerId: string, contractId: string, data: { new_end_date: string }): Promise<PlayerContract> { ... }
export async function terminatePlayerContract(playerId: string, contractId: string, data: { reason: string }): Promise<PlayerContract> { ... }

// ─── Agents (Phase 3 — UUID) ─────────────────────────────────────────────────
export async function listPlayerAgentRelationships(playerId: string): Promise<PlayerAgentRelationship[]> { ... }
export async function createAgentRelationship(playerId: string, data: AgentRelationshipCreate): Promise<PlayerAgentRelationship> { ... }
export async function terminateAgentRelationship(playerId: string, relId: string): Promise<PlayerAgentRelationship> { ... }
export async function listAgents(): Promise<Agent[]> { ... }

// ─── Training History (Phase 3 — UUID) ───────────────────────────────────────
export async function listPlayerTrainingHistory(playerId: string): Promise<PlayerTrainingHistory[]> { ... }
export async function createPlayerTrainingEntry(playerId: string, data: TrainingHistoryCreate): Promise<PlayerTrainingHistory> { ... }
export async function updatePlayerTrainingEntry(playerId: string, entryId: string, data: Partial<TrainingHistoryCreate>): Promise<PlayerTrainingHistory> { ... }
export async function deletePlayerTrainingEntry(playerId: string, entryId: string): Promise<void> { ... }
export async function getPlayerTrainingCompensation(playerId: string): Promise<TrainingCompensationData> { ... }

// ─── Medical (Phase 4 — UUID) ─────────────────────────────────────────────────
export async function getPlayerMedicalProfile(playerId: string): Promise<PlayerMedicalProfile | null> { ... }
export async function updatePlayerMedicalProfile(playerId: string, data: Partial<PlayerMedicalProfile>): Promise<PlayerMedicalProfile> { ... }
export async function getPlayerMedicalHistory(playerId: string): Promise<PlayerMedicalHistory> { ... }
export async function listPlayerMedicalDocuments(playerId: string): Promise<MedicalDocument[]> { ... }
export async function createPlayerMedicalDocument(playerId: string, data: FormData): Promise<MedicalDocument> { ... }
export async function verifyMedicalDocument(playerId: string, docId: string): Promise<MedicalDocument> { ... }
export async function rejectMedicalDocument(playerId: string, docId: string, data: { reason: string }): Promise<MedicalDocument> { ... }
```

#### 2.2 — Expandir `playerKeys` e `usePlayerQueries.ts`

```typescript
export const playerKeys = {
  // (manter existentes)
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (params: PlayerListParams) => [...playerKeys.lists(), params] as const,
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (slug: string) => [...playerKeys.details(), slug] as const,
  search: (q: string) => [...playerKeys.all, 'search', q] as const,
  documents: (slug: string) => [...playerKeys.all, 'documents', slug] as const,
  videos: (slug: string) => [...playerKeys.all, 'videos', slug] as const,
  achievements: (slug: string) => [...playerKeys.all, 'achievements', slug] as const,
  me: () => [...playerKeys.all, 'me'] as const,
  onboardingStatus: () => [...playerKeys.all, 'onboarding-status'] as const,

  // NOVOS:
  career: (slug: string) => [...playerKeys.all, 'career', slug] as const,
  statistics: (slug: string, season?: string) => [...playerKeys.all, 'statistics', slug, season] as const,
  footballProfile: (slug: string) => [...playerKeys.all, 'football-profile', slug] as const,
  contact: (slug: string) => [...playerKeys.all, 'contact', slug] as const,
  emergencyContacts: (slug: string) => [...playerKeys.all, 'emergency-contacts', slug] as const,
  identityDocuments: (slug: string) => [...playerKeys.all, 'identity-documents', slug] as const,
  // Phase 3 (playerId = UUID)
  contracts: (playerId: string) => [...playerKeys.all, 'contracts', playerId] as const,
  agents: (playerId: string) => [...playerKeys.all, 'agents', playerId] as const,
  trainingHistory: (playerId: string) => [...playerKeys.all, 'training-history', playerId] as const,
  trainingCompensation: (playerId: string) => [...playerKeys.all, 'training-compensation', playerId] as const,
  // Phase 4 (playerId = UUID)
  medical: (playerId: string) => [...playerKeys.all, 'medical', playerId] as const,
  medicalDocuments: (playerId: string) => [...playerKeys.all, 'medical-documents', playerId] as const,
}
```

Migrar os hooks standalone (`usePlayerContracts`, `usePlayerMedical`, etc.) para usar `playerKeys` e `useQuery`/`useMutation` do react-query em vez de `fetch` manual.

---

### Fase 3 — Onboarding completo (9 passos)

O backend tem 9 passos. O frontend precisa de cobertura.

#### 3.1 — Actualizar `usePlayerOnboardingState.ts`

```typescript
type OnboardingStep = 
  | 'account' | 'identity' | 'personal' | 'football' 
  | 'contact' | 'guardian' | 'documents' | 'club' | 'review' 
  | null

const ONBOARDING_STEPS_ORDER: OnboardingStep[] = [
  'account', 'identity', 'personal', 'football',
  'contact', 'guardian', 'documents', 'club', 'review'
]

// Para menores: todos os passos
// Para adultos: omitir 'guardian'
```

#### 3.2 — Criar páginas de onboarding em falta

| Passo | Page actual | Acção |
|-------|------------|-------|
| `account` | — | Já feito pelo registo; marcar como completo automático |
| `identity` | **CRIAR** `PlayerOnboardingIdentityPage` | Formulário com `playerIdentityDocumentSchema` |
| `personal` | `PlayerOnboardingProfilePage` | Renomear/ajustar para `personal` |
| `football` | `PlayerOnboardingFootballPage` | Já existe — manter |
| `contact` | **CRIAR** `PlayerOnboardingContactPage` | Formulário com `playerContactSchema` |
| `guardian` | `PlayerGuardianForm` existe mas sem página | **CRIAR** `PlayerOnboardingGuardianPage` (só para `is_minor`) |
| `documents` | — | **CRIAR** `PlayerOnboardingDocumentsPage` (simplificada) |
| `club` | `PlayerClubLinkRequestPage` aprox. | **CRIAR** `PlayerOnboardingClubPage` (pode ser opcional/skip) |
| `review` | `PlayerOnboardingReviewPage` | Actualizar para mostrar todos os passos |

#### 3.3 — Actualizar `PlayerOnboardingLayout`

O progress tracker só mostra 3 passos. Actualizar para reflectir os passos dinâmicos (adulto vs menor).

#### 3.4 — Actualizar o `PlayerOnboardingGuard`

```typescript
// Actualmente: redireciona para 'profile' ou 'football'
// Deve: redirecionar para o step retornado por onboarding_status.next_step
// E mapear cada step para a rota correcta
const STEP_ROUTES: Record<NonNullable<OnboardingStep>, string> = {
  account:   ROUTES.ONBOARDING_PLAYER_PROFILE,    // não há rota separada
  identity:  ROUTES.ONBOARDING_PLAYER_IDENTITY,   // CRIAR
  personal:  ROUTES.ONBOARDING_PLAYER_PROFILE,
  football:  ROUTES.ONBOARDING_PLAYER_FOOTBALL,
  contact:   ROUTES.ONBOARDING_PLAYER_CONTACT,    // CRIAR
  guardian:  ROUTES.ONBOARDING_PLAYER_GUARDIAN,   // CRIAR
  documents: ROUTES.ONBOARDING_PLAYER_DOCUMENTS,  // CRIAR
  club:      ROUTES.ONBOARDING_PLAYER_CLUB,       // CRIAR
  review:    ROUTES.ONBOARDING_PLAYER_REVIEW,
}
```

---

### Fase 4 — Dashboard do jogador: secções completas

Actualizar o `PlayerDashboardPage` e `PlayerDashboardSettingsPage` para expor todas as funcionalidades.

#### 4.1 — Dashboard principal (tabs a adicionar)

| Tab | Secção | Estado actual | Acção |
|-----|--------|---------------|-------|
| Visão Geral | Stats, clube actual | Parcial | Actualizar com `profile_photo_url`, `global_id`, `age` |
| Carreira | `PlayerCareerTimeline` | Existe mas usa dados de `PlayerDetail` | Migrar para `usePlayerCareer(slug)` + `usePlayerStatistics(slug)` |
| Contratos | `PlayerContractSection` | Usa `fetch` directo | Migrar para `usePlayerContracts` com `apiClient` + `playerKeys` |
| Agentes | `PlayerAgentSection` | Usa `fetch` directo | Idem |
| Médico | `PlayerMedicalSection` | Usa `fetch` directo | Idem |
| Transferências | `PlayerTransferSection` | Endpoint `/transfers/` **não existe no backend** | Remover ou substituir por Registrations |
| Documentos | `PlayerDocumentsSection` | Existe | Manter |
| Vídeos | `PlayerVideosSection` | Existe | Manter |
| Conquistas | `PlayerAchievementsSection` | Existe | Manter |
| Privacidade | `PlayerPrivacySection` | Existe mas vazia | Implementar com `playerPrivacySchema` actualizado |

> **Nota:** O endpoint `/players/{id}/transfers/` **não existe** no `urls.py` do backend. O `PlayerTransferSection` e todos os hooks de `usePlayerTransfers` produzirão 404. Esta secção deve ser desactivada ou substituída por `PlayerRegistration` até o backend implementar o endpoint.

#### 4.2 — Settings: separar por contexto

O `PlayerDashboardSettingsPage` faz tudo num único formulário. Separar em tabs:

```
Settings Tabs:
├── Perfil (first_name, last_name, dob, nationality, bio, avatar, is_public)
├── Contacto (PlayerContact: email, phone, address — via /contact/ endpoint)
├── Desporto (PlayerFootballProfile: position, foot, height, weight)
├── Privacidade (PlayerPrivacySettings: visibility levels)
├── Identidade (PlayerIdentityDocument list)
├── Documentos (PlayerDocument list)
├── Vídeos
└── Conquistas
```

---

### Fase 5 — Limpeza e consistência

#### 5.1 — Eliminar código duplicado

| Problema | Ficheiro | Acção |
|----------|----------|-------|
| `PlayerContract` type definido inline em `usePlayerContracts.ts` | `hooks/usePlayerContracts.ts` | Remover — usar o tipo do `types/index.ts` |
| `usePlayerSearch` exportado com dois nomes | `hooks/index.ts` | Manter aliases mas documentar claramente |
| `playerOnboardingStatus` vs `PlayerOnboardingResponse` — dois tipos para o mesmo objecto | `types/index.ts` | Unificar em `PlayerOnboardingStatus` |

#### 5.2 — Corrigir `usePlayerNationalTeam`

O endpoint `/players/{id}/national-team-call-ups/` **não existe** no backend. Duas opções:

1. **Opção A (recomendada):** Desactivar o hook até o endpoint ser criado no backend. Adicionar TODO no `urls.py` do backend.
2. **Opção B:** Criar o endpoint no backend em `urls.py` usando a view e o modelo `NationalTeamCallUp` que já existem (o modelo existe em `models/national_team.py`).

#### 5.3 — Remover `email`/`phone` de `PlayerUpdate`

Backend marca `email` e `phone` directos como deprecated. Janela até setembro 2026.

```typescript
// Criar tipo de transição:
export interface PlayerUpdateLegacy extends PlayerUpdate {
  /** @deprecated Use PlayerContact instead. Will be removed September 2026 */
  email?: string
  /** @deprecated Use PlayerContact instead. Will be removed September 2026 */
  phone?: string
}
```

---

## Ficheiros a criar

```
src/modules/players/
├── services/
│   └── index.ts          (actualizar — adicionar ~30 funções)
├── types/
│   └── index.ts          (actualizar — adicionar ~20 interfaces)
├── schemas/
│   ├── contact.schema.ts  (CRIAR)
│   ├── identity.schema.ts (CRIAR)
│   ├── agent.schema.ts    (CRIAR)
│   └── player.schema.ts   (actualizar — deprecar email/phone, actualizar privacy)
├── hooks/
│   ├── usePlayerQueries.ts   (actualizar — expandir playerKeys + hooks)
│   ├── usePlayerMutations.ts (actualizar — migrar hooks standalone)
│   ├── usePlayerContracts.ts (refactor — usar apiClient + playerKeys)
│   ├── usePlayerMedical.ts   (refactor — usar apiClient + playerKeys)
│   ├── usePlayerTransfers.ts (desactivar — endpoint não existe)
│   ├── usePlayerCareerStats.ts (refactor — usar playerKeys)
│   └── usePlayerOnboardingState.ts (actualizar — 9 passos)
├── pages/
│   ├── onboarding/
│   │   ├── PlayerOnboardingIdentityPage.tsx  (CRIAR)
│   │   ├── PlayerOnboardingContactPage.tsx   (CRIAR)
│   │   ├── PlayerOnboardingGuardianPage.tsx  (CRIAR)
│   │   ├── PlayerOnboardingDocumentsPage.tsx (CRIAR)
│   │   └── PlayerOnboardingClubPage.tsx      (CRIAR)
│   └── PlayerDashboardSettingsPage.tsx (actualizar — tabs separados)
└── constants/
    └── index.ts (actualizar — adicionar ONBOARDING_STEPS, ONBOARDING_STEP_ROUTES)
```

---

## Ordem de execução recomendada

```
Sprint 1 (Fase 1) — 2 sessões
  └── 1.1 Unificar HTTP client nos hooks standalone
  └── 1.2 Expandir API_ROUTES
  └── 1.3 Expandir types/index.ts
  └── 1.4 Novos schemas (contact, identity, agent, privacy)

Sprint 2 (Fase 2) — 2 sessões
  └── 2.1 Expandir services/index.ts
  └── 2.2 Expandir playerKeys + query hooks
  └── 2.3 Migrar mutations standalone para react-query

Sprint 3 (Fase 3) — 3 sessões
  └── 3.1 Actualizar usePlayerOnboardingState
  └── 3.2 Criar 5 páginas de onboarding em falta
  └── 3.3 Actualizar PlayerOnboardingLayout + Guard + rotas

Sprint 4 (Fase 4) — 2 sessões
  └── 4.1 Actualizar Dashboard tabs (contratos, agentes, médico)
  └── 4.2 Separar Settings em tabs por contexto
  └── Desactivar PlayerTransferSection

Sprint 5 (Fase 5) — 1 sessão
  └── Eliminar duplicados, deprecar email/phone, fixar national-team
```

---

## Decisões que requerem confirmação tua

1. **NationalTeamCallUp:** Criar o endpoint no backend (`urls.py` + view) ou desactivar o hook no frontend por agora?
2. **Transfers:** O endpoint `/players/{id}/transfers/` não existe no backend. Remover a secção do dashboard ou criar o endpoint no backend?
3. **Onboarding para menores:** O passo `guardian` deve ser obrigatório mesmo para jogadores registados por terceiros (ex: staff de clube), ou apenas para o próprio atleta?
4. **Email/Phone deprecated:** Manter o form de Settings a enviar estes campos (compat) ou mudar já para o endpoint `/contact/`?