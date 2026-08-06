import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle, Users, Trophy, ExternalLink } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Card, CardContent, CardHeader, CardTitle } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { playerRoutes } from '../../routes'

export function PlayerOnboardingCompletePage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const handleLinkClub = () => {
    // Navigate to club link request page within onboarding flow
    navigate(playerRoutes.linkClub)
  }

  const handleExplore = () => navigate(ROUTES.COMPETITIONS)
  const handleViewProfile = () => navigate(playerRoutes.dashboard)

  return (
    <DashboardLayout
      title={t('players.onboarding.complete.title', 'Perfil criado com sucesso!')}
      subtitle={t('players.onboarding.complete.subtitle', 'O seu perfil está pronto. Escolha o que deseja fazer a seguir.')}
      dashboardType="player"
      sidebarLinks={[]}
    >
      <div className="max-w-4xl mx-auto space-y-lg">
        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle className="flex items-center gap-sm">
              <CheckCircle className="h-6 w-6 text-primary" />
              {t('players.onboarding.complete.header', 'Tudo pronto!')}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid gap-md md:grid-cols-3 items-center">
            <div className="md:col-span-2 space-y-md">
              <p className="text-on-surface">{t('players.onboarding.complete.copy', 'O seu perfil foi criado com sucesso. Pode agora solicitar ligação a um clube, explorar competições ou ver o seu perfil público.')}</p>

              <div className="flex flex-wrap gap-sm">
                <Button variant="primary" onClick={handleLinkClub}>
                  <Users className="h-4 w-4" />
                  {t('players.onboarding.complete.linkClub', 'Solicitar vínculo a um clube')}
                </Button>

                <Button variant="ghost" onClick={handleExplore}>
                  <Trophy className="h-4 w-4" />
                  {t('players.onboarding.complete.explore', 'Explorar competições')}
                </Button>

                <Button variant="outline" onClick={handleViewProfile}>
                  <ExternalLink className="h-4 w-4" />
                  {t('players.onboarding.complete.viewProfile', 'Ver meu perfil')}
                </Button>
              </div>
            </div>

            <div className="hidden md:block">
              <svg width="220" height="220" viewBox="0 0 220 220" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full">
                <rect width="220" height="220" rx="24" fill="#0B1C30" />
                <circle cx="110" cy="80" r="36" fill="#1E3A8A" />
                <path d="M70 140c10-12 26-20 40-20s30 8 40 20" stroke="#60A5FA" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M100 70l10 10 20-20" stroke="#34D399" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
