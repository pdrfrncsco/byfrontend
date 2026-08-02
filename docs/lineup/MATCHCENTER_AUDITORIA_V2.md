# MatchCenter BolaYetu — Auditoria v2
### Estado de Implementação: O que foi feito e o que vem a seguir

> **Data:** 2026-07-29 | **Referência:** Plano v1.0 (2026-07-28)  
> **Metodologia:** Comparação estrutural entre plano original e ficheiros identificados no repositório

---

## VISÃO GERAL

```
Plano original:  38 entregas previstas
Confirmadas:     23 ✅  (61%)
Em falta:         1 ❌  ( 3%)
Incertas:        14 ❓  (36%)  ← precisam de revisão de conteúdo
Extras (bónus):  16 🆕  (não estavam no plano)
```

O módulo teve **crescimento significativo além do plano** — foram implementados 16 ficheiros extras, principalmente cobrindo formatos de competição (liga, torneio, copa) que o plano original não contemplava.

---

## PARTE 1 — O QUE FOI IMPLEMENTADO ✅

### 1.1 Fase 1 — Tipos e API (COMPLETA)

| Ficheiro | Doc | Status |
|----------|-----|--------|
| `types/match.types.ts` | 382 | ✅ Criado |
| `types/match-event.types.ts` | 397 | ✅ Criado |
| `services/match.api.ts` | 384 | ✅ Criado |

**Nota:** `match-events.api.ts` como ficheiro separado não foi encontrado — os endpoints de eventos estão provavelmente integrados em `match.api.ts`, o que é aceitável.

---

### 1.2 Fase 2 — Todos os Hooks Core (COMPLETA)

Todos os 6 hooks previstos foram criados:

| Hook | Doc | Era | Status |
|------|-----|-----|--------|
| `useMatchCenter.ts` | 407 | Refactor | ✅ |
| `useMatchLive.ts` | 388 | Novo | ✅ |
| `useMatchEvents.ts` | 404 | Novo | ✅ |
| `useMatchLineup.ts` | 403 | Novo | ✅ |
| `useMatchReport.ts` | 374 | Novo | ✅ |
| `useMatchStats.ts` | 372 | Novo | ✅ |

---

### 1.3 Fase 3 — Componentes (QUASE COMPLETA — 10/11)

| Componente | Doc | Era | Status |
|------------|-----|-----|--------|
| `MatchCard.tsx` | 405 | Refactor | ✅ |
| `MatchStatusBadge.tsx` | 380 | Novo | ✅ |
| `MatchCountdown.tsx` | 381 | Novo | ✅ |
| `MatchTimeline.tsx` | 398 | Novo | ✅ |
| `MatchScoreboard.tsx` | 394 | Novo | ✅ |
| `MatchEventForm.tsx` | 389 | Novo | ✅ |
| `MatchLineupGrid.tsx` | 400 | Novo | ✅ |
| `MatchStatsPanel.tsx` | 401 | Novo | ✅ |
| `MatchEventsPanel.tsx` | 391 | Refactor | ✅ |
| `MatchRefereeReport.tsx` | 376 | Novo | ✅ |
| `MatchVideoUpload.tsx` | — | Novo | ❌ **ÚNICO EM FALTA** |

---

### 1.4 Fase 4 — Páginas (COMPLETA)

| Página | Doc | Era | Status |
|--------|-----|-----|--------|
| `MatchDetailPage.tsx` | 392 | Novo | ✅ |
| `MatchCenterPage.tsx` | 399 | Refactor | ✅ |
| `MatchLineupPage.tsx` | 406 | Refactor | ✅ |
| `MatchReportPage.tsx` | 385 | Refactor | ✅ |

---

### 1.5 Extras Implementados Além do Plano 🆕

Estes ficheiros **não estavam no plano original** mas foram implementados — cobrem o ecossistema de competições de forma mais ampla:

**Hooks de Formato de Competição:**
- `useCompetitionAdvanced.ts` (doc 340) — lógica avançada multi-formato
- `useCompetitionConfig.ts` (doc 357) — configuração dinâmica de competição
- `useCompetitionMatches.ts` (doc 364) — lista de jogos com filtros
- `useTournamentBracket.ts` (doc 342) — gestão de bracket de torneio
- `useCupBracket.ts` (doc 354) — gestão de bracket de copa
- `useLeagueStandings.ts` (doc 356) — classificação de liga

**Componentes de Formato:**
- `CompetitionFormatRouter.tsx` (doc 349) — roteador dinâmico por formato
- `LeagueStandingsTable.tsx` (doc 344) — standings de liga
- `TournamentGroupsView.tsx` (doc 345) — grupos de torneio
- `TournamentBracket.tsx` (doc 361) — bracket visual torneio
- `CupBracket.tsx` (doc 350) — bracket visual copa
- `StandingsTable.tsx` (doc 73) — tabela de classificação genérica
- `TopScorersTable.tsx` (doc 67) — melhores marcadores
- `PlayerStatsTable.tsx` (doc 86) — estatísticas de jogadores
- `CompetitionManagementFrame.tsx` (doc 209) — painel de admin

---

## PARTE 2 — O QUE ESTÁ INCERTO ❓ (precisa de revisão de conteúdo)

Estes ficheiros **existem** no repositório mas os seus **conteúdos internos não foram verificados**. Podem estar completos, parcialmente implementados ou com stubs.

### 2.1 Fase 5 — Integração (Estado Desconhecido)

Os 4 requisitos de integração do plano precisam de verificação:

| Requisito | Verificação Necessária |
|-----------|----------------------|
| **Polling em `useMatchLive`** | Confirmar: interval de 15s/live, 30s/halftime, cleanup em unmount, visibilitychange handler |
| **Integração com `useNotifications`** | Confirmar: disparo de notificação em goal/red_card/fulltime |
| **React Query cache keys** | Confirmar: `MATCH_QUERY_KEYS` padronizados, staleTime correcto por tipo |
| **RBAC nas acções** | Confirmar: guards em addEvent, submitLineup, submitReport, approveReport |

### 2.2 Qualidade Interna dos Componentes (Estado Desconhecido)

Sem acesso ao conteúdo, não é possível verificar se os componentes implementados respeitam todos os requisitos do plano:

| Componente | Verificar |
|------------|-----------|
| `MatchCard.tsx` | 5 variantes de estado visual? Badge AO VIVO animado? Countdown integrado? |
| `MatchLineupGrid.tsx` | Drag & drop com `@dnd-kit`? Validação de elegibilidade em tempo real? |
| `MatchTimeline.tsx` | Animação de entrada para novos eventos? Scroll automático? |
| `MatchEventsPanel.tsx` | Indicador "A actualizar..." durante polling? Botão role-based? |
| `MatchEventForm.tsx` | Submit optimistic? Validação de minuto 1-120? |
| `MatchScoreboard.tsx` | Half-time score em subscript? Score XXL? |
| `MatchRefereeReport.tsx` | Workflow draft→submit→approve? Upload PDF? |
| `MatchDetailPage.tsx` | Tab navigation completa? Role-based tab visibility? |
| `MatchCenterPage.tsx` | Filtro por jornada? Secção "AO VIVO" separada? |

---

## PARTE 3 — O QUE VEM A SEGUIR

### PRIORIDADE 1 — Testes (Fase 6, Completamente em Falta) 🔴

**É o maior gap actual.** Nenhum teste específico de MatchCenter foi encontrado no repositório. O módulo tem hooks complexos com lógica de estado (polling, optimistic updates, validação de escalação) que são difíceis de depurar sem testes.

#### Testes a criar (por ordem de prioridade):

**Sprint A — Hooks Core (estimativa: 3 dias)**

```
src/tests/modules/competitions/hooks/
├── useMatchLive.test.ts
│   ├── activa polling quando status === 'live'
│   ├── intervalo correcto por estado (15s live, 30s halftime)
│   ├── para polling em unmount (sem memory leak)
│   ├── para polling quando tab em background (visibilitychange)
│   └── usa SSE quando disponível, fallback para polling
│
├── useMatchEvents.test.ts
│   ├── addEvent: optimistic update antes de confirmação
│   ├── addEvent: rollback em caso de falha de rede
│   ├── removeEvent: confirmação antes de remover
│   ├── golos home/away calculados correctamente
│   └── agrupamento por tipo (goals, cards, substitutions)
│
├── useMatchLineup.test.ts
│   ├── valida exactamente 11 jogadores iniciais
│   ├── rejeita lineup sem GK
│   ├── rejeita mais de 7 suplentes
│   ├── bloqueia edição após lockLineup()
│   ├── verifica elegibilidade (suspensão, transferência pendente)
│   └── submitLineup falha se validação não passa
│
├── useMatchCenter.test.ts
│   ├── filtra por jornada correctamente
│   ├── separa live/upcoming/finished
│   ├── setSelectedRound actualiza lista
│   └── refetch funciona após erro
│
└── useMatchReport.test.ts
    ├── canSubmit: apenas árbitro autenticado
    ├── canApprove: apenas delegado/admin
    ├── uploadRefereeDocument: valida tipo PDF
    └── workflow draft → submitted → approved
```

**Sprint B — Componentes (estimativa: 2 dias)**

```
src/tests/modules/competitions/components/
├── MatchCard.test.tsx
│   ├── renderiza badge "AO VIVO" para status=live
│   ├── renderiza countdown para status=scheduled
│   ├── renderiza score final para status=finished
│   ├── renderiza "ADIADO" com estilo correcto para status=postponed
│   └── dispara onClick correctamente
│
├── MatchTimeline.test.tsx
│   ├── renderiza eventos ordenados por minuto
│   ├── home à esquerda, away à direita
│   ├── ícone correcto por tipo de evento
│   └── scroll para evento mais recente em modo live
│
├── MatchEventForm.test.tsx
│   ├── valida minuto entre 1 e 120
│   ├── requer jogador para goal/card
│   ├── requer jogador substituído para substitution
│   └── submit chama addEvent com dados correctos
│
└── MatchLineupGrid.test.tsx
    ├── renderiza 11 posições no campo
    ├── drag & drop move jogador entre posições
    ├── indicador vermelho para jogador não elegível
    └── botão submit desactivado se lineup inválido
```

**Sprint C — Páginas (estimativa: 1 dia)**

```
src/tests/modules/competitions/pages/
├── MatchDetailPage.test.tsx
│   ├── renderiza MatchScoreboard no topo
│   ├── tabs navegam correctamente
│   ├── tab Relatório oculta se sem permissão
│   └── tab Escalação editável em pré-jogo, read-only ao vivo
│
└── MatchCenterPage.test.tsx
    ├── selector de jornada filtra partidas
    ├── secção "AO VIVO" aparece apenas com matches live
    └── estado vazio quando sem partidas na jornada
```

---

### PRIORIDADE 2 — `MatchVideoUpload.tsx` (único ficheiro em falta) 🟡

**O único item do plano não implementado.** Baixa complexidade mas necessário para:
- Upload de highlights por clubs/admins
- Ligação com `MatchDetailPage` (tab ou secção extra)
- Validação de tipo (mp4, mov) e tamanho máximo
- Preview após upload

**Estimativa:** 1 dia

**Contrato mínimo:**
```typescript
interface MatchVideoUploadProps {
  matchId: string;
  canUpload: boolean;          // role-based
  maxSizeMB?: number;          // default: 500
  acceptedFormats?: string[];  // default: ['mp4', 'mov', 'avi']
  onUploadComplete?: (url: string) => void;
}
```

---

### PRIORIDADE 3 — Verificação e Hardening dos Componentes Existentes 🟡

Antes de considerar o módulo production-ready, validar os pontos incertos da Parte 2:

#### 3.1 Checklist `useMatchLive.ts`
- [ ] `clearInterval` em cleanup (`useEffect` return)
- [ ] `EventSource.close()` se SSE usado
- [ ] Handler `document.addEventListener('visibilitychange', ...)`
- [ ] `refetchInterval` desactivado quando `status !== 'live' && status !== 'halftime'`

#### 3.2 Checklist Integração Notificações
- [ ] `useMatchEvents.addEvent` dispara notificação após sucesso
- [ ] Tipos: `GOAL`, `RED_CARD`, `FULLTIME` geram notificação
- [ ] `useNotifications.send()` ou equivalente chamado com payload correcto

#### 3.3 Checklist RBAC
- [ ] `MatchEventForm` não renderiza/desactiva se user não é árbitro/delegado
- [ ] `MatchLineupGrid` não permite edição se user não é treinador/gestor
- [ ] `MatchRefereeReport` submit oculto se user não é árbitro
- [ ] Approve button oculto se user não é admin/federação

#### 3.4 Checklist Design Tokens
- [ ] CSS vars de estado de match definidas (`--match-live`, `--match-scheduled`, etc.)
- [ ] Animações Tailwind adicionadas (`pulse-slow`, `blink`, `slide-in-left`)
- [ ] `prefers-reduced-motion` respeitado nas animações de timeline e scoreboard

---

### PRIORIDADE 4 — Novos Recursos Não Contemplados no Plano Original 🟢

Com a base implementada, estes recursos acrescentam valor significativo:

#### 4.1 `MatchHighlightsGallery` — Galeria de Momentos
Componente para exibir clips de vídeo e fotos dos momentos-chave da partida. Complementa `MatchVideoUpload.tsx` (Prioridade 2).

#### 4.2 `MatchSuspensionManager` — Gestão de Suspensões Automáticas
Após partida finalizada com cartões vermelhos/amarelos acumulados:
- Calcular suspensões automáticas baseadas nas regras da competição
- Marcar jogadores como indisponíveis para próximas partidas
- Integrar com `useMatchLineup` na validação de elegibilidade
- **Nota:** `CompetitionSuspensionsPage.tsx` (doc 215) já existe — este seria o lado de match

#### 4.3 Live Score Widget Embebível
Componente standalone para embeder em sites de clubes/federações:
```tsx
// Uso externo:
<BolaYetuLiveScore matchId="xxx" apiKey="yyy" />
```
Baseado em `MatchScoreboard.tsx` com polling público (sem auth).

#### 4.4 `MatchCalendarExport` — Export para Calendário
Botão em `MatchCard` e `MatchDetailPage` para exportar partida para:
- Google Calendar (link)
- iCal (.ics download)
- Agenda do telemóvel (Web Share API)

#### 4.5 Push Notifications para Subscritores
Extensão da integração de notificações (Prioridade 3.2) para browser push:
- Service Worker com `Push API`
- Subscrição por partida ou por equipa
- Payload: golo, cartão vermelho, fim de jogo

---

## PARTE 4 — ROADMAP ACTUALIZADO

### Sprint Imediato (Esta Semana)
| Tarefa | Prioridade | Dias |
|--------|-----------|------|
| Testes Sprint A — Hooks core | 🔴 Alta | 3 |
| `MatchVideoUpload.tsx` | 🟡 Média | 1 |
| Checklist RBAC (verificação) | 🟡 Média | 0.5 |
| Checklist `useMatchLive` cleanup | 🟡 Média | 0.5 |

### Sprint Seguinte
| Tarefa | Prioridade | Dias |
|--------|-----------|------|
| Testes Sprint B — Componentes | 🟡 Média | 2 |
| Testes Sprint C — Páginas | 🟡 Média | 1 |
| Verificação design tokens/animações | 🟡 Média | 0.5 |
| Integração notificações (confirmar) | 🟡 Média | 1 |

### Sprint Futuro
| Tarefa | Prioridade | Dias |
|--------|-----------|------|
| `MatchSuspensionManager` | 🟢 Normal | 2 |
| `MatchCalendarExport` | 🟢 Normal | 1 |
| `MatchHighlightsGallery` | 🟢 Normal | 2 |
| Live Score Widget embebível | 🟢 Baixa | 3 |
| Push Notifications | 🟢 Baixa | 3 |

---

## PARTE 5 — CHECKLIST PRÉ-PRODUÇÃO

Antes de considerar o MatchCenter production-ready:

**Funcionalidade**
- [ ] Todos os estados de `MatchStatus` têm UI correspondente e testada
- [ ] Polling limpo sem memory leaks (verificado em DevTools)
- [ ] Optimistic updates com rollback em falha de rede
- [ ] Validação de escalação cobre todos os casos (suspensões, transferências, inscrição)
- [ ] Workflow relatório árbitro: draft → submit → approve funcional end-to-end
- [ ] Notificações disparadas para goal/red_card/fulltime

**Segurança/RBAC**
- [ ] Árbitro não pode ver/editar relatórios de outros jogos
- [ ] Treinador não pode editar escalação após lock
- [ ] Delegado não pode aprovar o seu próprio relatório

**Performance**
- [ ] Timeline com >50 eventos não degrada (considerar virtualização)
- [ ] Polling não activo em tabs em background
- [ ] React Query cache correctamente invalidado após mutações

**UX/Acessibilidade**
- [ ] Todos os estados têm loading skeleton
- [ ] Todos os erros têm mensagem accionável
- [ ] `prefers-reduced-motion` respeitado
- [ ] Score legível por leitores de ecrã (aria-label correcto)
- [ ] Mobile responsive a 320px

**Testes**
- [ ] Cobertura ≥ 80% nos hooks (meta do plano original)
- [ ] Todos os cenários de integração do plano cobertos

---

*Auditoria v2 — 2026-07-29 | BolaYetu Platform*
