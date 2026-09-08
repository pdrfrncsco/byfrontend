import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { Input, Label } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { usePlayerContact, usePlayerOnboardingStatus, useUpdatePlayerContact, useCompleteOnboardingStep, usePlayerWizard } from '../hooks'
import type { PlayerContactUpdate } from '../types'
import { useAutoSave } from '@/components/ui/wizard'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

export function PlayerOnboardingContactPage() {
  const navigate = useNavigate()
  const { data: status } = usePlayerOnboardingStatus()
  const slug = status?.player?.slug ?? ''
  const { data: contact, isLoading } = usePlayerContact(slug)
  const update = useUpdatePlayerContact(slug)
  const complete = useCompleteOnboardingStep()
  const { draftData: wizardData, updateData, markStepCompleted } = usePlayerWizard()
  const form = useForm<PlayerContactUpdate>({
    defaultValues: {
      primary_email: wizardData.email || '',
      mobile_phone: wizardData.phone || '',
    },
  })

  useEffect(() => {
    if (contact) {
      form.reset({
        primary_email: wizardData.email || contact.primary_email || undefined,
        secondary_email: contact.secondary_email || undefined,
        mobile_phone: wizardData.phone || contact.mobile_phone || undefined,
        secondary_phone: contact.secondary_phone || undefined,
        country_code: contact.country_code || undefined,
        address: contact.address || undefined,
        city: contact.city || undefined,
        province: contact.province || undefined,
        postal_code: contact.postal_code || undefined,
        country: contact.country || undefined,
      })
    }
  }, [contact, form, wizardData])

  useAutoSave<PlayerContactUpdate>(
    form.watch(),
    form.formState.isDirty,
    async (values: Partial<PlayerContactUpdate>) => {
      updateData({
        email: values.primary_email || undefined,
        phone: values.mobile_phone || undefined,
      })
    }
  )

  const onSubmit = async (values: PlayerContactUpdate) => {
    updateData({
      email: values.primary_email || undefined,
      phone: values.mobile_phone || undefined,
    })
    await update.mutateAsync(values)
    markStepCompleted('contact')
    await complete.mutateAsync('contact')
    navigate(ROUTES.ONBOARDING_PLAYER_IDENTITY)
  }

  return (
    <PlayerOnboardingLayout
      step={4}
      isSaving={update.isPending || complete.isPending}
      onNext={form.handleSubmit(onSubmit)}
      onBack={() => navigate(ROUTES.ONBOARDING_PLAYER_FOOTBALL)}
      onSaveDraft={() => updateData({ email: form.getValues().primary_email, phone: form.getValues().mobile_phone })}
    >
      <div className="space-y-lg">
        <div>
          <h2 className="text-xl font-bold text-on-surface">Contactos</h2>
          <p className="mt-xs text-sm text-on-surface-variant">Estes dados serão usados para comunicações e notificações oficiais.</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-md" noValidate>
          {isLoading ? (
            <p className="text-sm text-muted-foreground">A carregar contactos...</p>
          ) : (
            <div className="grid gap-md md:grid-cols-2">
              <div className="space-y-xs">
                <Label htmlFor="primary_email">Email principal</Label>
                <Input id="primary_email" type="email" {...form.register('primary_email')} />
              </div>
              <div className="space-y-xs">
                <Label htmlFor="mobile_phone">Telemóvel</Label>
                <Input id="mobile_phone" type="tel" {...form.register('mobile_phone')} />
              </div>
              <div className="space-y-xs">
                <Label htmlFor="secondary_email">Email secundário</Label>
                <Input id="secondary_email" type="email" {...form.register('secondary_email')} />
              </div>
              <div className="space-y-xs">
                <Label htmlFor="secondary_phone">Telefone secundário</Label>
                <Input id="secondary_phone" type="tel" {...form.register('secondary_phone')} />
              </div>
              <div className="space-y-xs">
                <Label htmlFor="address">Morada</Label>
                <Input id="address" {...form.register('address')} />
              </div>
              <div className="space-y-xs">
                <Label htmlFor="city">Cidade</Label>
                <Input id="city" {...form.register('city')} />
              </div>
              <div className="space-y-xs">
                <Label htmlFor="province">Província</Label>
                <Input id="province" {...form.register('province')} />
              </div>
              <div className="space-y-xs">
                <Label htmlFor="country">País (ISO-3)</Label>
                <Input id="country" maxLength={3} {...form.register('country')} />
              </div>
            </div>
          )}
        </form>
      </div>
    </PlayerOnboardingLayout>
  )
}
