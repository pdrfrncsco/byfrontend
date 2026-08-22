import { Suspense, lazy } from 'react'
import { Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
import { PublicLayout } from '@/app/layouts'
import { clubRoutes } from '@/modules/clubs/routes'
import { competitionRoutes } from '@/modules/competitions/routes'
import { organizationRoutes } from '@/modules/organizations/routes'
import { playerRoutes } from '@/modules/players/routes'
import { PlayerListPage, PlayerDetailPage } from '@/modules/players'
import { CompetitionListPage, CompetitionDetailPage } from '@/modules/competitions'
import { OrganizationListPage, OrganizationDetailPage } from '@/modules/organizations'

const ClubListPage = lazy(() => import('@/modules/clubs/pages/ClubListPage'))
const ClubDetailPage = lazy(() => import('@/modules/clubs/pages/ClubDetailPage'))

const PlayerCreatePage = lazy(() =>
  import('@/modules/players/pages/DashboardPlayerCreatePage').then(m => ({ default: m.DashboardPlayerCreatePage })),
)
const PlayerSettingsPage = lazy(() =>
  import('@/modules/players/pages/PlayerSettingsPage').then(m => ({ default: m.PlayerSettingsPage })),
)

const CompetitionCreatePage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionCreatePage').then(m => ({ default: m.CompetitionCreatePage })),
)
const CompetitionSettingsPage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionSettingsPage').then(m => ({ default: m.CompetitionSettingsPage })),
)
const CompetitionRegistrationPage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionRegistrationPage').then(m => ({ default: m.CompetitionRegistrationPage })),
)
const CompetitionSchedulePage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionSchedulePage').then(m => ({ default: m.CompetitionSchedulePage })),
)
const CompetitionAdminDashboardPage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionAdminDashboardPage').then(m => ({ default: m.CompetitionAdminDashboardPage })),
)
const CompetitionRegulationsPage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionRegulationsPage').then(m => ({ default: m.CompetitionRegulationsPage })),
)
const CompetitionRankingsPage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionRankingsPage').then(m => ({ default: m.CompetitionRankingsPage })),
)
const CompetitionSuspensionsPage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionSuspensionsPage').then(m => ({ default: m.CompetitionSuspensionsPage })),
)
const CompetitionDrawPage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionDrawPage').then(m => ({ default: m.CompetitionDrawPage })),
)
const MatchCenterPage = lazy(() =>
  import('@/modules/competitions/pages/MatchCenterPage').then(m => ({ default: m.MatchCenterPage })),
)
const MatchDetailPage = lazy(() =>
  import('@/modules/competitions/pages/MatchDetailPage').then(m => ({ default: m.MatchDetailPage })),
)
const MatchLineupPage = lazy(() =>
  import('@/modules/competitions/pages/MatchLineupPage').then(m => ({ default: m.MatchLineupPage })),
)
const MatchReportPage = lazy(() =>
  import('@/modules/competitions/pages/MatchReportPage').then(m => ({ default: m.MatchReportPage })),
)
const MatchTacticalViewPage = lazy(() =>
  import('@/modules/competitions/pages/MatchTacticalViewPage').then(m => ({ default: m.default })),
)

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-lg text-sm text-on-surface-variant">
      Carregando página...
    </div>
  )
}

export function contentRouteElements() {
  return (
    <>
      {/* Organizations (public) */}
      <Route path={organizationRoutes.list} element={<PublicLayout variant="explore"><OrganizationListPage /></PublicLayout>} />
      <Route path={organizationRoutes.detail(':slug')} element={<PublicLayout variant="explore"><OrganizationDetailPage /></PublicLayout>} />

      {/* Clubs (public) */}
      <Route
        path={clubRoutes.list}
        element={<PublicLayout variant="explore"><Suspense fallback={<RouteFallback />}><ClubListPage /></Suspense></PublicLayout>}
      />
      <Route
        path={clubRoutes.detail(':id')}
        element={<PublicLayout variant="explore"><Suspense fallback={<RouteFallback />}><ClubDetailPage /></Suspense></PublicLayout>}
      />

      {/* Players */}
      <Route path={playerRoutes.list} element={<PublicLayout variant="explore"><PlayerListPage /></PublicLayout>} />
      <Route path={playerRoutes.detail(':slug')} element={<PublicLayout variant="explore"><PlayerDetailPage /></PublicLayout>} />
      <Route
        path={playerRoutes.create}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><PlayerCreatePage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={playerRoutes.edit(':slug')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><PlayerSettingsPage /></Suspense>
          </ProtectedRoute>
        }
      />

      {/* Competitions (public browse) */}
      <Route path={competitionRoutes.list} element={<PublicLayout variant="explore"><CompetitionListPage /></PublicLayout>} />
      <Route path={competitionRoutes.detail(':id')} element={<PublicLayout variant="explore"><CompetitionDetailPage /></PublicLayout>} />
      <Route
        path={competitionRoutes.rankings(':id')}
        element={<Suspense fallback={<RouteFallback />}><CompetitionRankingsPage /></Suspense>}
      />
      <Route
        path={competitionRoutes.suspensions(':id')}
        element={<Suspense fallback={<RouteFallback />}><CompetitionSuspensionsPage /></Suspense>}
      />

      {/* MatchCenter hub + detail pages */}
      <Route
        path={competitionRoutes.matchCenterHub(':compId')}
        element={<Suspense fallback={<RouteFallback />}><MatchCenterPage /></Suspense>}
      />
      <Route
        path={competitionRoutes.matchDetail(':compId', ':matchId')}
        element={<Suspense fallback={<RouteFallback />}><MatchDetailPage /></Suspense>}
      />
      <Route
        path={competitionRoutes.matchLineup(':compId', ':matchId')}
        element={<Suspense fallback={<RouteFallback />}><MatchLineupPage /></Suspense>}
      />
      {/* MatchReportPage: protected — only referees/admins */}
      <Route
        path={competitionRoutes.matchReport(':compId', ':matchId')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><MatchReportPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.tacticalView(':compId', ':matchId')}
        element={<Suspense fallback={<RouteFallback />}><MatchTacticalViewPage /></Suspense>}
      />

      {/* Competition management (protected) */}
      <Route
        path={competitionRoutes.create}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><CompetitionCreatePage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.settings(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><CompetitionSettingsPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.registration(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><CompetitionRegistrationPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.schedule(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><CompetitionSchedulePage /></Suspense>
          </ProtectedRoute>
        }
      />

      {/* Competition admin per-competition dashboard + admin rankings/suspensions */}
      <Route
        path={competitionRoutes.adminDashboard(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><CompetitionAdminDashboardPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.adminRankings(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><CompetitionRankingsPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.adminSuspensions(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><CompetitionSuspensionsPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.adminRegulations(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><CompetitionRegulationsPage /></Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.draw(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}><CompetitionDrawPage /></Suspense>
          </ProtectedRoute>
        }
      />
    </>
  )
}
