import { useMemo } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Settings, Loader2 } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Card, CardContent, CardHeader, CardTitle, Input, NativeSelect } from '@/components/ui'
import { FormField } from '@/components/ui/form-field'
import { useCompetition, useUpdateCompetition } from '../hooks/useCompetitions'
import { updateCompetitionSchema, type UpdateCompetitionFormData } from '../schemas'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarSections } from '../constants'

/**
 * CompetitionSettingsPage — edit competition metadata and status.
 * Protected route — requires org admin role.
 */
export function CompetitionSettingsPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const sidebarSections = useMemo(() => getCompetitionSidebarSections(competitionId), [competitionId])

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
          start_date: competition.start_date ?? '',
          end_date: competition.end_date ?? '',
          registration_start_date: competition.registration_start_date ?? '',
          registration_end_date: competition.registration_end_date ?? '',
          description: competition.description ?? '',
        }
      : undefined,
  })

  const onSubmit = (data: UpdateCompetitionFormData) => {
    const payload = {
      ...data,
      start_date: data.start_date ? data.start_date : null,
      end_date: data.end_date ? data.end_date : null,
      registration_start_date: data.registration_start_date ? data.registration_start_date : null,
      registration_end_date: data.registration_end_date ? data.registration_end_date : null,
      description: data.description || '',
    }
    updateCompetition({ id: competitionId, data: payload })
  }

  if (isLoading) {
    return (
      <DashboardLayout
        title="Configurações da Competição"
        subtitle="Ajuste os dados gerais e o estado da competição."
        dashboardType="competition"
        sidebarSections={sidebarSections}
      >
        <Card variant="flat" padding="lg" className="space-y-sm">
          <div className="h-5 w-40 rounded-full bg-surface-container-high animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-surface-container-high animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-surface-container-high animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-surface-container-high animate-pulse" />
        </Card>
      </DashboardLayout>
    )
  }

  if (!competition) {
    return (
      <DashboardLayout
        title="Configurações da Competição"
        subtitle="Ajuste os dados gerais e o estado da competição."
        dashboardType="competition"
        sidebarSections={sidebarSections}
      >
        <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
          <p>Competição não encontrada.</p>
          <Link to={competitionRoutes.list}>
            <Button variant="secondary" size="sm">Ver página pública</Button>
          </Link>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Configurações • ${competition.name}`}
      subtitle="Edite os dados gerais, prazos e o estado operacional desta competição."
      dashboardType="competition"
      sidebarSections={sidebarSections}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={competitionRoutes.detail(competitionId)}>
            <Settings className="h-4 w-4" />
            <span>Ver página pública</span>
          </Link>
        </Button>
      }
    >
      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>Dados Gerais & Ciclo de Vida</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="edit-competition-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-lg">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
              <FormField label="Nome da Competição" htmlFor="comp-edit-name" error={errors.name?.message} required>
                <Input
                  id="comp-edit-name"
                  placeholder="Nome da competição"
                  aria-invalid={!!errors.name}
                  {...register('name')}
                />
              </FormField>

              <FormField label="Tipo de Prova" htmlFor="comp-edit-type" error={errors.competition_type?.message} required>
                <NativeSelect id="comp-edit-type" {...register('competition_type')}>
                  <option value="league">Campeonato (Liga)</option>
                  <option value="tournament">Torneio</option>
                  <option value="cup">Taça / Copa</option>
                </NativeSelect>
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

              <FormField label="Estado Operacional" htmlFor="comp-edit-status" error={errors.status?.message}>
                <NativeSelect id="comp-edit-status" {...register('status')}>
                  <option value="draft">Rascunho (Em Planeamento / Oculto)</option>
                  <option value="active">Ativa (Em Curso / Aberto)</option>
                  <option value="completed">Concluída (Época Encerrada)</option>
                  <option value="inactive">Inativa / Pausada (Temporariamente Suspensa)</option>
                </NativeSelect>
              </FormField>
            </div>

            {/* Calendário da Competição */}
            <div className="border-t border-outline-variant/15 pt-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-sm">
                Datas da Competição
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <FormField
                  label="Data Prevista de Início"
                  htmlFor="comp-edit-start-date"
                  error={errors.start_date?.message}
                  hint="Data de arranque da primeira jornada / eliminatória"
                >
                  <Input
                    id="comp-edit-start-date"
                    type="date"
                    {...register('start_date')}
                  />
                </FormField>

                <FormField
                  label="Data Prevista de Conclusão"
                  htmlFor="comp-edit-end-date"
                  error={errors.end_date?.message}
                  hint="Data do jogo final ou encerramento da prova"
                >
                  <Input
                    id="comp-edit-end-date"
                    type="date"
                    {...register('end_date')}
                  />
                </FormField>
              </div>
            </div>

            {/* Janela de Inscrições */}
            <div className="border-t border-outline-variant/15 pt-md">
              <h4 className="text-xs font-bold uppercase tracking-wider text-primary mb-sm">
                Janela de Inscrições de Clubes
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                <FormField
                  label="Abertura das Inscrições"
                  htmlFor="comp-edit-reg-start"
                  error={errors.registration_start_date?.message}
                >
                  <Input
                    id="comp-edit-reg-start"
                    type="date"
                    {...register('registration_start_date')}
                  />
                </FormField>

                <FormField
                  label="Encerramento das Inscrições"
                  htmlFor="comp-edit-reg-end"
                  error={errors.registration_end_date?.message}
                >
                  <Input
                    id="comp-edit-reg-end"
                    type="date"
                    {...register('registration_end_date')}
                  />
                </FormField>
              </div>
            </div>

            {/* Descrição & Notas Técnicas */}
            <div className="border-t border-outline-variant/15 pt-md">
              <FormField
                label="Descrição / Notas Regulamentares"
                htmlFor="comp-edit-description"
                error={errors.description?.message}
                hint="Informações adicionais, prémios, diretrizes disciplinares ou enquadramento da prova."
              >
                <textarea
                  id="comp-edit-description"
                  rows={3}
                  className="w-full rounded-md border border-outline bg-surface px-3 py-2 text-sm text-on-surface placeholder:text-on-surface-variant/50 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Ex: Regulamento técnico aprovado pela comissão diretiva..."
                  {...register('description')}
                />
              </FormField>
            </div>

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
    </DashboardLayout>
  )
}
