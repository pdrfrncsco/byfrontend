import { useNavigate, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trophy, Loader2 } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input, Select } from '@/components/ui'
import { useCreateCompetition } from '../hooks/useCompetitions'
import { createCompetitionSchema, type CreateCompetitionFormData } from '../schemas'
import { CompetitionManagementFrame } from '../components/CompetitionManagementFrame'
import { competitionRoutes } from '../routes'

/**
 * CompetitionCreatePage — form to create a new competition.
 * Protected route — requires org admin role.
 */
export function CompetitionCreatePage() {
  const navigate = useNavigate()
  const { mutate: createCompetition, isPending } = useCreateCompetition()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCompetitionFormData>({
    resolver: zodResolver(createCompetitionSchema),
    defaultValues: {
      status: 'draft',
      competition_type: 'league',
    },
  })

  const onSubmit = (data: CreateCompetitionFormData) => {
    createCompetition(data, {
      onSuccess: (competition) => {
        navigate(competitionRoutes.detail(competition.id))
      },
    })
  }

  return (
    <CompetitionManagementFrame
      backTo={competitionRoutes.list}
      backLabel="Voltar às Competições"
      badge={<><Trophy className="h-3.5 w-3.5" /> Nova Competição</>}
      title="Criar Competição"
      description="Preencha os dados para criar uma nova competição na sua organização."
      contentClassName="mx-auto max-w-2xl"
    >
      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>Dados da Competição</CardTitle>
        </CardHeader>
        <CardContent>
          <form id="create-competition-form" onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-lg">
            <FormField
              label="Nome da Competição"
              htmlFor="comp-name"
              error={errors.name?.message}
              required
            >
              <Input
                id="comp-name"
                placeholder="ex: Liga Nacional Sub-20"
                aria-invalid={!!errors.name}
                aria-describedby={errors.name ? 'comp-name-error' : undefined}
                {...register('name')}
              />
            </FormField>

            <FormField
              label="Tipo de Competição"
              htmlFor="comp-type"
              error={errors.competition_type?.message}
              required
            >
              <Select id="comp-type" aria-invalid={!!errors.competition_type} {...register('competition_type')}>
                <option value="league">Campeonato (Liga)</option>
                <option value="tournament">Torneio</option>
                <option value="cup">Taça / Copa</option>
              </Select>
            </FormField>

            <FormField
              label="Época"
              htmlFor="comp-season"
              error={errors.season?.message}
              required
              hint="Formato: AAAA ou AAAA-AAAA (ex: 2025 ou 2025-2026)"
            >
              <Input
                id="comp-season"
                placeholder="ex: 2025-2026"
                aria-invalid={!!errors.season}
                aria-describedby={errors.season ? 'comp-season-error' : 'comp-season-hint'}
                {...register('season')}
              />
            </FormField>

            <FormField label="Estado Inicial" htmlFor="comp-status" error={errors.status?.message}>
              <Select id="comp-status" {...register('status')}>
                <option value="draft">Rascunho — visível apenas para admins</option>
                <option value="active">Ativa — visível publicamente</option>
              </Select>
            </FormField>

            <div className="flex items-center justify-end gap-sm pt-sm">
              <Link to={competitionRoutes.list}>
                <Button type="button" variant="secondary" disabled={isPending}>
                  Cancelar
                </Button>
              </Link>
              <Button type="submit" variant="primary" disabled={isPending} id="comp-create-submit-btn">
                {isPending ? (
                  <>
                    <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                    A criar...
                  </>
                ) : (
                  'Criar Competição'
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </CompetitionManagementFrame>
  )
}
