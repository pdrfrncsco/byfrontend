import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, ShieldCheck } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'
import { usePlayerWizard } from '../hooks'

export function PlayerOnboardingIdentityPage() {
  const navigate = useNavigate()
  const { markStepCompleted } = usePlayerWizard()

  const handleNext = () => {
    markStepCompleted('identity')
    navigate(ROUTES.ONBOARDING_PLAYER_GUARDIAN)
  }

  return (
    <PlayerOnboardingLayout
      step={5}
      onNext={handleNext}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER_CONTACT)}
    >
      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex items-center gap-sm">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <div>
              <CardTitle className="text-xl font-bold">Verificação de Identidade</CardTitle>
              <CardDescription>
                Pode enviar o seu documento oficial de identificação agora ou mais tarde.
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-md">
          <div className="rounded-lg border border-border bg-muted/40 p-md text-sm text-muted-foreground">
            A verificação de identidade é necessária para competições oficiais, mas pode ser completada posteriormente através do seu perfil.
          </div>

          <div className="flex justify-between pt-md">
            <Button type="button" variant="outline" onClick={() => navigate(ROUTES.ONBOARDING_PLAYER_CONTACT)}>
              <ArrowLeft className="mr-xs h-4 w-4" />
              Voltar
            </Button>
            <Button type="button" onClick={handleNext}>
              Continuar
              <ArrowRight className="ml-xs h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </PlayerOnboardingLayout>
  )
}
