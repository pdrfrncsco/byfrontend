import { Suspense, lazy } from 'react'
import { Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { OnboardingGuard } from '../OnboardingGuard'
import { organizationRoutes } from '@/modules/organizations/routes'
import { clubRoutes } from '@/modules/clubs/routes'
import { playerRoutes } from '@/modules/players/routes'
import { dashboardRoutes } from '@/modules/dashboards/routes'
import { onboardingRoutes } from '@/modules/onboarding/routes'
import {
  DashboardPageSelector,
  ExecutiveDashboardPage,
  FederationDashboardPage,
  LeagueDashboardPage,
  CompetitionDashboardPage,
} from '@/modules/dashboards'
import {
  OrganizationDashboardPage,
  OrganizationSettingsPage,
  OrganizationMembersPage,
  OrganizationAffiliationsPage,
} from '@/modules/organizations'
import { OrganizationStep, BrandingStep, CompetitionStep, ReviewStep } from '@/modules/onboarding'

const ClubDashboardPage = lazy(() => import('@/modules/clubs/pages/ClubDashboardPage'))
const ClubSettingsPage = lazy(() => import('@/modules/clubs/pages/ClubSettingsPage'))
const ClubMembersPage = lazy(() => import('@/modules/clubs/pages/ClubMembersPage'))
const ClubDocumentsPage = lazy(() => import('@/modules/clubs/pages/ClubDocumentsPage'))
const ClubSponsorsPage = lazy(() => import('@/modules/clubs/pages/ClubSponsorsPage'))
const ClubTransfersPage = lazy(() => import('@/modules/clubs/pages/ClubTransfersPage'))
const ClubTransferCreatePage = lazy(() => import('@/modules/clubs/pages/ClubTransferCreatePage'))
const PlayerDashboardPage = lazy(() =>
  import('@/modules/players/pages/PlayerDashboardPage').then((m) => ({ default: m.PlayerDashboardPage })),
)
const PlayerDashboardSettingsPage = lazy(() =>
  import('@/modules/players/pages/PlayerDashboardSettingsPage').then((m) => ({ default: m.PlayerDashboardSettingsPage })),
)
const ClubPlayerRegisterPage = lazy(() =>
  import('@/modules/players/pages/ClubPlayerRegisterPage').then((m) => ({ default: m.ClubPlayerRegisterPage })),
)
const PlayerClubLinkRequestPage = lazy(() =>
  import('@/modules/players/pages/PlayerClubLinkRequestPage').then((m) => ({ default: m.PlayerClubLinkRequestPage })),
)
const ClubPlayerRegistrationRequestsPage = lazy(() =>
  import('@/modules/players/pages/ClubPlayerRegistrationRequestsPage').then((m) => ({
    default: m.ClubPlayerRegistrationRequestsPage,
  })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-lg text-sm text-on-surface-variant">
      Carregando página...
    </div>
  )
}

export function dashboardRouteElements() {
  return (
    <>
      {/* Dashboards */}
      <Route
        path={dashboardRoutes.root}
        element={<ProtectedRoute><DashboardPageSelector /></ProtectedRoute>}
      />
      <Route
        path={dashboardRoutes.executive}
        element={<ProtectedRoute><ExecutiveDashboardPage /></ProtectedRoute>}
      />
      <Route
        path={dashboardRoutes.federation}
        element={<ProtectedRoute><FederationDashboardPage /></ProtectedRoute>}
      />
      <Route
        path={dashboardRoutes.league}
        element={<ProtectedRoute><LeagueDashboardPage /></ProtectedRoute>}
      />
      <Route
        path={dashboardRoutes.competition}
        element={<ProtectedRoute><CompetitionDashboardPage /></ProtectedRoute>}
      />
      <Route
        path={dashboardRoutes.club}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><ClubDashboardPage /></Suspense>
          </ProtectedRoute>
        }
      />

      {/* Player dashboard */}
      <Route
        path={playerRoutes.dashboard}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><PlayerDashboardPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={playerRoutes.dashboardSettings}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><PlayerDashboardSettingsPage /></Suspense>
          </ProtectedRoute>
        }
      />

      {/* Club player registration */}
      <Route
        path={playerRoutes.clubRegister}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><ClubPlayerRegisterPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={playerRoutes.clubPlayerRequests}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><ClubPlayerRegistrationRequestsPage /></Suspense>
          </ProtectedRoute>
        }
      />

      {/* Player club link request */}
      <Route
        path={playerRoutes.linkClub}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><PlayerClubLinkRequestPage /></Suspense>
          </ProtectedRoute>
        }
      />

      {/* Organization management */}
      <Route
        path={organizationRoutes.dashboard}
        element={<ProtectedRoute><OrganizationDashboardPage /></ProtectedRoute>}
      />
      <Route
        path={organizationRoutes.settings}
        element={<ProtectedRoute><OrganizationSettingsPage /></ProtectedRoute>}
      />
      <Route
        path={organizationRoutes.members}
        element={<ProtectedRoute><OrganizationMembersPage /></ProtectedRoute>}
      />
      <Route
        path={organizationRoutes.affiliations}
        element={<ProtectedRoute><OrganizationAffiliationsPage /></ProtectedRoute>}
      />

      {/* Club management */}
      <Route
        path={clubRoutes.settings}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><ClubSettingsPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.members}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><ClubMembersPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.documents}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><ClubDocumentsPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.sponsors}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><ClubSponsorsPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.transfers}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><ClubTransfersPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.transferCreate}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><ClubTransferCreatePage /></Suspense>
          </ProtectedRoute>
        }
      />

      {/* Onboarding */}
      <Route
        path={onboardingRoutes.root}
        element={<ProtectedRoute><OnboardingGuard><OrganizationStep /></OnboardingGuard></ProtectedRoute>}
      />
      <Route
        path={onboardingRoutes.branding}
        element={<ProtectedRoute><OnboardingGuard><BrandingStep /></OnboardingGuard></ProtectedRoute>}
      />
      <Route
        path={onboardingRoutes.competition}
        element={<ProtectedRoute><OnboardingGuard><CompetitionStep /></OnboardingGuard></ProtectedRoute>}
      />
      <Route
        path={onboardingRoutes.review}
        element={<ProtectedRoute><OnboardingGuard><ReviewStep /></OnboardingGuard></ProtectedRoute>}
      />
    </>
  )
}
