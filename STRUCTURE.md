bolayetu-frontend/
│
├── public/                         # Arquivos estáticos
│   ├── favicon.ico
│   ├── manifest.json
│   ├── robots.txt
│   ├── sitemap.xml
│   └── icons/                      # Ícones PWA
│
├── src/                            # Código-fonte principal
│   ├── app/                        # Bootstrap e configuração da aplicação
│   │   ├── providers/              # Provedores de contexto
│   │   └── config/                 # Configurações globais
│   │
│   ├── routes/                     # Configuração de roteamento
│   │   ├── guards/                 # Guards de autenticação e permissões
│   │   └── loaders/                # Data loaders
│   │
│   ├── layouts/                    # Layouts de página
│   │   ├── root/
│   │   ├── public/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── minimal/
│   │   └── error/
│   │
│   ├── modules/                    # Módulos baseados em funcionalidades (Feature-Based)
│   │   ├── shared/                 # Código compartilhado entre módulos
│   │   │   ├── components/         # Componentes reutilizáveis
│   │   │   ├── hooks/              # Custom hooks globais
│   │   │   ├── utils/              # Funções utilitárias
│   │   │   └── types/              # Tipos compartilhados
│   │   │
│   │   ├── organizations/          # Módulo de Organizações
│   │   ├── clubs/                  # Módulo de Clubes
│   │   ├── players/                # Módulo de Jogadores
│   │   ├── fans/                   # Módulo de Fãs
│   │   ├── competitions/           # Módulo de Competições
│   │   ├── matches/                # Módulo de Partidas
│   │   ├── rankings/               # Módulo de Rankings
│   │   ├── news/                   # Módulo de Notícias
│   │   ├── stadiums/               # Módulo de Estádios
│   │   ├── transfers/              # Módulo de Transferências
│   │   ├── subscriptions/          # Módulo de Assinaturas
│   │   ├── onboarding/             # Módulo de Onboarding
│   │   ├── notifications/          # Módulo de Notificações
│   │   ├── settings/               # Módulo de Configurações
│   │   └── dashboards/             # Módulo de Dashboards
│   │
│   ├── components/                 # Componentes globais (Design System)
│   │   ├── ui/                     # Componentes Shadcn UI
│   │   └── composite/              # Componentes compostos
│   │
│   ├── services/                   # Infraestrutura global de API
│   │   ├── api-client.ts           # Instância Axios
│   │   ├── interceptors/           # Interceptadores
│   │   ├── endpoints/              # Constantes de endpoints
│   │   └── transformers/           # Transformadores de dados
│   │
│   ├── hooks/                      # Hooks globais (não específicos de módulo)
│   │   ├── useAuth.ts
│   │   ├── useTenant.ts
│   │   ├── useTheme.ts
│   │   └── ...
│   │
│   ├── stores/                     # Armazenamento global Zustand
│   │   ├── auth.store.ts
│   │   ├── tenant.store.ts
│   │   ├── ui.store.ts
│   │   ├── theme.store.ts
│   │   └── index.ts
│   │
│   ├── types/                      # Definições de tipos globais
│   │   ├── api.types.ts
│   │   ├── auth.types.ts
│   │   ├── tenant.types.ts
│   │   ├── user.types.ts
│   │   ├── common.types.ts
│   │   ├── env.d.ts
│   │   └── index.ts
│   │
│   ├── lib/                        # Configurações de bibliotecas de terceiros
│   │   ├── query-client.ts         # TanStack Query
│   │   ├── i18n.ts                 # i18n
│   │   ├── pdf.ts                  # PDF.js
│   │   ├── motion.ts               # Framer Motion
│   │   └── utils.ts                # Utilitários (cn())
│   │
│   ├── utils/                      # Funções utilitárias puras
│   │   ├── format.ts               # Formatadores
│   │   ├── validation.ts           # Validações
│   │   ├── storage.ts              # Armazenamento
│   │   ├── date.ts                 # Manipulação de datas
│   │   ├── string.ts               # Manipulação de strings
│   │   ├── number.ts               # Manipulação de números
│   │   ├── file.ts                 # Utilitários de arquivo
│   │   ├── url.ts                  # Utilitários de URL
│   │   └── index.ts
│   │
│   ├── assets/                     # Ativos estáticos
│   │   ├── images/
│   │   │   ├── logo.svg
│   │   │   ├── illustrations/
│   │   │   └── patterns/
│   │   ├── fonts/
│   │   └── icons/                  # Ícones customizados
│   │
│   ├── styles/                     # Estilos globais
│   │   ├── globals.css             # Estilos base Tailwind
│   │   ├── themes.css              # Variáveis de tema
│   │   ├── animations.css          # Animações globais
│   │   └── overrides.css           # Sobrescrita de terceiros
│   │
│   ├── constants/                  # Constantes globais
│   │   ├── routes.constants.ts     # Caminhos de rota
│   │   ├── roles.constants.ts      # Papéis de usuário
│   │   ├── permissions.constants.ts # Permissões
│   │   ├── status.constants.ts     # Códigos de status
│   │   ├── countries.constants.ts  # Lista de países
│   │   └── index.ts
│   │
│   ├── locales/                    # Arquivos de tradução i18n
│   │   ├── pt/                     # Português
│   │   ├── en/                     # Inglês
│   │   └── fr/                     # Francês
│   │
│   ├── pwa/                        # Código específico de PWA
│   │   ├── sw.ts                   # Service Worker
│   │   ├── sw-events.ts            # Manipuladores de eventos
│   │   ├── cache-strategies.ts     # Estratégias de cache
│   │   ├── push-manager.ts         # Gerenciador de notificações push
│   │   └── offline-fallback.tsx    # Componente offline
│   │
│   ├── tests/                      # Testes (espelha estrutura src)
│   │   ├── __mocks__/              # Mocks
│   │   ├── __utils__/              # Utilitários de teste
│   │   └── setup.ts                # Configuração de testes
│   │
│   ├── App.tsx                     # Componente raiz
│   ├── main.tsx                    # Entrada da aplicação
│   ├── vite-env.d.ts               # Tipos Vite
│   └── index.css                   # Estilos de entrada
│
├── .env                            # Variáveis de ambiente
├── .env.development                # Desenvolvimento
├── .env.staging                    # Staging
├── .env.production                 # Produção
├── .eslintrc.cjs                   # Configuração ESLint
├── .prettierrc                     # Configuração Prettier
├── tailwind.config.ts              # Configuração Tailwind
├── tsconfig.json                   # Configuração TypeScript
├── tsconfig.node.json              # TypeScript Node config
├── vite.config.ts                  # Configuração Vite
├── vitest.config.ts                # Configuração Vitest
├── components.json                 # Configuração Shadcn UI
├── postcss.config.js               # Configuração PostCSS
├── package.json                    # Dependências
└── README.md                       # Documentação do projeto
