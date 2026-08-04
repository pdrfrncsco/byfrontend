# Auditoria: Dashboards, Sidebar da Organização e Fluxo de Escalações

> Gerado em: 2026-08-04  
> Âmbito: `src/modules/dashboards/`, `src/modules/organizations/`, `src/app/layouts/`, `src/modules/competitions/`

---

## 1. Inventário de Dashboards Existentes

### 1.1 Dashboards no módulo `/dashboards/pages/`

| Ficheiro | Propósito declarado | Estado |
|---|---|---|
| `DashboardPageSelector.tsx` | Router/seletor que decide qual dashboard renderizar com base no role | ⚠️ **Pivot crítico** — se a lógica aqui estiver desatualizada, todos os outros dashboards ficam inacessíveis |
| `FederationDashboardPage.tsx` | Dashboard para role Federação | ⚠️ Provavelmente obsoleto — ver §2 |
| `LeagueDashboardPage.tsx` | Dashboard para role Liga | ⚠️ Provavelmente obsoleto — ver §2 |
| `ExecutiveDashboardPage.tsx` | Dashboard para role Executivo | ⚠️ Suspeito de redundância com `OrganizationDashboardPage` |
| `CompetitionDashboardPage.tsx` | Dashboard para competição específica | ✅ Ativo — usado via `CompetitionAdminDashboardPage` |

### 1.2 Dashboards fora do módulo `/dashboards/`

| Ficheiro | Propósito declarado | Estado |
|---|---|---|
| `src/modules/shared/pages/DashboardPage.tsx` | Dashboard genérico partilhado | ❌ **Provavelmente obsoleto** — existe `DashboardPageSelector` para este papel |
| `src/modules/organizations/pages/OrganizationDashboardPage.tsx` | Dashboard próprio da Organização | ✅ Ativo — deve ser o dashboard principal do role Org |
| `src/modules/clubs/pages/ClubDashboardPage.tsx` | Dashboard do Clube | ✅ Ativo |
| `src/modules/players/pages/PlayerDashboardPage.tsx` | Dashboard do Jogador | ✅ Ativo |

### 1.3 Hooks de Dashboard

| Ficheiro | Estado |
|---|---|
| `useDashboard.ts` | ⚠️ Conteúdo vazio no contexto — verificar se ainda é importado |
| `useDashboardResolver.ts` | ⚠️ Conteúdo vazio — se não resolve nada, `DashboardPageSelector` fica cego |

---

## 2. Dashboards Obsoletos ou Redundantes

### 2.1 `FederationDashboardPage` e `LeagueDashboardPage`

**Problema:** O sistema usa o conceito de `Organization` como entidade principal (ver `roles-permissions.ts`, `tenant.ts`, `OrganizationDashboardPage`). Não existe módulo `Federation` nem `League` no projeto — apenas `organizations`, `clubs`, `competitions`. Estes dois dashboards provavelmente são **artefactos de uma arquitetura anterior** onde federação e liga eram tipos de organização separados.

**Evidências:**
- Não existe `FederationRoutes`, `LeagueRoutes`, nem módulo correspondente no índice de ficheiros
- O `useRoutes.ts` e `dashboardRoutes.tsx` decidem o routing — se não referenciam estes, são dead code
- `OrganizationDashboardPage` cobre o caso de uso que ambos pretendiam servir

**Decisão:** ❌ Marcar para remoção após confirmação de que `dashboardRoutes.tsx` não os referencia.

### 2.2 `ExecutiveDashboardPage`

**Problema:** "Executive" não corresponde a nenhum role documentado nos ficheiros visíveis (`roles-permissions.ts`). Pode ser um alias de `organization admin` ou pode ser genuinamente obsoleto.

**Decisão:** ⚠️ Verificar se existe o role `executive` em `roles-permissions.ts`. Se não existir → remover.

### 2.3 `src/modules/shared/pages/DashboardPage.tsx`

**Problema:** Com a existência do `DashboardPageSelector`, este componente genérico não tem papel. Se ainda for usado como fallback, é um anti-padrão — o selector deve ser o único ponto de entrada.

**Decisão:** ❌ Remover ou converter em shell vazio para o selector.

---

## 3. Sidebar da Organização — Gap Identificado

### 3.1 Estrutura atual do sidebar

O sidebar é controlado por:
- `DashboardSidebar.tsx` — componente de renderização
- `sidebar-utils.ts` — lógica de filtragem/construção do menu
- `organizations/constants/navigation.tsx` — itens de navegação da Organização

### 3.2 Gap: `OrganizationLineupSubmissionsPage` ausente da navegação

**Ficheiro existente:** `src/modules/organizations/pages/OrganizationLineupSubmissionsPage.tsx`  
**Rota provavelmente definida em:** `src/modules/organizations/routes.ts`

**Problema crítico:** A página existe, a rota provavelmente existe, mas o item de menu correspondente pode **não estar em `organizations/constants/navigation.tsx`**, tornando a página inacessível via UI para administradores de organização.

Este é o fluxo incompleto mais provável:

```
Clube submete escalação (ClubMatchLineupManagerPage)
        ↓
Escalação fica em estado "pendente"
        ↓
Organização deve ver/aprovar em OrganizationLineupSubmissionsPage
        ↓ ← QUEBRA AQUI (sem link no sidebar)
Admin da Org nunca sabe que há submissões pendentes
```

### 3.3 Gap: `OrganizationDashboardPage` pode não estar no seletor

**Problema:** Se `DashboardPageSelector` não mapeia o role de organização para `OrganizationDashboardPage`, o admin de org cai num dashboard errado (Federation, Executive, ou erro 404).

---

## 4. Fluxo de Submissão de Escalações — Mapeamento Completo

### 4.1 Ficheiros envolvidos no fluxo

```
CLUBE (submissão)
├── ClubMatchLineupManagerPage.tsx   ← UI de gestão de escalação pelo clube
├── MatchLineupPage.tsx              ← Vista de escalação (leitura)
├── useMatchLineup.ts                ← Hook de dados da escalação
└── match.api.ts                     ← API calls

COMPETIÇÃO (validação)
├── MatchRefereeReport.tsx           ← Relatório árbitro (pós-jogo)
├── MatchCenterPage.tsx              ← Centro de operações do jogo
└── useMatchReport.ts                ← Hook de relatório

ORGANIZAÇÃO (aprovação de submissões)
└── OrganizationLineupSubmissionsPage.tsx   ← EXISTE mas pode estar isolada
```

### 4.2 Estados do fluxo (inferidos)

| Estado | Ator | Página | Gap? |
|---|---|---|---|
| Criar escalação | Clube | `ClubMatchLineupManagerPage` | ✅ Existe |
| Submeter escalação | Clube | `ClubMatchLineupManagerPage` | ✅ Existe |
| Ver escalação pendente | Organização | `OrganizationLineupSubmissionsPage` | ⚠️ Página existe, acesso incerto |
| Aprovar/Rejeitar escalação | Organização | `OrganizationLineupSubmissionsPage` | ⚠️ Lógica de aprovação incerta |
| Ver escalação aprovada | Competição | `MatchLineupPage` | ✅ Existe |
| Relatório pós-jogo | Árbitro/Org | `MatchRefereeReport` | ✅ Existe |

### 4.3 Notificações no fluxo

`useNotifications.ts` e `NotificationBell.tsx` existem. O gap é se há triggers de notificação quando uma escalação é submetida para a organização. Sem isso, o admin não recebe alerta.

---

## 5. Plano de Resolução — Priorizado

### FASE 1 — Auditoria Rápida (1-2h, não requer código novo)

**1.1 Verificar `dashboardRoutes.tsx`**

Abrir `src/app/routes/slices/dashboardRoutes.tsx` e confirmar:
- [ ] `FederationDashboardPage` é importado e tem rota definida?
- [ ] `LeagueDashboardPage` é importado e tem rota definida?
- [ ] `ExecutiveDashboardPage` é importado e tem rota definida?
- [ ] `OrganizationDashboardPage` tem rota e está acessível pelo role correto?

**1.2 Verificar `DashboardPageSelector.tsx`**

Confirmar o mapeamento `role → componente`:
```ts
// Esperado:
'organization_admin' → OrganizationDashboardPage
'club_admin'         → ClubDashboardPage
'player'             → PlayerDashboardPage
// Não esperado (obsoleto):
'federation'         → FederationDashboardPage  ← remover
'league'             → LeagueDashboardPage       ← remover
'executive'          → ExecutiveDashboardPage    ← confirmar
```

**1.3 Verificar `organizations/constants/navigation.tsx`**

Confirmar se existe entrada para escalações:
```ts
// Deve existir algo como:
{ label: 'Escalações', href: ROUTES.ORG_LINEUP_SUBMISSIONS, icon: ClipboardList }
```
Se não existir → é o gap principal a corrigir.

**1.4 Verificar `roles-permissions.ts`**

- [ ] Existe role `executive`? Se não → `ExecutiveDashboardPage` é dead code
- [ ] Existe role `federation`? Se não → `FederationDashboardPage` é dead code
- [ ] Existe role `league`? Se não → `LeagueDashboardPage` é dead code

---

### FASE 2 — Remoção de Dead Code (2-4h)

**2.1 Remover dashboards obsoletos confirmados**

```bash
# Após confirmação da Fase 1:
rm src/modules/dashboards/pages/FederationDashboardPage.tsx   # se dead code
rm src/modules/dashboards/pages/LeagueDashboardPage.tsx       # se dead code
rm src/modules/dashboards/pages/ExecutiveDashboardPage.tsx    # se dead code
rm src/modules/shared/pages/DashboardPage.tsx                 # se substituído
```

Limpar referências em:
- `src/modules/dashboards/pages/index.ts`
- `src/app/routes/slices/dashboardRoutes.tsx`
- `src/modules/dashboards/index.ts`
- `DashboardPageSelector.tsx`

**2.2 Limpar hooks vazios**

- `useDashboard.ts` — se vazio e não importado → remover
- `useDashboardResolver.ts` — se vazio → ou implementar ou remover e inlinar lógica no Selector

---

### FASE 3 — Corrigir Sidebar da Organização (2-3h)

**3.1 Adicionar entrada de Escalações ao menu da Organização**

Em `src/modules/organizations/constants/navigation.tsx`:

```tsx
import { ClipboardList } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

// Adicionar ao array de navegação da organização:
{
  label: 'Escalações',
  href: ROUTES.ORG_LINEUP_SUBMISSIONS,  // confirmar nome da constante
  icon: ClipboardList,
  permission: 'lineup_submissions:read'  // ajustar ao sistema de permissões existente
}
```

**3.2 Garantir que a rota existe**

Em `src/modules/organizations/routes.ts`, confirmar:
```ts
{
  path: 'lineup-submissions',
  element: <OrganizationLineupSubmissionsPage />,
}
```

Em `src/constants/routes.ts`, confirmar constante:
```ts
ORG_LINEUP_SUBMISSIONS: '/dashboard/org/lineup-submissions'
```

---

### FASE 4 — Completar Fluxo de Aprovação de Escalações (4-8h)

**4.1 Verificar `OrganizationLineupSubmissionsPage` tem UI de aprovação**

A página deve ter:
- Lista de submissões pendentes (com clube, jogo, data limite)
- Ação de aprovar / rejeitar com comentário
- Badge de estado: `pending | approved | rejected`
- Filtros por competição e data

Se apenas lista sem ações → adicionar `ApproveLineupButton` e `RejectLineupDialog`.

**4.2 Verificar API suporta aprovação**

Em `src/modules/competitions/services/match.api.ts`, confirmar endpoints:
```ts
// Devem existir:
PUT /matches/:matchId/lineup/:teamId/approve
PUT /matches/:matchId/lineup/:teamId/reject
```

Se não existirem → coordenar com backend ou usar mock.

**4.3 Adicionar notificação ao clube após decisão**

No hook de mutação de aprovação/rejeição, após sucesso:
```ts
// Disparar notificação para o clube:
notificationsApi.send({
  recipientRole: 'club_admin',
  recipientId: clubId,
  type: 'lineup_submission_reviewed',
  message: approved ? 'Escalação aprovada' : 'Escalação rejeitada',
  matchId
})
```

---

### FASE 5 — Validação Final (1h)

- [ ] `DashboardPageSelector` renderiza `OrganizationDashboardPage` para admin de org
- [ ] Sidebar da organização mostra "Escalações" com contador de pendentes
- [ ] Clube submete escalação → admin de org recebe notificação
- [ ] Admin de org aprova → clube recebe notificação
- [ ] Escalação aprovada visível em `MatchLineupPage` e `MatchCenterPage`
- [ ] Dashboards obsoletos removidos e sem referências quebradas

---

## 6. Resumo Executivo dos Gaps

| # | Gap | Severidade | Esforço |
|---|---|---|---|
| G1 | `FederationDashboardPage` / `LeagueDashboardPage` provavelmente dead code | 🟡 Médio | 1h |
| G2 | `ExecutiveDashboardPage` sem role correspondente | 🟡 Médio | 0.5h |
| G3 | `DashboardPage` (shared) redundante com Selector | 🟢 Baixo | 0.5h |
| G4 | `OrganizationLineupSubmissionsPage` ausente do sidebar | 🔴 Alto | 1h |
| G5 | `DashboardPageSelector` pode não mapear role Org corretamente | 🔴 Alto | 1h |
| G6 | Fluxo de aprovação de escalação sem feedback ao clube | 🔴 Alto | 4-6h |
| G7 | `useDashboard.ts` e `useDashboardResolver.ts` possivelmente vazios | 🟡 Médio | 1h |

**Total estimado:** 9–12h de trabalho de desenvolvimento

---

## 7. Ordem de Execução Recomendada

```
Dia 1 (manhã): Fase 1 — Auditoria (ler os ficheiros reais, confirmar gaps)
Dia 1 (tarde): Fase 2 — Remover dead code confirmado
Dia 2 (manhã): Fase 3 — Corrigir sidebar da organização
Dia 2 (tarde): Fase 4 — Completar fluxo de aprovação de escalações
Dia 3:          Fase 5 — Testes e validação E2E do fluxo completo
```








• Fechei a fase 4 do fluxo de lineups.

  - Backend: adicionei revisão de submissão com rejected, review_notes,      
    reviewed_at/by, serviço review_lineup_submission e o endpoint PATCH /api/
    v1/organizations/me/lineups/pending/<id>/review/ em backend/
    organizations/views/organization_views.py:529, backend/competitions/     
    models/match_lineup.py:212, backend/competitions/services/
    lineup_service.py:345, backend/organizations/urls.py:42, backend/        
    competitions/migrations/0017_linesubmission_review_fields.py.

  - Frontend: a tela de submissões agora aprova/rejeita com notas e feedback 
    visual em frontend/src/modules/organizations/pages/
    OrganizationLineupSubmissionsPage.tsx:60, usando o novo client em        
    frontend/src/modules/organizations/services/organization.api.ts:140 e a  
    rota em frontend/src/constants/routes.ts:124.

  - Tipos/API: atualizei o status e payload de revisão em frontend/src/      
    modules/competitions/types/competition.types.ts:96.

  - Testes: passei a suíte python manage.py test
    organizations.tests.test_pending_lineups
    competitions.tests.test_lineup_integration.

  - Frontend lint: npx eslint nos arquivos tocados ficou limpo de erros;     
    restam só warnings pré-existentes de any em organization.api.ts e no     
    teste dela.

  Se quiser, no próximo passo eu posso fechar a fase 5 com ajustes de UX fina
  nessa tela ou revisar a integração dos badges/estados em outras listas     
  similares.

