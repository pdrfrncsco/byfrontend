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




  # AUDITORIA 2
  ## Diagnóstico actual

  O problema principal está no contrato do relógio:

  - O backend guarda current_period e current_minute, mas não guarda o momento em que o
    relógio começou.

  - O current_minute tem valor padrão 0. Portanto, o Frontend recebe sempre um minuto
    explícito e não consegue calcular a passagem do tempo.

  - O Frontend só tenta inferir o minuto através do último evento registado, o que não
    é suficiente.

  - A API actual permite apenas transições genéricas:

    scheduled → pre_match → live → halftime → live → finished

  - Não existem comandos explícitos para:
      - iniciar primeiro tempo;
      - terminar primeiro tempo;
      - iniciar segundo tempo;
      - terminar segundo tempo;
      - iniciar prolongamento;
      - terminar primeiro período do prolongamento;
      - iniciar segundo período do prolongamento;
      - iniciar penáltis;
      - finalizar a partida.

  - O modelo actual tem apenas extra_time, sem distinguir os dois períodos do
    prolongamento.

  - Não existe controlo de concorrência para impedir que dois operadores alterem o
    relógio simultaneamente.

  ## Fluxo funcional proposto

  Pré-jogo
     ↓
  Iniciar 1.º tempo
     ↓
  1.º tempo ao vivo
     ↓
  Terminar 1.º tempo
     ↓
  Intervalo
     ↓
  Iniciar 2.º tempo
     ↓
  2.º tempo ao vivo
     ↓
  Terminar partida
     ├── Resultado decidido → Finalizar
     ├── Empate com prolongamento → Iniciar prolongamento
     └── Empate com penáltis → Iniciar penáltis
                           ↓
                      Finalizar

  Para competições com prolongamento:

  Prolongamento 1.º período
     ↓
  Intervalo do prolongamento
     ↓
  Prolongamento 2.º período
     ↓
  Finalizar ou penáltis

  ## Plano de implementação

  ### 1. Backend: relógio autoritativo

  Adicionar ao modelo Match:

  - clock_running
  - clock_started_at
  - clock_stopped_at
  - clock_elapsed_seconds
  - stoppage_time_minutes
  - clock_version ou updated_at para controlo de concorrência
  - período mais detalhado:

  first_half
  halftime
  second_half
  extra_first_half
  extra_halftime
  extra_second_half
  penalties
  finished

  O minuto visível deverá ser calculado no servidor:

  minuto_actual =
  clock_elapsed_seconds
  + (agora - clock_started_at)

  Assim, o relógio não depende da criação de eventos e continua correcto mesmo que
  nenhum evento tenha sido registado.

  ### 2. API de comandos do relógio

  Manter o endpoint de transição para alterações administrativas, mas criar uma API
  específica para comandos do jogo:

  POST /competitions/matches/{id}/clock/action/

  Payload:

  {
    "action": "start_first_half",
    "stoppage_time_minutes": 0,
    "expected_version": 12
  }

  Acções previstas:

  start_first_half
  end_first_half
  start_second_half
  end_second_half
  start_extra_time
  end_extra_first_half
  start_extra_second_half
  end_extra_time
  start_penalties
  finish_match
  set_stoppage_time
  pause_clock
  resume_clock

  Cada acção deverá:

  - validar o estado actual;
  - validar a configuração da competição;
  - verificar permissões do árbitro/delegado/operador;
  - actualizar o relógio;
  - criar um registo de auditoria;
  - publicar evento realtime;
  - rejeitar versões antigas do estado.

  ### 3. Regras de competição

  O backend deve usar a configuração da competição para decidir se permite:

  - prolongamento;
  - penáltis;
  - duração dos tempos;
  - duração do prolongamento;
  - tempo máximo de acréscimo;
  - finalizar directamente num empate;
  - competição por grupos ou eliminatória.

  Exemplo:

  {
    "half_duration": 45,
    "extra_time_enabled": true,
    "extra_half_duration": 15,
    "penalties_enabled": true
  }

  Estas regras não devem ficar codificadas apenas no Frontend.

  ### 4. Registo de auditoria

  Criar MatchClockAction ou integrar no sistema de auditoria existente:

  - partida;
  - utilizador;
  - acção;
  - período anterior;
  - período novo;
  - minuto anterior;
  - minuto novo;
  - acréscimo;
  - data/hora;
  - resultado;
  - motivo de erro, quando aplicável.

  Isto permitirá corrigir erros do árbitro sem perder o histórico.

  ### 5. UX/UI do painel de controlo

  Adicionar ao detalhe da partida um painel visível apenas para utilizadores
  autorizados:

  ┌────────────────────────────────────┐
  │  AO VIVO                           │
  │  1T 34'                            │
  │                                    │
  │  [Adicionar acréscimo]             │
  │  [Terminar 1.º tempo]              │
  └────────────────────────────────────┘

  As acções devem mudar conforme o estado:

   Estado                Acções principais
  ━━━━━━━━━━━━━━━━━━━━  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   pre_match             Iniciar 1.º tempo
  ────────────────────  ──────────────────────────────────────
   live + first_half     Acréscimo, terminar 1.º tempo
  ────────────────────  ──────────────────────────────────────
   halftime              Iniciar 2.º tempo
  ────────────────────  ──────────────────────────────────────
   live + second_half    Acréscimo, terminar partida
  ────────────────────  ──────────────────────────────────────
   Empate no fim         Finalizar, prolongamento ou penáltis
  ────────────────────  ──────────────────────────────────────
   extra_first_half      Acréscimo, terminar período
  ────────────────────  ──────────────────────────────────────
   extra_halftime        Iniciar segundo prolongamento
  ────────────────────  ──────────────────────────────────────
   extra_second_half     Finalizar ou iniciar penáltis
  ────────────────────  ──────────────────────────────────────
   penalties             Registar cobrança, finalizar
  ────────────────────  ──────────────────────────────────────
   finished              Relatório, arquivar

  O botão destrutivo ou irreversível deve exigir confirmação contextual.

  ### 6. Relógio no Frontend

  Criar um hook dedicado:

  useMatchClock(match)

  Responsabilidades:

  - calcular o minuto localmente com base em clock_started_at;
  - sincronizar com o servidor;
  - corrigir drift;
  - congelar durante intervalo;
  - mostrar acréscimos;
  - indicar “sincronizado”, “a sincronizar” ou “offline”;
  - actualizar quando receber SSE/WebSocket;
  - fazer fallback para polling.

  O MatchScoreboard e MatchStatusBadge devem consumir o mesmo hook para evitar relógios
  diferentes no ecrã.

  ### 7. Eventos de jogo

  Cada evento deverá guardar:

  - período;
  - minuto oficial;
  - minuto de acréscimo;
  - timestamp do servidor;
  - autor;
  - idempotency key.

  Exemplos:

  Golo aos 45+2'
  Cartão aos 78'
  Substituição aos 90+4'
  Golo no prolongamento aos ET 7'
  Cobrança de penálti durante PEN

  Os eventos de penáltis devem ser distinguidos dos penáltis marcados durante o jogo.

  ### 8. Actualização realtime

  Publicar snapshots com:

  {
    "match_id": "...",
    "status": "live",
    "period": "first_half",
    "clock_running": true,
    "clock_started_at": "...",
    "elapsed_seconds": 2040,
    "current_minute": 34,
    "stoppage_time_minutes": 2,
    "version": 13
  }

  O Frontend deve:

  - actualizar o relógio sem recarregar a página;
  - rejeitar snapshots antigos;
  - mostrar fallback de polling;
  - indicar perda de ligação;
  - sincronizar após reconexão.

  ### 9. Testes obrigatórios

  Backend:

  - transições válidas e inválidas;
  - relógio inicia e para correctamente;
  - intervalo congela o relógio;
  - acréscimos;
  - prolongamento;
  - penáltis;
  - concorrência entre dois operadores;
  - permissões;
  - idempotência;
  - eventos realtime;
  - relatório final e standings.

  Frontend:

  - contagem de minutos sem eventos;
  - sincronização depois de refresh;
  - recuperação após offline;
  - mudança de período;
  - confirmação de acções irreversíveis;
  - ocultação de botões por papel;
  - modo arquivado;
  - relógio em dispositivos com hora local incorrecta.

  ## Ordem recomendada

  1. Corrigir o modelo e serviço de relógio no backend.
  2. Criar endpoint de comandos e auditoria.
  3. Implementar SSE/WebSocket com snapshot autoritativo.
  4. Criar useMatchClock.
  5. Substituir a lógica actual do MatchScoreboard.
  6. Criar painel contextual de comandos.
  7. Integrar acréscimos, prolongamento e penáltis.
  8. Validar permissões, concorrência e testes end-to-end.

  O primeiro bloqueio funcional a resolver é o relógio autoritativo no backend. Sem
  clock_started_at ou equivalente, qualquer contador no Frontend será apenas uma
  estimativa e poderá ficar divergente do estado oficial da partida.