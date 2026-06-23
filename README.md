# BolaYetu Frontend

Enterprise-grade football ecosystem platform frontend built with React, TypeScript, and Tailwind CSS.

## Project Structure

This project follows a **Feature-Based + Layered Clean Architecture** pattern as documented in `backend/docs/BolaYetu_Frontend.md`.

### Key Directories

- **`src/app/`** - Application bootstrap, providers, and configuration
- **`src/routes/`** - Routing configuration and guards
- **`src/layouts/`** - Layout components for different page contexts
- **`src/modules/`** - Domain-specific feature modules
  - `shared/` - Cross-module shared components, hooks, and utilities
  - `organizations/`, `clubs/`, `players/`, `fans/`, etc. - Domain modules
- **`src/components/`** - Global UI components (design system)
- **`src/services/`** - Global API infrastructure
- **`src/stores/`** - Zustand global state management
- **`src/types/`** - Global TypeScript type definitions
- **`src/utils/`** - Pure utility functions
- **`src/styles/`** - Global styles and theming
- **`src/locales/`** - i18n translation files
- **`src/pwa/`** - Progressive Web App configuration

## Technology Stack

- **UI Framework**: React 18+
- **Language**: TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS + Shadcn UI
- **State Management**: 
  - Server State: TanStack Query (React Query)
  - Client State: Zustand
- **Form Management**: React Hook Form + Zod
- **Routing**: React Router v6
- **i18n**: i18next
- **Testing**: Vitest + React Testing Library
- **Code Quality**: ESLint + Prettier

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm run test

# Lint and format
npm run lint
npm run format
```

## Architecture

### Layered Architecture

1. **Presentation Layer** - Pages, layouts, components, design system
2. **Application Layer** - Hooks, stores, guards, route config
3. **Domain Layer** - Schemas, types, constants, domain services
4. **Infrastructure Layer** - API clients, TanStack Query, PWA, i18n

### Multi-Tenant Architecture

The platform supports multi-tenant deployments via subdomains:
- `faf.bolayetu.com` - FAF tenant
- `girabola.bolayetu.com` - Girabola tenant
- `app.bolayetu.com` - Main platform

### Data Flow

```
Component/Page → Hooks → Store/Query → API Client → Backend
```

## Module Organization

Each feature module follows this structure:

```
module-name/
├── components/     # UI components specific to this module
├── pages/          # Page-level components
├── hooks/          # Custom hooks for data fetching
├── services/       # API service layer
├── types/          # TypeScript types and interfaces
├── schemas/        # Zod schemas for validation
├── constants/      # Module-specific constants
└── index.ts        # Public API exports
```

## Contributing

Please refer to the backend documentation for architectural guidelines and coding standards.
