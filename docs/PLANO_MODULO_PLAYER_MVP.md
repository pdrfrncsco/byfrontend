# Plano de Melhorias — Módulo Player (MVP Faseado)

> **Análise:** Estado do repositório vs. Arquitetura_do_Modulo_PLAYER.md  
> **Data:** Agosto 2026  
> **Objetivo:** Completar o MVP funcional do Global Player em fases essenciais

---

## 1. Diagnóstico: Estado Atual vs. Arquitetura Desejada

### 1.1 O que existe atualmente no repositório

| Área | Ficheiros existentes | Estado |
|---|---|---|
| **Tipos** | `players/types/index.ts` | ⚠️ Incompleto |
| **Schemas** | `players/schemas/player.schema.ts`, `schemas/index.ts` | ⚠️ Parcial |
| **Hooks** | `usePlayerQueries.ts`, `usePlayerMutations.ts`, `useCurrentPlayer.ts`, `usePlayerOnboardingState.ts`, `usePlayerRegistrationRequests.ts` | ⚠️ Parcial |
| **Services** | `players/services/index.ts` | ⚠️ Stub |
| **Constants** | `players/constants/index.ts` | ⚠️ Mínimo |
| **Components** | `PlayerCard`, `PlayerSkeleton`, `PlayerEmptyState`, `PlayerProfileLayout`, `PlayerCareerTimeline`, `PlayerAvatarUpload`, `PlayerAchievementsSection/Tab`, `PlayerVideosSection/Tab`, `PlayerDocumentsSection/Tab` | ⚠️ Parcial |
| **Pages** | `PlayerListPage`, `PlayerDetailPage`, `PlayerCreatePage`, `PlayerDashboardPage`, `PlayerDashboardSettingsPage`, `PlayerSettingsPage`, `PlayerOnboarding*`, `ClubPlayerRegistrationRequestsPage`, `ClubPlayerRegisterPage`, `PlayerClubLinkRequestPage`, `DashboardPlayerCreatePage` | ⚠️ Incompleto |
| **Routes** | `players/routes.ts` | ✅ Existe |
| **Tests** | `usePlayers.test.ts`, `usePlayerHooks.test.ts`, `PlayerCard.test.tsx`, `PlayerEmptyState.test.tsx`, `player.api.test.ts`, `PlayerOnboardingPages.test.tsx`, `DashboardPlayerCreatePage.test.tsx`, `PlayerClubLinkRequestPage.test.tsx` | ⚠️ Parcial |
| **Store** | ❌ Não existe | ❌ Ausente |

### 1.2 O que está em falta crítico (GAPs do MVP)

| Domínio | Previsto na Arquitetura | Estado |
|---|---|---|
| **Global Player ID** (`global_id`) | Conceito central da arquitetura | ❌ Não implementado |
| **PlayerRegistration** (entidade separada) | Seção 15-16 da arquitetura | ❌ Não implementado |
| **PlayerCareer** (histórico de carreira) | Seção 17 | ❌ Não implementado |
| **PlayerContract** | Seção 19 | ❌ Não implementado |
| **IdentityDocument** | Seção 7 | ❌ Não implementado |
| **EmergencyContact** | Seção 9 | ❌ Não implementado |
| **LegalGuardian** | Seção 10 | ❌ Não implementado |
| **PlayerMedicalProfile** | Seção 13 | ❌ Não implementado |
| **PlayerDocument** (categorizado) | Seção 14 | ⚠️ Básico |
| **Player store** (Zustand) | Seção 39 | ❌ Não implementado |
| **Onboarding Wizard completo** (10 steps) | Seção 40 | ⚠️ Fragmentado |
| **Player Dashboard com KPIs** | Seção 41-42 | ⚠️ Parcial |
| **Transfer Center (Player view)** | Seção 45 | ❌ Não implementado |
| **Player Permissions model** | Seção 47 | ❌ Não implementado |
| **Domain Events** | Seção 48 | ❌ Não implementado |
| **Status lifecycle** (ACTIVE/INACTIVE/RETIRED) | Seção 36 | ❌ Não implementado |
| **ExternalIDs** (FIFA Connect prep) | Seção 2 | ❌ Não implementado |

### 1.3 Problemas de design identificados

1. **God Object em `player.schema.ts`** — Provável mistura de identidade, football e registration num único schema, contrariando a arquitetura de entidades especializadas.
2. **Acoplamento `club_id` direto no Player** — A arquitetura exige `PlayerRegistration` separado para suportar histórico multi-clube.
3. **Onboarding fragmentado** — Múltiplas páginas (`PlayerOnboardingFootballPage`, `PlayerOnboardingProfilePage`, `PlayerOnboardingReviewPage`) sem wizard coordenado com state machine.
4. **Ausência de `player-store.ts`** — Zustand store para estado local (onboarding progress, current player, permissions) não existe.
5. **Testes incompletos para páginas** — `src/tests/modules/players/pages/` existe mas está vazio (documento 1).
6. **Services sem API client real** — `players/services/index.ts` provavelmente é re-export sem implementação de API calls.

---

## 2. Visão da Estrutura Alvo (MVP)

```
src/modules/players/
│
├── components/
│   ├── PlayerCard.tsx                    ✅ existe — refatorar
│   ├── PlayerSkeleton.tsx                ✅ existe
│   ├── PlayerEmptyState.tsx              ✅ existe
│   ├── PlayerProfileLayout.tsx           ✅ existe — expandir
│   ├── PlayerAvatarUpload.tsx            ✅ existe
│   ├── PlayerCareerTimeline.tsx          ✅ existe — refatorar
│   ├── PlayerAchievementsSection.tsx     ✅ existe
│   ├── PlayerAchievementsTab.tsx         ✅ existe
│   ├── PlayerVideosSection.tsx           ✅ existe
│   ├── PlayerVideosTab.tsx               ✅ existe
│   ├── PlayerDocumentsSection.tsx        ✅ existe — expandir categorias
│   ├── PlayerDocumentsTab.tsx            ✅ existe
│   ├── PlayerLinkStatusBadge.tsx         ✅ existe
│   ├── PlayerRegistrationCard.tsx        ❌ criar
│   ├── PlayerContractCard.tsx            ❌ criar
│   ├── PlayerIdentityCard.tsx            ❌ criar
│   ├── PlayerMedicalCard.tsx             ❌ criar (acesso restrito)
│   ├── PlayerTransferStatus.tsx          ❌ criar
│   ├── PlayerKpisBar.tsx                 ❌ criar
│   ├── PlayerGuardianCard.tsx            ❌ criar
│   └── index.ts
│
├── pages/
│   ├── PlayerListPage.tsx                ✅ existe
│   ├── PlayerDetailPage.tsx              ✅ existe — expandir tabs
│   ├── PlayerCreatePage.tsx              ✅ existe
│   ├── PlayerDashboardPage.tsx           ✅ existe — adicionar KPIs
│   ├── PlayerDashboardSettingsPage.tsx   ✅ existe
│   ├── PlayerSettingsPage.tsx            ✅ existe
│   ├── PlayerClubLinkRequestPage.tsx     ✅ existe
│   ├── ClubPlayerRegisterPage.tsx        ✅ existe
│   ├── ClubPlayerRegistrationRequestsPage.tsx ✅ existe
│   ├── DashboardPlayerCreatePage.tsx     ✅ existe
│   ├── PlayerTransferCenterPage.tsx      ❌ criar
│   ├── PlayerCareerPage.tsx              ❌ criar
│   ├── PlayerContractsPage.tsx           ❌ criar
│   ├── PlayerDocumentsPage.tsx           ❌ criar
│   ├── PlayerRegistrationsPage.tsx       ❌ criar
│   └── onboarding/
│       ├── PlayerOnboardingWelcomePage.tsx    ✅ existe
│       ├── PlayerOnboardingCompletePage.tsx   ✅ existe
│       ├── PlayerOnboardingLayout.tsx         ✅ existe — refatorar wizard
│       ├── [01] AccountStep.tsx               ✅ coberto (auth)
│       ├── [02] IdentityStep.tsx              ⚠️ parcial
│       ├── [03] PersonalStep.tsx              ⚠️ parcial (ProfilePage)
│       ├── [04] FootballStep.tsx              ⚠️ PlayerOnboardingFootballPage
│       ├── [05] ContactStep.tsx               ❌ criar
│       ├── [06] GuardianStep.tsx              ❌ criar (condicional <18)
│       ├── [07] DocumentsStep.tsx             ❌ criar
│       ├── [08] MedicalStep.tsx               ❌ criar (opcional)
│       ├── [09] ClubStep.tsx                  ⚠️ PlayerClubLinkRequestPage
│       ├── [10] ReviewStep.tsx                ✅ PlayerOnboardingReviewPage
│       └── index.ts
│
├── hooks/
│   ├── usePlayerQueries.ts               ✅ existe — expandir
│   ├── usePlayerMutations.ts             ✅ existe — expandir
│   ├── useCurrentPlayer.ts               ✅ existe
│   ├── usePlayerOnboardingState.ts       ✅ existe — refatorar para state machine
│   ├── usePlayerRegistrationRequests.ts  ✅ existe
│   ├── usePlayerRegistrations.ts         ❌ criar
│   ├── usePlayerCareer.ts                ❌ criar
│   ├── usePlayerContracts.ts             ❌ criar
│   ├── usePlayerDocuments.ts             ❌ criar
│   ├── usePlayerTransfers.ts             ❌ criar
│   ├── usePlayerPermissions.ts           ❌ criar
│   └── index.ts
│
├── services/
│   ├── player.api.ts                     ❌ criar (real API client)
│   ├── registration.api.ts               ❌ criar
│   ├── career.api.ts                     ❌ criar
│   ├── contract.api.ts                   ❌ criar
│   ├── document.api.ts                   ❌ criar
│   └── index.ts                          ✅ existe — expandir
│
├── schemas/
│   ├── player.schema.ts                  ✅ existe — refatorar
│   ├── identity.schema.ts                ❌ criar
│   ├── registration.schema.ts            ❌ criar
│   ├── contract.schema.ts                ❌ criar
│   ├── document.schema.ts                ❌ criar
│   ├── guardian.schema.ts                ❌ criar
│   └── index.ts                          ✅ existe
│
├── types/
│   ├── player.types.ts                   ❌ criar (separar do index)
│   ├── registration.types.ts             ❌ criar
│   ├── career.types.ts                   ❌ criar
│   ├── contract.types.ts                 ❌ criar
│   ├── document.types.ts                 ❌ criar
│   ├── medical.types.ts                  ❌ criar
│   └── index.ts                          ✅ existe — refatorar
│
├── store/
│   └── player-store.ts                   ❌ criar (Zustand)
│
├── constants/
│   ├── index.ts                          ✅ existe — expandir
│   ├── positions.ts                      ❌ criar
│   ├── registration-types.ts             ❌ criar
│   └── navigation.tsx                    ❌ criar
│
└── routes.ts                             ✅ existe — expandir
```

---

## 3. Plano de Fases — MVP Funcional

### Critérios de prioridade
- 🔴 **Crítico** — Bloqueia outras funcionalidades; deve ser feito primeiro
- 🟠 **Alto** — Necessário para MVP funcional
- 🟡 **Médio** — Importante mas não bloqueia MVP
- 🟢 **Baixo** — Nice-to-have, pós-MVP

---

## FASE 1 — Fundação: Tipos, Schemas e Store
> **Duração estimada:** 3–5 dias  
> **Objetivo:** Estabelecer o modelo de dados correto que suporte toda a arquitectura

### 1.1 Refatorar `types/index.ts` → tipos especializados 🔴

**Criar `types/player.types.ts`:**
```typescript
// Entidade principal — pequena e focada (Seção 38)
export type PlayerStatus = 'ACTIVE' | 'INACTIVE' | 'RETIRED' | 'DECEASED' | 'SUSPENDED';

export interface Player {
  id: string;                         // global_id permanente
  global_id: string;                  // BY-PLY-XXXX...
  account_id?: string;
  status: PlayerStatus;
  first_name: string;
  middle_name?: string;
  last_name: string;
  preferred_name?: string;
  date_of_birth: string;              // ISO date
  nationality: string;
  secondary_nationality?: string;
  profile_photo?: string;
  cover_photo?: string;
  primary_position: FootballPosition;
  secondary_positions?: FootballPosition[];
  dominant_foot: 'LEFT' | 'RIGHT' | 'BOTH';
  height?: number;                    // cm
  weight?: number;                    // kg
  biography?: string;
  external_ids?: PlayerExternalIds;   // FIFA Connect prep (Seção 2)
  created_at: string;
  updated_at: string;
}

export interface PlayerExternalIds {
  fifa_connect_id?: string;
  national_association_id?: string;
  league_id?: string;
}

export type FootballPosition =
  | 'GK' | 'CB' | 'LB' | 'RB'
  | 'DM' | 'CM' | 'AM'
  | 'LW' | 'RW' | 'SS' | 'CF';
```

**Criar `types/registration.types.ts`:**
```typescript
export type RegistrationType = 'AMATEUR' | 'PROFESSIONAL' | 'YOUTH' | 'ACADEMY' | 'LOAN' | 'TRIAL' | 'GUEST';
export type RegistrationStatus = 'PENDING' | 'ACTIVE' | 'SUSPENDED' | 'EXPIRED' | 'CANCELLED';
export type ClubAssociationStatus = 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'LOANED' | 'RELEASED' | 'TRANSFERRED' | 'RETIRED';

export interface PlayerRegistration {
  id: string;
  player_id: string;
  club_id: string;
  organization_id?: string;
  competition_id?: string;
  season_id?: string;
  registration_number: string;
  registration_type: RegistrationType;
  status: RegistrationStatus;
  club_association_status: ClubAssociationStatus;
  registration_date: string;
  effective_from: string;
  effective_until?: string;
  shirt_number?: number;
  squad_number?: number;
  eligibility_status: 'ELIGIBLE' | 'INELIGIBLE' | 'UNDER_REVIEW';
  approved_by?: string;
  approved_at?: string;
}
```

**Criar `types/career.types.ts`:**
```typescript
export interface PlayerCareerEntry {
  id: string;
  player_id: string;
  club_id: string;
  club_name: string;
  club_logo?: string;
  season?: string;
  competition?: string;
  position?: FootballPosition;
  start_date: string;
  end_date?: string;
  appearances: number;
  starts: number;
  minutes: number;
  goals: number;
  assists: number;
  yellow_cards: number;
  red_cards: number;
}

export interface PlayerTrainingHistory {
  id: string;
  player_id: string;
  club_id: string;
  club_name: string;
  start_date: string;
  end_date?: string;
  country: string;
  training_category: 'YOUTH' | 'ACADEMY' | 'SENIOR' | 'RESERVE';
  verified: boolean;
}
```

**Criar `types/contract.types.ts`:**
```typescript
export type ContractType = 'PROFESSIONAL' | 'YOUTH' | 'AMATEUR' | 'SHORT_TERM' | 'TRIAL' | 'LOAN' | 'EXTENSION';
export type ContractStatus = 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'PENDING_SIGNATURE';

export interface PlayerContract {
  id: string;
  player_id: string;
  club_id: string;
  contract_type: ContractType;
  status: ContractStatus;
  start_date: string;
  end_date: string;
  signed_date?: string;
  salary?: number;
  currency?: string;
  release_clause?: number;
  document?: string;
  signed_by_player: boolean;
  signed_by_club: boolean;
  verified_at?: string;
}
```

**Criar `types/document.types.ts`:**
```typescript
export type DocumentCategory =
  | 'IDENTITY' | 'REGISTRATION' | 'CONTRACT' | 'MEDICAL'
  | 'INSURANCE' | 'VISA' | 'WORK_PERMIT' | 'EDUCATION'
  | 'TRANSFER' | 'LEGAL' | 'OTHER';

export type DocumentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED' | 'EXPIRED';
export type DocumentVisibility = 'PRIVATE' | 'CLUB' | 'ORGANIZATION' | 'PUBLIC';

export interface PlayerDocument {
  id: string;
  player_id: string;
  category: DocumentCategory;
  title: string;
  file_url: string;
  issuer?: string;
  issue_date?: string;
  expiry_date?: string;
  verification_status: DocumentStatus;
  verified_by?: string;
  verified_at?: string;
  visibility: DocumentVisibility;
  created_at: string;
}

export interface IdentityDocument {
  id: string;
  player_id: string;
  document_type: 'NATIONAL_ID' | 'PASSPORT' | 'BIRTH_CERTIFICATE' | 'RESIDENCE_PERMIT' | 'OTHER';
  document_number: string;
  issuing_country: string;
  issuing_authority?: string;
  issue_date?: string;
  expiry_date?: string;
  document_front?: string;
  document_back?: string;
}
```

**Criar `types/medical.types.ts`:**
```typescript
// Dados médicos — não públicos por padrão (Seção 13)
export interface PlayerMedicalProfile {
  id: string;
  player_id: string;
  blood_type?: string;
  medical_status: 'FIT' | 'INJURED' | 'RECOVERING' | 'UNAVAILABLE';
  injury_status?: string;
  medical_clearance: boolean;
  fitness_status?: string;
  medical_notes?: string;  // acesso restrito
  last_medical_exam?: string;
  next_medical_exam?: string;
}

export interface LegalGuardian {
  id: string;
  player_id: string;
  name: string;
  relationship: string;
  document?: string;
  phone: string;
  email?: string;
  address?: string;
  consent_status: 'PENDING' | 'GRANTED' | 'REVOKED';
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
  email?: string;
  country?: string;
}
```

### 1.2 Refatorar `schemas/player.schema.ts` — separar por domínio 🔴

**Criar `schemas/identity.schema.ts`:**
```typescript
export const identitySchema = z.object({
  first_name: z.string().min(2),
  middle_name: z.string().optional(),
  last_name: z.string().min(2),
  preferred_name: z.string().optional(),
  date_of_birth: z.string().refine(isValidDate),
  place_of_birth: z.string().optional(),
  country_of_birth: z.string(),
  nationality: z.string(),
  secondary_nationality: z.string().optional(),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
});

export const identityDocumentSchema = z.object({
  document_type: z.enum(['NATIONAL_ID', 'PASSPORT', 'BIRTH_CERTIFICATE', 'RESIDENCE_PERMIT', 'OTHER']),
  document_number: z.string().min(1),
  issuing_country: z.string(),
  issuing_authority: z.string().optional(),
  issue_date: z.string().optional(),
  expiry_date: z.string().optional(),
});
```

**Criar `schemas/registration.schema.ts`:**
```typescript
export const playerRegistrationSchema = z.object({
  club_id: z.string().uuid(),
  registration_type: z.enum(['AMATEUR', 'PROFESSIONAL', 'YOUTH', 'ACADEMY', 'LOAN', 'TRIAL', 'GUEST']),
  effective_from: z.string(),
  effective_until: z.string().optional(),
  shirt_number: z.number().min(1).max(99).optional(),
});
```

**Criar `schemas/guardian.schema.ts`:**
```typescript
export const legalGuardianSchema = z.object({
  name: z.string().min(2),
  relationship: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  consent_status: z.enum(['PENDING', 'GRANTED', 'REVOKED']).default('PENDING'),
});
```

### 1.3 Criar `store/player-store.ts` (Zustand) 🔴

```typescript
interface PlayerStore {
  // Current player
  currentPlayer: Player | null;
  setCurrentPlayer: (player: Player | null) => void;

  // Onboarding state machine
  onboardingStep: OnboardingStep;
  onboardingData: Partial<OnboardingFormData>;
  setOnboardingStep: (step: OnboardingStep) => void;
  updateOnboardingData: (data: Partial<OnboardingFormData>) => void;
  resetOnboarding: () => void;

  // Permissions
  playerPermissions: PlayerPermissions;
  setPlayerPermissions: (perms: PlayerPermissions) => void;
}
```

### 1.4 Expandir `constants/index.ts` 🟠

- Adicionar `FOOTBALL_POSITIONS` com labels (GK, CB, etc.)
- Adicionar `REGISTRATION_TYPES`, `CONTRACT_TYPES`, `DOCUMENT_CATEGORIES`
- Criar `constants/navigation.tsx` com rotas do player dashboard
- Criar `constants/positions.ts` com mapeamento posição → label PT/EN

---

## FASE 2 — Services e API Client
> **Duração estimada:** 2–3 dias  
> **Objetivo:** Implementar camada de serviços real com API client tipado

### 2.1 Criar `services/player.api.ts` 🔴

```typescript
// Usando o create-api-client existente no projeto
export const playerApi = {
  // Player CRUD
  list: (params?: PlayerListParams) => apiClient.get<PaginatedResponse<Player>>('/players/', { params }),
  get: (id: string) => apiClient.get<Player>(`/players/${id}/`),
  create: (data: CreatePlayerDto) => apiClient.post<Player>('/players/', data),
  update: (id: string, data: UpdatePlayerDto) => apiClient.patch<Player>(`/players/${id}/`, data),
  
  // Status management
  setStatus: (id: string, status: PlayerStatus) => apiClient.patch(`/players/${id}/status/`, { status }),

  // Avatar upload
  uploadAvatar: (id: string, file: File) => { /* multipart/form-data */ },
};
```

### 2.2 Criar `services/registration.api.ts` 🔴

```typescript
export const registrationApi = {
  list: (playerId: string) => apiClient.get<PlayerRegistration[]>(`/players/${playerId}/registrations/`),
  create: (playerId: string, data: CreateRegistrationDto) => apiClient.post(`/players/${playerId}/registrations/`, data),
  approve: (registrationId: string) => apiClient.post(`/registrations/${registrationId}/approve/`),
  reject: (registrationId: string, reason: string) => apiClient.post(`/registrations/${registrationId}/reject/`, { reason }),
  
  // Club-side: requests pendentes
  pendingRequests: (clubId: string) => apiClient.get(`/clubs/${clubId}/player-registration-requests/`),
};
```

### 2.3 Criar `services/career.api.ts` 🟠

```typescript
export const careerApi = {
  getCareer: (playerId: string) => apiClient.get<PlayerCareerEntry[]>(`/players/${playerId}/career/`),
  getTrainingHistory: (playerId: string) => apiClient.get<PlayerTrainingHistory[]>(`/players/${playerId}/training-history/`),
};
```

### 2.4 Criar `services/document.api.ts` 🟠

```typescript
export const documentApi = {
  list: (playerId: string, category?: DocumentCategory) => 
    apiClient.get<PlayerDocument[]>(`/players/${playerId}/documents/`, { params: { category } }),
  upload: (playerId: string, data: UploadDocumentDto) => 
    apiClient.post<PlayerDocument>(`/players/${playerId}/documents/`, data),
  verify: (documentId: string) => apiClient.post(`/documents/${documentId}/verify/`),
  updateVisibility: (documentId: string, visibility: DocumentVisibility) =>
    apiClient.patch(`/documents/${documentId}/`, { visibility }),
};
```

### 2.5 Criar `services/contract.api.ts` 🟡

```typescript
export const contractApi = {
  list: (playerId: string) => apiClient.get<PlayerContract[]>(`/players/${playerId}/contracts/`),
  getActive: (playerId: string) => apiClient.get<PlayerContract>(`/players/${playerId}/contracts/active/`),
  create: (data: CreateContractDto) => apiClient.post<PlayerContract>('/contracts/', data),
};
```

---

## FASE 3 — Hooks (React Query)
> **Duração estimada:** 2–3 dias  
> **Objetivo:** Hooks tipados, com cache keys organizados e invalidação correcta

### 3.1 Refatorar `hooks/usePlayerQueries.ts` 🔴

**Query keys centralizadas:**
```typescript
export const playerKeys = {
  all: ['players'] as const,
  lists: () => [...playerKeys.all, 'list'] as const,
  list: (params: PlayerListParams) => [...playerKeys.lists(), params] as const,
  details: () => [...playerKeys.all, 'detail'] as const,
  detail: (id: string) => [...playerKeys.details(), id] as const,
  registrations: (playerId: string) => [...playerKeys.detail(playerId), 'registrations'] as const,
  career: (playerId: string) => [...playerKeys.detail(playerId), 'career'] as const,
  contracts: (playerId: string) => [...playerKeys.detail(playerId), 'contracts'] as const,
  documents: (playerId: string, category?: DocumentCategory) => [...playerKeys.detail(playerId), 'documents', category] as const,
  current: () => [...playerKeys.all, 'current'] as const,
};
```

**Adicionar hooks ausentes:**
- `usePlayerRegistrations(playerId)` — lista registrations do jogador
- `usePlayerCareer(playerId)` — histórico de carreira
- `usePlayerContracts(playerId)` — contratos
- `usePlayerActiveContract(playerId)` — contrato ativo
- `usePlayerDocuments(playerId, category?)` — documentos filtrados

### 3.2 Refatorar `hooks/usePlayerMutations.ts` 🔴

**Adicionar mutations ausentes:**
- `useCreateRegistration()` — vincular jogador a clube
- `useApproveRegistration()` — aprovação pelo clube
- `useRejectRegistration()` — rejeição pelo clube
- `useUpdatePlayerStatus()` — ACTIVE/INACTIVE/RETIRED
- `useUploadDocument()` — upload de documento
- `useUpdateDocumentVisibility()` — controlo de privacidade

### 3.3 Criar `hooks/usePlayerPermissions.ts` 🟠

```typescript
// Determina o que o utilizador atual pode ver/fazer no perfil do player
export function usePlayerPermissions(playerId: string) {
  const { user } = useAuth();
  
  return {
    canViewMedical: hasRole(user, ['MEDICAL_STAFF', 'CLUB_ADMIN', 'PLAYER_SELF']),
    canViewContracts: hasRole(user, ['CLUB_ADMIN', 'ORG_ADMIN', 'PLAYER_SELF']),
    canEditProfile: hasRole(user, ['PLAYER_SELF', 'ORG_ADMIN']),
    canApproveRegistration: hasRole(user, ['CLUB_ADMIN', 'ORG_ADMIN']),
    canViewDocuments: hasRole(user, ['CLUB_ADMIN', 'ORG_ADMIN', 'PLAYER_SELF']),
    canTransfer: hasRole(user, ['CLUB_ADMIN', 'ORG_ADMIN']),
  };
}
```

### 3.4 Refatorar `hooks/usePlayerOnboardingState.ts` → state machine 🟠

```typescript
type OnboardingStep = 
  | 'ACCOUNT' | 'IDENTITY' | 'PERSONAL' | 'FOOTBALL' | 'CONTACT'
  | 'GUARDIAN' | 'DOCUMENTS' | 'MEDICAL' | 'CLUB' | 'REVIEW' | 'COMPLETE';

export function usePlayerOnboardingState() {
  const store = usePlayerStore();
  
  const isMinor = useMemo(() => calculateAge(store.onboardingData.date_of_birth) < 18, [...]);
  
  const steps = useMemo(() => {
    const base = ['IDENTITY', 'PERSONAL', 'FOOTBALL', 'CONTACT', 'DOCUMENTS', 'CLUB', 'REVIEW'];
    if (isMinor) base.splice(4, 0, 'GUARDIAN'); // inserir Guardian após CONTACT
    return base;
  }, [isMinor]);
  
  return {
    currentStep: store.onboardingStep,
    steps,
    progress: calculateProgress(store.onboardingStep, steps),
    canProceed: validateCurrentStep(store.onboardingStep, store.onboardingData),
    goNext: () => { /* avançar para próximo step */ },
    goBack: () => { /* recuar */ },
    saveAndExit: () => { /* guardar progresso */ },
  };
}
```

---

## FASE 4 — Onboarding Wizard (Refatoração Completa)
> **Duração estimada:** 4–6 dias  
> **Objetivo:** Wizard coeso com 10 steps, validação por step, persistência de progresso

### 4.1 Refatorar `PlayerOnboardingLayout.tsx` 🔴

**Problemas actuais:**
- Layout não coordena os steps como estado central
- Sem progress indicator visual
- Sem save-and-continue para retomar mais tarde

**Nova estrutura:**
```tsx
// PlayerOnboardingLayout.tsx — wizard coordinator
export function PlayerOnboardingLayout() {
  const { currentStep, steps, progress, goNext, goBack } = usePlayerOnboardingState();
  
  return (
    <div className="onboarding-wizard">
      <OnboardingProgressBar steps={steps} current={currentStep} progress={progress} />
      <Outlet />  {/* step atual renderizado aqui */}
      <OnboardingNavigation onBack={goBack} onNext={goNext} />
    </div>
  );
}
```

### 4.2 Criar/refatorar steps ausentes 🟠

**`[05] ContactStep.tsx`** — campos de contacto (Seção 8):
- `mobile_phone`, `secondary_phone`, `country_code`
- `address`, `city`, `province`, `postal_code`, `country`
- `secondary_email`
- Emergency contact (Seção 9): `emergency_contact.name`, `.relationship`, `.phone`

**`[06] GuardianStep.tsx`** — condicional para menores de 18 (Seção 10):
- `LegalGuardian` form usando `legalGuardianSchema`
- Validação: obrigatório se `age < 18`
- Upload de documento do responsável

**`[07] DocumentsStep.tsx`** — upload de documentos (Seção 14):
- Upload de documento de identidade (mínimo obrigatório)
- Preview e categorização
- Status de verificação

### 4.3 Refatorar `PlayerOnboardingFootballPage.tsx` → `[04] FootballStep.tsx` 🟠

**Campos a garantir:**
- `primary_position` — dropdown com 11 posições do Seção 11
- `secondary_positions` — multi-select
- `dominant_foot` — LEFT/RIGHT/BOTH
- `height`, `weight`
- `shirt_number` preferido
- `sporting_status` — Amateur/Semi-Pro/Professional

### 4.4 Expandir `PlayerOnboardingReviewPage.tsx` 🟡

- Mostrar resumo de todos os steps preenchidos
- Indicar campos opcionais não preenchidos
- Confirmar GDPR / consentimento de dados
- Botão "Submeter Perfil" com estado de loading

---

## FASE 5 — Player Dashboard (Refatoração + KPIs)
> **Duração estimada:** 3–4 dias  
> **Objetivo:** Dashboard funcional com KPIs reais e widgets principais

### 5.1 Refatorar `PlayerDashboardPage.tsx` 🔴

**Adicionar KPIs bar (Seção 41):**
```tsx
// PlayerKpisBar.tsx
export function PlayerKpisBar({ player }: { player: Player }) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
      <KpiCard label="Clube Atual" value={player.current_club?.name} icon={<ShieldIcon />} />
      <KpiCard label="Época" value={currentSeason} />
      <KpiCard label="Jogos" value={stats.appearances} />
      <KpiCard label="Golos" value={stats.goals} />
      <KpiCard label="Assistências" value={stats.assists} />
      <KpiCard label="Minutos" value={stats.minutes} />
      <KpiCard label="Estado" value={player.status} variant={statusVariant(player.status)} />
    </div>
  );
}
```

**Widgets do dashboard (Seção 41):**
- `PlayerCareerTimeline` — já existe, integrar com dados reais
- `PlayerContractCard` — exibir contrato ativo (datas, tipo, estado)
- `PlayerRegistrationCard` — registration atual
- `PlayerTransferStatus` — estado de transferência se existir
- Notificações recentes (via NotificationBell existente)
- Próximos jogos (integração com competitions module)
- Documentos recentes/pendentes

### 5.2 Criar `constants/navigation.tsx` para o player 🟠

```tsx
// Player dashboard navigation (Seção 42)
export const PLAYER_NAV_ITEMS = [
  { label: 'Dashboard', href: PLAYER_ROUTES.DASHBOARD, icon: <LayoutDashboard /> },
  { label: 'Perfil', href: PLAYER_ROUTES.PROFILE, icon: <User /> },
  { label: 'Carreira', href: PLAYER_ROUTES.CAREER, icon: <TrendingUp /> },
  { label: 'Estatísticas', href: PLAYER_ROUTES.STATS, icon: <BarChart /> },
  { label: 'Contratos', href: PLAYER_ROUTES.CONTRACTS, icon: <FileText /> },
  { label: 'Transferências', href: PLAYER_ROUTES.TRANSFERS, icon: <ArrowLeftRight /> },
  { label: 'Documentos', href: PLAYER_ROUTES.DOCUMENTS, icon: <FolderOpen /> },
  { label: 'Conquistas', href: PLAYER_ROUTES.ACHIEVEMENTS, icon: <Trophy /> },
  { label: 'Media', href: PLAYER_ROUTES.MEDIA, icon: <Play /> },
  { label: 'Definições', href: PLAYER_ROUTES.SETTINGS, icon: <Settings /> },
];
```

---

## FASE 6 — Player Detail Page (Tabs Completas)
> **Duração estimada:** 3–4 dias  
> **Objetivo:** Página de perfil público/privado com tabs funcionais

### 6.1 Refatorar `PlayerDetailPage.tsx` 🟠

**Estrutura de tabs (Seção 43):**
```tsx
<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Visão Geral</TabsTrigger>
    <TabsTrigger value="career">Carreira</TabsTrigger>
    <TabsTrigger value="statistics">Estatísticas</TabsTrigger>
    <TabsTrigger value="matches">Jogos</TabsTrigger>
    <TabsTrigger value="media">Media</TabsTrigger>
    <TabsTrigger value="achievements">Conquistas</TabsTrigger>
    {canViewDocuments && <TabsTrigger value="documents">Documentos</TabsTrigger>}
    {canViewContracts && <TabsTrigger value="contracts">Contratos</TabsTrigger>}
  </TabsList>
  {/* ... tab contents */}
</Tabs>
```

**Header do perfil:**
- Avatar com upload (já existe `PlayerAvatarUpload`)
- Nome, posição, nacionalidade, clube, número
- `PlayerLinkStatusBadge` já existe — integrar
- `PlayerMedicalCard` apenas para roles autorizados

### 6.2 Criar `PlayerCareerPage.tsx` 🟠

- `PlayerCareerTimeline` refatorado com dados reais de `usePlayerCareer()`
- Filtros por temporada/clube
- Estatísticas agregadas por época

### 6.3 Criar `PlayerDocumentsPage.tsx` 🟠

- Listar documentos por categoria usando tabs ou filtro
- Upload de novos documentos
- Estado de verificação por documento
- Controlo de visibilidade (`PlayerDocument.visibility`)

### 6.4 Criar `PlayerContractsPage.tsx` 🟡

- Contrato ativo em destaque
- Histórico de contratos
- Datas de início/fim com alertas visuais de expiração

### 6.5 Criar `PlayerTransferCenterPage.tsx` 🟡

**Seção 45 da arquitetura:**
- Clube atual e estado de associação
- Estado de transferência (se existir)
- Histórico de transferências
- Pedidos pendentes
- Link para o módulo de transfers existente

---

## FASE 7 — Gestão de Registrations (Club-side)
> **Duração estimada:** 2–3 dias  
> **Objetivo:** Fluxo completo de registo de jogador por clube

### 7.1 Refatorar `ClubPlayerRegistrationRequestsPage.tsx` 🟠

- Usar `usePlayerRegistrationRequests()` existente
- Adicionar aprovação/rejeição inline
- Filtros por estado (PENDING, APPROVED, REJECTED)
- Acção rápida: ver perfil do jogador antes de aprovar

### 7.2 Refatorar `ClubPlayerRegisterPage.tsx` 🟠

- Formulário usando `playerRegistrationSchema`
- Search de jogador por nome/global_id (pesquisa em jogadores existentes)
- Criar novo jogador se não existir (link para `PlayerCreatePage`)
- Selecção de tipo de registo (Amateur/Professional/Youth/Loan)

### 7.3 Criar `PlayerRegistrationsPage.tsx` 🟡

- Vista do jogador: todos os seus registrations
- Estado atual de cada registo
- Histórico de registros anteriores

---

## FASE 8 — Testes
> **Duração estimada:** 3–4 dias  
> **Objetivo:** Cobertura de testes para as novas funcionalidades

### 8.1 Testes de tipos/schemas 🟠

```typescript
// src/tests/modules/players/schemas/player.schema.test.ts
describe('identitySchema', () => {
  it('deve aceitar dados válidos');
  it('deve rejeitar menor sem guardian');
  it('deve validar formato de data de nascimento');
});
```

### 8.2 Testes de hooks 🟠

- `src/tests/modules/players/hooks/usePlayerRegistrations.test.ts`
- `src/tests/modules/players/hooks/usePlayerCareer.test.ts`
- `src/tests/modules/players/hooks/usePlayerPermissions.test.ts`
- Expandir `usePlayers.test.ts` e `usePlayerHooks.test.ts`

### 8.3 Testes de páginas (actualmente vazio!) 🟠

```
src/tests/modules/players/pages/
├── PlayerDashboardPage.test.tsx
├── PlayerDetailPage.test.tsx
├── PlayerOnboardingWizard.test.tsx
├── ClubPlayerRegisterPage.test.tsx
└── PlayerDocumentsPage.test.tsx
```

### 8.4 Testes de serviços 🟡

- Expandir `player.api.test.ts`
- Criar `registration.api.test.ts`
- Criar `career.api.test.ts`

---

## FASE 9 — Player Profile Público + Permissões
> **Duração estimada:** 2–3 dias  
> **Objetivo:** Separação correcta de dados públicos/privados e modelo de permissões

### 9.1 Criar `hooks/usePlayerPermissions.ts` 🟠

Implementação completa conforme Seção 47:
- `PLAYER` (próprio jogador)
- `CLUB_ADMIN`, `COACH`, `MEDICAL_STAFF`
- `ORG_ADMIN`, `COMPETITION_ADMIN`
- `AGENT`, `SCOUT`
- `PLATFORM_ADMIN`

### 9.2 Perfil público vs. privado 🟠

- Dados públicos: nome, posição, clube, foto, carreira, conquistas, media
- Dados restritos: documentos (visibilidade controlada), contrato, dados médicos
- Implementar `PlayerDocument.visibility` no frontend

### 9.3 Player Marketplace (preparação) 🟢

- Campo `is_available_for_transfer` no Player
- Visibilidade no perfil público se activado
- Prepara base para Fase V4 da arquitetura

---

## 4. Resumo de Prioridades e Sequência

```
FASE 1 — Tipos, Schemas, Store       🔴 CRÍTICO    3–5 dias
FASE 2 — Services / API Client       🔴 CRÍTICO    2–3 dias
FASE 3 — Hooks React Query           🔴 CRÍTICO    2–3 dias
FASE 4 — Onboarding Wizard           🟠 ALTO       4–6 dias
FASE 5 — Player Dashboard            🔴 CRÍTICO    3–4 dias
FASE 6 — Player Detail + Tabs        🟠 ALTO       3–4 dias
FASE 7 — Club Registration Flow      🟠 ALTO       2–3 dias
FASE 8 — Testes                      🟠 ALTO       3–4 dias
FASE 9 — Permissões + Público        🟡 MÉDIO      2–3 dias
─────────────────────────────────────────────────────────────
TOTAL ESTIMADO                                     24–35 dias
```

---

## 5. Regras de Implementação (não negociáveis)

1. **Nunca usar `player.club_id` directo** — sempre via `PlayerRegistration`
2. **Nunca apagar Player** — usar `Player.status = INACTIVE | RETIRED | DECEASED`
3. **Dados médicos não públicos** — `PlayerMedicalProfile` só acessível via role check
4. **Global Player ID permanente** — não mudar com mudança de clube
5. **Guardian obrigatório para menores** — validar `age < 18` no onboarding step 06
6. **Documentos com visibilidade controlada** — default `PRIVATE`, player decide
7. **`external_ids` preparado desde V1** — para futuro FIFA Connect
8. **Histórico de carreira nunca apagado** — apenas adicionado, nunca substituído
9. **Contratos como entidade independente** — não embutir no Player
10. **Tests para cada nova feature** — sem excepções

---

## 6. Mapeamento Player V1 → MVP Fases

| Player V1 (Arquitetura) | Fase do Plano |
|---|---|
| Account | Fase 4 (Onboarding Step 01 — via auth) |
| Identity | Fase 1 (tipos) + Fase 4 (Step 02) |
| Profile | Fase 5 (Dashboard) + Fase 6 (Detail) |
| Documents | Fase 1 (tipos) + Fase 2 (API) + Fase 6 |
| Guardian | Fase 1 (tipos) + Fase 4 (Step 06) |
| Onboarding | Fase 4 completa |
| Verification | Fase 7 (club registration flow) |

**Player V2 (Football)** — post-MVP:
- Club Association → Fase 7
- Registration → Fase 2, 3, 7
- Career → Fase 6 (PlayerCareerPage)
- Competition → integração com competitions module existente
- Statistics → post-MVP (requer dados de matches)

---

## 7. Dependências com Outros Módulos

| Módulo | Dependência |
|---|---|
| **transfers** | `PlayerRegistration` deve existir antes de Transfer funcionar correctamente |
| **competitions** | `CompetitionPlayerRegistration` depende de `PlayerRegistration` |
| **clubs** | `ClubPlayerRegisterPage` e requests dependem da Fase 7 |
| **notifications** | `PlayerDocumentUploaded`, `PlayerRegistrationApproved` events (Fase futura) |
| **dashboards** | `PlayerDashboardPage` depende dos hooks da Fase 3 |

---

*Plano criado com base na análise completa dos 408 ficheiros do repositório e da Arquitetura_do_Modulo_PLAYER.md*
