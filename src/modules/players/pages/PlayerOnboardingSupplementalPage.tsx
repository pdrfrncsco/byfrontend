import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft, Info } from 'lucide-react'
import { Button } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { useCompleteOnboardingStep } from '../hooks'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

type SupplementalKind = 'guardian' | 'documents' | 'club'

const content: Record<SupplementalKind, { title: string; description: string; step: number; next: string; nextLabel: string }> = {
  guardian: { title: 'Responsável legal', description: 'Este passo é obrigatório para jogadores menores. A gestão do responsável legal será disponibilizada quando o perfil for identificado como menor.', step: 6, next: ROUTES.ONBOARDING_PLAYER_DOCUMENTS, nextLabel: 'Continuar para documentos' },
  documents: { title: 'Documentos adicionais', description: 'Pode adicionar contratos, licenças e certificados no portal depois de concluir o onboarding. O documento de identidade já foi tratado no passo anterior.', step: 7, next: ROUTES.ONBOARDING_PLAYER_CLUB, nextLabel: 'Continuar para clube' },
  club: { title: 'Ligação a um clube', description: 'A ligação a um clube é opcional. Pode enviar um pedido de vínculo a partir do portal do jogador após concluir o onboarding.', step: 8, next: ROUTES.ONBOARDING_PLAYER_REVIEW, nextLabel: 'Continuar para revisão' },
}

export function PlayerOnboardingSupplementalPage({ kind }: { kind: SupplementalKind }) {
  const navigate = useNavigate()
  const complete = useCompleteOnboardingStep()
  const item = content[kind]
  const previous = kind === 'guardian' ? ROUTES.ONBOARDING_PLAYER_CONTACT : kind === 'documents' ? ROUTES.ONBOARDING_PLAYER_GUARDIAN : ROUTES.ONBOARDING_PLAYER_DOCUMENTS

  const onContinue = async () => {
    await complete.mutateAsync(kind)
    navigate(item.next)
  }

  return (
    <PlayerOnboardingLayout step={item.step} maxReachedStep={item.step}>
      <div className="space-y-lg">
        <div><h2 className="text-xl font-semibold text-on-surface">{item.title}</h2><p className="mt-xs text-sm text-on-surface-variant">{item.description}</p></div>
        <div className="flex items-start gap-md rounded-lg border border-primary/30 bg-primary-container/10 p-md text-sm text-on-surface-variant"><Info className="mt-0.5 h-5 w-5 shrink-0 text-primary" /><p>Este passo pode ser concluído agora e complementado mais tarde nas definições do jogador.</p></div>
        <div className="flex justify-between gap-sm"><Button type="button" variant="secondary" onClick={() => navigate(previous)}><ArrowLeft className="h-4 w-4" />Voltar</Button><Button type="button" onClick={onContinue} loading={complete.isPending}>{item.nextLabel}<ArrowRight className="h-4 w-4" /></Button></div>
      </div>
    </PlayerOnboardingLayout>
  )
}

export function PlayerOnboardingGuardianPage() { return <PlayerOnboardingSupplementalPage kind="guardian" /> }
export function PlayerOnboardingDocumentsPage() { return <PlayerOnboardingSupplementalPage kind="documents" /> }
export function PlayerOnboardingClubPage() { return <PlayerOnboardingSupplementalPage kind="club" /> }
