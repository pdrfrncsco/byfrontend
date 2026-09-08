import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'

import OnboardingLayout from './OnboardingLayout'
import { useOrganizationWizard } from '../hooks/useOrganizationWizard'
import { useAutoSave } from '@/components/ui/wizard'
import { competitionStepSchema } from '../schemas/onboarding.schemas'
import { onboardingRoutes } from '../routes'

import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from '@/components/ui/form'
import { Button } from '@/components/ui/button'

type CompetitionFormValues = z.infer<typeof competitionStepSchema>

export default function CompetitionStep() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { draftData, updateData, setStep, markStepCompleted } = useOrganizationWizard()

  const form = useForm<CompetitionFormValues>({
    resolver: zodResolver(competitionStepSchema),
    defaultValues: {
      name: draftData.competition?.name || '',
      competition_type: draftData.competition?.competition_type || 'league',
      modality: draftData.competition?.modality || 'futebol_11',
      season: draftData.competition?.season || new Date().getFullYear().toString(),
    },
    mode: 'onChange'
  })

  useEffect(() => {
    setStep(2) // Step 3 in UI, index 2
  }, [setStep])

  const watchedValues = form.watch()
  const isDirty = form.formState.isDirty

  useAutoSave(
    { competition: watchedValues },
    isDirty,
    async (data) => {
      updateData(data)
    }
  )

  const onNext = async () => {
    const isValid = await form.trigger()
    if (isValid) {
      updateData({ competition: form.getValues() })
      markStepCompleted('competition')
      navigate(onboardingRoutes.review)
    }
  }

  const onSkip = () => {
    markStepCompleted('competition')
    navigate(onboardingRoutes.review)
  }

  const onBack = () => navigate(onboardingRoutes.branding)

  return (
    <OnboardingLayout
      canGoBack={true}
      canGoForward={form.formState.isValid || !watchedValues.name} // allow forward if empty or valid
      onNext={onNext}
      onBack={onBack}
    >
      <div className="space-y-lg">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-md">
          <div>
            <h2 className="font-title-lg text-title-lg text-primary">{t('onboarding.competition.title', 'Competição Inicial')}</h2>
            <p className="text-on-surface-variant text-body-md mt-xs max-w-2xl">
              {t('onboarding.competition.subtitle', 'Configure a sua primeira competição agora ou pule esta etapa para fazê-lo mais tarde.')}
            </p>
          </div>
          <Button variant="ghost" onClick={onSkip} className="text-primary hover:bg-primary/10">
            {t('onboarding.competition.skip', 'Pular etapa')}
          </Button>
        </div>

        <Form {...form}>
          <form className="space-y-md" onSubmit={e => e.preventDefault()}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('onboarding.competition.name', 'Nome da Competição')}</FormLabel>
                  <FormControl>
                    <Input placeholder={t('onboarding.competition.namePlaceholder', 'Ex: Liga Nacional')} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-md">
              <FormField
                control={form.control}
                name="competition_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.competition.type', 'Tipo')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="league">Liga</SelectItem>
                        <SelectItem value="tournament">Torneio</SelectItem>
                        <SelectItem value="cup">Taça</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="modality"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.competition.modality', 'Modalidade')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="futebol_11">Futebol 11</SelectItem>
                        <SelectItem value="futebol_7">Futebol 7</SelectItem>
                        <SelectItem value="futsal">Futsal</SelectItem>
                        <SelectItem value="praia">Futebol de Praia</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="season"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t('onboarding.competition.season', 'Época')}</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Array.from({ length: 5 }).map((_, i) => {
                          const year = new Date().getFullYear() + i;
                          return (
                            <SelectItem key={year} value={year.toString()}>
                              {year}
                            </SelectItem>
                          )
                        })}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </form>
        </Form>
      </div>
    </OnboardingLayout>
  )
}
