# 🎨 Component Reference Guide

**Version:** 1.0.0 (August 2026)  
**Total Components:** 20+  
**Status:** Production Ready  

---

## 📋 Table of Contents

1. [Section Components](#section-components)
2. [Form Components](#form-components)
3. [Common Components](#common-components)
4. [Prop Types](#prop-types)

---

## 🔷 Section Components

### PlayerCareerStatsSection

Display player career statistics dashboard with 5 main cards.

**Location:** `src/modules/players/components/sections/PlayerCareerStatsSection.tsx`

**Props:**
```typescript
interface PlayerCareerStatsSectionProps {
  playerId: string;
  compact?: boolean; // Show compact view (default: false)
}
```

**Usage:**
```typescript
import { PlayerCareerStatsSection } from '@/modules/players/components';

export function PlayerProfile() {
  return (
    <PlayerCareerStatsSection 
      playerId="player-123"
      compact={false}
    />
  );
}
```

**Features:**
- ✅ 5 stat cards (Appearances, Goals, Assists, Yellow Cards, Red Cards)
- ✅ Loading skeleton
- ✅ Error handling
- ✅ Responsive design

---

### PlayerTimelineSection

Interactive career timeline with 50+ events.

**Location:** `src/modules/players/components/sections/PlayerTimelineSection.tsx`

**Props:**
```typescript
interface PlayerTimelineSectionProps {
  playerId: string;
  maxItems?: number; // Default: 50
  expandable?: boolean; // Default: true
}
```

**Usage:**
```typescript
import { PlayerTimelineSection } from '@/modules/players/components';

export function PlayerHistory() {
  return (
    <PlayerTimelineSection 
      playerId="player-123"
      maxItems={100}
      expandable={true}
    />
  );
}
```

**Features:**
- ✅ Color-coded events (transfer, contract, injury, etc.)
- ✅ Pagination for 50+ events
- ✅ Virtual scrolling
- ✅ Filter by event type

---

### PlayerComparisonSection

Compare up to 5 players side-by-side.

**Location:** `src/modules/players/components/sections/PlayerComparisonSection.tsx`

**Props:**
```typescript
interface PlayerComparisonSectionProps {
  playerIds: string[];
  maxPlayers?: number; // Default: 5
  metrics?: string[]; // Specific metrics to compare
}
```

**Usage:**
```typescript
import { PlayerComparisonSection } from '@/modules/players/components';

export function ComparisonPage() {
  const [selectedPlayers, setSelectedPlayers] = useState<string[]>([]);

  return (
    <PlayerComparisonSection 
      playerIds={selectedPlayers}
      maxPlayers={5}
      metrics={['goals', 'assists', 'rating']}
    />
  );
}
```

**Features:**
- ✅ Side-by-side comparison
- ✅ Add/remove players dynamically
- ✅ Highlight best performer
- ✅ Responsive columns

---

### PlayerTransferSection

Transfer management interface (pending, active, history).

**Location:** `src/modules/players/components/sections/PlayerTransferSection.tsx`

**Props:**
```typescript
interface PlayerTransferSectionProps {
  playerId: string;
  readOnly?: boolean;
  enableCreate?: boolean;
}
```

**Usage:**
```typescript
import { PlayerTransferSection } from '@/modules/players/components';

export function TransfersPage() {
  return (
    <PlayerTransferSection 
      playerId="player-123"
      readOnly={false}
      enableCreate={true}
    />
  );
}
```

**Features:**
- ✅ 3 sub-sections (Pending, Active, History)
- ✅ Create new transfer form
- ✅ Multi-currency support (EUR, USD, GBP, CNY, SAR)
- ✅ Status tracking
- ✅ Edit/delete transfers

---

### PlayerMedicalSection

Medical profile management (staff-only).

**Location:** `src/modules/players/components/sections/PlayerMedicalSection.tsx`

**Props:**
```typescript
interface PlayerMedicalSectionProps {
  playerId: string;
  canEdit?: boolean; // Requires MedicalStaff permission
  canViewConfidential?: boolean;
}
```

**Usage:**
```typescript
import { PlayerMedicalSection } from '@/modules/players/components';

export function MedicalPage() {
  return (
    <PlayerMedicalSection 
      playerId="player-123"
      canEdit={true}
      canViewConfidential={true}
    />
  );
}
```

**Features:**
- ✅ Blood type (9 types)
- ✅ Height/weight/medical history
- ✅ Document upload & verification
- ✅ Confidentiality flags
- ✅ Staff-only access control

---

### PlayerNationalTeamPerformanceSection

National team tracking + performance metrics.

**Location:** `src/modules/players/components/sections/PlayerNationalTeamPerformanceSection.tsx`

**Props:**
```typescript
interface PlayerNationalTeamPerformanceSectionProps {
  playerId: string;
  season?: string; // e.g., "2025/26"
  tabs?: ('national-team' | 'performance')[];
}
```

**Usage:**
```typescript
import { 
  PlayerNationalTeamPerformanceSection 
} from '@/modules/players/components';

export function NationalTeamPage() {
  return (
    <PlayerNationalTeamPerformanceSection 
      playerId="player-123"
      season="2025/26"
      tabs={['national-team', 'performance']}
    />
  );
}
```

**Features:**
- ✅ Tabbed interface (National Team / Performance)
- ✅ Country flags + ISO codes
- ✅ Call-up history
- ✅ 25+ performance metrics
- ✅ Category grouping (Offensive, Defensive, etc.)

---

### PlayerComplianceSection

Compliance status tracking & rule management.

**Location:** `src/modules/players/components/sections/PlayerComplianceSection.tsx`

**Props:**
```typescript
interface PlayerComplianceSectionProps {
  playerId: string;
  canEdit?: boolean; // Requires LegalStaff
  showHistory?: boolean;
}
```

**Usage:**
```typescript
import { PlayerComplianceSection } from '@/modules/players/components';

export function CompliancePage() {
  return (
    <PlayerComplianceSection 
      playerId="player-123"
      canEdit={true}
      showHistory={true}
    />
  );
}
```

**Features:**
- ✅ 12 rule types (FIFA RSTP + internal)
- ✅ 5-state workflow (compliant, non_compliant, pending, exemption, requires_approval)
- ✅ Health status % indicator
- ✅ Critical issues alert
- ✅ Priority levels (Low, Medium, High, Critical)

---

## 📋 Form Components

### PlayerTransferForm

Create/edit transfer with multi-currency support.

**Location:** `src/modules/players/components/forms/PlayerTransferForm.tsx`

**Props:**
```typescript
interface PlayerTransferFormProps {
  playerId: string;
  transferId?: string; // For editing
  onSuccess?: (transfer: Transfer) => void;
  onError?: (error: Error) => void;
}
```

**Usage:**
```typescript
import { PlayerTransferForm } from '@/modules/players/components';

export function CreateTransferPage() {
  return (
    <PlayerTransferForm 
      playerId="player-123"
      onSuccess={(transfer) => {
        console.log('Transfer created:', transfer);
        navigate(`/transfers/${transfer.id}`);
      }}
    />
  );
}
```

**Features:**
- ✅ From/To club autocomplete
- ✅ Multi-currency (EUR, USD, GBP, CNY, SAR)
- ✅ Transfer type (permanent, loan)
- ✅ Optional loan duration
- ✅ Date picker
- ✅ Zod validation
- ✅ Error messages

---

### PlayerMedicalProfileForm

Edit medical profile (staff-only).

**Location:** `src/modules/players/components/forms/PlayerMedicalProfileForm.tsx`

**Props:**
```typescript
interface PlayerMedicalProfileFormProps {
  playerId: string;
  initialData?: MedicalProfile;
  onSuccess?: (profile: MedicalProfile) => void;
}
```

**Usage:**
```typescript
import { PlayerMedicalProfileForm } from '@/modules/players/components';

export function EditMedicalPage() {
  return (
    <PlayerMedicalProfileForm 
      playerId="player-123"
      onSuccess={(profile) => {
        toast.success('Medical profile updated');
      }}
    />
  );
}
```

**Features:**
- ✅ Blood type dropdown (9 options)
- ✅ Height/weight inputs
- ✅ Medical history textarea
- ✅ Allergies input
- ✅ Last checkup date picker
- ✅ Validation
- ✅ Staff-only permission check

---

### PlayerMedicalDocumentForm

Upload medical documents with verification workflow.

**Location:** `src/modules/players/components/forms/PlayerMedicalDocumentForm.tsx`

**Props:**
```typescript
interface PlayerMedicalDocumentFormProps {
  playerId: string;
  onSuccess?: (document: MedicalDocument) => void;
  onError?: (error: Error) => void;
}
```

**Usage:**
```typescript
import { PlayerMedicalDocumentForm } from '@/modules/players/components';

export function UploadDocumentPage() {
  return (
    <PlayerMedicalDocumentForm 
      playerId="player-123"
      onSuccess={(doc) => {
        toast.success('Document uploaded for verification');
      }}
    />
  );
}
```

**Features:**
- ✅ File upload input
- ✅ Document type selection
- ✅ Document name input
- ✅ Confidentiality checkbox
- ✅ File size validation (max 10MB)
- ✅ Progress indicator
- ✅ Verification workflow (pending → verified/rejected)

---

## 🎯 Common Components

### StatCard

Display a single statistic with label and value.

**Location:** `src/modules/players/components/common/StatCard.tsx`

**Props:**
```typescript
interface StatCardProps {
  label: string;
  value: string | number;
  unit?: string;
  icon?: React.ReactNode;
  trend?: 'up' | 'down' | 'stable';
  comparison?: number;
}
```

**Usage:**
```typescript
import { StatCard } from '@/modules/players/components';

<StatCard 
  label="Goals"
  value={12}
  unit="scored"
  trend="up"
  comparison={+2}
/>
```

---

### PlayerCard

Player profile card (minimal display).

**Location:** `src/modules/players/components/common/PlayerCard.tsx`

**Props:**
```typescript
interface PlayerCardProps {
  player: Player;
  compact?: boolean;
  showActions?: boolean;
  onSelect?: (player: Player) => void;
}
```

**Usage:**
```typescript
import { PlayerCard } from '@/modules/players/components';

<PlayerCard 
  player={player}
  compact={false}
  showActions={true}
  onSelect={handleSelect}
/>
```

---

### ErrorBoundary

Catch & display component errors.

**Location:** `src/shared/components/ErrorBoundary.tsx`

**Props:**
```typescript
interface ErrorBoundaryProps {
  error: Error;
  onRetry?: () => void;
  children?: React.ReactNode;
}
```

**Usage:**
```typescript
import { ErrorBoundary } from '@/shared/components';

<ErrorBoundary error={error} onRetry={handleRetry}>
  <PlayerContent />
</ErrorBoundary>
```

---

### LoadingSkeletons

Display loading placeholders.

**Location:** `src/shared/components/LoadingSkeletons.tsx`

**Components:**
- `<StatCardSkeleton />`
- `<TransferCardSkeleton />`
- `<TableRowSkeleton />`
- `<FormSkeleton />`

**Usage:**
```typescript
import { StatCardSkeleton } from '@/shared/components';

{isLoading ? <StatCardSkeleton /> : <StatCard {...props} />}
```

---

## 📚 Prop Types Reference

### Transfer Types

```typescript
interface Transfer {
  id: string;
  player_id: string;
  from_club: string;
  to_club: string;
  transfer_date: string;
  transfer_type: 'permanent' | 'loan';
  transfer_fee: {
    amount: number;
    currency: 'EUR' | 'USD' | 'GBP' | 'CNY' | 'SAR';
  };
  loan_duration_months?: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}
```

### Medical Types

```typescript
interface MedicalProfile {
  id: string;
  player_id: string;
  blood_type: BloodType;
  height: number;
  weight: number;
  medical_history: string;
  allergies: string;
  last_medical_checkup: string;
  documents: MedicalDocument[];
  created_at: string;
  updated_at: string;
}

interface MedicalDocument {
  id: string;
  type: 'medical_certificate' | 'injury_report' | 'test_result';
  document_name: string;
  file_url: string;
  upload_date: string;
  verification_status: 'pending' | 'verified' | 'rejected';
  verified_by?: string;
  verified_at?: string;
  is_confidential: boolean;
}

type BloodType = 'O+' | 'O-' | 'A+' | 'A-' | 'B+' | 'B-' | 'AB+' | 'AB-' | 'Unknown';
```

### Compliance Types

```typescript
interface ComplianceStatus {
  id: string;
  player_id: string;
  overall_status: ComplianceState;
  health_status_percentage: number;
  rules: ComplianceRule[];
  created_at: string;
  updated_at: string;
}

interface ComplianceRule {
  id: string;
  rule_type: RuleType;
  rule_name: string;
  status: ComplianceState;
  priority: 'low' | 'medium' | 'high' | 'critical';
  last_verified: string;
  alert?: string;
}

type RuleType = 'fifa_rstp' | 'doping_test' | 'medical_clearance' | 'contract_validity' | ...;
type ComplianceState = 'compliant' | 'non_compliant' | 'pending' | 'exemption' | 'requires_approval';
```

---

## 🎯 Component Hierarchy

```
PlayerProfile/
├── PlayerCareerStatsSection
│   ├── StatCard (x5)
│   └── ChartComponent
├── PlayerTimelineSection
│   ├── TimelineItem (x50+)
│   └── VirtualScroller
├── PlayerTransferSection
│   ├── TransferList (Pending)
│   ├── TransferList (Active)
│   ├── TransferList (History)
│   └── PlayerTransferForm (Create)
├── PlayerMedicalSection
│   ├── MedicalProfile (Display)
│   ├── PlayerMedicalProfileForm (Edit)
│   └── MedicalDocumentList
│       └── PlayerMedicalDocumentForm (Upload)
├── PlayerNationalTeamPerformanceSection
│   ├── NationalTeamTab
│   │   ├── CallUpList
│   │   └── Statistics
│   └── PerformanceTab
│       ├── PerformanceMetrics
│       └── PerformanceChart
└── PlayerComplianceSection
    ├── ComplianceStatus
    ├── ComplianceRuleList
    ├── ComplianceHistoryList
    └── ComplianceRuleForm (Edit)
```

---

**Last Updated:** August 12, 2026  
**Status:** Production Ready

