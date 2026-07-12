# Auditoria de Conformidade — Módulo Players (Frontend)

**Data:** 2026-07-12
**Escopo:** `src/modules/players/**` comparado com `docs/00-overview`, `docs/01-architecture` (em particular `06A_GLOBAL_AND_TENANT_DOMAIN.md`) e `docs/02-development`, cruzado com `docs/AUDITORIA_CONFORMIDADE_FRONTEND_2026-07-10.md`.

Nota metodológica: esta auditoria foi feita a partir do conteúdo de ficheiros já presente nesta conversa (não houve acesso a um clone git real — o sandbox não continha o repositório). Cobre todos os ficheiros do módulo `players` disponibilizados: `index.ts`, `constants/`, `schemas/`, `services/`, `hooks/`, `components/`, `pages/`, `types/`, `routes.ts`.

---

## 1. Resumo Executivo

O módulo Players tem uma camada de dados (types/services/hooks/schemas) surpreendentemente completa — cobre Player, PlayerDocument, PlayerVideo e PlayerAchievement com CRUD completo — mas a camada de apresentação está muito atrás: só duas das quatro entidades têm qualquer UI (Player em si, via lista/detalhe/criar/editar). Documentos, vídeos e conquistas têm services + hooks + mutations prontos e **zero componentes ou páginas que os consumam**. O módulo também é o único, de entre os já auditados (clubs, organizations, competitions), que não foi migrado para o Design System interno (`src/components/ui`) nas suas páginas de leitura — continua a usar CSS à mão (`src/index.css`, secção `players-*` / `player-*`) e o sistema de tokens antigo (`--color-primary`), em vez do sistema de tokens Material 3 do Tailwind já adotado por Clubs e Organizations.

| Dimensão | Estado | Nota |
|---|---|---|
| Estrutura por feature (`05_FRONTEND_ARCHITECTURE.md` §6) | ✅ Boa | `components/hooks/pages/services/schemas/types/constants/routes.ts/index.ts` presentes |
| Modelo Global vs Tenant (`06A_GLOBAL_AND_TENANT_DOMAIN.md`) | ✅ Correto | `Player` sem `tenant`, alinhado com a arquitetura |
| Design System interno (`Card/Badge/Button/DataTable`) | ❌ Não usado nas páginas de leitura | `PlayerListPage`/`PlayerDetailPage` usam CSS `players-*` dedicado |
| Cobertura funcional (Documentos/Vídeos/Conquistas) | ❌ Crítico | Services + hooks completos, **sem UI nenhuma** |
| Upload de media (avatar) | ❌ Não conforme | Campo `avatar` é URL de texto livre, não passa pelo fluxo Media/R2 |
| Dashboard do Jogador | ❌ Inexistente | Nenhum `dashboardType: 'player'` em `DashboardPageSelector` |
| Fluxo de vínculo/registo a clube | ⚠️ Parcial | `registerPlayer` existe no service, sem página/formulário |
| Testes | ❌ Zero | Nenhum ficheiro `.test.ts(x)` no módulo |
| i18n | ❌ Não aplicado | Texto 100% hardcoded em PT, nenhum `useTranslation()` |
| Zod + RHF | ✅ Bom | `player.schema.ts` bem estruturado, usado corretamente em Create/Settings |

---

## 2. O que está bem implementado

- **Modelo de domínio Global** (`types/index.ts`): `Player` não tem campo `tenant`, o que está corretíssimo face a `06A_GLOBAL_AND_TENANT_DOMAIN.md` §4 e §8 ("O jogador possui uma carreira... não pertence a um Clube"). `PlayerDetail.career_history` reflete bem o conceito de `Registration` do documento, embora apenas em leitura (ver §5).
- **Camada de serviços rica** (`services/index.ts`): cobre `listPlayers`, `getPlayer`, `searchPlayers`, `createPlayer`, `updatePlayer`, `registerPlayer`, e CRUD completo de `PlayerDocument`, `PlayerVideo` (incluindo `publish`) e `PlayerAchievement` (incluindo `verify`). Nenhuma chamada `fetch()`/`axios` fora da service layer — respeita `04_API_GUIDELINES.md` e `01_CODING_STANDARDS.md` §15.
- **Hooks bem organizados** (`usePlayerQueries.ts` + `usePlayerMutations.ts`): `playerKeys` como factory de query keys, `staleTime` sensato, invalidação de cache correta pós-mutação. Segue o padrão dos módulos mais maduros (clubs/organizations).
- **Formulários com RHF + Zod** (`PlayerCreatePage`, `PlayerSettingsPage`): validação consistente, mensagens em português, e — ao contrário das páginas de leitura — **estas duas páginas usam corretamente o Design System** (`Button`, `Card`, `FormField`, `Input`, `Textarea`).
- **Debounce de pesquisa** (`PlayerListPage` + `useDebounce`): pesquisa por nome com `usePlayerSearch` separado da listagem paginada `usePlayers`, com transição limpa entre os dois modos.

---

## 3. Achados Críticos

### 3.1 — Documentos, Vídeos e Conquistas: API completa, UI inexistente

Ficheiros com prova:
- `services/index.ts` — `listPlayerDocuments`, `createPlayerDocument`, `updatePlayerDocument`, `deletePlayerDocument`, `verifyPlayerDocument`; o mesmo para `PlayerVideo` (+ `publishPlayerVideo`) e `PlayerAchievement` (+ `verifyPlayerAchievement`).
- `hooks/usePlayerQueries.ts` — `usePlayerDocuments`, `usePlayerVideos`, `usePlayerAchievements`.
- `hooks/usePlayerMutations.ts` — mutations completas para as três entidades (create/update/delete/verify/publish).
- `types/index.ts` — `PlayerDocument`, `PlayerVideo`, `PlayerAchievement` com todos os campos necessários (categoria, status, verificação, destaque, etc.).

Nenhuma página ou componente do módulo consome estes hooks. `PlayerDetailPage.tsx` só renderiza `career_history` — não há abas ou secções para Documentos, Vídeos ou Conquistas, apesar de `PlayerDetail` já as trazer no payload (`videos`, `documents`, `achievements`).

Isto contraria diretamente:
- `00_PLATFORM_GUIDE.md` §10 (Jogador): "Adicionar vídeos... Gerir documentos".
- `02_ROADMAP.md` v2.3 (Players): "Vídeos, Documentos, Estatísticas, Conquistas" listados como entregáveis da versão.
- `08A_DIGITAL_ASSET_MANAGEMENT.md`: os vídeos/documentos deveriam usar `MediaAsset`/`MediaUsage`, mas nem sequer há consumo no frontend independentemente do mecanismo de storage usado no backend.

**Prioridade: Alta.** É a funcionalidade documentada com maior gap entre "existe no código" e "é utilizável por um utilizador real".

### 3.2 — Upload de avatar fora do fluxo de Media oficial

`playerCreateSchema`/`playerUpdateSchema` (`schemas/player.schema.ts`) tratam `avatar` como:
```ts
avatar: z.string().url('URL inválida.').optional().or(z.literal('')),
```
E nas páginas (`PlayerCreatePage.tsx`, `PlayerSettingsPage.tsx`) o campo é um `<Input>` de texto simples para colar uma URL — não existe `<input type="file">`, nem upload multipart, nem qualquer chamada equivalente a `uploadClubLogo`/`useUploadLogo` (usadas em Clubs/Organizations).

Isto diverge de:
- `08_MEDIA_STORAGE_ARCHITECTURE.md` §12 (Fluxo de Upload): "Frontend → API → Media Service → Cloudflare R2 → Guardar Metadados".
- `08A_DIGITAL_ASSET_MANAGEMENT.md` §27: "Nunca guardar caminhos físicos... Sempre utilizar UUID."

Um jogador não tem forma, na prática, de carregar a sua própria fotografia através da interface — só pode colar um link externo já hospedado noutro sítio.

**Prioridade: Média-Alta.**

### 3.3 — Nenhum Dashboard do Jogador

`DashboardPageSelector.tsx` resolve apenas `'federation' | 'executive' | 'league' | 'club' | 'competition' | 'organization'`. Não existe `'player'` nem `'fan'`. Um utilizador autenticado com papel de Jogador não tem uma consola própria (perfil profissional, estatísticas, próximos jogos, notificações de vínculo) — apenas as páginas públicas de `players/:slug`.

Isto contraria:
- `00_PLATFORM_GUIDE.md` §10 e §17 (roadmap de dashboards por perfil).
- `.ai/skill/design/dashboard-designer.md`, secção "Dashboard Types" → "Player Dashboard: Career, Statistics, Performance, Contracts, Media".

**Prioridade: Média** (depende de prioridade de produto, mas é um gap estrutural real face à documentação).

### 3.4 — Fluxo de vínculo/registo a clube incompleto no frontend

`services/index.ts::registerPlayer(slug, data: PlayerRegisterPayload)` e `schemas/player.schema.ts::playerRegisterSchema` existem, mas nenhuma página os invoca (`useRegisterPlayer` em `usePlayerMutations.ts` também não é importado em lado nenhum das `pages/`). O conceito de `Registration` descrito em `06A_GLOBAL_AND_TENANT_DOMAIN.md` §9 ("Em vez do Clube 'possuir' o Jogador... o Clube cria um registo") não tem qualquer superfície de UI — nem para o jogador solicitar vínculo, nem para o clube aprovar.

**Prioridade: Média.**

---

## 4. Achados de Consistência Arquitetural

### 4.1 — Dois sistemas de design coexistindo dentro do mesmo módulo

`PlayerCreatePage`/`PlayerSettingsPage` usam o Design System Tailwind/CVA (`@/components/ui`, tokens `bg-primary`, `text-on-surface`, etc. — o mesmo sistema de Clubs/Organizations). Já `PlayerListPage`/`PlayerDetailPage` usam classes CSS dedicadas definidas em `src/index.css` (`.players-page`, `.player-card`, `.player-hero`, `.player-stat-card`, etc.) que dependem de **um segundo conjunto de tokens** (`--color-primary`, `--bg-card`, `--radius-md`, definidos em `:root` no topo do mesmo ficheiro CSS) — o sistema "glass-card" legado da Landing Page, distinto do sistema Material 3 (`tailwind.config.ts` → `primary: '#94d3c1'`, etc.) usado no resto da app autenticada.

Consequência prática: o cartão de um jogador na listagem pública (`PlayerCard.tsx` em `components/`, que já usa `Card`/`Badge` do DS) tem uma aparência visual diferente do cartão de jogador dentro de `PlayerListPage.tsx` (que na verdade tem a **sua própria** implementação de cartão dentro do próprio ficheiro de página, duplicando `PlayerCard.tsx`). Ou seja, existem hoje **dois componentes de cartão de jogador diferentes**: `components/PlayerCard.tsx` (exportado, usa DS) e a função `PlayerCard` definida inline dentro de `pages/PlayerListPage.tsx` (usa CSS legado) — e é esta segunda versão que é efetivamente renderizada na lista pública.

Isto viola diretamente:
- `01_CODING_STANDARDS.md` §27: "Antes de adicionar código novo, verificar se existe implementação reutilizável. Preferir reutilização à duplicação."
- `.ai/skill/design/frontend-design-system.md`: "Never duplicate components", "Never hardcode colors. Always use design tokens."

**Prioridade: Alta** — é dívida técnica de fácil correção (eliminar a versão duplicada dentro da página, usar sempre `components/PlayerCard.tsx`) com alto valor de consistência visual.

### 4.2 — Empty state duplicado

Existe `components/PlayerEmptyState.tsx` (exportado em `components/index.ts`, usa `EmptyState` do DS), mas `PlayerListPage.tsx` define **uma segunda** função local `EmptyState` (usando `players-empty` CSS) em vez de importar `PlayerEmptyState`. Mesma classe de problema que 4.1.

### 4.3 — Sem defesa contra envelope de API inconsistente

Ao contrário de `clubs/services/index.ts` (que implementa `unwrapData`/`unwrapList`/`unwrapPaginated` por precaução, dado que o backend nem sempre devolve o envelope padrão — ver achado P2 de `AUDITORIA_CONFORMIDADE_BACKEND_2026-07-04.md`), o `players/services/index.ts` assume sempre `res.data` como `{ success, data }` sem qualquer normalização. `PlayerListPage.tsx` acede diretamente a `listResult.data?.data?.results` e `searchResult.data?.data`. Se o endpoint de listagem de jogadores um dia devolver um formato diferente (array puro, ou `{results}` sem envelope — como já acontece nalguns endpoints de `clubs`/`competitions` por trás), a página quebra silenciosamente (lista vazia sem erro visível).

**Prioridade: Baixa-Média** — risco latente, não um bug confirmado, mas assimetria de robustez face a outros módulos.

### 4.4 — Zero testes

Confirma o achado já registado em `AUDITORIA_CONFORMIDADE_FRONTEND_2026-07-10.md` (secção 9): não há nenhum ficheiro de teste para `players` (nem serviços, nem hooks, nem componentes, nem páginas). Dado que este módulo tem a maior superfície de API não exposta em UI (documentos/vídeos/conquistas), seria também o candidato natural para testes de contrato dos services, mesmo antes de existir UI — pelo menos para prevenir regressões na camada de dados quando a UI for construída.

### 4.5 — i18n não aplicado

Nenhuma página ou componente do módulo chama `useTranslation()`/`t()`. Todo o texto (labels, placeholders, mensagens de erro de validação fora do Zod, textos de estados vazios) está hardcoded em português — mesmo padrão identificado a nível de toda a aplicação em `AUDITORIA_CONFORMIDADE_FRONTEND_2026-07-10.md` §5, mas vale a pena registar que aqui não há sequer um único ponto de entrada preparado (ao contrário de `Navigation.tsx`/`Footer.tsx`/`DashboardHeader.tsx`, que já usam `t()` mesmo que com poucas chaves).

---

## 5. Conformidade Positiva a Reter

- Separação estrita Global/Tenant respeitada (o ponto arquitetural mais importante para este módulo, e está correto).
- Nenhuma lógica de negócio nas páginas — tudo delega para hooks/services.
- Nenhum uso de `any` sem necessidade nos tipos principais (`types/index.ts` é extenso e bem tipado).
- Padrão de nomenclatura de hooks (`use` + verbo) e de query keys (`playerKeys`) consistente com o resto da aplicação.
- Formulários de criação/edição já usam o Design System e RHF+Zod corretamente — ou seja, a "escrita" está mais madura que a "leitura", o que é o inverso do habitual e facilita a correção (o trabalho de migração de UI é sobretudo nas páginas de listagem/detalhe, não nos formulários).

---

## 6. Plano de Ação Recomendado

### Fase 0 — Correções rápidas de consistência (baixo esforço)
1. Remover a implementação duplicada de `PlayerCard` e `EmptyState` dentro de `PlayerListPage.tsx`; importar `components/PlayerCard.tsx` e `components/PlayerEmptyState.tsx`.
2. Migrar `PlayerListPage.tsx` e `PlayerDetailPage.tsx` do CSS `players-*`/`player-*` para os componentes do Design System (`Card`, `Badge`, `Skeleton`, `EmptyState`, `Tabs`) — alinhando com o padrão já usado em `ClubDetailPage.tsx`/`ClubListPage.tsx`.
3. Remover (ou justificar explicitamente) o segundo sistema de tokens CSS em `index.css` para as secções `players-*` uma vez que a migração acima estiver concluída.

### Fase 1 — Fechar o gap funcional Documentos/Vídeos/Conquistas
1. Adicionar abas em `PlayerDetailPage.tsx` (Tabs do DS, como em `ClubDetailPage.tsx`) para Documentos, Vídeos e Conquistas, consumindo os hooks já existentes (`usePlayerDocuments`, `usePlayerVideos`, `usePlayerAchievements`).
2. Criar formulários de gestão (equivalentes a `ClubDocumentsPage`/`ClubSponsorsPage`) para que o próprio jogador (ou staff autorizado) possa criar/editar/remover estes registos, usando as mutations já implementadas.
3. Implementar upload real de avatar (multipart, via um novo endpoint de media do jogador), substituindo o campo de URL livre.

### Fase 2 — Fechar gaps estruturais
1. Adicionar um `PlayerDashboardPage` e o `dashboardType: 'player'` correspondente em `DashboardPageSelector.tsx`.
2. Construir a página/fluxo de solicitação e aprovação de vínculo (`registerPlayer` / `useRegisterPlayer`), incluindo o lado do Clube (aprovar pedidos, semelhante a `OrganizationAffiliationsPage.tsx`).

### Fase 3 — Qualidade
1. Testes de serviço e hooks para `players` (prioritário sobre testes de UI, dado o volume de lógica de dados já existente sem cobertura).
2. Testes de componentes para `PlayerCard`, `PlayerEmptyState`, formulários de criação/edição.
3. Introduzir `useTranslation()` nas páginas do módulo como piloto da migração i18n mencionada na auditoria geral do frontend.

---

## 7. Conclusão

O módulo Players está numa posição invulgar: a camada de dados (types, services, hooks) está mais avançada do que a experiência real disponibilizada ao utilizador. A prioridade não deveria ser adicionar mais endpoints ou mutations — já existem mais do que os que a UI usa — mas sim (a) unificar as páginas de leitura com o Design System já adotado por Clubs/Organizations, eliminando a duplicação de componentes, e (b) construir a interface que finalmente exponha Documentos, Vídeos e Conquistas, que é o maior gap funcional documentado face ao Roadmap v2.3 e ao Platform Guide.
