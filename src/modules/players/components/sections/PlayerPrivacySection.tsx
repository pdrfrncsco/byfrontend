import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { Button, Card, CardContent, CardHeader, CardTitle, Label } from '@/components/ui'
import type { PlayerPrivacySettingsUpdate, VisibilityLevel } from '../../types'

interface PlayerPrivacySectionProps {
  onSubmit: (data: PlayerPrivacySettingsUpdate) => Promise<void>
  isLoading?: boolean
  initialData?: PlayerPrivacySettingsUpdate
}

const levels: Array<{ value: VisibilityLevel; label: string }> = [
  { value: 'public', label: 'Público' },
  { value: 'club', label: 'Clubes' },
  { value: 'organization', label: 'Organizações' },
  { value: 'agent', label: 'Agentes' },
  { value: 'private', label: 'Privado' },
]

const fields: Array<[keyof PlayerPrivacySettingsUpdate, string]> = [
  ['profile_visibility', 'Perfil'],
  ['contact_visibility', 'Contacto'],
  ['contract_visibility', 'Contratos'],
  ['salary_visibility', 'Salário'],
  ['medical_visibility', 'Dados médicos'],
  ['documents_visibility', 'Documentos'],
  ['statistics_visibility', 'Estatísticas'],
]

export function PlayerPrivacySection({ onSubmit, isLoading = false, initialData }: PlayerPrivacySectionProps) {
  const form = useForm<PlayerPrivacySettingsUpdate>({ defaultValues: initialData })

  useEffect(() => {
    if (initialData) form.reset(initialData)
  }, [initialData, form])

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-lg">
      <Card>
        <CardHeader><CardTitle>Visibilidade dos dados</CardTitle></CardHeader>
        <CardContent className="grid gap-md md:grid-cols-2">
          {fields.map(([name, label]) => (
            <div key={name}>
              <Label htmlFor={name}>{label}</Label>
              <select id={name} {...form.register(name)} className="flex h-10 w-full rounded-lg border border-outline-variant bg-surface-container px-md py-sm text-sm">
                {levels.map((level) => <option key={level.value} value={level.value}>{level.label}</option>)}
              </select>
            </div>
          ))}
        </CardContent>
      </Card>
      <div className="flex justify-end"><Button type="submit" loading={isLoading} disabled={!form.formState.isDirty}>Guardar privacidade</Button></div>
    </form>
  )
}
