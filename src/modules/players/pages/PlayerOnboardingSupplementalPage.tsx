import { useNavigate } from 'react-router-dom'
import { Info } from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import { useCompleteOnboardingStep, usePlayerWizard } from '../hooks'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

type SupplementalKind = 'guardian' | 'club'

const content: Record<SupplementalKind, { title: string; description: string; step: number; next: string }> = {
  guardian: { title: 'Responsável legal', description: 'Este passo é obrigatório para jogadores menores. A gestão do responsável legal será disponibilizada quando o perfil for identificado como menor.', step: 6, next: ROUTES.ONBOARDING_PLAYER_CLUB },
  club: { title: 'Ligação a um clube', description: 'A ligação a um clube é opcional. Pode enviar um pedido de vínculo a partir do portal do jogador após concluir o onboarding.', step: 7, next: ROUTES.ONBOARDING_PLAYER_REVIEW },
}

export function PlayerOnboardingSupplementalPage({ kind }: { kind: SupplementalKind }) {
  const navigate = useNavigate()
  const complete = useCompleteOnboardingStep()
  const { markStepCompleted } = usePlayerWizard()
  const item = content[kind]
  const previous = kind === 'guardian' ? ROUTES.ONBOARDING_PLAYER_IDENTITY : ROUTES.ONBOARDING_PLAYER_GUARDIAN

  const onContinue = async () => {
    markStepCompleted(kind)
    await complete.mutateAsync(kind)
    navigate(item.next)
  }

  return (
    <PlayerOnboardingLayout
      step={item.step}
      isSaving={complete.isPending}
      onNext={onContinue}
      onBack={() => navigate(previous)}
    >
      <div className="space-y-lg">
        <div>
          <h2 className="text-xl font-bold text-on-surface">{item.title}</h2>
          <p className="mt-xs text-sm text-on-surface-variant">{item.description}</p>
        </div>

        <div className="flex items-start gap-md rounded-lg border border-primary/30 bg-primary/10 p-md text-sm text-foreground">
          <Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <p>Este passo pode ser concluído agora e complementado mais tarde nas definições do jogador.</p>
        </div>
      </div>
    </PlayerOnboardingLayout>
  )
}

export function PlayerOnboardingGuardianPage() { return <PlayerOnboardingSupplementalPage kind="guardian" /> }
export function PlayerOnboardingClubPage() { return <PlayerOnboardingSupplementalPage kind="club" /> }
