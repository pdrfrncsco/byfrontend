import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Settings, Loader2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input, Select } from '@/components/ui'
import { useCompetition, useUpdateCompetition } from '../hooks/useCompetitions'
import { updateCompetitionSchema, type UpdateCompetitionFormData } from '../schemas'
import { CompetitionHeaderSkeleton } from '../components/CompetitionHeader'
import { CompetitionManagementFrame } from '../components/CompetitionManagementFrame'
import { competitionRoutes } from '../routes'

/**
 * CompetitionSettingsPage — edit competition metadata and status.
 * Protected route — requires org admin role.
 */
export function CompetitionSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''

  const { data: competition, isLoading } = useCompetition(competitionId)
  const { mutate: updateCompetition, isPending } = useUpdateCompetition()

  const {
    register,
    handleSubmit,
    formState: { errors, isDirty },
  } = useForm<UpdateCompetitionFormData>({
    resolver: zodResolver(updateCompetitionSchema),
    values: competition
      ? {
          name: competition.name,
          competition_type: competition.competition_type,
          season: competition.season,
          status: competition.status,
        }
      : undefined,
  })

  const onSubmit = (data: UpdateCompetitionFormData) => {
    updateCompetition({ id: competitionId, data })
  }

  if (isLoading) {
    return <CompetitionHeaderSkeleton />
  }

  if (!competition) {
    return (
      <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
        <p>Competição não encontrada.</p>
        <Link to={competitionRoutes.list}>
          <Button variant="secondary" size="sm">Voltar</Button>
        </Link>
      </div>
    )
  }

  return (
    <CompetitionManagementFrame
      backTo={competitionRoutes.detail(competitionId)}
      backLabel="Voltar à Competição"
      badge={<><Settings className="h-3.5 w-3.5" /> Configurações</>}
      title={competition.name}
      description="Edite os dados gerais desta competição."
      contentClassName="mx-auto max-w-2xl"
    >
      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>Dados Gerais</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="edit-competition-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-lg">
            <FormField label="Nome" htmlFor="comp-edit-name" error={errors.name?.message} required>
              <Input
                id="comp-edit-name"
                placeholder="Nome da competição"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
            </FormField>

            <FormField label="Tipo" htmlFor="comp-edit-type" error={errors.competition_type?.message} required>
              <Select id="comp-edit-type" {...register('competition_type')}>
                <option value="league">Campeonato (Liga)</option>
                <option value="tournament">Torneio</option>
                <option value="cup">Taça / Copa</option>
              </Select>
            </FormField>

            <FormField
              label="Época"
              htmlFor="comp-edit-season"
              error={errors.season?.message}
              required
              hint="Formato: AAAA ou AAAA-AAAA"
            >
              <Input
                id="comp-edit-season"
                placeholder="ex: 2025-2026"
                aria-invalid={!!errors.season}
                {...register('season')}
              />
            </FormField>

            <FormField label="Estado" htmlFor="comp-edit-status" error={errors.status?.message}>
              <Select id="comp-edit-status" {...register('status')}>
                <option value="draft">Rascunho</option>
                <option value="active">Ativa</option>
                <option value="completed">Concluída</option>
              </Select>
            </FormField>

            <div className="flex justify-end gap-sm pt-sm">
              <Button type="submit" variant="primary" disabled={isPending || !isDirty} id="comp-settings-save-btn">
                {isPending ? (
                  <>
                    <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                    A guardar...
                  </>
                ) : (
                  'Guardar Alterações'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </CompetitionManagementFrame>
  )
}
