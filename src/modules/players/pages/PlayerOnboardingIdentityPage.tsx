import { useNavigate } from 'react-router-dom'
import { ShieldCheck } from 'lucide-react'
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
      <div className="space-y-lg">
        <div className="flex items-center gap-sm">
          <ShieldCheck className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-xl font-bold text-on-surface">Verificação de Identidade</h2>
            <p className="text-sm text-on-surface-variant">
              Pode enviar o seu documento oficial de identificação agora ou mais tarde.
            </p>
          </div>
        </div>

        <div className="rounded-lg border border-border bg-muted/40 p-md text-sm text-muted-foreground">
          A verificação de identidade é necessária para competições oficiais, mas pode ser completada posteriormente através do seu perfil.
        </div>
      </div>
    </PlayerOnboardingLayout>
  )
}
