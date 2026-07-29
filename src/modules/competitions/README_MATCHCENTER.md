# MatchCenter - BolaYetu

Módulo de MatchCenter para gestão de partidas, escalações, eventos e estatísticas.

## Estado da Implementação (2026-07-29)

### ✅ Fase 1 — Tipos e API Base (COMPLETA)
- [x] `types/match.types.ts` — Tipos principais (Match, MatchEvent, MatchLineup, MatchStats)
- [x] `types/match-event.types.ts` — Tipos de eventos (goal, card, substitution)
- [x] `services/match.api.ts` — Todos os endpoints da API

### ✅ Fase 2 — Hooks Core (COMPLETA)
- [x] `useMatchCenter.ts` — Lista de partidas com filtros
- [x] `useMatchLive.ts` — Polling ao vivo (15s) + visibility change
- [x] `useMatchEvents.ts` — CRUD de eventos com optimistic updates
- [x] `useMatchLineup.ts` — Gestão de escalações
- [x] `useMatchReport.ts` — Workflow de relatório árbitro
- [x] `useMatchStats.ts` — Estatísticas com polling ao vivo

### ✅ Fase 3 — Componentes UI (COMPLETA)
- [x] `MatchCard.tsx` — Card com estados visuais (agendado/ao vivo/terminado)
- [x] `MatchStatusBadge.tsx` — Badge com 8 estados e minuto ao vivo
- [x] `MatchCountdown.tsx` — Countdown regressivo até kick-off
- [x] `MatchTimeline.tsx` — Timeline vertical de eventos
- [x] `MatchScoreboard.tsx` — Placar principal (compact/full)
- [x] `MatchEventForm.tsx` — Formulário de registo de evento
- [x] `MatchLineupGrid.tsx` — Grid visual da escalação
- [x] `MatchStatsPanel.tsx` — Painel comparativo de estatísticas
- [x] `MatchRefereeReport.tsx` — Workflow árbitro com upload PDF
- [x] `MatchEventsPanel.tsx` — Painel live com atualizações automáticas

### ✅ Fase 4 — Páginas (COMPLETA)
- [x] `MatchDetailPage.tsx` — Hub unificado com tabs (Escalação/Eventos/Stats/Relatório)
- [x] `MatchCenterPage.tsx` — Centro de jogos por jornada (lista)
- [x] `MatchLineupPage.tsx` — Escalações com drag & drop
- [x] `MatchReportPage.tsx` — Relatório árbitro com workflow

## Estrutura de Ficheiros

```
src/modules/competitions/
├── pages/
│   ├── MatchDetailPage.tsx          ← Hub unificado com tabs (NOVO)
│   ├── MatchCenterPage.tsx          ← Centro de jogos por jornada (NOVO)
│   ├── MatchLineupPage.tsx          ← Escalações
│   └── MatchReportPage.tsx          ← Relatório árbitro
├── components/
│   ├── MatchCard.tsx                ← Card de partida com estados
│   ├── MatchStatusBadge.tsx         ← Badge de estado ao vivo
│   ├── MatchCountdown.tsx           ← Countdown para kick-off
│   ├── MatchTimeline.tsx            ← Timeline vertical de eventos
│   ├── MatchScoreboard.tsx          ← Placar principal
│   ├── MatchEventForm.tsx           ← Formulário de evento
│   ├── MatchLineupGrid.tsx          ← Grid drag & drop
│   ├── MatchStatsPanel.tsx          ← Estatísticas comparativas
│   ├── MatchRefereeReport.tsx       ← Workflow árbitro
│   └── MatchEventsPanel.tsx         ← Painel live
├── hooks/
│   ├── useMatchCenter.ts            ← Lista com filtros
│   ├── useMatchLive.ts              ← Polling ao vivo
│   ├── useMatchEvents.ts            ← CRUD eventos
│   ├── useMatchLineup.ts            ← Gestão escalação
│   ├── useMatchReport.ts            ← Workflow relatório
│   └── useMatchStats.ts             ← Estatísticas
├── types/
│   ├── match.types.ts               ← Tipos principais
│   └── match-event.types.ts         ← Tipos de eventos
└── services/
    └── match.api.ts                 ← API endpoints
```

## Rotas Disponíveis

| Rota | Componente | Descrição |
|------|-----------|-----------|
| `/competitions/:compId/matches/:matchId` | MatchDetailPage | Hub unificado com tabs |
| `/dashboard/competitions/:compId/matches/:matchId` | MatchDetailPage | Dashboard (admin) |
| `/competitions/:compId/match-center` | MatchCenterPage | Centro de jogos por jornada |
| `/dashboard/competitions/:compId/match-center` | MatchCenterPage | Dashboard (admin) |
| `/competitions/:compId/matches/:matchId/lineup` | MatchLineupPage | Escalações |
| `/competitions/:compId/matches/:matchId/report` | MatchReportPage | Relatório árbitro |

## Funcionalidades Implementadas

### Match Detail Page (Hub Unificado)
- ✅ Scoreboard em destaque com live update
- ✅ Tabs: Escalação, Eventos, Estatísticas, Relatório
- ✅ Indicador de atualização ao vivo
- ✅ Navegação por tabs com role-based access control
- ✅ Timeline de eventos com minuto ao vivo
- ✅ Lazy loading de componentes pesados (MatchLineupPage, MatchReportPage)

### Match Center Page (Centro de Jogos)
- ✅ Lista de partidas por jornada
- ✅ Filtro por status (Ao vivo/Seguintes/Finalizados/Todos)
- ✅ Jornada selector
- ✅ Card de partida com estado visual
- ✅ Countdown para partidas agendadas
- ✅ Live pulse para partidas ao vivo

### Eventos (Live Feed)
- ✅ Polling a cada 15s quando partida ao vivo
- ✅ Optimistic updates para registo de eventos
- ✅ Rollback automático em caso de falha
- ✅ Timeline vertical com separação por equipa
- ✅ Ícones distintos por tipo de evento

### Escalações
- ✅ Grid visual do campo com formação
- ✅ Drag & drop de jogadores entre titulares/suplentes
- ✅ Validação de elegibilidade
- ✅ Confirmação e bloqueio de escalação
- ✅ Indicadores de elegibilidade (verde/âmbar/vermelho)

### Relatório Árbitro
- ✅ Workflow multi-step: Rascunho → Submetido → Aprovado
- ✅ Upload de documento oficial (PDF)
- ✅ Assinatura digital confirmada
- ✅ Visualização por delegados/admin

### Estatísticas
- ✅ Barras comparativas (Casa × Fora)
- ✅ Métricas: Posse, Remates, Cantos, Faltas, Cartões
- ✅ Polling automático durante jogo (30s)

### Notificações
- ✅ toast notifications para todas as operações async
- ✅ Feedback visual para sucesso/erro

## Funcionalidades em Planeamento (Fase 5+)

### Integração e Tempo Real
- [ ] SSE/WebSocket para atualizações push
- [ ] Integração com `useNotifications` para subscritores do match
- [ ] Strategy de cache com React Query (staleTime configurável)

### Design e UX
- [ ] Paleta de cores por estado (match status)
- [ ] Animações de transição (slide-in, pulse)
- [ ] Mobile responsive (320px mínimo)

### Testes
- [ ] Testes de hooks (coverage ≥ 80%)
- [ ] Testes de componentes (React Testing Library)
- [ ] Testes de página (End-to-end)

## APIs Backend Necessárias

| Endpoint | Método | Prioridade |
|----------|--------|-----------|
| `GET /competitions/:id/matches` | GET | Alta |
| `GET /competitions/:id/matches/:matchId` | GET | Alta |
| `GET /competitions/:id/matches/:matchId/events` | GET | Alta |
| `POST /competitions/:id/matches/:matchId/events` | POST | Alta |
| `DELETE /competitions/:id/matches/:matchId/events/:eventId` | DELETE | Média |
| `GET /competitions/matches/:matchId/lineups/:teamId` | GET | Alta |
| `POST /competitions/matches/:matchId/lineups/` | POST | Alta |
| `POST /competitions/matches/:matchId/lineups/lock/` | POST | Média |
| `GET /competitions/matches/:matchId/report/` | GET | Normal |
| `POST /competitions/matches/:matchId/report/` | POST | Normal |
| `POST /competitions/matches/:matchId/report/document/` | POST | Média |

## Dependências Externas

Bibliotecas utilizadas:
- `@tanstack/react-query` — Gerenciamento de estado assíncrono
- `lucide-react` — Ícones SVG
- `sonner` — Toast notifications
- `react-router-dom` — Navegação

---

*Atualizado em 2026-07-29 | BolaYetu Platform*
