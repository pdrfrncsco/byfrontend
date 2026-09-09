import { Suspense, lazy } from 'react'
import { Navigate, Route } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { PublicLayout } from '@/app/layouts'
import { sharedRoutes } from '@/modules/shared/routes'
import { ProtectedRoute } from '../ProtectedRoute'
import { PageSkeleton } from '@/components/ui/page-skeleton'

// Lazy loaded pages
const LandingPage = lazy(() => import('@/modules/shared/pages/LandingPage').then(m => ({ default: m.LandingPage })))
const ExplorePage = lazy(() => import('@/modules/shared/pages/ExplorePage').then(m => ({ default: m.ExplorePage })))
const LoginPage = lazy(() => import('@/modules/auth/pages').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@/modules/auth/pages').then(m => ({ default: m.RegisterPage })))
const RegisterProfilePage = lazy(() => import('@/modules/auth/pages').then(m => ({ default: m.RegisterProfilePage })))
const RegisterOrganizationPage = lazy(() => import('@/modules/shared/pages/RegisterOrganizationPage').then(m => ({ default: m.RegisterOrganizationPage })))
const ForgotPasswordPage = lazy(() => import('@/modules/auth/pages').then(m => ({ default: m.ForgotPasswordPage })))
const ResetPasswordPage = lazy(() => import('@/modules/auth/pages').then(m => ({ default: m.ResetPasswordPage })))
const ProfilePage = lazy(() => import('@/modules/shared/pages/ProfilePage').then(m => ({ default: m.ProfilePage })))
const NotFoundPage = lazy(() => import('@/modules/shared/pages/NotFoundPage').then(m => ({ default: m.NotFoundPage })))
const NotificationsPage = lazy(() => import('@/modules/notifications/pages/NotificationsPage').then(m => ({ default: m.NotificationsPage })))

function RouteFallback() {
  return (
    <div className="flex min-h-[50vh] w-full items-center justify-center p-lg">
      <PageSkeleton variant="card" />
    </div>
  )
}

export function publicRouteElements() {
  return (
    <>
      <Route
        path={ROUTES.HOME}
        element={
          <PublicLayout>
            <Suspense fallback={<RouteFallback />}>
              <LandingPage />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route
        path={ROUTES.PUBLIC_EXPLORE}
        element={
          <PublicLayout variant="explore">
            <Suspense fallback={<RouteFallback />}>
              <ExplorePage />
            </Suspense>
          </PublicLayout>
        }
      />
      <Route path={sharedRoutes.login} element={<Suspense fallback={<RouteFallback />}><LoginPage /></Suspense>} />
      <Route path={sharedRoutes.register} element={<Suspense fallback={<RouteFallback />}><RegisterPage /></Suspense>} />
      <Route
        path={sharedRoutes.registerPlayer}
        element={
          <Suspense fallback={<RouteFallback />}>
            <RegisterProfilePage
              profileType="player"
              title="Registo de Jogador"
              description="Crie a sua conta individual, mantenha o seu perfil atualizado e prepare o pedido de vínculo a um clube."
              submitLabel="Criar conta de Jogador"
              path={sharedRoutes.registerPlayer}
            />
          </Suspense>
        }
      />
      <Route
        path={sharedRoutes.registerClub}
        element={
          <Suspense fallback={<RouteFallback />}>
            <RegisterProfilePage
              profileType="club"
              title="Registo de Clube"
              description="Crie a conta do clube para gerir a presença digital e preparar a ligação à organização correta."
              submitLabel="Criar conta de Clube"
              path={sharedRoutes.registerClub}
            />
          </Suspense>
        }
      />
      <Route
        path={sharedRoutes.registerFan}
        element={
          <Suspense fallback={<RouteFallback />}>
            <RegisterProfilePage
              profileType="fan"
              title="Registo de Fan"
              description="Crie a sua conta para acompanhar equipas, competições e conteúdos da comunidade."
              submitLabel="Criar conta de Fan"
              path={sharedRoutes.registerFan}
            />
          </Suspense>
        }
      />
      <Route path={ROUTES.REGISTER_ORGANIZATION} element={<Suspense fallback={<RouteFallback />}><RegisterOrganizationPage /></Suspense>} />
      <Route path={sharedRoutes.forgotPassword} element={<Suspense fallback={<RouteFallback />}><ForgotPasswordPage /></Suspense>} />
      <Route path={sharedRoutes.resetPassword} element={<Suspense fallback={<RouteFallback />}><ResetPasswordPage /></Suspense>} />

      <Route
        path={sharedRoutes.profile}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <ProfilePage />
            </Suspense>
          </ProtectedRoute>
        }
      />
      <Route
        path={ROUTES.NOTIFICATIONS}
        element={
          <ProtectedRoute>
            <Suspense fallback={<RouteFallback />}>
              <NotificationsPage />
            </Suspense>
          </ProtectedRoute>
        }
      />

      <Route path={sharedRoutes.notFoundPage} element={<Suspense fallback={<RouteFallback />}><NotFoundPage /></Suspense>} />
      <Route path={sharedRoutes.notFound} element={<Navigate to={sharedRoutes.notFoundPage} replace />} />
    </>
  )
}
