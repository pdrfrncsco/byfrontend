 Vou por problemas por ordem de impacto:

---
## P1 — Registo de eventos: tipos sem contrato partilhado (crítico)

Existem pelo menos quatro artefactos envolvidos no ciclo de vida de um evento de jogo: `useMatchEvents.ts`, `useMatchLive.ts`, `MatchEventForm.tsx`, `MatchEventsPanel.tsx` e `match-event.types.ts`. O problema é que `match-event.types.ts` está em `competitions/types/` mas não há evidência de que seja consumido de forma consistente por `MatchEventForm` (que provavelmente define o seu próprio shape interno para o formulário) e pelo hook de live (que recebe eventos do servidor num formato potencialmente diferente). Isto cria dois pontos de falha silenciosa: validação no form com um shape, API response com outro, sem garantia de coerência.

**Solução esperada**: `match-event.types.ts` deve ser a única fonte de verdade, e tanto o schema Zod do form como o tipo do hook de live devem derivar dele.

---

## P2 — Escalações duplicadas entre módulos (crítico)

`MatchLineupPage` vive em `competitions/pages/` e `ClubMatchLineupManagerPage` vive em `clubs/pages/`. O hook `useMatchLineup.ts` está em `competitions/hooks/` — o que significa que o clube está a usar um hook que pertence conceptualmente ao árbitro/organizador. Isto é uma violação de domínio clara. O clube precisa de submeter uma escalação; a competição precisa de a validar e publicar. São fluxos distintos que partilham um hook, o que vai criar conflito quando um dos dois lados precisar de comportamento diferente (ex: clube pode editar até X minutos antes, organizador pode sempre editar).

**Solução esperada**: separar `useMatchLineup` em `useClubLineupSubmission` (em clubs) e `useMatchLineupView` (em competitions).

---

## P3 — Transfers fragmentados por três módulos (crítico)

`transfer.schema.ts` está em `players/schemas/`, `transfers-reexport.ts` está em `clubs/services/` e `TransferItem.tsx` está em `organizations/components/`. Isto sugere que a lógica de transferência foi crescendo organicamente em cada módulo que a precisava, sem que nenhum se tornasse o módulo dono. O re-export em `clubs/services/` é um sinal claro de que alguém percebeu o problema mas resolveu com um patch em vez de uma refactorização.

**Solução esperada**: criar um módulo `transfers/` independente, ou pelo menos centralizar schema + tipos + serviço em `players/` e fazer os outros módulos consumir a partir daí sem re-exports.

---

## P4 — Live vs histórico sem separação de estratégia (moderado)

`useMatchLive.ts` e `useMatchDetail.ts` coexistem, mas `match-clock.ts` está isolado em `utils/`. Num jogo a decorrer, o relógio, os eventos live e o scoreboard têm de estar sincronizados — provavelmente via polling ou websocket. Sem ver o código, o padrão de ter `useMatchLive` separado de `useMatchDetail` sugere que podem estar a buscar os mesmos dados por caminhos diferentes. O `MatchCountdown.tsx` e `MatchScoreboard.tsx` em components são potencialmente consumidores dos dois hooks ao mesmo tempo, o que pode causar estado inconsistente entre countdown e scoreboard.

**Solução esperada**: um único `useMatchRealtime` que internamente decide entre polling e websocket, expondo o estado canonico de um jogo em curso.

---

## P5 — Registo de jogadores no módulo errado (baixo impacto mas confuso)

`ClubPlayerRegisterPage` e `ClubPlayerRegistrationRequestsPage` estão em `players/pages/` apesar dos nomes começarem com `Club`. Semanticamente, registar um jogador num clube é uma acção do clube, não do jogador. O jogador passa pelo onboarding (`PlayerOnboarding*` com 6 steps), o clube regista-o — são flows diferentes. Ter ambos em `players/pages/` mistura as perspectivas.

---

## P6 — Schemas de competição sem hierarquia clara (baixo impacto)

Existem `league.schema.ts`, `cup.schema.ts`, `tournament.schema.ts`, `competition.schemas.ts` e `competition.validated.ts` — cinco ficheiros de schema para o mesmo domínio. O `competition.validated.ts` em `services/` é particularmente suspeito: validação deve viver em `schemas/`, não em `services/`. E `competition.schemas.ts` (plural, genérico) sugere que existe um schema raiz que os outros deveriam estender, mas não está claro se a hierarquia está realmente implementada ou apenas implícita.

---

## Resumo das acções

| # | Problema | Acção imediata |
|---|---|---|
| P1 | Tipos de eventos sem contrato | Auditar `MatchEventForm` vs `match-event.types.ts` |
| P2 | Escalações duplicadas | Separar hook por actor (clube vs competição) |
| P3 | Transfers em 3 módulos | Consolidar ownership, eliminar re-export |
| P4 | Live sem estratégia clara | Unificar `useMatchLive` + `useMatchDetail` |
| P5 | Pages de clube em módulo player | Mover para `clubs/pages/` |
| P6 | Schemas de competição sem hierarquia | Mover `validated.ts` para `schemas/` |

Se partilhares o conteúdo dos ficheiros-chave (`useMatchEvents`, `useMatchLineup`, `match-event.types.ts`, `transfers-reexport.ts`), consigo aprofundar o diagnóstico com inconsistências concretas de tipos e fluxo.