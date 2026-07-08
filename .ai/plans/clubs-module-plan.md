# Plano de Implementação — Módulo Clubs (Frontend)

## Análise de Gap

### Backend Disponível (APIs)
| Endpoint | Método | Descrição | Frontend |
|----------|--------|-----------|----------|
| `/clubs/public/` | GET | Lista pública de clubes | ✅ Parcial |
| `/clubs/public/<slug>/` | GET | Detalhe público | ✅ Parcial |
| `/clubs/public/<slug>/kpis/` | GET | KPIs do clube | ❌ Não implementado |
| `/clubs/public/<slug>/squad/` | GET | Plantel (jogadores) | ❌ Não implementado |
| `/clubs/public/<slug>/staff/` | GET | Staff técnico | ❌ Não implementado |
| `/clubs/public/<slug>/documents/` | GET | Documentos públicos | ❌ Não implementado |
| `/clubs/public/<slug>/sponsors/` | GET | Patrocinadores públicos | ❌ Não implementado |
| `/clubs/me/` | GET | Clube do utilizador autenticado | ❌ Não implementado |
| `/clubs/me/logo/` | POST | Upload logo | ✅ Parcial |
| `/clubs/` | POST | Criar clube | ✅ Parcial |
| `/clubs/<slug>/` | PATCH | Atualizar clube | ✅ Parcial |
| `/clubs/<slug>/activate/` | POST | Ativar clube | ❌ Não implementado |
| `/clubs/<slug>/suspend/` | POST | Suspender clube | ❌ Não implementado |
| `/clubs/<slug>/members/` | GET/POST | Gestão de membros | ✅ Parcial |
| `/clubs/<slug>/members/<id>/` | PATCH/DELETE | Detalhe membro | ✅ Parcial |
| `/clubs/<slug>/documents/` | GET/POST | Gestão documentos | ❌ Não implementado |
| `/clubs/<slug>/sponsors/` | GET/POST | Gestão patrocinadores | ❌ Não implementado |
| `/clubs/transfers/` | CRUD | Transferências | ❌ Não implementado |

### Estado Atual do Frontend

**Tipos** (`types/index.ts`):
- ✅ `Club` básico
- ✅ `ClubMember` básico
- ✅ `ClubKpis` básico
- ❌ Faltam: `ClubDocument`, `ClubSponsor`, `Transfer`, tipos de resposta paginada

**Services** (`services/index.ts`):
- ✅ `listClubs`, `getClub`
- ✅ `createClub`, `updateClub`, `uploadClubLogo`
- ✅ CRUD de membros
- ❌ Faltam: KPIs, squad, staff, documents, sponsors, transfers

**Hooks** (`hooks/useClubs.ts`):
- ✅ `useClubs`, `useClub`
- ✅ `useCreateClub`, `useUpdateClub`, `useUploadClubLogo`
- ✅ Hooks de membros
- ❌ Faltam: KPIs, squad, staff, documents, sponsors, transfers

**Pages** (`pages/`):
- ⚠️ `ClubListPage.tsx` — Básico, sem filtros, paginação, loading states
- ⚠️ `ClubDetailPage.tsx` — Básico, sem abas, KPIs, squad/staff

**Components** (`components/`):
- ⚠️ `ClubCard.tsx` — Básico
- ⚠️ `ClubMembersList.tsx` — Básico

---

## Plano de Implementação

### Fase 1: Fundação (Tipos, Services, Hooks) ✅ Prioridade Alta

#### 1.1 Tipos Completos
**Ficheiro:** `types/index.ts`

```typescript
// Adicionar:
- ClubListParams (search, status, tenant)
- ClubDocument
- ClubSponsor
- Transfer (player_name, from_club, to_club, status, dates)
- PaginatedResponse<T>
- ClubSquadMember
- ClubStaffMember
```

#### 1.2 Services Completos
**Ficheiro:** `services/index.ts`

```typescript
// Adicionar:
- getClubKpis(slug)
- getClubSquad(slug)
- getClubStaff(slug)
- getClubDocuments(slug), createClubDocument(slug, data)
- getClubSponsors(slug), createClubSponsor(slug, data)
- getMe() — clube do utilizador autenticado
- activateClub(slug), suspendClub(slug)
```

#### 1.3 Hooks Completos
**Ficheiro:** `hooks/useClubs.ts`

```typescript
// Adicionar:
- useClubKpis(slug)
- useClubSquad(slug)
- useClubStaff(slug)
- useClubDocuments(slug)
- useClubSponsors(slug)
- useClubMe()
- useActivateClub(), useSuspendClub()
```

---

### Fase 2: Páginas Públicas ✅ Prioridade Alta

#### 2.1 Lista Pública de Clubes
**Ficheiro:** `pages/ClubListPage.tsx`

Funcionalidades:
- [ ] Search input com debounce
- [ ] Filtro por status (ativo, pendente, suspenso)
- [ ] Filtro por organização (tenant)
- [ ] Paginação ou infinite scroll
- [ ] Loading skeleton
- [ ] Empty state
- [ ] Error state com retry
- [ ] Grid responsivo de cards

#### 2.2 Detalhe Público do Clube
**Ficheiro:** `pages/ClubDetailPage.tsx`

Funcionalidades:
- [ ] Hero section com logo, nome, localização
- [ ] Tabs: Visão Geral | Plantel | Staff | Documentos | Patrocinadores
- [ ] KPIs widget (jogos, vitórias, golos)
- [ ] Lista de jogadores (squad) com posição e número
- [ ] Lista de staff técnico
- [ ] Documentos públicos
- [ ] Patrocinadores

#### 2.3 Componentes de Suporte
**Ficheiros:**
- `components/ClubCard.tsx` — Melhorar com badge de status, verified
- `components/ClubKpisCard.tsx` — Novo
- `components/ClubSquadTable.tsx` — Novo
- `components/ClubStaffList.tsx` — Novo
- `components/ClubDocumentsList.tsx` — Novo
- `components/ClubSponsorsList.tsx` — Novo
- `components/ClubSkeleton.tsx` — Novo
- `components/ClubEmptyState.tsx` — Novo
- `components/ClubErrorState.tsx` — Novo

---

### Fase 3: Gestão do Clube ✅ Prioridade Média

#### 3.1 Dashboard do Clube
**Ficheiro:** `pages/ClubDashboardPage.tsx` — Novo

Funcionalidades:
- [ ] KPIs em tempo real
- [ ] Próximos jogos
- [ ] Atividade recente
- [ ] Ações rápidas
- [ ] Usar DashboardLayout

#### 3.2 Configurações do Clube
**Ficheiro:** `pages/ClubSettingsPage.tsx` — Novo

Funcionalidades:
- [ ] Formulário de edição (RHF + Zod)
- [ ] Upload de logo com preview
- [ ] Cores de branding (color picker)
- [ ] Informações de contacto
- [ ] Descrição e história
- [ ] Usar DashboardLayout

#### 3.3 Gestão de Membros
**Ficheiro:** `pages/ClubMembersPage.tsx` — Novo

Funcionalidades:
- [ ] Tabela com TanStack Table
- [ ] Filtros por papel (jogador, treinador, staff)
- [ ] Adicionar membro (form)
- [ ] Editar membro
- [ ] Remover membro
- [ ] Importar em massa (CSV)

#### 3.4 Gestão de Documentos
**Ficheiro:** `pages/ClubDocumentsPage.tsx` — Novo

Funcionalidades:
- [ ] Lista de documentos
- [ ] Upload de documento
- [ ] Categorias (contrato, licença, outro)
- [ ] Download
- [ ] Eliminar

#### 3.5 Gestão de Patrocinadores
**Ficheiro:** `pages/ClubSponsorsPage.tsx` — Novo

Funcionalidades:
- [ ] Lista de patrocinadores
- [ ] Adicionar patrocinador
- [ ] Editar patrocinador
- [ ] Remover patrocinador

---

### Fase 4: Transferências ✅ Prioridade Média

#### 4.1 Lista de Transferências
**Ficheiro:** `pages/ClubTransfersPage.tsx` — Novo

Funcionalidades:
- [ ] Lista de transferências do clube
- [ ] Filtros por estado (pendente, aprovado, rejeitado)
- [ ] Filtros por época
- [ ] Detalhe de transferência

#### 4.2 Criar Transferência
**Ficheiro:** `pages/ClubTransferCreatePage.tsx` — Novo

Funcionalidades:
- [ ] Wizard de criação
- [ ] Seleção de jogador
- [ ] Clube de origem/destino
- [ ] Documentos de suporte
- [ ] Submissão para aprovação

---

### Fase 5: Qualidade ✅ Prioridade Alta

#### 5.1 Testes
**Ficheiros:**
- `tests/services/club.api.test.ts`
- `tests/hooks/useClubs.test.ts`
- `tests/components/ClubCard.test.tsx`
- `tests/components/ClubKpisCard.test.tsx`

#### 5.2 Estados de Erro
- [ ] Integrar PermissionDenied (403)
- [ ] Integrar NotFound (404)
- [ ] Integrar ValidationError (422)
- [ ] Integrar ServerError (500)

#### 5.3 Acessibilidade
- [ ] Focus management
- [ ] ARIA labels
- [ ] Keyboard navigation

---

## Ordem de Execução Recomendada

1. **Fase 1** — Fundação (1-2 horas)
2. **Fase 2** — Páginas Públicas (4-6 horas)
3. **Fase 5** — Qualidade (integração contínua)
4. **Fase 3** — Gestão do Clube (4-6 horas)
5. **Fase 4** — Transferências (2-4 horas)

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
// clubs/routes.ts
export const ROUTES = {
  CLUBS: '/clubs',
  CLUB_DETAIL: (slug: string) => `/clubs/${slug}`,
  CLUB_DASHBOARD: '/dashboard/club',
  CLUB_SETTINGS: '/dashboard/club/settings',
  CLUB_MEMBERS: '/dashboard/club/members',
  CLUB_DOCUMENTS: '/dashboard/club/documents',
  CLUB_SPONSORS: '/dashboard/club/sponsors',
  CLUB_TRANSFERS: '/dashboard/club/transfers',
  CLUB_TRANSFER_CREATE: '/dashboard/club/transfers/create',
}
```

---

## Checklist de Conformidade com Skills

### Frontend Engineer Skill
- [x] Feature-based architecture
- [ ] Service layer (parcial)
- [ ] TanStack Query (parcial)
- [ ] RHF + Zod (parcial)
- [ ] Loading/Empty/Error states
- [ ] Testes

### Frontend Reviewer Skill
- [ ] Componentes reutilizáveis
- [ ] Tipos TypeScript
- [ ] Acessibilidade WCAG 2.1
- [ ] Responsivo

### Dashboard Designer Skill
- [ ] KPIs com trend
- [ ] Quick actions
- [ ] Activity feed

---

**Próximo passo:** Executar Fase 1 — Fundação
