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
  ClubDashboardPage,
  CompetitionDashboardPage
} from '@/modules/dashboards'
import { OrganizationDashboardPage } from '@/modules/organizations'
import { OrganizationListPage, OrganizationDetailPage, OrganizationSettingsPage } from '@/modules/organizations'
import { OrganizationStep, BrandingStep, CompetitionStep, ReviewStep } from '@/modules/onboarding'
import { NotFoundPage } from '@/modules/shared/pages/NotFoundPage'
import { ClubListPage, ClubDetailPage } from '@/modules/clubs'
import { PlayerListPage, PlayerDetailPage } from '@/modules/players'
import { CompetitionListPage, CompetitionDetailPage } from '@/modules/competitions'
import { PublicLayout } from '@/app/layouts'
import { NotificationsPage } from '@/modules/notifications/pages/NotificationsPage'

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
                <ClubDashboardPage />
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
          <Route path="/clubs" element={<ClubListPage />} />
          <Route path="/clubs/:id" element={<ClubDetailPage />} />

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
