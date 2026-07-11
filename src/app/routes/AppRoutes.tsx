import { Suspense, lazy } from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { ProtectedRoute } from './ProtectedRoute'
import { OnboardingGuard } from './OnboardingGuard'
import { PublicLayout } from '@/app/layouts'
import { LandingPage } from '@/modules/shared/pages/LandingPage'
import { LoginPage } from '@/modules/shared/pages/LoginPage'
import { RegisterOrganizationPage } from '@/modules/shared/pages/RegisterOrganizationPage'
import { ForgotPasswordPage } from '@/modules/shared/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/modules/shared/pages/ResetPasswordPage'
import { ProfilePage } from '@/modules/shared/pages/ProfilePage'
import { NotFoundPage } from '@/modules/shared/pages/NotFoundPage'
import {
  DashboardPageSelector,
  ExecutiveDashboardPage,
  FederationDashboardPage,
  LeagueDashboardPage,
  CompetitionDashboardPage,
} from '@/modules/dashboards'
import {
  OrganizationDashboardPage,
  OrganizationListPage,
  OrganizationDetailPage,
  OrganizationSettingsPage,
  OrganizationMembersPage,
  OrganizationAffiliationsPage,
} from '@/modules/organizations'
import { OrganizationStep, BrandingStep, CompetitionStep, ReviewStep } from '@/modules/onboarding'
import { PlayerListPage, PlayerDetailPage } from '@/modules/players'
import { CompetitionListPage, CompetitionDetailPage } from '@/modules/competitions'
import { NotificationsPage } from '@/modules/notifications/pages/NotificationsPage'
import { sharedRoutes } from '@/modules/shared/routes'
import { organizationRoutes } from '@/modules/organizations/routes'
import { clubRoutes } from '@/modules/clubs/routes'
import { competitionRoutes } from '@/modules/competitions/routes'
import { dashboardRoutes } from '@/modules/dashboards/routes'
import { onboardingRoutes } from '@/modules/onboarding/routes'
import { playerRoutes } from '@/modules/players/routes'

const ClubListPage = lazy(() => import('@/modules/clubs/pages/ClubListPage'))
const ClubDetailPage = lazy(() => import('@/modules/clubs/pages/ClubDetailPage'))
const ClubDashboardPage = lazy(() => import('@/modules/clubs/pages/ClubDashboardPage'))
const ClubSettingsPage = lazy(() => import('@/modules/clubs/pages/ClubSettingsPage'))
const ClubMembersPage = lazy(() => import('@/modules/clubs/pages/ClubMembersPage'))
const ClubDocumentsPage = lazy(() => import('@/modules/clubs/pages/ClubDocumentsPage'))
const ClubSponsorsPage = lazy(() => import('@/modules/clubs/pages/ClubSponsorsPage'))
const ClubTransfersPage = lazy(() => import('@/modules/clubs/pages/ClubTransfersPage'))
const ClubTransferCreatePage = lazy(() => import('@/modules/clubs/pages/ClubTransferCreatePage'))

const CompetitionCreatePage = lazy(() => import('@/modules/competitions/pages/CompetitionCreatePage').then(m => ({ default: m.CompetitionCreatePage })))
const CompetitionSettingsPage = lazy(() => import('@/modules/competitions/pages/CompetitionSettingsPage').then(m => ({ default: m.CompetitionSettingsPage })))
const CompetitionRegistrationPage = lazy(() => import('@/modules/competitions/pages/CompetitionRegistrationPage').then(m => ({ default: m.CompetitionRegistrationPage })))
const CompetitionSchedulePage = lazy(() => import('@/modules/competitions/pages/CompetitionSchedulePage').then(m => ({ default: m.CompetitionSchedulePage })))
const CompetitionRankingsPage = lazy(() => import('@/modules/competitions/pages/CompetitionRankingsPage').then(m => ({ default: m.CompetitionRankingsPage })))
const CompetitionSuspensionsPage = lazy(() => import('@/modules/competitions/pages/CompetitionSuspensionsPage').then(m => ({ default: m.CompetitionSuspensionsPage })))
const MatchCenterPage = lazy(() => import('@/modules/competitions/pages/MatchCenterPage').then(m => ({ default: m.MatchCenterPage })))
const MatchLineupPage = lazy(() => import('@/modules/competitions/pages/MatchLineupPage').then(m => ({ default: m.MatchLineupPage })))
const MatchReportPage = lazy(() => import('@/modules/competitions/pages/MatchReportPage').then(m => ({ default: m.MatchReportPage })))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-lg text-sm text-on-surface-variant">
      Carregando página...
    </div>
  )
}

export function AppRoutes() {
  return (
    <Routes>
      <Route
        path={ROUTES.HOME}
        element={
          <PublicLayout>
            <LandingPage />
          </PublicLayout>
        }
      />
      <Route path={sharedRoutes.login} element={<LoginPage />} />
      <Route path={sharedRoutes.register} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER_ORGANIZATION} element={<RegisterOrganizationPage />} />
      <Route path={sharedRoutes.forgotPassword} element={<ForgotPasswordPage />} />
      <Route path={sharedRoutes.resetPassword} element={<ResetPasswordPage />} />

      <Route path={organizationRoutes.list} element={<OrganizationListPage />} />
      <Route path={organizationRoutes.detail(':slug')} element={<OrganizationDetailPage />} />
      <Route
        path={organizationRoutes.settings}
        element={
          <ProtectedRoute>
            <OrganizationSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={dashboardRoutes.root}
        element={
          <ProtectedRoute>
            <DashboardPageSelector />
          </ProtectedRoute>
        }
      />
      <Route
        path={dashboardRoutes.executive}
        element={
          <ProtectedRoute>
            <ExecutiveDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={dashboardRoutes.federation}
        element={
          <ProtectedRoute>
            <FederationDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={dashboardRoutes.league}
        element={
          <ProtectedRoute>
            <LeagueDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={dashboardRoutes.club}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubDashboardPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.settings}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubSettingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.members}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubMembersPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.documents}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubDocumentsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.sponsors}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubSponsorsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.transfers}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubTransfersPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={clubRoutes.transferCreate}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubTransferCreatePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={organizationRoutes.dashboard}
        element={
          <ProtectedRoute>
            <OrganizationDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={organizationRoutes.members}
        element={
          <ProtectedRoute>
            <OrganizationMembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={organizationRoutes.affiliations}
        element={
          <ProtectedRoute>
            <OrganizationAffiliationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={onboardingRoutes.root}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <OrganizationStep />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path={onboardingRoutes.branding}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <BrandingStep />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path={onboardingRoutes.competition}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <CompetitionStep />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path={onboardingRoutes.review}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ReviewStep />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path={dashboardRoutes.competition}
        element={
          <ProtectedRoute>
            <CompetitionDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={sharedRoutes.profile}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={clubRoutes.list}
        element={
          <Suspense fallback={<RouteFallback />}>
            <ClubListPage />
          </Suspense>
        }
      />
      <Route
        path={clubRoutes.detail(':id')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <ClubDetailPage />
          </Suspense>
        }
      />

      <Route path={playerRoutes.list} element={<PlayerListPage />} />
      <Route path={playerRoutes.detail(':slug')} element={<PlayerDetailPage />} />

      <Route path={competitionRoutes.list} element={<CompetitionListPage />} />
      <Route path={competitionRoutes.detail(':id')} element={<CompetitionDetailPage />} />
      <Route
        path={competitionRoutes.rankings(':id')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <CompetitionRankingsPage />
          </Suspense>
        }
      />
      <Route
        path={competitionRoutes.suspensions(':id')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <CompetitionSuspensionsPage />
          </Suspense>
        }
      />

      <Route
        path={competitionRoutes.matchCenter(':compId', ':matchId')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <MatchCenterPage />
          </Suspense>
        }
      />
      <Route
        path={competitionRoutes.matchLineup(':compId', ':matchId')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <MatchLineupPage />
          </Suspense>
        }
      />
      <Route
        path={competitionRoutes.matchReport(':compId', ':matchId')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <MatchReportPage />
          </Suspense>
        }
      />

      <Route
        path={competitionRoutes.create}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <CompetitionCreatePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.settings(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <CompetitionSettingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.registration(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <CompetitionRegistrationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={competitionRoutes.schedule(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <CompetitionSchedulePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route path={sharedRoutes.notFoundPage} element={<NotFoundPage />} />
      <Route path={sharedRoutes.notFound} element={<Navigate to={sharedRoutes.notFoundPage} replace />} />
    </Routes>
  )
}
