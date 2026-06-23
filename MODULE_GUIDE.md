# Frontend Project - Module Structure Guide

## Estrutura de Cada Módulo de Funcionalidade

Cada módulo no diretório `src/modules/` segue uma estrutura padrão baseada em **Feature-Based Architecture**:

```
module-name/
├── components/                 # Componentes específicos do módulo
│   ├── ComponentName.tsx
│   └── SubComponent.tsx
├── pages/                      # Páginas do módulo
│   ├── ModuleListPage.tsx
│   ├── ModuleDetailPage.tsx
│   ├── ModuleCreatePage.tsx
│   └── ModuleEditPage.tsx
├── hooks/                      # Custom hooks para o módulo
│   ├── useModuleList.ts
│   ├── useModuleDetail.ts
│   ├── useCreateModule.ts
│   └── useUpdateModule.ts
├── services/                   # Serviços API do módulo
│   └── module.api.ts
├── types/                      # Tipos TypeScript específicos
│   └── module.types.ts
├── schemas/                    # Schemas Zod para validação
│   └── module.schema.ts
├── constants/                  # Constantes do módulo
│   └── module.constants.ts
└── index.ts                    # Arquivo de exportação pública
```

## Módulos Implementados

### 1. **shared** - Código Compartilhado
- Componentes reutilizáveis entre módulos
- Hooks globais do projeto
- Utilitários compartilhados
- Tipos comuns

### 2. **organizations** - Organizações
- Gerenciamento de organizações
- CRUD de organizações
- Perfis e configurações

### 3. **clubs** - Clubes
- Gerenciamento de clubes
- Squad (elenco)
- Staff (comissão técnica)
- Documentos
- Transferências

### 4. **players** - Jogadores
- Gerenciamento de perfis de jogadores
- Carreira profissional
- Vídeos e documentos
- Estatísticas
- Conquistas

### 5. **fans** - Fãs
- Perfil de fãs
- Clubes favoritos
- Jogadores favoritos
- Feed de atividades

### 6. **competitions** - Competições
- Gerenciamento de competições
- Temporadas
- Fases de torneios
- Grupos
- Rodadas
- Tabelas de classificação

### 7. **matches** - Partidas
- Gerenciamento de partidas
- Placar e resultado
- Escalação de times
- Eventos (gols, cartões, etc.)
- Estatísticas
- Timeline

### 8. **rankings** - Rankings
- Tabelas de classificação
- Histórico de rankings
- Filtros por competição e fase

### 9. **news** - Notícias
- Gerenciamento de notícias/artigos
- Notícias em destaque
- Editor de conteúdo
- Compartilhamento social

### 10. **stadiums** - Estádios
- Cadastro de estádios
- Localização (mapa)
- Capacidade
- Informações gerais

### 11. **transfers** - Transferências
- Mercado de transferências
- Timeline de transferências
- Valores de transferência
- Status de transfers

### 12. **subscriptions** - Assinaturas
- Tabelas de preços
- Planos de assinatura
- Checkout
- Histórico de cobrança
- Gerenciamento de assinatura
- Comparação de planos

### 13. **onboarding** - Integração (Onboarding)
- Fluxo de onboarding para novos usuários
- Seleção de papel (role)
- Configuração de organização/clube
- Configuração de perfil de jogador
- Preferências
- Conclusão

### 14. **notifications** - Notificações
- Centro de notificações
- Preferências de notificações
- Notificações em tempo real
- Toast de notificações
- WebSockets/SSE para updates

### 15. **settings** - Configurações
- Configurações de perfil
- Segurança
- Preferências de notificações
- Aparência
- Idioma
- Zona perigosa (delete account)

### 16. **dashboards** - Dashboards
- Dashboard de organização
- Dashboard de clube
- Dashboard de jogador
- Dashboard de fã
- Dashboard de administrador
- Widgets reutilizáveis

## Padrões de Implementação

### Estrutura de Componentes

```typescript
// ComponentName.tsx
import { FC } from 'react';
import { useComponent } from '../hooks/useComponent';

interface ComponentNameProps {
  id: string;
  // props
}

export const ComponentName: FC<ComponentNameProps> = ({ id }) => {
  const { data, isLoading } = useComponent(id);

  if (isLoading) return <LoadingState />;
  if (!data) return <EmptyState />;

  return <div>{/* render */}</div>;
};
```

### Estrutura de Hooks

```typescript
// useModule.ts
import { useQuery } from '@tanstack/react-query';
import { moduleApi } from '../services/module.api';

export const useModule = (id: string) => {
  return useQuery({
    queryKey: ['module', id],
    queryFn: () => moduleApi.getModule(id),
  });
};
```

### Estrutura de Serviços API

```typescript
// module.api.ts
import { apiClient } from '@/services/api-client';
import { ModuleType } from '../types/module.types';
import { endpoints } from '@/services/endpoints';

export const moduleApi = {
  getModules: () => apiClient.get<ModuleType[]>(endpoints.modules),
  getModule: (id: string) => apiClient.get<ModuleType>(`${endpoints.modules}/${id}`),
  createModule: (data: ModuleType) => apiClient.post<ModuleType>(endpoints.modules, data),
  updateModule: (id: string, data: Partial<ModuleType>) =>
    apiClient.put<ModuleType>(`${endpoints.modules}/${id}`, data),
  deleteModule: (id: string) => apiClient.delete(`${endpoints.modules}/${id}`),
};
```

### Estrutura de Tipos

```typescript
// module.types.ts
export interface ModuleType {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}
```

### Estrutura de Schemas Zod

```typescript
// module.schema.ts
import { z } from 'zod';

export const moduleSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  description: z.string().max(1000).optional(),
});

export type ModuleFormData = z.infer<typeof moduleSchema>;
```

## Fluxo de Dados em um Módulo

```
User Interaction (Page/Component)
           ↓
    useModuleHook (Hook)
           ↓
TanStack Query / Zustand (State Management)
           ↓
    moduleApi.* (Service)
           ↓
    Backend API (Django REST)
```

## Exportação Pública

Cada módulo deve ter um `index.ts` que exporte sua API pública:

```typescript
// module/index.ts
export * from './components';
export * from './hooks';
export * from './pages';
export * from './services';
export * from './types';
export * from './schemas';
export * from './constants';
```

## Convenções de Nomenclatura

- **Componentes**: `PascalCase` (ex: `ComponentName.tsx`)
- **Hooks**: `camelCase` com prefixo `use` (ex: `useModuleData.ts`)
- **Serviços**: `camelCase` com sufixo `.api` (ex: `module.api.ts`)
- **Tipos**: `PascalCase` com sufixo `Type` (ex: `ModuleType`)
- **Schemas**: `camelCase` com sufixo `Schema` (ex: `moduleSchema`)
- **Constantes**: `SCREAMING_SNAKE_CASE` (ex: `MODULE_STATUS`)

## Next Steps

1. Implementar configurações Vite, TypeScript e Tailwind
2. Instalar dependências do projeto
3. Configurar provedores de contexto
4. Implementar sistema de roteamento
5. Criar componentes base (UI)
6. Implementar módulos começando por Auth e Shared
7. Integrar com o Backend Django
8. Implementar testes

