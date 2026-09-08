import React, { useEffect, useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { CheckCircle2, Rocket, Building2, Palette, Trophy, Loader2 } from 'lucide-react'

import OnboardingLayout from './OnboardingLayout'
import { useOrganizationWizard } from '../hooks/useOrganizationWizard'
import { onboardingRoutes } from '../routes'
import { ROUTES } from '@/constants/routes'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ReviewStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { draftData, setStep, markStepCompleted } = useOrganizationWizard()
  const [isLaunching, setIsLaunching] = useState(false)
  const [isLaunched, setIsLaunched] = useState(false)

  useEffect(() => {
    setStep(3) // 0-based index: step 3 is Review
  }, [setStep])

  const org = draftData.organization
  const brand = draftData.branding
  const comp = draftData.competition

  const canLaunch = !!(org?.name && org?.type && org?.location)

  const handleLaunch = async () => {
    if (!canLaunch) return
    setIsLaunching(true)
    
    // Simulate API call to publish everything
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      // After success
      setIsLaunched(true)
      markStepCompleted('review')
    } catch (error) {
      console.error(error)
    } finally {
      setIsLaunching(false)
    }
  }

  const onNext = () => {
    if (isLaunched) {
      navigate(ROUTES.DASHBOARD)
    } else {
      handleLaunch()
    }
  }

  const onBack = () => navigate(onboardingRoutes.competition)

  return (
    <OnboardingLayout
      canGoBack={!isLaunched}
      canGoForward={canLaunch || isLaunched}
      isLastStep={true}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-lg">
        <div>
          <span className="bg-primary/20 text-primary px-sm py-1 rounded-full font-label-sm uppercase tracking-widest">
            {t('onboarding.review.badge', 'Revisão Final')}
          </span>
          <h2 className="font-display-lg text-display-lg text-on-surface mt-sm mb-xs">
            {t('onboarding.review.title', 'Quase lá.')}
          </h2>
          <p className="text-on-surface-variant max-w-2xl text-body-md">
            {t('onboarding.review.subtitle', 'Revise as configurações do seu ecossistema digital antes do lançamento oficial.')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
          {/* Organization Summary */}
          <Card className="p-md rounded-xl bg-surface-container-low border-outline/10">
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-sm">
                <Building2 className="w-5 h-5 text-primary" />
                <h3 className="font-title-md text-title-md">{t('onboarding.review.orgTitle', 'Organização')}</h3>
              </div>
              <Link to={onboardingRoutes.root} className="text-primary hover:underline text-label-sm">
                {t('common.edit', 'Editar')}
              </Link>
            </div>
            <div className="space-y-sm text-body-sm">
              <p><span className="text-on-surface-variant">Nome:</span> {org?.name || '—'}</p>
              <p><span className="text-on-surface-variant">Tipo:</span> {org?.type || '—'}</p>
              <p><span className="text-on-surface-variant">Local:</span> {org?.location || '—'}</p>
            </div>
          </Card>

          {/* Branding Summary */}
          <Card className="p-md rounded-xl bg-surface-container-low border-outline/10">
            <div className="flex justify-between items-start mb-md">
              <div className="flex items-center gap-sm">
                <Palette className="w-5 h-5 text-tertiary" />
                <h3 className="font-title-md text-title-md">{t('onboarding.review.brandingTitle', 'Identidade')}</h3>
              </div>
              <Link to={onboardingRoutes.branding} className="text-primary hover:underline text-label-sm">
                {t('common.edit', 'Editar')}
              </Link>
            </div>
            <div className="flex gap-sm">
              <div className="w-10 h-10 rounded shadow-sm border border-outline/10" style={{ backgroundColor: brand?.primaryColor }} />
              <div className="w-10 h-10 rounded shadow-sm border border-outline/10" style={{ backgroundColor: brand?.secondaryColor }} />
            </div>
          </Card>
        </div>

        {/* Launch Banner */}
        <Card className="rounded-xl border border-primary/20 p-xl flex flex-col items-center text-center bg-surface-container mt-lg">
          <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mb-lg">
            {isLaunched ? (
              <CheckCircle2 className="w-10 h-10 text-primary" />
            ) : (
              <Rocket className="w-10 h-10 text-primary" />
            )}
          </div>
          <h3 className="font-headline-lg mb-sm">{t('onboarding.review.launchTitle', 'Lançar Plataforma')}</h3>
          <p className="text-on-surface-variant mb-xl max-w-lg">
            {t('onboarding.review.launchDesc', 'Ao confirmar, os dados base ficarão ativos no ecossistema e poderá começar a gerir os seus clubes e atletas.')}
          </p>
          
          <Button
            size="lg"
            onClick={onNext}
            disabled={!canLaunch || isLaunching || isLaunched}
            className="px-xl"
          >
            {isLaunching ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Lançando...</>
            ) : isLaunched ? (
              'Lançamento Concluído'
            ) : (
              'Confirmar e Lançar'
            )}
          </Button>

          {!canLaunch && !isLaunched && (
            <p className="text-label-sm text-error mt-md">
              Preencha os dados da organização (Passo 1) para poder lançar.
            </p>
          )}
        </Card>
      </div>
    </OnboardingLayout>
  )
}
