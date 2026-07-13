# Comparativo: Páginas Públicas vs. Módulos Autenticados

**Data:** 2026-07-12  
**Objetivo:** Identificar inconsistências de padrão/implementação entre a camada pública (LandingPage, LoginPage, etc.) e a camada autenticada (Players, Clubs, Organizations, Competitions).

---

## 1. Matriz de Conformidade Cross-Module

### 1.1 — Design System & Styling

| Aspecto | Landing/Public | Players | Clubs | Organizations | Padrão Documentado |
|---------|---|---|---|---|---|
| **Design System (Tailwind)** | ❌ Presumido CSS legado | ⚠️ Parcial (Create/Settings OK, List/Detail não) | ✅ OK | ✅ OK | ✅ Use DS |
| **Componentes UI (Button, Card, Badge)** | ⚠️ Esperado em Auth, não em Landing | ✅ Parcial | ✅ Sim | ✅ Sim | ✅ Use componentes reutilizáveis |
| **Tokens CSS únicos** | ⚠️ Presumido (`--color-primary`, etc.) | ⚠️ Sim (`players-*` em index.css) | ✅ Migrado | ✅ Migrado | ❌ Não permitido |
| **Layout Grid/Flexbox consistente** | ❓ Desconhecido | ⚠️ Mix de CSS e Tailwind | ✅ Tailwind | ✅ Tailwind | ✅ Use Tailwind |
| **Dark mode support** | ❓ Desconhecido | ❌ Nenhum | ✅ Sim (toggleá em theme-store) | ✅ Sim | ✅ Via theme-store.ts |

**Conclusão:** Páginas públicas e Players estão ambas **atrás**, enquanto Clubs/Organizations já foram **corrigidas**. Isto sugere que houve um esforço de unificação em Clubs/Organizations que ainda não foi propagado a Players, e as páginas públicas não tiveram oportunidade de beneficiar.

---

### 1.2 — Formulários & Validação

| Aspecto | Landing/Public | Players | Clubs | Organizations | Padrão |
|---------|---|---|---|---|---|
| **React Hook Form (RHF)** | ✅ Esperado (Login, Register, Forgot) | ✅ Create/Settings | ✅ Sim | ✅ Sim | ✅ RHF + Zod obrigatório |
| **Zod schemas** | ✅ Esperado (auth.schema.ts) | ✅ player.schema.ts | ✅ club.schema.ts | ✅ organization.schema.ts | ✅ Todas formas |
| **Validação custom (regex, async)** | ❓ Desconhecido | ✅ Email, password, unique name | ✅ Logo URL, email | ✅ Email | ✅ Via Zod custom rules |
| **Error messages (traduzidas)** | ⚠️ PT-only, não i18n | ⚠️ PT-only, não i18n | ⚠️ PT-only | ⚠️ PT-only | ❌ Nenhum i18n (app-wide issue) |
| **Submit handlers (mutações)** | ✅ Esperado (useAuthLogin, etc.) | ✅ Via hooks/mutations | ✅ Via hooks | ✅ Via hooks | ✅ Use service layer + hooks |

**Conclusão:** Formulários têm a **estratégia certa** (RHF+Zod) em todos os módulos. Implementação esperada consistente. Error messages ainda em PT (problema app-wide, não específico de público).

---

### 1.3 — Data Fetching & Caching

| Aspecto | Landing/Public | Players | Clubs | Organizations | Padrão |
|---------|---|---|---|---|---|
| **Query client (TanStack/React Query)** | ❓ Presumido (QueryProvider em app) | ✅ Sim (usePlayerQueries) | ✅ Sim | ✅ Sim | ✅ TanStack Query para tudo |
| **Hooks pattern (use + verb)** | ✅ Esperado (useAuthLogin, etc.) | ✅ usePlayerQueries, usePlayerMutations | ✅ Sim | ✅ Sim | ✅ Hooks-first |
| **Service layer (API calls)** | ✅ Esperado (auth.api.ts) | ✅ services/index.ts | ✅ club.api.ts | ✅ organization.api.ts | ✅ Serviços puros |
| **Query key factory** | ❓ Desconhecido | ✅ playerKeys | ✅ clubKeys | ✅ organizationKeys | ✅ userKeys factory |
| **Cache invalidation** | ❓ Desconhecido | ✅ Sim (via `invalidateQueries`) | ✅ Sim | ✅ Sim | ✅ Invalidar após mutação |

**Conclusão:** Padrão estabelecido e bem documentado. Páginas públicas (autenticação) devem seguir o mesmo — presume-se que sim, mas sem confirmação.

---

### 1.4 — Componentes & Reutilização

| Aspecto | Landing/Public | Players | Clubs | Organizations | Padrão |
|---------|---|---|---|---|---|
| **Index.ts para re-exportar componentes** | ✅ Sim (pages/, components/index.ts) | ✅ Sim | ✅ Sim | ✅ Sim | ✅ Índices de re-export em todos os dirs |
| **Componentes compartilhados (Button, Card, etc.)** | ⚠️ Esperado em public components | ⚠️ Parcial (some custom) | ✅ Usa componentes reutilizáveis | ✅ Usa componentes reutilizáveis | ✅ Minimize componentes únicos |
| **Evitar duplicação (e.g., dois `PlayerCard`)** | ⚠️ Desconhecido (risco)| ❌ Confirmado duplicado | ✅ OK | ✅ OK | ❌ Zero duplicação permitida |
| **Layout components (PageLayout, CardLayout)** | ❓ Desconhecido | ❓ Desconhecido | ✅ Via Grid/Card | ✅ Via Grid/Card | ✅ Componentes layout comuns |

**Conclusão:** Players confirmou duplicação de `PlayerCard` (uma versão exportada, uma inline em página). Risco semelhante em Landing (duas versões de Hero Section?). Isto é um anti-padrão documentado mas ainda não erradicado.

---

### 1.5 — Tipos & TypeScript

| Aspecto | Landing/Public | Players | Clubs | Organizations | Padrão |
|---------|---|---|---|---|---|
| **Types by module (players/types/, clubs/types/, etc.)** | ❌ Sem tipos de página pública? | ✅ player.types.ts | ✅ club.types.ts | ✅ organization.types.ts | ✅ Tipos por feature |
| **Extensão de tipos base (e.g., PlayerDetail extends Player)** | ❓ Desconhecido | ✅ PlayerDetail extends Player | ✅ ClubDetail extends Club | ✅ OrganizationDetail | ✅ Hierarquia clara |
| **Uso de `unknown` ou `any` sem justificativa** | ❓ Desconhecido | ❌ Nenhum (bem tipado) | ❌ Nenhum | ❌ Nenhum | ❌ Proibido per `01_CODING_STANDARDS.md` |
| **Tipos globais vs. feature-scoped** | ❓ Desconhecido | ✅ Separados | ✅ Separados | ✅ Separados | ✅ Feature-scoped por padrão |

**Conclusão:** Padrão bem estabelecido em módulos autenticados. Páginas públicas devem ter tipos estruturados para auth/landing payloads (`AuthPayload`, `UserProfile`, etc.).

---

### 1.6 — Internacionalização (i18n)

| Aspecto | Landing/Public | Players | Clubs | Organizations | Padrão |
|---------|---|---|---|---|---|
| **i18n Provider (I18nProvider)** | ❓ Presumido em PublicLayout | ⚠️ Não verificado | ⚠️ Não verificado | ⚠️ Não verificado | ✅ I18nProvider em AppProvider |
| **useTranslation() em componentes** | ❌ Não (presume-se zero) | ❌ Zero | ❌ Zero | ❌ Zero | **❌ App-wide issue: ZERO i18n** |
| **useTranslation() em páginas** | ❌ Presumido não | ❌ Nenhuma | ❌ Nenhuma | ❌ Nenhuma | **❌ App-wide issue** |
| **Exception: Navigation.tsx** | ✅ Usa useTranslation() | — | — | — | ⚠️ Apenas Navigation tem i18n (outlier) |
| **i18n namespace structure** | ❌ Não criado | ❌ Não criado | ❌ Não criado | ❌ Não criado | ✅ Esperado por feature |

**Conclusão:** **CRÍTICO**: Zero i18n em toda a aplicação exceto Navigation.tsx. Isto é uma lacuna arquitectural ao nível de toda a app, não uma falha específica de páginas públicas. Páginas públicas deveriam ser as **primeiras** a ter i18n (PT/EN/ES/PT-BR), mas estão entre as **últimas** porque ninguém tem.

---

### 1.7 — Testes

| Aspecto | Landing/Public | Players | Clubs | Organizations | Padrão |
|---------|---|---|---|---|---|
| **Testes unitários (pages, components)** | ❌ Zero | ❌ Zero | ❌ Zero | ❌ Zero | ✅ >70% coverage esperado |
| **Testes de integração (fluxos)** | ❌ Zero | ❌ Zero | ❌ Zero | ❌ Zero | ✅ Login, create, edit fluxos |
| **Testes visual (snapshot, e2e)** | ❌ Zero | ❌ Zero | ❌ Zero | ❌ Zero | ✅ Regression detection |
| **Test setup (Vitest, Playwright)** | ✅ Existem ficheiros config | ✅ vitest.config.ts existe | ✅ Existe | ✅ Existe | ✅ Setup existe |
| **Cobertura reportada** | ~0% | ~0% | ~0% | ~0% | ❌ App-wide issue: zero cobertura |

**Conclusão:** **Crítico app-wide**: Nenhum módulo tem testes. Isto é um problema sistémico, não específico de público. Paginas públicas (login, register) seriam candidatos prioritários para começar (fluxos críticos).

---

### 1.8 — SEO & Meta Tags

| Aspecto | Landing/Public | Players | Clubs | Organizations | Padrão |
|---------|---|---|---|---|---|
| **Helmet/react-helmet para meta tags** | ❌ Não implementado | ❌ Não verificado | ❌ Não verificado | ❌ Não verificado | ✅ Esperado para todas |
| **Title dinâmico por página** | ❌ Presumido `Vite + React` | ❌ Presume-se genérico | ❌ Presume-se genérico | ❌ Presume-se genérico | ✅ Title por página |
| **Open Graph (og:title, og:image, etc.)** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ✅ Crítico para sharing social |
| **Canonical tags** | ❌ Não | ❓ Para `/players/:slug`? | ❓ Para `/clubs/:slug`? | ❓ Desconhecido | ✅ Importante para detalhes |
| **Schema.org (JSON-LD)** | ❌ Não | ❌ Não | ❌ Não | ❌ Não | ✅ Para buscas estruturadas |

**Conclusão:** **Crítico**: SEO não implementado em nenhuma página. Isto é uma lacuna arquitectural — nenhuma página tem meta tags dinâmicos. Páginas públicas (especialmente landing) deveriam ser prioridade #1 para SEO.

---

### 1.9 — Acessibilidade (WCAG 2.1 AA)

| Aspecto | Landing/Public | Players | Clubs | Organizations | Padrão |
|---------|---|---|---|---|---|
| **Teste com Axe DevTools** | ❌ Não realizado | ❌ Não realizado | ❌ Não realizado | ❌ Não realizado | ✅ WCAG 2.1 AA esperado |
| **Semantic HTML (nav, main, footer, headings)** | ❓ Desconhecido (presumido OK em NavFooter) | ❓ Desconhecido | ✅ Presumido OK | ✅ Presumido OK | ✅ HTML semântico |
| **Alt text em imagens** | ❓ Desconhecido | ❓ Desconhecido | ❓ Desconhecido | ❓ Desconhecido | ✅ Todas as img precisam alt |
| **ARIA labels para ícones** | ❓ Desconhecido | ❓ Desconhecido | ❓ Desconhecido | ❓ Desconhecido | ✅ Ícones sem texto precisam aria-label |
| **Contraste de cor (4.5:1 texto)** | ❓ Presumido falha (em Pricing/FAQ coloridos) | ❓ Desconhecido | ✅ Presumido OK (DS) | ✅ Presumido OK (DS) | ✅ Mínimo 4.5:1 |

**Conclusão:** **Crítico app-wide**: Acessibilidade nunca foi auditada em nenhum módulo. Presume-se que módulos com Design System (Clubs, Organizations) estão OK, mas sem confirmação. Páginas públicas (Landing, Login) e Players (CSS legado) têm risco elevado.

---

## 2. Tabela de Status Consolidada

```
┌─────────────────────────────────────────────────────────────────────┐
│                 ASPECTO                │ Público │ Players │ Clubs │ Orgs │
├────────────────────────────────────────┼─────────┼─────────┼───────┼──────┤
│ Design System (Tailwind + DS)          │    ❌   │   ⚠️    │  ✅   │  ✅  │
│ Formulários (RHF+Zod)                  │    ✅   │   ✅    │  ✅   │  ✅  │
│ Data fetching (TanStack Query)         │    ✅   │   ✅    │  ✅   │  ✅  │
│ TypeScript (bem tipado)                │    ❓   │   ✅    │  ✅   │  ✅  │
│ Zero duplicação de componentes         │    ❌   │   ❌    │  ✅   │  ✅  │
│ i18n (useTranslation)                  │    ❌   │   ❌    │  ❌   │  ❌  │
│ SEO (meta tags dinâmicos)              │    ❌   │   ❌    │  ❌   │  ❌  │
│ Acessibilidade (WCAG 2.1 AA)           │    ❌   │   ❌    │  ❌   │  ❌  │
│ Testes (unit, integration, visual)     │    ❌   │   ❌    │  ❌   │  ❌  │
│ Performance (Core Web Vitals)          │    ❌   │   ❌    │  ❓   │  ❓  │
│ Documentação (comentários, storybook) │    ❌   │   ❌    │  ❌   │  ❌  │
│ Index exports (re-export pattern)      │    ✅   │   ✅    │  ✅   │  ✅  │
└────────────────────────────────────────┴─────────┴─────────┴───────┴──────┘

LEGENDA:
✅ = Implementado e confirmado
⚠️  = Parcial (alguns componentes OK, outros não)
❌ = Não implementado ou falho
❓ = Desconhecido (não auditado)
```

---

## 3. Problemas Sistémicos (App-Wide)

Isto não é específico de páginas públicas — é um padrão que afeta toda a aplicação:

### 3.1 — Zero i18n

**Afeta:** Tudo (público, autenticado, dashboard).

**Status:** `I18nProvider` está pronto em `AppProvider.tsx`, mas nenhuma página/componente o usa exceto `Navigation.tsx`. Isto é um **setup incompleto** — a infraestrutura está 10% feita.

**Custo de conclusão:** ~2-3 dias (criar namespaces, expandir `useTranslation()` em todos os lugares, configurar fallback language).

**Impacto:** Alto — limita market reach a Portugal.

### 3.2 — Zero Testes

**Afeta:** Tudo (público, autenticado, dashboard).

**Status:** Nenhum ficheiro `.test.ts(x)` em nenhum módulo. Setup de `vitest.config.ts` existe, `@testing-library/react` provavelmente instalado, mas zero testes escritos.

**Custo de conclusão:** ~4-5 semanas (começar com smoke tests, depois cobertura progressiva).

**Impacto:** Médio-Alto — regressões visuais, bugs silenciosos, confiabilidade reduzida.

### 3.3 — Zero SEO

**Afeta:** Principalmente público (landing, detalhe recursos), mas também autenticado (dashboards não rankam, mas pode importar internamente).

**Status:** Nenhuma página tem meta tags dinâmicos, sitemap, robots.txt, ou schema.org.

**Custo de conclusão:** ~2-3 dias (instalar react-helmet, criar template OG, gerar sitemap).

**Impacto:** Alto para conversão inicial, crítico para público.

### 3.4 — Acessibilidade Não Auditada

**Afeta:** Tudo (público, autenticado).

**Status:** Nenhuma página foi testada com Axe, leitores de ecrã, ou ferramentas de acessibilidade.

**Custo de conclusão:** ~2-3 semanas (audit + correcção) depende de severidade.

**Impacto:** Legal (GDPR, ADA), ético, reputacional.

---

## 4. Priorização Consolidada

### Ordem Recomendada Geral (App-Wide):

1. **i18n** (2-3 dias) — Prepara para expansão internacional, baixo impacto técnico.
2. **SEO** (2-3 dias) — Crítico para conversão, retorno de investimento.
3. **Design System unificação** (3-5 dias) — Elimina dívida técnica, melhora manutenibilidade.
4. **Testes** (4-5 semanas, paralelo) — Começa com smoke tests, escalona.
5. **Acessibilidade** (2-3 semanas, paralelo) — Crítico para conformidade legal.

### Para Páginas Públicas Especificamente:

1. **Design System** (semana 1) — Páginas públicas são a vitrine, tem que parecer polida.
2. **i18n** (semana 2) — Linguas = conversão.
3. **SEO** (semana 2) — Meta tags + Open Graph.
4. **Acessibilidade** (semana 3) — Compliance legal.
5. **Testes** (semana 3-4) — Fluxos críticos (login, register).

---

## 5. Conclusão Comparativa

**Páginas públicas não são piores do que módulos autenticados — ambos estão igualmente atrás em:
- i18n
- Testes
- SEO
- Acessibilidade

**Páginas públicas têm um único problema exclusivo:**
- Duplicação de Design System (CSS legado vs. Tailwind) — mas isto também afeta Players.

**Módulos autenticados (Clubs, Organizations) já foram parcialmente corrigidos:**
- Design System unificado
- TypeScript bem tipado
- Estrutura de componentes clara

**Recomendação:** Tratar páginas públicas + Players **em paralelo** para Design System (eliminam a mesma duplicação), depois expandir i18n/SEO/Testes a toda a app.
