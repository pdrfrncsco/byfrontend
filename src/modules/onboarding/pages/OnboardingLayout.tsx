import React from 'react'
import { useNavigate } from 'react-router-dom'
import { WizardShell, type WizardStep } from '@/components/ui/wizard'
import { useOrganizationWizard } from '../hooks/useOrganizationWizard'
import { useTranslation } from 'react-i18next'

interface Props {
  children: React.ReactNode
  onBack?: () => void
  onNext?: () => void
  onSaveDraft?: () => void
  canGoBack?: boolean
  canGoForward?: boolean
  isLastStep?: boolean
}

export default function OnboardingLayout({ 
  children,
  onBack,
  onNext,
  onSaveDraft,
  canGoBack,
  canGoForward,
  isLastStep
}: Props) {
  const { t } = useTranslation()
  const { currentStepIndex, completedSteps, isSaving, lastSavedAt } = useOrganizationWizard()

  const wizardSteps: WizardStep[] = [
    { id: 'organization', label: t('onboarding.organization.stepLabel', 'Informação') },
    { id: 'branding', label: t('onboarding.branding.stepLabel', 'Identidade') },
    { id: 'competition', label: t('onboarding.competition.stepLabel', 'Competição') },
    { id: 'review', label: t('onboarding.review.stepLabel', 'Revisão') },
  ]

  return (
    <WizardShell
      title={t('onboarding.title', 'Setup da Organização')}
      subtitle={t('onboarding.subtitle', 'Configure os dados base para a sua entidade.')}
      steps={wizardSteps}
      currentStepIndex={currentStepIndex}
      completedSteps={completedSteps}
      isSaving={isSaving}
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
