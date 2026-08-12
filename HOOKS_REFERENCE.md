# 🪝 Custom Hooks Reference Guide

**Version:** 1.0.0 (August 2026)  
**Total Hooks:** 14  
**Status:** Production Ready  

---

## 📋 Table of Contents

1. [Career & Analytics Hooks](#career--analytics-hooks)
2. [Professional Management Hooks](#professional-management-hooks)
3. [Ecosystem Hooks](#ecosystem-hooks)
4. [Common Patterns](#common-patterns)

---

## 📊 Career & Analytics Hooks

### usePlayerCareerStats

Fetch and manage player career statistics.

**Location:** `src/modules/players/hooks/usePlayerCareerStats.ts`

**Signature:**
```typescript
function usePlayerCareerStats(playerId: string, options?: {
  season?: string;
  includeComparison?: boolean;
})
```

**Returns:**
```typescript
{
  data: {
    appearances: number;
    goals: number;
    assists: number;
    yellow_cards: number;
    red_cards: number;
    average_rating: number;
  };
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}
```

**Usage Example:**
```typescript
import { usePlayerCareerStats } from '@/modules/players/hooks';

export function CareerStatsPanel() {
  const { data, isLoading, error } = usePlayerCareerStats('player-123', {
    season: '2025/26',
    includeComparison: true,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorMessage error={error} />;

  return (
    <div className="grid grid-cols-5 gap-4">
      <StatCard label="Appearances" value={data.appearances} />
      <StatCard label="Goals" value={data.goals} />
      <StatCard label="Assists" value={data.assists} />
      <StatCard label="Yellow Cards" value={data.yellow_cards} />
      <StatCard label="Red Cards" value={data.red_cards} />
    </div>
  );
}
```

**Features:**
- ✅ Caching via React Query
- ✅ Auto-refetch on component mount
- ✅ Season filtering
- ✅ Comparison data included
- ✅ Error handling

---

### usePlayerFilters

Manage advanced player filtering with URL persistence.

**Location:** `src/modules/players/hooks/usePlayerFilters.ts`

**Signature:**
```typescript
function usePlayerFilters(initialFilters?: FilterOptions)
```

**Returns:**
```typescript
{
  filters: {
    position?: string;
    club?: string;
    nationality?: string;
    min_height?: number;
    max_height?: number;
    min_age?: number;
    max_age?: number;
    min_rating?: number;
  };
  setFilters: (filters: FilterOptions) => void;
  clearFilters: () => void;
  getFilteredPlayers: (players: Player[]) => Player[];
}
```

**Usage Example:**
```typescript
import { usePlayerFilters } from '@/modules/players/hooks';

export function PlayerFilterPanel() {
  const { filters, setFilters, clearFilters, getFilteredPlayers } = 
    usePlayerFilters();

  return (
    <div className="space-y-4">
      <input 
        value={filters.position || ''}
        onChange={(e) => setFilters({ ...filters, position: e.target.value })}
        placeholder="Filter by position"
      />
      <input 
        value={filters.club || ''}
        onChange={(e) => setFilters({ ...filters, club: e.target.value })}
        placeholder="Filter by club"
      />
      <button onClick={clearFilters}>Clear All Filters</button>
    </div>
  );
}
```

**Features:**
- ✅ URL state persistence (search params)
- ✅ 7+ filter types
- ✅ Debounced filtering
- ✅ Clear all filters
- ✅ Combine multiple filters

---

### usePlayerComparison

Compare up to 5 players side-by-side.

**Location:** `src/modules/players/hooks/usePlayerComparison.ts`

**Signature:**
```typescript
function usePlayerComparison(playerIds: string[])
```

**Returns:**
```typescript
{
  comparison: ComparisonData[];
  normalized: NormalizedComparison;
  bestPerformer: { [key: string]: string };
  isLoading: boolean;
  error: Error | null;
}
```

**Usage Example:**
```typescript
import { usePlayerComparison } from '@/modules/players/hooks';

export function ComparisonTable() {
  const { comparison, normalized, bestPerformer } = 
    usePlayerComparison(['player-123', 'player-456']);

  return (
    <table>
      <thead>
        <tr>
          <th>Metric</th>
          {comparison.map(c => (
            <th key={c.player_id} className={
              bestPerformer[c.metric] === c.player_id ? 'bg-green-100' : ''
            }>
              {c.player_name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {Object.entries(normalized).map(([metric, values]) => (
          <tr key={metric}>
            <td>{metric}</td>
            {values.map((v, i) => (
              <td key={i}>{v}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
```

**Features:**
- ✅ Max 5 players comparison
- ✅ Normalization for different metrics
- ✅ Best performer highlighting
- ✅ Data validation
- ✅ Error handling

---

## 💼 Professional Management Hooks

### usePlayerContracts

Fetch and manage player contracts.

**Location:** `src/modules/players/hooks/usePlayerContracts.ts`

**Signature:**
```typescript
function usePlayerContracts(playerId: string, options?: {
  status?: 'active' | 'pending' | 'terminated';
})
```

**Returns:**
```typescript
{
  contracts: Contract[];
  isLoading: boolean;
  error: Error | null;
  createContract: (data: ContractInput) => Promise<Contract>;
  updateContract: (contractId: string, data: Partial<Contract>) => Promise<Contract>;
  deleteContract: (contractId: string) => Promise<void>;
  refetch: () => Promise<void>;
}
```

**Usage Example:**
```typescript
import { usePlayerContracts } from '@/modules/players/hooks';

export function ContractsList() {
  const { 
    contracts, 
    isLoading, 
    createContract, 
    updateContract 
  } = usePlayerContracts('player-123', { status: 'active' });

  const handleCreate = async (data: ContractInput) => {
    try {
      await createContract(data);
      toast.success('Contract created');
    } catch (error) {
      toast.error('Failed to create contract');
    }
  };

  if (isLoading) return <LoadingSkeleton />;

  return (
    <div>
      {contracts.map(contract => (
        <ContractCard 
          key={contract.id} 
          contract={contract}
          onUpdate={updateContract}
        />
      ))}
      <ContractForm onSubmit={handleCreate} />
    </div>
  );
}
```

**Features:**
- ✅ CRUD operations
- ✅ Status filtering
- ✅ Auto-refetch after mutations
- ✅ Error handling
- ✅ Mutation feedback (loading state)

---

### usePlayerAgents

Manage player-agent relationships.

**Location:** `src/modules/players/hooks/usePlayerAgents.ts`

**Signature:**
```typescript
function usePlayerAgents(playerId: string)
```

**Returns:**
```typescript
{
  agents: Agent[];
  isLoading: boolean;
  error: Error | null;
  addAgent: (agentId: string, commission: number) => Promise<void>;
  removeAgent: (agentId: string) => Promise<void>;
  updateAgentCommission: (agentId: string, commission: number) => Promise<void>;
}
```

**Usage Example:**
```typescript
import { usePlayerAgents } from '@/modules/players/hooks';

export function AgentManagement() {
  const { agents, addAgent, removeAgent } = usePlayerAgents('player-123');

  return (
    <div>
      <h3>Agents ({agents.length})</h3>
      <ul>
        {agents.map(agent => (
          <li key={agent.id}>
            <span>{agent.name}</span>
            <span>{agent.commission_percentage}%</span>
            <button onClick={() => removeAgent(agent.id)}>Remove</button>
          </li>
        ))}
      </ul>
      <AgentSearchForm onSelect={(agent) => addAgent(agent.id, 5)} />
    </div>
  );
}
```

**Features:**
- ✅ Search agent database
- ✅ Add/remove agents
- ✅ Track commission percentages
- ✅ Commission validation
- ✅ Duplicate prevention

---

### usePlayerTransfers

Manage player transfers with multi-currency support.

**Location:** `src/modules/players/hooks/usePlayerTransfers.ts`

**Signature:**
```typescript
function usePlayerTransfers(playerId: string, options?: {
  status?: 'pending' | 'completed' | 'cancelled';
})
```

**Returns:**
```typescript
{
  transfers: Transfer[];
  isLoading: boolean;
  error: Error | null;
  createTransfer: (data: TransferInput) => Promise<Transfer>;
  updateTransfer: (transferId: string, data: Partial<Transfer>) => Promise<Transfer>;
  deleteTransfer: (transferId: string) => Promise<void>;
  convertCurrency: (amount: number, from: Currency, to: Currency) => number;
}
```

**Usage Example:**
```typescript
import { usePlayerTransfers } from '@/modules/players/hooks';

export function TransferManagement() {
  const { 
    transfers, 
    createTransfer, 
    convertCurrency 
  } = usePlayerTransfers('player-123');

  const handleCreate = async (formData: TransferInput) => {
    try {
      // Convert to EUR for storage
      const eurAmount = convertCurrency(
        formData.amount, 
        formData.currency, 
        'EUR'
      );
      
      await createTransfer({
        ...formData,
        transfer_fee: { amount: eurAmount, currency: 'EUR' }
      });
      
      toast.success('Transfer created');
    } catch (error) {
      toast.error('Failed to create transfer');
    }
  };

  return (
    <div>
      <TransferList transfers={transfers} />
      <TransferForm onSubmit={handleCreate} />
    </div>
  );
}
```

**Features:**
- ✅ Multi-currency (EUR, USD, GBP, CNY, SAR)
- ✅ Currency conversion helper
- ✅ Loan duration support
- ✅ Status tracking
- ✅ CRUD operations

---

## 🏥 Ecosystem Hooks

### usePlayerMedical

Manage medical profile and documents (staff-only).

**Location:** `src/modules/players/hooks/usePlayerMedical.ts`

**Signature:**
```typescript
function usePlayerMedical(playerId: string, options?: {
  includeDocuments?: boolean;
  requiresAuth?: boolean;
})
```

**Returns:**
```typescript
{
  profile: MedicalProfile | null;
  isLoading: boolean;
  error: Error | null;
  updateProfile: (data: MedicalProfileInput) => Promise<MedicalProfile>;
  uploadDocument: (file: File, type: string) => Promise<MedicalDocument>;
  verifyDocument: (docId: string, status: 'verified' | 'rejected') => Promise<void>;
  deleteDocument: (docId: string) => Promise<void>;
}
```

**Usage Example:**
```typescript
import { usePlayerMedical } from '@/modules/players/hooks';

export function MedicalDashboard() {
  const { 
    profile, 
    updateProfile, 
    uploadDocument, 
    verifyDocument 
  } = usePlayerMedical('player-123', { includeDocuments: true });

  if (!profile) return <AccessDenied />;

  return (
    <div className="space-y-6">
      <MedicalProfileCard 
        profile={profile}
        onUpdate={updateProfile}
      />
      
      <DocumentsList 
        documents={profile.documents}
        onVerify={verifyDocument}
        onUpload={uploadDocument}
      />
    </div>
  );
}
```

**Features:**
- ✅ Staff-only access control
- ✅ Document upload
- ✅ Verification workflow
- ✅ Confidentiality flags
- ✅ Blood type management

---

### usePlayerNationalTeam

Track national team career and call-ups.

**Location:** `src/modules/players/hooks/usePlayerNationalTeam.ts`

**Signature:**
```typescript
function usePlayerNationalTeam(playerId: string)
```

**Returns:**
```typescript
{
  data: NationalTeamData | null;
  isLoading: boolean;
  error: Error | null;
  getCallUpHistory: () => CallUp[];
  getCurrentSeasonStats: () => SeasonStats;
}
```

**Usage Example:**
```typescript
import { usePlayerNationalTeam } from '@/modules/players/hooks';

export function NationalTeamCard() {
  const { data, getCallUpHistory } = usePlayerNationalTeam('player-123');

  if (!data) return null;

  return (
    <div className="card">
      <h3>{data.country}</h3>
      <p>Caps: {data.caps} | Goals: {data.goals}</p>
      <ul>
        {getCallUpHistory().map(callup => (
          <li key={callup.id}>
            {callup.tournament} - {callup.call_up_date}
          </li>
        ))}
      </ul>
    </div>
  );
}
```

**Features:**
- ✅ Country flags display
- ✅ Call-up history
- ✅ International statistics
- ✅ Tournament tracking
- ✅ Availability status

---

### usePlayerPerformance

Fetch performance metrics and comparisons.

**Location:** `src/modules/players/hooks/usePlayerPerformance.ts`

**Signature:**
```typescript
function usePlayerPerformance(playerId: string, options?: {
  season?: string;
  category?: MetricCategory;
})
```

**Returns:**
```typescript
{
  metrics: PerformanceMetric[];
  isLoading: boolean;
  error: Error | null;
  getMetricsByCategory: (category: MetricCategory) => PerformanceMetric[];
  compareMetrics: (playerId: string) => ComparisonResult[];
}
```

**Usage Example:**
```typescript
import { usePlayerPerformance } from '@/modules/players/hooks';

export function PerformanceDashboard() {
  const { metrics, getMetricsByCategory } = 
    usePlayerPerformance('player-123', { season: '2025/26' });

  const offensiveMetrics = getMetricsByCategory('offensive');
  const defensiveMetrics = getMetricsByCategory('defensive');

  return (
    <div className="grid grid-cols-2 gap-4">
      <div>
        <h3>Offensive</h3>
        {offensiveMetrics.map(m => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>
      <div>
        <h3>Defensive</h3>
        {defensiveMetrics.map(m => (
          <MetricCard key={m.id} metric={m} />
        ))}
      </div>
    </div>
  );
}
```

**Features:**
- ✅ 25+ metric types
- ✅ Category grouping
- ✅ Season filtering
- ✅ Comparison helper
- ✅ Trend analysis

---

### usePlayerCompliance

Manage compliance status and rules (legal staff only).

**Location:** `src/modules/players/hooks/usePlayerCompliance.ts`

**Signature:**
```typescript
function usePlayerCompliance(playerId: string)
```

**Returns:**
```typescript
{
  status: ComplianceStatus | null;
  isLoading: boolean;
  error: Error | null;
  updateRule: (ruleId: string, data: ComplianceRuleUpdate) => Promise<void>;
  getAlerts: () => ComplianceAlert[];
  getHealthPercentage: () => number;
}
```

**Usage Example:**
```typescript
import { usePlayerCompliance } from '@/modules/players/hooks';

export function ComplianceOverview() {
  const { status, getAlerts, getHealthPercentage } = 
    usePlayerCompliance('player-123');

  const health = getHealthPercentage();
  const alerts = getAlerts();

  return (
    <div>
      <ProgressCircle value={health} />
      <AlertsList alerts={alerts} />
      <RulesList rules={status?.rules || []} />
    </div>
  );
}
```

**Features:**
- ✅ 12 rule types (FIFA RSTP + internal)
- ✅ 5-state workflow
- ✅ Priority levels
- ✅ Alert system
- ✅ Health % indicator

---

## 🎨 Common Patterns

### Pattern 1: Data Fetching & Caching

All hooks use React Query for automatic caching:

```typescript
// Caching is automatic
const { data } = usePlayerTransfers('player-123');

// Data is cached for 5 minutes
// Refetch on window focus
// Stale data shown immediately
```

### Pattern 2: Error Handling

All hooks provide error objects:

```typescript
const { data, error, isLoading } = usePlayerContracts('player-123');

if (error) {
  if (error.status === 403) return <AccessDenied />;
  if (error.status === 404) return <NotFound />;
  return <ErrorBoundary error={error} />;
}
```

### Pattern 3: Loading States

All hooks provide loading indicator:

```typescript
if (isLoading) return <LoadingSkeleton count={3} />;
```

### Pattern 4: Mutations with Feedback

All mutation hooks provide feedback:

```typescript
const { createTransfer } = usePlayerTransfers('player-123');

try {
  await createTransfer(data);
  toast.success('Transfer created');
} catch (error) {
  toast.error(error.message);
}
```

### Pattern 5: Conditional Fetching

All hooks support conditional fetching:

```typescript
const { data } = usePlayerMedical('player-123', {
  requiresAuth: true, // Skip if not authenticated
  includeDocuments: showDocuments, // Conditionally include
});
```

---

## 📊 Hook Dependencies

```
usePlayerCareerStats
├── React Query: queryFn + caching
├── API: playerApi.getCareerStats()
└── Types: CareerStats

usePlayerFilters
├── React Router: useSearchParams()
├── React Hooks: useState, useCallback
└── Utils: parseFilterParams()

usePlayerComparison
├── React Query: useQueries()
├── API: playerApi.getPlayer() (x5)
└── Helpers: normalizeComparison()

usePlayerTransfers
├── React Query: useQuery + useMutation
├── API: playerApi.getTransfers()
├── Helpers: convertCurrency()
└── Utils: formatTransferFee()

usePlayerMedical
├── React Query: useQuery + useMutation
├── API: playerApi.getMedical()
├── Auth: useAuth() for permission check
└── Upload: useFileUpload()

usePlayerCompliance
├── React Query: useQuery
├── API: playerApi.getCompliance()
├── Helpers: calculateHealthPercentage()
└── Alerts: useComplianceAlerts()
```

---

## 🚀 Performance Tips

1. **Memoize selectors:**
   ```typescript
   const offensiveMetrics = useMemo(
     () => getMetricsByCategory('offensive'),
     [metrics]
   );
   ```

2. **Conditionally fetch:**
   ```typescript
   const { data } = usePlayerMedical(playerId, {
     enabled: canViewMedical, // Don't fetch if not permitted
   });
   ```

3. **Debounce filters:**
   ```typescript
   const debouncedFilters = useDebouncedValue(filters, 300);
   const { data } = usePlayerFilters(debouncedFilters);
   ```

---

**Last Updated:** August 12, 2026  
**Status:** Production Ready

