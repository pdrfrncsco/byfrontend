import { useState, lazy, Suspense } from 'react'
import { PendingOnboardingRedirect } from '@/app/routes'
import { ExecutiveDashboardPage } from './ExecutiveDashboardPage'
import { FederationDashboardPage } from './FederationDashboardPage'
import { LeagueDashboardPage } from './LeagueDashboardPage'
import { CompetitionDashboardPage } from './CompetitionDashboardPage'
import ClubDashboardPage from '@/modules/clubs/pages/ClubDashboardPage'
import OrganizationDashboardPage from '@/modules/organizations/pages/OrganizationDashboardPage'
import {
  useDashboardResolver,
  type DashboardType,
  DASHBOARD_LABELS,
} from '../hooks/useDashboardResolver'
import {
  Sliders,
  CheckCircle2,
  RotateCcw,
  Shield,
  Trophy,
  Building2,
  Users,
  Network,
  Swords,
  User,
  ChevronRight,
} from 'lucide-react'

// ─── Lazy imports ─────────────────────────────────────────────────────────────

const PlayerDashboardPage = lazy(() =>
  import('@/modules/players/pages/PlayerDashboardPage').then((m) => ({
    default: m.PlayerDashboardPage,
  })),
)

// ─── Dev Tool Config ──────────────────────────────────────────────────────────

interface DevDashboardOption {
  type: DashboardType
  icon: React.ReactNode
  role: string
  color: string
}

const DEV_OPTIONS: DevDashboardOption[] = [
  {
    type: 'executive',
    icon: <Network className="w-4 h-4" />,
    role: 'executive',
    color: '#94d3c1',
  },
  {
    type: 'federation',
    icon: <Shield className="w-4 h-4" />,
    role: 'admin (FAF)',
    color: '#60a5fa',
  },
  {
    type: 'organization',
    icon: <Building2 className="w-4 h-4" />,
    role: 'owner / admin',
    color: '#a78bfa',
  },
  {
    type: 'league',
    icon: <Trophy className="w-4 h-4" />,
    role: 'admin (Liga)',
    color: '#e9c349',
  },
  {
    type: 'competition',
    icon: <Swords className="w-4 h-4" />,
    role: 'competition_organizer',
    color: '#fb923c',
  },
  {
    type: 'club',
    icon: <Users className="w-4 h-4" />,
    role: 'club_admin',
    color: '#34d399',
  },
  {
    type: 'player',
    icon: <User className="w-4 h-4" />,
    role: 'player',
    color: '#f472b6',
  },
]

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

function DashboardLoadingSkeleton() {
  return (
    <div className="min-h-screen bg-[#031427] flex items-center justify-center">
      <div className="text-center space-y-4">
        <div className="relative w-14 h-14 mx-auto">
          <div className="absolute inset-0 rounded-full border-4 border-[#26364a]" />
          <div className="absolute inset-0 rounded-full border-4 border-t-[#94d3c1] animate-spin" />
        </div>
        <p className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest">
          A identificar o seu contexto…
        </p>
      </div>
    </div>
  )
}

// ─── Dashboard Renderer ───────────────────────────────────────────────────────

function renderDashboard(type: DashboardType) {
  switch (type) {
    case 'federation':
      return <FederationDashboardPage />
    case 'executive':
      return <ExecutiveDashboardPage />
    case 'organization':
      return <OrganizationDashboardPage />
    case 'league':
      return <LeagueDashboardPage />
    case 'club':
      return <ClubDashboardPage />
    case 'competition':
      return <CompetitionDashboardPage />
    case 'player':
      return (
        <Suspense
          fallback={
            <div className="p-8 text-sm text-on-surface-variant flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-[#94d3c1] border-t-transparent rounded-full animate-spin" />
              A carregar portal do jogador…
            </div>
          }
        >
          <PlayerDashboardPage />
        </Suspense>
      )
    default:
      return <ExecutiveDashboardPage />
  }
}

// ─── Dev Selector Panel ───────────────────────────────────────────────────────

interface DevSelectorPanelProps {
  activeType: DashboardType
  resolvedType: DashboardType
  overrideType: DashboardType | null
  onSelect: (type: DashboardType) => void
  onReset: () => void
  isTenantResolved: boolean
  primaryRole: string | null
}

function DevSelectorPanel({
  activeType,
  resolvedType,
  overrideType,
  onSelect,
  onReset,
  isTenantResolved,
  primaryRole,
}: DevSelectorPanelProps) {
  return (
    <div className="absolute bottom-16 left-0 w-80 bg-[#0a1929]/95 backdrop-blur-md border border-[#26364a] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden z-50 animate-fade-in">
      {/* Panel header */}
      <div className="px-4 py-3 bg-[#102034]/80 border-b border-[#26364a]/60 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sliders className="w-3.5 h-3.5 text-[#94d3c1]" />
          <span className="text-[11px] font-bold text-on-surface uppercase tracking-wider">
            Dashboard Switcher
          </span>
        </div>
        <span className="text-[9px] font-bold text-[#94d3c1] bg-[#94d3c1]/10 border border-[#94d3c1]/20 px-2 py-0.5 rounded-full">
          DEV ONLY
        </span>
      </div>

      {/* Current resolution info */}
      <div className="px-4 py-2.5 bg-[#0b1c30]/60 border-b border-[#26364a]/40">
        <p className="text-[9px] text-on-surface-variant uppercase tracking-wider font-semibold mb-1">
          Resolução Automática
        </p>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-[#94d3c1] animate-pulse" />
            <span className="text-[11px] text-[#94d3c1] font-semibold">
              {DASHBOARD_LABELS[resolvedType]}
            </span>
          </div>
          <span className="text-[9px] text-on-surface-variant bg-[#26364a] px-2 py-0.5 rounded">
            {isTenantResolved ? 'via tenant' : primaryRole ? `role: ${primaryRole}` : 'fallback'}
          </span>
        </div>
      </div>

      {/* Options grid */}
      <div className="p-3 space-y-1.5">
        {DEV_OPTIONS.map((opt) => {
          const isActive = activeType === opt.type
          const isResolved = resolvedType === opt.type && !overrideType
          return (
            <button
              key={opt.type}
              onClick={() => onSelect(opt.type)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all duration-150 group ${
                isActive
                  ? 'border-opacity-60 bg-opacity-10'
                  : 'border-[#26364a] bg-[#0b1c30] hover:border-[#3f4945] hover:bg-[#0f2236]'
              }`}
              style={
                isActive
                  ? {
                      borderColor: opt.color + '60',
                      backgroundColor: opt.color + '10',
                    }
                  : undefined
              }
            >
              {/* Icon */}
              <span
                className="p-1.5 rounded-lg flex-shrink-0 transition-colors"
                style={{
                  color: isActive ? opt.color : '#6b7f94',
                  backgroundColor: isActive ? opt.color + '18' : '#1b2b3f',
                }}
              >
                {opt.icon}
              </span>

              {/* Label + Role */}
              <div className="flex-1 min-w-0">
                <p
                  className="text-xs font-semibold leading-none truncate"
                  style={{ color: isActive ? opt.color : '#bfc9c4' }}
                >
                  {DASHBOARD_LABELS[opt.type]}
                </p>
                <p className="text-[9px] text-on-surface-variant mt-0.5 truncate">
                  {opt.role}
                </p>
              </div>

              {/* Status badges */}
              <div className="flex items-center gap-1 flex-shrink-0">
                {isResolved && (
                  <span
                    className="text-[8px] font-bold px-1.5 py-0.5 rounded uppercase"
                    style={{ color: opt.color, backgroundColor: opt.color + '15' }}
                  >
                    auto
                  </span>
                )}
                {isActive ? (
                  <CheckCircle2 className="w-4 h-4" style={{ color: opt.color }} />
                ) : (
                  <ChevronRight className="w-3.5 h-3.5 text-[#3f4945] group-hover:text-[#6b7f94] transition-colors" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Reset action */}
      {overrideType && (
        <div className="px-3 pb-3">
          <button
            onClick={onReset}
            className="w-full flex items-center justify-center gap-1.5 text-[10px] text-on-surface-variant hover:text-[#94d3c1] border border-[#26364a] hover:border-[#94d3c1]/30 rounded-xl py-2 transition-all"
          >
            <RotateCcw className="w-3 h-3" />
            Repor Resolução Automática
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function DashboardPageSelector() {
  const { resolvedType, isTenantResolved, primaryRole, isLoading } = useDashboardResolver()
  const [overrideType, setOverrideType] = useState<DashboardType | null>(null)
  const [isSelectorOpen, setIsSelectorOpen] = useState(false)

  // Show a skeleton while auth/tenant are still bootstrapping
  if (isLoading) {
    return <DashboardLoadingSkeleton />
  }

  const activeType = overrideType ?? resolvedType

  const handleSelect = (type: DashboardType) => {
    setOverrideType(type)
    setIsSelectorOpen(false)
  }

  return (
    <div className="relative min-h-screen">
      <PendingOnboardingRedirect />

      {/* Active dashboard */}
      {renderDashboard(activeType)}

      {/* DEV-only dashboard switcher */}
      {import.meta.env.DEV && (
        <div className="fixed bottom-4 left-4 z-50">
          {isSelectorOpen && (
            <DevSelectorPanel
              activeType={activeType}
              resolvedType={resolvedType}
              overrideType={overrideType}
              onSelect={handleSelect}
              onReset={() => {
                setOverrideType(null)
                setIsSelectorOpen(false)
              }}
              isTenantResolved={isTenantResolved}
              primaryRole={primaryRole}
            />
          )}

          <button
            onClick={() => setIsSelectorOpen((v) => !v)}
            title="Pré-visualizar Dashboards (Ferramenta Dev)"
            className={`relative flex items-center justify-center p-3 rounded-full shadow-2xl transition-all duration-200 cursor-pointer group ${
              isSelectorOpen
                ? 'bg-[#94d3c1] text-[#031427]'
                : 'bg-[#102034]/90 border border-[#26364a] text-[#94d3c1] hover:bg-[#1b2b3f]'
            }`}
          >
            <Sliders
              className={`w-5 h-5 transition-transform duration-300 ${
                isSelectorOpen ? 'rotate-45' : 'group-hover:rotate-12'
              }`}
            />
            {/* Active override indicator */}
            {overrideType && !isSelectorOpen && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-[#e9c349] rounded-full border-2 border-[#031427]" />
            )}
          </button>
        </div>
      )}
    </div>
  )
}
