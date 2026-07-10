import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, ChevronLeft, Loader2, Zap } from 'lucide-react'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input } from '@/components/ui'
import { useGenerateSchedule } from '../hooks/useCompetitionPhase3'
import { useCompetition } from '../hooks/useCompetitions'
import { generateScheduleSchema, type GenerateScheduleFormData } from '../schemas'
import { CompetitionHeaderSkeleton } from '../components/CompetitionHeader'

/**
 * CompetitionSchedulePage — configure and generate the competition calendar.
 * Protected route — requires org admin role.
 */
export function CompetitionSchedulePage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const generateSchedule = useGenerateSchedule(competitionId)

  const [generated, setGenerated] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<GenerateScheduleFormData>({
    resolver: zodResolver(generateScheduleSchema),
    defaultValues: {
      start_date: '',
      rounds_interval_days: 7,
      double_round: true,
    },
  })

  const onSubmit = (data: GenerateScheduleFormData) => {
    generateSchedule.mutate(
      {
        startDate: data.start_date,
        roundsIntervalDays: data.rounds_interval_days,
        doubleRound: data.double_round,
      },
      {
        onSuccess: () => setGenerated(true),
      }
    )
  }

  if (loadingComp) return <CompetitionHeaderSkeleton />

  return (
    <div className="mx-auto max-w-2xl space-y-xl p-xl">
      {/* Back */}
      <Link
        to={`/competitions/${competitionId}`}
        className="inline-flex items-center gap-xs text-sm text-on-surface-variant transition-colors hover:text-on-surface"
      >
        <ChevronLeft className="h-4 w-4" />
        Voltar à Competição
      </Link>

      {/* Header */}
      <div className="space-y-xs">
        <div className="inline-flex items-center gap-sm rounded-full border border-primary/15 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          <Calendar className="h-3.5 w-3.5" />
          Calendário
        </div>
        <h1 className="text-2xl font-bold text-on-surface">
          Gerar Calendário
        </h1>
        {competition && (
          <p className="text-sm text-on-surface-variant">
            {competition.name} — {competition.season}
          </p>
        )}
      </div>

      {generated && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-md text-sm font-medium text-emerald-700"
        >
          ✓ Calendário gerado com sucesso! Os jogos já estão visíveis na página da competição.
        </div>
      )}

      <Card variant="flat" padding="none">
        <CardHeader>
          <CardTitle>Parâmetros do Calendário</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            id="generate-schedule-form"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="space-y-lg"
          >
            <FormField
              label="Data de Início"
              htmlFor="schedule-start-date"
              error={errors.start_date?.message}
              required
              hint="Data do primeiro jogo da competição"
            >
              <Input
                id="schedule-start-date"
                type="date"
                aria-invalid={!!errors.start_date}
                {...register('start_date')}
              />
            </FormField>

            <FormField
              label="Intervalo entre Jornadas (dias)"
              htmlFor="schedule-interval"
              error={errors.rounds_interval_days?.message}
              required
              hint="Número de dias entre cada jornada (ex: 7 para semanal)"
            >
              <Input
                id="schedule-interval"
                type="number"
                min={1}
                max={30}
                aria-invalid={!!errors.rounds_interval_days}
                {...register('rounds_interval_days', { valueAsNumber: true })}
              />
            </FormField>

            <FormField
              label="Turno Duplo"
              htmlFor="schedule-double-round"
              hint="Gera dois turnos (casa e fora) para cada par de equipes"
            >
              <div className="flex items-center gap-sm">
                <input
                  id="schedule-double-round"
                  type="checkbox"
                  className="h-4 w-4 rounded border-outline accent-primary"
                  {...register('double_round')}
                />
                <label htmlFor="schedule-double-round" className="text-sm text-on-surface-variant">
                  Gerar jogo de volta para cada emparelhamento
                </label>
              </div>
            </FormField>

            <div className="flex justify-end pt-sm">
              <Button
                type="submit"
                variant="primary"
                disabled={generateSchedule.isPending}
                id="generate-schedule-btn"
              >
                {generateSchedule.isPending ? (
                  <>
                    <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                    A gerar...
                  </>
                ) : (
                  <>
                    <Zap className="mr-xs h-4 w-4" />
                    Gerar Calendário
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
