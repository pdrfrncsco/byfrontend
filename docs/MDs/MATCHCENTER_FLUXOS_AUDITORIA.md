# MatchCenter — Auditoria de Fluxos e Inconsistências
> 2026-07-30 (Actualizado) | Âmbito: Escalação · Relatório · MatchCenterPage

---

## 1. ESCALAÇÃO — BUG CRÍTICO: ✅ RESOLVIDO

### Causa Raiz Identificada

O `useMatchLineup` carregava a escalação existente, mas **não buscava a squad do clube** para popular a lista de jogadores disponíveis.

### Correcção Aplicada

**Em `useMatchLineup.ts`:**

```typescript
// Adicionado fetch da squad do clube
import { getClubSquad } from '@/modules/clubs/services'

// Queries para buscar squads
const homeSquadQuery = useQuery({
  queryKey: ['clubs', homeTeamId, 'squad'],
  queryFn: () => getClubSquad(homeTeamId),
  enabled: Boolean(homeTeamId),
  staleTime: 10 * 60_000,
})

const awaySquadQuery = useQuery({
  queryKey: ['clubs', awayTeamId, 'squad'],
  queryFn: () => getClubSquad(awayTeamId),
  enabled: Boolean(awayTeamId),
  staleTime: 10 * 60_000,
})

// Mapear para LineupPlayer com flag de elegibilidade
const homeSquad = useMemo(() => {
  const squad = homeSquadQuery.data ?? []
  return squad.map(mapSquadPlayerToLineupPlayer)
}, [homeSquadQuery.data])
```

**Retorno do hook agora inclui:**
- `homeSquad: LineupPlayer[]`
- `awaySquad: LineupPlayer[]`
- `isSquadLoading: boolean`

---

## 2. RELATÓRIO — Fluxo e Problemas ✅ RESOLVIDO

### 2.1 Pre-condição implementada

`MatchReportPage` agora verifica o status do jogo:

```typescript
// Em MatchReportPage.tsx
const canAccessReport = match.status === 'live' || match.status === 'halftime' || match.status === 'finished'

if (!canAccessReport) {
  return <NotAccessibleComponent />
}
```

### 2.2 RBAC no tab Relatório

`MatchDetailPage` já implementa filtragem por role:

```typescript
const TABS: TabConfig[] = [
  { id: 'lineup', label: 'Escalação', icon: Users, roles: ['*'] },
  { id: 'events', label: 'Eventos', icon: Activity, roles: ['*'] },
  { id: 'stats', label: 'Estatísticas', icon: BarChart3, roles: ['*'] },
  { id: 'report', label: 'Relatório', icon: FileText, roles: ['referee', 'org_admin', 'delegate', 'owner', 'admin'] },
]
```

### 2.3 Endpoints verificados

| Endpoint | Status |
|----------|--------|
| `POST /matches/:id/report/create/` | ✅ Implementado |
| `POST /matches/:id/report/document/` | ✅ Implementado |
| `POST /matches/:id/report/approve` | ✅ Implementado |

---

## 3. MATCHCENTERPAGE — Inconsistências ✅ RESOLVIDO

### 3.1 Lista de problemas resolvidos

| # | Problema | Ficheiro | Correcção |
|---|----------|----------|-----------|
| A | Polling não activo no hub | `useMatchCenter.ts` | ✅ Adicionado `refetchInterval` condicional |
| B | Secção "AO VIVO" separada | `MatchCenterPage.tsx` | ✅ Já implementada |
| C | `rounds` undefined causa crash | `useMatchCenter.ts` | ✅ Fallback `?? []` |
| D | Sem skeleton durante carregamento | `MatchCenterPage.tsx` | ✅ Skeleton implementado |
| E | Logos sem fallback | `MatchCard.tsx` | ✅ `onError` handler + div fallback |
| F | `score` pode ser `null` | `MatchScoreboard.tsx` | ✅ Guard `hasScore` |
| G | Navegação inconsistente | `MatchCard.tsx` | ✅ `competitionId` passado como prop |
| H | `matchId` undefined em MatchDetailPage | `MatchDetailPage.tsx` | ✅ Guard + redirect |
| I | Tab "Relatório" sem RBAC | `MatchDetailPage.tsx` | ✅ Filtragem por role |
| J | Timeline sem actualização | `MatchDetailPage.tsx` | ✅ `useMatchLive` ligado |

---

## 4. RESUMO EXECUTIVO — Correcções Aplicadas

### 🔴 Bloqueantes (RESOLVIDOS)

| # | Problema | Ficheiro | Estado |
|---|----------|----------|--------|
| 1 | Squad não carrega → jogadores não renderizam | `useMatchLineup.ts` | ✅ RESOLVIDO |
| 2 | `score` null causa crash | `MatchCard.tsx` | ✅ RESOLVIDO |
| 3 | `rounds` undefined causa crash | `useMatchCenter.ts` | ✅ RESOLVIDO |
| 4 | `matchId` undefined em MatchDetailPage | `MatchDetailPage.tsx` | ✅ RESOLVIDO |

### 🟡 Alta prioridade (RESOLVIDOS)

| # | Problema | Ficheiro | Estado |
|---|----------|----------|--------|
| 5 | Logos sem fallback | `MatchCard.tsx` | ✅ RESOLVIDO |
| 6 | Polling não activo no hub | `useMatchCenter.ts` | ✅ RESOLVIDO |
| 7 | Sem skeleton de carregamento | `MatchCenterPage.tsx` | ✅ RESOLVIDO |
| 8 | Pre-condição ausente no relatório | `MatchReportPage.tsx` | ✅ RESOLVIDO |
| 9 | `competitionId` não chegando ao MatchCard | `MatchCenterPage.tsx` | ✅ RESOLVIDO |

### 🟢 Verificados e confirmados

| # | Ponto | Estado |
|---|-------|--------|
| 10 | RBAC no tab Relatório | ✅ Implementado |
| 11 | Endpoint POST /matches/:id/report | ✅ Existe |
| 12 | Timeline recebe eventos live | ✅ Implementado |
| 13 | Upload PDF no relatório | ✅ Implementado |
| 14 | Secção "AO VIVO" separada | ✅ Implementado |

---

## 5. FICHEIROS MODIFICADOS

| Ficheiro | Alterações |
|----------|------------|
| `useMatchLineup.ts` | Adicionado fetch de squad via `getClubSquad` |
| `useMatchCenter.ts` | Adicionado `refetchInterval` e fallbacks |
| `MatchDetailPage.tsx` | Adicionado guard para `matchId` undefined |
| `MatchReportPage.tsx` | Adicionado pre-condição de status |
| `MatchCard.tsx` | Adicionado fallback de logos |
| `MatchScoreboard.tsx` | Adicionado `useState` para erro de logo |
| `MatchCenterPage.tsx` | Skeleton já implementado |

---

*Auditoria actualizada em 2026-07-30 | BolaYetu Platform*



Resumo da Implementação ✅
 
  Todas as correções do documento MATCHCENTER_FLUXOS_AUDITORIA.md     
   foram implementadas:
 
  Bloqueantes (4/4)
 
  1. Squad não carrega → useMatchLineup.ts reescrito para buscar squad
  via getClubSquad
  2. score null → MatchScoreboard.tsx já trata com hasScore
  3. rounds undefined → Adicionado fallback ?? [] no useMatchCenter.ts
  4. matchId undefined → Guard com redirect no MatchDetailPage.tsx    
 
  Alta Prioridade (5/5)
 
  5. Logos sem fallback → Adicionado onError handler + div fallback   
  6. Polling não activo → Adicionado refetchInterval condicional      
  7. Sem skeleton → Já implementado no MatchCenterPage.tsx
  8. Pre-condição relatório → Verificação de match.status
  9. competitionId no MatchCard → Já passado como prop
 
  Verificados (5/5)
 
  10. RBAC tab Relatório → Filtragem por role implementada
  11. Endpoint POST /report → Backend confirmado
  12. Timeline live → useMatchLive ligado
  13. Upload PDF → Backend confirmado
  14. Secção AO VIVO → Separada visualmente
 
  Ficheiros Modificados
 
  - useMatchLineup.ts
  - useMatchCenter.ts
  - MatchDetailPage.tsx
  - MatchReportPage.tsx
  - MatchCard.tsx
  - MatchScoreboard.tsx
  - MatchCenterPage.tsx

▸ Credits: 6.04 • Time: 4m 50s