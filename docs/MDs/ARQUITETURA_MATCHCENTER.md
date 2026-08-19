 # Auditoria do MatchCenter

  Auditei a arquitetura documentada, o frontend byfrontend e o backend bybackend.

  Validações executadas:

  - npm run type-check: passou sem erros.
  - 33 testes backend de MatchCenter, escalações e notificações: passaram.
  - A implementação atual possui boa cobertura estrutural, mas ainda não cumpre integralmente o fluxo arquitetural definido.

  ## Estado atual

  Existe uma base funcional relevante:

  - Páginas de MatchCenter, detalhe, escalações e relatório.
  - Hooks separados para partidas, eventos, live, estatísticas e escalações.
  - Modelos backend para partidas, eventos, escalações, relatórios e estatísticas.
  - Polling, SSE de notificações, optimistic updates e cálculo de placar.
  - Testes backend básicos funcionais.

  A documentação em D:/Donwloads/deascloud/bolayetu/byfrontend/src/modules/competitions/README_MATCHCENTER.md classifica
  várias fases como completas, mas algumas funcionalidades estão apenas parcialmente implementadas ou possuem contratos
  inconsistentes.

  ## Problemas críticos encontrados

  ### 1. Estado live não é realmente único

  O diagrama e a arquitetura exigem um estado canónico central contendo:

  - partida;
  - status;
  - relógio;
  - período;
  - eventos;
  - escalações;
  - placar;
  - estatísticas.

  Atualmente MatchDetailPage usa simultaneamente:

  - useMatchDetail;
  - useMatchLive;
  - useMatchEvents;
  - useMatchStats.

  Isso permite que o scoreboard, timeline e estatísticas exibam versões diferentes do jogo durante latência ou reconexão.

  Referências:

  - D:/Donwloads/deascloud/bolayetu/byfrontend/src/modules/competitions/pages/MatchDetailPage.tsx
  - D:/Donwloads/deascloud/bolayetu/byfrontend/src/modules/competitions/hooks/useMatchLive.ts
  - D:/Donwloads/deascloud/bolayetu/byfrontend/src/modules/competitions/hooks/useMatchEvents.ts

  ### 2. Chaves de cache inconsistentes

  Há várias chaves para os mesmos dados:

  - MATCH_QUERY_KEYS.events(matchId)
  - MATCH_QUERY_KEYS.eventsByComp(competitionId, matchId)
  - matchCenterKeys.events(...)

  As mutações invalidam algumas chaves, enquanto outros componentes consultam chaves diferentes. Isso pode deixar timeline,
  placar e lista de partidas desatualizados.

  ### 3. matchApi.get não utiliza o endpoint de detalhe

  O frontend declara um endpoint de detalhe, mas matchApi.get() busca toda a lista de partidas e procura o ID localmente.

  Consequências:

  - payload desnecessariamente grande;
  - ausência de detalhe completo;
  - maior risco de dados incompletos;
  - comportamento inadequado em partidas live.

  Referência:

  - D:/Donwloads/deascloud/bolayetu/byfrontend/src/modules/competitions/services/match.api.ts

  ### 4. Contrato de escalações incompatível

  O frontend tenta consultar:

  /competitions/matches/:matchId/lineups/:teamId/

  Porém as rotas backend disponíveis são:

  /competitions/matches/:matchId/lineups/
  /competitions/matches/:matchId/lineups/:pk/

  O teamId não é necessariamente o pk da submissão. Isso deve ser resolvido com um endpoint explícito por partida e clube ou
  com um contrato único de identificação.

  ### 5. Transições de estado não estão suficientemente protegidas

  Os estados existem no backend:

  scheduled
  pre_match
  live
  halftime
  finished
  postponed
  cancelled
  walkover

  Mas a validação atual parece concentrar-se em valores permitidos, não numa máquina de transições:

  scheduled → pre_match → live → halftime → live → finished → archived

  O frontend possui um botão que pode alterar diretamente scheduled para live, contrariando o fluxo de:

  1. validação pré-jogo;
  2. submissão e bloqueio das escalações;
  3. confirmação do árbitro;
  4. início oficial.

  O estado archived, presente no diagrama, também não existe no tipo MatchStatus nem no modelo principal.

  ### 6. O papel dos atores está incompleto

  O diagrama separa:

  - organizador;
  - clube;
  - árbitro/delegado;
  - sistema.

  No backend, o registo de eventos está protegido principalmente por IsOrganizationAdmin. Isso não corresponde ao fluxo
  esperado, onde árbitro ou delegado devem poder registar eventos durante o jogo.

  Também falta uma política uniforme para:

  - quem pode iniciar a partida;
  - quem pode corrigir eventos;
  - quem pode terminar a partida;
  - quem pode aprovar o relatório;
  - quem pode arquivar o resultado.

  ### 7. O SSE atual não é um event bus de MatchCenter

  O useNotificationStream recebe notificações gerais, mas o backend:

  - consulta a base de dados a cada 15 segundos;
  - não publica eventos de MatchCenter no stream;
  - possui subscribers focados em eventos de clubes;
  - não garante entrega ordenada, idempotente ou específica de uma partida.

  Assim, o comportamento atual é essencialmente polling de notificações, não o fluxo:

  MatchEventForm
  → validação
  → event bus
  → estado live
  → UI
  → standings/player stats/notifications

  Referências:

  - D:/Donwloads/deascloud/bolayetu/byfrontend/src/modules/notifications/hooks/useNotificationStream.ts
  - D:/Donwloads/deascloud/bolayetu/bybackend/notifications/views.py
  - D:/Donwloads/deascloud/bolayetu/bybackend/notifications/subscribers.py

  ### 8. Side effects ainda estão acoplados ao frontend

  A criação automática de suspensões está dentro de useAddMatchEvent, no frontend.

  Isso é arriscado porque:

  - pode executar duas vezes;
  - não é confiável se o utilizador fechar a página;
  - não é transacional;
  - não garante consistência entre score, ranking e estatísticas.

  Os side effects devem ocorrer no backend, após persistência válida do evento, idealmente através de eventos de domínio e
  jobs idempotentes.

  ### 9. Modelo de eventos possui duplicação de contratos

  MatchEvent mantém simultaneamente:

  - campos modernos: type, teamId, playerId, period;
  - campos legacy: event_type, club, player, player_off, notes.

  Isso aumenta a complexidade de mapeamento e já exige conversões diferentes no frontend e backend.

  Recomendo escolher um contrato canónico e manter um adaptador temporário de compatibilidade.

  ### 10. Estatísticas e placar não possuem uma fonte única

  O placar é parcialmente derivado de eventos, enquanto o Match também guarda home_score e away_score.

  É necessário definir claramente:

  - eventos são a fonte do placar?
  - ou o placar oficial é alterado por uma operação de autoridade?
  - como são tratados autogolos?
  - como é feita correção ou remoção de evento?
  - como se evita duplicidade?

  ## Plano recomendado

  ### Fase 0 — Contrato funcional e máquina de estados

  Criar uma especificação única para:

  - estados;
  - transições permitidas;
  - atores autorizados;
  - pré-condições;
  - eventos de domínio;
  - formato de payload live;
  - regras de correção e auditoria.

  Adicionar explicitamente:

  scheduled
  pre_match
  lineup_submitted
  lineup_locked
  live
  halftime
  extra_time
  penalties
  finished
  report_pending
  approved
  archived

  Se a equipa preferir manter menos estados, lineup_submitted, report_pending e approved podem ser estados internos do
  workflow, mas não devem ficar implícitos.

  ### Fase 1 — Consolidar o domínio backend

  Prioridade alta.

  Implementar no backend:

  - serviço único de transição de estado;
  - validação sequencial das transições;
  - autorização por ator;
  - endpoint de detalhe real;
  - endpoint de relógio/período;
  - idempotência para criação de eventos;
  - auditoria de alterações;
  - bloqueio de eventos fora do período permitido;
  - confirmação e bloqueio de escalações;
  - estado archived;
  - contrato único de MatchEvent.

  Arquivos principais:

  - D:/Donwloads/deascloud/bolayetu/bybackend/competitions/models/match.py
  - D:/Donwloads/deascloud/bolayetu/bybackend/competitions/models/match_event.py
  - D:/Donwloads/deascloud/bolayetu/bybackend/competitions/services/match_service.py
  - D:/Donwloads/deascloud/bolayetu/bybackend/competitions/services/match_event_service.py
  - D:/Donwloads/deascloud/bolayetu/bybackend/competitions/views/match_center_views.py

  ### Fase 2 — Criar o estado canónico frontend

  Substituir a composição atual por um hook ou store central:

  useMatchCenterState(matchId)

  Esse estado deve expor:

  match
  events
  lineups
  stats
  clock
  connection
  permissions
  lastEventSequence

  Todos os consumidores devem ler dessa fonte:

  - scoreboard;
  - timeline;
  - painel de eventos;
  - estatísticas;
  - linha do tempo;
  - notificações visuais;
  - vista tática.

  Os hooks antigos podem permanecer temporariamente como adaptadores, mas não devem manter estados duplicados.

  ### Fase 3 — Unificar cache e sincronização

  Definir uma única árvore de query keys, por exemplo:

  matchCenter
  └── competitionId
      └── matchId
          ├── state
          ├── events
          ├── lineups
          ├── stats
          └── report

  Remover ou marcar como deprecated:

  - matchCenterKeys;
  - eventsByComp;
  - consultas duplicadas de eventos;
  - sincronizações manuais divergentes.

  ### Fase 4 — Event bus realtime

  Implementar um canal específico de MatchCenter, preferencialmente WebSocket ou SSE com eventos de domínio.

  Eventos mínimos:

  match.state_changed
  match.clock_updated
  match.event_created
  match.event_corrected
  match.event_removed
  match.lineup_submitted
  match.lineup_locked
  match.report_submitted
  match.report_approved
  match.archived

  Cada mensagem deve conter:

  match_id
  event_id
  event_type
  sequence
  occurred_at
  payload

  O frontend deve:

  1. receber evento;
  2. ignorar duplicados por event_id ou sequence;
  3. atualizar o estado canónico;
  4. revalidar via HTTP quando detectar lacuna;
  5. cair para polling quando perder conexão.

  ### Fase 5 — Side effects backend

  Mover para o backend:

  - atualização de standings;
  - estatísticas de jogadores;
  - suspensões;
  - notificações push;
  - recalculação de score;
  - avanço de eliminatórias;
  - atualização de histórico.

  Cada side effect deve ser:

  - transacional quando necessário;
  - idempotente;
  - reprocessável;
  - observável;
  - desacoplado da UI.

  O frontend deve apenas submeter o evento e apresentar o resultado.

  ### Fase 6 — UX por ator e ciclo de vida

  Separar claramente as interfaces:

  - Clube: submeter, rever e bloquear escalação.
  - Árbitro/delegado: confirmar partida e registar eventos.
  - Organizador: validar, corrigir, aprovar e arquivar.
  - Público: consumir estado read-only.

  Eliminar o botão genérico “Iniciar Partida” e substituí-lo por ações condicionadas ao estado e ao papel do utilizador.

  ### Fase 7 — Testes

  Adicionar:

  - testes da máquina de estados;
  - testes de autorização por ator;
  - testes de idempotência;
  - testes para autogolos e remoção de eventos;
  - testes de sincronização do estado live;
  - testes de reconexão;
  - testes de fallback para polling;
  - testes de consistência entre scoreboard, timeline e stats;
  - E2E do ciclo completo:

  pré-jogo
  → escalações
  → bloqueio
  → início
  → evento
  → intervalo
  → segundo período
  → fim
  → relatório
  → aprovação
  → arquivo

  ## Ordem de execução recomendada

  1. Contrato e máquina de estados.
  2. Correção dos endpoints e permissões backend.
  3. Unificação dos tipos e cache.
  4. Estado canónico frontend.
  5. Event bus realtime com fallback.
  6. Side effects backend.
  7. UX por ator.
  8. Testes E2E e remoção dos adapters legacy.

  ## Conclusão

  A base atual é suficiente para evoluir, mas não recomendo adicionar novos recursos live antes das fases 0–3. O maior risco
  atual é inconsistência: diferentes componentes podem representar estados diferentes da mesma partida, enquanto side effects
  importantes dependem do frontend.

  O foco deve ser transformar o MatchCenter de um conjunto de páginas e hooks funcionais num fluxo transacional orientado por
  estado, eventos de domínio e permissões por ator.