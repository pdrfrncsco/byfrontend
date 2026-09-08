import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import OnboardingLayout from './OnboardingLayout'
import { useOrganizationWizard } from '../hooks/useOrganizationWizard'
import { useAutoSave } from '@/components/ui/wizard'
import { organizationStepSchema } from '../schemas/onboarding.schemas'
import { onboardingRoutes } from '../routes'

import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'

type OrganizationFormValues = z.infer<typeof organizationStepSchema>

export default function OrganizationStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { draftData, updateData, setStep, markStepCompleted } = useOrganizationWizard()

  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationStepSchema),
    defaultValues: {
      name: draftData.organization?.name || '',
      type: draftData.organization?.type || '',
      location: draftData.organization?.location || '',
      slug: draftData.organization?.slug || '',
    },
    mode: 'onChange'
  })

  // Set step to 0 when this component mounts (Organization is step 0)
  useEffect(() => {
    setStep(0)
  }, [setStep])

  // Watch form values and auto-save
  const watchedValues = form.watch()
  const isDirty = form.formState.isDirty

  useAutoSave(
    { organization: watchedValues },
    isDirty,
    async (data) => {
      // simulate API call or call real API
      updateData(data)
    }
  )

  const onNext = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      updateData({ organization: form.getValues() })
      markStepCompleted('organization')
      navigate(onboardingRoutes.branding)
    }
  }

  return (
    <OnboardingLayout
      canGoBack={false}
      canGoForward={form.formState.isValid}
      onNext={onNext}
    >
      <div className="space-y-lg">
        <div>
          <h2 className="font-title-lg text-title-lg text-primary">{t('onboarding.organization.title', 'Informação da Organização')}</h2>
          <p className="text-on-surface-variant text-body-md mt-xs">
            {t('onboarding.organization.subtitle', 'Configure os detalhes básicos da sua entidade.')}
          </p>
        </div>

        <Form {...form}>
          <form className="space-y-md" onSubmit={e => e.preventDefault()}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('onboarding.organization.name', 'Nome Oficial')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('onboarding.organization.namePlaceholder', 'Ex: Associação de Futebol')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.organization.type', 'Tipo de Entidade')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder={t('onboarding.organization.typePlaceholder', 'Selecione')} />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="federation">{t('onboarding.organization.types.federation', 'Federação')}</SelectItem>
                        <SelectItem value="association">{t('onboarding.organization.types.association', 'Associação')}</SelectItem>
                        <SelectItem value="league">{t('onboarding.organization.types.league', 'Liga')}</SelectItem>
                        <SelectItem value="club">{t('onboarding.organization.types.club', 'Clube / Academia')}</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.organization.location', 'Sede/Localização')}</FormLabel>
                    <FormControl>
                      <Input placeholder={t('onboarding.organization.locationPlaceholder', 'País, Cidade')} {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('onboarding.organization.slug', 'URL / Slug (Opcional)')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('onboarding.organization.slugPlaceholder', 'ex: associacao-futebol')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
      </div>
    </OnboardingLayout>
  )
}
