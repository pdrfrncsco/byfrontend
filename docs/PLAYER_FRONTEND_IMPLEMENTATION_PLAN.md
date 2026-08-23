# 🎯 Plano de Implementação — Frontend Módulo Player

**Data:** August 12, 2026  
**Status:** 📋 Planejamento  
**Versão:** Fases 1-4 (com base em implementações backend)

---

## 📊 Visão Geral

O frontend do Módulo Player será implementado em **4 fases alinhadas com o backend**, com foco em:

1. **Fase 1:** Player Identity (Onboarding + Perfil + Identidade)
2. **Fase 2:** Football Identity (Registo + Carreira + Estatísticas)
3. **Fase 3:** Professional (Contratos + Agentes + Transferências)
4. **Fase 4:** Ecosystem (Médico + Seleção + Performance + Compliance)

Cada fase terá:
- ✅ Componentes reutilizáveis
- ✅ Pages/Screens
- ✅ Hooks customizados
- ✅ State management
- ✅ Services/APIs
- ✅ Tipos TypeScript
- ✅ Testes

---

## 🏗️ Estrutura de Diretórios (Target)

```
modules/player/
│
├── components/
│   ├── common/
│   │   ├── PlayerCard.tsx
│   │   ├── PlayerAvatar.tsx
│   │   ├── PlayerBadge.tsx
│   │   ├── GlobalIdBadge.tsx
│   │   └── StatusIndicator.tsx
│   │
│   ├── forms/
│   │   ├── PlayerIdentityForm.tsx
│   │   ├── PlayerContactForm.tsx
│   │   ├── PlayerGuardianForm.tsx
│   │   ├── PlayerFootballForm.tsx
│   │   ├── PlayerContractForm.tsx
│   │   └── PlayerMedicalForm.tsx
│   │
│   ├── layouts/
│   │   ├── PlayerLayout.tsx
│   │   ├── ProfileLayout.tsx
│   │   └── DashboardLayout.tsx
│   │
│   ├── sections/
│   │   ├── PlayerIdentitySection.tsx
│   │   ├── PlayerContactSection.tsx
│   │   ├── PlayerFootballSection.tsx
│   │   ├── PlayerCareerSection.tsx
│   │   ├── PlayerContractSection.tsx
│   │   ├── PlayerMedicalSection.tsx
│   │   └── PlayerComplianceSection.tsx
│   │
│   ├── dialogs/
│   │   ├── DocumentUploadDialog.tsx
│   │   ├── ContractSignDialog.tsx
│   │   ├── TransferRequestDialog.tsx
│   │   └── MedicalUpdateDialog.tsx
│   │
│   └── timeline/
│       ├── CareerTimeline.tsx
│       ├── RegistrationTimeline.tsx
│       └── TransferTimeline.tsx
│
├── pages/
│   ├── PlayerDashboard.tsx
│   ├── PlayerProfile.tsx
│   ├── PlayerList.tsx
│   ├── PlayerDetail.tsx
│   ├── PlayerOnboarding.tsx
│   ├── PlayerCareer.tsx
│   ├── PlayerContracts.tsx
│   ├── PlayerMedical.tsx
│   ├── PlayerTransfers.tsx
│   ├── PlayerCompliance.tsx
│   └── PlayerSettings.tsx
│
├── hooks/
│   ├── usePlayer.ts
│   ├── usePlayerForm.ts
│   ├── usePlayerList.ts
│   ├── usePlayerCareer.ts
│   ├── usePlayerContract.ts
│   ├── usePlayerOnboarding.ts
│   ├── usePlayerMedical.ts
│   ├── usePlayerTransfer.ts
│   └── usePlayercompliance.ts
│
├── services/
│   ├── playerApi.ts
│   ├── playerService.ts
│   ├── playerCareerService.ts
│   ├── playerContractService.ts
│   ├── playerMedicalService.ts
│   ├── playerTransferService.ts
│   ├── playerComplianceService.ts
│   └── playerOnboardingService.ts
│
├── store/
│   ├── playerSlice.ts
│   ├── playerCareerSlice.ts
│   ├── playerContractSlice.ts
│   ├── playerMedicalSlice.ts
│   ├── playerFormSlice.ts
│   └── selectors.ts
│
├── schemas/
│   ├── playerSchema.ts
│   ├── playerFormSchema.ts
│   ├── playerContractSchema.ts
│   ├── playerMedicalSchema.ts
│   └── playerComplianceSchema.ts
│
├── types/
│   ├── player.types.ts
│   ├── contract.types.ts
│   ├── medical.types.ts
│   ├── transfer.types.ts
│   ├── compliance.types.ts
│   └── onboarding.types.ts
│
├── constants/
│   ├── player.constants.ts
│   ├── positions.constants.ts
│   ├── documentTypes.constants.ts
│   ├── contractTypes.constants.ts
│   └── statusConstants.ts
│
├── utils/
│   ├── playerHelpers.ts
│   ├── dateHelpers.ts
│   ├── documentHelpers.ts
│   ├── contractHelpers.ts
│   └── formatters.ts
│
├── tests/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   ├── store/
│   └── utils/
│
└── routes.tsx
```

---

## 🎯 FASE 1 — Player Identity (Fundação)

### Objetivo
Implementar onboarding completo, perfil de identidade e documentos do jogador.

### Timeline
**Estimativa:** 3-4 sprints

### Componentes Chave

#### 1.1 Onboarding Wizard
```typescript
// pages/PlayerOnboarding.tsx
- Step 1: Account (Email, Telefone, Senha)
- Step 2: Identity (Nome, Data Nascimento, Nacionalidade)
- Step 3: Personal (Contacto Pessoal)
- Step 4: Football (Posição, Pé Dominante)
- Step 5: Contact (Endereço, Contactos de Emergência)
- Step 6: Guardian (Se Menor)
- Step 7: Documents (Upload de Identidade)
- Step 8: Medical (Tipo Sanguíneo, Status)
- Step 9: Club (Associação a Clube)
- Step 10: Review & Submit
```

**Componentes necessários:**
- `WizardStep.tsx` — Contenedor genérico para cada step
- `ProgressIndicator.tsx` — Barra de progresso
- `StepValidation.tsx` — Validação por step
- `WizardNavigation.tsx` — Próximo/Anterior

#### 1.2 Player Profile
```typescript
// pages/PlayerProfile.tsx
- Header (Avatar, Nome, Global ID, Status)
- Tabs:
  - Overview (Resumo rápido)
  - Identity (Dados pessoais)
  - Contact (Contactos)
  - Documents (Documentos)
  - Football (Perfil futebolístico)
```

#### 1.3 Document Management
```typescript
// components/sections/PlayerDocumentSection.tsx
- Upload de documentos
- Lista de documentos
- Preview
- Status de verificação
- Datas de validade
```

#### 1.4 Privacy Settings
```typescript
// pages/PlayerSettings.tsx
- Visibilidade do perfil
- Controlo de dados médicos
- Controlo de dados de contrato
- Permissões de dados
```

### Store (Redux/Zustand)
```typescript
// store/playerSlice.ts
- playerProfile: Player
- loading: boolean
- error: string | null
- onboardingStep: number
- formData: Partial<Player>
```

### API Services
```typescript
// services/playerApi.ts
- POST /players/ (criar jogador)
- GET /players/me/ (perfil do usuário)
- PATCH /players/me/ (atualizar perfil)
- POST /players/me/documents/ (upload doc)
- GET /players/me/documents/ (listar docs)
- PATCH /players/me/privacy/ (atualizar privacidade)
```

### Hooks Customizados
```typescript
// hooks/usePlayer.ts
- Fetch perfil do jogador
- Validação de campos
- Erro handling

// hooks/usePlayerForm.ts
- Gerenciar estado do formulário
- Validação em tempo real
- Submit do formulário

// hooks/usePlayerOnboarding.ts
- Gerenciar estado do wizard
- Validação por step
- Progress tracking
```

### Tipos TypeScript
```typescript
// types/player.types.ts
interface Player {
  global_id: string
  account?: string
  status: 'ACTIVE' | 'INACTIVE' | 'RETIRED' | 'DECEASED'
  first_name: string
  last_name: string
  preferred_name?: string
  date_of_birth: Date
  nationality: string
  primary_position: string
  dominant_foot: 'LEFT' | 'RIGHT' | 'BOTH'
  profile_photo?: string
  is_minor: boolean
  is_public: boolean
  created_at: Date
  updated_at: Date
}

interface PlayerIdentityDocument {
  id: string
  document_type: 'NATIONAL_ID' | 'PASSPORT' | 'BIRTH_CERT' | 'RESIDENCE_PERMIT' | 'OTHER'
  document_number: string
  issuing_country: string
  issue_date?: Date
  expiry_date?: Date
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  verified_by?: string
  verified_at?: Date
}

interface PlayerContact {
  primary_email: string
  secondary_email?: string
  mobile_phone: string
  secondary_phone?: string
  address?: string
  city?: string
  province?: string
  postal_code?: string
  country: string
}
```

### Validações (Zod/Yup)
```typescript
// schemas/playerFormSchema.ts
- Nome obrigatório
- Email válido
- Data de nascimento no passado
- Posição futebolística válida
- Documentos obrigatórios para maiores de idade
- Guardião obrigatório para menores
```

### Tests
```typescript
// tests/components/PlayerOnboarding.test.tsx
- Render de cada step
- Validação de formulário
- Navegação entre steps
- Submit final

// tests/hooks/usePlayer.test.ts
- Fetch de dados
- Update de dados
- Error handling
```

### Telas (Pages)
1. **PlayerOnboarding** — Wizard completo
2. **PlayerProfile** — Perfil com tabs
3. **PlayerSettings** — Configurações de privacidade
4. **PlayerDocuments** — Gerenciamento de documentos

---

## 🏆 FASE 2 — Football Identity (Registo + Carreira)

### Objetivo
Implementar registo em clubes, historial de carreira e estatísticas.

### Timeline
**Estimativa:** 3-4 sprints

### Componentes Chave

#### 2.1 Player Registration
```typescript
// components/sections/PlayerRegistrationSection.tsx
- Status de registo atual
- Histórico de registos
- Detalhes do registo (shirt, squad number, status)
- Documentos de registo
```

#### 2.2 Career Timeline
```typescript
// components/timeline/CareerTimeline.tsx
- Timeline visual de clubes
- Períodos de tempo
- Competições
- Estatísticas por período
```

#### 2.3 Statistics
```typescript
// components/sections/PlayerStatisticsSection.tsx
- Estatísticas gerais (gols, assistências, partidas)
- Estatísticas por temporada
- Estatísticas por competição
- Gráficos de performance
```

#### 2.4 Player Registration Details
```typescript
// pages/PlayerRegistration.tsx
- Lista de registos
- Detalhes do registo
- Status do registo
- Documents
```

### Store
```typescript
// store/playerCareerSlice.ts
- registrations: PlayerRegistration[]
- career: PlayerCareer[]
- statistics: PlayerStatistics
- selectedRegistration: PlayerRegistration | null
```

### API Services
```typescript
// services/playerCareerService.ts
- GET /players/{id}/registrations/ (listar registos)
- GET /players/{id}/career/ (historial carreira)
- GET /players/{id}/statistics/ (estatísticas)
```

### Types
```typescript
// types/player.types.ts (adicionar)
interface PlayerRegistration {
  id: string
  player: string
  club: string
  competition?: string
  registration_type: 'AMATEUR' | 'PROFESSIONAL' | 'YOUTH' | 'ACADEMY' | 'LOAN' | 'TRIAL'
  status: 'ACTIVE' | 'PENDING' | 'SUSPENDED' | 'LOANED' | 'RELEASED'
  shirt_number?: number
  joined_date: Date
  left_date?: Date
  matches_played: number
  goals: number
  assists: number
}

interface PlayerCareer {
  id: string
  player: string
  club: string
  season: string
  competition?: string
  position: string
  appearances: number
  starts: number
  minutes_played: number
  goals: number
  assists: number
  yellow_cards: number
  red_cards: number
}

interface PlayerStatistics {
  player: string
  season: string
  total_matches: number
  total_goals: number
  total_assists: number
  total_minutes: number
  pass_accuracy?: number
  shots?: number
  tackles?: number
}
```

### Hooks
```typescript
// hooks/usePlayerCareer.ts
- Fetch carreira do jogador
- Filtrar por temporada
- Sorting/Paging

// hooks/usePlayerList.ts
- Listar jogadores
- Filtrar
- Search
```

### Telas (Pages)
1. **PlayerCareer** — Timeline de carreira
2. **PlayerStatistics** — Estatísticas detalhadas
3. **PlayerRegistration** — Detalhes de registos

---

## 💼 FASE 3 — Professional (Contratos + Agentes + Transferências)

### Objetivo
Implementar gestão de contratos, agentes e transferências.

### Timeline
**Estimativa:** 3-4 sprints

### Componentes Chave

#### 3.1 Player Contracts
```typescript
// components/sections/PlayerContractSection.tsx
- Contrato atual (destaque)
- Histórico de contratos
- Detalhes do contrato (datas, salário, cláusulas)
- Status de assinatura
- Documentos do contrato
```

#### 3.2 Contract Details Dialog
```typescript
// components/dialogs/ContractDetailsDialog.tsx
- Informações do contrato
- Termos (confidencial se necessário)
- Histórico de assinaturas
- Ações (renovar, terminar, etc.)
```

#### 3.3 Agent Relationship
```typescript
// components/sections/PlayerAgentSection.tsx
- Agente atual
- Histórico de agentes
- Informações de contacto
- Comissão
```

#### 3.4 Transfer Center
```typescript
// pages/PlayerTransfers.tsx
- Status de transferência
- Solicitações de transferência
- Histórico de transferências
- Timeline de transferências
- Documentos de transferência
```

#### 3.5 Transfer Request Dialog
```typescript
// components/dialogs/TransferRequestDialog.tsx
- Formulário de solicitação
- Clubs potenciais
- Notas
- Submissão
```

### Store
```typescript
// store/playerContractSlice.ts
- contracts: PlayerContract[]
- agents: PlayerAgent[]
- transfers: PlayerTransfer[]
- selectedContract: PlayerContract | null
```

### API Services
```typescript
// services/playerContractService.ts
- GET /players/{id}/contracts/
- POST /players/{id}/contracts/
- PATCH /players/{id}/contracts/{id}/
- GET /players/{id}/agents/

// services/playerTransferService.ts
- GET /players/{id}/transfers/
- POST /players/{id}/transfers/
- PATCH /players/{id}/transfers/{id}/
```

### Types
```typescript
// types/contract.types.ts
interface PlayerContract {
  id: string
  player: string
  club: string
  contract_type: 'PROFESSIONAL' | 'YOUTH' | 'AMATEUR' | 'LOAN' | 'TRIAL'
  status: 'DRAFT' | 'ACTIVE' | 'EXPIRED' | 'TERMINATED' | 'SUSPENDED'
  start_date: Date
  end_date: Date
  signed_date?: Date
  salary?: number
  currency: string
  release_clause?: number
  signed_by_player: boolean
  signed_by_club: boolean
  verified_at?: Date
}

interface PlayerAgent {
  id: string
  player: string
  agent: {
    name: string
    email: string
    phone: string
    fifa_agent_id?: string
  }
  start_date: Date
  end_date?: Date
  commission_rate?: number
  status: 'ACTIVE' | 'EXPIRED' | 'TERMINATED'
}

interface PlayerTransfer {
  id: string
  player: string
  from_club: string
  to_club: string
  transfer_type: 'PERMANENT' | 'LOAN' | 'FREE' | 'YOUTH'
  status: 'REQUESTED' | 'PENDING' | 'APPROVED' | 'REJECTED' | 'COMPLETED'
  requested_at: Date
  effective_date?: Date
  transfer_fee?: number
}
```

### Hooks
```typescript
// hooks/usePlayerContract.ts
- Fetch contratos
- Validar contrato ativo
- Format salary

// hooks/usePlayerTransfer.ts
- Fetch transferências
- Submeter solicitação
- Track status
```

### Telas (Pages)
1. **PlayerContracts** — Gestão de contratos
2. **PlayerAgents** — Gestão de agentes
3. **PlayerTransfers** — Centro de transferências

---

## 🏥 FASE 4 — Ecosystem (Médico + Seleção + Performance + Compliance)

### Objetivo
Implementar dados médicos, seleção nacional, performance e compliance.

### Timeline
**Estimativa:** 3-4 sprints

### Componentes Chave

#### 4.1 Medical Profile
```typescript
// components/sections/PlayerMedicalSection.tsx
- Status médico (🔒 Restrito)
- Tipo sanguíneo
- Documentos médicos
- Histórico de exames
- Avisos de lesões
```

#### 4.2 Medical Documents
```typescript
// components/dialogs/MedicalDocumentDialog.tsx
- Upload de documentos médicos
- Listagem de documentos
- Status de verificação
- Datas de validade
```

#### 4.3 National Team
```typescript
// components/sections/PlayerNationalTeamSection.tsx
- Selecção atual
- Histórico de convocações
- Caps internacionais
- Competições
```

#### 4.4 Performance Metrics
```typescript
// components/sections/PlayerPerformanceSection.tsx
- Gráficos de performance
- Métricas GPS
- Dados biométricos
- Timeline de performance
```

#### 4.5 Compliance Dashboard
```typescript
// pages/PlayerCompliance.tsx
- Status de compliance
- Regras aplicáveis
- Documentos necessários
- Avisos/Alertas
- Histórico de compliance
```

### Store
```typescript
// store/playerMedicalSlice.ts
- medicalProfile: PlayerMedicalProfile | null
- medicalDocuments: MedicalDocument[]
- nationalTeam: NationalTeamCallUp | null
- performanceMetrics: PlayerPerformanceMetric[]
- complianceRecords: PlayerComplianceRecord[]
```

### API Services
```typescript
// services/playerMedicalService.ts
- GET /players/{id}/medical/
- PATCH /players/{id}/medical/
- POST /players/{id}/medical/documents/
- GET /players/{id}/medical/documents/

// services/playerComplianceService.ts
- GET /players/{id}/compliance/
- GET /players/{id}/national-team/

// services/playerPerformanceService.ts
- GET /players/{id}/performance/metrics/
```

### Types
```typescript
// types/medical.types.ts
interface PlayerMedicalProfile {
  player: string
  blood_type?: string
  medical_status: 'FIT' | 'INJURED' | 'RECOVERING' | 'SUSPENDED'
  medical_clearance: boolean
  fitness_status?: string
  last_medical_exam?: Date
  next_medical_exam?: Date
}

interface MedicalDocument {
  id: string
  player: string
  document_type: 'CERTIFICATE' | 'INJURY_REPORT' | 'SCAN' | 'LAB' | 'VACCINATION' | 'OTHER'
  title: string
  issued_at: Date
  expires_at?: Date
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED'
  is_confidential: boolean
}

// types/compliance.types.ts
interface PlayerComplianceRecord {
  id: string
  player: string
  rule_type: string
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW'
  priority: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW'
  notes?: string
  reviewed_at?: Date
}
```

### Hooks
```typescript
// hooks/usePlayerMedical.ts
- Fetch perfil médico
- Validar acesso restrito
- Upload de documentos

// hooks/usePlayerCompliance.ts
- Fetch compliance records
- Filter por prioridade/status
- Track compliance status
```

### Telas (Pages)
1. **PlayerMedical** — Perfil médico (🔒)
2. **PlayerNationalTeam** — Seleção nacional
3. **PlayerPerformance** — Análise de performance
4. **PlayerCompliance** — Dashboard de compliance

---

## 🎨 Design System & Components Reutilizáveis

### Componentes Comuns (Shared)
```typescript
// components/common/
- PlayerCard.tsx — Card com info resumida
- PlayerAvatar.tsx — Avatar do jogador
- PlayerBadge.tsx — Status badge
- GlobalIdBadge.tsx — Display do global_id
- StatusIndicator.tsx — Indicador de status
- StatCard.tsx — Card de estatística
- TimelineItem.tsx — Item de timeline
- DocumentUpload.tsx — Upload de documentos
```

### Form Components
```typescript
// components/forms/
- PlayerIdentityForm.tsx
- PlayerContactForm.tsx
- PlayerGuardianForm.tsx
- PlayerFootballForm.tsx
- PlayerContractForm.tsx
- PlayerMedicalForm.tsx
```

### Dialog Components
```typescript
// components/dialogs/
- DocumentUploadDialog.tsx
- ContractSignDialog.tsx
- TransferRequestDialog.tsx
- MedicalUpdateDialog.tsx
- ConfirmationDialog.tsx
```

### Layout Components
```typescript
// components/layouts/
- PlayerLayout.tsx — Layout principal
- ProfileLayout.tsx — Layout para perfil
- DashboardLayout.tsx — Layout dashboard
```

---

## 📱 Mobile-First Responsive Design

Todas as telas devem ser:
- ✅ Mobile-first
- ✅ Tablets optimizado
- ✅ Desktop full-width
- ✅ Dark mode support
- ✅ Acessibilidade (WCAG 2.1 AA)

---

## 🧪 Testing Strategy

### Unit Tests
```typescript
// tests/components/PlayerCard.test.tsx
// tests/hooks/usePlayer.test.ts
// tests/utils/playerHelpers.test.ts
```

### Integration Tests
```typescript
// tests/pages/PlayerProfile.test.tsx
// tests/pages/PlayerOnboarding.test.tsx
```

### E2E Tests (Cypress)
```typescript
// cypress/e2e/player-onboarding.cy.ts
// cypress/e2e/player-profile.cy.ts
// cypress/e2e/player-transfers.cy.ts
```

### Coverage Target
- ✅ Components: 80%
- ✅ Hooks: 85%
- ✅ Services: 90%
- ✅ Utils: 95%

---

## 🔒 Security & Privacy

### Medical Data
- 🔒 Restrito apenas a staff médico
- 🔒 Não mostrar sem autenticação
- 🔒 Audit trail de accesso

### Contract Data
- 🔒 Salário apenas para clube/jogador
- 🔒 Cláusulas restritas
- 🔒 Verificação de permissões

### Compliance Data
- ✅ Visível para compliance officers
- 🔒 Não mostrar ao público
- ✅ Alerts automáticos

---

## 📊 Performance Optimization

### Code Splitting
```typescript
// routes.tsx
const PlayerOnboarding = lazy(() => import('./pages/PlayerOnboarding'))
const PlayerCareer = lazy(() => import('./pages/PlayerCareer'))
const PlayerContracts = lazy(() => import('./pages/PlayerContracts'))
const PlayerMedical = lazy(() => import('./pages/PlayerMedical'))
```

### Data Fetching
- ✅ SWR/React Query para caching
- ✅ Pagination para listas grandes
- ✅ Lazy loading de imagens
- ✅ Virtual scrolling para timelines

### Bundle Optimization
- ✅ Tree-shaking
- ✅ Dynamic imports
- ✅ Component lazy loading
- ✅ Image optimization

---

## 🚀 Deployment Strategy

### Fase 1 Release
- Beta com grupo selecto de jogadores
- Feedback loop rápido
- Iteração baseada em feedback

### Fase 2-4 Rollout
- Rollout gradual por feature
- Feature flags para controlo
- A/B testing onde apropriado

---

## 📋 Dependências & Stack

### Frontend Stack
- **Framework:** React 18+
- **State Management:** Redux Toolkit + RTK Query
- **Form Handling:** React Hook Form + Zod
- **UI Components:** Shadcn/ui
- **Styling:** Tailwind CSS
- **HTTP Client:** Axios + RTK Query
- **Testing:** Vitest + React Testing Library + Cypress
- **Build:** Vite
- **Type Safety:** TypeScript
- **Router:** TanStack Router

### Dependências Chave
```json
{
  "@reduxjs/toolkit": "^2.0.0",
  "react-hook-form": "^7.0.0",
  "zod": "^3.0.0",
  "axios": "^1.0.0",
  "react-query": "^3.0.0",
  "tailwindcss": "^3.0.0",
  "shadcn/ui": "latest"
}
```

---

## 🔄 Integration com Backend

### API Base URL
```typescript
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1'
```

### Endpoints Utilizados (por fase)

**Fase 1:**
- `POST /players/` — Criar jogador
- `GET /players/me/` — Perfil atual
- `PATCH /players/me/` — Atualizar perfil
- `POST /players/me/documents/` — Upload documentos

**Fase 2:**
- `GET /players/{id}/registrations/` — Registos
- `GET /players/{id}/career/` — Carreira
- `GET /players/{id}/statistics/` — Estatísticas

**Fase 3:**
- `GET /players/{id}/contracts/` — Contratos
- `GET /players/{id}/agents/` — Agentes
- `GET /players/{id}/transfers/` — Transferências

**Fase 4:**
- `GET /players/{id}/medical/` — Dados médicos
- `GET /players/{id}/national-team/` — Seleção
- `GET /players/{id}/compliance/` — Compliance

---

## 📅 Timeline Estimada

| Fase | Duração | Principais Deliverables |
|------|---------|------------------------|
| **1** | 3-4 sprints | Onboarding, Perfil, Identidade |
| **2** | 3-4 sprints | Registo, Carreira, Estatísticas |
| **3** | 3-4 sprints | Contratos, Agentes, Transferências |
| **4** | 3-4 sprints | Médico, Seleção, Performance, Compliance |
| **Total** | 12-16 sprints | MVP Completo |

---

## 📝 Próximos Passos

1. ✅ **Validar arquitetura com equipa**
2. ✅ **Setup inicial do projeto** (Vite + React + Redux + Tailwind)
3. ✅ **Criar componentes base e layout**
4. ✅ **Implementar Fase 1** (Player Identity + Onboarding)
5. ✅ **Testes e feedback**
6. ✅ **Fase 2, 3, 4 iterativamente**

---

## 🎯 Success Criteria

- ✅ Todas as 4 fases implementadas
- ✅ 80%+ test coverage
- ✅ Performance < 3s load time
- ✅ Mobile-first responsive design
- ✅ WCAG 2.1 AA acessibilidade
- ✅ Zero breaking changes no backend
- ✅ Documentação completa
- ✅ Integração perfeita com API

---

**Status:** 📋 Planejamento Completo  
**Próximo:** Setup Inicial do Projeto Frontend
