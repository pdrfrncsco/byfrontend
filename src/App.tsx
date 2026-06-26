import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/app/providers'
import { LandingPage } from '@/modules/shared/pages/LandingPage'
import { LoginPage } from '@/modules/shared/pages/LoginPage'
import { 
  DashboardPageSelector,
  ExecutiveDashboardPage,
  FederationDashboardPage,
  LeagueDashboardPage,
  ClubDashboardPage,
  CompetitionDashboardPage
} from '@/modules/dashboards'
import { NotFoundPage } from '@/modules/shared/pages/NotFoundPage'
import { PublicLayout } from '@/app/layouts'

function App() {
  return (
    <BrowserRouter>
      <AppProvider>
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

          {/* Protected Routes */}
          <Route path="/dashboard" element={<DashboardPageSelector />} />
          <Route path="/dashboard/executive" element={<ExecutiveDashboardPage />} />
          <Route path="/dashboard/federation" element={<FederationDashboardPage />} />
          <Route path="/dashboard/league" element={<LeagueDashboardPage />} />
          <Route path="/dashboard/club" element={<ClubDashboardPage />} />
          <Route path="/dashboard/competition" element={<CompetitionDashboardPage />} />



          {/* 404 Fallback */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
