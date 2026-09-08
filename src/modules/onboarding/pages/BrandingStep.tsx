import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Upload } from 'lucide-react'

import OnboardingLayout from './OnboardingLayout'
import { useOrganizationWizard } from '../hooks/useOrganizationWizard'
import { useAutoSave } from '@/components/ui/wizard'
import { brandingStepSchema } from '../schemas/onboarding.schemas'
import { onboardingRoutes } from '../routes'

import { Input } from '@/components/ui/input'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

type BrandingFormValues = z.infer<typeof brandingStepSchema>

export default function BrandingStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { draftData, updateData, setStep, markStepCompleted } = useOrganizationWizard()

  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingStepSchema),
    defaultValues: {
      primaryColor: draftData.branding?.primaryColor || '#0a2342',
      secondaryColor: draftData.branding?.secondaryColor || '#e63946',
      logoUrl: draftData.branding?.logoUrl || '',
    },
    mode: 'onChange'
  })

  useEffect(() => {
    setStep(1) // 0-based index: step 1 is Branding
  }, [setStep])

  const watchedValues = form.watch()
  const isDirty = form.formState.isDirty

  useAutoSave(
    { branding: watchedValues },
    isDirty,
    async (data) => {
      updateData(data)
    }
  )

  const onNext = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      updateData({ branding: form.getValues() })
      markStepCompleted('branding')
      navigate(onboardingRoutes.competition)
    }
  }

  const onBack = () => navigate(onboardingRoutes.root)

  return (
    <OnboardingLayout
      canGoBack={true}
      canGoForward={form.formState.isValid}
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-lg">
        <div>
          <h2 className="font-title-lg text-title-lg text-primary">{t('onboarding.branding.title', 'Identidade Visual')}</h2>
          <p className="text-on-surface-variant text-body-md mt-xs">
            {t('onboarding.branding.subtitle', 'Configure as cores e logótipo da sua organização.')}
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-md" onSubmit={e => e.preventDefault()}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <FormField
                control={form.control}
                name="primaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.branding.primaryColor', 'Cor Principal')}</FormLabel>
                    <FormControl>
                      <div className="flex gap-sm">
                        <Input type="color" className="w-16 h-10 p-1 cursor-pointer" {...field} />
                        <Input className="flex-1 uppercase" placeholder="#000000" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="secondaryColor"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.branding.secondaryColor', 'Cor Secundária')}</FormLabel>
                    <FormControl>
                      <div className="flex gap-sm">
                        <Input type="color" className="w-16 h-10 p-1 cursor-pointer" {...field} />
                        <Input className="flex-1 uppercase" placeholder="#FFFFFF" {...field} />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="logoUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('onboarding.branding.logoUrl', 'URL do Logótipo (Opcional)')}</FormLabel>
                  <FormControl>
                    <Input placeholder="https://..." {...field} />
                  </FormControl>
                  <p className="text-xs text-on-surface-variant mt-1">
                    {t('onboarding.branding.logoHelp', 'Insira o link direto para a imagem do seu logótipo.')}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Visual Preview */}
            <div className="mt-xl p-md border border-outline/10 rounded-xl bg-surface-container flex gap-md items-center">
              <div className="w-16 h-16 rounded-lg bg-surface-container-highest flex items-center justify-center overflow-hidden border border-white/5">
                {watchedValues.logoUrl ? (
                  <img src={watchedValues.logoUrl} alt="Logo Preview" className="w-full h-full object-contain" />
                ) : (
                  <Upload className="w-6 h-6 text-on-surface-variant opacity-50" />
                )}
              </div>
              <div className="flex-1">
                <p className="font-label-md text-on-surface">{t('onboarding.branding.previewTitle', 'Pré-visualização')}</p>
                <div className="flex gap-xs mt-sm">
                  <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: watchedValues.primaryColor }} />
                  <div className="w-8 h-8 rounded-full shadow-sm" style={{ backgroundColor: watchedValues.secondaryColor }} />
                </div>
              </div>
            </div>

          </form>
        </Form>
      </div>
    </OnboardingLayout>
  )
}
