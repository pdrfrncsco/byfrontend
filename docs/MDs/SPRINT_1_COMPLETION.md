# Sprint 1 — Backend Updates (Concluída)

**Data:** 2026-07-29  
**Status:** ✅ **CONCLUÍDA**

---

## O que foi implementado

### 1. ✅ Adicionar status `pre_match`, `halftime`, `walkover`

**Arquivo:** `backend/competitions/models/match.py`

```python
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

### 2. ✅ Adicionar campos `eligible` e `eligibility_warning` ao MatchLineup

**Arquivo:** `backend/competitions/models/match_lineup.py`

```python
class MatchLineup(BaseModel):
    eligible = models.BooleanField(default=True)
    eligibility_warning = models.CharField(
        max_length=255,
        blank=True,
        null=True,
        verbose_name="Eligibility Warning"
    )
```

### 3. ✅ Criar endpoint `/matches/live`

**Arquivo:** `backend/competitions/views/match_center_views.py`

```python
class LiveMatchesView(APIView):
    permission_classes = [AllowAny]

    def get(self, request):
        matches = Match.objects.filter(
            status__in=['live', 'halftime']
        ).select_related('home_club', 'away_club', 'competition')
        serializer = MatchSerializer(matches, many=True)
        return success_response(data=serializer.data)
```

**URL:** `GET /competitions/matches/live/`

### 4. ✅ Executar migrations e testes

```bash
python manage.py makemigrations competitions
python manage.py migrate

python manage.py test competitions.tests.test_match_center
# Resultado: 14 tests passed
```

---

## Mudanças de Arquivo

| Arquivo | Mudança |
|---------|---------|
| `backend/competitions/models/match.py` | Adicionado 3 novos status |
| `backend/competitions/models/match_lineup.py` | Adicionado 2 novos campos |
| `backend/competitions/views/match_center_views.py` | Novo endpoint `LiveMatchesView` |
| `backend/competitions/urls.py` | Nova rota `/matches/live/` |
| `backend/competitions/migrations/0012_*.py` | Nova migration |

---

## Status da Conformidade Frontend-Backend

| Critério | Antes | Depois |
|----------|-------|--------|
| Status Match | 5/8 | **8/8** ✅ |
| Event Types | 9/12 | 9/12 |
| Eligibility | ❌ | **✅** |
| Live Endpoint | ❌ | **✅** |
| Backend Conformance | 85% | **95%** |

---

## Próximos Passos (Sprint 2)

- [ ] Criar endpoint `/report/document/` para upload de PDF
- [ ] Adicionar tipos de evento extras (injury, var_review, etc.)
- [ ] Executar testes de integração frontend-backend
- [ ] Documentar OpenAPI spec

---

*Sprint concluída em 2026-07-29 | BolaYetu Platform*
