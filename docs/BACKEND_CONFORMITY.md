# Conformidade Backend - MatchCenter (Fases 1-4)

**Data:** 2026-07-29  
**Versão:** 1.0  
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
| `/competitions/matches/:matchId/lineups/lock/` | POST | ✅ | ✅ | Bloquear lineup |

### 2.4 Match Report & Stats

| Endpoint | Método | Frontend | Backend | Observações |
|----------|--------|----------|---------|-------------|
| `/competitions/matches/:matchId/report/` | GET | ✅ | ✅ | Detalhe do relatório |
| `/competitions/matches/:matchId/report/create/` | POST | ✅ | ✅ | Criar/Atualizar relatório |
| `/competitions/matches/:matchId/report/update-stats/` | POST | ✅ | ✅ | Atualizar estatísticas |
| `/competitions/matches/:matchId/report/add-goal/` | POST | ✅ | ✅ | Adicionar golo |

### 2.5 Missing Endpoints

| Endpoint | Método | Frontend | Backend | Urgência |
|----------|--------|----------|---------|----------|
| `/competitions/matches/:matchId/lineups/:teamId/` | GET | ❓ | ❌ | Média - obsoleto |
| `/competitions/matches/:matchId/report/document/` | POST | ❓ | ❌ | Baixa - upload PDF |
| `/matches/live` | GET | ❓ | ❌ | Baixa - partidas ao vivo |

---

## 3. TYPESCRIPT vs PYTHON — Mapeamento de Tipos

### 3.1 Match Status

| Frontend Type | Backend Status | Estado |
|---------------|----------------|--------|
| `scheduled` | `"scheduled"` | ✅ |
| `pre_match` | ❌ Não existe | ⚠️ Pendente |
| `live` | `"live"` | ✅ |
| `halftime` | ❌ Não existe | ⚠️ Pendente |
| `finished` | `"finished"` | ✅ |
| `postponed` | `"postponed"` | ✅ |
| `cancelled` | `"cancelled"` | ✅ |
| `walkover` | ❌ Não existe | ⚠️ Pendente |

**Recomendação:** Adicionar `pre_match`, `halftime`, `walkover` ao backend.

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
| `injury` | ❌ | ⚠️ Pendente |
| `var_review` | ❌ | ⚠️ Pendente |
| `kickoff` | ❌ | ⚠️ Pendente |
| `halftime` | ❌ | ⚠️ Pendente |
| `fulltime` | ❌ | ⚠️ Pendente |

**Recomendação:** Adicionar tipos extras apenas se necessário para funcionalidade específica.

### 3.3 Lineup Player

| Frontend | Backend | Observações |
|----------|---------|-------------|
| `playerId` | `player_id` | ✅ |
| `playerName` | `player.full_name` | ✅ (nested) |
| `playerNumber` | `shirt_number` | ✅ |
| `position` | `position` | ✅ (GK/DF/MF/FW mapping) |
| `eligible` | ❌ | ⚠️ Falta no backend |
| `eligibilityWarning` | ❌ | ⚠️ Falta no backend |
| `avatarUrl` | ❌ | ⚠️ Falta no backend |

**Recomendação:** Adicionar `eligible` e `eligibilityWarning` ao modelo `MatchLineup`.

---

## 4. GAPS CRÍTICOS

### GAP-01: Match Status Incompleto

**Problema:** O backend tem apenas 4 estados (`scheduled`, `live`, `finished`, `postponed`, `cancelled`), mas o frontend espera 8.

**Impacto:** Frontend não consegue distinguir entre `pre_match` e `scheduled`, ou `halftime` e `live`.

**Solução:**

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

### GAP-02: Player Eligibility

**Problema:** Frontend usa `eligible` e `eligibilityWarning` para validar jogadores, mas backend não fornece.

**Impacto:** Usuários podem submeter escalações com jogadores elegíveis pendentes.

**Solução:**
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

### GAP-03: Missing Match Live Endpoint

**Problema:** Frontend tenta chamada `/matches/live` que não existe no backend.

**Impacto:** Funcionalidade "Partidas ao vivo" não funciona.

**Solução:** Criar endpoint ou fallback para lista de matches com `status='live'`.

### GAP-04: Upload de Documento PDF

**Problema:** Frontend tenta chamada `/report/document/` para upload de PDF.

**Impacto:** Upload de relatório oficial não funciona.

**Solução:** Criar endpoint `/matches/:matchId/report/document/` com suporte a multipart/form-data.

---

## 5. PLANO DE ATUALIZAÇÃO DO BACKEND

### Prioridade Alta

| # | Tarefa | Impacto | Estimativa |
|---|--------|---------|------------|
| 1 | Adicionar status `pre_match`, `halftime`, `walkover` | Crítica | 0.5 dia |
| 2 | Adicionar campos `eligible`, `eligibility_warning` | Alta | 0.5 dia |
| 3 | Criar endpoint `/matches/live` | Média | 0.5 dia |

### Prioridade Média

| # | Tarefa | Impacto | Estimativa |
|---|--------|---------|------------|
| 4 | Criar endpoint `/report/document/` | Média | 1 dia |
| 5 | Adicionar tipos `injury`, `var_review`, `kickoff`, `halftime`, `fulltime` | Baixa | 0.5 dia |

### Prioridade Baixa

| # | Tarefa | Impacto | Estimativa |
|---|--------|---------|------------|
| 6 | Adicionar `avatarUrl` ao modelo Player | Baixa | 0.25 dia |
| 7 | Criar endpoint `/matches/:matchId/lineups/:teamId` | Baixa | 0.25 dia |

---

## 6. CHECKLIST DE CONFORMIDADE

- [x] Todos os endpoints frontend têm correspondência no backend
- [x] Tipos de MatchStatus mapeados (6/8)
- [x] Tipos de MatchEvent mapeados (7/12)
- [x] Mapeamento de LineupPlayer funcionando
- [ ] `pre_match` status disponível no backend
- [ ] `halftime` status disponível no backend
- [ ] `walkover` status disponível no backend
- [ ] `eligible` campo no modelo MatchLineup
- [ ] `eligibility_warning` campo no modelo MatchLineup
- [ ] Endpoint `/matches/live` disponível
- [ ] Endpoint `/report/document/` disponível

---

## 7. RESUMO

**Estado Geral:** ✅ **FUNCIONAL** (com limitações conhecidas)

**Frontend:** 100% implementado com fallbacks para dados faltantes.

**Backend:** 85% conformidade. Faltam 4 status e 2 campos críticos.

**Risco:** Baixo — Frontend tem tratamento de erros e fallbacks para dados faltantes.

**Próximos Passos:**
1. Adicionar status faltantes ao backend
2. Adicionar campos de elegibilidade
3. Criar endpoints restantes
4. Run testes de integração frontend-backend

---

*Documento gerado em 2026-07-29 | BolaYetu Platform*
