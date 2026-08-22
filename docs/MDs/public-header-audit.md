# Auditoria — Header & Navegação Pública

> Versão 1.0 · Agosto 2026  
> Escopo: `PublicLayout`, `Navigation.tsx`, páginas de exploração pública

---

## 1. Estado Actual — Problemas Identificados

### 1.1 `Navigation.tsx` tem responsabilidade dupla

O componente actual serve simultaneamente:
- **Marketing (LandingPage):** links âncora (`#features`, `#pricing`, `#how-it-works`), fundo transparente com scroll-blur, CTA "Começar"
- **Exploração (listas públicas):** não implementado — faltam links de rota real para `/competitions`, `/clubs`, `/organizations`, `/players`

Estas duas necessidades têm comportamentos incompatíveis num componente único não parametrizado.

### 1.2 Links de descoberta de conteúdo ausentes

O header actual não expõe nenhum link directo para as entidades públicas do produto. Um visitante não autenticado que aterra na landing não tem forma de navegar para a lista de competições, clubes ou jogadores sem conhecer a URL de memória.

### 1.3 Sem estado autenticado no header público

Se um utilizador autenticado visita `/competitions` ou a landing, o header continua a mostrar "Entrar / Registar". Não há transição para mostrar o avatar e "Dashboard" quando existe sessão activa.

### 1.4 Rotas de exploração podem estar atrás de `ProtectedRoute`

`CompetitionListPage`, `ClubListPage`, `OrganizationListPage` e `PlayerListPage` existem como páginas mas não está confirmado que estejam em `publicRoutes.tsx`. Se estiverem apenas em `contentRoutes.tsx` (autenticadas), são inacessíveis publicamente — o que elimina o valor de descoberta.

### 1.5 Mobile sem sheet de navegação completa

`DashboardMobileMenu.tsx` existe para a área autenticada mas o header público provavelmente usa apenas um hambúrguer básico sem o grupo "Explorar" e sem estado de autenticação.

### 1.6 Sem indicador de página activa

Nenhum link do header reflecte qual a secção actual (active state), tornando a orientação difícil em páginas de lista e detalhe.

### 1.7 Footer desalinhado com o header

`Footer.tsx` provavelmente tem links de produto e legais mas não espelha a estrutura do header — sem secção "Explorar" com as mesmas entidades.

---

## 2. Arquitectura de Navegação Pública Proposta

### 2.1 Três modos do header (um componente, três variantes)

```
variant="landing"   → fundo transparente → opaco ao scroll, links âncora + Explorar dropdown
variant="explore"   → fundo sempre opaco, sem links âncora, com Explorar activo
variant="minimal"   → apenas logo + link "Voltar" (usado em /login, /register, etc.)
```

`PublicLayout` passa a variant conforme o contexto da rota. `AuthLayout` usa `variant="minimal"` directamente.

### 2.2 Estrutura de links completa

```
[Logo]   Explorar ▾   Produto ▾   Preços   Blog      [Buscar]  [Entrar]  [Registar →]
                                                                          ↑ se autenticado:
                                                                    [Dashboard →]  [Avatar]
```

**Dropdown "Explorar":**
```
┌─────────────────────────────────────────────────────┐
│  Descobrir                                          │
│  ──────────────────────────────────────────────     │
│  🏆  Competições    Ligas, taças e torneios         │
│  🏟️  Clubes         Clubes e equipas registadas     │
│  🏢  Organizações   Federações e associações        │
│  👤  Jogadores      Perfis e estatísticas           │
│  ──────────────────────────────────────────────     │
│  ✦  Ver tudo em destaque →                         │
└─────────────────────────────────────────────────────┘
```

**Dropdown "Produto":**
```
┌────────────────────────────────────────────────────┐
│  Funcionalidades   Como funciona   Testemunhos     │
│  Ecossistema       FAQ                             │
└────────────────────────────────────────────────────┘
```

### 2.3 Estado autenticado vs não-autenticado

```typescript
// Lógica de renderização da área de acções
if (isAuthenticated) {
  // Mostrar: botão "Dashboard" + avatar com dropdown
  return <AuthenticatedActions user={user} />;
} else {
  // Mostrar: "Entrar" (ghost) + "Registar" (primary)
  return <GuestActions />;
}
```

---

## 3. Rotas Públicas — Correcções Necessárias

### 3.1 Adicionar a `publicRoutes.tsx`

```tsx
// src/app/routes/slices/publicRoutes.tsx

// Rotas de exploração pública (sem ProtectedRoute)
{
  path: '/competitions',
  element: <PublicLayout variant="explore"><CompetitionListPage /></PublicLayout>
},
{
  path: '/competitions/:id',
  element: <PublicLayout variant="explore"><CompetitionDetailPage /></PublicLayout>
},
{
  path: '/clubs',
  element: <PublicLayout variant="explore"><ClubListPage /></PublicLayout>
},
{
  path: '/clubs/:id',
  element: <PublicLayout variant="explore"><ClubDetailPage /></PublicLayout>
},
{
  path: '/organizations',
  element: <PublicLayout variant="explore"><OrganizationListPage /></PublicLayout>
},
{
  path: '/organizations/:id',
  element: <PublicLayout variant="explore"><OrganizationDetailPage /></PublicLayout>
},
{
  path: '/players',
  element: <PublicLayout variant="explore"><PlayerListPage /></PublicLayout>
},
{
  path: '/players/:id',
  element: <PublicLayout variant="explore"><PlayerDetailPage /></PublicLayout>
},
```

### 3.2 Actualizar `src/constants/routes.ts`

Adicionar grupo `PUBLIC_EXPLORE`:

```typescript
export const ROUTES = {
  // ... rotas existentes

  PUBLIC_EXPLORE: {
    COMPETITIONS: '/competitions',
    COMPETITION_DETAIL: (id: string) => `/competitions/${id}`,
    CLUBS: '/clubs',
    CLUB_DETAIL: (id: string) => `/clubs/${id}`,
    ORGANIZATIONS: '/organizations',
    ORGANIZATION_DETAIL: (id: string) => `/organizations/${id}`,
    PLAYERS: '/players',
    PLAYER_DETAIL: (id: string) => `/players/${id}`,
  },
} as const;
```

---

## 4. Implementação — `PublicLayout.tsx`

```tsx
// src/app/layouts/PublicLayout.tsx

interface PublicLayoutProps {
  children: React.ReactNode;
  variant?: 'landing' | 'explore' | 'minimal';
}

export function PublicLayout({ children, variant = 'landing' }: PublicLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader variant={variant} />
      <main className={cn(
        "flex-1",
        variant === 'landing' && "pt-0",      // hero começa no topo
        variant === 'explore' && "pt-16",     // header fixo opaco
        variant === 'minimal' && "pt-14",
      )}>
        {children}
      </main>
      {variant !== 'minimal' && <Footer />}
    </div>
  );
}
```

---

## 5. Implementação — `PublicHeader` (refactor de Navigation.tsx)

### 5.1 Estrutura de ficheiros após refactor

```
src/modules/shared/components/
├── Navigation.tsx                    ← RENOMEAR para PublicHeader.tsx
├── PublicHeader.tsx                  ← novo nome
├── navigation/                       ← NOVO directório
│   ├── ExploreDropdown.tsx           ← dropdown "Explorar"
│   ├── ProductDropdown.tsx           ← dropdown "Produto"
│   ├── AuthenticatedActions.tsx      ← avatar + dashboard quando logado
│   ├── GuestActions.tsx              ← entrar + registar
│   ├── MobileNavSheet.tsx            ← sheet mobile completo
│   └── nav-items.ts                  ← constantes de links
└── Footer.tsx
```

### 5.2 `nav-items.ts`

```typescript
// src/modules/shared/components/navigation/nav-items.ts

import { Trophy, Building2, Users, User, LayoutDashboard } from 'lucide-react';
import { ROUTES } from '@/constants/routes';

export const EXPLORE_ITEMS = [
  {
    key: 'competitions',
    label: 'Competições',
    description: 'Ligas, taças e torneios',
    href: ROUTES.PUBLIC_EXPLORE.COMPETITIONS,
    icon: Trophy,
  },
  {
    key: 'clubs',
    label: 'Clubes',
    description: 'Clubes e equipas registadas',
    href: ROUTES.PUBLIC_EXPLORE.CLUBS,
    icon: Building2,
  },
  {
    key: 'organizations',
    label: 'Organizações',
    description: 'Federações e associações',
    href: ROUTES.PUBLIC_EXPLORE.ORGANIZATIONS,
    icon: Users,
  },
  {
    key: 'players',
    label: 'Jogadores',
    description: 'Perfis e estatísticas',
    href: ROUTES.PUBLIC_EXPLORE.PLAYERS,
    icon: User,
  },
] as const;

export const PRODUCT_ITEMS = [
  { key: 'features',     label: 'Funcionalidades', href: '/#features' },
  { key: 'how-it-works', label: 'Como funciona',   href: '/#how-it-works' },
  { key: 'ecosystem',    label: 'Ecossistema',      href: '/#ecosystem' },
  { key: 'testimonials', label: 'Testemunhos',      href: '/#testimonials' },
  { key: 'faq',          label: 'FAQ',              href: '/#faq' },
] as const;

export const MAIN_NAV_ITEMS = [
  { key: 'pricing', label: 'Preços', href: '/#pricing' },
  { key: 'blog',    label: 'Blog',   href: '/blog' },  // futuro
] as const;
```

### 5.3 `PublicHeader.tsx` — estrutura completa

```tsx
// src/modules/shared/components/PublicHeader.tsx

interface PublicHeaderProps {
  variant: 'landing' | 'explore' | 'minimal';
}

export function PublicHeader({ variant }: PublicHeaderProps) {
  const { user, isAuthenticated } = useAuth();
  const [scrolled, setScrolled] = useState(false);

  // Scroll listener apenas no modo landing
  useEffect(() => {
    if (variant !== 'landing') return;
    const handler = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handler, { passive: true });
    return () => window.removeEventListener('scroll', handler);
  }, [variant]);

  const isOpaque = variant !== 'landing' || scrolled;

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isOpaque
          ? "bg-background/95 backdrop-blur-md border-b border-border shadow-sm"
          : "bg-transparent",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center gap-6">

          {/* Logo */}
          <Logo variant={isOpaque ? 'default' : 'light'} />

          {/* Nav principal — desktop */}
          {variant !== 'minimal' && (
            <nav className="hidden md:flex items-center gap-1 ml-4">
              <ExploreDropdown />
              <ProductDropdown variant={variant} />
              {MAIN_NAV_ITEMS.map(item => (
                <NavLink key={item.key} href={item.href}>
                  {item.label}
                </NavLink>
              ))}
            </nav>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Acções — desktop */}
          <div className="hidden md:flex items-center gap-2">
            {variant === 'explore' && <PublicSearch />}
            {isAuthenticated
              ? <AuthenticatedActions user={user} />
              : <GuestActions />
            }
          </div>

          {/* Mobile: hambúrguer */}
          {variant !== 'minimal' && (
            <MobileNavSheet isAuthenticated={isAuthenticated} user={user} />
          )}
        </div>
      </div>
    </header>
  );
}
```

### 5.4 `ExploreDropdown.tsx`

```tsx
export function ExploreDropdown() {
  const pathname = useLocation().pathname;
  const isExploreActive = EXPLORE_ITEMS.some(i => pathname.startsWith(i.href));

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem>
          <NavigationMenuTrigger
            className={cn(isExploreActive && "text-primary")}
          >
            Explorar
          </NavigationMenuTrigger>
          <NavigationMenuContent>
            <div className="w-[420px] p-4">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Descobrir
              </p>
              <div className="grid grid-cols-2 gap-2">
                {EXPLORE_ITEMS.map(item => (
                  <NavigationMenuLink key={item.key} asChild>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-start gap-3 rounded-lg p-3",
                        "hover:bg-accent transition-colors",
                        pathname.startsWith(item.href) && "bg-accent",
                      )}
                    >
                      <div className="mt-0.5 rounded-md bg-primary/10 p-1.5">
                        <item.icon className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <div className="text-sm font-medium">{item.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.description}
                        </div>
                      </div>
                    </Link>
                  </NavigationMenuLink>
                ))}
              </div>
              <Separator className="my-3" />
              <Link
                to="/explore"
                className="flex items-center gap-2 text-sm text-primary hover:underline"
              >
                <Star className="h-3.5 w-3.5" />
                Ver tudo em destaque
              </Link>
            </div>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}
```

### 5.5 `AuthenticatedActions.tsx`

```tsx
export function AuthenticatedActions({ user }: { user: AuthUser }) {
  return (
    <div className="flex items-center gap-2">
      <Button asChild variant="ghost" size="sm">
        <Link to={ROUTES.DASHBOARD}>
          <LayoutDashboard className="h-4 w-4 mr-1.5" />
          Dashboard
        </Link>
      </Button>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src={user.avatarUrl} />
              <AvatarFallback>{user.initials}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>
            <div className="text-sm font-medium">{user.displayName}</div>
            <div className="text-xs text-muted-foreground">{user.email}</div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link to={ROUTES.PROFILE}>Perfil</Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem variant="destructive" onClick={logout}>
            Terminar sessão
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
```

### 5.6 `MobileNavSheet.tsx`

```tsx
export function MobileNavSheet({ isAuthenticated, user }) {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="md:hidden">
          <Menu className="h-5 w-5" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80 p-0">
        <div className="flex flex-col h-full">

          {/* Header do sheet */}
          <div className="p-4 border-b">
            <Logo />
          </div>

          {/* Links */}
          <nav className="flex-1 overflow-y-auto p-4 space-y-6">

            {/* Explorar */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Explorar
              </p>
              <div className="space-y-1">
                {EXPLORE_ITEMS.map(item => (
                  <SheetClose asChild key={item.key}>
                    <Link
                      to={item.href}
                      className="flex items-center gap-3 rounded-md px-3 py-2.5 hover:bg-accent text-sm"
                    >
                      <item.icon className="h-4 w-4 text-muted-foreground" />
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>

            {/* Produto */}
            <div>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                Produto
              </p>
              <div className="space-y-1">
                {PRODUCT_ITEMS.map(item => (
                  <SheetClose asChild key={item.key}>
                    <Link
                      to={item.href}
                      className="flex items-center px-3 py-2 text-sm hover:bg-accent rounded-md"
                    >
                      {item.label}
                    </Link>
                  </SheetClose>
                ))}
              </div>
            </div>
          </nav>

          {/* Footer do sheet */}
          <div className="p-4 border-t space-y-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-3 mb-3">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={user.avatarUrl} />
                    <AvatarFallback>{user.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                <SheetClose asChild>
                  <Button asChild className="w-full" variant="outline">
                    <Link to={ROUTES.DASHBOARD}>Ir para o Dashboard</Link>
                  </Button>
                </SheetClose>
              </>
            ) : (
              <>
                <SheetClose asChild>
                  <Button asChild className="w-full" variant="outline">
                    <Link to={ROUTES.LOGIN}>Entrar</Link>
                  </Button>
                </SheetClose>
                <SheetClose asChild>
                  <Button asChild className="w-full">
                    <Link to={ROUTES.REGISTER}>Registar gratuitamente</Link>
                  </Button>
                </SheetClose>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
```

---

## 6. Footer — Actualização

O `Footer.tsx` deve espelhar a estrutura do header e incluir a secção "Explorar":

```
┌─────────────────────────────────────────────────────────────────┐
│  [Logo]  Plataforma de gestão desportiva                       │
│                                                                 │
│  Explorar          Produto           Empresa                   │
│  Competições       Funcionalidades   Sobre                      │
│  Clubes            Como funciona     Blog                       │
│  Organizações      Preços            Contacto                   │
│  Jogadores         FAQ               Política de Privacidade   │
│                    Testemunhos       Termos de Uso             │
│                                                                 │
│  © 2026 · Todos os direitos reservados                        │
└─────────────────────────────────────────────────────────────────┘
```

---

## 7. SEO & Meta por Página Pública

Cada página de lista pública precisa de meta tags correctas via `useSeo`:

| Página | Title | Description |
|--------|-------|-------------|
| `/competitions` | Competições · [Produto] | Descubra ligas, taças e torneios registados |
| `/clubs` | Clubes · [Produto] | Explore clubes e equipas da plataforma |
| `/organizations` | Organizações · [Produto] | Federações e associações desportivas |
| `/players` | Jogadores · [Produto] | Perfis públicos e estatísticas de jogadores |
| `/competitions/:id` | [Nome da competição] · [Produto] | dinâmico |
| `/clubs/:id` | [Nome do clube] · [Produto] | dinâmico |

---

## 8. Plano de Execução

### Sprint 1 — Rotas & Layout (sem UI nova)
- [ ] Mover `CompetitionListPage`, `ClubListPage`, `OrganizationListPage`, `PlayerListPage` para `publicRoutes.tsx`
- [ ] Actualizar `PublicLayout` com prop `variant`
- [ ] Adicionar `PUBLIC_EXPLORE` a `src/constants/routes.ts`
- [ ] Verificar que `ProtectedRoute` não bloqueia essas rotas

### Sprint 2 — Header refactor
- [ ] Renomear `Navigation.tsx` → `PublicHeader.tsx`
- [ ] Criar directório `src/modules/shared/components/navigation/`
- [ ] Implementar `nav-items.ts`
- [ ] Implementar `ExploreDropdown.tsx` com `NavigationMenu` do shadcn
- [ ] Implementar `ProductDropdown.tsx`
- [ ] Implementar `AuthenticatedActions.tsx`
- [ ] Implementar `GuestActions.tsx`
- [ ] Implementar `MobileNavSheet.tsx` com Sheet do shadcn
- [ ] Integrar estado de scroll no modo `landing`
- [ ] Passar `variant` correcto em cada uso do `PublicLayout`

### Sprint 3 — Footer & SEO
- [ ] Actualizar `Footer.tsx` com secção "Explorar"
- [ ] Adicionar `useSeo` a cada página de lista pública
- [ ] Verificar canonical URLs

### Sprint 4 — Polish
- [ ] Active states nos links (highlight da secção actual)
- [ ] `PublicSearch` inline no header para páginas de explore
- [ ] Testes de acessibilidade do menu (keyboard navigation, ARIA)
- [ ] Verificar comportamento em dark mode

---

## 9. Ficheiros a Criar / Modificar

```
CRIAR:
src/modules/shared/components/PublicHeader.tsx
src/modules/shared/components/navigation/
src/modules/shared/components/navigation/ExploreDropdown.tsx
src/modules/shared/components/navigation/ProductDropdown.tsx
src/modules/shared/components/navigation/AuthenticatedActions.tsx
src/modules/shared/components/navigation/GuestActions.tsx
src/modules/shared/components/navigation/MobileNavSheet.tsx
src/modules/shared/components/navigation/nav-items.ts

MODIFICAR:
src/app/layouts/PublicLayout.tsx          → adicionar prop variant
src/app/routes/slices/publicRoutes.tsx    → adicionar rotas de exploração
src/constants/routes.ts                   → adicionar PUBLIC_EXPLORE
src/modules/shared/components/Footer.tsx → adicionar secção Explorar
src/modules/shared/pages/index.ts        → exportar novas páginas se necessário

DEPRECAR (após migração):
src/modules/shared/components/Navigation.tsx  → substituído por PublicHeader.tsx
```
