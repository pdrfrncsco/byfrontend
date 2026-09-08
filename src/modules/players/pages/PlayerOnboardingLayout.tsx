import { ReactNode } from 'react'
import { WizardShell, type WizardStep } from '@/components/ui/wizard'
import { usePlayerWizard } from '../hooks/usePlayerWizard'
import { useTranslation } from 'react-i18next'

interface PlayerOnboardingLayoutProps {
  children: ReactNode
  step: number
  onBack?: () => void
  onNext?: () => void
  onSaveDraft?: () => void
  canGoBack?: boolean
  canGoForward?: boolean
  isLastStep?: boolean
  isSaving?: boolean
}

export function PlayerOnboardingLayout({
  children,
  step,
  onBack,
  onNext,
  onSaveDraft,
  canGoBack = true,
  canGoForward = true,
  isLastStep = false,
  isSaving,
}: PlayerOnboardingLayoutProps) {
  const { t } = useTranslation()
  const { completedSteps, isSaving: storeIsSaving, lastSavedAt } = usePlayerWizard()

  const wizardSteps: WizardStep[] = [
    { id: 'account', label: t('playerOnboarding.steps.account', 'Conta') },
    { id: 'personal', label: t('playerOnboarding.steps.personal', 'Dados Pessoais') },
    { id: 'football', label: t('playerOnboarding.steps.football', 'Futebol') },
    { id: 'contact', label: t('playerOnboarding.steps.contact', 'Contacto') },
    { id: 'identity', label: t('playerOnboarding.steps.identity', 'Identidade') },
    { id: 'guardian', label: t('playerOnboarding.steps.guardian', 'Responsável') },
    { id: 'club', label: t('playerOnboarding.steps.club', 'Clube') },
    { id: 'review', label: t('playerOnboarding.steps.review', 'Revisão') },
  ]

  return (
    <WizardShell
      title={t('playerOnboarding.title', 'Perfil de Atleta')}
      subtitle={t('playerOnboarding.subtitle', 'Complete os seus dados essenciais para ativar o portal de jogador.')}
      steps={wizardSteps}
      currentStepIndex={step - 1}
      completedSteps={completedSteps}
      isSaving={isSaving ?? storeIsSaving}
      lastSavedAt={lastSavedAt}
      canGoBack={canGoBack}
      canGoForward={canGoForward}
      isLastStep={isLastStep}
      onBack={onBack}
      onNext={onNext}
      onSaveDraft={onSaveDraft}
    >
      {children}
    </WizardShell>
  )
}
