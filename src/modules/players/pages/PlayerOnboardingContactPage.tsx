import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { Button, Input, Label } from '@/components/ui'
import { ROUTES } from '@/constants/routes'
import { usePlayerContact, usePlayerOnboardingStatus, useUpdatePlayerContact, useCompleteOnboardingStep } from '../hooks'
import type { PlayerContactUpdate } from '../types'
import { PlayerOnboardingLayout } from './PlayerOnboardingLayout'

export function PlayerOnboardingContactPage() {
  const navigate = useNavigate()
  const { data: status } = usePlayerOnboardingStatus()
  const slug = status?.player?.slug ?? ''
  const { data: contact, isLoading } = usePlayerContact(slug)
  const update = useUpdatePlayerContact(slug)
  const complete = useCompleteOnboardingStep()
  const form = useForm<PlayerContactUpdate>({ defaultValues: {} })

  useEffect(() => {
    if (contact) {
      form.reset({
        primary_email: contact.primary_email ?? undefined,
        secondary_email: contact.secondary_email ?? undefined,
        mobile_phone: contact.mobile_phone ?? undefined,
        secondary_phone: contact.secondary_phone ?? undefined,
        country_code: contact.country_code ?? undefined,
        address: contact.address ?? undefined,
        city: contact.city ?? undefined,
        province: contact.province ?? undefined,
        postal_code: contact.postal_code ?? undefined,
        country: contact.country ?? undefined,
      })
    }
  }, [contact, form])

  const onSubmit = async (values: PlayerContactUpdate) => {
    await update.mutateAsync(values)
    await complete.mutateAsync('contact')
    navigate(ROUTES.ONBOARDING_PLAYER_IDENTITY)
  }

  return (
    <PlayerOnboardingLayout step={4}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
        <div>
          <h2 className="text-xl font-semibold text-on-surface">Contactos</h2>
          <p className="mt-xs text-sm text-on-surface-variant">Estes dados serão usados para comunicações e notificações oficiais.</p>
        </div>
        {isLoading ? <p className="text-sm text-on-surface-variant">A carregar contactos...</p> : (
          <div className="grid gap-md md:grid-cols-2">
            <div><Label htmlFor="primary_email">Email principal</Label><Input id="primary_email" type="email" {...form.register('primary_email')} /></div>
            <div><Label htmlFor="mobile_phone">Telemóvel</Label><Input id="mobile_phone" type="tel" {...form.register('mobile_phone')} /></div>
            <div><Label htmlFor="secondary_email">Email secundário</Label><Input id="secondary_email" type="email" {...form.register('secondary_email')} /></div>
            <div><Label htmlFor="secondary_phone">Telefone secundário</Label><Input id="secondary_phone" type="tel" {...form.register('secondary_phone')} /></div>
            <div><Label htmlFor="address">Morada</Label><Input id="address" {...form.register('address')} /></div>
            <div><Label htmlFor="city">Cidade</Label><Input id="city" {...form.register('city')} /></div>
            <div><Label htmlFor="province">Província</Label><Input id="province" {...form.register('province')} /></div>
            <div><Label htmlFor="country">País (ISO-3)</Label><Input id="country" maxLength={3} {...form.register('country')} /></div>
          </div>
        )}
        <div className="flex justify-between gap-sm">
          <Button type="button" variant="secondary" onClick={() => navigate(ROUTES.ONBOARDING_PLAYER_FOOTBALL)}><ArrowLeft className="h-4 w-4" />Voltar</Button>
          <Button type="submit" loading={update.isPending || complete.isPending}>Continuar<ArrowRight className="h-4 w-4" /></Button>
        </div>
      </form>
    </PlayerOnboardingLayout>
  )
}
