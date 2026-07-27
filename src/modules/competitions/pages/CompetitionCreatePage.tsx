import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Trophy, Loader2, ChevronRight, ChevronLeft, Check } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input, Select } from '@/components/ui'
import { useCreateCompetition } from '../hooks/useCompetitions'
import { createCompetitionSchema, type CreateCompetitionFormData } from '../schemas'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import type { CompetitionType } from '../types'

type WizardStep = 'basics' | 'format' | 'format-config' | 'review'

const STEPS: { id: WizardStep; label: string }[] = [
  { id: 'basics', label: 'Dados Básicos' },
  { id: 'format', label: 'Formato' },
  { id: 'format-config', label: 'Configuração' },
  { id: 'review', label: 'Revisão' },
]

const FORMAT_LABELS: Record<CompetitionType, { title: string; description: string; icon: string }> = {
  league: {
    title: 'Campeonato (Liga)',
    description: 'Pontos corridos. Todas as equipas jogam entre si numa ou duas voltas.',
    icon: '🏆',
  },
  tournament: {
    title: 'Torneio',
    description: 'Fase de grupos seguida de eliminatórias. Ideal para grandes competições.',
    icon: '🎯',
  },
  cup: {
    title: 'Taça / Copa',
    description: 'Eliminação directa. Perde, sai. Simples e emocionante.',
    icon: '🥇',
  },
}

/**
 * CompetitionCreatePage — wizard condicional por formato.
 * Protected route — requires org admin role.
 */
export function CompetitionCreatePage() {
  const navigate = useNavigate()
  const { mutate: createCompetition, isPending } = useCreateCompetition()
  const sidebarLinks = getCompetitionSidebarLinks()
  const [step, setStep] = useState<WizardStep>('basics')

  const {
    register,
    handleSubmit,
    watch,
    control,
    formState: { errors },
  } = useForm<CreateCompetitionFormData>({
    resolver: zodResolver(createCompetitionSchema),
    defaultValues: {
      status: 'draft',
      competition_type: 'league',
    },
  })

  const competitionType = watch('competition_type')
  const currentStepIndex = STEPS.findIndex((s) => s.id === step)

  const goNext = () => {
    const next = STEPS[currentStepIndex + 1]
    if (next) setStep(next.id)
  }

  const goPrev = () => {
    const prev = STEPS[currentStepIndex - 1]
    if (prev) setStep(prev.id)
  }

  const onSubmit = (data: CreateCompetitionFormData) => {
    createCompetition(data, {
      onSuccess: (competition) => {
        navigate(competitionRoutes.detail(competition.id))
      },
    })
  }

  return (
    <DashboardLayout
      title="Criar Competição"
      subtitle="Preencha os dados para criar uma nova competição na sua organização."
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={competitionRoutes.list}>
            <Trophy className="h-4 w-4" />
            <span>Ver página pública</span>
          </Link>
        </Button>
      }
    >
      {/* Step indicator */}
      <div className="flex items-center gap-xs overflow-x-auto pb-sm">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center gap-xs">
            <div
              className={`flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full text-xs font-bold transition-all ${
                idx < currentStepIndex
                  ? 'bg-primary text-on-primary'
                  : idx === currentStepIndex
                  ? 'bg-primary-container text-primary ring-2 ring-primary'
                  : 'bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {idx < currentStepIndex ? <Check className="h-3 w-3" /> : idx + 1}
            </div>
            <span
              className={`text-xs font-medium ${
                idx === currentStepIndex ? 'text-on-surface' : 'text-on-surface-variant'
              }`}
            >
              {s.label}
            </span>
            {idx < STEPS.length - 1 && (
              <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant/40" />
            )}
          </div>
        ))}
      </div>

      <form id="create-competition-form" onSubmit={handleSubmit(onSubmit)} noValidate>
        {/* Step 1 — Dados Básicos */}
        {step === 'basics' && (
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Dados Básicos</CardTitle>
            </CardHeader>
            <CardContent className="space-y-lg">
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
                  {...register('name')}
                />
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
                <Button type="button" variant="primary" onClick={goNext} id="step-basics-next">
                  Próximo <ChevronRight className="ml-xs h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 2 — Formato */}
        {step === 'format' && (
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Formato da Competição</CardTitle>
            </CardHeader>
            <CardContent className="space-y-lg">
              <p className="text-sm text-on-surface-variant">
                Escolha o formato que define como os jogos são organizados e vencedores determinados.
              </p>
              <Controller
                control={control}
                name="competition_type"
                render={({ field }) => (
                  <div className="grid grid-cols-1 gap-md sm:grid-cols-3">
                    {(Object.entries(FORMAT_LABELS) as [CompetitionType, typeof FORMAT_LABELS[CompetitionType]][]).map(
                      ([type, cfg]) => (
                        <button
                          key={type}
                          type="button"
                          id={`format-btn-${type}`}
                          onClick={() => field.onChange(type)}
                          className={`group relative flex flex-col gap-sm rounded-xl border p-lg text-left transition-all ${
                            field.value === type
                              ? 'border-primary bg-primary-container/20 ring-2 ring-primary'
                              : 'border-outline-variant/30 bg-surface-container-low hover:border-primary/40 hover:bg-primary-container/5'
                          }`}
                        >
                          <span className="text-3xl">{cfg.icon}</span>
                          <div>
                            <p className="font-semibold text-on-surface">{cfg.title}</p>
                            <p className="mt-xs text-xs text-on-surface-variant leading-relaxed">
                              {cfg.description}
                            </p>
                          </div>
                          {field.value === type && (
                            <div className="absolute right-sm top-sm flex h-5 w-5 items-center justify-center rounded-full bg-primary text-on-primary">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                        </button>
                      )
                    )}
                  </div>
                )}
              />

              <div className="flex items-center justify-between gap-sm pt-sm">
                <Button type="button" variant="secondary" onClick={goPrev}>
                  <ChevronLeft className="mr-xs h-4 w-4" /> Anterior
                </Button>
                <Button type="button" variant="primary" onClick={goNext} id="step-format-next">
                  Próximo <ChevronRight className="ml-xs h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 3 — Configuração por Formato */}
        {step === 'format-config' && (
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>
                Configuração:{' '}
                {FORMAT_LABELS[competitionType as CompetitionType]?.title || competitionType}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-lg">
              {competitionType === 'league' && (
                <div className="space-y-md">
                  <p className="text-sm text-on-surface-variant">
                    As configurações avançadas da liga (critérios de desempate, zonas de promoção/despromoção) 
                    poderão ser definidas nas definições da competição após a criação.
                  </p>
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-lg">
                    <h4 className="mb-md font-semibold text-on-surface">Resumo — Campeonato (Liga)</h4>
                    <ul className="space-y-xs text-sm text-on-surface-variant">
                      <li>• Pontos corridos: todas as equipas jogam entre si</li>
                      <li>• Vitória: 3 pts | Empate: 1 pt | Derrota: 0 pts (configurável)</li>
                      <li>• Classificação por pontos com critérios de desempate</li>
                      <li>• Zonas de promoção, play-offs e despromoção configuráveis</li>
                    </ul>
                  </div>
                </div>
              )}

              {competitionType === 'tournament' && (
                <div className="space-y-md">
                  <p className="text-sm text-on-surface-variant">
                    O torneio divide as equipas em grupos com fase de eliminatórias. A configuração 
                    detalhada (nº de grupos, qualificados) poderá ser definida nas definições.
                  </p>
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-lg">
                    <h4 className="mb-md font-semibold text-on-surface">Resumo — Torneio</h4>
                    <ul className="space-y-xs text-sm text-on-surface-variant">
                      <li>• Fase de grupos: mini-classificação por grupo</li>
                      <li>• Os melhores de cada grupo avançam para eliminatórias</li>
                      <li>• Fase eliminatória: quartos → semis → final</li>
                      <li>• Empate com extra-tempo e penáltis (configurável)</li>
                    </ul>
                  </div>
                </div>
              )}

              {competitionType === 'cup' && (
                <div className="space-y-md">
                  <p className="text-sm text-on-surface-variant">
                    A taça usa eliminação directa. A chave é gerada automaticamente após o sorteio.
                  </p>
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-lg">
                    <h4 className="mb-md font-semibold text-on-surface">Resumo — Taça / Copa</h4>
                    <ul className="space-y-xs text-sm text-on-surface-variant">
                      <li>• Eliminação directa: quem perde, sai</li>
                      <li>• Nº de equipas: potência de 2 (8, 16, 32…)</li>
                      <li>• Byes automáticos se necessário</li>
                      <li>• Empate → extra-tempo → penáltis (configurável)</li>
                    </ul>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-sm pt-sm">
                <Button type="button" variant="secondary" onClick={goPrev}>
                  <ChevronLeft className="mr-xs h-4 w-4" /> Anterior
                </Button>
                <Button type="button" variant="primary" onClick={goNext} id="step-config-next">
                  Próximo <ChevronRight className="ml-xs h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Step 4 — Revisão e Criação */}
        {step === 'review' && (
          <Card variant="flat" padding="none">
            <CardHeader>
              <CardTitle>Revisão Final</CardTitle>
            </CardHeader>
            <CardContent className="space-y-lg">
              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-lg space-y-md">
                <h4 className="font-semibold text-on-surface">Sumário da Competição</h4>
                <dl className="grid grid-cols-2 gap-md text-sm">
                  <div>
                    <dt className="text-on-surface-variant">Nome</dt>
                    <dd className="font-medium text-on-surface mt-xs">{watch('name') || '–'}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Época</dt>
                    <dd className="font-medium text-on-surface mt-xs">{watch('season') || '–'}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Formato</dt>
                    <dd className="font-medium text-on-surface mt-xs">
                      {FORMAT_LABELS[competitionType as CompetitionType]?.title || competitionType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant">Estado Inicial</dt>
                    <dd className="font-medium text-on-surface mt-xs">
                      {watch('status') === 'draft' ? 'Rascunho' : 'Ativa'}
                    </dd>
                  </div>
                </dl>
              </div>

              <div className="flex items-center justify-between gap-sm pt-sm">
                <Button type="button" variant="secondary" onClick={goPrev}>
                  <ChevronLeft className="mr-xs h-4 w-4" /> Anterior
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isPending}
                  id="comp-create-submit-btn"
                >
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
            </CardContent>
          </Card>
        )}
      </form>
    </DashboardLayout>
  )
}
