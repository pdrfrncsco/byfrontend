# Auditoria Frontend — Dashboards & Navegação

> Versão 1.0 · Agosto 2026  
> Escopo: módulos `clubs`, `organizations`, `competitions`, `players`, `dashboards`, `transfers`, `notifications`

---

## 1. Visão Geral da Arquitetura Atual

```
src/
├── app/
│   ├── layouts/          → AppLayout, AuthLayout, DashboardLayout, PublicLayout
│   ├── providers/        → Auth, Query, Theme, Tenant, I18n
│   ├── routes/           → AppRoutes, slices (public, dashboard, content)
│   └── stores/           → auth-store, tenant-store, theme-store
├── modules/
│   ├── auth/
│   ├── clubs/            ← navigation.tsx próprio
│   ├── competitions/     ← navigation.tsx próprio
│   ├── dashboards/
│   ├── notifications/
│   ├── onboarding/
│   ├── organizations/    ← navigation.tsx próprio
│   ├── players/
│   ├── shared/
│   └── transfers/
└── components/ui/        → design system compartilhado
```

**Problema central:** Cada módulo mantém seu próprio arquivo `navigation.tsx` sem contrato compartilhado. O `DashboardSidebar` e o `sidebar-utils.ts` precisam agregar essas fontes de forma ad hoc, gerando duplicações e inconsistências visuais.

---

## 2. Inconsistências Identificadas nos Dashboards

### 2.1 Múltiplos "dashboards" sem hierarquia clara

| Módulo | Arquivo | Contexto de uso | Problema |
|--------|---------|-----------------|---------|
| `dashboards` | `ExecutiveDashboardPage` | Visão executiva (org) | Overlap com `OrganizationDashboardPage` |
| `dashboards` | `CompetitionDashboardPage` | KPIs de competição | Deveria estar em `competitions/` |
| `dashboards` | `DashboardPageSelector` | Selector de contexto | Lógica de seleção espalhada em `useDashboardResolver` |
| `organizations` | `OrganizationDashboardPage` | Dashboard da org | Duplica responsabilidade com `ExecutiveDashboardPage` |
| `clubs` | `ClubDashboardPage` | Dashboard do clube | Padrão diferente dos demais (usa `ClubKpisCard` isolado) |
| `players` | `PlayerDashboardPage` | Dashboard do jogador | Sem KPI cards padronizados (usa `PlayerDashboardSections`) |

**Decisão recomendada:**
- `ExecutiveDashboardPage` → absorve `OrganizationDashboardPage` (renomear para `OrgExecutivePage`)
- `CompetitionDashboardPage` → mover para `competitions/pages/`
- `DashboardPageSelector` → implementar como guard/resolver no nível de rota, não como página separada
- Todos os dashboards devem usar o mesmo componente `<KpiCard />` de `organizations/components/KpiCard.tsx`

### 2.2 KPI Cards — 3 implementações paralelas

```
src/modules/organizations/components/KpiCard.tsx        ← origem
src/modules/clubs/components/ClubKpisCard.tsx           ← wrapper específico
src/modules/players/components/PlayerDashboardSections  ← inline, sem componente
```

**Ação:** Promover `KpiCard` para `src/components/ui/kpi-card.tsx` e deprecar os demais.

### 2.3 Empty States — 4 implementações paralelas

```
src/components/ui/empty-state.tsx                      ← genérico
src/modules/clubs/components/ClubEmptyState.tsx        ← específico
src/modules/organizations/components/OrganizationEmptyState.tsx
src/modules/competitions/components/CompetitionEmptyState.tsx
src/modules/players/components/PlayerEmptyState.tsx
```

**Ação:** Usar apenas `<EmptyState />` do design system com props `icon`, `title`, `description`, `action`. Remover os 4 módulo-específicos.

### 2.4 Skeleton Loaders — 3 implementações não padronizadas

```
src/modules/clubs/components/ClubSkeleton.tsx
src/modules/competitions/components/CompetitionSkeleton.tsx
src/modules/players/components/PlayerSkeleton.tsx
src/modules/organizations/components/OrganizationSkeleton.tsx
```

**Ação:** Criar `<PageSkeleton variant="card|list|detail" />` no design system. Os 4 acima podem ser wrappers finos ou removidos.

### 2.5 Error States — sobreposição

```
src/components/ui/error-states.tsx                                ← genérico
src/modules/organizations/components/OrganizationErrorState.tsx  ← específico
```

**Ação:** Remover `OrganizationErrorState`, usar `error-states.tsx` diretamente.

---

## 3. Elementos Não Utilizados / Duplicados a Eliminar

### 3.1 Páginas duplicadas

| Página | Duplicata | Resolução |
|--------|-----------|-----------|
| `PlayerCreatePage` | `DashboardPlayerCreatePage` | Manter apenas `DashboardPlayerCreatePage` com prop `context` |
| `TransferCreatePage` | `OrgTransferCreatePage` + `ClubTransferCreatePage` | Unificar com prop `actorType: 'org' | 'club'` |
| `TransferDetailPage` | `OrgTransferDetailPage` + `ClubTransferDetailPage` | Idem |
| `TransfersListPage` | `OrgTransfersListPage` | Unificar com filtro por contexto |
| `CompetitionAdminListPage` | `CompetitionListPage` | Manter uma com controle de permissão interno |

### 3.2 Serviços re-exportados redundantes

```
src/modules/clubs/services/transfers-reexport.ts   ← re-exporta transfers/
```
→ Eliminar. Importar diretamente de `modules/transfers/services`.

### 3.3 Hooks com sobreposição

| Hook | Módulo | Sobreposição |
|------|--------|-------------|
| `usePlayerQueries` | players | Duplica parte de `usePlayerMutations` |
| `usePlayerCareerStats` | players | Poderia ser seletor dentro de `usePlayerQueries` |
| `useCompetitionFull` | competitions | Agrega `useCompetitions` + `useCompetitionConfig` — verificar se ambos ainda existem separados |
| `useCompetitionAdvanced` | competitions | Nome vago; provavelmente duplica `useCompetitionFull` |

### 3.4 Rotas órfãs (pages existem, mas sem entrada na navegação identificada)

- `PlayerSettingsPage` vs `PlayerDashboardSettingsPage` — dois caminhos para settings do jogador
- `ClubMatchLineupManagerPage` — não aparece no `navigation.tsx` de clubs
- `OrganizationLineupSubmissionsPage` — não aparece no `navigation.tsx` de organizations
- `CompetitionAdminDashboardPage` — overlap com `CompetitionDetailPage`

---

## 4. Gaps Identificados

### 4.1 Módulo `players` — sem navigation.tsx

O módulo `players` é o único que **não possui** um `constants/navigation.tsx`. A navegação do jogador está dispersa entre:
- `PlayerDashboardPage` (links hardcoded)
- `PlayerProfileLayout` (tabs hardcoded)
- `PlayerOnboardingLayout` (steps hardcoded)

**Ação:** Criar `src/modules/players/constants/navigation.tsx` com a mesma estrutura dos demais módulos.

### 4.2 Módulo `transfers` — sem navigation.tsx e sem dashboard

Transfers não tem página de overview/dashboard própria. O acesso é sempre via clube ou org.

**Ação:** Adicionar entry point claro na navegação de clubs e organizations; não criar dashboard próprio.

### 4.3 `notifications` — sem página de configuração

Existe `NotificationsPage` e `NotificationBell` + `NotificationsDropdown`, mas nenhuma página de preferências de notificação.

**Ação:** Adicionar `NotificationSettingsPage` ou integrar em `ProfilePage`.

### 4.4 Onboarding — fluxos paralelos sem coordenação clara

Existem **dois** sistemas de onboarding:
- `src/modules/onboarding/` → org/competition onboarding (OrganizationStep, CompetitionStep, BrandingStep, ReviewStep)
- `src/modules/players/pages/PlayerOnboarding*` → player onboarding separado

Ambos têm guards próprios (`OnboardingGuard`, `PlayerOnboardingGuard`). O `PendingOnboardingRedirect` sugere lógica de decisão não consolidada.

**Ação:** Unificar sob um único `OnboardingRouter` que decide qual fluxo ativar baseado no role do usuário.

---

## 5. Padronização dos Menus de Navegação

### 5.1 Contrato unificado para navigation items

Todos os módulos devem exportar `NavItem[]` com o mesmo tipo:

```typescript
// src/types/navigation.ts  (NOVO — criar este arquivo)
export interface NavItem {
  key: string;           // identificador único
  label: string;         // i18n key ou string
  href: string;          // rota relativa
  icon: LucideIcon;
  badge?: number | string;
  roles?: string[];      // controle de acesso
  children?: NavItem[];  // sub-itens
  group?: string;        // agrupamento visual no sidebar
  hidden?: boolean;      // ocultar sem remover da árvore
}

export interface NavContext {
  type: 'organization' | 'club' | 'competition' | 'player' | 'admin';
  entityId: string;
  entityName: string;
  entityLogo?: string;
  entityAvatar?: string;
  accentColor?: string;
}
```

### 5.2 Navegação por módulo — estrutura recomendada

#### Organizations
```
Dashboard         /org/:id
├── Clubes        /org/:id/clubs
├── Competições   /org/:id/competitions
├── Jogadores     /org/:id/players
├── Transferências /org/:id/transfers
├── Membros       /org/:id/members
├── Afiliações    /org/:id/affiliations
├── Submissões    /org/:id/lineup-submissions    ← atualmente órfão
└── Configurações /org/:id/settings
```

#### Clubs
```
Dashboard         /club/:id
├── Plantel       /club/:id/squad
├── Competições   /club/:id/competitions
├── Transferências /club/:id/transfers
├── Membros       /club/:id/members
├── Documentos    /club/:id/documents
├── Patrocinadores /club/:id/sponsors
├── Lineups       /club/:id/lineup-manager      ← atualmente órfão
└── Configurações /club/:id/settings
```

#### Competitions
```
Dashboard         /competition/:id
├── Jogos         /competition/:id/matches
│   └── Match Center, Detail, Lineup, Report, Tactical
├── Classificação /competition/:id/rankings
├── Calendário    /competition/:id/schedule
├── Sorteio       /competition/:id/draw
├── Inscrições    /competition/:id/registration
├── Suspensões    /competition/:id/suspensions
├── Regulamento   /competition/:id/regulations
└── Configurações /competition/:id/settings
```

#### Players
```
Dashboard         /player/:id
├── Perfil        /player/:id/profile
├── Estatísticas  /player/:id/stats
├── Carreira      /player/:id/career
├── Transferências /player/:id/transfers
├── Contratos     /player/:id/contracts
├── Agentes       /player/:id/agents
├── Documentos    /player/:id/documents
├── Médico        /player/:id/medical
├── Conquistas    /player/:id/achievements
├── Vídeos        /player/:id/videos
└── Configurações /player/:id/settings
```

---

## 6. Atualização do Topbar (DashboardHeader)

### 6.1 Problemas atuais
- Topbar provavelmente exibe nome/logo estático sem refletir o contexto atual (org/club/competition/player)
- `NotificationBell` e `NotificationsDropdown` coexistem — verificar se ambos são usados ou se há duplicação
- Sem breadcrumb contextual

### 6.2 Topbar redesenhado

```
┌─────────────────────────────────────────────────────────────────────┐
│  [☰ menu]  [EntityBadge: logo + nome]  [Breadcrumb]    [Search] [🔔] [Avatar] │
└─────────────────────────────────────────────────────────────────────┘
```

**Componentes do novo Topbar:**

```tsx
// src/app/layouts/components/DashboardHeader.tsx

<header>
  {/* Mobile: hamburguer */}
  <MobileMenuTrigger />

  {/* Context badge — muda conforme rota */}
  <EntityContextBadge context={navContext} />

  {/* Breadcrumb dinâmico */}
  <DashboardBreadcrumb />

  {/* Ações direitas */}
  <div className="ml-auto flex items-center gap-2">
    <GlobalSearch />          {/* novo */}
    <NotificationBell />      {/* manter apenas este */}
    <UserAvatarMenu />
  </div>
</header>
```

**Eliminar:**
- `NotificationsDropdown` como componente separado — incorporar dentro de `NotificationBell` como popover
- Qualquer logo/nome de entidade hardcoded no header

---

## 7. Plano de Atualização do Logo/Avatar no Sidebar

### 7.1 Problema atual

O sidebar provavelmente exibe o logo da aplicação (produto) fixo, sem refletir a entidade contextual — organização, clube, competição ou jogador.

### 7.2 Comportamento desejado por contexto

| Contexto | Topo do Sidebar | Subtítulo |
|----------|----------------|-----------|
| **Organization** | Logo da organização | "Organização" |
| **Club** | Logo/escudo do clube | Nome da org-pai |
| **Competition** | Logo/emblema da competição | Nome da org |
| **Player** | Avatar do jogador | Clube atual |
| **Admin / sem contexto** | Logo do produto | "Painel Admin" |

### 7.3 Implementação — `SidebarEntityHeader`

```tsx
// src/app/layouts/components/SidebarEntityHeader.tsx  (NOVO)

interface SidebarEntityHeaderProps {
  context: NavContext;
}

export function SidebarEntityHeader({ context }: SidebarEntityHeaderProps) {
  const logoSrc = context.entityLogo ?? context.entityAvatar;
  const fallback = context.entityName?.slice(0, 2).toUpperCase();

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border">
      <div className="relative h-9 w-9 shrink-0">
        {logoSrc ? (
          <img
            src={logoSrc}
            alt={context.entityName}
            className={cn(
              "h-full w-full object-cover",
              context.type === 'player' ? "rounded-full" : "rounded-md"
            )}
          />
        ) : (
          <div className={cn(
            "h-full w-full flex items-center justify-center",
            "bg-primary/10 text-primary text-sm font-semibold",
            context.type === 'player' ? "rounded-full" : "rounded-md"
          )}>
            {fallback}
          </div>
        )}
        {/* Indicador de tipo */}
        <ContextTypeBadge type={context.type} />
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight">
          {context.entityName}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          <ContextTypeLabel type={context.type} />
        </p>
      </div>

      {/* Switcher de entidade */}
      <EntitySwitcher />
    </div>
  );
}
```

### 7.4 `NavContext` — como popular

```tsx
// src/app/layouts/components/sidebar-utils.ts  (ATUALIZAR)

export function resolveNavContext(
  pathname: string,
  tenantData: TenantData,
  authUser: AuthUser
): NavContext {
  // /org/:id → type: 'organization'
  if (pathname.startsWith('/org/')) {
    const orgId = extractId(pathname, 'org');
    const org = tenantData.organizations.find(o => o.id === orgId);
    return {
      type: 'organization',
      entityId: orgId,
      entityName: org?.name ?? '',
      entityLogo: org?.logoUrl,
      accentColor: org?.brandColor,
    };
  }

  // /club/:id → type: 'club'
  if (pathname.startsWith('/club/')) {
    const clubId = extractId(pathname, 'club');
    const club = tenantData.clubs.find(c => c.id === clubId);
    return {
      type: 'club',
      entityId: clubId,
      entityName: club?.name ?? '',
      entityLogo: club?.logoUrl,
    };
  }

  // /competition/:id → type: 'competition'
  if (pathname.startsWith('/competition/')) {
    const compId = extractId(pathname, 'competition');
    const comp = tenantData.competitions.find(c => c.id === compId);
    return {
      type: 'competition',
      entityId: compId,
      entityName: comp?.name ?? '',
      entityLogo: comp?.logoUrl,
    };
  }

  // /player/:id → type: 'player'
  if (pathname.startsWith('/player/')) {
    return {
      type: 'player',
      entityId: authUser.playerId ?? '',
      entityName: authUser.displayName,
      entityAvatar: authUser.avatarUrl,
    };
  }

  // Fallback
  return {
    type: 'admin',
    entityId: '',
    entityName: 'Painel Admin',
  };
}
```

### 7.5 `EntitySwitcher` — troca de contexto

Botão no canto do `SidebarEntityHeader` que abre um popover com:
- Organizações disponíveis para o usuário
- Clubes vinculados
- Perfil de jogador (se houver)

---

## 8. Plano de Execução — Prioridade

### Sprint 1 — Fundação (sem breaking changes)
- [ ] Criar `src/types/navigation.ts` com `NavItem` e `NavContext`
- [ ] Criar `src/components/ui/kpi-card.tsx` (promover de organizations)
- [ ] Criar `src/components/ui/page-skeleton.tsx` (unificar skeletons)
- [ ] Remover `OrganizationErrorState` → usar `error-states.tsx`
- [ ] Criar `src/modules/players/constants/navigation.tsx`
- [ ] Eliminar `clubs/services/transfers-reexport.ts`

### Sprint 2 — Sidebar & Header
- [ ] Implementar `SidebarEntityHeader` com logo/avatar contextual
- [ ] Implementar `resolveNavContext` em `sidebar-utils.ts`
- [ ] Refatorar `DashboardHeader` — eliminar `NotificationsDropdown` duplicado
- [ ] Adicionar `GlobalSearch` no topbar
- [ ] Padronizar breadcrumb dinâmico

### Sprint 3 — Consolidação de páginas duplicadas
- [ ] Unificar Transfer pages (Create, Detail, List) com prop `actorType`
- [ ] Unificar Player create pages
- [ ] Resolver `PlayerSettingsPage` vs `PlayerDashboardSettingsPage`
- [ ] Mover `CompetitionDashboardPage` para `competitions/pages/`
- [ ] Integrar `OrganizationLineupSubmissionsPage` e `ClubMatchLineupManagerPage` na navegação

### Sprint 4 — Remoção de Empty States específicos
- [ ] Auditar uso de `ClubEmptyState`, `OrganizationEmptyState`, `CompetitionEmptyState`, `PlayerEmptyState`
- [ ] Substituir por `<EmptyState />` genérico com props
- [ ] Remover arquivos específicos

### Sprint 5 — Onboarding unificado
- [ ] Criar `OnboardingRouter` que decide entre org/player onboarding
- [ ] Consolidar guards (`OnboardingGuard` + `PlayerOnboardingGuard`)
- [ ] Resolver `PendingOnboardingRedirect`

---

## 9. Checklist de Arquivos para Remover

```
REMOVER:
src/modules/clubs/services/transfers-reexport.ts
src/modules/clubs/components/ClubEmptyState.tsx          (substituir por EmptyState genérico)
src/modules/organizations/components/OrganizationEmptyState.tsx
src/modules/competitions/components/CompetitionEmptyState.tsx
src/modules/players/components/PlayerEmptyState.tsx
src/modules/organizations/components/OrganizationErrorState.tsx
src/modules/players/pages/PlayerCreatePage.tsx           (manter DashboardPlayerCreatePage)
src/modules/transfers/pages/TransferCreatePage.tsx       (manter versões org/club com actorType)
src/modules/transfers/pages/TransferDetailPage.tsx       (idem)
src/modules/transfers/pages/TransfersListPage.tsx        (idem)

MOVER:
src/modules/dashboards/pages/CompetitionDashboardPage.tsx
  → src/modules/competitions/pages/CompetitionDashboardPage.tsx

CRIAR:
src/types/navigation.ts
src/components/ui/kpi-card.tsx
src/components/ui/page-skeleton.tsx
src/modules/players/constants/navigation.tsx
src/app/layouts/components/SidebarEntityHeader.tsx
src/app/layouts/components/EntitySwitcher.tsx
src/app/layouts/components/GlobalSearch.tsx
src/app/layouts/components/DashboardBreadcrumb.tsx
src/modules/notifications/pages/NotificationSettingsPage.tsx
```

---

## 10. Padrão Visual — Referência de Consistência

Todos os dashboards devem seguir a mesma estrutura de layout:

```
┌── DashboardLayout ──────────────────────────────────────────┐
│  ┌─ Sidebar ──────┐  ┌─ Main ───────────────────────────┐  │
│  │ SidebarEntity  │  │  DashboardHeader                  │  │
│  │ Header         │  │  ┌─ Page Content ───────────────┐ │  │
│  │ ─────────────  │  │  │  PageTitle + actions          │ │  │
│  │ NavItem        │  │  │  ─────────────────────────── │ │  │
│  │ NavItem        │  │  │  KpiCards row (3-4 cards)     │ │  │
│  │ NavItem ●      │  │  │  ─────────────────────────── │ │  │
│  │ NavItem        │  │  │  Main content (table/grid)    │ │  │
│  │ NavGroup       │  │  └───────────────────────────────┘ │  │
│  │ NavItem        │  └───────────────────────────────────  │  │
│  │ ─────────────  │                                        │  │
│  │ UserFooter     │                                        │  │
│  └────────────────┘                                        │  │
└────────────────────────────────────────────────────────────┘
```

**Regras:**
1. Todo dashboard abre com KPI cards (3–4, responsivos em grid)
2. Empty states sempre com ação primária clara
3. Skeletons sempre presentes durante loading (nunca spinner sozinho)
4. Breadcrumb sempre visível no header para contextos aninhados (ex: Competition > Match > Detail)
5. O logo/avatar do sidebar reflete SEMPRE a entidade do contexto atual
