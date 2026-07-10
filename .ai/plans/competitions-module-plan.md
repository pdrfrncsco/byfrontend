/# Plano de Implementação — Módulo Competitions (Frontend)

## Análise de Gap

### Backend Disponível (APIs)
| Endpoint | Método | Descrição | Frontend |
|----------|--------|-----------|----------|
| `/competitions/` | GET | Lista competições | ✅ Implementado |
| `/competitions/` | POST | Criar competição | ⚠️ Parcial |
| `/competitions/<id>/` | GET | Detalhe competição | ❌ Falta hook |
| `/competitions/<id>/` | PATCH | Atualizar competição | ⚠️ Parcial |
| `/competitions/<id>/register-club/` | POST | Registar clube | ⚠️ Parcial |
| `/competitions/<id>/generate-schedule/` | POST | Gerar calendário | ⚠️ Parcial |
| `/competitions/<id>/matches/` | GET | Lista jogos | ✅ Implementado |
| `/competitions/<id>/standings/` | GET | Tabela classificativa | ✅ Implementado |
| `/competitions/<id>/regulations/` | GET/POST | Regulamentos | ❌ Não implementado |
| `/competitions/matches/<id>/` | PATCH | Atualizar jogo | ✅ Implementado |
| `/competitions/<id>/matches/<id>/events/` | GET/POST | Eventos do jogo | ✅ Implementado |
| `/competitions/<id>/matches/<id>/events/<id>/` | DELETE | Remover evento | ✅ Implementado |
| `/competitions/<id>/stats/` | GET | Estatísticas jogadores | ✅ Implementado |
| `/competitions/<id>/suspensions/` | GET | Suspensões | ❌ Não implementado |
| `/competitions/<id>/eligibility/<player>/` | GET | Elegibilidade | ❌ Não implementado |
| `/competitions/<id>/fair-play-ranking/` | GET | Ranking Fair Play | ❌ Não implementado |
| `/competitions/rankings/top-scorers/` | GET | Melhores marcadores | ❌ Não implementado |
| `/competitions/rankings/season/` | GET | Ranking época | ❌ Não implementado |
| `/competitions/matches/<id>/lineups/` | GET/POST | Submeter escalação | ❌ Não implementado |
| `/competitions/matches/<id>/lineups/<id>/` | GET | Detalhe escalação | ❌ Não implementado |
| `/competitions/matches/<id>/lineups/confirm/` | POST | Confirmar escalação | ❌ Não implementado |
| `/competitions/matches/<id>/lineups/lock/` | POST | Bloquear escalação | ❌ Não implementado |
| `/competitions/matches/<id>/report/` | GET | Relatório do jogo | ❌ Não implementado |
| `/competitions/matches/<id>/report/create/` | POST | Criar relatório | ❌ Não implementado |
| `/competitions/matches/<id>/report/add-goal/` | POST | Adicionar golo | ❌ Não implementado |
| `/competitions/matches/<id>/report/update-stats/` | POST | Atualizar estatísticas | ❌ Não implementado |

### Estado Atual do Frontend

**Tipos** (`types/competition.types.ts`):
- ✅ `Competition`, `CompetitionCreateData`, `CompetitionUpdateData`
- ✅ `Match`, `MatchStatus`, `Standing`
- ✅ `MatchEvent`, `EventType`, `MatchEventCreateData`
- ✅ `PlayerStats`
- ❌ Faltam: `LineupSubmission`, `MatchReport`, `Goal`, `MatchStats`, `Suspension`, `FairPlayRanking`

**Services** (`services/competition.api.ts`):
- ✅ CRUD básico de competições
- ✅ `registerClub`, `generateSchedule`
- ✅ `listMatches`, `getStandings`, `updateMatchScore`
- ✅ `listMatchEvents`, `addMatchEvent`, `deleteMatchEvent`
- ✅ `getPlayerStats`
- ❌ Faltam: endpoints de lineups, reports, regulations, fair play, rankings

**Hooks** (`hooks/`):
- ✅ `useCompetitions`, `useCreateCompetition`, `useUpdateCompetition`
- ✅ `useCompetitionMatches`, `useCompetitionStandings`
- ✅ `useRegisterClub`, `useGenerateSchedule`, `useUpdateMatchScore`
- ✅ `useMatchEvents`, `useAddMatchEvent`, `useDeleteMatchEvent`
- ✅ `usePlayerStats`
- ❌ Faltam: hooks de lineups, reports, regulations, fair play, rankings

**Pages** (`pages/`):
- ⚠️ `CompetitionListPage.tsx` — Básico, sem filtros, pesquisa, paginação
- ⚠️ `CompetitionDetailPage.tsx` — Funcional mas sem tabs, UX melhorável

**Components** (`components/`):
- ✅ `MatchEventsPanel.tsx` — Funcional
- ✅ `PlayerStatsTable.tsx` — Funcional
- ❌ Faltam: componentes de lineups, standings melhorado, match card

---

## Plano de Implementação

### Fase 1: Fundação (Tipos, Services, Hooks) ✅ Prioridade Alta

#### 1.1 Tipos Completos
**Ficheiro:** `types/competition.types.ts`

```typescript
// Adicionar:
- LineupSubmission, LineupPlayer, MatchLineup
- MatchReport, Goal, MatchStats
- Suspension, FairPlayRanking
- TopScorer, SeasonRanking
- CompetitionRegulation
- PaginatedResponse<T>
```

#### 1.2 Services Completos
**Ficheiro:** `services/competition.api.ts`

```typescript
// Adicionar:
- getCompetition(id)
- getLineups(matchId), submitLineup(matchId, data), confirmLineup(matchId), lockLineup(matchId)
- getMatchReport(matchId), createMatchReport(matchId, data)
- addGoal(matchId, data), updateStats(matchId, data)
- getRegulations(competitionId), createRegulation(competitionId, data)
- getSuspensions(competitionId), checkEligibility(competitionId, playerId)
- getFairPlayRanking(competitionId)
- getTopScorers(), getSeasonRanking()
```

#### 1.3 Hooks Completos
**Ficheiro:** `hooks/useCompetitions.ts` e novos ficheiros

```typescript
// Adicionar:
- useCompetition(id)
- useLineups(matchId), useSubmitLineup(), useConfirmLineup(), useLockLineup()
- useMatchReport(matchId), useCreateMatchReport()
- useRegulations(competitionId), useCreateRegulation()
- useSuspensions(competitionId), useCheckEligibility()
- useFairPlayRanking(competitionId)
- useTopScorers(), useSeasonRanking()
```

---

### Fase 2: Páginas Públicas ✅ Prioridade Alta

#### 2.1 Lista Pública de Competições
**Ficheiro:** `pages/CompetitionListPage.tsx` — Refatorar

Funcionalidades:
- [ ] Search input com debounce
- [ ] Filtro por tipo (league, tournament, cup)
- [ ] Filtro por status (draft, active, completed)
- [ ] Filtro por época
- [ ] Paginação
- [ ] Grid responsivo de cards
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Error state com retry

#### 2.2 Detalhe Público da Competição
**Ficheiro:** `pages/CompetitionDetailPage.tsx` — Refatorar

Funcionalidades:
- [ ] Hero section com nome, tipo, época
- [ ] Tabs: Jogos | Classificação | Estatísticas | Regulamentos
- [ ] Widget de próximos jogos
- [ ] Tabela classificativa interativa
- [ ] Top marcadores
- [ ] Fair Play ranking
- [ ] Usar Design System components

#### 2.3 Componentes de Suporte
**Ficheiros:**
- `components/CompetitionCard.tsx` — Novo
- `components/MatchCard.tsx` — Novo
- `components/StandingsTable.tsx` — Novo (melhorado)
- `components/TopScorersTable.tsx` — Novo
- `components/CompetitionHeader.tsx` — Novo
- `components/CompetitionSkeleton.tsx` — Novo
- `components/CompetitionEmptyState.tsx` — Novo

---

### Fase 3: Gestão de Competições ✅ Prioridade Média

#### 3.1 Criar Competição
**Ficheiro:** `pages/CompetitionCreatePage.tsx` — Novo

Funcionalidades:
- [ ] Formulário com RHF + Zod
- [ ] Nome, tipo, época
- [ ] Status inicial (draft/active)
- [ ] Validações
- [ ] Preview antes de submeter

#### 3.2 Configurações da Competição
**Ficheiro:** `pages/CompetitionSettingsPage.tsx` — Novo

Funcionalidades:
- [ ] Editar detalhes
- [ ] Gestão de regulamentos
- [ ] Regras de pontuação
- [ ] Configurações de fair play

#### 3.3 Registo de Clubes
**Ficheiro:** `pages/CompetitionRegistrationPage.tsx` — Novo

Funcionalidades:
- [ ] Lista de clubes registados
- [ ] Adicionar clube (search/autocomplete)
- [ ] Remover clube
- [ ] Verificar elegibilidade

#### 3.4 Geração de Calendário
**Ficheiro:** `pages/CompetitionSchedulePage.tsx` — Novo

Funcionalidades:
- [ ] Configurar data inicial
- [ ] Intervalo entre jornadas
- [ ] Turno único ou duplo
- [ ] Preview do calendário
- [ ] Gerar e confirmar

---

### Fase 4: Match Center ✅ Prioridade Alta

#### 4.1 Centro de Jogo
**Ficheiro:** `pages/MatchCenterPage.tsx` — Novo

Funcionalidades:
- [ ] Detalhes do jogo (equipas, data, local)
- [ ] Timeline de eventos
- [ ] Estatísticas em tempo real
- [ ] Ações rápidas (adicionar evento)
- [ ] Substituições interativas

#### 4.2 Escalações
**Ficheiro:** `pages/MatchLineupPage.tsx` — Novo

Funcionalidades:
- [ ] Formação visual (drag & drop)
- [ ] Lista de jogadores disponíveis
- [ ] Definir titulares e suplentes
- [ ] Capitão e guarda-redes
- [ ] Confirmar e bloquear

#### 4.3 Relatório de Jogo
**Ficheiro:** `pages/MatchReportPage.tsx` — Novo

Funcionalidades:
- [ ] Relatório oficial
- [ ] Golos com detalhes
- [ ] Estatísticas completas
- [ ] Exportar PDF (opcional)

---

### Fase 5: Rankings e Fair Play ✅ Prioridade Média

#### 5.1 Rankings
**Ficheiro:** `pages/CompetitionRankingsPage.tsx` — Novo

Funcionalidades:
- [ ] Top marcadores
- [ ] Melhores assistências
- [ ] Ranking Fair Play
- [ ] Ranking da época
- [ ] Filtros por competição

#### 5.2 Suspensões
**Ficheiro:** `pages/CompetitionSuspensionsPage.tsx` — Novo

Funcionalidades:
- [ ] Lista de jogadores suspensos
- [ ] Detalhes da suspensão
- [ ] Jogos restantes
- [ ] Cancelar suspensão (admin)

---

### Fase 6: Qualidade ✅ Prioridade Alta

#### 6.1 Testes
**Ficheiros:**
- `tests/services/competition.api.test.ts`
- `tests/hooks/useCompetitions.test.ts`
- `tests/components/CompetitionCard.test.tsx`
- `tests/components/StandingsTable.test.tsx`

#### 6.2 Estados de Erro
- [ ] Integrar PermissionDenied (403)
- [ ] Integrar NotFound (404)
- [ ] Integrar ValidationError (422)
- [ ] Integrar ServerError (500)

#### 6.3 Acessibilidade
- [ ] Focus management
- [ ] ARIA labels
- [ ] Keyboard navigation

---

## Ordem de Execução Recomendada

1. **Fase 1** — Fundação (1-2 horas)
2. **Fase 2** — Páginas Públicas (4-6 horas)
3. **Fase 6** — Qualidade (integração contínua)
4. **Fase 3** — Gestão de Competições (3-4 horas)
5. **Fase 4** — Match Center (4-6 horas)
6. **Fase 5** — Rankings e Fair Play (2-3 horas)

---

## Dependências

- `@tanstack/react-query` — ✅ Instalado
- `@tanstack/react-table` — ✅ Instalado
- `react-hook-form` — ✅ Instalado
- `zod` — ✅ Instalado
- `lucide-react` — ✅ Instalado
- `sonner` — ✅ Instalado (toast)

---

## Rotas Sugeridas

```typescript
// competitions/routes.ts
export const ROUTES = {
  COMPETITIONS: '/competitions',
  COMPETITION_DETAIL: (id: string) => `/competitions/${id}`,
  COMPETITION_CREATE: '/dashboard/competitions/create',
  COMPETITION_SETTINGS: (id: string) => `/dashboard/competitions/${id}/settings`,
  COMPETITION_REGISTRATION: (id: string) => `/dashboard/competitions/${id}/registration`,
  COMPETITION_SCHEDULE: (id: string) => `/dashboard/competitions/${id}/schedule`,
  MATCH_CENTER: (compId: string, matchId: string) => `/competitions/${compId}/matches/${matchId}`,
  MATCH_LINEUP: (compId: string, matchId: string) => `/competitions/${compId}/matches/${matchId}/lineup`,
  MATCH_REPORT: (compId: string, matchId: string) => `/competitions/${compId}/matches/${matchId}/report`,
  COMPETITION_RANKINGS: (id: string) => `/competitions/${id}/rankings`,
  COMPETITION_SUSPENSIONS: (id: string) => `/competitions/${id}/suspensions`,
}
```

---

## Checklist de Conformidade com Skills

### Frontend Engineer Skill
- [x] Feature-based architecture
- [ ] Service layer (completo)
- [ ] TanStack Query (completo)
- [ ] RHF + Zod (parcial)
- [ ] Loading/Empty/Error states
- [ ] Testes

### Frontend Reviewer Skill
- [ ] Componentes < 300 linhas
- [ ] Tipos TypeScript completos
- [ ] Acessibilidade WCAG 2.1
- [ ] Responsivo

### Dashboard Designer Skill
- [ ] KPIs widgets
- [ ] Quick actions
- [ ] Activity feed

---

**Próximo passo:** Executar Fase 1 — Fundação
