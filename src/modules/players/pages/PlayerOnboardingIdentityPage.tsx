import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button, Card, CardContent } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

export function PlayerOnboardingIdentityPage() {
  const navigate = useNavigate()

  return (
    <PlayerOnboardingLayout step={2}>
      <Card variant="flat" className="border-outline-variant/30">
        <CardContent className="space-y-lg p-lg">
          <div className="flex items-start gap-md">
            <div className="rounded-xl bg-primary-container/20 p-sm text-primary">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <div className="space-y-xs">
              <h2 className="text-xl font-semibold text-on-surface">Identidade opcional</h2>
              <p className="text-sm text-on-surface-variant">
                Este passo deixou de bloquear o onboarding. Pode preencher os dados do documento mais tarde no dashboard do jogador.
              </p>
            </div>
          </div>

          <div className="rounded-lg border border-outline-variant/30 bg-surface-container p-md text-sm text-on-surface-variant">
            Se quiser guardar a identidade agora, abra o dashboard e use a secção de identidade para anexar frente e verso.
          </div>

          <div className="flex flex-col-reverse gap-sm sm:flex-row sm:justify-between">
            <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ONBOARDING_PLAYER_PROFILE)}>
              <ArrowLeft className="h-4 w-4" />
              Continuar onboarding
            </Button>
            <Button type="button" onClick={() => navigate(ROUTES.DASHBOARD_PLAYER_SETTINGS)}>
              Ir para o dashboard
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PlayerOnboardingLayout>
  )
}
