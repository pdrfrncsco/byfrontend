# Auditoria de Conformidade do Frontend

**Data:** 2026-07-10
**Escopo:** `src/` (frontend React/TypeScript) comparado com `docs/00-overview`, `docs/01-architecture` e `docs/02-development`, e cruzado com os diagnósticos anteriores (`docs/diagnostico-frontend.md`, `.ai/plans/diagnostico-byfrontend.md`, `docs/fase-d-concluida.md`, `docs/AUDITORIA_CONFORMIDADE_BACKEND_2026-07-04.md`).

---

## 1. Resumo Executivo

O frontend evoluiu substancialmente desde os diagnósticos anteriores (jun/jul 2026). Existe hoje um Design System próprio funcional (`src/components/ui`), oito módulos de domínio com services/hooks/pages/types/schemas, testes automatizados em `clubs` e `organizations`, e estados de loading/erro/vazio consistentes nas páginas mais recentes (clubs, competitions, organizations).

Ainda assim, há **desvios estruturais reais face a `05_FRONTEND_ARCHITECTURE.md` e `03_FRONTEND_GUIDE.md`** que não são cosméticos: a gestão de estado global obrigatória (Zustand) simplesmente não é usada em lado nenhum do código; a internacionalização (i18next, obrigatória por doc) está instalada mas não aplicada (uma única chave `welcome`); o PWA (`vite-plugin-pwa`, decisão ADR-006 do `01_SYSTEM_ARCHITECTURE.md`) não está configurado; `Chart.js`, decidido como biblioteca oficial de gráficos, nunca é importado (os dashboards desenham barras em SVG/`div` manuais); e `isAdmin` está hardcoded como `false` em pelo menos 5 páginas de competição, ocultando permanentemente as ações administrativas a qualquer utilizador, incluindo administradores reais.

| Dimensão | Estado | Nota |
|---|---|---|
| Estrutura por Feature (`components/pages/hooks/services/types/schemas/constants`) | ✅ Bom | Presente em quase todos os módulos |
| Estado global (Zustand) | ❌ Não implementado | Dependência instalada, zero utilização |
| Estado do servidor (TanStack Query) | ✅ Bom | Uso consistente e correto |
| Formulários (RHF + Zod) | ✅ Bom | Padrão respeitado nos formulários recentes |
| Design System interno | ⚠️ Parcial | Cobre primitivos base; faltam Dialog/Drawer/Tooltip/Avatar/Pagination |
| i18n | ❌ Quase inexistente | i18next instalado, textos 100% hardcoded em PT |
| PWA | ❌ Ausente | `vite-plugin-pwa` não está no projeto |
| Chart.js | ❌ Não usado | Gráficos são SVG/HTML manuais |
| Multi-Tenant (frontend) | ⚠️ Parcial | Resolução client-side por subdomínio/query, sem alinhamento total com o middleware de tenant do backend |
| RBAC no frontend | ❌ Crítico | `isAdmin` hardcoded `false` em 5+ páginas |
| Testes | ⚠️ Parcial | Bom em `clubs`/`organizations`; zero em `competitions`, `players`, `transfers`, `notifications`, `dashboards` |
| Acessibilidade | ⚠️ Parcial | Alguns `aria-*`, mas sem auditoria sistemática |
| Segurança de token | ⚠️ Aceitável com reservas | JWT em `localStorage`, acesso direto fora da service layer |

`npm run type-check` e a suite de testes existente continuam a ser a base estável mencionada nos diagnósticos anteriores — nada nesta auditoria indica regressão nesse plano.

---

## 2. Conformidade Arquitetural Geral

### 2.1 O que está bem implementado

- **Feature-Based Architecture** (`05_FRONTEND_ARCHITECTURE.md` §5): `src/modules/{organizations,clubs,players,competitions,transfers,notifications,dashboards,onboarding,auth,shared}` seguem o padrão `components/hooks/pages/services/types/schemas/constants/index.ts`.
- **Fluxo oficial de comunicação** (`Component → Hook → Service → API`): respeitado. Não há `fetch()`/`axios` direto em componentes — sempre `src/lib/api-client.ts` ou `src/lib/create-api-client.ts` por trás de um `services/*.api.ts`.
- **TanStack Query**: usado de forma consistente para todo o estado remoto, com `queryKey` factories bem organizadas (`clubKeys`, `organizationKeys`, `competitionKeys`, `matchKeys`, `standingKeys`, `lineupKeys`, `reportKeys`). Invalidação de cache correta após mutações.
- **React Hook Form + Zod**: aplicado em login, registo, onboarding, definições de organização/clube, documentos, patrocinadores, transferências.
- **Estados de UI**: skeletons, empty states e error states (403/404/422/500) implementados como componentes reutilizáveis (`src/components/ui/empty-state.tsx`, `error-states.tsx`) e já adotados em `ClubDetailPage`, `ClubListPage`, `OrganizationListPage`, `OrganizationDetailPage`.
- **Design System embrionário**: `Button`, `Card`, `Badge`, `Input`, `Select`, `Textarea`, `Label`, `FormField`, `Table`/`DataTable` (TanStack Table), `Tabs`, `Skeleton` — todos com CVA (`class-variance-authority`), consistente com `frontend-design-system` skill, embora **sem shadcn/ui real** (é uma implementação própria inspirada em shadcn, não a biblioteca).

### 2.2 Desvios estruturais

| Requisito do doc | Doc de origem | Estado real |
|---|---|---|
| Zustand para estado global (utilizador, tenant, tema, notificações) | `05_FRONTEND_ARCHITECTURE.md` §2, §11; `03_FRONTEND_GUIDE.md` §13; `01_CODING_STANDARDS.md` §16 | **Não usado.** `AuthProvider`, `TenantProvider`, `ThemeProvider` são Context API + `useState` manuais. `zustand` está em `package.json` mas nenhum `create()` existe no repo. |
| Cada módulo com `store/` e `routes.ts` | `05_FRONTEND_ARCHITECTURE.md` §6 | Nenhum módulo tem `store/`. Nenhum módulo tem `routes.ts` próprio — todas as rotas estão centralizadas em `src/App.tsx` (~300 linhas), o que viola "routes.ts" por módulo e cria um ficheiro cada vez mais difícil de manter. |
| i18n obrigatório, nunca escrever texto direto nos componentes | `03_FRONTEND_GUIDE.md` §26; `01_CODING_STANDARDS.md` §3 | `I18nProvider.tsx` define apenas a chave `welcome`. Todo o resto da interface (centenas de strings) está hardcoded em português diretamente no JSX. Não há `t()` a ser chamado em lado nenhum fora do `I18nProvider`. |
| PWA (`vite-plugin-pwa`, cache offline, atualização automática) | `01_SYSTEM_ARCHITECTURE.md` ADR-006 (indireto); `05_FRONTEND_ARCHITECTURE.md` §18; `00_PLATFORM_GUIDE.md` §12 | Ausente de `package.json` e `vite.config.ts`. Não existe manifest nem service worker. |
| Chart.js para gráficos | `05_FRONTEND_ARCHITECTURE.md` Stack; `03_FRONTEND_GUIDE.md` Stack | Não instalado nem importado. Todos os "gráficos" (`ExecutiveDashboardPage`, `FederationDashboardPage`) são barras/`<svg>` desenhadas à mão. |
| PDF.js para leitura de PDFs | Stack oficial | Instalado (`pdfjs-dist`) mas **não é importado em nenhum ficheiro do código auditado** — dependência morta, aumenta bundle sem uso. |
| Máximo de 300 linhas por componente | `01_CODING_STANDARDS.md` §13; `03_FRONTEND_GUIDE.md` §8 | Vários ficheiros excedem isso amplamente: `DashboardLayout.tsx` (~350 linhas), `OrganizationSettingsPage.tsx` (~370), `ClubSettingsPage.tsx` (~330), `App.tsx` (~330). Não são erros graves, mas são o oposto do que o guia pede — nenhum foi dividido em subcomponentes. |

---

## 3. Estado por Módulo

| Módulo | Services | Hooks | Páginas | Schemas | Testes | Observações |
|---|---|---|---|---|---|---|
| **auth** | ✅ | ✅ | ✅ (login/registo/reset) | ✅ | ⚠️ nenhum teste dedicado | Fluxo de onboarding→dashboard bem costurado (`resolvePostAuthRedirect`). |
| **organizations** | ✅ | ✅ (18+ hooks) | ✅ (7 páginas) | ✅ | ✅ Boa cobertura (dashboard, settings, members, affiliations) | Módulo mais maduro. Ver §5 para o gap de `TransferItem`. |
| **clubs** | ✅ | ✅ (25+ hooks) | ✅ (8 páginas, todas lazy-loaded) | ✅ | ✅ Boa cobertura | Módulo mais completo tecnicamente; único que usa `lazy()` no `App.tsx`. |
| **competitions** | ✅ | ✅ (Phase 3 + Advanced) | ✅ (11 páginas) | ✅ | ❌ Zero testes | Maior superfície funcional (lineups, match center, rankings, suspensions) e **maior dívida técnica** (`isAdmin` hardcoded, ver §6.1). |
| **players** | ✅ | ✅ | ✅ (list/detail) | — | ❌ Zero testes | CSS próprio fora do Tailwind (`index.css` linhas `players-*`), inconsistente com o resto do DS baseado em utilitários Tailwind + CVA. |
| **transfers** | ✅ (mínimo) | ✅ (`useTransfers`) | — (consumido via `clubs`) | — | ❌ Zero testes | Módulo "fino": não tem páginas próprias, é consumido pelo dashboard de organizações e pelas páginas de clube. |
| **notifications** | ✅ | ✅ | ✅ (bell, dropdown, página) | — | ❌ Zero testes | Sem paginação real no dropdown quando o backend já pagina; faz paginação client-side sobre uma lista já limitada. |
| **dashboards** | ✅ (com fallback de erro honesto) | ✅ | ✅ (5 variantes + selector dev) | — | ❌ Zero testes | `DashboardPageSelector` inclui uma ferramenta de dev visível em produção (`Sliders`/"DEV MODE") — deveria estar atrás de flag de ambiente, não sempre montada. |
| **onboarding** | — (usa `organizations`/`competitions`) | — | ✅ (4 passos) | — | ❌ Zero testes | Autosave funcional; mistura `resolvePostAuthRedirect` (lógica de negócio) dentro de `utils/`, aceitável mas fronteiriço com "lógica de negócio no frontend". |
| **shared** | — | — | ✅ (landing, login, 404, perfil) | — | ❌ Zero testes | `ProfilePage` só mostra 1 membership embora o tipo já preveja múltiplas — não há UI para trocar de organização apesar do backend/tipos preverem `TenantMembership[]`. |

---

## 4. Gestão de Estado — Zustand ausente (gap crítico de arquitetura)

A decisão arquitetural é explícita e repetida em três documentos (`00_PLATFORM_GUIDE.md` §12, `05_FRONTEND_ARCHITECTURE.md` §2/§11, `03_FRONTEND_GUIDE.md` §13, `01_CODING_STANDARDS.md` §16): Zustand deve gerir utilizador autenticado, tenant, tema e notificações globais.

Na prática:

- `AuthProvider.tsx` — Context + `useState`, lê/escreve diretamente `localStorage.getItem/setItem('bolayetu_token'|'bolayetu_user'|'bolayetu_refresh')` dentro do próprio provider (não numa camada de storage isolada).
- `TenantProvider.tsx` — Context + `useState`, resolve tenant no `useEffect` fazendo parsing manual de `window.location.hostname`.
- `ThemeProvider.tsx` — Context + `useState`, com side-effects diretos em `document.documentElement.classList` e `localStorage`.

Isto **funciona**, mas é o padrão que a arquitetura documentada explicitamente decidiu não usar. Consequências práticas:
1. Qualquer novo consumidor de "utilizador atual" fora da árvore de providers precisa de `useContext`, não pode usar seletores Zustand fora de componentes React (ex.: em interceptors do Axios — o `api-client.ts` já tem esse problema, acedendo a `localStorage` diretamente em vez de ler de uma store).
2. Duplicação de lógica de persistência (`localStorage`) espalhada por 3 ficheiros diferentes em vez de centralizada.
3. `queryClient.ts` (`lib/query-client.ts`) e `QueryProvider.tsx` (`app/providers/QueryProvider.tsx`) **coexistem como duas instâncias de QueryClient com configurações diferentes** (`staleTime` de 5min em ambas, mas `gcTime`/retry-delay só definidos numa) — risco de inconsistência se algum código importar o client errado.

---

## 5. Internacionalização — não implementada na prática

`I18nProvider.tsx` está corretamente montado no `AppProvider`, com `i18next-browser-languagedetector` e `fallbackLng: 'pt-AO'`. Mas o `resources` só define:

```ts
'pt-AO': { translation: { welcome: 'Bem-vindo ao BolaYetu' } }
en: { translation: { welcome: 'Welcome to BolaYetu' } }
```

Nenhum componente do código auditado chama `useTranslation()`/`t()`. Toda a UI (mais de 200 strings visíveis: labels, botões, mensagens de erro do Zod, toasts) está hardcoded em português no JSX. Isto contraria diretamente `01_CODING_STANDARDS.md` §3 ("Nenhum texto deverá ser escrito diretamente nos componentes") e bloqueia a internacionalização prevista no roadmap (`02_ROADMAP.md` v3.0 "Multi-idioma").

---

## 6. Dívida Técnica Crítica

### 6.1 `isAdmin` hardcoded como `false` — bloqueia RBAC no frontend

Confirmado em:
- `CompetitionDetailPage.tsx` — `const isAdmin = false`
- `MatchCenterPage.tsx` — `const isAdmin = false`
- `MatchLineupPage.tsx` — `const isAdmin = false`
- `MatchReportPage.tsx` — `const isAdmin = false`
- `CompetitionSuspensionsPage.tsx` — `const isAdmin = false`

Impacto: nenhum utilizador — nem sequer um `owner`/`admin` real autenticado — vê os controlos de gestão de competição (gerar calendário, editar resultados, adicionar golos, confirmar/bloquear escalações, cancelar suspensões). O backend já tem RBAC (`06_MULTITENANT_ARCHITECTURE.md`, `07_SECURITY_ARCHITECTURE.md`); o `useAuth()` já expõe `user.roles`/`user.role`. A correção é mecânica (`const { user } = useAuth(); const isAdmin = user?.roles?.some(r => ['owner','admin'].includes(r))`), mas o facto de estar hardcoded em 5 pontos distintos há vários ciclos de desenvolvimento sugere que ninguém validou o fluxo administrativo destas páginas em produção.

### 6.2 Ferramenta de desenvolvimento sempre visível

`DashboardPageSelector.tsx` monta incondicionalmente um botão flutuante "Pré-visualizar Dashboards (Ferramenta Dev)" com badge "DEV MODE" — sem qualquer verificação de `import.meta.env.DEV`. Isto **vai para produção** e permite a qualquer utilizador autenticado trocar livremente entre visões de dashboard (federação, liga, clube, executivo) que não correspondem à sua role real.

### 6.3 Envelope de API inconsistente sendo absorvido no frontend

`src/modules/clubs/services/index.ts` implementa `unwrapData`/`unwrapList`/`unwrapPaginated` para lidar com **quatro formatos diferentes** de resposta (`ApiResponse<T>`, `T` direto, `{results}` sem envelope, array puro). Isto é sintoma de que o backend não está a devolver sempre o envelope `{success, message, data}` definido em `04_API_GUIDELINES.md` §8 — o frontend está a compensar silenciosamente uma inconsistência de contrato que devia ser corrigida na origem (ver também `docs/AUDITORIA_CONFORMIDADE_BACKEND_2026-07-04.md`, achado P2 "Paginação não é uniforme").

### 6.4 Upload de media fora do DAM oficial

`08A_DIGITAL_ASSET_MANAGEMENT.md` manda que **todo** ficheiro passe por `MediaAsset`/`MediaUsage` via `/api/v1/assets`. No frontend, os uploads (`organization.api.ts::uploadLogo/uploadBanner`, `clubs/services/index.ts::uploadClubLogo/createClubDocument/createClubSponsor`) fazem `POST multipart/form-data` diretamente para endpoints específicos por módulo (`/organizations/me/logo/`, `/clubs/{slug}/documents/`, etc.), nunca para `/api/v1/media/upload`. Isto está alinhado com o que o próprio backend faz hoje (achado P1 da auditoria de backend: "DAM parcialmente contornado por ImageField legado"), portanto não é uma regressão do frontend, mas **é preciso decidir e migrar ambos os lados juntos** — o frontend não pode adotar o DAM sozinho sem endpoints correspondentes.

### 6.5 Dependência morta

`pdfjs-dist` está em `package.json` mas não é usado em nenhum lugar do código fornecido (não há `import` de `pdfjs-dist` em nenhum ficheiro `.ts`/`.tsx`). Ou é removido, ou implementa-se o visualizador de PDF (documentos de clube, relatórios) que a stack prevê.

### 6.6 Falta de troca de organização/tenant na UI

`AuthProvider.mapToUserProfile` já constrói `roles` a partir de **todas** as memberships (`${role}_${tenant_slug}` + `role`), e `TenantMembership[]` é um array no tipo. Mas `ProfilePage.tsx` só renderiza a membership ativa (`user?.tenant_id`), sem lista nem ação de troca. Um utilizador com acesso a múltiplas organizações (previsto em `06_MULTITENANT_ARCHITECTURE.md` §15 "poderá, futuramente, possuir acesso a múltiplos Tenants") não tem como trocar de contexto pela interface.

---

## 7. Segurança (frontend)

- **Token em `localStorage`** (`bolayetu_token`, `bolayetu_refresh`, `bolayetu_user`): funcional e é o padrão mais comum em SPAs, mas fica exposto a XSS se qualquer dependência de terceiros for comprometida. `07_SECURITY_ARCHITECTURE.md` não proíbe explicitamente `localStorage`, mas também não o valida como "seguro" — apenas diz "armazenar tokens de forma segura" (§25). Vale registar como risco aceite, não como conformidade.
- **Refresh de token**: `authApi.refreshToken` existe no service, mas **não há interceptor de resposta 401 que tente o refresh automaticamente** em `api-client.ts` — o interceptor atual limita-se a limpar sessão e redirecionar para `/login` em qualquer 401, mesmo que fosse recuperável com refresh token. Isto contraria `06_MULTITENANT_ARCHITECTURE.md` §14 ("Access Token de curta duração / Refresh Token rotativo") na prática: o utilizador é deslogado no primeiro 401 em vez de o token ser renovado silenciosamente.
- **RBAC de UI**: ver §6.1 — o maior risco de segurança de UX não é falta de proteção (o backend continua a validar tudo, corretamente, "nunca confiar no frontend" é respeitado), mas sim a **falta de funcionalidade** para quem deveria ter acesso administrativo.

---

## 8. Multi-Tenant no Frontend

`TenantProvider.tsx` resolve o tenant no cliente por: (1) query param `?tenant=`, depois (2) primeiro segmento do hostname se tiver ≥3 partes e não for reservado (`www`, `app`, `api`, `admin`, `cdn`, `mail`). Isto cobre o caso `faf.bolayetu.com`, mas:

- Não há fallback para `localhost`/dev com portas — em desenvolvimento local, `subdomain` será sempre `null` a menos que se use `?tenant=`, o que é aceitável mas não está documentado em lado nenhum do repo (README não menciona).
- O tenant resolvido no frontend é **puramente para branding/apresentação** (`primary_color`, `logo`, etc.) — não é enviado como header/contexto explícito nas chamadas de API; o isolamento real depende inteiramente do JWT do utilizador autenticado, o que está correto para dados privados mas gera o mesmo problema já identificado na auditoria de backend (achado P1: middleware de tenant existe mas nem toda API pública o usa como fonte de verdade).

---

## 9. Testes

Cobertura real observada (por módulo, contagem aproximada de ficheiros de teste):

| Módulo | Ficheiros de teste | Tipo |
|---|---|---|
| clubs | 6 | hooks, services, components, pages |
| organizations | 5 | hooks, services, components, pages |
| ui (design system) | 1 | error-states |
| competitions | 0 | — |
| players | 0 | — |
| transfers | 0 | — |
| notifications | 0 | — |
| dashboards | 0 | — |
| auth | 0 | — |
| onboarding | 0 | — |

O módulo com maior complexidade funcional (`competitions`: lineups, match center, relatórios, suspensões, rankings) tem **zero testes**, o que é o inverso do risco: é o módulo com mais lógica condicional (`isAdmin`, formações, validação de escalação) e por isso o que mais beneficiaria de testes de regressão.

---

## 10. Plano de Ação Recomendado

### Fase 0 — Correções críticas e de baixo esforço
1. Corrigir `isAdmin` hardcoded nas 5 páginas de `competitions`, derivando de `useAuth()`.
2. Esconder a ferramenta `DashboardPageSelector` "DEV MODE" atrás de `import.meta.env.DEV`.
3. Adicionar interceptor de refresh automático em `api-client.ts` antes de forçar logout em 401.
4. Remover `pdfjs-dist` ou implementar o visualizador de PDF que justifica a dependência.
5. Adicionar `future={{ v7_startTransition: true, v7_relativeSplatPath: true }}` ao `BrowserRouter` (avisos já identificados no diagnóstico anterior).

### Fase 1 — Alinhamento arquitetural (Zustand, i18n, PWA)
1. Migrar `AuthProvider`/`TenantProvider`/`ThemeProvider` para stores Zustand, mantendo os hooks `useAuth`/`useTenant`/`useTheme` como wrappers finos por cima da store (evita reescrever todos os consumidores).
2. Extrair persistência de `localStorage` para um módulo único (`lib/storage.ts`), consumido pela store e pelo `api-client.ts`.
3. Definir um plano mínimo de i18n: extrair pelo menos as strings de autenticação e navegação principal para `resources`, e estabelecer a convenção `t('namespace.key')` para todo código novo a partir de agora.
4. Adicionar `vite-plugin-pwa` com manifest básico, mesmo que sem cache offline agressivo inicialmente.

### Fase 2 — Fechar gaps funcionais
1. Implementar troca de organização (multi-tenant membership) na `ProfilePage`.
2. Adicionar `routes.ts` por módulo e reduzir `App.tsx` a composição de rotas importadas de cada módulo.
3. Consolidar `QueryClient` (uma única instância entre `lib/query-client.ts` e `app/providers/QueryProvider.tsx`).
4. Decidir com o backend a estratégia de unificação do envelope de API (remover a necessidade de `unwrapData`/`unwrapList`/`unwrapPaginated`).

### Fase 3 — Qualidade
1. Testes para `competitions` (prioritário, dada a complexidade), depois `players`, `transfers`, `notifications`, `dashboards`.
2. Introduzir Chart.js nos dashboards executivo/federação em vez de barras SVG manuais, cumprindo a stack oficial.
3. Dividir componentes acima de 300 linhas (`DashboardLayout`, `OrganizationSettingsPage`, `ClubSettingsPage`, `App.tsx`).
4. Auditoria de acessibilidade dedicada (labels, foco visível, navegação por teclado) nas páginas de gestão (members, documents, sponsors, transfers).

---

## 11. Conclusão

O frontend do Bolayetu está funcionalmente mais avançado do que os diagnósticos de junho/julho sugeriam — o Design System interno, os testes de `clubs`/`organizations` e os estados de erro/vazio são conquistas reais da "Fase D". No entanto, a conformidade com a arquitetura *documentada* tem lacunas que não são de polimento: a ausência total de Zustand e i18n aplicado são desvios de decisões explícitas e repetidas em múltiplos documentos oficiais, e o `isAdmin` hardcoded é um bloqueador funcional real, não apenas uma dívida técnica cosmética. A prioridade não deveria ser abrir novos módulos (transfers, news, fans continuam por implementar como páginas próprias), mas fechar estes desvios de fundação antes que mais código dependa dos padrões atuais (Context API ad-hoc, textos hardcoded, `isAdmin` sempre falso).
