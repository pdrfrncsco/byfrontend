import { useMemo } from 'react'
import { useTenant } from '@/app/providers/TenantProvider'
import { useAuth } from '@/app/providers/AuthProvider'

// ─── Dashboard Types ──────────────────────────────────────────────────────────

/**
 * All available dashboard contexts in the BolaYetu platform.
 * The order here reflects the resolution priority (highest → lowest).
 */
export type DashboardType =
  | 'federation'   // FAF or federation-type tenant → full ecosystem view
  | 'executive'    // Platform super-admin / cross-org executive
  | 'organization' // Org owner/admin with no specific tenant context
  | 'league'       // League/association tenant view
  | 'competition'  // Competition organizer within a league/federation
  | 'club'         // Club admin managing squads, transfers, licences
  | 'player'       // Individual athlete portal

// ─── Role Constants ───────────────────────────────────────────────────────────

/**
 * Membership roles as returned by the API (TenantMembership.role).
 * These are the canonical values stored in the backend.
 */
const MEMBERSHIP_ROLES = {
  OWNER: 'owner',
  ADMIN: 'admin',
  MANAGER: 'manager',
  MEMBER: 'member',
} as const

/**
 * Derived / synthetic roles that may appear in UserProfile.roles[] after
 * the mapToUserProfile transform in auth-store.ts.
 */
const DERIVED_ROLES = {
  EXECUTIVE: 'executive',
  CLUB_ADMIN: 'club_admin',
  PLAYER: 'player',
  COMPETITION_ORGANIZER: 'competition_organizer',
  FAN: 'fan',
  ACTIVE: 'active',
} as const

/**
 * Tenant type strings as returned by the Organization API.
 */
const TENANT_TYPES = {
  FEDERATION: 'federation',
  LEAGUE: 'league',
  ASSOCIATION: 'association',
  ORGANIZER: 'organizer',
  ACADEMY: 'academy',
  CLUB: 'club',
} as const

// ─── Resolution Result ────────────────────────────────────────────────────────

export interface DashboardResolution {
  /** The automatically resolved dashboard type based on tenant + user context */
  resolvedType: DashboardType
  /** Human-readable label for the resolved context */
  resolvedLabel: string
  /** Whether the resolution is based on tenant context (vs user role) */
  isTenantResolved: boolean
  /** Whether the current user has any meaningful role (not just 'fan') */
  hasRole: boolean
  /** The user's primary active role string */
  primaryRole: string | null
  /** True if still loading auth/tenant data */
  isLoading: boolean
}

// ─── Role → Dashboard Mapping ─────────────────────────────────────────────────

/**
 * Resolves the dashboard type from the user's role array using a strict
 * priority chain. Only the FIRST match in the array is used.
 *
 * Priority (highest first):
 *   owner / admin  → organization (multi-tenant owner view)
 *   executive      → executive (cross-org analytics)
 *   manager        → executive (fallback manager view)
 *   club_admin     → club
 *   competition_organizer → competition
 *   player         → player
 *   member / fan / active → executive (guest/logged-in default)
 */
function resolveFromRoles(roles: string[]): DashboardType {
  const has = (role: string) => roles.includes(role)

  if (has(MEMBERSHIP_ROLES.OWNER) || has(MEMBERSHIP_ROLES.ADMIN)) return 'organization'
  if (has(DERIVED_ROLES.EXECUTIVE)) return 'executive'
  if (has(MEMBERSHIP_ROLES.MANAGER)) return 'executive'
  if (has(DERIVED_ROLES.CLUB_ADMIN)) return 'club'
  if (has(DERIVED_ROLES.COMPETITION_ORGANIZER)) return 'competition'
  if (has(DERIVED_ROLES.PLAYER)) return 'player'

  // 'member', 'fan', 'active', or any unrecognised role → safe executive fallback
  return 'executive'
}

/**
 * Resolves the dashboard type from the tenant's type/slug.
 * Returns null if the tenant type doesn't map to a specific dashboard.
 */
function resolveFromTenant(
  slug: string,
  type: string,
): DashboardType | null {
  // Explicit slug overrides (specific well-known tenants)
  if (slug === 'faf') return 'federation'
  if (slug === 'girabola') return 'league'

  // Tenant type mapping
  switch (type) {
    case TENANT_TYPES.FEDERATION:
      return 'federation'
    case TENANT_TYPES.LEAGUE:
    case TENANT_TYPES.ASSOCIATION:
      return 'league'
    case TENANT_TYPES.ORGANIZER:
      return 'competition'
    case TENANT_TYPES.CLUB:
    case TENANT_TYPES.ACADEMY:
      return 'club'
    default:
      return null
  }
}

// ─── Labels ───────────────────────────────────────────────────────────────────

const DASHBOARD_LABELS: Record<DashboardType, string> = {
  federation: 'Federação (FAF)',
  executive: 'Administrador Executivo',
  organization: 'Proprietário de Organização',
  league: 'Liga / Associação',
  competition: 'Organizador de Provas',
  club: 'Gestor de Clube',
  player: 'Portal do Jogador',
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

/**
 * `useDashboardResolver`
 *
 * Centralises all dashboard-type resolution logic.
 *
 * Resolution priority:
 *   1. Tenant context (subdomain / ?tenant query param) → tenant type/slug
 *   2. User active role (from active membership)
 *   3. User roles array (derived roles from auth-store mapping)
 *   4. Platform default → 'executive'
 */
export function useDashboardResolver(): DashboardResolution {
  const { tenant, loading: tenantLoading } = useTenant()
  const { user, loading: authLoading } = useAuth()

  const isLoading = tenantLoading || authLoading

  return useMemo<DashboardResolution>(() => {
    // ── 1. Tenant-first resolution ─────────────────────────────────────────
    if (tenant) {
      const tenantType = resolveFromTenant(tenant.slug, tenant.type)
      if (tenantType) {
        return {
          resolvedType: tenantType,
          resolvedLabel: DASHBOARD_LABELS[tenantType],
          isTenantResolved: true,
          hasRole: true,
          primaryRole: tenant.type,
          isLoading,
        }
      }
    }

    // ── 2. User role resolution ────────────────────────────────────────────
    if (user) {
      const roles = user.roles ?? []
      const activeRole = user.role ?? null

      // Active membership role takes precedence over derived roles
      let dashType: DashboardType = 'executive'

      if (activeRole && activeRole !== DERIVED_ROLES.FAN) {
        dashType = resolveFromRoles([activeRole, ...roles])
      } else if (roles.length > 0) {
        dashType = resolveFromRoles(roles)
      }

      const hasRole = roles.some(
        r => r !== DERIVED_ROLES.FAN && r !== DERIVED_ROLES.ACTIVE,
      )

      return {
        resolvedType: dashType,
        resolvedLabel: DASHBOARD_LABELS[dashType],
        isTenantResolved: false,
        hasRole,
        primaryRole: activeRole,
        isLoading,
      }
    }

    // ── 3. Unauthenticated / loading fallback ──────────────────────────────
    return {
      resolvedType: 'executive',
      resolvedLabel: DASHBOARD_LABELS['executive'],
      isTenantResolved: false,
      hasRole: false,
      primaryRole: null,
      isLoading,
    }
  }, [tenant, user, isLoading])
}

// ─── Exported constants for consumers ─────────────────────────────────────────

export { DASHBOARD_LABELS, MEMBERSHIP_ROLES, DERIVED_ROLES, TENANT_TYPES }
