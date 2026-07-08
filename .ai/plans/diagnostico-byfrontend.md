# Diagnóstico de Implementação — byfrontend (BolaYetu)
> Repositório: `pdrfrncsco/byfrontend` · Branch: `master` · Data: 2026-07-08

---

## Resumo Executivo

| Dimensão | Estado | Detalhe |
|---|---|---|
| **Build de produção** | ✅ OK | `vite build` conclui sem erros |
| **Type-check TypeScript** | ✅ OK | `tsc --noEmit` sem erros |
| **Testes (75 total)** | ⚠️ 2 falhas | Falhas corrigíveis nos testes |
| **ESLint** | ⚠️ 2 erros, 63 avisos | Erros em `error-states.tsx` |
| **Bundle size** | ⚠️ Aviso | Chunk principal com 826 kB (> 500 kB recomendado) |
| **Módulos implementados** | ✅ Completo | auth, clubs, competitions, organizations, players, transfers, dashboards, onboarding, notifications |
| **Dívida técnica crítica** | ⚠️ 1 item | `isAdmin` hardcoded como `false` em `CompetitionDetailPage` |

O projecto compila e os testes passam na sua grande maioria. Os problemas encontrados são pontuais e corrigíveis.

---

## 1. Falhas nos Testes

### 1.1 `ClubSettingsPage` — `Cannot read properties of undefined (reading 'isPending')`

**Ficheiro:** `src/tests/modules/clubs/pages/club-dashboard-settings.test.tsx` (linha 36)

**Causa:** O mock do módulo inclui `useUploadClubLogo: vi.fn()`, mas nunca configura o seu valor de retorno antes do render. Quando o componente monta, `uploadLogoMutation` é `undefined`, e `.isPending` explode.

```ts
// No mock do vi, o hook retorna undefined por defeito.
// O componente faz isto na linha 204:
loading={uploadLogoMutation.isPending}  // 💥 uploadLogoMutation = undefined
```

**Correção:**
```ts
// No teste "renders club settings form with data and triggers submit":
import { useUploadClubLogo } from '@/modules/clubs/hooks/useClubs'

vi.mocked(useUploadClubLogo).mockReturnValue({
  isPending: false,
  mutate: vi.fn(),
} as any)
```

---

### 1.2 `OrganizationDashboardPage` — `Found multiple elements with the text: /Clubes/i`

**Ficheiro:** `src/tests/modules/organizations/pages/organization-management.test.tsx` (linha 131)

**Causa:** O componente renderiza "Clubes" em três lugares distintos (parágrafo de descrição, label do KPI card, e link "Clubes Associados"). O teste usa `getByText` com regex `/Clubes/i`, que corresponde a todos os três.

**Correção:**
```ts
// Substituir a linha 131 por uma query mais específica:
expect(screen.getAllByText(/Clubes/i).length).toBeGreaterThan(0)
// ou usar getByRole / getByTestId para o elemento correto:
expect(screen.getByText('Clubes')).toBeInTheDocument() // texto exato, sem regex
```

---

## 2. Erros ESLint

**Ficheiro:** `src/components/ui/error-states.tsx` (linhas 46 e 60)

```
error  'className' is missing in props validation  react/prop-types
```

**Causa:** Componentes internos dentro do ficheiro recebem `className` como prop mas sem declaração explícita de tipos (ou com `React.FC` em vez de interface com `className?: string`).

**Correção:** Adicionar `className?: string` à interface de props dos dois subcomponentes afectados, ou desabilitar `react/prop-types` para ficheiros TypeScript (dado que o TS já valida isso).

```ts
// Em .eslintrc.cjs, adicionar:
'react/prop-types': 'off'  // desactivar globalmente (TypeScript cobre isso)
```

---

## 3. Aviso de Bundle Size

O chunk principal `index-DrpGaj4B.js` tem **826 kB minificado** (226 kB gzip).

**Causas prováveis:**
- `framer-motion` (animações) — pesada por natureza
- `pdfjs-dist` — biblioteca PDF muito grande
- Todas as páginas não-club estão no bundle principal (só as páginas de clube usam `lazy`)

**Recomendação:** Aplicar `lazy()` também às páginas de competitions, players, organizations e dashboards.

```ts
// Em App.tsx — aplicar o mesmo padrão já usado para clubs:
const CompetitionListPage = lazy(() => import('@/modules/competitions/pages/CompetitionListPage'))
const PlayerListPage = lazy(() => import('@/modules/players/pages/PlayerListPage'))
const OrganizationDashboardPage = lazy(() => import('@/modules/organizations/pages/OrganizationDashboardPage'))
// etc.
```

---

## 4. Dívida Técnica

### 4.1 `isAdmin` hardcoded como `false` em `CompetitionDetailPage`

**Ficheiro:** `src/modules/competitions/pages/CompetitionDetailPage.tsx` (linha 285)

```ts
// TODO: derive isAdmin from auth state/context when available
const isAdmin = false
```

Isto significa que **nenhum utilizador vê os controlos de administração** na página de detalhe de competição (editar resultados, gerar calendário, gerir eventos de jogo). É a falha funcional mais impactante.

**Correção:**
```ts
import { useAuth } from '@/app/providers'
import { ROLES } from '@/constants/roles-permissions'

// Dentro do componente:
const { user } = useAuth()
const isAdmin = user?.roles?.some(r => 
  [ROLES.ADMIN, ROLES.FEDERATION_ADMIN, ROLES.LEAGUE_ADMIN].includes(r)
) ?? false
```

### 4.2 `generateSchedule` sem implementação de UI

```ts
onGenerateSchedule={() => { /* TODO: open schedule modal */ }}
```

O botão "Gerar Calendário" está visível mas sem acção. A API (`COMPETITIONS.GENERATE_SCHEDULE`) existe no `routes.ts` e o hook `useCompetitionPhase3` já implementa a chamada. Falta apenas o modal de confirmação.

### 4.3 `useEffect` com dependência em falta no `AuthProvider`

```
warning  React Hook useEffect has a missing dependency: 'loadSession'
```

`loadSession` é recriada a cada render mas não está incluída no array de dependências. Isso pode causar re-renders inesperados em certas condições de race condition durante o login.

**Correção simples:**
```ts
const loadSession = useCallback(async (token: string, userStr: string) => {
  // ... body existente
}, [])  // sem dependências — funções puras

useEffect(() => {
  const savedToken = localStorage.getItem('bolayetu_token')
  const savedUser = localStorage.getItem('bolayetu_user')
  if (savedToken && savedUser) {
    loadSession(savedToken, savedUser)
  } else {
    setLoading(false)
  }
}, [loadSession])
```

---

## 5. Avisos React Router v6 → v7

Em todos os testes aparecem:
```
⚠️ React Router Future Flag Warning: v7_startTransition
⚠️ React Router Future Flag Warning: v7_relativeSplatPath
```

Não são erros, mas sinalizam que a migração para v7 vai introduzir mudanças de comportamento. Para silenciar os avisos e preparar a migração:

```tsx
// Em App.tsx — trocar BrowserRouter por:
<BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
```

---

## 6. Estado dos Módulos

| Módulo | Serviço API | Hooks React Query | Páginas | Testes |
|---|---|---|---|---|
| **auth** | ✅ | ✅ | ✅ | ✅ |
| **clubs** | ✅ | ✅ (18 hooks) | ✅ (8 páginas) | ✅ (maioria) |
| **organizations** | ✅ | ✅ | ✅ (7 páginas) | ✅ |
| **competitions** | ✅ | ✅ | ✅ (2 páginas) | — |
| **players** | ✅ | ✅ | ✅ (2 páginas) | — |
| **dashboards** | ✅ (com mock flag) | ✅ | ✅ (5 variantes) | — |
| **onboarding** | ✅ | ✅ | ✅ (4 passos) | — |
| **notifications** | ✅ | ✅ | ✅ | — |
| **transfers** | ✅ | ✅ | (via clubs) | — |

---

## 7. Pontos Positivos

- **Arquitectura modular bem definida** — cada módulo tem `services/`, `hooks/`, `pages/`, `types/`, `schemas/`, `constants/` separados.
- **Envelope API resiliente** — o padrão `unwrapData`/`unwrapPaginated` em `clubs/services/index.ts` lida com múltiplos formatos de resposta da API backend.
- **Dashboard mock flag** — `VITE_ENABLE_DASHBOARD_MOCK=true` permite desenvolvimento visual sem backend disponível.
- **Lazy loading nos clubs** — as 8 páginas de clube já usam `lazy()`, o padrão certo.
- **Skeleton states e empty states** — componentes de loading e estados vazios implementados em clubs e organizations.
- **TypeScript sem erros** — zero erros de tipos em todo o projecto.

---

## Prioridades de Acção

| Prioridade | Acção | Esforço |
|---|---|---|
| 🔴 **Alta** | Corrigir mock de `useUploadClubLogo` no teste | 5 min |
| 🔴 **Alta** | Corrigir query `/Clubes/i` no teste de organizations | 5 min |
| 🟠 **Média** | Implementar `isAdmin` via `useAuth` em `CompetitionDetailPage` | 30 min |
| 🟠 **Média** | `useCallback` em `loadSession` no `AuthProvider` | 15 min |
| 🟡 **Baixa** | Adicionar `future flags` ao `BrowserRouter` | 2 min |
| 🟡 **Baixa** | Desactivar `react/prop-types` no ESLint (TS já cobre) | 2 min |
| 🟡 **Baixa** | Lazy load em competitions, players, organizations | 1h |
| ⚪ **Futuro** | Modal de confirmação para "Gerar Calendário" | 2-3h |
