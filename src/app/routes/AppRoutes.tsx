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
      <Route path={ROUTES.LOGIN} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER} element={<LoginPage />} />
      <Route path={ROUTES.REGISTER_ORGANIZATION} element={<RegisterOrganizationPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      <Route path={ROUTES.ORGANIZATIONS} element={<OrganizationListPage />} />
      <Route path="/organizations/:slug" element={<OrganizationDetailPage />} />
      <Route
        path={ROUTES.ORGANIZATION_SETTINGS}
        element={
          <ProtectedRoute>
            <OrganizationSettingsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.DASHBOARD}
        element={
          <ProtectedRoute>
            <DashboardPageSelector />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/executive"
        element={
          <ProtectedRoute>
            <ExecutiveDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/federation"
        element={
          <ProtectedRoute>
            <FederationDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/league"
        element={
          <ProtectedRoute>
            <LeagueDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/club"
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubDashboardPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_CLUB_SETTINGS}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubSettingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_CLUB_MEMBERS}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubMembersPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_CLUB_DOCUMENTS}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubDocumentsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_CLUB_SPONSORS}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubSponsorsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_CLUB_TRANSFERS}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubTransfersPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_CLUB_TRANSFERS_CREATE}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ClubTransferCreatePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/organization"
        element={
          <ProtectedRoute>
            <OrganizationDashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_ORGANIZATION_MEMBERS}
        element={
          <ProtectedRoute>
            <OrganizationMembersPage />
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS}
        element={
          <ProtectedRoute>
            <OrganizationAffiliationsPage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.ONBOARDING}
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <OrganizationStep />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/branding"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <BrandingStep />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/competition"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <CompetitionStep />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />
      <Route
        path="/onboarding/review"
        element={
          <ProtectedRoute>
            <OnboardingGuard>
              <ReviewStep />
            </OnboardingGuard>
          </ProtectedRoute>
        }
      />

      <Route
        path="/dashboard/competition"
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
        path={ROUTES.PROFILE}
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />

      <Route
        path={ROUTES.CLUBS}
        element={
          <Suspense fallback={<RouteFallback />}>
            <ClubListPage />
          </Suspense>
        }
      />
      <Route
        path="/clubs/:id"
        element={
          <Suspense fallback={<RouteFallback />}>
            <ClubDetailPage />
          </Suspense>
        }
      />

      <Route path={ROUTES.PLAYERS} element={<PlayerListPage />} />
      <Route path="/players/:slug" element={<PlayerDetailPage />} />

      <Route path={ROUTES.COMPETITIONS} element={<CompetitionListPage />} />
      <Route path="/competitions/:id" element={<CompetitionDetailPage />} />
      <Route
        path={ROUTES.COMPETITION_RANKINGS(':id')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <CompetitionRankingsPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.COMPETITION_SUSPENSIONS(':id')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <CompetitionSuspensionsPage />
          </Suspense>
        }
      />

      <Route
        path={ROUTES.MATCH_CENTER(':compId', ':matchId')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <MatchCenterPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.MATCH_LINEUP(':compId', ':matchId')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <MatchLineupPage />
          </Suspense>
        }
      />
      <Route
        path={ROUTES.MATCH_REPORT(':compId', ':matchId')}
        element={
          <Suspense fallback={<RouteFallback />}>
            <MatchReportPage />
          </Suspense>
        }
      />

      <Route
        path={ROUTES.COMPETITION_CREATE}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <CompetitionCreatePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.COMPETITION_SETTINGS(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <CompetitionSettingsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.COMPETITION_REGISTRATION(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <CompetitionRegistrationPage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.COMPETITION_SCHEDULE(':id')}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <CompetitionSchedulePage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route path="/404" element={<NotFoundPage />} />
      <Route path={ROUTES.NOT_FOUND} element={<Navigate to="/404" replace />} />
    </Routes>
  )
}
