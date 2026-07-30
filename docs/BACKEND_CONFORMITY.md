# Conformidade Backend - MatchCenter (Fases 1-4)

**Data:** 2026-07-30  
**Versão:** 1.1  
**Módulo:** `backend/competitions/`

---

## 1. STATUS DA CONFORMIDADE

| Fase | Frontend | Backend | Estado |
|------|----------|---------|--------|
| 1. Tipos & API | ✅ | ✅ | **CONFORME** |
| 2. Hooks | ✅ | ✅ | **CONFORME** |
| 3. Componentes UI | ✅ | ✅ | **CONFORME** |
| 4. Páginas | ✅ | ✅ | **CONFORME** |

---

## 2. ENDPOINTS CONFORMES

### 2.1 Matches

| Endpoint | Método | Frontend | Backend | Observações |
|----------|--------|----------|---------|-------------|
| `/competitions/:id/matches/` | GET | ✅ | ✅ | Lista paginada |
| `/competitions/:id/matches/:matchId` | GET | ✅ | ✅ | Detalhe da partida |
| `/competitions/:id/matches/` | POST | ✅ | ✅ | Criar partida |
| `/competitions/matches/:matchId/` | PATCH | ✅ | ✅ | Atualizar score |

### 2.2 Match Events

| Endpoint | Método | Frontend | Backend | Observações |
|----------|--------|----------|---------|-------------|
| `/competitions/:id/matches/:matchId/events/` | GET | ✅ | ✅ | Lista eventos (súmula) |
| `/competitions/:id/matches/:matchId/events/` | POST | ✅ | ✅ | Adicionar evento (admin) |
| `/competitions/:id/matches/:matchId/events/:eventId/` | DELETE | ✅ | ✅ | Remover evento (admin) |

### 2.3 Match Lineup

| Endpoint | Método | Frontend | Backend | Observações |
|----------|--------|----------|---------|-------------|
| `/competitions/matches/:matchId/lineups/` | GET | ✅ | ✅ | Lista lineups |
| `/competitions/matches/:matchId/lineups/` | POST | ✅ | ✅ | Submeter lineup |
| `/competitions/matches/:matchId/lineups/:teamId/` | GET | ✅ | ✅ | **IMPLEMENTADO** - LineupSubmissionViewSet.retrieve() |
| `/competitions/matches/:matchId/lineups/lock/` | POST | ✅ | ✅ | Bloquear lineup |

### 2.4 Match Report & Stats

| Endpoint | Método | Frontend | Backend | Observações |
|----------|--------|----------|---------|-------------|
| `/competitions/matches/:matchId/report/` | GET | ✅ | ✅ | Detalhe do relatório |
| `/competitions/matches/:matchId/report/create/` | POST | ✅ | ✅ | Criar/Atualizar relatório |
| `/competitions/matches/:matchId/report/update-stats/` | POST | ✅ | ✅ | Atualizar estatísticas |
| `/competitions/matches/:matchId/report/add-goal/` | POST | ✅ | ✅ | Adicionar golo |
| `/competitions/matches/:matchId/report/document/` | POST | ✅ | ✅ | **IMPLEMENTADO** - MatchReportDocumentUploadView |

### 2.5 Live Matches

| Endpoint | Método | Frontend | Backend | Observações |
|----------|--------|----------|---------|-------------|
| `/competitions/matches/live/` | GET | ✅ | ✅ | **IMPLEMENTADO** - LiveMatchesView |

---

## 3. TYPESCRIPT vs PYTHON — Mapeamento de Tipos

### 3.1 Match Status

| Frontend Type | Backend Status | Estado |
|---------------|----------------|--------|
| `scheduled` | `"scheduled"` | ✅ |
| `pre_match` | `"pre_match"` | ✅ **IMPLEMENTADO** |
| `live` | `"live"` | ✅ |
| `halftime` | `"halftime"` | ✅ **IMPLEMENTADO** |
| `finished` | `"finished"` | ✅ |
| `postponed` | `"postponed"` | ✅ |
| `cancelled` | `"cancelled"` | ✅ |
| `walkover` | `"walkover"` | ✅ **IMPLEMENTADO** |

**Backend:** `Match.MatchStatus` em `backend/competitions/models/match.py` contém todos os 8 status.

### 3.2 Match Event Types

| Frontend Type | Backend Type | Estado |
|---------------|--------------|--------|
| `goal` | `"goal"` | ✅ |
| `own_goal` | `"own_goal"` | ✅ |
| `penalty_goal` | `"penalty_scored"` | ✅ (mapped) |
| `penalty_missed` | `"penalty_missed"` | ✅ (mapped) |
| `yellow_card` | `"yellow_card"` | ✅ |
| `red_card` | `"red_card"` | ✅ |
| `yellow_red_card` | `"yellow_red"` | ✅ (mapped) |
| `substitution` | `"substitution_in"` | ✅ (mapped) |
| `injury` | ❌ | ⚠️ Opcional |
| `var_review` | ❌ | ⚠️ Opcional |
| `kickoff` | ❌ | ⚠️ Opcional |
| `halftime` | ❌ | ⚠️ Opcional |
| `fulltime` | ❌ | ⚠️ Opcional |

**Nota:** Tipos extras podem ser adicionados quando necessário para funcionalidade específica.

### 3.3 Lineup Player

| Frontend | Backend | Observações |
|----------|---------|-------------|
| `playerId` | `player_id` | ✅ |
| `playerName` | `player.full_name` | ✅ (nested) |
| `playerNumber` | `shirt_number` | ✅ |
| `position` | `position` | ✅ (GK/DF/MF/FW mapping) |
| `eligible` | `eligible` | ✅ **IMPLEMENTADO** |
| `eligibilityWarning` | `eligibility_warning` | ✅ **IMPLEMENTADO** |
| `avatarUrl` | `player.avatar` | ⚠️ Opcional |

**Backend:** Campos `eligible` e `eligibility_warning` adicionados ao modelo `MatchLineup` via migração `0012`.

---

## 4. GAPS RESOLVIDOS

### ✅ GAP-01: Match Status Incompleto — RESOLVIDO

**Problema:** O backend tinha apenas 5 estados, mas o frontend esperava 8.

**Solução Aplicada:**
```python
# backend/competitions/models/match.py
class Match(models.Model):
    class MatchStatus(models.TextChoices):
        SCHEDULED = "scheduled", "Agendado"
        PRE_MATCH = "pre_match", "Pré-jogo"
        LIVE = "live", "Em Curso"
        HALFTIME = "halftime", "Intervalo"
        FINISHED = "finished", "Concluído"
        POSTPONED = "postponed", "Adiado"
        CANCELLED = "cancelled", "Cancelado"
        WALKOVER = "walkover", "Walkover"
```

### ✅ GAP-02: Player Eligibility — RESOLVIDO

**Problema:** Frontend usa `eligible` e `eligibilityWarning` para validar jogadores.

**Solução Aplicada:**
```python
# backend/competitions/models/match_lineup.py
class MatchLineup(BaseModel):
    eligible = models.BooleanField(default=True)
    eligibility_warning = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Eligibility Warning"
    )
```

### ✅ GAP-03: Missing Match Live Endpoint — RESOLVIDO

**Problema:** Frontend tenta chamada `/matches/live` que não existia.

**Solução Aplicada:**
- Endpoint: `/competitions/matches/live/`
- View: `LiveMatchesView` em `match_center_views.py`
- Retorna partidas com `status='live'` ou `status='halftime'`

### ✅ GAP-04: Upload de Documento PDF — RESOLVIDO

**Problema:** Frontend precisa de endpoint para upload de relatório oficial.

**Solução Aplicada:**
- Endpoint: `/competitions/matches/<uuid:match_id>/report/document/`
- View: `MatchReportDocumentUploadView` em `match_center_views.py`
- Suporta multipart/form-data, valida PDF, limite 10MB

---

## 5. CHECKLIST DE CONFORMIDADE

- [x] Todos os endpoints frontend têm correspondência no backend
- [x] Tipos de MatchStatus mapeados (8/8) ✅
- [x] Tipos de MatchEvent mapeados (8/13 - essenciais cobertos)
- [x] Mapeamento de LineupPlayer funcionando
- [x] `pre_match` status disponível no backend
- [x] `halftime` status disponível no backend
- [x] `walkover` status disponível no backend
- [x] `eligible` campo no modelo MatchLineup
- [x] `eligibility_warning` campo no modelo MatchLineup
- [x] Endpoint `/matches/live/` disponível
- [x] Endpoint `/report/document/` disponível
- [x] Endpoint `/matches/:matchId/lineups/:teamId/` disponível

---

## 6. RESUMO

**Estado Geral:** ✅ **CONFORME** (100%)

**Frontend:** 100% implementado com tratamento de erros e fallbacks.

**Backend:** 100% conformidade. Todos os status e campos críticos implementados.

**Risco:** Baixo — Frontend e Backend estão sincronizados.

**Endpoint URLs (Backend):**

| Frontend Call | Backend URL |
|---------------|-------------|
| `matchApi.getLineup(matchId, teamId)` | `/competitions/matches/<match_id>/lineups/<teamId>/` |
| `matchApi.getLiveMatches()` | `/competitions/matches/live/` |
| `matchApi.uploadRefereeDocument(matchId, file)` | `/competitions/matches/<match_id>/report/document/` |

---

*Documento atualizado em 2026-07-30 | BolaYetu Platform*
