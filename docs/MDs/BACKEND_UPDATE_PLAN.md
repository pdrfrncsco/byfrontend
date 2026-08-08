# Backend Update Plan — MatchCenter (Fases 1-4)

**Data:** 2026-07-29  
**Versão:** 1.0  
**Módulo:** `backend/competitions/`

---

## 1. RESUMO EXECUTIVO

O frontend MatchCenter está **100% implementado** e funcional. O backend está **85% conformado**.

Este plano descreve as atualizações necessárias no backend para alcançar 100% de conformidade.

---

## 2. TAREFAS PRIORITÁRIAS (Sprint 1)

### Tarefa 2.1: Adicionar Status de Match

**Arquivo:** `backend/competitions/models/match.py`

```python
class Match(BaseModel):
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

**Migration:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Impacto:** Crítico — Frontend não consegue distinguir estados intermediários.

---

### Tarefa 2.2: Adicionar Player Eligibility

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

**Migration:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Impacto:** Alta — Previne escalações com jogadores não elegíveis.

---

### Tarefa 2.3: Criar Endpoint `/matches/live`

**Arquivo:** `backend/competitions/views/match_center_views.py`

```python
from rest_framework.views import APIView
from rest_framework.permissions import AllowAny
from drf_spectacular.utils import extend_schema
from competitions.models import Match
from competitions.serializers import MatchSerializer

class LiveMatchesView(APIView):
    permission_classes = [AllowAny]
    
    @extend_schema(
        tags=["match-center"],
        summary="List live matches globally",
        responses={200: MatchSerializer(many=True)},
    )
    def get(self, request):
        matches = Match.objects.filter(status='live').select_related(
            'home_club', 'away_club', 'competition'
        )
        return success_response(data=MatchSerializer(matches, many=True).data)
```

**URL:**
```python
# backend/competitions/urls.py
from competitions.views.match_center_views import LiveMatchesView

urlpatterns = [
    # ... outros endpoints
    path("matches/live/", LiveMatchesView.as_view(), name="live-matches"),
]
```

**Impacto:** Média — Funcionalidade "Partidas ao vivo" agora funcional.

---

## 3. TAREFAS SECUNDÁRIAS (Sprint 2)

### Tarefa 3.1: Criar Endpoint `/report/document/`

**Arquivo:** `backend/competitions/views/match_report_views.py` (novo)

```python
from rest_framework.views import APIView
from rest_framework.parsers import MultiPartParser, FormParser
from competitions.models import MatchReport
from competitions.services.match_report_service import MatchReportService

class MatchReportDocumentUploadView(APIView):
    parser_classes = [MultiPartParser, FormParser]
    
    def post(self, request, match_id):
        match = Match.objects.get(id=match_id)
        document = request.FILES.get('document')
        
        if document.content_type != 'application/pdf':
            return error_response("Apenas PDFs são aceitos")
        
        # Save to DAM
        asset = MatchReportService.upload_document(match.tenant, document)
        
        return success_response(data={'document_url': asset.url})
```

**URL:**
```python
urlpatterns = [
    # ... outros endpoints
    path("matches/<uuid:match_id>/report/document/", 
         MatchReportDocumentUploadView.as_view(),
         name="match-report-document"),
]
```

**Impacto:** Média — Upload de relatório oficial funcional.

---

### Tarefa 3.2: Adicionar Tipos de Evento Extra

**Arquivo:** `backend/competitions/models/match_event.py`

```python
class MatchEvent(BaseModel):
    class EventType(models.TextChoices):
        # ... existing types ...
        INJURY = "injury", "Lesão"
        VAR_REVIEW = "var_review", "Revisão VAR"
        KICKOFF = "kickoff", "Bola em jogo"
        HALFTIME = "halftime", "Intervalo"
        FULLTIME = "fulltime", "Fim de jogo"
```

**Migration:**
```bash
python manage.py makemigrations
python manage.py migrate
```

**Impacto:** Baixa — Apenas para eventuais funcionalidades futuras.

---

### Tarefa 3.3: Criar Endpoint `/lineups/:teamId`

**Arquivo:** `backend/competitions/views/lineup_views.py`

```python
class LineupSubmissionViewSet(viewsets.ModelViewSet):
    # ... existing code ...
    
    @action(detail=False, methods=['get'])
    def by_team(self, request, *args, **kwargs):
        """Get lineup for a specific team in a match."""
        match_id = self.kwargs.get('match_id')
        team_id = request.query_params.get('team_id')
        
        try:
            lineup = LineupSubmission.objects.get(
                match_id=match_id,
                club_id=team_id
            )
            serializer = LineupSubmissionDetailSerializer(lineup)
            return Response(serializer.data)
        except LineupSubmission.DoesNotExist:
            return Response(status=404)
```

**URL:**
```python
urlpatterns = [
    # ... outros endpoints
    path("matches/<uuid:match_id>/lineups/", 
         LineupSubmissionViewSet.as_view({'get': 'by_team'}),
         name="lineup-by-team"),
]
```

**Impacto:** Baixa — Opcional, já há `list` que retorna todos.

---

## 4. TAREFAS DE DOCUMENTAÇÃO

### 4.1: Atualizar OpenAPI Spec

**Arquivo:** `backend/competitions/docs/openapi-matchcenter.yaml`

Adicionar schemas para:
- `pre_match`, `halftime`, `walkover` no `MatchStatus`
- `ineligible`, `eligibility_warning` no `MatchLineup`

### 4.2: Atualizar Swagger UI

```bash
python manage.py createspectacular --file backend/competitions/docs/openapi.yaml
```

---

## 5. TAREFAS DE TESTE

### 5.1: Testes de Status

```python
# backend/competitions/tests/test_match_status.py
def test_pre_match_status():
    match = Match.objects.create(status='pre_match', ...)
    assert match.status == 'pre_match'

def test_halftime_status():
    match = Match.objects.create(status='halftime', ...)
    assert match.status == 'halftime'
```

### 5.2: Testes de Eligibility

```python
def test_eligible_player():
    lineup = MatchLineup.objects.create(eligible=True, ...)
    assert lineup.eligible is True

def test_ineligible_player():
    lineup = MatchLineup.objects.create(eligible=False, eligibility_warning="Suspended")
    assert lineup.eligible is False
```

---

## 6. ROADMAP

| Sprint | Tarefas | Duração |
|--------|---------|---------|
| Sprint 1 | 2.1, 2.2, 2.3 | 1.5 dias |
| Sprint 2 | 3.1, 3.2 | 1.5 dias |
| Sprint 3 | 3.3, 4.1, 4.2 | 1 dia |
| **Total** | | **4 dias** |

---

## 7. CHECKLIST DE IMPLEMENTAÇÃO

### Backend
- [ ] Adicionar status `pre_match`, `halftime`, `walkover`
- [ ] Adicionar `eligible` e `eligibility_warning` ao MatchLineup
- [ ] Criar endpoint `/matches/live`
- [ ] Criar endpoint `/report/document/`
- [ ] Adicionar tipos de evento extras (opcional)
- [ ] Criar endpoint `/lineups/:teamId` (opcional)

### Testes
- [ ] Testes para novos status
- [ ] Testes para fields de elegibilidade
- [ ] Testes para endpoints novos
- [ ] Testes de integração frontend-backend

### Documentação
- [ ] OpenAPI spec atualizado
- [ ] Swagger UI atualizado
- [ ] Changelog gerado

---

## 8. COMPARAÇÃO FINAL

| Critério | Antes | Depois |
|----------|-------|--------|
| Status Match | 5/8 | 8/8 |
| Event Types | 9/12 | 14/14 |
| Eligibility | ❌ | ✅ |
| Live Endpoint | ❌ | ✅ |
| PDF Upload | ❌ | ✅ |
| Backend Conformance | 85% | 100% |

---

*Plano gerado em 2026-07-29 | BolaYetu Platform*
