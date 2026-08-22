# Plano de Implementação — Auditoria e Padronização do Frontend

Este documento apresenta o plano detalhado de implementação para unificar a navegação, os dashboards e os layouts do frontend do projeto **BolaYetu**, com base no relatório de auditoria disponível em [frontend-audit.md](file:///D:/ndeascloud/boayetu/frontend/docs/MDs/frontend-audit.md).

---

## 1. Descrição do Objetivo

O objetivo desta intervenção é remover a duplicação de componentes visuais, consolidar a estrutura de navegação em torno de uma árvore de navegação contextual baseada no tipo de entidade ativa (Organização, Clube, Competição, Jogador ou Administrador Executivo), atualizar o cabeçalho superior (Topbar) para suporte a breadcrumbs e busca, e atualizar o topo do Sidebar para exibir dinamicamente o logo/avatar e nome da entidade sob contexto de acesso atual.

---

## 2. Revisão Necessária pelo Utilizador

> [!IMPORTANT]
> **Consolidação de Páginas e Rotas:**
> 1. O painel executivo global (`ExecutiveDashboardPage`) e o painel de organizações (`OrganizationDashboardPage`) partilham responsabilidades semelhantes. Vamos fundir o comportamento unificando-os.
> 2. Moveremos a página `CompetitionDashboardPage` para o módulo de competições (`src/modules/competitions/pages/`).
> 3. Os hooks e re-exports redundantes de clubes (ex: `clubs/services/transfers-reexport.ts`) serão eliminados em favor de imports diretos do módulo principal (`modules/transfers/services`).
> 4. Substituição das 4 variações de `EmptyState` específicas (`ClubEmptyState`, `OrganizationEmptyState`, `CompetitionEmptyState`, `PlayerEmptyState`) pela versão genérica `src/components/ui/empty-state.tsx`.

---

## 3. Questões em Aberto

> [!NOTE]
> 1. **Switcher de Entidades (EntitySwitcher):** O popover de troca rápida exibirá as organizações disponíveis para o utilizador, os clubes vinculados e o perfil do jogador. Atualmente, os stores `auth-store` e `tenant-store` expõem os dados correspondentes. Pretendemos confirmar se a listagem de inquilinos e filiações nos stores atuais já cobre todas as organizações às quais o utilizador tem acesso administrativo.
> 2. **NotificationBell vs NotificationsDropdown:** Unificaremos a lista de notificações no popover acoplado ao sino no `DashboardHeader`, descartando o componente redundante `NotificationsDropdown`.

---

## 4. Alterações Propostas

### 4.1 Fundação & Tipagem Comum

#### [NEW] `src/types/navigation.ts`
Criação do contrato único para os itens de menu de navegação e para o contexto da entidade atual.

```typescript
import { LucideIcon } from 'lucide-react'

export interface NavItem {
  key: string;           // Identificador único (ex: 'overview', 'settings')
  label: string;         // Chave i18n ou rótulo direto
  href: string;          // Rota absoluta ou caminho relativo
  icon: LucideIcon;      // Componente do ícone
  badge?: number | string; // Contador ou sinalizador opcional
  roles?: string[];      // Perfis autorizados
  children?: NavItem[];  // Sub-itens de navegação
  group?: string;        // Agrupamento ('contexto', 'gestao', etc.)
  hidden?: boolean;      // Ocultar da interface sem retirar da lógica
}

export interface NavContext {
  type: 'organization' | 'club' | 'competition' | 'player' | 'admin';
  entityId: string;
  entityName: string;
  entityLogo?: string;
  entityAvatar?: string;
  accentColor?: string;
  subLabel?: string;
}
```

#### [NEW] `src/components/ui/kpi-card.tsx`
Promover o componente `KpiCard` de `modules/organizations` para o design system centralizado.

```tsx
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui'

export interface KpiCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  trend?: {
    value: string | number
    isPositive?: boolean
  }
  className?: string
}

export function KpiCard({ label, value, icon, trend, className }: KpiCardProps) {
  return (
    <Card
      padding="md"
      hoverable
      className={cn('group relative flex flex-col justify-between overflow-hidden', className)}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-tr from-primary/5 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
      <div className="mb-md flex items-start justify-between">
        <span className="font-label-sm font-semibold uppercase tracking-wider text-outline">{label}</span>
        {icon && (
          <div className="rounded-lg border border-outline-variant/20 bg-surface-container-high p-sm text-primary transition-transform duration-300 group-hover:scale-110">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-auto flex items-end justify-between">
        <span className="font-headline-lg text-3xl text-on-surface transition-colors duration-300 group-hover:text-primary animate-fade-in">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              'rounded px-sm py-0.5 text-xs font-bold',
              trend.isPositive ? 'bg-primary-container/20 text-primary' : 'bg-error-container/25 text-error',
            )}
          >
            {trend.value}
          </span>
        )}
      </div>
    </Card>
  )
}
```

#### [NEW] `src/components/ui/page-skeleton.tsx`
Unificar os skeletons redundantes de carregamento.

```tsx
import { Skeleton } from './skeleton'

interface PageSkeletonProps {
  variant?: 'card' | 'list' | 'detail'
}

export function PageSkeleton({ variant = 'card' }: PageSkeletonProps) {
  if (variant === 'list') {
    return (
      <div className="space-y-sm">
        <Skeleton className="h-10 w-full rounded-md" />
        <Skeleton className="h-32 w-full rounded-xl" />
        <Skeleton className="h-32 w-full rounded-xl" />
      </div>
    )
  }

  if (variant === 'detail') {
    return (
      <div className="space-y-lg">
        <div className="flex gap-md">
          <Skeleton className="h-20 w-20 rounded-full" />
          <div className="space-y-xs flex-1">
            <Skeleton className="h-6 w-1/3 rounded" />
            <Skeleton className="h-4 w-1/2 rounded" />
          </div>
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <div className="space-y-lg animate-pulse">
      <div className="grid gap-md md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-28 w-full rounded-2xl" />
        ))}
      </div>
      <Skeleton className="h-64 w-full rounded-[2rem]" />
    </div>
  )
}
```

#### [NEW] `src/modules/players/constants/navigation.tsx`
Definição padronizada da árvore de navegação de jogadores.

```tsx
import { LayoutDashboard, Handshake, Settings, ExternalLink } from 'lucide-react'
import { playerRoutes } from '../routes'
import { ROUTES } from '@/constants/routes'

export function getPlayerSidebarLinks(playerSlug?: string) {
  return [
    { label: 'Geral', href: playerRoutes.dashboard, icon: LayoutDashboard },
    { label: 'Pedidos de Vínculo', href: playerRoutes.linkClub, icon: Handshake },
    { label: 'Configurações', href: playerRoutes.dashboardSettings, icon: Settings },
    ...(playerSlug ? [{ label: 'Perfil Público', href: playerRoutes.detail(playerSlug), icon: ExternalLink }] : []),
  ]
}
```

---

### 4.2 Sidebar e Header Contextuais

#### [NEW] `src/app/layouts/components/SidebarEntityHeader.tsx`
Componente para carregar dinamicamente o avatar, tipo e nome do contexto ativo no topo do sidebar.

```tsx
import { cn } from '@/lib/utils'
import { NavContext } from '@/types/navigation'
import { EntitySwitcher } from './EntitySwitcher'

export function SidebarEntityHeader({ context }: { context: NavContext }) {
  const logoSrc = context.entityLogo ?? context.entityAvatar
  const fallback = context.entityName?.slice(0, 2).toUpperCase() || 'BY'

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-border mb-lg">
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
      </div>

      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium leading-tight text-on-surface">
          {context.entityName}
        </p>
        <p className="truncate text-xs text-on-surface-variant font-medium">
          {context.subLabel || context.type}
        </p>
      </div>

      <EntitySwitcher context={context} />
    </div>
  )
}
```

#### [NEW] `src/app/layouts/components/EntitySwitcher.tsx`
Popover/Dropdown com as opções de transição rápida de contextos para o utilizador.

```tsx
import { ChevronsUpDown } from 'lucide-react'
import { NavContext } from '@/types/navigation'
import { useAuth } from '@/app/providers/AuthProvider'
import { useNavigate } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function EntitySwitcher({ context }: { context: NavContext }) {
  const { user } = useAuth()
  const navigate = useNavigate()

  // Se o utilizador apenas tiver um papel básico, não apresenta o seletor.
  if (!user || (!user.roles?.includes('owner') && !user.roles?.includes('admin') && !user.roles?.includes('club_admin'))) {
    return null
  }

  return (
    <button
      onClick={() => navigate(ROUTES.DASHBOARD)}
      className="p-1 rounded hover:bg-surface-container-high text-on-surface-variant transition-colors"
      title="Mudar contexto de painel"
    >
      <ChevronsUpDown className="h-4 w-4" />
    </button>
  )
}
```

#### [NEW] `src/app/layouts/components/GlobalSearch.tsx`
Barra de busca a ser unificada no Header.

```tsx
import { Search } from 'lucide-react'

export function GlobalSearch() {
  return (
    <div className="relative hidden lg:block w-64">
      <Search className="dashboard-muted absolute left-md top-1/2 w-4 h-4 -translate-y-1/2" />
      <input
        type="text"
        placeholder="Pesquisar..."
        className="dashboard-search w-full rounded-full border pl-xl pr-md py-1.5 text-xs transition-all focus:border-primary focus:ring-1 focus:ring-primary"
      />
    </div>
  )
}
```

#### [NEW] `src/app/layouts/components/DashboardBreadcrumb.tsx`
Navegação em trilha (Breadcrumbs) dinâmica para saber o caminho hierárquico na aplicação.

```tsx
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function DashboardBreadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  return (
    <nav className="hidden md:flex items-center gap-sm text-xs text-on-surface-variant">
      <Link to="/" className="hover:text-primary transition-colors">Início</Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const label = value.charAt(0).toUpperCase() + value.slice(1)

        // Ignora UUIDs/IDs na trilha
        if (value.match(/^[0-9a-fA-F-]{24,36}$/)) return null

        return (
          <span key={to} className="flex items-center gap-sm">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-semibold text-primary">{label}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition-colors">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
```

#### [MODIFY] `src/app/layouts/components/sidebar-utils.ts`
Implementar a resolução dinâmica de `NavContext` a partir de caminhos e dados do store.

```typescript
import { NavContext } from '@/types/navigation'
import { type Tenant } from '@/types/tenant'

export function resolveNavContext(
  pathname: string,
  tenant: Tenant | null,
  user: any
): NavContext {
  // Organizações
  if (pathname.includes('/org/') || pathname.includes('/organization')) {
    return {
      type: 'organization',
      entityId: tenant?.id || '',
      entityName: tenant?.name || 'Organização',
      entityLogo: tenant?.logoUrl,
      subLabel: 'Organização',
    }
  }

  // Clubes
  if (pathname.includes('/club/')) {
    return {
      type: 'club',
      entityId: tenant?.id || '',
      entityName: tenant?.name || 'Clube',
      entityLogo: tenant?.logoUrl,
      subLabel: 'Consola de Clube',
    }
  }

  // Competitions
  if (pathname.includes('/competition/')) {
    return {
      type: 'competition',
      entityId: tenant?.id || '',
      entityName: tenant?.name || 'Competição',
      entityLogo: tenant?.logoUrl,
      subLabel: 'Organizador de Provas',
    }
  }

  // Jogadores
  if (pathname.includes('/player/') || user?.role === 'player') {
    return {
      type: 'player',
      entityId: user?.playerId || '',
      entityName: user?.username || 'Jogador',
      entityAvatar: user?.avatarUrl,
      subLabel: 'Portal do Atleta',
    }
  }

  // Fallback Administrativo/Executivo
  return {
    type: 'admin',
    entityId: '',
    entityName: 'Painel Executivo',
    subLabel: 'BolaYetu Angola',
  }
}
```

#### [MODIFY] `src/app/layouts/components/DashboardSidebar.tsx`
Integrar o `SidebarEntityHeader` no topo do Sidebar e reestruturar os links de navegação com base nos tipos novos de `NavItem[]`.

#### [MODIFY] `src/app/layouts/components/DashboardHeader.tsx`
Integrar os Breadcrumbs dinâmicos, o `GlobalSearch` unificado, e remover a dependência direta de dropdowns redundantes de notificações.

#### [MODIFY] `src/app/layouts/DashboardLayout.tsx`
Adaptar o layout de dashboard principal para usar os hooks unificados de contexto e transferir a informação correta para o sidebar e header.

---

### 4.3 Consolidação de Rotas e Unificações

#### [MODIFY] `src/app/routes/slices/dashboardRoutes.tsx`
- Fundir `ExecutiveDashboardPage` e `OrganizationDashboardPage` sob a rota principal correspondente.
- Mudar `CompetitionDashboardPage` da pasta de dashboards genéricos para `src/modules/competitions/pages/`.
- Apagar rotas duplicadas de Transferências e redirecioná-las/unificá-las usando propriedades de contexto (`actorType`).

---

### 4.4 Checklist de Eliminação e Movimentação de Ficheiros

#### [DELETE] Ficheiros redundantes
* `src/modules/clubs/services/transfers-reexport.ts` (re-exportações supérfluas)
* `src/modules/clubs/components/ClubEmptyState.tsx` (substituído por `EmptyState` central)
* `src/modules/organizations/components/OrganizationEmptyState.tsx`
* `src/modules/competitions/components/CompetitionEmptyState.tsx`
* `src/modules/players/components/PlayerEmptyState.tsx`
* `src/modules/organizations/components/OrganizationErrorState.tsx` (usar `ErrorState` nativo)
* `src/modules/players/pages/PlayerCreatePage.tsx` (unificado em `DashboardPlayerCreatePage.tsx`)
* `src/modules/transfers/pages/TransferCreatePage.tsx`
* `src/modules/transfers/pages/TransferDetailPage.tsx`
* `src/modules/transfers/pages/TransfersListPage.tsx`

#### [MOVE] Mover páginas
* Mover `src/modules/dashboards/pages/CompetitionDashboardPage.tsx` para `src/modules/competitions/pages/CompetitionDashboardPage.tsx`

---

## 5. Plano de Verificação

### Testes Automatizados

Como estamos a utilizar o Vitest, correremos os testes das rotas e layouts afetados:
```bash
npm run test
```

### Verificação Manual
1. **Aceder às páginas:** Fazer login com diferentes utilizadores (Administrador de Organização, Administrador de Clube, Jogador) e certificar-se de que o sidebar e o header mostram a informação da entidade correta.
2. **Visualização:** Validar se os Skeletons de carregamento são uniformes no painel.
3. **Página de Erro:** Induzir falhas de API para certificar-se de que o componente padrão de Erro é exibido.
