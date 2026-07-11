import { Navigate, Route } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { PublicLayout } from '@/app/layouts'
import { LandingPage } from '@/modules/shared/pages/LandingPage'
import { LoginPage } from '@/modules/shared/pages/LoginPage'
import { RegisterOrganizationPage } from '@/modules/shared/pages/RegisterOrganizationPage'
import { ForgotPasswordPage } from '@/modules/shared/pages/ForgotPasswordPage'
import { ResetPasswordPage } from '@/modules/shared/pages/ResetPasswordPage'
import { ProfilePage } from '@/modules/shared/pages/ProfilePage'
import { NotFoundPage } from '@/modules/shared/pages/NotFoundPage'
import { NotificationsPage } from '@/modules/notifications/pages/NotificationsPage'
import { sharedRoutes } from '@/modules/shared/routes'
import { ProtectedRoute } from '../ProtectedRoute'

export function publicRouteElements() {
  return (
    <>
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

      <Route
        path={sharedRoutes.profile}
        element={
          <ProtectedRoute>
            <ProfilePage />
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

      <Route path={sharedRoutes.notFoundPage} element={<NotFoundPage />} />
      <Route path={sharedRoutes.notFound} element={<Navigate to={sharedRoutes.notFoundPage} replace />} />
    </>
  )
}
