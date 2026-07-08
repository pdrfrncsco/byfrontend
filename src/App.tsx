import { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'sonner'
import { AppProvider } from '@/app/providers'
import { ProtectedRoute, OnboardingGuard } from '@/app/routes'
import { LandingPage } from '@/modules/shared/pages/LandingPage'
import { LoginPage } from '@/modules/shared/pages/LoginPage'
import { RegisterOrganizationPage } from '@/modules/shared/pages/RegisterOrganizationPage'
import { ForgotPasswordPage } from '@/modules/shared/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/modules/shared/pages/ResetPasswordPage'
import { ProfilePage } from '@/modules/shared/pages/ProfilePage'
import {
  DashboardPageSelector,
  ExecutiveDashboardPage,
  FederationDashboardPage,
  LeagueDashboardPage,
  CompetitionDashboardPage
} from '@/modules/dashboards'
import { OrganizationDashboardPage } from '@/modules/organizations'
import { OrganizationListPage, OrganizationDetailPage, OrganizationSettingsPage } from '@/modules/organizations'
import { OrganizationMembersPage, OrganizationAffiliationsPage } from '@/modules/organizations'
import { OrganizationStep, BrandingStep, CompetitionStep, ReviewStep } from '@/modules/onboarding'
import { NotFoundPage } from '@/modules/shared/pages/NotFoundPage'
import { PlayerListPage, PlayerDetailPage } from '@/modules/players'
import { CompetitionListPage, CompetitionDetailPage } from '@/modules/competitions'
import { PublicLayout } from '@/app/layouts'
import { NotificationsPage } from '@/modules/notifications/pages/NotificationsPage'

const ClubListPage = lazy(() => import('@/modules/clubs/pages/ClubListPage'))
const ClubDetailPage = lazy(() => import('@/modules/clubs/pages/ClubDetailPage'))
const ClubDashboardPage = lazy(() => import('@/modules/clubs/pages/ClubDashboardPage'))
const ClubSettingsPage = lazy(() => import('@/modules/clubs/pages/ClubSettingsPage'))
const ClubMembersPage = lazy(() => import('@/modules/clubs/pages/ClubMembersPage'))
const ClubDocumentsPage = lazy(() => import('@/modules/clubs/pages/ClubDocumentsPage'))
const ClubSponsorsPage = lazy(() => import('@/modules/clubs/pages/ClubSponsorsPage'))
const ClubTransfersPage = lazy(() => import('@/modules/clubs/pages/ClubTransfersPage'))

function RouteFallback() {
  return (
    <div className="flex min-h-[40vh] items-center justify-center px-lg text-sm text-on-surface-variant">
      Carregando página...
    </div>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#0b1c30',
              border: '1px solid #26364a',
              color: '#d3e4fe',
            },
          }}
        />
        <Routes>
          {/* Public Routes */}
          <Route
            path="/"
            element={
              <PublicLayout>
                <LandingPage />
              </PublicLayout>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<LoginPage />} />
          <Route path="/register/organization" element={<RegisterOrganizationPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />

          {/* Organization Routes */}
          <Route path="/organizations" element={<OrganizationListPage />} />
          <Route path="/organizations/:slug" element={<OrganizationDetailPage />} />
          <Route
            path="/organization/settings"
            element={
              <ProtectedRoute>
                <OrganizationSettingsPage />
              </ProtectedRoute>
            }
          />

          {/* Protected Routes */}
          <Route
            path="/dashboard"
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
            path="/dashboard/club/settings"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <ClubSettingsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/club/members"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <ClubMembersPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/club/documents"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <ClubDocumentsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/club/sponsors"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <ClubSponsorsPage />
                </Suspense>
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/club/transfers"
            element={
              <ProtectedRoute>
                <Suspense fallback={<RouteFallback />}>
                  <ClubTransfersPage />
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
            path="/dashboard/organization/members"
            element={
              <ProtectedRoute>
                <OrganizationMembersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/dashboard/organization/affiliations"
            element={
              <ProtectedRoute>
                <OrganizationAffiliationsPage />
              </ProtectedRoute>
            }
          />

          {/* Onboarding (protected + gate) */}
          <Route
            path="/onboarding"
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
            path="/notifications"
            element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <ProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Clubs (Public) */}
          <Route
            path="/clubs"
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

          {/* Players (Public) */}
          <Route path="/players" element={<PlayerListPage />} />
          <Route path="/players/:slug" element={<PlayerDetailPage />} />

          {/* Competitions (Public) */}
          <Route path="/competitions" element={<CompetitionListPage />} />
          <Route path="/competitions/:id" element={<CompetitionDetailPage />} />

          {/* 404 Fallback */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
