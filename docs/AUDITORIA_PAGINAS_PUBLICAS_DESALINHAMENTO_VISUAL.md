# AUDITORIA (Parte 2) — Desalinhamento Visual das Páginas Públicas

**Documento:** `AUDITORIA_PAGINAS_PUBLICAS_DESALINHAMENTO_VISUAL.md`
**Data:** 2026-07-16
**Escopo:** Páginas públicas de listagem e detalhe — `/clubs`, `/players`, `/competitions`, `/organizations` — e as respetivas páginas de gestão associadas
**Continuação de:** `AUDITORIA_SIDEBAR_NAVEGACAO_DASHBOARDS.md`

---

# 1. Resumo Executivo

Os quatro domínios públicos principais (Clubes, Jogadores, Competições, Organizações) foram claramente construídos em **momentos diferentes por padrões diferentes**, e nunca foram unificados visualmente. O resultado é que a mesma "família" de páginas (lista → detalhe) parece pertencer a três ou quatro produtos distintos consoante o domínio que se visita.

| Página de Lista | Hero/Cabeçalho | Tipografia do título | i18n | Paginação | Grid |
|---|---|---|---|---|---|
| `/clubs` (`ClubListPage`) | Gradiente radial + cartão de stats | `font-title-lg text-4xl md:text-5xl` | ❌ Não | ✅ Sim (manual, com contagem) | `sm:grid-cols-2 xl:grid-cols-3`, `gap-md` |
| `/players` (`PlayerListPage`) | Gradiente radial + cartão de stats (idêntico a Clubs) | `font-title-lg text-4xl md:text-5xl` | ✅ Sim (`useTranslation`) | ✅ Sim | `sm:grid-cols-2 xl:grid-cols-3`, `gap-md` |
| `/competitions` (`CompetitionListPage`) | **Nenhum** — apenas badge + `<h1>` simples | `text-3xl font-semibold` (sem classe de tipografia do DS) | ❌ Não | ❌ **Não existe** (busca tudo, filtra no cliente) | **Nenhuma grid** — lista vertical (`space-y-md`) |
| `/organizations` (`OrganizationListPage`) | `.glow-bg`/`.glow-circle` (CSS legado da landing page) | `font-display-lg text-4xl tracking-tight` | ❌ Não | ❌ **Não existe** | `md:grid-cols-2 lg:grid-cols-3`, `gap-lg` |

Nenhuma das quatro páginas partilha o mesmo "molde" de página de lista, apesar de resolverem exatamente o mesmo problema de produto (pesquisar + filtrar + listar um recurso público).

---

# 2. Achado #1 — Três sistemas de "hero" de página em coexistência

### A) Padrão "gradiente radial" (Clubs, Players — o mais recente e mais polido)

```tsx
<div className="relative overflow-hidden">
  <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[28rem]
       bg-[radial-gradient(circle_at_top_left,rgba(66,153,225,0.20),transparent_40%),
           radial-gradient(circle_at_top_right,rgba(17,94,89,0.16),transparent_38%),
           linear-gradient(180deg,rgba(7,16,29,0.94),rgba(7,16,29,0.08))]" />
  <div className="container py-xl space-y-xl">
    <section className="grid gap-lg rounded-[2rem] border ... md:grid-cols-[1.4fr_0.9fr]">
      ...badge, título, stats em Card...
    </section>
```

### B) Padrão "glow circles" (Organizations — herdado da Landing Page antiga)

```tsx
<div className="glow-bg">
  <div className="glow-circle glow-1" />
  <div className="glow-circle glow-2" />
</div>
<div className="mx-auto max-w-7xl space-y-lg px-gutter py-xl">
```
`.glow-bg` / `.glow-circle` são classes CSS puras definidas em `src/index.css`, pensadas originalmente para a Landing Page (fundo com blur de 150px). É um sistema de decoração de fundo **anterior** ao padrão de gradiente radial inline usado em Clubs/Players, e continua a co-existir só porque ninguém regressou a esta página depois de criar o novo padrão.

### C) Sem hero nenhum (Competitions)

```tsx
<div className="space-y-xl p-xl">
  <div className="space-y-md">
    <div className="inline-flex ... badge">Competições</div>
    <h1 className="text-3xl font-semibold text-on-surface">Competições</h1>
    <p className="max-w-2xl text-on-surface-variant">...</p>
  </div>
```
Não há decoração de fundo, não há cartão de estatísticas, não há o "storytelling" visual que Clubs/Players/Organizations têm. Parece uma página de admin interno, não uma página pública de descoberta.

### Recomendação

Extrair um componente partilhado `PublicListHero` (título, badge, descrição, 2-3 stats opcionais, decoração de fundo) usado pelas 4 páginas, com o padrão (A) como base — é o mais trabalhado visualmente e já está em 2 módulos.

---

# 3. Achado #2 — Três sistemas de "hero de detalhe" em coexistência

| Página de Detalhe | Padrão visual |
|---|---|
| `ClubDetailPage` | Cartão único `rounded-[2rem]` com backdrop-blur, avatar 24x24, badges de estado, sem imagem de banner |
| `PlayerDetailPage` | Idêntico ao de Clube (mesmo cartão `rounded-[2rem]`) — **este par está bem alinhado** |
| `CompetitionDetailPage` | Usa `CompetitionHeader`: barra com `border-b` + fundo `bg-gradient-to-br from-surface-container to-surface-container-high`, ícone quadrado 16x16 + badge — sem cartão flutuante, sem avatar |
| `OrganizationDetailPage` | Banner full-bleed de 64-80 (`h-64 md:h-80`) com imagem de fundo, avatar **sobreposto** ao banner (estilo "capa de perfil" tipo Instagram/LinkedIn) + ainda reintroduz `.glow-bg`/`.glow-circle` por cima |

Três abordagens de hero (cartão flutuante / barra plana com gradiente / banner com avatar sobreposto) para o mesmo conceito de "perfil de uma entidade". Um utilizador que navegue de `/clubs/:id` para `/competitions/:id` e depois para `/organizations/:slug` vê três layouts de cabeçalho estruturalmente diferentes, não apenas com cores diferentes.

---

# 4. Achado #3 — Larguras de contentor e espaçamento vertical inconsistentes

| Página | Largura máxima | Espaçamento vertical |
|---|---|---|
| Club (lista e detalhe) | `container` (token do Tailwind) | `space-y-xl` |
| Player (lista e detalhe) | `container` | `space-y-xl` |
| Organization (lista) | `max-w-7xl` | `space-y-lg` |
| Organization (detalhe) | `max-w-7xl` | `space-y-lg` |
| Competition (lista) | *(nenhuma — full width dentro do layout pai)* | `space-y-xl` |
| Competition (detalhe) | `max-w-6xl` | `space-y-lg` |
| Competition (rankings/suspensões/schedule/registo) | `max-w-2xl` / `max-w-3xl` / `max-w-4xl` (varia por página!) | `space-y-xl` |

Não existe um único componente `PageContainer`/`ContentWidth` reutilizado — cada página escolhe o seu próprio `max-w-*` "a olho". Isto faz com que a largura de leitura mude visivelmente ao navegar entre secções da mesma competição (ex.: o detalhe da competição é `max-w-6xl`, mas ao entrar em "Configurações" ou "Suspensões" da mesma competição a largura salta para `max-w-2xl`/`max-w-3xl`).

---

# 5. Achado #4 — Duplicação de sistema de design: `glass-card` (CSS) vs `Card` (componente)

`OrganizationListPage.tsx` usa a classe CSS legada diretamente:
```tsx
<div className="glass-card flex flex-col items-center justify-between gap-md border border-outline-variant/30 p-md md:flex-row">
```
Enquanto `ClubListPage.tsx` e `CompetitionListPage.tsx` usam o componente do Design System:
```tsx
<Card variant="flat" padding="none">
  <CardContent className="grid gap-md p-lg ...">
```
Isto é exatamente o padrão já identificado nas auditorias anteriores do repositório (`docs/AUDITORIA FRONTEND/*.md`) para o módulo Players e para as páginas de autenticação — confirma-se aqui que **Organizations também não migrou** para o Design System em todas as suas secções, apesar de módulos vizinhos (Clubs, Competitions) já o terem feito.

---

# 6. Achado #5 — Tipografia de títulos de página sem token único

```
Clubs:        font-title-lg text-4xl text-on-surface md:text-5xl
Players:      font-title-lg text-4xl text-on-surface md:text-5xl
Organizations: font-display-lg text-4xl tracking-tight text-primary
Competitions: text-3xl font-semibold text-on-surface   ← nem usa classe custom do DS
```

`tailwind.config.ts` já define famílias tipográficas nomeadas (`headline-lg`, `display-lg`, `title-md`, etc.) mas não existe uma que sirva exclusivamente para "título de página de listagem pública" — cada equipa escolheu a que tinha à mão. Recomenda-se decidir uma classe única (ex. `font-title-lg`, já usado em 2 de 4 módulos) e aplicar às restantes.

---

# 7. Achado #6 — Paginação real existe em metade dos módulos

- `ClubListPage` e `PlayerListPage`: paginação funcional (server-side, `page`/`page_size`, contadores "Página X de Y", botões Anterior/Seguinte desabilitados nos limites).
- `OrganizationListPage` e `CompetitionListPage`: **sem paginação** — o hook busca a lista completa (`usePublicOrganizations()`, `useCompetitions()`) e qualquer filtragem é feita inteiramente no cliente sobre o array já carregado.

Isto não é apenas uma inconsistência visual — é uma **inconsistência funcional** que vai piorar com o crescimento de dados (o guia `04_API_GUIDELINES.md` exige paginação obrigatória em listagens, secção 9 e 33). Do ponto de vista do utilizador, porém, o sintoma visível é: em Clubs/Players há um rodapé de navegação de páginas; em Organizations/Competitions a lista simplesmente "acaba" sem indicação de quantos itens existem ao todo além dos já carregados.

---

# 8. Achado #7 — Páginas de gestão de Competição não têm sidebar (ao contrário de Clube)

Comparando a estrutura de rotas:

- As páginas de gestão do **Clube** (`ClubSettingsPage`, `ClubMembersPage`, `ClubDocumentsPage`, `ClubSponsorsPage`, `ClubTransfersPage`) estão todas envolvidas em `<DashboardLayout>` com sidebar persistente (ver Parte 1 da auditoria).
- As páginas de gestão da **Competição** (`CompetitionSettingsPage`, `CompetitionRegistrationPage`, `CompetitionSchedulePage`, `CompetitionRankingsPage`, `CompetitionSuspensionsPage`) são registadas em `contentRoutes.tsx` apenas dentro de `<ProtectedRoute>`, **sem `DashboardLayout` nem sidebar** — cada uma é uma página solitária com só um link "Voltar à Competição" no topo.

Consequência direta para a experiência: um administrador de competição que esteja em "Calendário" e queira ir para "Suspensões" **tem de voltar à página de detalhe da competição e escolher a aba de novo** — não há navegação lateral direta como existe para o equivalente em Clube. Isto reforça a perceção de inconsistência de navegação já registada na Parte 1 desta auditoria, agora também nas páginas públicas/de gestão de competição.

### Recomendação
Ou (a) envolver as páginas de gestão de competição num `DashboardLayout` com sidebar própria (mesmo padrão usado em `clubs`/`organizations`), ou (b) se a decisão de produto for manter a navegação por abas dentro do detalhe da competição (que já existe em `CompetitionDetailPage` via `Tabs`), então **as páginas de gestão separadas deviam deixar de existir como rotas próprias** e passar a ser conteúdo dessas abas — hoje coexistem os dois padrões ao mesmo tempo (abas E páginas soltas), o que é redundante.

---

# 9. Consolidado de Prioridades

| Prioridade | Ação | Ficheiros |
|---|---|---|
| 1 | Criar `PublicListHero` partilhado e aplicar às 4 páginas de lista | `ClubListPage`, `PlayerListPage`, `CompetitionListPage`, `OrganizationListPage` |
| 2 | Substituir `.glow-bg`/`.glow-circle` por gradiente radial nas páginas de Organizations (alinhar com Clubs/Players) | `OrganizationListPage`, `OrganizationDetailPage` |
| 3 | Unificar o hero de detalhe (escolher o cartão `rounded-[2rem]` como padrão único) para Competition e Organization | `CompetitionDetailPage`, `CompetitionHeader`, `OrganizationDetailPage` |
| 4 | Substituir `glass-card` (CSS) por `<Card>` (componente) em Organizations | `OrganizationListPage.tsx` |
| 5 | Padronizar `max-w-*` e `space-y-*` num único `PageContainer` | Todas as páginas de detalhe/gestão de Competition |
| 6 | Padronizar a tipografia do título principal (`font-title-lg`) em Organizations e Competitions | `OrganizationListPage`, `CompetitionListPage` |
| 7 | Implementar paginação real (server-side) em Organizations e Competitions | `OrganizationListPage`, `CompetitionListPage`, respetivos hooks/serviços |
| 8 | Decidir entre sidebar de gestão de competição vs. abas no detalhe — eliminar a duplicação atual | `contentRoutes.tsx`, páginas de gestão de `competitions` |

Estes 8 pontos, em conjunto com o plano de ação da Parte 1 (navegação e sidebars dos dashboards), cobrem a totalidade do sintoma reportado: inconsistência de itens de menu, links que não navegam corretamente, e desalinhamento visual entre `/clubs`, `/players`, `/competitions` e `/organizations`.
