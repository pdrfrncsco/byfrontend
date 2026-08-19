# MatchCenter BolaYetu — Auditoria e Plano de Refatoração

## 1. Objetivo

Diagnosticar as inconsistências entre o plano documental, o backend implementado e o frontend em produção, e propor uma arquitetura de MatchCenter profissional, coesa e funcional.

## 2. Evidências revisadas

- [byfrontend/src/modules/competitions/hooks/useMatchCenter.ts](../../src/modules/competitions/hooks/useMatchCenter.ts)
- [byfrontend/src/modules/competitions/pages/MatchCenterPage.tsx](../../src/modules/competitions/pages/MatchCenterPage.tsx)
- [byfrontend/src/modules/competitions/README_MATCHCENTER.md](../../src/modules/competitions/README_MATCHCENTER.md)
- [byfrontend/src/modules/competitions/routes.ts](../../src/modules/competitions/routes.ts)
- [byfrontend/src/constants/routes.ts](../../src/constants/routes.ts)
- [byfrontend/src/app/routes/slices/contentRoutes.tsx](../../src/app/routes/slices/contentRoutes.tsx)
- [byfrontend/src/app/routes/slices/dashboardRoutes.tsx](../../src/app/routes/slices/dashboardRoutes.tsx)
- [bybackend/competitions/views/match_center_views.py](../../../bybackend/competitions/views/match_center_views.py)
- [bybackend/competitions/urls.py](../../../bybackend/competitions/urls.py)
- [bybackend/competitions/views/v2_views.py](../../../bybackend/competitions/views/v2_views.py)

## 3. Diagnóstico executivo

O MatchCenter já não é um projeto vazio. Há backend funcional para eventos, estatísticas e live matches; há hooks e páginas no frontend; e há documentação que afirma que a funcionalidade está “completa”. Mas a realidade está mais próxima de um módulo fragmentado:

- há API e UI em paralelo;
- há rotas e nomeações divergentes;
- há documentação que descreve “fase completa” sem validar o fluxo real da experiência;
- há lista de partidas e detalhes que não obedecem a um único modelo de contrato;
- há ausência de uma estratégia clara de tempo real e de estado de sessão de partida;
- há pouca sinalização de que a experiência final foi validada em fluxo real, performance e acessibilidade.

Em suma: o módulo está funcional em partes, mas ainda não é um MatchCenter profissional e consistente como produto.

## 4. Inconsistências encontradas

### 4.1 O plano afirma “completo”, mas o produto ainda é fragmentado

O README no frontend afirma que a implementação está completa e lista páginas e hooks como finalizados em [byfrontend/src/modules/competitions/README_MATCHCENTER.md](../../src/modules/competitions/README_MATCHCENTER.md).

Mas o código real mostra um sistema distribuído em vários módulos com responsabilidades separadas:

- lista de partidas em [byfrontend/src/modules/competitions/hooks/useMatchCenter.ts](../../src/modules/competitions/hooks/useMatchCenter.ts)
- dashboard e detalhes em [byfrontend/src/modules/competitions/pages/MatchCenterPage.tsx](../../src/modules/competitions/pages/MatchCenterPage.tsx)
- linhas de escalação em [byfrontend/src/modules/competitions/pages/MatchLineupPage.tsx](../../src/modules/competitions/pages/MatchLineupPage.tsx)
- relatório em [byfrontend/src/modules/competitions/pages/MatchReportPage.tsx](../../src/modules/competitions/pages/MatchReportPage.tsx)
- detalhe de partida em [byfrontend/src/modules/competitions/pages/MatchDetailPage.tsx](../../src/modules/competitions/pages/MatchDetailPage.tsx)

Isso significa que o módulo foi montado como suíte de funcionalidades, mas não ainda como um único produto com arquitetura de domínio unificada.

### 4.2 Rota de MatchCenter está inconsistente com a intenção do produto

A rota global e o helper de rotas definem rotas com argumento de matchId, mas a página principal do MatchCenter é um hub de partidas por competição, não um detalhe de uma partida:

- [byfrontend/src/constants/routes.ts](../../src/constants/routes.ts)
- [byfrontend/src/modules/competitions/routes.ts](../../src/modules/competitions/routes.ts)
- [byfrontend/src/app/routes/slices/contentRoutes.tsx](../../src/app/routes/slices/contentRoutes.tsx)
- [byfrontend/src/app/routes/slices/dashboardRoutes.tsx](../../src/app/routes/slices/dashboardRoutes.tsx)

O problema é que as rotas declaradas parecem usar o padrão de detalhe de partida em vez do hub de competição. Isso conflita com o conceito correto de “Centro de Jogos” (lista de partidas por jornada) e com a idéia de “Match Detail” como página específica.

Conclusão: a URL está sendo usada para dois conceitos diferentes. Isso cria confusão operacional, navegação inconsistente e risco de regressão.

### 4.3 O frontend usa filtros locais que não têm contrato server-side claro

No hook [byfrontend/src/modules/competitions/hooks/useMatchCenter.ts](../../src/modules/competitions/hooks/useMatchCenter.ts), o filtro usa parâmetros como:

- `selectedRound`
- `status`
- `teamId`

Mas a API do frontend em [byfrontend/src/modules/competitions/services/competition.api.ts](../../src/modules/competitions/services/competition.api.ts) mostra `listMatches` com assinatura limitada e sem suporte explícito para `status` ou `team_id` no mesmo contrato.

O backend também não expõe um endpoint de match-center orientado por jornada e status com contrato strict de filtragem. Existe listagem de partidas e live matches, mas a lógica do MatchCenter não está totalmente alinhada a um API contract único.

Resultado: o filtro local funciona como camada visual, mas não é uma regra de produto validada no backend nem na experiência profissional.

### 4.4 Backend tem base funcional, mas não um contrato de MatchCenter canonical

Os endpoints relevantes são listados em [bybackend/competitions/urls.py](../../../bybackend/competitions/urls.py) e as views em [bybackend/competitions/views/match_center_views.py](../../../bybackend/competitions/views/match_center_views.py).

O backend implementa:

- events
- live matches
- stats
- upload de relatório
- endpoints de lineups e report

Mas esses fluxos permanecem espalhados em diferentes views, sem um “match-center orchestration layer” que unifique:

- match detail
- live state
- scoreboard
- timeline
- lineup
- report
- observations/performance

Em outras palavras, há funcionalidade, mas não uma arquitetura de domínio de MatchCenter como serviço único.

### 4.5 Falta de estratégia real de tempo real

A documentação menciona polling e live updates, mas o produto ainda não apresenta um modelo profissional de tempo real. O hook usa polling condicional, e o backend oferece apenas endpoints estáticos para live matches.

Isso é um gap funcional importante para um MatchCenter profissional, porque:

- não há sincronização reativa de estado entre painel e detalhes;
- não há estratégia de reconciliação de caches ao vivo;
- não há garantia de eficiência e consistência em multifuncionalidade;
- não há base para atualizações event-driven em produção.

### 4.6 Ausência de governança de UX e qualidade

O README descreve um conjunto de componentes e páginas como se o projeto estivesse pronto, mas não há evidência clara do nível de qualidade e consistência necessário para operação real em produção:

- design system consistente;
- estados empties, skeletons e errors integrados;
- acessibilidade para controles e legendas de tempo real;
- observabilidade de erros e reprocessamento do cache;
- testes UI do fluxo crítico.

## 5. Conclusão da auditoria

A implementação atual do MatchCenter está em um estado de “funcionalidade parcial em camadas” e não em um estado de “produto profissional”.

O problema não é ausência total de código; o problema é ausência de arquitetura coerente e de contrato de domínio unificado.

## 6. Proposta de refatoração: MatchCenter profissional

### Fase 0 — Stabilize contract and domain model

Objetivo: definir a estrutura real do MatchCenter antes de mexer na UI.

Entregáveis:
- unificar os conceitos de MatchCenter Hub, Match Detail e Match Live;
- definir o contrato do `MatchSummary`, `MatchDetail`, `MatchEvent`, `Lineup`, `MatchReport`;
- padronizar nomes e campos de API (`match_id`, `competition_id`, `status`, `minute`, `round_number`, `team_id`);
- garantir que todas as páginas consumam os mesmos tipos e query keys.

### Fase 1 — Backend canonical API

Objetivo: criar uma camada backend única do módulo e remover duplicidade de responsabilidades.

Arquitetura recomendada:
- `GET /api/v1/competitions/<id>/matches/` — listagem com filtros (status, round, team, date)
- `GET /api/v1/competitions/<id>/matches/<match_id>/detail/` — payload completo do detalhe
- `GET /api/v1/competitions/<id>/matches/<match_id>/events/` — timeline
- `GET /api/v1/competitions/<id>/matches/<match_id>/lineup/` — montagem do lineup
- `GET /api/v1/competitions/<id>/matches/<match_id>/report/` — relatório do árbitro
- `GET /api/v1/competitions/<id>/live-matches/` — feed ao vivo
- `POST /api/v1/competitions/<id>/matches/<match_id>/events/` — criação de eventos
- `PATCH /api/v1/competitions/<id>/matches/<match_id>/score/` — score update

### Fase 2 — Frontend architecture overhaul

Objetivo: transformar a UI em uma experiência principal com fluxo profissional.

Estrutura recomendada:
- `modules/competitions/match-center/`
  - `types.ts`
  - `api.ts`
  - `queries.ts`
  - `hooks/useMatchCenterHub.ts`
  - `hooks/useMatchDetail.ts`
  - `hooks/useMatchLive.ts`
  - `components/MatchCenterHub.tsx`
  - `components/MatchOverview.tsx`
  - `components/MatchTimeline.tsx`
  - `components/MatchScoreboard.tsx`
  - `components/MatchTabs.tsx`

### Fase 3 — UX do MatchCenter profissional

Funcionalidades obrigatórias:
- dashboard com filtros por jornada, status e equipe;
- resumo do jogo em destaque;
- feed em tempo real com update de eventos sem reload;
- scoreboard com estados claros de status e minuto;
- tabs separadas para Eventos, Escalação, Estatísticas e Relatório;
- empty, loading, error e retry states consistentes;
- nav consistente entre competição, dashboard e detalhe.

### Fase 4 — Tempo real e sincronização de estado

Implementar estratégia real baseada em:
- polling inteligente para partidas ao vivo;
- invalidation de queries por match;
- refresh automático ao mudar status;
- cache by match e by competition;
- mecanismos para evitar race conditions e stale data.

### Fase 5 — Qualidade e garantia

- testes unitários do hook principal;
- testes de page para hub e detail;
- testes de API do backend para eventos e linha de jogo;
- validação de acessos por role;
- testes de dispositivo móvel.

## 7. Plano de execução recomendado

### Sprint 1 — Patriarca da arquitetura
1. Definir o contrato canonical do MatchCenter.
2. Corrigir rotas e modelos de navegação.
3. Unificar os nomes de hook e API.
4. Mapear endpoints reais e gaps.

### Sprint 2 — Backend e frontend coesos
1. Criar API de detalhe completo do match.
2. Ajustar hook `useMatchCenter` para consumir contrato unificado.
3. Criar componentes exclusivos do hub e do detalhe.

### Sprint 3 — Live experience
1. Implementar polling/refresh inteligente.
2. Sincronizar timeline e scoreboard.
3. Revalidar estado em transição ao vivo.

### Sprint 4 — Product hardening
1. Cobertura de testes.
2. UX e acessibilidade.
3. QA e regressão.

## 8. Recomendação final

O MatchCenter não deve continuar como conjunto de módulos independentes. Ele precisa virar uma experiência de produto com:

- domínio único;
- API canonical;
- rota correta;
- UX profissional;
- live state confiável;
- testes e QA reais.

A mudança mais importante não é “adicionar mais funcionalidade”, e sim consolidar o que já existe em uma arquitetura consistente e profissional.

## 9. Implementação iniciada

A primeira correção concreta já foi aplicada no código real: a criação de eventos foi normalizada para um único contrato de payload antes do POST para o backend.

### Correção aplicada
- [byfrontend/src/modules/competitions/services/match.api.ts](../../src/modules/competitions/services/match.api.ts): introduzida a normalização de payloads com `normalizeMatchEventPayload` para aceitar `MatchEventFormData` e `MatchEventCreateData` e transformar ambos para o formato canónico do backend.
- [byfrontend/src/tests/modules/competitions/match-event-contract.test.ts](../../src/tests/modules/competitions/match-event-contract.test.ts): teste de regressão para garantir que o payload legado e o payload novo geram a mesma estrutura final.

### Resultado verificado
- Execução do comando de validação: `cd d:/Donwloads/ndeascloud/bolayetu/byfrontend ; npx vitest run src/tests/modules/competitions`
- Evidência: 6 ficheiros de teste passaram; 13 testes passaram; 0 falhas.

## 10. Plano de execução agora

### Fase 1 — Contrato canónico e segurança de payloads
1. Consolidar um único modelo de evento em `MatchEventCreateData`.
2. Garantir que o form, o hook e a API usam a mesma estrutura de payload.
3. Validar `minute`, `club`, `player`, `player_off` e `extra_time` em todos os pontos de entrada.
4. Repetir este padrão para `MatchScoreUpdate` e `MatchDetail`.

### Fase 2 — Separar responsabilidades do MatchCenter
1. Definir `MatchCenterHub` (lista de partidas por jornada) e `MatchDetailView` (detalhe da partida) como dois fluxos distintos.
2. Garantir que `useMatchCenter` é o hook do hub e que `useMatchDetail`/`useMatchLive` têm responsabilidades explícitas.
3. Remover dependências de hooks misturados entre módulos de competição, clube e jogador.

### Fase 3 — Rotas e navegação
1. Unificar `ROUTES.MATCH_CENTER_HUB`, `MATCH_CENTER`, `MATCH_LINEUP` e `MATCH_REPORT` como contrato único de navegação.
2. Garantir que o path público e o path de dashboard compartilham a mesma intenção sem ambiguidade.
3. Eliminar rotas redundantes e duplicadas com a mesma responsabilidade.

### Fase 4 — Live state profissional
1. Criar uma camada de `useMatchRealtime` com reconciliação de cache por match.
2. Separar `live`, `detail` e `historical` em um único modelo de estado do match.
3. Definir refresh inteligente por `status`, `current_period` e `current_minute`.

### Fase 5 — Qualidade e manutenção
1. Cobrir o fluxo principal com testes end-to-end e unitários.
2. Validar edge cases de intervalo, penáltis, extra time e reinício do jogo.
3. Reconciliar os schemas Zod com os tipos TypeScript e as APIs reais.

## 11. Próximo passo concreto

A próxima ação é:

1. consolidar o contrato canónico de `MatchDetail` e `MatchSummary` em um único módulo de tipos;
2. separar `useMatchCenter` do `useMatchDetail`/`useMatchLive` sem duplicação de query keys;
3. alinhar rotas e páginas do hub vs detalhe;
4. continuar a refatoração do módulo com testes de regressão após cada etapa.
