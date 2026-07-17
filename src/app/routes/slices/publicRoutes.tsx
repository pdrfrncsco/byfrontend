import { Navigate, Route } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { PublicLayout } from '@/app/layouts'
import { LandingPage } from '@/modules/shared/pages/LandingPage'
import { LoginPage } from '@/modules/shared/pages/LoginPage'
import { RegisterPage, RegisterProfilePage } from '@/modules/shared/pages'
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
      <Route path={sharedRoutes.register} element={<RegisterPage />} />
      <Route
        path={sharedRoutes.registerPlayer}
        element={
          <RegisterProfilePage
            profileType="player"
            title="Registo de Jogador"
            description="Crie a sua conta individual, mantenha o seu perfil atualizado e prepare o pedido de vínculo a um clube."
            submitLabel="Criar conta de Jogador"
            path={sharedRoutes.registerPlayer}
          />
        }
      />
      <Route
        path={sharedRoutes.registerClub}
        element={
          <RegisterProfilePage
            profileType="club"
            title="Registo de Clube"
            description="Crie a conta do clube para gerir a presença digital e preparar a ligação à organização correta."
            submitLabel="Criar conta de Clube"
            path={sharedRoutes.registerClub}
          />
        }
      />
      <Route
        path={sharedRoutes.registerFan}
        element={
          <RegisterProfilePage
            profileType="fan"
            title="Registo de Fan"
            description="Crie a sua conta para acompanhar equipas, competições e conteúdos da comunidade."
            submitLabel="Criar conta de Fan"
            path={sharedRoutes.registerFan}
          />
        }
      />
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
