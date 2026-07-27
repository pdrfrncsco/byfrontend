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
import type { CompetitionType, LeagueConfig, TournamentConfig, KnockoutRound, CupConfig, CupRound } from '../types'

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
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CreateCompetitionFormData>({
    resolver: zodResolver(createCompetitionSchema),
    defaultValues: {
      status: 'draft',
      competition_type: 'league',
      config: {
        format: 'league',
        rounds: 18,
        homeAndAway: true,
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
        tiebreakers: [
          'head_to_head_points',
          'head_to_head_goal_difference',
          'goal_difference',
          'goals_scored',
          'fair_play',
          'random_draw',
        ],
        relegationZone: 2,
        promotionZone: 2,
      },
    },
  })

  const competitionType = watch('competition_type')
  const configVal = watch('config')
  const currentStepIndex = STEPS.findIndex((s) => s.id === step)

  const goNext = async () => {
    let isValid = false
    if (step === 'basics') {
      isValid = await trigger(['name', 'season', 'status'])
    } else if (step === 'format') {
      isValid = await trigger('competition_type')
    } else if (step === 'format-config') {
      isValid = await trigger('config')
    } else {
      isValid = true
    }

    if (isValid) {
      const next = STEPS[currentStepIndex + 1]
      if (next) setStep(next.id)
    }
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
      <div className="flex items-center gap-xs overflow-x-auto pb-sm mb-lg">
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
              className={`text-xs font-medium whitespace-nowrap ${
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
                          onClick={() => {
                            field.onChange(type)
                            if (type === 'league') {
                              setValue('config', {
                                format: 'league',
                                rounds: 18,
                                homeAndAway: true,
                                pointsWin: 3,
                                pointsDraw: 1,
                                pointsLoss: 0,
                                tiebreakers: [
                                  'head_to_head_points',
                                  'head_to_head_goal_difference',
                                  'goal_difference',
                                  'goals_scored',
                                  'fair_play',
                                  'random_draw',
                                ],
                                relegationZone: 2,
                                promotionZone: 2,
                              })
                            } else if (type === 'tournament') {
                              setValue('config', {
                                format: 'tournament',
                                groupStage: {
                                  numberOfGroups: 4,
                                  teamsPerGroup: 4,
                                  qualifiersPerGroup: 2,
                                  homeAndAway: true,
                                },
                                knockoutStage: {
                                  rounds: ['quarter-final', 'semi-final', 'final'],
                                  twoLegs: false,
                                  extraTimeOnDraw: true,
                                  penaltiesOnDraw: true,
                                },
                              })
                            } else if (type === 'cup') {
                              setValue('config', {
                                format: 'cup',
                                seeded: false,
                                twoLegs: false,
                                twoLegsFinal: false,
                                extraTimeOnDraw: true,
                                penaltiesOnDraw: true,
                                rounds: ['round-of-16', 'quarter-final', 'semi-final', 'final'],
                                byeAllowed: true,
                              })
                            }
                          }}
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
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <FormField
                      label="Número de Jornadas"
                      htmlFor="config-rounds"
                      error={(errors.config as any)?.rounds?.message}
                      required
                    >
                      <Input
                        id="config-rounds"
                        type="number"
                        min={1}
                        max={100}
                        {...register('config.rounds', { valueAsNumber: true })}
                      />
                    </FormField>

                    <FormField label="Tipo de Turnos" htmlFor="config-homeaway">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-homeaway"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.homeAndAway')}
                        />
                        <label htmlFor="config-homeaway" className="text-sm text-on-surface-variant">
                          Ida e volta (dois turnos)
                        </label>
                      </div>
                    </FormField>

                    <FormField
                      label="Pontos por Vitória"
                      htmlFor="config-points-win"
                      error={(errors.config as any)?.pointsWin?.message}
                      required
                    >
                      <Input
                        id="config-points-win"
                        type="number"
                        min={0}
                        {...register('config.pointsWin', { valueAsNumber: true })}
                      />
                    </FormField>

                    <FormField
                      label="Pontos por Empate"
                      htmlFor="config-points-draw"
                      error={(errors.config as any)?.pointsDraw?.message}
                      required
                    >
                      <Input
                        id="config-points-draw"
                        type="number"
                        min={0}
                        {...register('config.pointsDraw', { valueAsNumber: true })}
                      />
                    </FormField>

                    <FormField
                      label="Pontos por Derrota"
                      htmlFor="config-points-loss"
                      error={(errors.config as any)?.pointsLoss?.message}
                      required
                    >
                      <Input
                        id="config-points-loss"
                        type="number"
                        min={0}
                        {...register('config.pointsLoss', { valueAsNumber: true })}
                      />
                    </FormField>

                    <FormField
                      label="Zonas: Equipas Promovidas"
                      htmlFor="config-promotion"
                      error={(errors.config as any)?.promotionZone?.message}
                    >
                      <Input
                        id="config-promotion"
                        type="number"
                        min={0}
                        {...register('config.promotionZone', { valueAsNumber: true })}
                      />
                    </FormField>

                    <FormField
                      label="Zonas: Equipas Relegadas"
                      htmlFor="config-relegation"
                      error={(errors.config as any)?.relegationZone?.message}
                    >
                      <Input
                        id="config-relegation"
                        type="number"
                        min={0}
                        {...register('config.relegationZone', { valueAsNumber: true })}
                      />
                    </FormField>
                  </div>
                </div>
              )}

              {competitionType === 'tournament' && (
                <div className="space-y-md">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-sm">Fase de Grupos</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <FormField
                      label="Número de Grupos"
                      htmlFor="config-tournament-groups"
                      error={(errors.config as any)?.groupStage?.numberOfGroups?.message}
                      required
                    >
                      <Input
                        id="config-tournament-groups"
                        type="number"
                        min={1}
                        max={32}
                        {...register('config.groupStage.numberOfGroups', { valueAsNumber: true })}
                      />
                    </FormField>

                    <FormField
                      label="Equipas por Grupo"
                      htmlFor="config-tournament-teams-group"
                      error={(errors.config as any)?.groupStage?.teamsPerGroup?.message}
                      required
                    >
                      <Input
                        id="config-tournament-teams-group"
                        type="number"
                        min={2}
                        max={20}
                        {...register('config.groupStage.teamsPerGroup', { valueAsNumber: true })}
                      />
                    </FormField>

                    <FormField
                      label="Qualificados por Grupo"
                      htmlFor="config-tournament-qualifiers"
                      error={(errors.config as any)?.groupStage?.qualifiersPerGroup?.message}
                      required
                      hint="Quantas equipas avançam para a fase eliminatória"
                    >
                      <Input
                        id="config-tournament-qualifiers"
                        type="number"
                        min={1}
                        max={10}
                        {...register('config.groupStage.qualifiersPerGroup', { valueAsNumber: true })}
                      />
                    </FormField>

                    <FormField label="Jogos de Ida e Volta (Grupos)" htmlFor="config-tournament-group-homeaway">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-tournament-group-homeaway"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.groupStage.homeAndAway')}
                        />
                        <label htmlFor="config-tournament-group-homeaway" className="text-sm text-on-surface-variant">
                          Grupos com Ida e Volta
                        </label>
                      </div>
                    </FormField>
                  </div>

                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mt-lg mb-sm">Fase Final (Eliminatórias)</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <FormField label="Ronda Inicial da Fase Final" htmlFor="config-knockout-start-round">
                      <Select
                        id="config-knockout-start-round"
                        value={(watch('config') as TournamentConfig | undefined)?.knockoutStage?.rounds?.[0] || 'final'}
                        onChange={(e) => {
                          const val = e.target.value as KnockoutRound
                          let rounds: KnockoutRound[] = ['final']
                          if (val === 'semi-final') rounds = ['semi-final', 'final']
                          else if (val === 'quarter-final') rounds = ['quarter-final', 'semi-final', 'final']
                          else if (val === 'round-of-16') rounds = ['round-of-16', 'quarter-final', 'semi-final', 'final']
                          else if (val === 'round-of-32') rounds = ['round-of-32', 'round-of-16', 'quarter-final', 'semi-final', 'final']
                          setValue('config.knockoutStage.rounds', rounds)
                        }}
                      >
                        <option value="final">Final Direta (2 equipas)</option>
                        <option value="semi-final">Meias-Finais (4 equipas)</option>
                        <option value="quarter-final">Quartos-de-Final (8 equipas)</option>
                        <option value="round-of-16">Oitavos-de-Final (16 equipas)</option>
                        <option value="round-of-32">16-Avos-de-Final (32 equipas)</option>
                      </Select>
                    </FormField>

                    <FormField label="Eliminatórias a Duas Mãos" htmlFor="config-tournament-knockout-twolegs">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-tournament-knockout-twolegs"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.knockoutStage.twoLegs')}
                        />
                        <label htmlFor="config-tournament-knockout-twolegs" className="text-sm text-on-surface-variant">
                          Ida e volta na Fase Final
                        </label>
                      </div>
                    </FormField>

                    <FormField label="Prolongamento no Empate" htmlFor="config-tournament-knockout-extratime">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-tournament-knockout-extratime"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.knockoutStage.extraTimeOnDraw')}
                        />
                        <label htmlFor="config-tournament-knockout-extratime" className="text-sm text-on-surface-variant">
                          Ter prolongamento (2x15m)
                        </label>
                      </div>
                    </FormField>

                    <FormField label="Penáltis no Empate" htmlFor="config-tournament-knockout-penalties">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-tournament-knockout-penalties"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.knockoutStage.penaltiesOnDraw')}
                        />
                        <label htmlFor="config-tournament-knockout-penalties" className="text-sm text-on-surface-variant">
                          Decidir por grandes penalidades
                        </label>
                      </div>
                    </FormField>
                  </div>
                </div>
              )}

              {competitionType === 'cup' && (
                <div className="space-y-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-md">
                    <FormField label="Ronda Inicial da Taça" htmlFor="config-cup-start-round">
                      <Select
                        id="config-cup-start-round"
                        value={(watch('config') as CupConfig | undefined)?.rounds?.[0] || 'final'}
                        onChange={(e) => {
                          const val = e.target.value as CupRound
                          let rounds: CupRound[] = ['final']
                          if (val === 'semi-final') rounds = ['semi-final', 'final']
                          else if (val === 'quarter-final') rounds = ['quarter-final', 'semi-final', 'final']
                          else if (val === 'round-of-16') rounds = ['round-of-16', 'quarter-final', 'semi-final', 'final']
                          else if (val === 'round-of-32') rounds = ['round-of-32', 'round-of-16', 'quarter-final', 'semi-final', 'final']
                          else if (val === 'round-of-64') rounds = ['round-of-64', 'round-of-32', 'round-of-16', 'quarter-final', 'semi-final', 'final']
                          setValue('config.rounds', rounds)
                        }}
                      >
                        <option value="final">Final Direta (2 equipas)</option>
                        <option value="semi-final">Meias-Finais (4 equipas)</option>
                        <option value="quarter-final">Quartos-de-Final (8 equipas)</option>
                        <option value="round-of-16">Oitavos-de-Final (16 equipas)</option>
                        <option value="round-of-32">16-Avos-de-Final (32 equipas)</option>
                        <option value="round-of-64">32-Avos-de-Final (64 equipas)</option>
                      </Select>
                    </FormField>

                    <FormField label="Sorteio com Cabeças-de-Série" htmlFor="config-cup-seeded">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-cup-seeded"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.seeded')}
                        />
                        <label htmlFor="config-cup-seeded" className="text-sm text-on-surface-variant">
                          Usar potes de sementes (seeded)
                        </label>
                      </div>
                    </FormField>

                    <FormField label="Duas Mãos (exceto Final)" htmlFor="config-cup-twolegs">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-cup-twolegs"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.twoLegs')}
                        />
                        <label htmlFor="config-cup-twolegs" className="text-sm text-on-surface-variant">
                          Jogos a duas mãos
                        </label>
                      </div>
                    </FormField>

                    <FormField label="Final a Duas Mãos" htmlFor="config-cup-twolegsfinal">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-cup-twolegsfinal"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.twoLegsFinal')}
                        />
                        <label htmlFor="config-cup-twolegsfinal" className="text-sm text-on-surface-variant">
                          Final também a ida e volta
                        </label>
                      </div>
                    </FormField>

                    <FormField label="Prolongamento no Empate" htmlFor="config-cup-extratime">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-cup-extratime"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.extraTimeOnDraw')}
                        />
                        <label htmlFor="config-cup-extratime" className="text-sm text-on-surface-variant">
                          Ter prolongamento
                        </label>
                      </div>
                    </FormField>

                    <FormField label="Penáltis no Empate" htmlFor="config-cup-penalties">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-cup-penalties"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.penaltiesOnDraw')}
                        />
                        <label htmlFor="config-cup-penalties" className="text-sm text-on-surface-variant">
                          Decidir por grandes penalidades
                        </label>
                      </div>
                    </FormField>

                    <FormField label="Permitir Isenções (Byes)" htmlFor="config-cup-byes">
                      <div className="flex items-center gap-sm mt-xs">
                        <input
                          id="config-cup-byes"
                          type="checkbox"
                          className="h-4 w-4 rounded border-outline-variant accent-primary"
                          {...register('config.byeAllowed')}
                        />
                        <label htmlFor="config-cup-byes" className="text-sm text-on-surface-variant">
                          Avance automático para número ímpar
                        </label>
                      </div>
                    </FormField>
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
                <div className="grid grid-cols-2 gap-md text-sm">
                  <div>
                    <dt className="text-on-surface-variant text-xs">Nome</dt>
                    <dd className="font-medium text-on-surface mt-xs">{watch('name') || '–'}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant text-xs">Época</dt>
                    <dd className="font-medium text-on-surface mt-xs">{watch('season') || '–'}</dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant text-xs">Formato</dt>
                    <dd className="font-medium text-on-surface mt-xs">
                      {FORMAT_LABELS[competitionType as CompetitionType]?.title || competitionType}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-on-surface-variant text-xs">Estado Inicial</dt>
                    <dd className="font-medium text-on-surface mt-xs">
                      {watch('status') === 'draft' ? 'Rascunho' : 'Ativa'}
                    </dd>
                  </div>
                  {competitionType === 'league' && configVal && (
                    <div className="col-span-2 border-t border-outline-variant/10 pt-md mt-xs">
                      <dt className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-xs">Configurações da Liga</dt>
                      <dd className="grid grid-cols-2 gap-xs text-xs text-on-surface-variant">
                        <div>Jornadas: <strong className="text-on-surface">{(configVal as LeagueConfig).rounds}</strong></div>
                        <div>Ida e Volta: <strong className="text-on-surface">{(configVal as LeagueConfig).homeAndAway ? 'Sim' : 'Não'}</strong></div>
                        <div>Pontuação (V/E/D): <strong className="text-on-surface">{(configVal as LeagueConfig).pointsWin}/{(configVal as LeagueConfig).pointsDraw}/{(configVal as LeagueConfig).pointsLoss}</strong></div>
                        <div>Zonas (Promoção/Relegação): <strong className="text-on-surface">{(configVal as LeagueConfig).promotionZone}/{(configVal as LeagueConfig).relegationZone}</strong></div>
                      </dd>
                    </div>
                  )}
                  {competitionType === 'tournament' && configVal && (
                    <div className="col-span-2 border-t border-outline-variant/10 pt-md mt-xs">
                      <dt className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-xs">Configurações do Torneio</dt>
                      <dd className="grid grid-cols-2 gap-xs text-xs text-on-surface-variant">
                        <div>Grupos: <strong className="text-on-surface">{(configVal as TournamentConfig).groupStage.numberOfGroups} grupos</strong></div>
                        <div>Equipas por Grupo: <strong className="text-on-surface">{(configVal as TournamentConfig).groupStage.teamsPerGroup} equipas</strong></div>
                        <div>Qualificados / Grupo: <strong className="text-on-surface">{(configVal as TournamentConfig).groupStage.qualifiersPerGroup}</strong></div>
                        <div>Ida e Volta (Grupos): <strong className="text-on-surface">{(configVal as TournamentConfig).groupStage.homeAndAway ? 'Sim' : 'Não'}</strong></div>
                        <div>Ronda Inicial Final: <strong className="text-on-surface">{(configVal as TournamentConfig).knockoutStage.rounds?.[0]}</strong></div>
                        <div>Duas Mãos (Final): <strong className="text-on-surface">{(configVal as TournamentConfig).knockoutStage.twoLegs ? 'Sim' : 'Não'}</strong></div>
                      </dd>
                    </div>
                  )}
                  {competitionType === 'cup' && configVal && (
                    <div className="col-span-2 border-t border-outline-variant/10 pt-md mt-xs">
                      <dt className="text-on-surface-variant text-xs font-semibold uppercase tracking-wider mb-xs">Configurações da Taça</dt>
                      <dd className="grid grid-cols-2 gap-xs text-xs text-on-surface-variant">
                        <div>Ronda Inicial: <strong className="text-on-surface">{(configVal as CupConfig).rounds?.[0]}</strong></div>
                        <div>Sorteio com Sementes: <strong className="text-on-surface">{(configVal as CupConfig).seeded ? 'Sim' : 'Não'}</strong></div>
                        <div>Eliminatórias a Duas Mãos: <strong className="text-on-surface">{(configVal as CupConfig).twoLegs ? 'Sim' : 'Não'}</strong></div>
                        <div>Final a Duas Mãos: <strong className="text-on-surface">{(configVal as CupConfig).twoLegsFinal ? 'Sim' : 'Não'}</strong></div>
                        <div>Byes na 1ª Ronda: <strong className="text-on-surface">{(configVal as CupConfig).byeAllowed ? 'Sim' : 'Não'}</strong></div>
                      </dd>
                    </div>
                  )}
                </div>
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
