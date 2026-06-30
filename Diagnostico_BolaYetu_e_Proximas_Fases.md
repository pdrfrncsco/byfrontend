# BOLAYETU — Diagnóstico de Implementação e Plano de Próximas Fases

**Data:** 30 de Junho de 2026
**Âmbito:** Auditoria cruzada entre `docs/` (arquitetura oficial) e o código real do repositório (backend Django + frontend React)
**Autor:** Análise técnica automatizada

---

## 1. Resumo Executivo

O BolaYetu tem uma **documentação de arquitetura muito madura e completa** (18 documentos cobrindo visão de negócio, arquitetura de sistema, multi-tenancy, segurança, DAM, DevOps e eventos), mas a **implementação real está significativamente atrás dessa visão**.

Em termos simples:

- O que está **construído e funcional**: autenticação, multi-tenant básico (por relação `TenantMembership`, não por subdomínio), Organizações, Clubes, Competições (CRUD simples) e o wizard de onboarding no frontend.
- O que está **documentado mas não iniciado no backend**: Jogadores, Partidas, Transferências, Estatísticas, Notícias, Notificações, Subscrições/Billing, Analytics, Digital Asset Management (DAM), arquitetura de eventos, testes automatizados fora de `accounts/`, CI/CD e Docker Compose.
- Existem também **desvios da própria arquitetura documentada** (ex: armazenamento local em vez de Cloudflare R2, tenant resolvido por utilizador em vez de por subdomínio, respostas de erro mal formatadas em alguns endpoints).

Este documento serve de baseline para decidir as próximas fases com conhecimento de causa.

---

## 2. Metodologia

Foram comparados:
1. Os 18 documentos em `docs/00-overview/`, `docs/01-architecture/` e `docs/02-development/` (a "verdade oficial" segundo `000_IMPLEMENTATION_GUIDE_FOR_LLMS.md`).
2. O código-fonte real: `INSTALLED_APPS` em `config/settings.py`, modelos, serviços, selectors, views, urls, testes, e a árvore de módulos do frontend em `src/modules/`.

---

## 3. Estado por Domínio

| Domínio (doc `02_ROADMAP.md`) | Estado documentado | Estado real no backend | Estado real no frontend |
|---|---|---|---|
| **Fundação / Auth / Multi-Tenant (v2.0)** | Concluído | ✅ `accounts` completo (registo, login, JWT, refresh, reset de password, memberships); `core.Tenant` modelo completo | ✅ Login/Registo/Forgot/Reset funcionais; `AuthProvider`, `TenantProvider` |
| **Organizations (v2.1)** | Concluído | ✅ CRUD, logo/banner upload, KPIs, histórico, subscrição de fãs, gestão de membros, launch do portal | ✅ Settings page, dashboard, listagem pública, detalhe público |
| **Clubs (v2.2)** | Concluído | ✅ CRUD, membros (jogadores/staff), squad/staff públicos, ativar/suspender | ⚠️ Parcial — apenas listagem e detalhe básico; sem gestão de membros, sem upload de logo na UI |
| **Players (v2.3)** | Concluído | ❌ **Não existe app `players`**; jogadores só existem como `ClubMember` (sem perfil próprio, carreira, estatísticas, vídeos) | ❌ Módulo `src/modules/players` vazio (`export {}`) |
| **Competitions (v2.4)** | Concluído | ⚠️ Parcial — apenas CRUD de Competição (nome, tipo, época, estado). Sem inscrições, calendário, jogos, classificações, fair play, rankings | ⚠️ Parcial — apenas criação dentro do onboarding |
| **Match Center (v2.5)** | Planeado | ❌ Não existe app `matches` | ❌ Módulo vazio |
| **Transfers (v2.6)** | Planeado | ❌ Não existe app `transfers` | ❌ Módulo vazio |
| **Analytics (v2.7)** | Planeado | ❌ Não existe | ❌ Dashboards usam **dados mock** (`MOCK_DASHBOARD_DATA`) porque o endpoint `/dashboard/overview/` não existe no backend |
| **Marketplace (v2.8)** | Planeado | ❌ Não iniciado | ❌ Não iniciado |
| **News / Notifications / Subscriptions (billing)** | Mencionados em `06A` e `10` | ❌ Não existem apps | ❌ Módulos vazios |
| **Digital Asset Management (08A)** | Arquitetura definida (MediaAsset, MediaUsage, variantes, Cloudflare R2) | ❌ **Não implementado.** Logos/banners usam `default_storage` (disco local) diretamente nos services de `organizations` e `clubs` | — |
| **Eventos e Workflows (10)** | Dispatcher central, eventos de domínio (`OrganizationCreated`, `CompetitionStarted`, etc.) | ❌ Não implementado. Nenhum `core/events/` existe | — |

---

## 4. Conformidade com a Arquitetura Documentada

### 4.1 O que está bem alinhado
- **Separação em camadas** (Services / Selectors / Serializers / Views) é respeitada de forma consistente em `accounts`, `organizations`, `clubs` e `competitions`.
- **Exceções de domínio** específicas (`ClubNotFound`, `DuplicateClubName`, etc.) seguem o padrão de `01_CODING_STANDARDS.md`.
- **Resposta padrão** (`success_response` / `error_response`) é usada na generalidade dos endpoints.
- **BaseModel com UUID + timestamps** é usado de forma consistente (`common/models.py`).

### 4.2 Desvios e dívidas técnicas identificados

1. **Multi-tenant não é resolvido por subdomínio nas views.**
   `core/middleware.py` define `TenantMiddleware` e popula `request.tenant`, mas **nenhuma view o utiliza**. Em vez disso, o tenant é sempre derivado da `TenantMembership` do utilizador autenticado (`OrganizationService.get_organization_for_user`). Isto contraria `06_MULTITENANT_ARCHITECTURE.md` (secções 7–8, "Tenant Resolver"), onde o subdomínio deveria ser a fonte de verdade antes da autenticação.

2. **Armazenamento de ficheiros viola `08_MEDIA_STORAGE_ARCHITECTURE.md`.**
   `OrganizationService.upload_logo/upload_banner` e `ClubService.upload_logo` usam `django.core.files.storage.default_storage` (disco local), apesar de `django-storages` e `boto3` estarem em `requirements.txt` e das variáveis `CLOUDFLARE_R2_*` existirem em `.env.example`. Não existe configuração de `STORAGES`/`DEFAULT_FILE_STORAGE` no `settings.py` para R2. O módulo `MediaAsset` (08A) não existe — cada domínio reinventa o seu próprio upload, exactamente o que o documento 08A pretende evitar ("Nunca armazenar ficheiros em módulos").

3. **Inconsistência na envelope de erro.**
   - `ClubLogoView.post` (sem ficheiro) devolve `success_response(message=..., status_code=400)` — envia `"success": true` com um HTTP 400, o que é contraditório.
   - `CompetitionListCreateView.post` (nome duplicado) tem o mesmo problema — devolve `success_response(..., status_code=400)` em vez de `error_response(...)`.
   `OrganizationLogoView`/`OrganizationBannerView` já corrigem isto correctamente usando `error_response`. Recomenda-se uniformizar.

4. **Cobertura de testes muito abaixo dos 80% exigidos em `02_BACKEND_GUIDE.md`.**
   Só existe suite de testes em `accounts/tests/` (models, selectors, services, permissions, API). `organizations`, `clubs` e `competitions` **não têm nenhum teste**, apesar de serem os domínios com mais lógica de negócio actualmente em produção.

5. **Falta de Docker Compose / CI.**
   `09_DEVOPS_ARCHITECTURE.md` exige `docker-compose.dev.yml/test.yml/prod.yml` e GitHub Actions. Existe um `Dockerfile` apenas para o frontend; não há `Dockerfile` para o backend nem ficheiros de compose nem workflows de CI no repositório.

6. **Nenhuma arquitetura de eventos.**
   `10_EVENTS_AND_WORKFLOWS.md` prevê um dispatcher (`core/events/`) e eventos como `OrganizationCreated`, `CompetitionPublished`. Hoje a comunicação entre módulos é feita por chamada directa de serviços (ex: `OrganizationService.launch_portal` chama directamente `Competition.objects.filter(...).update(...)`), o que cria acoplamento que o próprio documento de arquitetura queria evitar.

7. **`drf-spectacular` tags incompletas.**
   `SPECTACULAR_SETTINGS["TAGS"]` em `config/settings.py` só define `auth`, `users`, `tenants`, `organizations` — faltam `clubs` e `competitions`, que já têm `@extend_schema(tags=["clubs"/"competitions"])` nas views (vão aparecer na documentação OpenAPI sem descrição).

8. **Frontend com dados fictícios a mascarar gaps de backend.**
   `src/modules/dashboards/services/dashboard.api.ts` tenta `GET /dashboard/overview/`, endpoint que **não existe** em `config/urls.py`. O `catch` devolve sempre `MOCK_DASHBOARD_DATA`, o que faz os dashboards parecerem funcionais em demonstração mas escondem que não há nenhum backend de analytics real.

9. **Grande volume de módulos-fantasma no frontend.**
   `src/modules/{players,matches,transfers,news,notifications,subscriptions,settings,rankings,stadiums,fans}` existem apenas como ficheiros `index.ts` com `export {}` — estrutura de pastas criada antecipadamente mas sem nenhuma implementação. Isto é razoável como scaffold, mas deve ser tratado como "não iniciado" e não como "em progresso".

10. **Jogador como entidade global (06A) ainda não existe.**
    Toda a arquitetura de "Player é uma entidade Global, independente de Tenant/Clube, com `PlayerRegistration` para histórico de carreira" descrita em `06A_GLOBAL_AND_TENANT_DOMAIN.md` não tem nenhuma implementação. Atualmente um "jogador" é apenas um `ClubMember` com `role=player`, tenant-scoped, sem carreira nem perfil próprio — o oposto do que a documentação manda.

---

## 5. Riscos Prioritários a Corrigir Antes de Escalar

| # | Risco | Severidade | Esforço estimado |
|---|---|---|---|
| 1 | Upload de ficheiros em disco local (não sobrevive a deploys/múltiplas instâncias, perde-se em cada release) | 🔴 Alta | Médio |
| 2 | Tenant não resolvido por subdomínio (impede portais públicos tipo `faf.bolayetu.com` funcionarem como pretendido) | 🔴 Alta | Médio-Alto |
| 3 | Zero testes em `organizations`/`clubs`/`competitions` | 🟠 Média-Alta | Médio |
| 4 | Inconsistência `success`/`error` envelope em alguns endpoints | 🟡 Média | Baixo |
| 5 | Sem CI nem Docker Compose (risco operacional, não de produto) | 🟡 Média | Médio |
| 6 | Dashboards com dados mock permanentes (risco de “demo enganosa”) | 🟡 Média | Médio |

---

## 6. Plano de Próximas Fases

A proposta segue a sequência **Database → Backend → API → Frontend → Tests → Docs** definida em `000_IMPLEMENTATION_GUIDE_FOR_LLMS.md`, mas reordenada para primeiro **estabilizar a fundação** antes de abrir novos domínios — caso contrário a dívida técnica actual (storage, tenant, testes) vai multiplicar-se em cada novo módulo.

### Fase 0 — Estabilização da Fundação (recomendado antes de tudo)
**Objetivo:** corrigir os desvios de arquitetura antes de construir Players/Matches em cima deles.
- Migrar uploads de `organizations` e `clubs` para Cloudflare R2 via `django-storages` (configurar `STORAGES` em `settings.py`).
- Implementar o `TenantMiddleware` a sério: resolver tenant por subdomínio e usá-lo nas views públicas (`OrganizationPublicDetailView`, etc.), mantendo o fallback actual por `TenantMembership` apenas para rotas de admin autenticado.
- Uniformizar todas as respostas de erro (`error_response` em vez de `success_response(status_code=4xx)`).
- Escrever testes (models/services/selectors/API) para `organizations`, `clubs`, `competitions` até cobertura razoável (~70-80%).
- Adicionar `clubs` e `competitions` a `SPECTACULAR_SETTINGS["TAGS"]`.
- Criar `Dockerfile` do backend + `docker-compose.dev.yml` mínimo (Django + Postgres + Redis).

### Fase 1 — Digital Asset Management (08A)
**Objetivo:** parar de reinventar upload em cada módulo.
- Criar app `media/` com `MediaAsset`, `MediaUsage`, `MediaVariant` conforme `08A_DIGITAL_ASSET_MANAGEMENT.md`.
- Migrar `Organization.logo/banner` e `Club.logo` para referenciarem `MediaAsset` via `MediaUsage`, em vez de campos `URLField` directos.
- Task Celery para gerar thumbnails (mesmo que apenas 1 variante inicialmente).

### Fase 2 — Players (Jogadores como entidade Global)
**Objetivo:** implementar `06A_GLOBAL_AND_TENANT_DOMAIN.md` correctamente, em vez de continuar a usar `ClubMember` como substituto.
- Modelo `Player` (global, sem tenant) + `PlayerRegistration` (tenant/clube/competição/época-scoped).
- Migrar dados existentes de `ClubMember(role=player)` para o novo modelo, mantendo `ClubMember` para staff não-jogador.
- API pública `/api/v1/players/` (perfil, histórico de carreira, estatísticas básicas).
- Frontend: implementar `src/modules/players` (hoje vazio) — listagem, perfil, ligação ao clube actual.

### Fase 3 — Competitions v2 (Calendário, Jogos, Classificações)
**Objetivo:** completar o que falta de `Competitions (v2.4)` segundo o roadmap.
- Modelos: `Season`/inscrição de clubes, `Match`, `Standing` (classificação recalculável conforme `03_DATABASE_ARCHITECTURE.md` §11).
- Geração de calendário (round-robin para ligas, eliminatórias para taças).
- Endpoint de classificações em tempo real.
- Frontend: tabela de classificação e calendário de jogos por competição.

### Fase 4 — Match Center (v2.5)
- Eventos de jogo (golos, cartões, substituições), súmula digital.
- Estatísticas derivadas por jogo/competição/jogador (golos, assistências, jogos).
- Liga isto à arquitetura de eventos (Fase 6) para disparar `MatchFinished` → recalcular `Standing`.

### Fase 5 — Notificações e Subscrições de Conteúdo
- App `notifications/` com templates globais (`06A`) e canais (email já existe via Celery/SMTP, push fica para depois).
- Ligar a eventos de domínio: `CompetitionStarted`, `ClubApproved`, `MatchFinished` → notificação aos subscritores da organização (já existe `OrganizationSubscription`, falta o lado de disparo).

### Fase 6 — Arquitetura de Eventos (10_EVENTS_AND_WORKFLOWS)
**Pode correr em paralelo com as Fases 3-5**, mas idealmente antes da Fase 4 para já nascer "event-driven".
- `core/events/dispatcher.py` + `core/events/base.py`.
- Migrar pontos de acoplamento directo existentes (ex: `OrganizationService.launch_portal` a tocar directamente em `Competition`) para publicarem eventos e o consumidor reagir.

### Fase 7 — Transfers, Analytics, Marketplace (v2.6–v2.8)
- Transferências de jogadores entre clubes (usa `PlayerRegistration` da Fase 2).
- Substituir o dashboard mock do frontend por endpoint real de analytics agregando dados já existentes (clubes, competições, jogadores, jogos).
- Marketplace fica como horizonte de médio prazo, sem dependências bloqueantes além das fases anteriores.

### Fase 8 — DevOps & Qualidade Contínua (transversal, deve começar cedo)
- GitHub Actions: lint + testes + build em cada PR (ainda não existe).
- `docker-compose.prod.yml` + Nginx + Cloudflare conforme `09_DEVOPS_ARCHITECTURE.md`.
- Elevar cobertura de testes para 80% em todos os domínios à medida que cada fase é fechada (não deixar acumular dívida como aconteceu até agora).

---

## 7. Recomendação de Sequenciamento

```
Fase 0 (Fundação)  →  Fase 1 (DAM)  →  Fase 6 (Eventos, base)
        │
        ├──► Fase 2 (Players)
        │
        ├──► Fase 3 (Competitions v2) → Fase 4 (Match Center)
        │
        └──► Fase 5 (Notificações)

Fase 8 (DevOps/Qualidade) corre em paralelo desde a Fase 0.
Fase 7 (Transfers/Analytics/Marketplace) só depois de 2, 3 e 4 estarem fechadas.
```

**Justificação:** construir Players, Matches e Transfers em cima de um storage local e de um tenant mal resolvido só aumenta o custo de correcção mais tarde. A Fase 0 é pequena em escopo mas elevada em retorno — sem ela, cada fase seguinte herda os mesmos três problemas (storage, tenant, testes).

---

## 8. Nota Final

A documentação do BolaYetu (`docs/`) já é, por si só, um activo valioso — está mais completa do que a maioria dos produtos SaaS neste estágio. O risco real não é falta de visão, é a **distância crescente entre o que os documentos prescrevem e o que o código faz**. Este diagnóstico deve ser revisitado a cada fase fechada para evitar que essa distância volte a aumentar.
