# Plano de Implementação — Categorias de Jogadores & Separação por Género

**Versão:** 1.0  
**Data:** Agosto 2026  
**Âmbito:** Módulos `players`, `clubs`, `organizations`, `competitions`

---

## 1. Visão Geral

Duas funcionalidades principais a implementar de forma integrada:

| Funcionalidade | Descrição |
|---|---|
| **Categorias de Jogadores** | Sistema de categorias hierárquico (federação define base, clubes personalizam) |
| **Género do Clube** | Separação Masculino / Feminino / Misto ao nível do clube e das competições |

Ambas afetam o registo de jogadores, a gestão de equipas, os ecrãs de squad e a navegação de competições.

---

## 2. Modelo de Dados

### 2.1 Novas Entidades & Extensões de Tipos

#### `PlayerCategory` — nova entidade partilhada
```ts
// src/modules/players/types/player-category.types.ts

export type CategoryScope = 'federation' | 'club';
export type CategoryGender = 'male' | 'female' | 'mixed';

export interface PlayerCategory {
  id: string;
  organizationId: string;          // federação dona
  clubId?: string;                 // se for categoria de clube (personalizada)
  scope: CategoryScope;
  name: string;                    // "Iniciado", "Júnior", "Sub-17"
  slug: string;                    // "iniciado", "junior", "sub-17"
  minAge?: number;
  maxAge?: number;
  gender: CategoryGender;
  isCustom: boolean;               // true = criada pelo clube
  isActive: boolean;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
}

// Categorias base da federação (seed data)
export const FEDERATION_DEFAULT_CATEGORIES: Pick<
  PlayerCategory, 'name' | 'slug' | 'minAge' | 'maxAge' | 'displayOrder'
>[] = [
  { name: 'Petiz',    slug: 'petiz',    minAge: 7,  maxAge: 9,  displayOrder: 1 },
  { name: 'Traquina', slug: 'traquina', minAge: 9,  maxAge: 11, displayOrder: 2 },
  { name: 'Benjamim', slug: 'benjamim', minAge: 11, maxAge: 13, displayOrder: 3 },
  { name: 'Infantil', slug: 'infantil', minAge: 13, maxAge: 15, displayOrder: 4 },
  { name: 'Iniciado', slug: 'iniciado', minAge: 15, maxAge: 17, displayOrder: 5 },
  { name: 'Juvenil',  slug: 'juvenil',  minAge: 17, maxAge: 19, displayOrder: 6 },
  { name: 'Júnior',   slug: 'junior',   minAge: 19, maxAge: 23, displayOrder: 7 },
  { name: 'Sénior',   slug: 'senior',   minAge: 16, maxAge: undefined, displayOrder: 8 },
  { name: 'Veterano', slug: 'veterano', minAge: 35, maxAge: undefined, displayOrder: 9 },
];
```

#### Extensão de `Player`
```ts
// Adicionar a src/modules/players/types/index.ts

interface Player {
  // ... campos existentes ...
  categoryId?: string;             // liga ao PlayerCategory
  category?: PlayerCategory;       // populated
  gender: 'male' | 'female';      // género do jogador (já existe ou adicionar)
}
```

#### Extensão de `Club`
```ts
// Adicionar a src/modules/clubs/types/index.ts

interface Club {
  // ... campos existentes ...
  gender: 'male' | 'female' | 'mixed';    // NOVO
  categoryIds: string[];                   // categorias ativas no clube
  customCategories?: PlayerCategory[];     // categorias criadas pelo clube
}
```

#### Extensão de `ClubMember` / inscrição
```ts
// Squad entry — jogador inscrito num clube numa categoria específica

interface ClubSquadEntry {
  id: string;
  clubId: string;
  playerId: string;
  categoryId: string;
  seasonId: string;
  enrolledAt: string;
  status: 'active' | 'suspended' | 'inactive';
  jerseyNumber?: number;
  position?: string;
}
```

#### Extensão de `Competition`
```ts
// Adicionar a src/modules/competitions/types/competition.types.ts

interface Competition {
  // ... campos existentes ...
  categoryId?: string;             // categoria alvo
  category?: PlayerCategory;
  allowedGenders: CategoryGender;  // quem pode participar
}
```

---

## 3. Arquitetura de Ficheiros — O que Criar / Alterar

### 3.1 Ficheiros NOVOS

```
src/
├── modules/
│   ├── players/
│   │   ├── types/
│   │   │   └── player-category.types.ts          ← NOVO
│   │   ├── services/
│   │   │   └── player-category.api.ts            ← NOVO
│   │   ├── hooks/
│   │   │   └── usePlayerCategories.ts            ← NOVO
│   │   ├── schemas/
│   │   │   └── player-category.schema.ts         ← NOVO
│   │   └── components/
│   │       ├── PlayerCategoryBadge.tsx           ← NOVO
│   │       └── PlayerCategorySelect.tsx          ← NOVO
│   │
│   └── clubs/
│       ├── components/
│       │   ├── ClubCategoryManager.tsx           ← NOVO
│       │   ├── ClubSquadByCategory.tsx           ← NOVO
│       │   ├── ClubGenderBadge.tsx               ← NOVO
│       │   └── ClubCategoryEnrollForm.tsx        ← NOVO
│       └── pages/
│           └── ClubCategoriesPage.tsx            ← NOVO
```

### 3.2 Ficheiros ALTERADOS

```
src/
├── modules/
│   ├── players/
│   │   ├── types/index.ts                        ← + categoryId, gender
│   │   ├── schemas/player.schema.ts              ← + categoryId, gender validation
│   │   ├── components/PlayerCard.tsx             ← + CategoryBadge
│   │   ├── pages/PlayerCreatePage.tsx            ← + categoria + género
│   │   ├── pages/PlayerOnboardingFootballPage.tsx← + categoria
│   │   ├── pages/ClubPlayerRegisterPage.tsx      ← + categoria obrigatória
│   │   └── pages/ClubPlayerRegistrationRequestsPage.tsx ← + filtro por categoria
│   │
│   ├── clubs/
│   │   ├── types/index.ts                        ← + gender, categoryIds
│   │   ├── schemas/club.schema.ts                ← + gender validation
│   │   ├── components/ClubCard.tsx               ← + GenderBadge
│   │   ├── components/ClubSettingsForm.tsx       ← + gender + categorias
│   │   ├── components/ClubMembersList.tsx        ← + filtro categoria
│   │   ├── pages/ClubSquadPage.tsx               ← refactor → tabs por categoria
│   │   ├── pages/ClubMembersPage.tsx             ← + filtro categoria/género
│   │   ├── pages/ClubSettingsPage.tsx            ← + ClubCategoriesPage tab
│   │   └── constants/navigation.tsx              ← + rota Categorias
│   │
│   ├── competitions/
│   │   ├── types/competition.types.ts            ← + categoryId, allowedGenders
│   │   ├── schemas/competition.schemas.ts        ← + categoria + género
│   │   ├── components/CompetitionCard.tsx        ← + CategoryBadge + GenderBadge
│   │   └── pages/CompetitionCreatePage.tsx       ← + selector categoria + género
│   │
│   └── organizations/
│       ├── components/OrganizationSettingsForm.tsx← + gestão categorias federação
│       └── pages/OrganizationSettingsPage.tsx    ← + tab Categorias
│
└── constants/
    └── categories.ts                             ← NOVO (seed + helpers)
```

---

## 4. Fases de Implementação

### Fase 1 — Fundações (Tipos, Constantes, API) `~2 dias`

**1.1 Criar `src/constants/categories.ts`**
- Exportar `FEDERATION_DEFAULT_CATEGORIES`
- Helper `getCategoryByAge(age: number): PlayerCategory[]`
- Helper `getCategoryLabel(slug: string): string`

**1.2 Criar `src/modules/players/types/player-category.types.ts`**
- Interfaces `PlayerCategory`, `ClubSquadEntry`
- Tipos `CategoryScope`, `CategoryGender`

**1.3 Criar `src/modules/players/services/player-category.api.ts`**
```ts
export const playerCategoryApi = {
  // Categorias da federação (read-only para clubes)
  getFederationCategories: (orgId: string) => 
    apiClient.get<PlayerCategory[]>(`/organizations/${orgId}/categories`),
  
  // Categorias do clube (inclui custom)
  getClubCategories: (clubId: string) =>
    apiClient.get<PlayerCategory[]>(`/clubs/${clubId}/categories`),
  
  // Gestão de categorias custom (clube)
  createClubCategory: (clubId: string, data: CreateCategoryDto) =>
    apiClient.post<PlayerCategory>(`/clubs/${clubId}/categories`, data),
  
  updateClubCategory: (clubId: string, categoryId: string, data: UpdateCategoryDto) =>
    apiClient.patch<PlayerCategory>(`/clubs/${clubId}/categories/${categoryId}`, data),
  
  deleteClubCategory: (clubId: string, categoryId: string) =>
    apiClient.delete(`/clubs/${clubId}/categories/${categoryId}`),

  // Inscrição de jogador numa categoria
  enrollPlayerInCategory: (clubId: string, data: EnrollPlayerDto) =>
    apiClient.post<ClubSquadEntry>(`/clubs/${clubId}/squad`, data),
  
  updatePlayerCategory: (clubId: string, entryId: string, categoryId: string) =>
    apiClient.patch<ClubSquadEntry>(`/clubs/${clubId}/squad/${entryId}`, { categoryId }),
};
```

**1.4 Criar `src/modules/players/hooks/usePlayerCategories.ts`**
```ts
export function usePlayerCategories(clubId: string) {
  const { data: federationCategories } = useQuery(...)
  const { data: clubCategories } = useQuery(...)
  const createCategory = useMutation(...)
  const updateCategory = useMutation(...)
  const deleteCategory = useMutation(...)
  
  const allCategories = useMemo(() => 
    [...(federationCategories ?? []), ...(clubCategories?.filter(c => c.isCustom) ?? [])]
      .sort((a, b) => a.displayOrder - b.displayOrder),
    [federationCategories, clubCategories]
  )
  
  return { allCategories, federationCategories, clubCategories, createCategory, ... }
}
```

---

### Fase 2 — Género no Clube `~1 dia`

**2.1 Atualizar `src/modules/clubs/schemas/club.schema.ts`**
```ts
export const clubSchema = z.object({
  // ... existente ...
  gender: z.enum(['male', 'female', 'mixed']).default('male'),
})

export const CLUB_GENDER_LABELS = {
  male:   'Masculino',
  female: 'Feminino',
  mixed:  'Misto',
} as const
```

**2.2 Criar `src/modules/clubs/components/ClubGenderBadge.tsx`**
- Badge visual com ícone (♂ / ♀ / ⚥)
- Variante `sm` para cards, `md` para headers

**2.3 Atualizar `ClubCard.tsx`**
- Mostrar `ClubGenderBadge` abaixo do nome do clube

**2.4 Atualizar `ClubSettingsForm.tsx`**
- Adicionar `<Select>` para género (RadioGroup visual preferível)
- Colocar na secção "Informações Gerais"

**2.5 Atualizar `ClubListPage.tsx`**
- Adicionar filtro de género na toolbar
- Filtro: `Todos | Masculino | Feminino | Misto`

---

### Fase 3 — Categorias nos Schemas de Registo `~2 dias`

**3.1 Atualizar `player.schema.ts`**
```ts
export const playerRegistrationSchema = z.object({
  // ... existente ...
  categoryId: z.string().min(1, 'Categoria obrigatória'),
  gender: z.enum(['male', 'female']),
})
```

**3.2 Atualizar `ClubPlayerRegisterPage.tsx`**
- Adicionar `PlayerCategorySelect` (dropdown com categorias do clube)
- Campo obrigatório no formulário de registo
- Mostrar descrição da categoria (faixa etária)

**3.3 Atualizar `PlayerOnboardingFootballPage.tsx`**
- Adicionar selector de categoria no onboarding do jogador
- Hint: "A categoria pode ser ajustada pelo seu clube"

**3.4 Atualizar `PlayerCreatePage.tsx`**
- Campo género (se não existir)
- Campo categoria (opcional — clube define na inscrição)

**3.5 Criar `src/modules/players/components/PlayerCategorySelect.tsx`**
```tsx
// Dropdown com categorias agrupadas: Federação / Clube
// Mostra faixa etária como subtítulo
// Permite criar nova categoria (se admin do clube)
```

---

### Fase 4 — Squad por Categorias `~2 dias`

**4.1 Refactor `ClubSquadPage.tsx`** → tabs por categoria
```
[Todos] [Sénior] [Júnior] [Iniciado] [Sub-17*] [Sub-15*]
                                     (* = personalizadas do clube)
```
- Cada tab mostra a lista/grid de jogadores dessa categoria
- Botão "Gerir Categorias" no header (→ ClubCategoriesPage)
- Badge com contagem por tab: `Sénior (23)`

**4.2 Atualizar `ClubMembersList.tsx`**
- Props: `categoryFilter?: string`
- Mostrar `PlayerCategoryBadge` em cada linha

**4.3 Criar `src/modules/clubs/components/ClubSquadByCategory.tsx`**
- Componente que recebe `categoryId` e renderiza jogadores
- Estado vazio por categoria com CTA para inscrever jogadores

**4.4 Criar `src/modules/players/components/PlayerCategoryBadge.tsx`**
```tsx
// Badge pequeno: "Sénior", "Júnior", etc.
// Cor baseada em displayOrder (esquema de cores consistente)
// Variante com tooltip mostrando faixa etária
```

---

### Fase 5 — Gestão de Categorias pelo Clube `~2 dias`

**5.1 Criar `ClubCategoriesPage.tsx`**
```
┌─────────────────────────────────────────────────┐
│  Categorias do Clube                [+ Nova]    │
├─────────────────────────────────────────────────┤
│  Categorias da Federação (só leitura)           │
│  ▸ Sénior · 16+ anos · 23 jogadores            │
│  ▸ Júnior · 19–23 anos · 15 jogadores          │
│  ▸ Iniciado · 15–17 anos · 8 jogadores         │
├─────────────────────────────────────────────────┤
│  Categorias Personalizadas                      │
│  ▸ Sub-17 · 15–17 anos [Editar] [Eliminar]     │
│  ▸ Sub-15 · 13–15 anos [Editar] [Eliminar]     │
│  [+ Adicionar categoria personalizada]          │
└─────────────────────────────────────────────────┘
```

**5.2 Criar `ClubCategoryManager.tsx`**
- Formulário inline de criação/edição de categoria custom
- Campos: Nome, Idade mínima, Idade máxima, Género alvo
- Validação: nome único no clube, idades coerentes

**5.3 Criar `ClubCategoryEnrollForm.tsx`**
- Modal/sheet para mover jogador entre categorias
- Dropdown com todas as categorias ativas
- Usado no squad e na lista de membros

**5.4 Adicionar rota e navegação**
```ts
// clubs/constants/navigation.tsx
{ label: 'Categorias', path: '/clubs/:id/categories', icon: TagIcon }

// clubs/routes.ts
{ path: 'categories', element: <ClubCategoriesPage /> }
```

---

### Fase 6 — Categorias nas Competições `~1 dia`

**6.1 Atualizar `competition.types.ts`**
- `categoryId?: string`
- `allowedGenders: 'male' | 'female' | 'mixed'`

**6.2 Atualizar `CompetitionCreatePage.tsx`**
- Step de configuração: Categoria + Género
- Selector de categoria (das categorias da federação)
- Apenas clubes com essa categoria podem inscrever-se

**6.3 Atualizar `CompetitionCard.tsx`**
- Mostrar badge da categoria + badge de género
- Ex: `[Sénior] [Masculino]`

**6.4 Validação na inscrição de competição**
- `CompetitionRegistrationPage.tsx`: validar que o clube tem a categoria
- Aviso se o clube não tiver a categoria ativa

---

### Fase 7 — Gestão de Categorias pela Federação `~1 dia`

**7.1 Atualizar `OrganizationSettingsPage.tsx`**
- Nova tab "Categorias" na navegação de settings

**7.2 Atualizar `OrganizationSettingsForm.tsx`**
- Secção de categorias: listar, ativar/desativar, reordenar
- CRUD de categorias da federação (seed + custom)
- Não pode eliminar categorias com jogadores inscritos

---

### Fase 8 — Filtros Globais & Dashboard `~1 dia`

**8.1 `OrganizationPlayersPage.tsx`**
- Filtros: `Categoria` + `Género` + `Clube`

**8.2 `ClubListPage.tsx`** (já mencionado na Fase 2)
- Filtro de género + filtro por categoria disponível

**8.3 `CompetitionListPage.tsx`**
- Filtro por categoria + género

**8.4 Dashboard KPIs**
- `ClubKpisCard.tsx`: adicionar contagem por categoria
- `FederationDashboardPage.tsx`: breakdown por género + categoria

---

## 5. Schemas de Validação (Zod)

```ts
// src/modules/players/schemas/player-category.schema.ts

export const playerCategorySchema = z.object({
  name: z.string().min(2, 'Nome mínimo 2 caracteres').max(50),
  minAge: z.number().int().min(0).max(99).optional(),
  maxAge: z.number().int().min(0).max(99).optional(),
  gender: z.enum(['male', 'female', 'mixed']).default('mixed'),
  isActive: z.boolean().default(true),
  displayOrder: z.number().int().min(0).default(99),
}).refine(
  data => !data.minAge || !data.maxAge || data.minAge < data.maxAge,
  { message: 'Idade mínima deve ser inferior à máxima', path: ['maxAge'] }
)

export const enrollPlayerSchema = z.object({
  playerId: z.string().min(1),
  categoryId: z.string().min(1, 'Categoria obrigatória'),
  seasonId: z.string().min(1),
  jerseyNumber: z.number().int().min(1).max(99).optional(),
  position: z.string().optional(),
})
```

---

## 6. Impacto em Testes Existentes

Ficheiros de teste a atualizar após implementação:

| Ficheiro | O que mudar |
|---|---|
| `useClubs.test.ts` | Adicionar mock de `gender` ao club mock |
| `ClubMembersList.test.tsx` | Adicionar prop `categoryFilter` nos testes |
| `ClubKpisCard.test.tsx` | Adicionar KPI de categorias |
| `ClubCard.test.tsx` | Verificar renderização do `ClubGenderBadge` |
| `useOrganization.test.ts` | Incluir `categories` na org mock |
| `organization.mock.ts` | Adicionar `gender` e `categoryIds` |
| `club.mock.ts` | Adicionar `gender`, `categoryIds` |
| `player.mock.ts` | Adicionar `categoryId`, `gender` |

Novos ficheiros de teste a criar:
```
src/tests/modules/players/hooks/usePlayerCategories.test.ts
src/tests/modules/clubs/components/ClubCategoryManager.test.tsx
src/tests/modules/clubs/pages/ClubCategoriesPage.test.tsx
src/tests/modules/players/services/player-category.api.test.ts
```

---

## 7. Sequência de Implementação Recomendada

```
Semana 1
├── Fase 1 — Fundações (tipos + API + hook)         Dia 1-2
├── Fase 2 — Género no Clube                        Dia 3
└── Fase 3 — Categorias nos schemas de registo      Dia 4-5

Semana 2
├── Fase 4 — Squad por Categorias (UI principal)    Dia 1-2
├── Fase 5 — Gestão de Categorias pelo Clube        Dia 3-4
└── Fase 6 — Categorias nas Competições             Dia 5

Semana 3
├── Fase 7 — Gestão pela Federação                  Dia 1
├── Fase 8 — Filtros Globais & Dashboard            Dia 2
└── Testes & ajustes finais                         Dia 3-5
```

---

## 8. Decisões de Design a Confirmar

Antes de iniciar, confirmar com a equipa:

1. **Género do jogador vs. género do clube**: Um clube "Misto" aceita jogadores de qualquer género? As competições filtram por género do clube ou do jogador?

2. **Categorias cross-género**: Uma categoria "Sénior" pode ser Masculino/Feminino/Misto, ou cada clube cria versões separadas?

3. **Temporada**: As inscrições por categoria são por temporada (ex: 2024/2025)? Já existe um modelo `Season` no backend?

4. **Migração de dados existentes**: Os jogadores e clubes já existentes ficam com `gender = 'male'` e `categoryId = null` por defeito? Plano de migração necessário?

5. **Permissões**: Quem pode criar categorias personalizadas no clube? Apenas `CLUB_ADMIN`? Usar o `roles-permissions.ts` existente.

6. **Categorias na API**: O backend já suporta estas entidades ou é necessário coordenar com o backend team primeiro?
