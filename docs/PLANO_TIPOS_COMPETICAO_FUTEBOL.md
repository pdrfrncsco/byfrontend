# Plano de Implementação — Tipos de Competição de Futebol

> **Modalidade:** Futebol  
> **Escopo:** Campeonato (Liga), Torneio, Taça/Copa  
> **Base:** Auditoria do repositório em 2026-07-27

---

## 1. Diagnóstico do Estado Actual

### 1.1 O que já existe

| Artefacto | Localização | Estado |
|---|---|---|
| `competition.types.ts` | `src/modules/competitions/types/` | Tipos genéricos, sem discriminação por format |
| `competition.schemas.ts` | `src/modules/competitions/schemas/` | Schemas Zod sem lógica por tipo |
| `competition.api.ts` | `src/modules/competitions/services/` | CRUD genérico — sem endpoints por fase/formato |
| `useCompetitions.ts` | hooks | Listagem genérica |
| `useCompetitionFull.ts` | hooks | Dados completos sem separação de fases |
| `useCompetitionPhase3.ts` | hooks | Fase 3 hardcoded — não genérico |
| `useCompetitionAdvanced.ts` | hooks | Lógica avançada misturada |
| `useMatchCenter.ts` | hooks | Match center sem contexto de formato |
| `CompetitionAdminDashboardPage` | pages | Dashboard único para todos os tipos |
| `CompetitionSchedulePage` | pages | Calendário sem lógica de jornada/grupo/fase |
| `CompetitionRankingsPage` | pages | Classificação sem distinção liga/grupo/chave |

### 1.2 Problemas Críticos Identificados

1. **`competition_format` não tipado discriminadamente** — o campo existe mas é `string` livre, sem union type.
2. **Fases (`phases`) são arrays genéricos** — não modelam a diferença entre jornadas (liga), grupos+eliminatórias (torneio) ou rondas de eliminação (taça).
3. **`useCompetitionPhase3` é hardcode** — assume sempre fase 3; não serve liga (sem fases) nem taça (fases dinâmicas).
4. **UI de classificação é uma única tabela** — liga requer tabela de pontos corridos; torneio requer grupos + bracket; taça requer árvore de eliminação.
5. **Criação de competição não diverge por tipo** — o wizard de criação é linear sem steps condicionais por formato.
6. **`CompetitionManagementFrame`** carrega navegação estática — não adapta tabs ao tipo de competição.

---

## 2. Modelo de Dados Alvo

### 2.1 Enum de Formato

```typescript
// src/modules/competitions/types/competition-format.types.ts

export const COMPETITION_FORMAT = {
  LEAGUE:      'league',      // Campeonato — pontos corridos
  TOURNAMENT:  'tournament',  // Torneio — grupos + eliminatórias
  CUP:         'cup',         // Taça/Copa — eliminação directa
} as const;

export type CompetitionFormat = typeof COMPETITION_FORMAT[keyof typeof COMPETITION_FORMAT];
```

### 2.2 Configuração por Formato (discriminated union)

```typescript
// Liga — pontos corridos
export interface LeagueConfig {
  format: 'league';
  rounds: number;              // número de jornadas
  homeAndAway: boolean;        // ida e volta
  pointsWin: number;           // default 3
  pointsDraw: number;          // default 1
  pointsLoss: number;          // default 0
  tiebreakers: TiebreakerRule[]; // critérios de desempate ordenados
  relegationZone: number;      // nº de equipas a descer
  promotionZone: number;       // nº de equipas a subir
}

// Torneio — fase de grupos + eliminatórias
export interface TournamentConfig {
  format: 'tournament';
  groupStage: {
    numberOfGroups: number;
    teamsPerGroup: number;
    qualifiersPerGroup: number;   // quantos passam de cada grupo
    homeAndAway: boolean;
  };
  knockoutStage: {
    rounds: KnockoutRound[];      // ['quarter-final','semi-final','final']
    twoLegs: boolean;             // ida e volta nas eliminatórias
    extraTimeOnDraw: boolean;
    penaltiesOnDraw: boolean;
  };
}

// Taça/Copa — eliminação directa
export interface CupConfig {
  format: 'cup';
  seeded: boolean;              // sorteio com cabeças-de-série
  twoLegs: boolean;             // ida e volta (excepto final)
  twoLegsFinal: boolean;        // final também a duas mãos
  extraTimeOnDraw: boolean;
  penaltiesOnDraw: boolean;
  rounds: CupRound[];           // ['32-avos','16-avos','quartos','semis','final']
  byeAllowed: boolean;          // equipas com bye na 1ª ronda
}

export type CompetitionConfig = LeagueConfig | TournamentConfig | CupConfig;
```

### 2.3 Extensão do Tipo Base Competition

```typescript
// Extensão de Competition (manter compatibilidade com API existente)
export interface Competition {
  // campos existentes mantidos...
  id: string;
  name: string;
  organization_id: string;
  season: string;
  status: CompetitionStatus;
  sport: string;
  
  // NOVO — substitui o campo format: string
  format: CompetitionFormat;
  config: CompetitionConfig;     // configuração discriminada por formato
  
  // NOVO — fases tipadas
  phases: CompetitionPhase[];
  currentPhase?: string;         // id da fase activa
}

export interface CompetitionPhase {
  id: string;
  name: string;
  type: 'round_robin' | 'group_stage' | 'knockout' | 'final';
  
  order: number;
  status: 'pending' | 'active' | 'completed';
  // Dados específicos por type resolvidos nos hooks
}
```

### 2.4 Tipos de Fase por Formato

```
Liga:
  └── round_robin (única fase — N jornadas)

Torneio:
  ├── group_stage  (fase de grupos)
  └── knockout     (eliminatórias geradas automaticamente)

Taça:
  └── knockout × N (uma fase por ronda, gerada no draw/sorteio)
```

---
## 3. Regras de Negócio por Tipo

### 3.1 Campeonato — Liga (Pontos Corridos)

```
CLASSIFICAÇÃO:
  Pontos = (V × pointsWin) + (E × pointsDraw) + (D × pointsLoss)

CRITÉRIOS DE DESEMPATE (ordem configurável):
  1. Confronto directo (pontos)
  2. Confronto directo (saldo de golos)
  3. Saldo de golos geral
  4. Golos marcados
  5. Cartões (fair play)
  6. Sorteio

CALENDÁRIO:
  - Round-robin: algoritmo de círculo (rotação)
  - Ida e volta: N_rounds = (N_teams - 1) × 2  (se homeAndAway)
  - Ida simples:  N_rounds = (N_teams - 1)

PROMOÇÃO/RELEGAÇÃO:
  - Top N → promovidos/campeões
  - Bottom M → relegados
  - Meio → play-offs (se configurado)
```

### 3.2 Torneio (Grupos + Eliminatórias)

```
FASE DE GRUPOS:
  - Cada grupo usa regras de liga simplificada
  - Qualificam os N primeiros de cada grupo
  - Podem qualificar também os melhores 3ºs (configurável)
  - Classificação dentro do grupo: mesmos critérios da liga

FASE ELIMINATÓRIA:
  - Gerada automaticamente após fase de grupos
  - Cruzamentos: 1ºA vs 2ºB, 1ºB vs 2ºA, etc.
  - Avanço: vencedor de cada jogo/par
  - Empate com duas mãos: critério golos fora → extra-tempo → penáltis

SORTEIO (draw):
  - Grupos definidos manualmente ou por sorteio
  - Cabeças-de-série colocadas em potes separados
```

### 3.3 Taça/Copa (Eliminação Directa)

```
ESTRUTURA:
  - Nº de equipas: potência de 2 (8, 16, 32, 64...)
  - Se nº não é potência de 2 → byes na ronda inicial
  - Rondas geradas automaticamente pelo bracket

PROGRESSÃO:
  - Jogo único: vence quem marca mais
  - Empate no tempo normal → extra-tempo (2×15min)
  - Empate após extra-tempo → penáltis (série de 5)
  - Duas mãos: soma de golos; empate → golos fora → extra-tempo → penáltis

SORTEIO:
  - Cabeças-de-série não se cruzam na mesma metade do bracket
  - Equipas do mesmo grupo (organização) separadas se possível

NOMEAÇÃO DE RONDAS:
  32 equipas: 16-avos → Oitavos → Quartos → Meias → Final
  16 equipas: Oitavos → Quartos → Meias → Final
  8 equipas:  Quartos → Meias → Final
```

---

## 4. Arquitectura de Implementação

### 4.1 Estrutura de Ficheiros

```
src/modules/competitions/
│
├── types/
│   ├── competition.types.ts          ← MODIFICAR (adicionar format union)
│   ├── competition-format.types.ts   ← CRIAR (configs discriminadas)
│   └── index.ts                      ← ACTUALIZAR exports
│
├── schemas/
│   ├── competition.schemas.ts        ← MODIFICAR (schemas por formato)
│   ├── league.schema.ts              ← CRIAR
│   ├── tournament.schema.ts          ← CRIAR
│   ├── cup.schema.ts                 ← CRIAR
│   └── index.ts
│
├── hooks/
│   ├── useCompetitions.ts            ← manter (listagem)
│   ├── useCompetitionFull.ts         ← manter (dados base)
│   ├── useCompetitionConfig.ts       ← CRIAR (config tipada por formato)
│   ├── useLeagueStandings.ts         ← CRIAR (classificação liga)
│   ├── useTournamentBracket.ts       ← CRIAR (grupos + bracket)
│   ├── useCupBracket.ts              ← CRIAR (árvore eliminação)
│   ├── useCompetitionMatches.ts      ← MODIFICAR (ciente de jornada/ronda)
│   └── index.ts
│
├── components/
│   ├── formats/
│   │   ├── LeagueStandingsTable.tsx  ← CRIAR
│   │   ├── TournamentGroupsView.tsx  ← CRIAR
│   │   ├── TournamentBracket.tsx     ← CRIAR
│   │   ├── CupBracket.tsx            ← CRIAR
│   │   └── index.ts
│   ├── CompetitionFormatRouter.tsx   ← CRIAR (switch por formato)
│   ├── CompetitionManagementFrame.tsx ← MODIFICAR (nav dinâmica)
│   └── ...existentes mantidos
│
├── pages/
│   ├── CompetitionCreatePage.tsx     ← MODIFICAR (wizard condicional)
│   ├── CompetitionRankingsPage.tsx   ← MODIFICAR (delega ao router)
│   ├── CompetitionSchedulePage.tsx   ← MODIFICAR (jornada/ronda aware)
│   ├── CompetitionAdminDashboardPage.tsx ← MODIFICAR (KPIs por tipo)
│   └── ...existentes mantidos
│
└── utils/
    ├── league-calculator.ts          ← CRIAR (cálculo de pontos/classificação)
    ├── bracket-generator.ts          ← CRIAR (geração de bracket taça/torneio)
    ├── draw-engine.ts                ← CRIAR (lógica de sorteio)
    └── round-robin-scheduler.ts      ← CRIAR (geração calendário liga)
```

### 4.2 Hook Central — `useCompetitionConfig`

```typescript
// src/modules/competitions/hooks/useCompetitionConfig.ts
// Retorna a config fortemente tipada + helpers específicos por formato

export function useCompetitionConfig(competitionId: string) {
  const { competition } = useCompetitionFull(competitionId);
  
  const isLeague     = competition?.format === 'league';
  const isTournament = competition?.format === 'tournament';
  const isCup        = competition?.format === 'cup';
  
  const config = competition?.config as CompetitionConfig | undefined;
  
  // Type guards
  const leagueConfig     = isLeague     ? config as LeagueConfig     : null;
  const tournamentConfig = isTournament ? config as TournamentConfig : null;
  const cupConfig        = isCup        ? config as CupConfig        : null;
  
  return {
    format: competition?.format,
    isLeague, isTournament, isCup,
    leagueConfig, tournamentConfig, cupConfig,
    // Navigation tabs dinâmicos
    navTabs: buildNavTabs(competition?.format),
  };
}
```

### 4.3 Router de Formato — `CompetitionFormatRouter`

```typescript
// Componente que decide qual view renderizar com base no formato
// Usado em CompetitionRankingsPage, CompetitionSchedulePage, etc.

export function CompetitionStandingsRouter({ competitionId }: Props) {
  const { isLeague, isTournament, isCup } = useCompetitionConfig(competitionId);
  
  if (isLeague)     return <LeagueStandingsTable competitionId={competitionId} />;
  if (isTournament) return <TournamentGroupsView competitionId={competitionId} />;
  if (isCup)        return <CupBracket           competitionId={competitionId} />;
  
  return <CompetitionSkeleton />;
}
```

---

## 5. Wizard de Criação por Tipo

### 5.1 Fluxo Condicional

```
Step 1 — Dados Básicos (comum a todos)
  nome, temporada, organização, modalidade, foto

Step 2 — Formato da Competição
  [Campeonato Liga] [Torneio] [Taça/Copa]
  → selecção determina steps seguintes

Step 3a (Liga) — Configuração Campeonato
  • Nº de equipas
  • Ida e volta?
  • Pontuação: vitória/empate/derrota
  • Zonas: promoção / play-offs / despromoção
  • Critérios de desempate (drag & drop de ordem)

Step 3b (Torneio) — Fase de Grupos
  • Nº de grupos / equipas por grupo
  • Quantos qualificam por grupo
  • Melhores terceiros?
  • Ida e volta nos grupos?

Step 3c (Copa) — Configuração Taça
  • Nº de equipas (8/16/32/64)
  • Ida e volta? (excepto final?)
  • Final a duas mãos?
  • Byes automáticos?

Step 4a (Torneio) — Fase Eliminatória
  • Rondas (quarter/semi/final)
  • Duas mãos nas eliminatórias?
  • Extra-tempo + penáltis?

Step 4 (comum) — Inscrições e Datas
  • Prazo de inscrição
  • Data de início / fim prevista
  • Regulamento (upload PDF)

Step 5 — Revisão e Criação
```

---

## 6. Algoritmos Críticos

### 6.1 Gerador de Calendário Liga (Round-Robin)

```typescript
// src/modules/competitions/utils/round-robin-scheduler.ts

export function generateRoundRobin(
  teams: string[],        // array de team IDs
  homeAndAway: boolean
): Round[] {
  const n = teams.length % 2 === 0 ? teams.length : [...teams, 'BYE'].length;
  const half = n / 2;
  const rounds: Round[] = [];
  const list = [...teams];
  if (list.length % 2 !== 0) list.push('BYE');

  for (let round = 0; round < n - 1; round++) {
    const matches: Match[] = [];
    for (let i = 0; i < half; i++) {
      const home = list[i];
      const away = list[n - 1 - i];
      if (home !== 'BYE' && away !== 'BYE') {
        matches.push({ home, away, round: round + 1 });
      }
    }
    rounds.push({ number: round + 1, matches });
    // Rotação: fixar list[0], rodar os restantes
    list.splice(1, 0, list.pop()!);
  }

  if (homeAndAway) {
    // Duplicar com mandos invertidos
    const returnRounds = rounds.map((r, i) => ({
      number: rounds.length + i + 1,
      matches: r.matches.map(m => ({ home: m.away, away: m.home, round: rounds.length + i + 1 })),
    }));
    return [...rounds, ...returnRounds];
  }

  return rounds;
}
```

### 6.2 Calculadora de Classificação Liga

```typescript
// src/modules/competitions/utils/league-calculator.ts

export function calculateStandings(
  matches: CompletedMatch[],
  config: LeagueConfig
): Standing[] {
  const table: Record<string, Standing> = {};

  for (const match of matches) {
    // inicializar equipas
    [match.homeTeamId, match.awayTeamId].forEach(id => {
      if (!table[id]) table[id] = initStanding(id);
    });

    const home = table[match.homeTeamId];
    const away = table[match.awayTeamId];

    home.played++; away.played++;
    home.goalsFor += match.homeGoals; home.goalsAgainst += match.awayGoals;
    away.goalsFor += match.awayGoals; away.goalsAgainst += match.homeGoals;

    if (match.homeGoals > match.awayGoals) {
      home.won++; home.points += config.pointsWin;
      away.lost++; away.points += config.pointsLoss;
    } else if (match.homeGoals < match.awayGoals) {
      away.won++; away.points += config.pointsWin;
      home.lost++; home.points += config.pointsLoss;
    } else {
      home.drawn++; home.points += config.pointsDraw;
      away.drawn++; away.points += config.pointsDraw;
    }
  }

  return applyTiebreakers(Object.values(table), config.tiebreakers, matches);
}
```

### 6.3 Gerador de Bracket (Taça/Torneio)

```typescript
// src/modules/competitions/utils/bracket-generator.ts

export function generateCupBracket(
  teams: string[],     // já ordenados após sorteio
  config: CupConfig
): BracketRound[] {
  const size = nextPowerOfTwo(teams.length);
  const byes = size - teams.length;
  const slots = [...teams, ...Array(byes).fill('BYE')];

  let currentRound = slots.reduce<BracketMatch[]>((acc, _, i) => {
    if (i % 2 === 0) acc.push({ team1: slots[i], team2: slots[i + 1], winner: null });
    return acc;
  }, []);

  const rounds: BracketRound[] = [{ name: getRoundName(size), matches: currentRound }];

  let remaining = size / 2;
  while (remaining > 1) {
    remaining /= 2;
    const nextMatches = Array.from({ length: remaining }, (_, i) => ({
      team1: null, team2: null, winner: null,  // preenchido conforme resultados
      sourceMatch1: i * 2,
      sourceMatch2: i * 2 + 1,
    }));
    rounds.push({ name: getRoundName(remaining * 2), matches: nextMatches });
  }

  return rounds;
}
```

---

## 7. UI — Componentes por Tipo

### 7.1 Liga — `LeagueStandingsTable`

Tabela com colunas: **Pos | Equipa | J | V | E | D | GM | GS | SG | Pts**

Estados visuais:
- Faixa verde → zona de promoção/champions
- Faixa amarela → play-offs
- Faixa vermelha → zona de despromoção
- Negrito na equipa com mais pontos
- Tooltip com critérios de desempate activos

### 7.2 Torneio — `TournamentGroupsView` + `TournamentBracket`

**Fase de Grupos:**
- Grid de grupos (2 por linha em desktop)
- Cada grupo: mini-tabela liga
- Badge "Q" nas equipas qualificadas

**Fase Eliminatória:**
- Bracket SVG/CSS responsive
- Jogo a jogo com score e equipas
- Winner avança automaticamente
- Estado: scheduled / live / completed

### 7.3 Taça — `CupBracket`

- Árvore horizontal (esquerda → direita → final ao centro)
- Rondas com label: Oitavos / Quartos / Semis / Final
- Pares com golos (ida e volta: subtotais + total)
- Indicação visual de extra-tempo / penáltis

---

## 8. Plano de Implementação em Fases

### Fase 1 — Fundações de Tipos e Schema (Sprint 1)
**Prioridade: CRÍTICA**

| # | Tarefa | Ficheiro | Esforço |
|---|---|---|---|
| 1.1 | Criar `competition-format.types.ts` com todos os tipos discriminados | types/ | M |
| 1.2 | Actualizar `competition.types.ts` — substituir `format: string` | types/ | P |
| 1.3 | Criar schemas Zod por formato (`league.schema`, `tournament.schema`, `cup.schema`) | schemas/ | M |
| 1.4 | Actualizar `competition.schemas.ts` — wizard condicional por formato | schemas/ | G |
| 1.5 | Migração de dados: script para converter registos existentes ao novo formato | utils/ | M |

### Fase 2 — Hooks e Lógica de Negócio (Sprint 2)
**Prioridade: ALTA**

| # | Tarefa | Ficheiro | Esforço |
|---|---|---|---|
| 2.1 | Criar `useCompetitionConfig.ts` — hub central por formato | hooks/ | M |
| 2.2 | Criar `useLeagueStandings.ts` — cálculo pontos, desempates | hooks/ | G |
| 2.3 | Criar `useTournamentBracket.ts` — grupos + qualificados + bracket | hooks/ | G |
| 2.4 | Criar `useCupBracket.ts` — árvore de eliminação | hooks/ | M |
| 2.5 | Actualizar `useCompetitionMatches.ts` — aware de jornada/ronda/fase | hooks/ | M |
| 2.6 | Criar utilitários: `league-calculator`, `bracket-generator`, `round-robin-scheduler`, `draw-engine` | utils/ | G |

### Fase 3 — Componentes de UI (Sprint 3)
**Prioridade: ALTA**

| # | Tarefa | Ficheiro | Esforço |
|---|---|---|---|
| 3.1 | `LeagueStandingsTable` — tabela com zonas visuais | components/formats/ | M |
| 3.2 | `TournamentGroupsView` — grid de grupos | components/formats/ | M |
| 3.3 | `TournamentBracket` — bracket eliminatório | components/formats/ | G |
| 3.4 | `CupBracket` — árvore de eliminação directa | components/formats/ | G |
| 3.5 | `CompetitionFormatRouter` — switch por formato | components/ | P |
| 3.6 | Actualizar `CompetitionManagementFrame` — tabs dinâmicos | components/ | M |

### Fase 4 — Pages e Wizard (Sprint 4)
**Prioridade: MÉDIA**

| # | Tarefa | Ficheiro | Esforço |
|---|---|---|---|
| 4.1 | Wizard de criação condicional por formato | CompetitionCreatePage | G |
| 4.2 | Actualizar `CompetitionRankingsPage` — delegar ao router | pages/ | P |
| 4.3 | Actualizar `CompetitionSchedulePage` — jornada/ronda aware | pages/ | M |
| 4.4 | Actualizar `CompetitionAdminDashboardPage` — KPIs por tipo | pages/ | M |
| 4.5 | Sorteio UI: `DrawPage` + `DrawEngine` | pages/ + utils/ | G |

### Fase 5 — Testes e Qualidade (Sprint 5)
**Prioridade: MÉDIA**

| # | Tarefa | Esforço |
|---|---|---|
| 5.1 | Testes unitários para `league-calculator` (todos os critérios de desempate) | G |
| 5.2 | Testes unitários para `round-robin-scheduler` | M |
| 5.3 | Testes unitários para `bracket-generator` | M |
| 5.4 | Testes de integração para hooks de standings | G |
| 5.5 | Testes de componentes para as 3 views de classificação | M |

**Legenda:** P = Pequeno (<2h) | M = Médio (2-4h) | G = Grande (4-8h)

---

## 9. Compatibilidade com API Existente

### 9.1 Endpoints Necessários (verificar/criar no backend)

```
GET  /competitions/:id/config          → retorna CompetitionConfig tipado
GET  /competitions/:id/standings       → aceita ?format=league|group&groupId=X
GET  /competitions/:id/bracket         → estrutura do bracket (torneio/taça)
GET  /competitions/:id/rounds          → jornadas (liga) ou rondas (taça)
POST /competitions/:id/draw            → executa sorteio
POST /competitions/:id/generate-schedule → gera calendário

```

### 9.2 Contrato com `competition.api.ts` existente

O `competition.api.ts` actual deve ser **estendido** (não substituído):
- Manter todos os endpoints CRUD existentes
- Adicionar query params `?format=` onde relevante
- Novos endpoints encapsulados em funções separadas

---

## 10. Decisões de Design

| Decisão | Escolha | Justificação |
|---|---|---|
| Estado das standings | Calculado no front-end a partir dos resultados | Permite desempates em tempo real sem round-trip |
| Bracket geração | Gerado localmente, persisted no backend após sorteio | Bracket imutável após sorteio |
| Calendário | Gerado pelo backend, exibido pelo front | Garante consistência de árbitros/campos |
| Formato da competição | Imutável após criação com equipas inscritas | Evita inconsistências de dados |
| Navegação por formato | Tabs dinâmicos via `useCompetitionConfig` | Single source of truth para nav |
| Critérios desempate | Configurados por liga, persistidos em `LeagueConfig` | Flexível por organização |

---

## 11. Checklist de Entrega

```
FASE 1 — Tipos
  [ ] competition-format.types.ts criado
  [ ] competition.types.ts actualizado (format: CompetitionFormat)
  [ ] Schemas Zod por formato
  [ ] Exports actualizados em index.ts

FASE 2 — Hooks/Lógica
  [ ] useCompetitionConfig implementado
  [ ] useLeagueStandings com todos os tiebreakers
  [ ] useTournamentBracket (grupos + knockout)
  [ ] useCupBracket (árvore directa)
  [ ] round-robin-scheduler (ida / ida+volta / n_par / n_ímpar)
  [ ] league-calculator (pontos + desempates)
  [ ] bracket-generator (potência de 2 + byes)

FASE 3 — UI
  [ ] LeagueStandingsTable (zonas visuais)
  [ ] TournamentGroupsView + TournamentBracket
  [ ] CupBracket (árvore horizontal)
  [ ] CompetitionFormatRouter
  [ ] CompetitionManagementFrame (tabs dinâmicos)

FASE 4 — Pages
  [ ] Wizard criação (steps condicionais)
  [ ] CompetitionRankingsPage (via router)
  [ ] CompetitionSchedulePage (jornada/ronda aware)
  [ ] AdminDashboard (KPIs por tipo)

FASE 5 — Testes
  [ ] Testes league-calculator
  [ ] Testes bracket-generator
  [ ] Testes round-robin-scheduler
  [ ] Testes hooks de standings
  [ ] Testes componentes de classificação
```
PLAN




• Alinhei o contrato frontend-backend para o bloco de competições.  
                                                                    
  O que foi ajustado:                                               
                                                                    
  - O backend agora aceita groupId como alias de group_id nas rotas 
    de competições e mantém phase/format no contrato público em /D:/    ndeascloud/boayetu/backend/competitions/views/v2_views.py.      
                                                                    
  - O cliente frontend passou a suportar filtros opcionais em       
    listMatches, getStandings, getBracket e getRounds, e draw()     
    agora envia start_date com default seguro em /D:/ndeascloud/    
    boayetu/frontend/src/modules/competitions/services/             
    competition.api.ts.                                             
                                                                    
  - As rotas da API frontend foram centralizadas para DRAW, BRACKET 
    e ROUNDS em /D:/ndeascloud/boayetu/frontend/src/constants/      
    routes.ts.                                                      
                                                                    
  - Corrigi a página de sorteio para compilar com o design system   
    atual em /D:/ndeascloud/boayetu/frontend/src/modules/           
    competitions/pages/CompetitionDrawPage.tsx.                     
                                                                    
  - Adicionei cobertura backend para o alias groupId no endpoint de 
    standings em /D:/ndeascloud/boayetu/backend/competitions/tests/ 
    test_api.py.                                                    
                                                                    
  Validação:                                                        
                                                                    
  - Backend: cd backend; python manage.py test                      
    competitions.tests.test_api competitions.tests.test_services    
                                                                    
  - Resultado: 22 testes, OK                                        
  - Frontend: cd frontend; npm run build                            
  - Resultado: build concluído com sucesso                          
                                                                    
  Se quiser, o próximo passo natural é eu continuar com o acabamento
  de frontend para consumir os novos endpoints de bracket/rounds    
  diretamente nos hooks e páginas. 











  AUDITORIA
       | config.pointsWin/Draw/Loss   |
   6 | Desempates (tiebreakers) não | services/standing_service.    
     | implementados — sort é só    | py
     | Pts/GD/GF                    |
   7 | Match sem phase + group_id + | models/match.py
     | round_name — torneio e taça  |
     | sem contexto                 |
   8 | Standing sem group_id +      | models/standing.py
     | phase — classificações de    |
     | grupos misturadas            |
   9 | GET /standings/ sem          | views/
     | ?group_id= nem ?phase=       |
  ──────
  ### 🟡 Médio — Funcionalidades avançadas (Sprint 3)

  • GET /competitions/:id/bracket/ — não existe (bracket
  taça/torneio)
  • GET /competitions/:id/rounds/ — não existe (jornadas/rondas)    
  • POST /competitions/:id/draw/ — não existe (sorteio)
  • generate-schedule não ramifica por tipo — gera calendário       
  igual para liga, torneio e taça
  ──────
  ### Migrations necessárias (todas non-destructive)

    XXXX_add_config_to_competition.py    ←
  JSONField(default=dict)
    XXXX_add_phase_group_to_match.py     ← phase, group_id,
  round_name (nullable)
    XXXX_add_group_phase_to_standing.py  ← group_id, phase
  (nullable)

  O relatório completo está no backend_audit_competicoes.md. Quer
  começar pelo Sprint 1 (adicionar o campo config ao modelo e  
  serializers)?