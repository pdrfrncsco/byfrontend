import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, CardContent, Label } from '@/components/ui'
import { usePlayerPrivacySettings, useUpdatePlayerPrivacySettings } from '../hooks'
import type { PlayerPrivacySettingsUpdate, VisibilityLevel } from '../types'

const levels: Array<{ value: VisibilityLevel; label: string }> = [
  { value: 'public', label: 'Público' },
  { value: 'club', label: 'Clubes' },
  { value: 'organization', label: 'Organizações' },
  { value: 'agent', label: 'Agentes' },
  { value: 'private', label: 'Privado' },
]
const fields: Array<[keyof PlayerPrivacySettingsUpdate, string]> = [
  ['profile_visibility', 'Perfil'], ['contact_visibility', 'Contacto'], ['contract_visibility', 'Contratos'],
  ['salary_visibility', 'Salário'], ['medical_visibility', 'Dados médicos'], ['documents_visibility', 'Documentos'], ['statistics_visibility', 'Estatísticas'],
]

export function PlayerPrivacySettingsPanel({ slug }: { slug: string }) {
  const { data } = usePlayerPrivacySettings(slug)
  const update = useUpdatePlayerPrivacySettings(slug)
  const form = useForm<PlayerPrivacySettingsUpdate>()
  useEffect(() => { if (data) form.reset(data) }, [data, form])
  return <Card variant="flat"><CardContent className="p-lg"><form className="space-y-lg" onSubmit={form.handleSubmit(async (values) => update.mutateAsync(values))}><div className="grid gap-md md:grid-cols-2">{fields.map(([name, label]) => <div key={name}><Label htmlFor={name}>{label}</Label><select id={name} {...form.register(name)} className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm">{levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}</select></div>)}</div><div className="flex justify-end"><Button type="submit" loading={update.isPending}>Guardar privacidade</Button></div></form></CardContent></Card>
}
