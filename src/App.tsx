import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from '@/app/providers'
import { LandingPage } from '@/modules/shared/pages/LandingPage'
import { LoginPage } from '@/modules/shared/pages/LoginPage'
import { DashboardPage } from '@/modules/shared/pages/DashboardPage'
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

          {/* Protected Routes - TODO */}
          <Route path="/dashboard" element={<DashboardPage />} />

          {/* 404 Fallback */}
          <Route path="/404" element={<NotFoundPage />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Routes>
      </AppProvider>
    </BrowserRouter>
  )
}

export default App
