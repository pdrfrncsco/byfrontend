import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, CardContent, Input, Label } from '@/components/ui'
import { usePlayerContact, useUpdatePlayerContact } from '../hooks'
import type { PlayerContactUpdate } from '../types'

export function PlayerContactSettingsPanel({ slug }: { slug: string }) {
  const { data } = usePlayerContact(slug)
  const update = useUpdatePlayerContact(slug)
  const form = useForm<PlayerContactUpdate>({ defaultValues: {} })
  useEffect(() => {
    if (data) form.reset(Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value ?? undefined])) as PlayerContactUpdate)
  }, [data, form])
  return <Card variant="flat"><CardContent className="p-lg"><form className="space-y-lg" onSubmit={form.handleSubmit(async (values) => update.mutateAsync(values))}><div className="grid gap-md md:grid-cols-2"><div><Label htmlFor="primary_email">Email principal</Label><Input id="primary_email" type="email" {...form.register('primary_email')} /></div><div><Label htmlFor="mobile_phone">Telemóvel</Label><Input id="mobile_phone" type="tel" {...form.register('mobile_phone')} /></div><div><Label htmlFor="address">Morada</Label><Input id="address" {...form.register('address')} /></div><div><Label htmlFor="city">Cidade</Label><Input id="city" {...form.register('city')} /></div><div><Label htmlFor="province">Província</Label><Input id="province" {...form.register('province')} /></div><div><Label htmlFor="country">País (ISO-3)</Label><Input id="country" maxLength={3} {...form.register('country')} /></div></div><div className="flex justify-end"><Button type="submit" loading={update.isPending}>Guardar contacto</Button></div></form></CardContent></Card>
}
