# Auditoria do Módulo Players
**Data:** Agosto 2026  
**Escopo:** Módulo `src/modules/players` — estrutura, onboarding, UX, testes, arquitetura

---

## 1. Contexto e premissa central

O Player é uma **entidade global e independente**. Ele não pertence a nenhuma organização ou clube por padrão. A vinculação acontece exclusivamente através de uma **solicitação iniciada pelo próprio player** (link request), que precisa ser aprovada pelo clube/org. Toda a arquitetura e UX deve reforçar esse modelo.

---

## 2. Mapa atual do módulo

```
src/modules/players/
├── pages/
│   ├── PlayerOnboardingLayout.tsx          ← container do fluxo de onboarding
│   ├── PlayerOnboardingProfilePage.tsx     ← step 1: dados pessoais
│   ├── PlayerOnboardingFootballPage.tsx    ← step 2: dados de futebol
│   ├── PlayerOnboardingReviewPage.tsx      ← step 3: revisão e confirmação
│   ├── PlayerDashboardPage.tsx             ← dashboard do player autenticado
│   ├── PlayerDashboardSettingsPage.tsx     ← configurações do dashboard
│   ├── PlayerDetailPage.tsx                ← perfil público do player
│   ├── PlayerListPage.tsx                  ← listagem pública/admin
│   ├── PlayerSettingsPage.tsx              ← configurações do player
│   ├── PlayerCreatePage.tsx                ← criação admin/org
│   ├── DashboardPlayerCreatePage.tsx       ← criação via dashboard
│   ├── PlayerClubLinkRequestPage.tsx       ← solicitação de vínculo a clube
│   ├── ClubPlayerRegistrationRequestsPage.tsx ← clube gerencia requests
│   └── ClubPlayerRegisterPage.tsx          ← clube registra player manualmente
├── components/
│   ├── PlayerCard.tsx
│   ├── PlayerSkeleton.tsx
│   ├── PlayerEmptyState.tsx
│   ├── PlayerAvatarUpload.tsx
│   ├── PlayerCareerTimeline.tsx
│   ├── PlayerAchievementsSection.tsx / Tab
│   ├── PlayerVideosSection.tsx / Tab
│   └── PlayerDocumentsSection.tsx / Tab
├── hooks/
│   ├── usePlayerQueries.ts
│   ├── usePlayerMutations.ts
│   └── usePlayerRegistrationRequests.ts
├── services/index.ts
├── schemas/player.schema.ts
├── types/index.ts
├── constants/index.ts
└── routes.ts
```

---

## 3. Gaps identificados

### 3.1 Onboarding — Fluxo e UX

| # | Gap | Impacto | Evidência |
|---|-----|---------|-----------|
| G1 | `PlayerOnboardingGuard` existe (`src/app/routes/`) mas não há verificação clara de **estado do onboarding** (completo/incompleto) para decidir o redirect | Alto | Arquivo `PlayerOnboardingGuard.tsx` listado |
| G2 | Não há **página de welcome/splash** antes do step 1. O player cai direto no formulário sem entender o que vai preencher | Alto | Apenas 3 steps: Profile → Football → Review |
| G3 | O `PlayerOnboardingLayout.tsx` não indica visualmente onde o player **salvou progresso** — não há persistência de rascunho entre steps | Médio | Layout e steps separados |
| G4 | Após completar o onboarding, o **redirect de destino** não está explícito — o player pode ficar perdido sem saber o que fazer a seguir (buscar clube, aguardar) | Alto | `resolvePostAuthRedirect.ts` existe no onboarding geral, mas o fluxo player não tem equivalente claro |
| G5 | Não há **step de vinculação a clube** dentro do onboarding — o `PlayerClubLinkRequestPage` é uma página separada, sem integração com o fluxo de boas-vindas | Alto | Páginas são totalmente desconectadas |
| G6 | Falta uma tela de **"Seu perfil está pronto — o que deseja fazer agora?"** com CTAs claros: buscar clube, explorar competições, ver meu perfil | Alto | Ausente no mapeamento |

### 3.2 Arquitetura e nomenclatura de páginas

| # | Gap | Impacto |
|---|-----|---------|
| G7 | Duas páginas para criar player: `PlayerCreatePage.tsx` e `DashboardPlayerCreatePage.tsx`. Responsabilidades sobrepostas não explicitadas | Médio |
| G8 | `ClubPlayerRegisterPage.tsx` — um clube pode "registrar" um player sem que o player tenha iniciado nada? Isso viola a premissa de que o player é global e inicia o vínculo | Alto |
| G9 | `usePlayerRegistrationRequests.ts` separado de `usePlayerQueries.ts` — a separação faz sentido, mas o hook não tem um par de mutations dedicado (tudo em `usePlayerMutations.ts`). Inconsistência de convenção | Baixo |
| G10 | `PlayerDashboardPage.tsx` e `PlayerDetailPage.tsx` provavelmente compartilham layout mas são completamente separados — sem componente `PlayerProfileLayout` compartilhado | Médio |

### 3.3 Componentes

| # | Gap | Impacto |
|---|-----|---------|
| G11 | Seções duplicadas: `PlayerAchievementsSection.tsx` + `PlayerAchievementsTab.tsx`, `PlayerVideosSection.tsx` + `PlayerVideosTab.tsx`, `PlayerDocumentsSection.tsx` + `PlayerDocumentsTab.tsx`. Section = conteúdo, Tab = wrapper de aba? A distinção não está clara pela nomenclatura | Médio |
| G12 | Nenhum componente de **status de vínculo** (PlayerLinkStatusBadge ou similar) para mostrar no card/perfil se o player está vinculado, pendente ou livre | Médio |
| G13 | `PlayerCareerTimeline.tsx` existe mas não há componente de **stats rápidos** (jogos, gols, assistências) para exibir no dashboard sem precisar de uma página dedicada | Médio |

### 3.4 Hooks e estado

| # | Gap | Impacto |
|---|-----|---------|
| G14 | `usePlayerQueries.ts` — ausência de hook `useCurrentPlayer` dedicado para o contexto do player autenticado (distinto de buscar player por ID) | Alto |
| G15 | Sem hook `usePlayerOnboardingState` para gerenciar qual step está completo/incompleto e ser usado pelo Guard | Alto |
| G16 | `usePlayerRegistrationRequests.ts` — não há separação entre requests que o **player enviou** (outgoing) e requests que chegaram **para o clube** (incoming). Mesclados no mesmo hook | Alto |

### 3.5 Testes

| # | Gap | Impacto |
|---|-----|---------|
| G17 | `tests/modules/players/pages/` está **vazio** — nenhuma das páginas de onboarding tem teste | Alto |
| G18 | `DashboardPlayerCreatePage.test.tsx` está em `tests/modules/players/services/` — path errado, deveria estar em `tests/modules/players/pages/` | Baixo |
| G19 | Ausência de testes para `PlayerClubLinkRequestPage` — fluxo crítico sem cobertura | Alto |
| G20 | `usePlayers.test.ts` existe mas não há `usePlayerMutations.test.ts` nem `usePlayerRegistrationRequests.test.ts` | Alto |

### 3.6 Tipos e schemas

| # | Gap | Impacto |
|---|-----|---------|
| G21 | Provavelmente não há distinção de tipo entre `PlayerProfile` (dados do player), `PlayerCard` (dados para listagem) e `PlayerPublicView` (o que terceiros veem) | Médio |
| G22 | Status de onboarding do player não está tipado como enum (ex: `PlayerOnboardingStatus: 'pending_profile' | 'pending_football' | 'complete'`) | Médio |
| G23 | Status de vínculo com clube não está tipado como enum (ex: `LinkStatus: 'none' | 'pending' | 'active' | 'rejected'`) | Médio |

---

## 4. Análise do fluxo de onboarding atual vs. ideal

### Fluxo atual (reconstruído)
```
Register → [Auth] → PlayerOnboardingGuard
                          ↓
              PlayerOnboardingLayout
              ┌─────────────────────────┐
              │ Step 1: Profile Page    │ ← nome, nascimento, país, foto
              │ Step 2: Football Page   │ ← posição, pé, altura/peso
              │ Step 3: Review Page     │ ← confirmar dados
              └─────────────────────────┘
                          ↓
              PlayerDashboardPage  ← sem orientação clara do que fazer
```

**Problemas:**
- Não há step de "boas-vindas" explicando o que o player consegue fazer
- Não há step de "próximos passos" após completar o perfil
- A vinculação a clube (`PlayerClubLinkRequestPage`) está completamente fora do fluxo
- O Guard não distingue entre "nunca iniciou" vs "iniciou mas não terminou"

### Fluxo proposto
```
Register → [Auth] → PlayerOnboardingGuard
                          ↓
              [novo] WelcomePage
              "Bem-vindo! Vamos criar seu perfil de jogador."
              (explica em 3 bullets o que acontece)
                          ↓
              PlayerOnboardingLayout (stepper visual melhorado)
              ┌─────────────────────────────────────────┐
              │ Step 1: Perfil pessoal                  │
              │   nome, foto, nascimento, nacionalidade │
              │ Step 2: Perfil esportivo                │
              │   posição, pé, altura, peso, bio        │
              │ Step 3: Revisão                         │
              │   confirmar + editar inline             │
              └─────────────────────────────────────────┘
                          ↓
              [novo] PlayerOnboardingCompletePage
              "Seu perfil está pronto! 🎉"
              CTA 1: "Solicitar vínculo a um clube"  → PlayerClubLinkRequestPage
              CTA 2: "Explorar competições"          → CompetitionListPage
              CTA 3: "Ver meu perfil público"        → PlayerDetailPage
                          ↓
              PlayerDashboardPage (com banner de status: "Aguardando aprovação do clube X")
```

---

## 5. Plano de resolução — por prioridade

### 🔴 CRÍTICO (Sprint 1)

**T1 — Corrigir premissa de vínculo (G8)**
- Revisar `ClubPlayerRegisterPage.tsx`: se um clube pode criar um player do zero, isso viola a premissa global. Definir se essa página é para (a) convidar um player existente ou (b) criar um perfil placeholder — e nomear corretamente. Resposta (a).
- Garantir que todo vínculo parte de uma `LinkRequest` com estado auditável

**T2 — Hook `useCurrentPlayer` (G14)**
- Criar `hooks/useCurrentPlayer.ts` que usa o contexto de auth para retornar os dados do player logado, sem precisar passar ID manualmente em cada página
- Usado por `PlayerDashboardPage`, `PlayerSettingsPage`, `PlayerOnboarding`

**T3 — Hook `usePlayerOnboardingState` (G15)**
- Criar hook que retorna `{ step: 'profile' | 'football' | 'complete', isComplete: boolean, redirectTo: string }`
- Consumido pelo `PlayerOnboardingGuard` para redirect preciso

**T4 — Separar requests outgoing/incoming (G16)**
- Renomear/separar `usePlayerRegistrationRequests` em:
  - `usePlayerOutgoingRequests` — requests que o player enviou para clubes
  - `useClubIncomingRequests` — requests que o clube recebeu (já em `ClubPlayerRegistrationRequestsPage`)

---

### 🟠 ALTO (Sprint 2)

**T5 — Página de conclusão do onboarding (G4, G6)**
- Criar `PlayerOnboardingCompletePage.tsx`
- 3 CTAs claros conforme fluxo proposto acima
- Banner de "perfil criado" com % de completude para incentivar preenchimento adicional

**T6 — Integrar ClubLinkRequest no onboarding (G5)**
- Após a tela de conclusão, mostrar um step opcional: "Quer se vincular a um clube agora?"
- Reutilizar `PlayerClubLinkRequestPage` dentro do layout de onboarding ou como modal

**T7 — Status de vínculo no card e dashboard (G12)**
- Criar componente `PlayerLinkStatusBadge` com estados visuais: `Livre`, `Pendente`, `Vinculado`
- Adicionar ao `PlayerCard` e ao header do `PlayerDashboardPage`

**T8 — Enums de status (G22, G23)**
- Criar no `types/index.ts`:
  ```typescript
  export type PlayerOnboardingStatus = 'pending_profile' | 'pending_football' | 'complete'
  export type PlayerLinkStatus = 'none' | 'pending' | 'active' | 'rejected'
  ```
- Atualizar schemas Zod e API responses para usar esses tipos

---

### 🟡 MÉDIO (Sprint 3)

**T9 — Welcome page de onboarding (G2)**
- Criar `PlayerOnboardingWelcomePage.tsx` como primeiro step
- Conteúdo: o que é o perfil de jogador, o que o player consegue fazer, como funciona o vínculo com clube
- Leve, não bloqueia — máximo de 1 tela

**T10 — Consolidar componentes Section/Tab (G11)**
- Definir convenção: `PlayerXSection` = componente de conteúdo isolado; `PlayerXTab` = wrapper que conecta ao sistema de tabs da página
- Se `Tab` só renderiza `Section`, eliminar o Tab e deixar só a Section com prop `asTab`

**T11 — PlayerProfileLayout compartilhado (G10)**
- Criar `components/PlayerProfileLayout.tsx` com header (foto, nome, status, stats rápidos)
- Usado tanto em `PlayerDashboardPage` (owner view) quanto `PlayerDetailPage` (public view)
- Props diferenciam o que é editável vs somente leitura

**T12 — Persistência de rascunho no onboarding (G3)**
- Salvar estado do formulário no `localStorage` (ou store Zustand se já existir)
- Recuperar ao voltar para o step — se o user sair e voltar, não perde o preenchimento

**T13 — Corrigir path do test (G18)**
- Mover `tests/modules/players/services/DashboardPlayerCreatePage.test.tsx` → `tests/modules/players/pages/`

---

### 🟢 COBERTURA DE TESTES (Sprint 3-4)

**T14 — Testes das páginas de onboarding (G17)**
- `PlayerOnboardingProfilePage.test.tsx` — valida campos obrigatórios, submit, erro
- `PlayerOnboardingFootballPage.test.tsx` — valida posição, pé, campos numéricos
- `PlayerOnboardingReviewPage.test.tsx` — renderiza dados do state, botão de confirmar

**T15 — Testes do fluxo de vínculo (G19)**
- `PlayerClubLinkRequestPage.test.tsx` — submit de request, feedback de sucesso/erro, estado pendente

**T16 — Testes de hooks (G20)**
- `usePlayerMutations.test.ts`
- `usePlayerRegistrationRequests.test.ts` (separado em outgoing/incoming após T4)
- `useCurrentPlayer.test.ts`

---

## 6. Tipos e interfaces recomendadas

```typescript
// types/index.ts — adições

export type PlayerOnboardingStatus =
  | 'not_started'
  | 'pending_profile'
  | 'pending_football'
  | 'complete'

export type PlayerLinkStatus =
  | 'none'
  | 'pending_approval'
  | 'active'
  | 'rejected'
  | 'terminated'

export interface PlayerProfile {
  id: string
  userId: string
  // dados do player
  firstName: string
  lastName: string
  dateOfBirth: string
  nationality: string
  avatarUrl?: string
  // futebol
  position: PlayerPosition
  preferredFoot: 'left' | 'right' | 'both'
  height?: number
  weight?: number
  bio?: string
  // estado
  onboardingStatus: PlayerOnboardingStatus
  currentLinkStatus: PlayerLinkStatus
  currentClubId?: string
  currentOrganizationId?: string
}

export interface PlayerCard
  extends Pick<PlayerProfile, 'id' | 'firstName' | 'lastName' | 'avatarUrl' | 'position' | 'currentLinkStatus'> {
  clubName?: string
}

export interface PlayerLinkRequest {
  id: string
  playerId: string
  clubId: string
  status: 'pending' | 'approved' | 'rejected'
  requestedAt: string
  resolvedAt?: string
  message?: string
}
```

---

## 7. Estrutura de arquivos após refatoração

```
src/modules/players/
├── pages/
│   ├── onboarding/                           ← novo: pasta dedicada
│   │   ├── PlayerOnboardingLayout.tsx
│   │   ├── PlayerOnboardingWelcomePage.tsx   ← novo
│   │   ├── PlayerOnboardingProfilePage.tsx
│   │   ├── PlayerOnboardingFootballPage.tsx
│   │   ├── PlayerOnboardingReviewPage.tsx
│   │   └── PlayerOnboardingCompletePage.tsx  ← novo
│   ├── PlayerDashboardPage.tsx
│   ├── PlayerDashboardSettingsPage.tsx
│   ├── PlayerDetailPage.tsx
│   ├── PlayerListPage.tsx
│   ├── PlayerSettingsPage.tsx
│   ├── PlayerCreatePage.tsx                  ← renomear/revisar escopo (T1)
│   ├── DashboardPlayerCreatePage.tsx
│   ├── PlayerClubLinkRequestPage.tsx
│   ├── ClubPlayerRegistrationRequestsPage.tsx
│   └── index.ts
├── components/
│   ├── PlayerProfileLayout.tsx               ← novo (T11)
│   ├── PlayerLinkStatusBadge.tsx             ← novo (T7)
│   ├── PlayerCard.tsx
│   ├── PlayerSkeleton.tsx
│   ├── PlayerEmptyState.tsx
│   ├── PlayerAvatarUpload.tsx
│   ├── PlayerCareerTimeline.tsx
│   ├── PlayerAchievementsSection.tsx         ← consolidado (T10)
│   ├── PlayerVideosSection.tsx               ← consolidado (T10)
│   ├── PlayerDocumentsSection.tsx            ← consolidado (T10)
│   └── index.ts
├── hooks/
│   ├── useCurrentPlayer.ts                   ← novo (T2)
│   ├── usePlayerOnboardingState.ts           ← novo (T3)
│   ├── usePlayerQueries.ts
│   ├── usePlayerMutations.ts
│   ├── usePlayerOutgoingRequests.ts          ← renomeado (T4)
│   ├── useClubIncomingRequests.ts            ← extraído (T4)
│   └── index.ts
├── services/index.ts
├── schemas/player.schema.ts
├── types/index.ts                            ← enums adicionados (T8)
├── constants/index.ts
└── routes.ts
```

---

## 8. Resumo executivo

| Área | Gaps | Críticos | Ações |
|------|------|----------|-------|
| Onboarding UX | 6 | 3 | Welcome page, Complete page, integrar LinkRequest |
| Premissa global | 2 | 1 | Revisar ClubPlayerRegisterPage, separar requests |
| Hooks | 3 | 2 | useCurrentPlayer, usePlayerOnboardingState, split requests |
| Componentes | 3 | 0 | Consolidar Section/Tab, ProfileLayout, StatusBadge |
| Tipos | 3 | 0 | Enums de status, tipos distintos de Player |
| Testes | 4 | 2 | Páginas de onboarding, fluxo de vínculo |
| **Total** | **21** | **8** | **16 tasks em 4 sprints** |

O maior risco atual é o **G8** (clube criando player sem consentimento) e **G4/G5** (player sem orientação após onboarding e sem caminho claro para se vincular a um clube). Esses dois pontos corroem a premissa central do modelo de dados.
