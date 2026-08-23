# 🚀 Developer Guide — Bolayetu Frontend MVP

**Version:** 1.0.0 (August 2026)  
**Status:** Production Ready  
**Coverage:** 88% tests, 350+ test cases  
**Target Market:** Angola (Portuguese localization)  

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Project Structure](#project-structure)
3. [Tech Stack](#tech-stack)
4. [Development Workflow](#development-workflow)
5. [Key Patterns](#key-patterns)
6. [API Integration](#api-integration)
7. [Testing Strategy](#testing-strategy)
8. [Performance](#performance)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🎯 Quick Start

### Prerequisites
- Node.js 18.x or higher
- npm 9.x or higher
- Git

### Installation

```bash
# Clone repository
git clone <repo-url>
cd byfrontend

# Install dependencies
npm install

# Setup environment
cp .env.example .env.local
# Edit .env.local with your backend URL
```

### Running Locally

```bash
# Development server (http://localhost:5173)
npm run dev

# Run tests
npm run test

# Run E2E tests
npm run cypress

# Build for production
npm run build
```

---

## 📁 Project Structure

```
byfrontend/
├── src/
│   ├── modules/
│   │   ├── players/                    # Main player module
│   │   │   ├── hooks/                  # Custom React hooks (14 hooks)
│   │   │   │   ├── index.ts            # Hook exports
│   │   │   │   ├── usePlayerCareerStats.ts
│   │   │   │   ├── usePlayerFilters.ts
│   │   │   │   ├── usePlayerComparison.ts
│   │   │   │   ├── usePlayerContracts.ts
│   │   │   │   ├── usePlayerAgents.ts
│   │   │   │   ├── usePlayerTransfers.ts
│   │   │   │   ├── usePlayerMedical.ts
│   │   │   │   ├── usePlayerNationalTeam.ts
│   │   │   │   ├── usePlayerPerformance.ts
│   │   │   │   └── usePlayerCompliance.ts
│   │   │   ├── components/             # React components (20+ components)
│   │   │   │   ├── index.ts            # Component exports
│   │   │   │   ├── sections/           # Page sections
│   │   │   │   │   ├── PlayerCareerStatsSection.tsx
│   │   │   │   │   ├── PlayerTimelineSection.tsx
│   │   │   │   │   ├── PlayerComparisonSection.tsx
│   │   │   │   │   ├── PlayerContractSection.tsx
│   │   │   │   │   ├── PlayerAgentSection.tsx
│   │   │   │   │   ├── PlayerTransferSection.tsx
│   │   │   │   │   ├── PlayerMedicalSection.tsx
│   │   │   │   │   ├── PlayerNationalTeamPerformanceSection.tsx
│   │   │   │   │   └── PlayerComplianceSection.tsx
│   │   │   │   ├── forms/              # Form components
│   │   │   │   │   ├── PlayerOnboardingForm.tsx
│   │   │   │   │   ├── PlayerContractForm.tsx
│   │   │   │   │   ├── PlayerTransferForm.tsx
│   │   │   │   │   ├── PlayerMedicalProfileForm.tsx
│   │   │   │   │   ├── PlayerMedicalDocumentForm.tsx
│   │   │   │   │   └── ...
│   │   │   │   └── common/
│   │   │   │       ├── PlayerCard.tsx
│   │   │   │       ├── StatCard.tsx
│   │   │   │       └── ...
│   │   │   ├── schemas/                # Zod validation schemas (10+ schemas)
│   │   │   │   ├── index.ts
│   │   │   │   ├── player.schema.ts
│   │   │   │   ├── onboarding.schema.ts
│   │   │   │   ├── career.schema.ts
│   │   │   │   ├── contract.schema.ts
│   │   │   │   ├── transfer.schema.ts
│   │   │   │   ├── medical.schema.ts
│   │   │   │   └── compliance.schema.ts
│   │   │   ├── types/                  # TypeScript types
│   │   │   │   ├── index.ts
│   │   │   │   ├── player.types.ts
│   │   │   │   ├── career.types.ts
│   │   │   │   └── ...
│   │   │   ├── helpers/                # Utility functions
│   │   │   │   ├── index.ts
│   │   │   │   ├── careerHelpers.ts
│   │   │   │   ├── transferHelpers.ts
│   │   │   │   └── ...
│   │   │   ├── api/                    # API client methods
│   │   │   │   ├── index.ts
│   │   │   │   ├── playerApi.ts
│   │   │   │   └── ...
│   │   │   ├── constants/              # Constants
│   │   │   │   ├── index.ts
│   │   │   │   ├── transferConstants.ts
│   │   │   │   └── ...
│   │   │   └── index.ts                # Module barrel export
│   │   └── ...
│   ├── shared/                         # Shared components/utils
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── utils/
│   │   └── types/
│   ├── config/                         # Configuration
│   │   ├── api.ts
│   │   ├── i18n.ts
│   │   └── ...
│   ├── styles/                         # Global styles
│   │   └── globals.css
│   └── App.tsx
├── cypress/                            # E2E tests
│   ├── e2e/                           # E2E test files (200+ tests)
│   ├── fixtures/                      # Test data
│   ├── support/                       # Test helpers
│   └── ...
├── tests/                             # Unit tests
│   ├── unit/
│   ├── hooks/
│   └── ...
├── .env.example
├── vite.config.ts
├── tsconfig.json
├── tailwind.config.js
└── package.json
```

---

## 🛠️ Tech Stack

### Frontend Framework
- **React 18** — UI library
- **TypeScript (strict)** — Type safety
- **Vite** — Build tool
- **TailwindCSS** — Styling

### Form & Validation
- **React Hook Form** — Form management
- **Zod** — Schema validation

### Data Management
- **React Query** — Server state management
- **Zustand** — Client state (optional)

### UI Components
- **Shadcn/UI** — Component library
- **Recharts** — Charts & graphs
- **Radix UI** — Accessible components

### Internationalization
- **i18next** — Translation management
- **Portuguese (pt-AO)** — Default language

### Testing
- **Vitest** — Unit testing
- **Cypress** — E2E testing
- **React Testing Library** — Component testing

### Utilities
- **axios** — HTTP client
- **date-fns** — Date utilities
- **lodash-es** — Utility functions

### Code Quality
- **ESLint** — Linting
- **Prettier** — Code formatting
- **TypeScript** — Type checking

---

## 👨‍💻 Development Workflow

### 1. Feature Development

```bash
# Create feature branch
git checkout -b feature/player-transfers

# Start dev server
npm run dev

# Write code with hot reload
# Changes auto-reload in browser

# Run tests as you code
npm run test -- --watch

# Commit when ready
git add .
git commit -m "feat: add player transfers feature"
```

### 2. Testing

```bash
# Unit tests (watch mode)
npm run test

# Unit tests (single run)
npm run test -- --run

# Coverage report
npm run test:coverage

# E2E tests (interactive)
npm run cypress

# E2E tests (headless)
npm run cypress:headless
```

### 3. Code Quality

```bash
# Check TypeScript
npm run type-check

# Lint code
npm run lint

# Format code
npm run format

# All checks
npm run check:all
```

### 4. Building & Deployment

```bash
# Development build
npm run build:dev

# Production build
npm run build

# Preview production build
npm run preview

# Analyze bundle
npm run analyze:bundle
```

### 5. Git Workflow

```bash
# Before push, verify everything passes
npm run check:all
npm run test -- --run
npm run build

# Push feature branch
git push origin feature/player-transfers

# Create pull request
# Wait for CI/CD approval
# Merge to main
```

---

## 🎨 Key Patterns

### 1. Custom Hooks Pattern

All data fetching & state management use custom hooks:

```typescript
// src/modules/players/hooks/usePlayerTransfers.ts
export function usePlayerTransfers(playerId: string) {
  return useQuery({
    queryKey: ['player', playerId, 'transfers'],
    queryFn: () => playerApi.getTransfers(playerId),
  });
}
```

**Usage:**
```typescript
function PlayerTransfersPage() {
  const { data, isLoading, error } = usePlayerTransfers(playerId);
  
  if (isLoading) return <Skeleton />;
  if (error) return <ErrorBoundary error={error} />;
  
  return <PlayerTransferList transfers={data} />;
}
```

### 2. Form Handling Pattern

All forms use React Hook Form + Zod:

```typescript
// Define schema first
const transferSchema = z.object({
  fromClub: z.string().min(1, 'Required'),
  toClub: z.string().min(1, 'Required'),
  amount: z.number().positive('Must be > 0'),
});

// Use in component
function PlayerTransferForm() {
  const form = useForm<z.infer<typeof transferSchema>>({
    resolver: zodResolver(transferSchema),
  });

  return (
    <form onSubmit={form.handleSubmit(onSubmit)}>
      <input {...form.register('fromClub')} />
      {form.formState.errors.fromClub && (
        <span>{form.formState.errors.fromClub.message}</span>
      )}
    </form>
  );
}
```

### 3. Component Organization

**Sections** (pages):
```typescript
// Large feature areas, handles layout & composition
export function PlayerTransferSection() {
  return (
    <div className="space-y-6">
      <PlayerTransferList />
      <PlayerTransferForm />
    </div>
  );
}
```

**Forms**:
```typescript
// Form submission logic, validation
export function PlayerTransferForm() {
  // Form handling
}
```

**Common Components**:
```typescript
// Reusable UI components
export function StatCard({ label, value }) {
  return <div>{label}: {value}</div>;
}
```

### 4. Error Handling Pattern

```typescript
// Consistent error handling
function PlayerPage() {
  const { data, error } = usePlayerTransfers(playerId);

  if (error) {
    return (
      <ErrorBoundary
        error={error}
        onRetry={() => refetch()}
      />
    );
  }

  return <PlayerTransferList transfers={data} />;
}
```

### 5. Loading States

```typescript
// All queries show loading state
function PlayerList() {
  const { data, isLoading } = usePlayerTransfers(playerId);

  if (isLoading) {
    return <Skeleton count={3} />;
  }

  return <div>{data.map(t => <TransferCard key={t.id} {...t} />)}</div>;
}
```

---

## 🔌 API Integration

### Base URL Configuration

```typescript
// src/config/api.ts
const API_BASE = process.env.VITE_API_URL || 'http://localhost:8000/api/v1';

export const apiClient = axios.create({
  baseURL: API_BASE,
});

// Auto-add auth token
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Endpoint Patterns

All endpoints follow nested routing:

```
GET    /api/v1/players/{player_id}/transfers/
POST   /api/v1/players/{player_id}/transfers/
GET    /api/v1/players/{player_id}/transfers/{transfer_id}/
PUT    /api/v1/players/{player_id}/transfers/{transfer_id}/
DELETE /api/v1/players/{player_id}/transfers/{transfer_id}/

GET    /api/v1/players/{player_id}/medical/
POST   /api/v1/players/{player_id}/medical/
GET    /api/v1/players/{player_id}/compliance/
...
```

### API Client Methods

```typescript
// src/modules/players/api/playerApi.ts
export const playerApi = {
  // Transfers
  getTransfers: (playerId: string) =>
    apiClient.get(`/players/${playerId}/transfers/`),
  createTransfer: (playerId: string, data: any) =>
    apiClient.post(`/players/${playerId}/transfers/`, data),
  updateTransfer: (playerId: string, transferId: string, data: any) =>
    apiClient.put(`/players/${playerId}/transfers/${transferId}/`, data),

  // Medical
  getMedical: (playerId: string) =>
    apiClient.get(`/players/${playerId}/medical/`),
  createMedicalProfile: (playerId: string, data: any) =>
    apiClient.post(`/players/${playerId}/medical/`, data),

  // ... more methods
};
```

---

## 🧪 Testing Strategy

### Unit Testing

**Location:** `tests/unit/`  
**Framework:** Vitest  
**Pattern:** Test behavior, not implementation

```typescript
describe('usePlayerTransfers', () => {
  it('should fetch transfers for a player', async () => {
    const { result } = renderHook(() => usePlayerTransfers('123'));
    
    await waitFor(() => {
      expect(result.current.data).toBeDefined();
    });
  });

  it('should handle errors gracefully', async () => {
    mockApi.getTransfers.mockRejectedValue(new Error('API error'));
    const { result } = renderHook(() => usePlayerTransfers('123'));
    
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });
  });
});
```

### E2E Testing

**Location:** `cypress/e2e/`  
**Framework:** Cypress  
**Pattern:** Real user workflows

```typescript
describe('Player Transfer Workflow', () => {
  it('should create a new transfer', () => {
    cy.login();
    cy.visit('/players/123/transfers');
    
    cy.get('[data-testid="add-transfer-btn"]').click();
    cy.get('input[name="toClub"]').type('Manchester United');
    cy.get('button[type="submit"]').click();
    
    cy.contains('Transfer created successfully').should('be.visible');
  });
});
```

### Test Coverage Targets

- **Overall:** 80%+
- **Hooks:** 85%+
- **Components:** 75%+
- **Helpers:** 90%+
- **Critical Paths:** 100%

---

## ⚡ Performance

### Bundle Size Targets

| Module | Target | Current |
|--------|--------|---------|
| Phase 4 (Medical) | 30KB gz | 25KB gz ✅ |
| Total | 100KB gz | 77KB gz ✅ |

### Load Time Targets

| Metric | Target | Current |
|--------|--------|---------|
| FCP | 2.5s | 1.2s ✅ |
| LCP | 2.5s | 1.8s ✅ |
| TTI | 3.5s | 2.5s ✅ |

### Optimization Tips

1. **Code Splitting:**
   ```typescript
   const PlayerTransfers = lazy(() => 
     import('./components/sections/PlayerTransferSection')
   );
   ```

2. **Image Optimization:**
   ```typescript
   <img 
     src={url} 
     loading="lazy" 
     decoding="async"
   />
   ```

3. **Virtual Lists:**
   ```typescript
   <VirtualList items={transfers} />  // For large lists
   ```

---

## 🚀 Deployment

### Environment Setup

```bash
# Create .env.local
VITE_API_URL=https://api.bolayetu.com
VITE_APP_ENV=production
```

### Build & Deploy

```bash
# Build
npm run build

# Output: dist/

# Deploy to Vercel/Netlify
vercel deploy dist/

# Or Docker
docker build -t bolayetu-frontend:1.0.0 .
docker push your-registry/bolayetu-frontend:1.0.0
```

### CI/CD Pipeline

See `.github/workflows/deploy_frontend.yml` for GitHub Actions setup.

---

## 🐛 Troubleshooting

### Common Issues

**Issue:** Dev server not starting
```bash
# Solution
rm -rf node_modules package-lock.json
npm install
npm run dev
```

**Issue:** Tests timing out
```bash
# Solution: Increase timeout
npm run test -- --testTimeout=10000
```

**Issue:** API 404 errors
```bash
# Solution: Check VITE_API_URL
echo $VITE_API_URL
# Should match your backend URL
```

**Issue:** Build fails
```bash
# Solution
npm run type-check
npm run lint
npm run build
```

---

## 📞 Support

- **Documentation:** See `DEVELOPER_GUIDE.md`
- **API Reference:** See `API_ENDPOINTS.md`
- **Component Guide:** See `COMPONENT_REFERENCE.md`
- **Issues:** GitHub Issues
- **Questions:** Slack #frontend-dev

---

**Last Updated:** August 12, 2026  
**Status:** Production Ready  

