import { Suspense, lazy } from 'react'
import { Route } from 'react-router-dom'
import { ProtectedRoute } from '../ProtectedRoute'
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
  import('@/modules/players/pages/PlayerCreatePage').then(m => ({ default: m.PlayerCreatePage })),
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
const CompetitionRankingsPage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionRankingsPage').then(m => ({ default: m.CompetitionRankingsPage })),
)
const CompetitionSuspensionsPage = lazy(() =>
  import('@/modules/competitions/pages/CompetitionSuspensionsPage').then(m => ({ default: m.CompetitionSuspensionsPage })),
)
const MatchCenterPage = lazy(() =>
  import('@/modules/competitions/pages/MatchCenterPage').then(m => ({ default: m.MatchCenterPage })),
)
const MatchLineupPage = lazy(() =>
  import('@/modules/competitions/pages/MatchLineupPage').then(m => ({ default: m.MatchLineupPage })),
)
const MatchReportPage = lazy(() =>
  import('@/modules/competitions/pages/MatchReportPage').then(m => ({ default: m.MatchReportPage })),
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
      <Route path={organizationRoutes.list} element={<OrganizationListPage />} />
      <Route path={organizationRoutes.detail(':slug')} element={<OrganizationDetailPage />} />

      {/* Clubs (public) */}
      <Route
        path={clubRoutes.list}
        element={<Suspense fallback={<RouteFallback />}><ClubListPage /></Suspense>}
      />
      <Route
        path={clubRoutes.detail(':id')}
        element={<Suspense fallback={<RouteFallback />}><ClubDetailPage /></Suspense>}
      />

      {/* Players */}
      <Route path={playerRoutes.list} element={<PlayerListPage />} />
      <Route path={playerRoutes.detail(':slug')} element={<PlayerDetailPage />} />
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
      <Route path={competitionRoutes.list} element={<CompetitionListPage />} />
      <Route path={competitionRoutes.detail(':id')} element={<CompetitionDetailPage />} />
      <Route
        path={competitionRoutes.rankings(':id')}
        element={<Suspense fallback={<RouteFallback />}><CompetitionRankingsPage /></Suspense>}
      />
      <Route
        path={competitionRoutes.suspensions(':id')}
        element={<Suspense fallback={<RouteFallback />}><CompetitionSuspensionsPage /></Suspense>}
      />

      {/* Match sub-pages */}
      <Route
        path={competitionRoutes.matchCenter(':compId', ':matchId')}
        element={<Suspense fallback={<RouteFallback />}><MatchCenterPage /></Suspense>}
      />
      <Route
        path={competitionRoutes.matchLineup(':compId', ':matchId')}
        element={<Suspense fallback={<RouteFallback />}><MatchLineupPage /></Suspense>}
      />
      <Route
        path={competitionRoutes.matchReport(':compId', ':matchId')}
        element={<Suspense fallback={<RouteFallback />}><MatchReportPage /></Suspense>}
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
    </>
  )
}
