# Frontend Setup - Próximos Passos

## ✅ Concluído

- [x] Estrutura de diretórios criada
- [x] Módulos de funcionalidades configurados (16 módulos)
- [x] Arquivos de índice criados para cada módulo
- [x] Documentação básica gerada

## 📋 Próximos Passos

### Fase 1: Setup Inicial do Projeto

#### 1.1 Criar `package.json` e instalar dependências
```bash
cd D:\ndeascloud\boayetu\frontend

# Inicializar package.json
npm init -y

# Instalar dependências principais
npm install react react-dom
npm install -D typescript @types/react @types/react-dom
npm install -D vite @vitejs/plugin-react
npm install -D tailwindcss postcss autoprefixer
npm install -D eslint prettier
npm install -D @typescript-eslint/eslint-plugin @typescript-eslint/parser
```

#### 1.2 Instalar bibliotecas de estado e data fetching
```bash
npm install zustand @tanstack/react-query @tanstack/query-devtools
npm install react-router-dom
npm install axios
```

#### 1.3 Instalar bibliotecas de form e validação
```bash
npm install react-hook-form zod @hookform/resolvers
```

#### 1.4 Instalar UI e styling
```bash
npm install -D @shadcn/ui
npm install clsx tailwind-merge
npm install framer-motion
npm install cmdk
```

#### 1.5 Instalar i18n
```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

#### 1.6 Instalar utilitários
```bash
npm install date-fns
npm install sonner
npm install zustand
npm install pdfjs-dist
```

### Fase 2: Configuração de Ferramentas

#### 2.1 Configurar TypeScript
- [ ] Revisar e ajustar `tsconfig.json`
- [ ] Revisar e ajustar `tsconfig.node.json`
- [ ] Configurar paths aliases (`@/`)

#### 2.2 Configurar Vite
- [ ] Revisar `vite.config.ts`
- [ ] Configurar @alias para importações
- [ ] Configurar environment variables

#### 2.3 Configurar Tailwind CSS
- [ ] Criar `tailwind.config.ts`
- [ ] Criar `postcss.config.js`
- [ ] Configurar temas (dark/light mode)

#### 2.4 Configurar ESLint e Prettier
- [ ] Criar `.eslintrc.cjs`
- [ ] Criar `.prettierrc`
- [ ] Adicionar regras customizadas

#### 2.5 Configurar Shadcn UI
- [ ] Executar `npx shadcn-ui@latest init`
- [ ] Configurar `components.json`

### Fase 3: Configuração de Arquivos Globais

#### 3.1 Criar arquivos de entrada
- [ ] `src/main.tsx` - Entry point da aplicação
- [ ] `src/App.tsx` - Root component com providers
- [ ] `src/index.css` - Estilos globais

#### 3.2 Configurar Provedores (App Providers)
- [ ] `src/app/providers/AppProvider.tsx` - Provider principal
- [ ] `src/app/providers/AuthProvider.tsx` - Contexto de auth
- [ ] `src/app/providers/TenantProvider.tsx` - Contexto multi-tenant
- [ ] `src/app/providers/ThemeProvider.tsx` - Tema (dark/light)
- [ ] `src/app/providers/QueryProvider.tsx` - TanStack Query
- [ ] `src/app/providers/I18nProvider.tsx` - i18n
- [ ] `src/app/providers/ToastProvider.tsx` - Notificações

#### 3.3 Configurar Constantes Globais
- [ ] `src/constants/routes.constants.ts`
- [ ] `src/constants/roles.constants.ts`
- [ ] `src/constants/permissions.constants.ts`
- [ ] `src/constants/status.constants.ts`
- [ ] `src/constants/countries.constants.ts`

#### 3.4 Configurar Tipos Globais
- [ ] `src/types/api.types.ts`
- [ ] `src/types/auth.types.ts`
- [ ] `src/types/tenant.types.ts`
- [ ] `src/types/user.types.ts`
- [ ] `src/types/common.types.ts`

#### 3.5 Configurar Serviço API
- [ ] `src/services/api-client.ts` - Instância Axios
- [ ] `src/services/interceptors/auth.interceptor.ts`
- [ ] `src/services/interceptors/refresh.interceptor.ts`
- [ ] `src/services/interceptors/tenant.interceptor.ts`
- [ ] `src/services/interceptors/error.interceptor.ts`
- [ ] `src/services/endpoints/index.ts`

#### 3.6 Criar Stores Globais
- [ ] `src/stores/auth.store.ts` - Auth state
- [ ] `src/stores/tenant.store.ts` - Tenant state
- [ ] `src/stores/ui.store.ts` - UI state
- [ ] `src/stores/theme.store.ts` - Theme state

#### 3.7 Criar Hooks Globais
- [ ] `src/hooks/useAuth.ts`
- [ ] `src/hooks/useTenant.ts`
- [ ] `src/hooks/useTheme.ts`
- [ ] `src/hooks/useMediaQuery.ts`

### Fase 4: Componentes Base (Design System)

#### 4.1 Importar Shadcn UI Components
```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add input
npx shadcn-ui@latest add card
# ... etc
```

#### 4.2 Criar Componentes Compostos
- [ ] `src/components/composite/PageHeader.tsx`
- [ ] `src/components/composite/PageContainer.tsx`
- [ ] `src/components/composite/ActionBar.tsx`

### Fase 5: Módulo Shared

#### 5.1 Componentes Compartilhados
- [ ] Media components (ImageUpload, VideoPlayer, etc)
- [ ] Data display components (DataTable, StatCard, etc)
- [ ] Filter components (FilterBar, SearchInput, etc)
- [ ] Feedback components (EmptyState, ErrorState, LoadingState, etc)
- [ ] Navigation components (BackButton, Breadcrumb, etc)
- [ ] Overlay components (ConfirmDialog, ActionDrawer, etc)

#### 5.2 Hooks Compartilhados
- [ ] `useDebounce.ts`
- [ ] `useThrottle.ts`
- [ ] `useInfiniteScroll.ts`
- [ ] `useLocalStorage.ts`
- [ ] `useMediaQuery.ts`
- [ ] `useFileUpload.ts`

#### 5.3 Utilitários Compartilhados
- [ ] `utils/format.ts` - Formatadores
- [ ] `utils/validation.ts` - Validações
- [ ] `utils/storage.ts` - Armazenamento
- [ ] `utils/date.ts` - Datas
- [ ] `utils/string.ts` - Strings
- [ ] `utils/file.ts` - Arquivos

### Fase 6: Layouts

- [ ] `src/layouts/root/RootLayout.tsx`
- [ ] `src/layouts/public/PublicLayout.tsx`
- [ ] `src/layouts/auth/AuthLayout.tsx`
- [ ] `src/layouts/dashboard/DashboardLayout.tsx`
- [ ] `src/layouts/minimal/MinimalLayout.tsx`
- [ ] `src/layouts/error/ErrorLayout.tsx`

### Fase 7: Sistema de Roteamento

- [ ] Configurar React Router
- [ ] Criar `src/routes/index.tsx` com lazy loading
- [ ] Implementar guards (AuthGuard, RoleGuard, etc)
- [ ] Configurar rotas por módulo
- [ ] Implementar data loaders

### Fase 8: Internacionalização

- [ ] Criar arquivos de tradução em `src/locales/`
- [ ] Configurar i18n no App

### Fase 9: PWA

- [ ] Configurar Service Worker
- [ ] Implementar estratégias de cache
- [ ] Configurar `public/manifest.json`

### Fase 10: Testes

- [ ] Configurar Vitest
- [ ] Criar testes unitários para utilitários
- [ ] Criar testes de componentes
- [ ] Criar testes de hooks

## 📁 Estrutura de Arquivos de Configuração

```
/
├── .env                          # Variáveis de ambiente
├── .env.development
├── .env.staging
├── .env.production
├── .eslintrc.cjs                 # ESLint
├── .prettierrc                   # Prettier
├── vite.config.ts                # Vite
├── vitest.config.ts              # Vitest
├── tsconfig.json                 # TypeScript
├── tsconfig.node.json
├── tailwind.config.ts            # Tailwind CSS
├── postcss.config.js             # PostCSS
├── components.json               # Shadcn UI
├── package.json                  # Dependências
└── README.md
```

## 🔗 Integração com Backend

1. **Definir endpoints API** - Coordenar com backend Django
2. **Configurar interceptadores** - Auth headers, tenant resolution
3. **Implementar error handling** - Padronizar respostas de erro
4. **Implementar retry logic** - Para falhas de rede
5. **Configurar token refresh** - JWT refresh automático

## 📚 Referências

- Documentação: `backend/docs/BolaYetu_Frontend.md`
- Module Guide: `frontend/MODULE_GUIDE.md`
- Project Structure: `frontend/STRUCTURE.md`

## ⚡ Comandos Úteis

```bash
# Desenvolvimento
npm run dev              # Iniciar servidor de desenvolvimento

# Build
npm run build            # Build para produção
npm run preview          # Preview build local

# Quality
npm run lint             # ESLint
npm run format           # Prettier
npm run type-check       # TypeScript check

# Testes
npm run test             # Rodar testes
npm run test:ui          # Teste UI
npm run test:coverage    # Coverage

# PWA
npm run build:pwa        # Build com PWA
```

---

**Status**: 🚀 Pronto para começar a implementação!
