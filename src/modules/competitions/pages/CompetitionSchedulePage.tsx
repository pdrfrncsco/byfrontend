import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Loader2, Zap, Edit3, Check, XCircle } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input } from '@/components/ui'
import { useGenerateSchedule, useCompetitionMatches, useUpdateMatchScore } from '../hooks/useCompetitionPhase3'
import { useCompetition } from '../hooks/useCompetitions'
import { generateScheduleSchema, type GenerateScheduleFormData } from '../schemas'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { MatchCard } from '../components/MatchCard'
import type { Match } from '../types'

/**
 * CompetitionSchedulePage — configure, generate, and manage competition matches.
 * Protected route — requires org admin role.
 */
export function CompetitionSchedulePage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const generateSchedule = useGenerateSchedule(competitionId)
  const { data: matches = [], isLoading: loadingMatches } = useCompetitionMatches(competitionId)
  const updateMatchScore = useUpdateMatchScore(competitionId)

  const [generated, setGenerated] = useState(false)
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null)
  const [editHomeScore, setEditHomeScore] = useState<string>('')
  const [editAwayScore, setEditAwayScore] = useState<string>('')
  const [editStatus, setEditStatus] = useState<string>('finished')

  // Group matches by round
  const rounds = (matches as Match[]).reduce<Record<number, Match[]>>((acc, m) => {
    if (!acc[m.round_number]) acc[m.round_number] = []
    acc[m.round_number].push(m)
    return acc
  }, {})

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

  const startEditMatch = (match: Match) => {
    setEditingMatchId(match.id)
    setEditHomeScore(match.home_score?.toString() || '')
    setEditAwayScore(match.away_score?.toString() || '')
    setEditStatus(match.status)
  }

  const cancelEditMatch = () => {
    setEditingMatchId(null)
    setEditHomeScore('')
    setEditAwayScore('')
    setEditStatus('finished')
  }

  const saveEditMatch = () => {
    if (!editingMatchId) return
    const homeScore = parseInt(editHomeScore, 10)
    const awayScore = parseInt(editAwayScore, 10)
    if (isNaN(homeScore) || isNaN(awayScore)) return

    updateMatchScore.mutate(
      {
        matchId: editingMatchId,
        homeScore,
        awayScore,
        status: editStatus,
      },
      {
        onSuccess: () => cancelEditMatch(),
      }
    )
  }

  if (loadingComp) {
    return (
      <DashboardLayout
        title="Calendário e Partidas"
        subtitle="Configurar calendário e gerir partidas da competição."
        dashboardType="competition"
        sidebarLinks={sidebarLinks}
      >
        <Card variant="flat" padding="lg" className="space-y-sm">
          <div className="h-5 w-48 rounded-full bg-surface-container-high animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-surface-container-high animate-pulse" />
          <div className="h-10 w-full rounded-lg bg-surface-container-high animate-pulse" />
        </Card>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Calendário e Partidas"
      subtitle={competition ? `${competition.name} — ${competition.season}` : 'Configurar calendário e gerir partidas da competição.'}
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={competitionRoutes.detail(competitionId)}>
            <Calendar className="h-4 w-4" />
            <span>Ver página pública</span>
          </Link>
        </Button>
      }
    >
      {/* Success message for schedule generation */}
      {generated && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-md text-sm font-medium text-emerald-700"
        >
          Calendário gerado com sucesso. Os jogos já estão visíveis na página da competição.
        </div>
      )}

      <div className="space-y-xl">
        {/* Generate Schedule Card */}
        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>Gerar Calendário</CardTitle>
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
                      {Object.keys(rounds).length > 0 ? 'Regenerar Calendário' : 'Gerar Calendário'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Matches List */}
        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>Partidas</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingMatches ? (
              <div className="flex flex-col gap-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-container-high" />
                ))}
              </div>
            ) : Object.keys(rounds).length === 0 ? (
              <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
                <Calendar className="h-12 w-12 opacity-30" />
                <p className="font-medium">Calendário ainda não gerado.</p>
                <p className="text-sm opacity-70">Gere o calendário acima para adicionar partidas.</p>
              </div>
            ) : (
              <div className="space-y-xl">
                {Object.entries(rounds)
                  .sort(([a], [b]) => Number(a) - Number(b))
                  .map(([round, roundMatches]) => (
                    <div key={round} className="space-y-sm">
                      <h3 className="flex items-center gap-sm text-sm font-semibold text-on-surface-variant">
                        <span className="inline-flex items-center rounded-full bg-primary-container/20 px-sm py-0.5 text-xs font-bold text-primary">
                          Jornada {round}
                        </span>
                      </h3>
                      <div className="space-y-sm">
                        {roundMatches.map(match => (
                          <div key={match.id} className="space-y-sm">
                            <MatchCard
                              match={match}
                              competitionId={competitionId}
                              showLink
                            />
                            {editingMatchId === match.id ? (
                              <div className="rounded-xl border border-outline-variant/20 bg-surface-container p-md space-y-md">
                                <div className="flex items-center justify-between gap-sm">
                                  <h4 className="text-sm font-semibold text-on-surface">Editar Resultado</h4>
                                  <button
                                    onClick={cancelEditMatch}
                                    className="text-on-surface-variant hover:text-error"
                                  >
                                    <XCircle className="h-4 w-4" />
                                  </button>
                                </div>
                                <div className="grid grid-cols-3 gap-md items-end">
                                  <div className="space-y-xs">
                                    <label className="text-xs font-semibold text-on-surface-variant">
                                      {match.home_club_name}
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={editHomeScore}
                                      onChange={(e) => setEditHomeScore(e.target.value)}
                                    />
                                  </div>
                                  <div className="space-y-xs">
                                    <label className="text-xs font-semibold text-on-surface-variant">
                                      Estado
                                    </label>
                                    <select
                                      value={editStatus}
                                      onChange={(e) => setEditStatus(e.target.value)}
                                      className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                                    >
                                      <option value="scheduled">Agendado</option>
                                      <option value="live">Em Jogo</option>
                                      <option value="finished">Terminado</option>
                                      <option value="postponed">Adiado</option>
                                      <option value="cancelled">Cancelado</option>
                                    </select>
                                  </div>
                                  <div className="space-y-xs">
                                    <label className="text-xs font-semibold text-on-surface-variant">
                                      {match.away_club_name}
                                    </label>
                                    <Input
                                      type="number"
                                      min="0"
                                      value={editAwayScore}
                                      onChange={(e) => setEditAwayScore(e.target.value)}
                                    />
                                  </div>
                                </div>
                                <div className="flex justify-end gap-sm">
                                  <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={cancelEditMatch}
                                  >
                                    Cancelar
                                  </Button>
                                  <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={saveEditMatch}
                                    disabled={updateMatchScore.isPending}
                                  >
                                    {updateMatchScore.isPending ? (
                                      <>
                                        <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                                        A guardar...
                                      </>
                                    ) : (
                                      <>
                                        <Check className="mr-xs h-4 w-4" />
                                        Guardar
                                      </>
                                    )}
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex justify-end">
                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => startEditMatch(match)}
                                >
                                  <Edit3 className="mr-xs h-4 w-4" />
                                  Editar Resultado
                                </Button>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
