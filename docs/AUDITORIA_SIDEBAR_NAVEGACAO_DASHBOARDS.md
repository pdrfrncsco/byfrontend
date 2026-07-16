# AUDITORIA — Sidebars e Navegação dos Dashboards

**Documento:** `AUDITORIA_SIDEBAR_NAVEGACAO_DASHBOARDS.md`
**Data:** 2026-07-16
**Escopo:** `src/app/layouts/DashboardLayout.tsx` e componentes associados, `src/modules/dashboards/`, sidebars de `clubs`, `organizations`, `competitions`, `players`
**Motivação:** o utilizador reporta inconsistências nos itens do sidebar e links que não apontam para as páginas corretas

---

# 1. Resumo Executivo

Foram encontradas **duas classes de problemas**, uma técnica (crítica) e uma de conteúdo/consistência (alta prioridade):

| # | Problema | Severidade | Ficheiros afetados |
|---|---|---|---|
| 1 | Sidebar e menu mobile usam `<a href>` em vez de `<Link>` do React Router | 🔴 Crítico | `DashboardSidebar.tsx`, `DashboardMobileMenu.tsx` |
| 2 | Existem **dois dashboards de Clube diferentes** competindo pelo mesmo conceito, um deles com links mortos (`#home`, `#squad`...) e dados fixos (mock) | 🔴 Crítico | `dashboards/pages/ClubDashboardPage.tsx` vs `clubs/pages/ClubDashboardPage.tsx` |
| 3 | O mesmo padrão de âncoras mortas (`#home`, `#analytics`, `#scouting`...) repete-se em Executive, Federation, League e Competition Dashboard | 🔴 Crítico | `ExecutiveDashboardPage.tsx`, `FederationDashboardPage.tsx`, `LeagueDashboardPage.tsx`, `dashboards/pages/CompetitionDashboardPage.tsx` |
| 4 | Sidebar do Clube (módulo `clubs`) tem 8 itens na página principal, mas só 6 nas subpáginas (faltam "Pedidos de Vínculo" e "Registar Jogador") | 🟠 Alto | `ClubSettingsPage`, `ClubMembersPage`, `ClubDocumentsPage`, `ClubSponsorsPage`, `ClubTransfersPage`, `ClubTransferCreatePage` |
| 5 | Ícones do sidebar repetidos (o mesmo ícone para todos os itens) nas subpáginas do Clube | 🟠 Alto | Mesmos ficheiros do item 4 |
| 6 | `PlayerDashboardSettingsPage` não inclui o link "Pedido de Vínculo ao Clube" que existe no `PlayerDashboardPage` | 🟠 Alto | `PlayerDashboardSettingsPage.tsx` |
| 7 | `ClubPlayerRegisterPage` não tem link recíproco para "Pedidos de Vínculo" (existe ao contrário) | 🟡 Médio | `ClubPlayerRegisterPage.tsx` |
| 8 | Rótulos inconsistentes: "Geral" vs "Home" vs "Visão Geral" para o mesmo tipo de item em módulos diferentes | 🟡 Médio | Vários |
| 9 | Botões de ação sem funcionalidade (placeholders) nos dashboards antigos | 🟡 Médio | `FederationDashboardPage.tsx`, `LeagueDashboardPage.tsx` |
| 10 | `active` do sidebar é estático (hardcoded) e nunca reflete a rota atual | 🟠 Alto | Todas as páginas de dashboard |

O item **#1** é a causa mais provável do sintoma reportado ("muitos links não direcionam corretamente"): como o sidebar usa `<a href="...">` normal em vez de `<Link>`, **cada clique no menu provoca um full page reload** em vez de navegação SPA. Combinado com o item **#2/#3** (sidebars que apontam para âncoras `#algo` que não existem em lado nenhum da página), o resultado percebido pelo utilizador é exatamente "cliquei e não fui para lado nenhum" ou "a página recarregou/perdeu o estado".

---

# 2. Achado Crítico #1 — Sidebar não usa React Router `<Link>`

**Ficheiro:** `src/app/layouts/components/DashboardSidebar.tsx`

```tsx
{sidebarLinks.map((link, idx) => (
  <a
    key={idx}
    href={link.href}
    className={...}
  >
    {link.icon}
    <span className="font-title-md text-sm">{link.label}</span>
  </a>
))}
```

**Ficheiro:** `src/app/layouts/components/DashboardMobileMenu.tsx` — o mesmo padrão.

### Porque é crítico

- `<a href="/dashboard/club/members">` funciona, mas força um **hard navigation** (reload completo do browser), perdendo:
  - o estado do React Query (cache é reconstruído do zero, refetch de tudo);
  - o estado do Zustand (auth/tenant são rebootstrapped, há um "flash" de loading);
  - a percepção de velocidade de uma SPA (o utilizador vê o ecrã inteiro apagar e recarregar).
- Para os itens cujo `href` é uma âncora (`#home`, `#tournaments`, etc. — ver secção 3), o clique **não faz nada de visível**, porque não existe nenhum elemento com esse `id` na página. É provavelmente a origem direta da frase "muitos links não direcionam corretamente".
- O `DashboardLayout.tsx` já importa `useNavigate` do `react-router-dom` (usado só para o logout) — a infraestrutura de roteamento já está disponível na árvore, só falta usá-la no sidebar.

### Correção recomendada

Trocar `<a href={link.href}>` por `<Link to={link.href}>` em `DashboardSidebar.tsx` e `DashboardMobileMenu.tsx`, e derivar `active` a partir de `useLocation()` em vez de receber uma prop estática `active: true` calculada manualmente em cada página (ver Achado #10).

---

# 3. Achado Crítico #2 e #3 — Links mortos (`#ancora`) e duplicação do Dashboard do Clube

Existem **dois** componentes chamados `ClubDashboardPage`:

1. `src/modules/dashboards/pages/ClubDashboardPage.tsx` — usado pelo **resolvedor de dashboard por papel** (`DashboardPageSelector.tsx` → `useDashboardResolver`). Contém dados **fixos/mock** ("Tiago Santos", "Gilberto Mbulu"...) e sidebar com âncoras mortas:
   ```tsx
   { label: 'Geral', href: '#home', ... , active: true },
   { label: 'Plantel', href: '#squad', ... },
   { label: 'Equipa Técnica', href: '#staff', ... },
   { label: 'Transferências', href: '#transfers', ... },
   { label: 'Documentos', href: '#documents', ... },
   { label: 'Estatísticas', href: '#stats', ... },
   ```
   Nenhum destes `id`s existe no corpo da página — os cliques não fazem nada.

2. `src/modules/clubs/pages/ClubDashboardPage.tsx` — a versão **real e funcional**, com dados vindos de `useClubMe`, `useClubKpis`, etc., e sidebar com rotas reais (`ROUTES.DASHBOARD_CLUB_MEMBERS`, `ROUTES.DASHBOARD_CLUB_SETTINGS`, ...).

Isto significa que **dependendo de como o utilizador chega ao dashboard do clube** (resolução automática por papel vs. navegação direta a `/dashboard/club`), vê duas experiências completamente diferentes — uma funcional, uma decorativa com botões mortos. Isto é o tipo de inconsistência mais visível para quem testa a app.

O mesmo padrão de âncoras mortas repete-se em:

- `ExecutiveDashboardPage.tsx` → `#ecosystem`, `#organizations`, `#clubs`, `#players`, `#fanzone`, `#analytics`
- `FederationDashboardPage.tsx` → `#home`, `#scouting`, `#transfers`, `#medical`, `#academy`, `#finance`
- `LeagueDashboardPage.tsx` → `#scouting`, `#transfers`, `#medical`, `#academy`, `#finance`
- `dashboards/pages/CompetitionDashboardPage.tsx` → `#home`, `#tournaments`, `#matches`, `#referees`, `#venues`, `#compliance`

Nestes quatro dashboards, **nenhum item do sidebar navega para uma página real** — são todos placeholders de uma fase de protótipo visual que nunca foi ligada a rotas.

### Recomendação

1. Decidir qual é a fonte de verdade para o dashboard de cada papel — recomenda-se **eliminar os dashboards decorativos em `modules/dashboards/pages/`** que hoje competem com implementações reais equivalentes (Club, Organization), e manter apenas os módulos que já têm dados reais e rotas reais (`clubs`, `organizations`).
2. Para Executive, Federation, League e Competition (que não têm ainda um módulo de gestão próprio como Clubs/Organizations), os itens do sidebar devem apontar para:
   - rotas reais já existentes (`ROUTES.COMPETITIONS`, `ROUTES.CLUBS`, `ROUTES.PLAYERS`, `ROUTES.DASHBOARD_ORGANIZATION`...), ou
   - se a funcionalidade ainda não existe, marcar o item como "Brevemente" / desabilitado, em vez de simular um link funcional que não faz nada. Um link morto é pior para a confiança do utilizador do que a ausência do link.

---

# 4. Achado Alto #4 e #5 — Sidebar do Clube inconsistente entre página principal e subpáginas

`clubs/pages/ClubDashboardPage.tsx` define este sidebar (8 itens, ícones variados):

```
Geral · Membros · Configurações · Documentos · Patrocinadores ·
Transferências · Pedidos de Vínculo · Registar Jogador
```

Mas todas as subpáginas do mesmo módulo definem sidebars **diferentes e mais curtos**, e reutilizam o **mesmo ícone para todos os itens** (o que também reduz a usabilidade — o ícone deixa de ajudar a identificar a secção):

| Página | Itens no sidebar | Ícone usado |
|---|---|---|
| `ClubSettingsPage` | Geral, Membros, Configurações, Documentos, Patrocinadores, Transferências (6) | variado (correto) |
| `ClubMembersPage` | Geral, Membros, Configurações, Documentos, Patrocinadores, Transferências (6) | **`<Shield>` repetido em todos** |
| `ClubDocumentsPage` | idem (6) | **`<FileText>` repetido em todos** |
| `ClubSponsorsPage` | idem (6) | **`<Handshake>` repetido em todos** |
| `ClubTransfersPage` | idem (6) | **`<ArrowRightLeft>` repetido em todos** |
| `ClubTransferCreatePage` | idem (6) | **`<Users>` repetido em todos** |

Nenhuma destas 5 subpáginas tem os itens **"Pedidos de Vínculo"** (`ROUTES.DASHBOARD_CLUB_PLAYER_REQUESTS`) e **"Registar Jogador"** (`ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER`) que existem na página principal. Ou seja: um gestor de clube que navegue para "Documentos" ou "Transferências" **perde o acesso direto** a duas funcionalidades importantes até voltar à página inicial do clube.

### Recomendação

Extrair a definição do sidebar do clube para uma função partilhada (padrão já usado em `organizations/constants/navigation.tsx` com `getOrganizationSidebarLinks(active)`), e usá-la em todas as 7 páginas do módulo `clubs`, garantindo:
- mesma lista de itens em todas as páginas;
- ícone fixo por item (não por página);
- `active` calculado automaticamente a partir da rota atual.

---

# 5. Achado Alto #6 e Médio #7 — Assimetrias no módulo de Jogadores

- `PlayerDashboardPage.tsx` inclui 4 itens: Geral, **Pedido de Vínculo ao Clube**, Configurações, Perfil Público.
- `PlayerDashboardSettingsPage.tsx` inclui só 3: Geral, Configurações, Perfil Público — **falta o link de Pedido de Vínculo**, obrigando o jogador a voltar ao dashboard para o encontrar.
- Do lado do clube, `ClubPlayerRegistrationRequestsPage.tsx` já inclui um link de volta para "Registar Jogador" (`ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER`), mas `ClubPlayerRegisterPage.tsx` **não tem o link recíproco** para "Pedidos de Vínculo" — a navegação entre as duas telas relacionadas só funciona num sentido.

---

# 6. Achado Médio #8 — Rótulos inconsistentes para o mesmo conceito

O primeiro item do sidebar (a própria página inicial do dashboard) tem rótulos diferentes consoante o módulo:

- "Geral" — Clubs, Players, Competitions (parcialmente)
- "Home" — dashboards decorativos (Executive, Federation, League, Competition antigo)
- "Visão Geral" — Organizations

Isto é um detalhe pequeno isoladamente, mas multiplicado por 8+ dashboards diferentes cria uma app que parece "colada" a partir de protótipos distintos. Recomenda-se padronizar em **"Geral"** (é o termo já maioritário e mais curto) em toda a plataforma.

---

# 7. Achado Médio #9 — Botões de ação sem função

- `FederationDashboardPage.tsx`: botões "Exportar Auditoria" e "Gerir Conformidade" no header não têm `onClick`.
- `LeagueDashboardPage.tsx`: botões "Imprimir Calendário" e "Painel de Arbitragem" idem.
- `ClubDashboardPage` (versão decorativa): botão "Registar Novo Jogador" no header e "Submeter Ficheiro de Auditoria" / "Gerir Plantel Completo" idem.

Estes botões reforçam a sensação de "clico e nada acontece" já causada pelas âncoras mortas do sidebar.

---

# 8. Achado Alto #10 — Estado `active` estático

Em todas as páginas de dashboard, o item ativo do sidebar é definido manualmente por página:

```tsx
{ label: 'Membros', href: ROUTES.DASHBOARD_CLUB_MEMBERS, icon: ..., active: true }
```

Isto funciona apenas porque cada página declara a sua própria lista com o item correto marcado à mão — é frágil (basta esquecer de marcar `active` numa nova página, ou copiar-colar uma lista de outra página, para o sidebar mostrar o item errado destacado). Ao centralizar as listas de sidebar (recomendação da secção 4) e derivar `active` de `useLocation().pathname === link.href`, este problema desaparece estruturalmente e deixa de depender de disciplina manual.

---

# 9. Plano de Ação Priorizado

| Prioridade | Ação | Esforço | Ficheiros |
|---|---|---|---|
| 1 | Trocar `<a href>` por `<Link to>` no sidebar e no menu mobile; derivar `active` de `useLocation()` | ~2h | `DashboardSidebar.tsx`, `DashboardMobileMenu.tsx`, `DashboardLayout.tsx` |
| 2 | Eliminar/substituir os 4 dashboards decorativos com âncoras mortas (Executive, Federation, League, Competition antigo) ou ligá-los a rotas reais | 1-2 dias | `dashboards/pages/*.tsx` |
| 3 | Resolver a duplicação de `ClubDashboardPage` — manter apenas a versão do módulo `clubs` | 2-4h | `dashboards/pages/ClubDashboardPage.tsx`, `DashboardPageSelector.tsx` |
| 4 | Centralizar a definição do sidebar do Clube (função partilhada, ícones fixos, lista completa) e aplicar às 7 páginas | 4-6h | `clubs/pages/*.tsx`, novo `clubs/constants/navigation.tsx` |
| 5 | Adicionar o link em falta em `PlayerDashboardSettingsPage` e o link recíproco em `ClubPlayerRegisterPage` | 30min | `PlayerDashboardSettingsPage.tsx`, `ClubPlayerRegisterPage.tsx` |
| 6 | Uniformizar o rótulo do primeiro item do sidebar para "Geral" em toda a app | 30min | Vários |
| 7 | Remover ou implementar os botões de ação sem `onClick` | 1-2h | `FederationDashboardPage.tsx`, `LeagueDashboardPage.tsx`, dashboard decorativo do clube |

**Impacto esperado:** os itens 1–3 resolvem diretamente o sintoma relatado ("links não direcionam corretamente"); os itens 4–6 resolvem a "inconsistência entre itens do sidebar"; o item 7 elimina a última fonte de "cliques que não fazem nada".

---

# 10. Nota sobre padrão de referência

O módulo `organizations` já resolve bem o problema de consistência de sidebar através de `getOrganizationSidebarLinks(active: OrganizationNavKey)` em `organizations/constants/navigation.tsx`, usado de forma idêntica em `OrganizationDashboardPage`, `OrganizationSettingsPage`, `OrganizationMembersPage` e `OrganizationAffiliationsPage`. Este é o padrão a replicar para `clubs` e, no médio prazo, para os módulos que ainda não têm uma consola de gestão própria (Executive, Federation, League, Competition).
