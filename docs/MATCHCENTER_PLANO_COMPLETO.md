# MatchCenter BolaYetu — Plano Completo de Implementação

> **Versão:** 1.0 | **Data:** 2026-07-28  
> **Âmbito:** Auditoria + Gaps + Novos Recursos  
> **Módulo:** `src/modules/competitions/`

---

## 1. AUDITORIA DO ESTADO ACTUAL

### 1.1 Ficheiros Existentes Identificados

| Ficheiro | Estado | Observações |
|----------|--------|-------------|
| `pages/MatchCenterPage.tsx` | ✅ Existe | Hub central — precisa de tabs e live state |
| `pages/MatchLineupPage.tsx` | ✅ Existe | Escalações — incompleto (sem drag & drop) |
| `pages/MatchReportPage.tsx` | ✅ Existe | Relatório pós-jogo — sem validação de árbitro |
| `hooks/useMatchCenter.ts` | ✅ Existe | Lógica central — sem polling em tempo real |
| `hooks/useCompetitionMatches.ts` | ✅ Existe | Lista de partidas — sem filtro por jornada |
| `components/MatchEventsPanel.tsx` | ✅ Existe | Painel de eventos — sem SSE/WebSocket |
| `components/MatchCard.tsx` | ✅ Existe | Card de partida — design básico |
| `services/competition.api.ts` | ✅ Existe | API base — endpoints match incompletos |
| `types/competition.types.ts` | ✅ Existe | Tipos gerais — faltam tipos match específicos |

### 1.2 Gaps Críticos Identificados

#### GAP-01 — Sem Suporte a Live Match
- `useMatchCenter.ts` não tem polling nem SSE
- `MatchEventsPanel.tsx` é estático (sem actualizações em tempo real)
- Não existe hook `useMatchLive`

#### GAP-02 — Gestão de Escalações Incompleta
- `MatchLineupPage.tsx` existe mas sem drag & drop
- Sem validação de elegibilidade de jogador no momento da escalação
- Sem integração com `transfers` e `registrations` para verificar status

#### GAP-03 — Relatório de Árbitro Ausente
- `MatchReportPage.tsx` existe mas sem secção de árbitro
- Sem upload de relatório oficial (PDF)
- Sem workflow de aprovação (árbitro → delegado → federação)

#### GAP-04 — Marcação de Golos/Eventos Sem UX Adequada
- Sem componente `MatchEventForm` dedicado
- Sem timeline visual de eventos
- Sem undo/correcção de eventos

#### GAP-05 — `MatchCard.tsx` Sem Estados Diferenciados
- Sem distinção visual clara: agendado / ao vivo / terminado / adiado
- Sem badge de transmissão ao vivo
- Sem countdown para partidas futuras

#### GAP-06 — Integração com Notificações Ausente
- Eventos de golo/cartão não disparam `useNotifications`
- Sem push para subscritores do match

#### GAP-07 — Sem Página de Detalhe de Partida Unificada
- `MatchCenterPage` e `MatchLineupPage` são separados sem navegação clara
- Falta `MatchDetailPage` como hub com tabs (Escalação / Eventos / Relatório / Estatísticas)

---

## 2. ARQUITECTURA PROPOSTA

### 2.1 Estrutura de Ficheiros (Após Implementação)

```
src/modules/competitions/
├── pages/
│   ├── MatchCenterPage.tsx          ← REFACTOR: hub de partidas por jornada
│   ├── MatchDetailPage.tsx          ← NOVO: detalhe unificado com tabs
│   ├── MatchLineupPage.tsx          ← REFACTOR: com drag & drop + validação
│   ├── MatchReportPage.tsx          ← REFACTOR: com workflow árbitro
│   └── MatchCenterPage.test.tsx     ← NOVO: testes
│
├── components/
│   ├── MatchCard.tsx                ← REFACTOR: estados visuais completos
│   ├── MatchEventsPanel.tsx         ← REFACTOR: com live feed
│   ├── MatchEventForm.tsx           ← NOVO: formulário de registo de evento
│   ├── MatchTimeline.tsx            ← NOVO: timeline visual vertical
│   ├── MatchLineupGrid.tsx          ← NOVO: grid drag & drop
│   ├── MatchScoreboard.tsx          ← NOVO: placar em destaque
│   ├── MatchStatusBadge.tsx         ← NOVO: badge de estado
│   ├── MatchCountdown.tsx           ← NOVO: countdown para kick-off
│   ├── MatchStatsPanel.tsx          ← NOVO: estatísticas comparativas
│   ├── MatchRefereeReport.tsx       ← NOVO: formulário relatório árbitro
│   └── MatchVideoUpload.tsx         ← NOVO: upload de highlights
│
├── hooks/
│   ├── useMatchCenter.ts            ← REFACTOR: com filtros jornada
│   ├── useMatchLive.ts              ← NOVO: polling SSE + estado ao vivo
│   ├── useMatchEvents.ts            ← NOVO: CRUD de eventos
│   ├── useMatchLineup.ts            ← NOVO: gestão de escalação
│   ├── useMatchReport.ts            ← NOVO: workflow relatório
│   └── useMatchStats.ts             ← NOVO: estatísticas agregadas
│
├── types/
│   ├── match.types.ts               ← NOVO: tipos específicos de partida
│   └── match-event.types.ts         ← NOVO: tipos de eventos
│
└── services/
    ├── match.api.ts                 ← NOVO: endpoints dedicados a matches
    └── match-events.api.ts          ← NOVO: endpoints de eventos
```

### 2.2 Modelo de Dados (Frontend Types)

```typescript
// match.types.ts

export type MatchStatus = 
  | 'scheduled'    // Agendado
  | 'pre_match'    // Pré-jogo (escalações abertas)
  | 'live'         // Ao vivo
  | 'halftime'     // Intervalo
  | 'finished'     // Terminado
  | 'postponed'    // Adiado
  | 'cancelled'    // Cancelado
  | 'walkover';    // Walkover/WO

export type MatchEventType =
  | 'goal'
  | 'own_goal'
  | 'penalty_goal'
  | 'penalty_missed'
  | 'yellow_card'
  | 'red_card'
  | 'yellow_red_card'
  | 'substitution'
  | 'injury'
  | 'var_review'
  | 'kickoff'
  | 'halftime'
  | 'fulltime';

export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  minuteExtra?: number;
  period: 'first_half' | 'second_half' | 'extra_time' | 'penalties';
  teamId: string;
  playerId?: string;
  assistPlayerId?: string;        // Para golos
  substitutedPlayerId?: string;   // Para substituições
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;
}

export interface MatchLineup {
  matchId: string;
  teamId: string;
  formation: string;              // ex: '4-3-3'
  startingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach?: string;
  submittedAt?: string;
  lockedAt?: string;
}

export interface LineupPlayer {
  playerId: string;
  playerName: string;
  playerNumber: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  positionSpecific?: string;      // ex: 'CB', 'CM', 'ST'
  eligible: boolean;
  eligibilityWarning?: string;
  avatarUrl?: string;
}

export interface MatchScore {
  home: number;
  away: number;
  homeFirstHalf?: number;
  awayFirstHalf?: number;
  homePenalties?: number;
  awayPenalties?: number;
}

export interface Match {
  id: string;
  competitionId: string;
  roundNumber: number;
  roundLabel?: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo?: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo?: string;
  scheduledAt: string;
  venue?: string;
  status: MatchStatus;
  score?: MatchScore;
  events?: MatchEvent[];
  homeLineup?: MatchLineup;
  awayLineup?: MatchLineup;
  refereeId?: string;
  refereeName?: string;
  delegateId?: string;
  attendees?: number;
  streamUrl?: string;
  reportSubmittedAt?: string;
  reportApprovedAt?: string;
}

export interface MatchStats {
  matchId: string;
  home: TeamMatchStats;
  away: TeamMatchStats;
}

export interface TeamMatchStats {
  teamId: string;
  shots: number;
  shotsOnTarget: number;
  possession: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  passes: number;
  passAccuracy: number;
}
```

---

## 3. PLANO DE IMPLEMENTAÇÃO — 6 FASES

---

### FASE 1 — Tipos e API Base (Fundação)
**Prioridade:** 🔴 Crítica | **Estimativa:** 1 dia

#### Tarefas

**1.1 Criar `src/modules/competitions/types/match.types.ts`**
- Todos os tipos acima definidos em §2.2
- Enum `MatchStatus` com 8 estados
- Tipos `MatchEvent`, `MatchLineup`, `LineupPlayer`, `MatchScore`, `Match`, `MatchStats`

**1.2 Criar `src/modules/competitions/types/match-event.types.ts`**
- `MatchEventType` (14 tipos de evento)
- `MatchEventFormData` para formulários
- Guards TypeScript para narrowing de tipos

**1.3 Criar `src/modules/competitions/services/match.api.ts`**
```typescript
// Endpoints a implementar:
GET  /competitions/:id/matches              → lista paginada com filtros
GET  /competitions/:id/matches/:matchId    → detalhe completo
POST /competitions/:id/matches             → criar partida
PATCH /matches/:id/status                 → mudar estado (árbitro/admin)
GET  /matches/:id/events                  → eventos da partida
POST /matches/:id/events                  → registar evento
DELETE /matches/:id/events/:eventId       → remover evento
GET  /matches/:id/lineup/:teamId          → escalação
POST /matches/:id/lineup/:teamId          → submeter escalação
PATCH /matches/:id/lineup/:teamId/lock    → bloquear escalação
GET  /matches/:id/stats                   → estatísticas
PUT  /matches/:id/stats                   → actualizar estatísticas
GET  /matches/:id/report                  → relatório árbitro
POST /matches/:id/report                  → submeter relatório
PATCH /matches/:id/report/approve         → aprovar relatório
GET  /matches/live                        → partidas ao vivo (global)
```

**1.4 Actualizar `src/modules/competitions/types/index.ts`**
- Re-exportar todos os novos tipos
- Garantir retrocompatibilidade com tipos existentes

---
/
### FASE 2 — Hooks Core (Lógica de Negócio)
**Prioridade:** 🔴 Crítica | **Estimativa:** 2 dias

#### 2.1 Refactor `useMatchCenter.ts`

```typescript
// Estado actual: sem filtros de jornada, sem live state
// Novo contrato:

export interface UseMatchCenterOptions {
  competitionId: string;
  roundNumber?: number;        // filtro por jornada
  status?: MatchStatus[];     // filtro por estado
  teamId?: string;            // filtro por equipa
}

export interface UseMatchCenterReturn {
  matches: Match[];
  rounds: Round[];
  selectedRound: number | null;
  setSelectedRound: (round: number | null) => void;
  liveMatches: Match[];
  upcomingMatches: Match[];
  finishedMatches: Match[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}
```

#### 2.2 Criar `useMatchLive.ts`

```typescript
// Polling a cada 30s para partidas ao vivo
// SSE quando disponível no backend

export interface UseMatchLiveReturn {
  match: Match | null;
  events: MatchEvent[];
  currentMinute: number | null;
  isLive: boolean;
  lastUpdated: Date | null;
  isLoading: boolean;
}

// Lógica interna:
// 1. Verificar se match.status === 'live'
// 2. Se sim, activar polling interval 30s
// 3. Se SSE disponível, usar EventSource
// 4. Cleanup em unmount (clearInterval + EventSource.close())
```

#### 2.3 Criar `useMatchEvents.ts`

```typescript
export interface UseMatchEventsReturn {
  events: MatchEvent[];
  addEvent: (data: MatchEventFormData) => Promise<void>;
  removeEvent: (eventId: string) => Promise<void>;
  isAddingEvent: boolean;
  isRemovingEvent: boolean;
  // Golos por equipa (computed)
  homeGoals: number;
  awayGoals: number;
  // Agrupados por tipo
  goals: MatchEvent[];
  cards: MatchEvent[];
  substitutions: MatchEvent[];
}
```

#### 2.4 Criar `useMatchLineup.ts`

```typescript
export interface UseMatchLineupReturn {
  homeLineup: MatchLineup | null;
  awayLineup: MatchLineup | null;
  eligiblePlayers: LineupPlayer[];  // da squad actual
  setLineup: (teamId: string, lineup: Partial<MatchLineup>) => void;
  submitLineup: (teamId: string) => Promise<void>;
  lockLineup: (teamId: string) => Promise<void>;
  validateLineup: (lineup: MatchLineup) => ValidationResult;
  isSubmitting: boolean;
}

// Validações:
// - Exactamente 11 jogadores iniciais
// - GK obrigatório
// - Máx 7 suplentes
// - Verificar transferências pendentes
// - Verificar suspensões
// - Verificar elegibilidade de inscrição
```

#### 2.5 Criar `useMatchReport.ts`

```typescript
export interface UseMatchReportReturn {
  report: MatchReport | null;
  submitReport: (data: MatchReportFormData) => Promise<void>;
  approveReport: () => Promise<void>;
  uploadRefereeDocument: (file: File) => Promise<string>;
  isSubmitting: boolean;
  isApproving: boolean;
  canSubmit: boolean;     // árbitro autenticado
  canApprove: boolean;    // delegado/admin
}
```

#### 2.6 Criar `useMatchStats.ts`

```typescript
export interface UseMatchStatsReturn {
  stats: MatchStats | null;
  updateStats: (data: Partial<MatchStats>) => Promise<void>;
  isLoading: boolean;
}
```

---

### FASE 3 — Componentes UI (Interface)
**Prioridade:** 🟡 Alta | **Estimativa:** 3 dias

#### 3.1 Refactor `MatchCard.tsx`

**Requisitos visuais:**
- 5 variantes de estado com cores distintas:
  - `scheduled` → cinza + countdown
  - `pre_match` → azul pulsante
  - `live` → verde + minuto animado + badge "AO VIVO"
  - `halftime` → âmbar + "INTERVALO"
  - `finished` → neutro + score final
  - `postponed` / `cancelled` → vermelho com riscado
- Logo das equipas com fallback (escudo genérico)
- Score em destaque com fonte monoespaçada
- Venue e árbitro em metadata
- Link para stream quando disponível

```tsx
// Variantes de props:
interface MatchCardProps {
  match: Match;
  variant?: 'compact' | 'full' | 'live';
  showActions?: boolean;   // para admins/árbitros
  onClick?: () => void;
}
```

#### 3.2 Criar `MatchStatusBadge.tsx`

```tsx
// Badge animado para estado ao vivo
// Pulso verde para 'live'
// Contador de minuto integrado
<MatchStatusBadge status="live" currentMinute={67} />
```

#### 3.3 Criar `MatchCountdown.tsx`

```tsx
// Countdown regressivo até kick-off
// Mostrar apenas se partida a < 7 dias
// Formato: "2d 14h 30m" → "14h 30m" → "30m" → "Em breve"
<MatchCountdown scheduledAt={match.scheduledAt} />
```

#### 3.4 Criar `MatchTimeline.tsx`

```tsx
// Timeline vertical de eventos
// Linha central com minuto
// Home à esquerda, Away à direita
// Ícones distintos por tipo de evento:
//   ⚽ golo  🟨 amarelo  🟥 vermelho  🔄 substituição  🤕 lesão
// Animação de entrada para novos eventos (live mode)
// Scroll automático para evento mais recente
```

#### 3.5 Criar `MatchScoreboard.tsx`

```tsx
// Placar principal para MatchDetailPage
// Escudos grandes das equipas
// Score XXL com fonte display
// Minuto ao vivo com pulso
// Golos marcados abaixo do score (nome + minuto)
// Half-time score em subscript
```

#### 3.6 Criar `MatchEventForm.tsx`

```tsx
// Formulário para árbitro/delegado registar evento
// Campos:
//   - Tipo de evento (select com ícones)
//   - Minuto (input numérico 1-120 + extra time)
//   - Equipa (home/away toggle)
//   - Jogador principal (searchable combobox da escalação)
//   - Jogador secundário (assistência / substituído)
// Validações em tempo real
// Submit optimistic (UX imediata)
```

#### 3.7 Criar `MatchLineupGrid.tsx`

```tsx
// Grid visual do campo de futebol
// Drag & drop de jogadores por posição
// Formação visual (4-3-3, 4-4-2, etc.)
// Indicadores de elegibilidade (verde/âmbar/vermelho)
// Lista de suplentes abaixo
// Botão de submissão com validação completa
```

#### 3.8 Criar `MatchStatsPanel.tsx`

```tsx
// Painel de estatísticas comparativas
// Barras horizontais bifaciais (home ←→ away)
// Métricas: Posse, Remates, Cantos, Faltas, Cartões
// Actualizável pelo árbitro/delegado
```

#### 3.9 Criar `MatchRefereeReport.tsx`

```tsx
// Formulário multi-secção:
//   1. Informações gerais (assistência, campo, condições)
//   2. Incidentes (área de texto livre)
//   3. Observações sobre equipas
//   4. Upload de documento oficial (PDF)
//   5. Assinatura digital (checkbox confirmação)
// Estados: rascunho → submetido → aprovado
```

#### 3.10 Refactor `MatchEventsPanel.tsx`

```tsx
// Integrar com useMatchLive para actualizações automáticas
// Mostrar indicador de "A actualizar..." quando polling ativo
// Adicionar botão de registo de evento (role-based)
// Animação de entrada para novos eventos
```

---

### FASE 4 — Páginas (Routing & Composição)
**Prioridade:** 🟡 Alta | **Estimativa:** 2 dias

#### 4.1 Criar `MatchDetailPage.tsx` (PRINCIPAL)

```
URL: /competitions/:competitionId/matches/:matchId

Layout:
┌─────────────────────────────────────────┐
│  ← Back    [CompetitionName] Jornada N  │
├─────────────────────────────────────────┤
│                                         │
│         MatchScoreboard (hero)          │
│    🏠 FC Home    2 — 1    FC Away 🏟️   │
│         [AO VIVO 73']                   │
│                                         │
├─────────────────────────────────────────┤
│  [Escalação] [Eventos] [Stats] [Relat.] │
├─────────────────────────────────────────┤
│                                         │
│         Tab Content Area                │
│                                         │
└─────────────────────────────────────────┘

Tabs:
  - Escalação → MatchLineupGrid (pré-jogo editável, jogo view-only)
  - Eventos   → MatchTimeline + MatchEventsPanel + MatchEventForm (se árbitro)
  - Stats     → MatchStatsPanel
  - Relatório → MatchRefereeReport (árbitro) / leitura (outros)
```

#### 4.2 Refactor `MatchCenterPage.tsx`

```
URL: /competitions/:competitionId/match-center

Layout:
┌─────────────────────────────────────────┐
│  Centro de Jogos — [CompetitionName]    │
├─────────────────────────────────────────┤
│  [← J1] [J2] [J3●] [J4] [J5 →]        │  ← Jornada selector
├─────────────────────────────────────────┤
│  🔴 AO VIVO (2)  │  Hoje (3)  │ Todos  │  ← Status filter
├─────────────────────────────────────────┤
│                                         │
│  ┌──────────────────────────────────┐   │
│  │  MatchCard (live) × N live       │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  MatchCard (scheduled) × N       │   │
│  └──────────────────────────────────┘   │
│  ┌──────────────────────────────────┐   │
│  │  MatchCard (finished) × N        │   │
│  └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

#### 4.3 Refactor `MatchLineupPage.tsx`

- Integrar `MatchLineupGrid` com drag & drop
- Mostrar elegibilidade de cada jogador
- Workflow: Rascunho → Submetido → Bloqueado
- Role guard: apenas treinador/gestor do clube pode editar

#### 4.4 Refactor `MatchReportPage.tsx`

- Integrar `MatchRefereeReport`
- Workflow de aprovação multi-step
- PDF preview integrado
- Notificações automáticas na submissão/aprovação

---

### FASE 5 — Integração e Tempo Real
**Prioridade:** 🟡 Alta | **Estimativa:** 2 dias

#### 5.1 Polling Strategy

```typescript
// useMatchLive.ts — estratégia de actualização:

const POLL_INTERVALS = {
  live: 15_000,       // 15s quando ao vivo
  pre_match: 60_000,  // 60s em pré-jogo
  halftime: 30_000,   // 30s no intervalo
  inactive: null,     // sem polling em estados finais
};

// Parar polling se:
// - Tab em background (visibilitychange)
// - Match status mudou para 'finished'
// - Componente desmontado

// Optimistic updates:
// - Evento registado → adicionar localmente antes da confirmação
// - Falha → reverter e mostrar toast de erro
```

#### 5.2 Integração com `useNotifications`

```typescript
// Em useMatchEvents.ts, após addEvent bem-sucedido:
// - Disparar notificação para subscritores do match
// - Payload: { matchId, eventType, teamId, minute, playerId }

// Tipos de notificação a gerar:
// GOAL → "⚽ [PlayerName] marca pelo [TeamName] ao minuto [N]"
// RED_CARD → "🟥 [PlayerName] expulso ao minuto [N]"
// FULLTIME → "Fim de jogo: [Home] X — Y [Away]"
```

#### 5.3 Cache Strategy (React Query)

```typescript
// Chaves de query padronizadas:
const MATCH_QUERY_KEYS = {
  all: ['matches'] as const,
  byCompetition: (competitionId: string) => 
    ['matches', 'competition', competitionId] as const,
  detail: (matchId: string) => 
    ['matches', matchId] as const,
  events: (matchId: string) => 
    ['matches', matchId, 'events'] as const,
  lineup: (matchId: string, teamId: string) => 
    ['matches', matchId, 'lineup', teamId] as const,
  stats: (matchId: string) => 
    ['matches', matchId, 'stats'] as const,
  live: ['matches', 'live'] as const,
};

// staleTime:
// - matches list: 60s
// - match detail: 30s
// - live events: 10s
// - lineup: 5min (muda menos)
// - stats: 30s durante jogo, 1h pós-jogo
```

#### 5.4 Role-Based Access Control

```typescript
// Permissões por acção:
const MATCH_PERMISSIONS = {
  VIEW_MATCH: ['*'],                              // todos
  SUBMIT_LINEUP: ['club_admin', 'coach'],         // gestor/treinador do clube
  LOCK_LINEUP: ['referee', 'org_admin'],          // árbitro ou admin
  ADD_EVENT: ['referee', 'delegate'],             // árbitro ou delegado
  REMOVE_EVENT: ['referee', 'org_admin'],         // só árbitro ou admin
  UPDATE_STATS: ['referee', 'delegate'],
  SUBMIT_REPORT: ['referee'],                     // só árbitro
  APPROVE_REPORT: ['org_admin', 'federation'],    // admin ou federação
  CHANGE_STATUS: ['referee', 'org_admin'],
};
```

---

### FASE 6 — Testes
**Prioridade:** 🟢 Normal | **Estimativa:** 2 dias

#### 6.1 Testes de Hooks

```
src/tests/modules/competitions/hooks/
  ├── useMatchCenter.test.ts
  ├── useMatchLive.test.ts        ← mock polling com fake timers
  ├── useMatchEvents.test.ts      ← optimistic update + rollback
  ├── useMatchLineup.test.ts      ← validação de escalação
  └── useMatchReport.test.ts
```

#### 6.2 Testes de Componentes

```
src/tests/modules/competitions/components/
  ├── MatchCard.test.tsx           ← todos os estados visuais
  ├── MatchTimeline.test.tsx       ← renderização de eventos
  ├── MatchEventForm.test.tsx      ← validações do formulário
  ├── MatchLineupGrid.test.tsx     ← drag & drop mock
  └── MatchScoreboard.test.tsx
```

#### 6.3 Testes de Páginas

```
src/tests/modules/competitions/pages/
  ├── MatchDetailPage.test.tsx     ← tab navigation
  ├── MatchCenterPage.test.tsx     ← filtros jornada/status
  └── MatchLineupPage.test.tsx     ← submit/lock workflow
```

#### 6.4 Testes de Integração

```typescript
// Cenários end-to-end a cobrir:

// Cenário 1: Fluxo completo de uma partida
// scheduled → pre_match → lineup submit → live → events → finished → report

// Cenário 2: Árbitro regista golo e é notificado aos subscritores

// Cenário 3: Treinador tenta editar escalação bloqueada (deve falhar)

// Cenário 4: Live polling activa/desactiva conforme tab visibility

// Cenário 5: Optimistic update de evento + falha de rede → rollback
```

---

## 4. ROUTING UPDATES

### Actualizar `src/modules/competitions/routes.ts`

```typescript
// Adicionar às rotas existentes:

export const COMPETITION_ROUTES = {
  // ... rotas existentes ...
  
  // MatchCenter
  MATCH_CENTER: '/competitions/:competitionId/match-center',
  
  // Match Detail (NOVA rota hub)
  MATCH_DETAIL: '/competitions/:competitionId/matches/:matchId',
  MATCH_LINEUP: '/competitions/:competitionId/matches/:matchId/lineup',
  MATCH_EVENTS: '/competitions/:competitionId/matches/:matchId/events',
  MATCH_REPORT: '/competitions/:competitionId/matches/:matchId/report',
  MATCH_STATS: '/competitions/:competitionId/matches/:matchId/stats',
  
  // Árbitro (acesso especial)
  MATCH_REFEREE: '/matches/:matchId/referee',  // sem competitionId (árbitro independente)
};
```

### Actualizar `src/app/routes/slices/contentRoutes.tsx`

```tsx
// Adicionar lazy imports:
const MatchDetailPage = lazy(() => import('@/modules/competitions/pages/MatchDetailPage'));

// Adicionar route:
{
  path: 'competitions/:competitionId/matches/:matchId',
  element: (
    <ProtectedRoute requiredRoles={['*']}>
      <MatchDetailPage />
    </ProtectedRoute>
  ),
},
```

---

## 5. DESIGN SYSTEM — MATCHCENTER

### Paleta de Cores por Estado

```css
/* Match Status Colors — a adicionar em index.css ou tailwind.config.ts */

--match-live: #16a34a;          /* verde vivo */
--match-live-pulse: #22c55e;    /* pulso animado */
--match-scheduled: #6b7280;     /* cinza neutro */
--match-pre-match: #2563eb;     /* azul preparação */
--match-halftime: #d97706;      /* âmbar intervalo */
--match-finished: #374151;      /* escuro terminado */
--match-postponed: #dc2626;     /* vermelho adiado */
--match-cancelled: #991b1b;     /* vermelho escuro */

/* Event Type Colors */
--event-goal: #16a34a;
--event-own-goal: #dc2626;
--event-yellow-card: #f59e0b;
--event-red-card: #dc2626;
--event-substitution: #6366f1;
--event-var: #8b5cf6;
```

### Animações (a adicionar em tailwind.config.ts)

```typescript
// tailwind.config.ts — extend.animation:
'pulse-slow': 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
'blink': 'blink 1s step-end infinite',
'slide-in-left': 'slideInLeft 0.3s ease-out',
'slide-in-right': 'slideInRight 0.3s ease-out',

// extend.keyframes:
'blink': { '0%, 100%': { opacity: '1' }, '50%': { opacity: '0' } },
'slideInLeft': { from: { transform: 'translateX(-20px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
'slideInRight': { from: { transform: 'translateX(20px)', opacity: '0' }, to: { transform: 'translateX(0)', opacity: '1' } },
```

---

## 6. ROADMAP E PRIORIDADES

### Sprint 1 (Semana 1) — Fundação
- [ ] Fase 1: Tipos + API (`match.types.ts`, `match.api.ts`)
- [ ] Fase 2.1: Refactor `useMatchCenter.ts`
- [ ] Fase 2.2: `useMatchEvents.ts`
- [ ] Fase 3.1: Refactor `MatchCard.tsx` (estados visuais)
- [ ] Fase 3.2: `MatchStatusBadge.tsx`
- [ ] Fase 3.4: `MatchTimeline.tsx`

### Sprint 2 (Semana 2) — Core UX
- [ ] Fase 2.2: `useMatchLive.ts` (polling)
- [ ] Fase 3.5: `MatchScoreboard.tsx`
- [ ] Fase 3.6: `MatchEventForm.tsx`
- [ ] Fase 4.1: `MatchDetailPage.tsx` (hub com tabs)
- [ ] Fase 4.2: Refactor `MatchCenterPage.tsx` (filtros jornada)

### Sprint 3 (Semana 3) — Escalações + Relatório
- [ ] Fase 2.3: `useMatchLineup.ts`
- [ ] Fase 3.7: `MatchLineupGrid.tsx` (drag & drop)
- [ ] Fase 4.3: Refactor `MatchLineupPage.tsx`
- [ ] Fase 2.4: `useMatchReport.ts`
- [ ] Fase 3.9: `MatchRefereeReport.tsx`
- [ ] Fase 4.4: Refactor `MatchReportPage.tsx`

### Sprint 4 (Semana 4) — Integração + Testes
- [ ] Fase 5: Polling + Notificações + RBAC
- [ ] Fase 6: Testes completos
- [ ] Routing updates
- [ ] Design tokens + animações
- [ ] QA e polish

---

## 7. DEPENDÊNCIAS EXTERNAS

### Bibliotecas a Adicionar

```json
// package.json — adicionar se não existirem:
{
  "@dnd-kit/core": "^6.x",         // drag & drop escalação
  "@dnd-kit/sortable": "^8.x",     // sortable list para suplentes
  "react-countdown": "^2.x"        // countdown kick-off (ou implementar próprio)
}
```

### APIs Backend Necessárias (confirmar com equipa backend)

| Endpoint | Prioridade | Status |
|----------|-----------|--------|
| `GET /matches/live` | Alta | ❓ A confirmar |
| `POST /matches/:id/events` | Alta | ❓ A confirmar |
| `POST /matches/:id/lineup/:teamId` | Alta | ❓ A confirmar |
| `SSE /matches/:id/stream` | Média | ❓ Avaliar viabilidade |
| `GET /matches/:id/stats` | Normal | ❓ A confirmar |
| `POST /matches/:id/report` | Normal | ❓ A confirmar |

---

## 8. RISCOS E MITIGAÇÕES

| Risco | Impacto | Probabilidade | Mitigação |
|-------|---------|--------------|-----------|
| Backend sem SSE | Alto | Médio | Usar polling como fallback primário |
| Drag & drop em mobile | Médio | Alto | `@dnd-kit` tem suporte touch nativo |
| Elegibilidade em tempo real | Alto | Baixo | Cache da lista de elegíveis no hook |
| Conflitos de concorrência (2 árbitros) | Alto | Baixo | Optimistic lock no backend; toast de conflito |
| Performance com muitos eventos | Médio | Médio | Virtualização da timeline (react-window) |

---

## 9. CHECKLIST FINAL PRÉ-LANÇAMENTO

- [ ] Todos os estados de `MatchStatus` têm UI correspondente
- [ ] RBAC aplicado em todas as acções sensíveis
- [ ] Polling limpo em unmount (sem memory leaks)
- [ ] Escalação valida elegibilidade antes de submeter
- [ ] Relatório de árbitro tem workflow completo (draft→submit→approve)
- [ ] Notificações disparadas para golos e fim de jogo
- [ ] Mobile responsive (320px mínimo)
- [ ] Reduced motion respeitado nas animações
- [ ] Testes de cobertura ≥ 80% nos hooks
- [ ] Loading states em todas as acções async
- [ ] Error states com mensagens accionáveis
- [ ] Empty states com CTAs claros

---

*Plano gerado em 2026-07-28 | BolaYetu Platform*
