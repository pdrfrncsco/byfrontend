import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Calendar, Loader2, Zap, Edit3, Check, XCircle, PlusCircle } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button, Card, CardContent, CardHeader, CardTitle, FormField, Input } from '@/components/ui'
import { useCompetitionRounds, useGenerateSchedule, useUpdateMatchScore, useCompetitionStandings, useCreateMatch } from '../hooks/useCompetitionMatches'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionConfig } from '../hooks/useCompetitionConfig'
import {
  createMatchSchema,
  generateScheduleSchema,
  type CreateMatchFormData,
  type GenerateScheduleFormData,
} from '../schemas'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarLinks } from '../constants'
import { MatchCard } from '../components/MatchCard'
import type { Match } from '../types'
import type { CompetitionRoundView } from '../hooks/useCompetitionMatches'

/**
 * CompetitionSchedulePage — configure, generate, and manage competition matches.
 * Protected route — requires org admin role.
 */
export function CompetitionSchedulePage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const sidebarLinks = getCompetitionSidebarLinks(competitionId)
  const { isLeague, isCup, isTournament } = useCompetitionConfig(competitionId)

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { data: roundsView, isLoading: loadingRounds } = useCompetitionRounds(competitionId)
  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(competitionId)
  const generateSchedule = useGenerateSchedule(competitionId)
  const createMatch = useCreateMatch(competitionId)
  const updateMatchScore = useUpdateMatchScore(competitionId)

  const [generated, setGenerated] = useState(false)
  const [manualCreated, setManualCreated] = useState(false)
  const [quickCreateLabel, setQuickCreateLabel] = useState<string | null>(null)
  const [editingMatchId, setEditingMatchId] = useState<string | null>(null)
  const [editHomeScore, setEditHomeScore] = useState<string>('')
  const [editAwayScore, setEditAwayScore] = useState<string>('')
  const [editStatus, setEditStatus] = useState<string>('finished')
  const createMatchCardRef = useRef<HTMLDivElement | null>(null)

  const rounds = roundsView?.rounds ?? []
  const registeredClubs = useMemo(
    () =>
      standings
        .map((standing) => ({
          id: standing.club,
          name: standing.club_name,
          logo: standing.club_logo,
        }))
        .sort((a, b) => a.name.localeCompare(b.name)),
    [standings]
  )

  const generateForm = useForm<GenerateScheduleFormData>({
    resolver: zodResolver(generateScheduleSchema),
    defaultValues: {
      start_date: '',
      rounds_interval_days: 7,
      double_round: true,
      seed: '',
    },
  })

  const createMatchForm = useForm<CreateMatchFormData>({
    resolver: zodResolver(createMatchSchema),
    defaultValues: {
      home_club: '',
      away_club: '',
      match_date: '',
      round_number: 1,
      round_name: '',
      phase: '',
      group_id: '',
      venue: '',
      status: 'scheduled',
    },
  })

  const manualMatchPhase = createMatchForm.watch('phase')?.trim() || ''
  const isManualGroupStage = isTournament && manualMatchPhase === 'group_stage'

  useEffect(() => {
    if (isLeague) {
      createMatchForm.setValue('phase', '')
      createMatchForm.setValue('group_id', '')
      return
    }

    if (isCup) {
      createMatchForm.setValue('phase', 'knockout')
      createMatchForm.setValue('group_id', '')
      return
    }

    if (isTournament && !manualMatchPhase) {
      createMatchForm.setValue('phase', 'group_stage')
    }
  }, [createMatchForm, isCup, isLeague, isTournament, manualMatchPhase])

  useEffect(() => {
    if (isTournament && manualMatchPhase !== 'group_stage' && createMatchForm.getValues('group_id')) {
      createMatchForm.setValue('group_id', '')
    }
  }, [createMatchForm, isTournament, manualMatchPhase])

  const getRoundDisplayLabel = (round: CompetitionRoundView) => {
    const roundNum = round.number
    if (round.label && !/^Ronda\s+\d+$/i.test(round.label)) {
      return round.label
    }
    if (isLeague) {
      return `Jornada ${roundNum}`
    }
    if (isCup && competition?.config?.format === 'cup') {
      const cupRounds = competition.config.rounds || []
      const roundKey = cupRounds[roundNum - 1]
      if (roundKey) {
        switch (roundKey) {
          case 'final':
            return 'Final'
          case 'semi-final':
            return 'Meias-Finais'
          case 'quarter-final':
            return 'Quartos-de-Finais'
          case 'round-of-16':
            return 'Oitavos-de-Finais'
          case 'round-of-32':
            return '16-Avos-de-Final'
          case 'round-of-64':
            return '32-Avos-de-Final'
          default:
            break
        }
      }
      return `Ronda ${roundNum}`
    }
    if (competition?.config?.format === 'tournament') {
      const tournamentConfig = competition.config as any
      const teams = tournamentConfig.groupStage?.teamsPerGroup || 4
      const double = tournamentConfig.groupStage?.homeAndAway ? 2 : 1
      const groupRounds = (teams - 1) * double
      if (roundNum <= groupRounds) {
        return `Fase de Grupos — Jornada ${roundNum}`
      }

      const knockoutRoundIndex = roundNum - groupRounds - 1
      const koRounds = tournamentConfig.knockoutStage?.rounds || []
      const koKey = koRounds[knockoutRoundIndex]
      if (koKey) {
        switch (koKey) {
          case 'final':
            return 'Final'
          case 'semi-final':
            return 'Meias-Finais'
          case 'quarter-final':
            return 'Quartos-de-Finais'
          case 'round-of-16':
            return 'Oitavos-de-Finais'
          case 'round-of-32':
            return '16-Avos-de-Final'
          default:
            break
        }
      }
      return `Fase Final — Ronda ${roundNum - groupRounds}`
    }
    return `Ronda ${roundNum}`
  }

  const onGenerateSubmit = (data: GenerateScheduleFormData) => {
    generateSchedule.mutate(
      {
        startDate: data.start_date,
        roundsIntervalDays: data.rounds_interval_days,
        doubleRound: isLeague ? data.double_round : false,
        seed: data.seed?.trim() || undefined,
      },
      {
        onSuccess: () => setGenerated(true),
      }
    )
  }

  const onCreateMatchSubmit = (data: CreateMatchFormData) => {
    createMatch.mutate(data, {
      onSuccess: () => {
        setManualCreated(true)
        setQuickCreateLabel(null)
        createMatchForm.reset({
          home_club: '',
          away_club: '',
          match_date: '',
          round_number: 1,
          round_name: '',
          phase: '',
          group_id: '',
          venue: '',
          status: 'scheduled',
        })
      },
    })
  }

  const applyRoundContext = (round: CompetitionRoundView) => {
    const nextPhase = round.phase ?? (isLeague ? '' : isCup ? 'knockout' : 'group_stage')
    const nextGroupId = isLeague ? '' : round.groupId ?? (nextPhase === 'group_stage' ? 'A' : '')

    createMatchForm.setValue('round_number', round.number)
    createMatchForm.setValue('round_name', round.label)
    createMatchForm.setValue('phase', nextPhase)
    createMatchForm.setValue('group_id', nextGroupId)

    setQuickCreateLabel(round.label)
    window.setTimeout(() => {
      createMatchCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 0)
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
    if (Number.isNaN(homeScore) || Number.isNaN(awayScore)) return

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
      {generated && (
        <div
          role="status"
          className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-md text-sm font-medium text-emerald-700"
        >
          {isLeague
            ? 'Calendário gerado com sucesso. Os jogos já estão visíveis na página da competição.'
            : 'Sorteio e partidas gerados com sucesso. A estrutura da competição foi atualizada.'}
        </div>
      )}

      {manualCreated && (
        <div
          role="status"
          className="rounded-xl border border-primary/20 bg-primary/10 p-md text-sm font-medium text-primary"
        >
          Partida criada com sucesso. O calendário foi atualizado imediatamente.
        </div>
      )}

      <div className="space-y-xl">
        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>{isLeague ? 'Gerar Calendário' : 'Gerar Sorteio e Partidas'}</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={generateForm.handleSubmit(onGenerateSubmit)} noValidate className="space-y-lg">
              <FormField
                label="Data de Início"
                htmlFor="schedule-start-date"
                error={generateForm.formState.errors.start_date?.message}
                required
                hint="Data do primeiro jogo da competição"
              >
                <Input
                  id="schedule-start-date"
                  type="date"
                  aria-invalid={!!generateForm.formState.errors.start_date}
                  {...generateForm.register('start_date')}
                />
              </FormField>

              <FormField
                label="Intervalo entre Jornadas (dias)"
                htmlFor="schedule-interval"
                error={generateForm.formState.errors.rounds_interval_days?.message}
                required
                hint="Número de dias entre cada jornada (ex: 7 para semanal)"
              >
                <Input
                  id="schedule-interval"
                  type="number"
                  min={1}
                  max={30}
                  aria-invalid={!!generateForm.formState.errors.rounds_interval_days}
                  {...generateForm.register('rounds_interval_days', { valueAsNumber: true })}
                />
              </FormField>

              {!isLeague ? (
                <FormField
                  label="Seed do Sorteio"
                  htmlFor="schedule-seed"
                  error={generateForm.formState.errors.seed?.message}
                  hint="Opcional. Use uma seed para reproduzir o mesmo sorteio depois."
                >
                  <Input
                    id="schedule-seed"
                    type="text"
                    placeholder="Ex: sorteio-2026"
                    aria-invalid={!!generateForm.formState.errors.seed}
                    {...generateForm.register('seed')}
                  />
                </FormField>
              ) : (
                <FormField
                  label="Turno Duplo"
                  htmlFor="schedule-double-round"
                  hint="Gera dois turnos (casa e fora) para cada emparelhamento"
                >
                  <div className="flex items-center gap-sm">
                    <input
                      id="schedule-double-round"
                      type="checkbox"
                      className="h-4 w-4 rounded border-outline accent-primary"
                      {...generateForm.register('double_round')}
                    />
                    <label htmlFor="schedule-double-round" className="text-sm text-on-surface-variant">
                      Gerar jogo de volta para cada emparelhamento
                    </label>
                  </div>
                </FormField>
              )}

              <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-md text-sm text-on-surface-variant">
                {isLeague
                  ? 'A geração usa o modelo de pontos corridos e cria todas as jornadas com a sequência definida.'
                  : 'A geração usa o sorteio oficial para taça ou torneio e cria as partidas de acordo com a fase da competição.'}
              </div>

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
                      {isLeague
                        ? rounds.length > 0
                          ? 'Regenerar Calendário'
                          : 'Gerar Calendário'
                        : rounds.length > 0
                          ? 'Regenerar Sorteio'
                          : 'Gerar Sorteio'}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>Criar Partida Avulsa</CardTitle>
          </CardHeader>
          <CardContent ref={createMatchCardRef}>
            {quickCreateLabel && (
              <div className="mb-md rounded-xl border border-primary/20 bg-primary/10 px-md py-sm text-sm text-primary">
                Contexto carregado da ronda <span className="font-semibold">{quickCreateLabel}</span>.
              </div>
            )}
            {loadingStandings ? (
              <div className="h-24 animate-pulse rounded-xl bg-surface-container-high" />
            ) : registeredClubs.length < 2 ? (
              <div className="flex flex-col items-center gap-md rounded-xl border border-dashed border-outline-variant/30 px-lg py-2xl text-center text-on-surface-variant">
                <PlusCircle className="h-10 w-10 opacity-40" />
                <div className="space-y-xs">
                  <p className="font-medium text-on-surface">Sem clubes suficientes para criar partidas.</p>
                  <p className="text-sm opacity-70">
                    Registe pelo menos dois clubes na competição para ativar a criação manual.
                  </p>
                </div>
              </div>
            ) : (
              <form
                onSubmit={createMatchForm.handleSubmit(onCreateMatchSubmit)}
                noValidate
                className="space-y-lg"
              >
                <div className="grid gap-md md:grid-cols-2">
                  <FormField
                    label="Clube da Casa"
                    htmlFor="manual-home-club"
                    error={createMatchForm.formState.errors.home_club?.message}
                    required
                  >
                    <select
                      id="manual-home-club"
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                      {...createMatchForm.register('home_club')}
                    >
                      <option value="">Selecionar clube</option>
                      {registeredClubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </FormField>

                  <FormField
                    label="Clube Visitante"
                    htmlFor="manual-away-club"
                    error={createMatchForm.formState.errors.away_club?.message}
                    required
                  >
                    <select
                      id="manual-away-club"
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                      {...createMatchForm.register('away_club')}
                    >
                      <option value="">Selecionar clube</option>
                      {registeredClubs.map((club) => (
                        <option key={club.id} value={club.id}>
                          {club.name}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>

                <div className="grid gap-md md:grid-cols-2">
                  <FormField
                    label="Data e Hora"
                    htmlFor="manual-match-date"
                    error={createMatchForm.formState.errors.match_date?.message}
                    required
                    hint="Use a data e hora local do jogo"
                  >
                    <Input
                      id="manual-match-date"
                      type="datetime-local"
                      aria-invalid={!!createMatchForm.formState.errors.match_date}
                      {...createMatchForm.register('match_date')}
                    />
                  </FormField>

                  <FormField
                    label="Jornada"
                    htmlFor="manual-round-number"
                    error={createMatchForm.formState.errors.round_number?.message}
                    required
                  >
                    <Input
                      id="manual-round-number"
                      type="number"
                      min={1}
                      aria-invalid={!!createMatchForm.formState.errors.round_number}
                      {...createMatchForm.register('round_number', { valueAsNumber: true })}
                    />
                  </FormField>
                </div>

                {isTournament && (
                  <div className="grid gap-md md:grid-cols-2">
                    <FormField
                      label="Fase"
                      htmlFor="manual-phase"
                      error={createMatchForm.formState.errors.phase?.message}
                      required
                      hint="Escolha entre fase de grupos ou eliminatórias"
                    >
                      <select
                        id="manual-phase"
                        className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                        {...createMatchForm.register('phase')}
                      >
                        <option value="group_stage">Fase de Grupos</option>
                        <option value="knockout">Fase Final</option>
                      </select>
                    </FormField>

                    {isManualGroupStage ? (
                      <FormField
                        label="Grupo"
                        htmlFor="manual-group-id"
                        error={createMatchForm.formState.errors.group_id?.message}
                        required
                        hint="Ex: A, B, C"
                      >
                        <Input
                          id="manual-group-id"
                          type="text"
                          placeholder="Ex: A"
                          {...createMatchForm.register('group_id')}
                        />
                      </FormField>
                    ) : (
                      <FormField
                        label="Grupo"
                        htmlFor="manual-group-id"
                        hint="Não aplicável para a fase final"
                      >
                        <Input
                          id="manual-group-id"
                          type="text"
                          placeholder="Opcional"
                          disabled
                          {...createMatchForm.register('group_id')}
                        />
                      </FormField>
                    )}
                  </div>
                )}

                {isCup && (
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-md text-sm text-on-surface-variant">
                    Esta competição usa eliminação directa. A partida será criada na fase <span className="font-semibold text-on-surface">knockout</span>.
                  </div>
                )}

                {isLeague && (
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container-low p-md text-sm text-on-surface-variant">
                    As competições em liga não usam fase nem grupo na criação manual. O jogo entra directamente na jornada indicada.
                  </div>
                )}

                <div className="grid gap-md md:grid-cols-2">
                  <FormField
                    label="Nome da Jornada"
                    htmlFor="manual-round-name"
                    error={createMatchForm.formState.errors.round_name?.message}
                    hint="Opcional. Ex: Jornada 3, Final, Meias-Finais"
                  >
                    <Input
                      id="manual-round-name"
                      type="text"
                      placeholder="Ex: Jornada 3"
                      {...createMatchForm.register('round_name')}
                    />
                  </FormField>

                  <FormField
                    label="Estado Inicial"
                    htmlFor="manual-status"
                    error={createMatchForm.formState.errors.status?.message}
                    required
                  >
                    <select
                      id="manual-status"
                      className="w-full rounded-lg border border-outline-variant/30 bg-surface-container-high px-md py-sm text-sm text-on-surface focus:border-primary focus:outline-none"
                      {...createMatchForm.register('status')}
                    >
                      <option value="scheduled">Agendado</option>
                      <option value="live">Em Jogo</option>
                      <option value="finished">Terminado</option>
                      <option value="postponed">Adiado</option>
                      <option value="cancelled">Cancelado</option>
                    </select>
                  </FormField>
                </div>

                <FormField
                  label="Estádio"
                  htmlFor="manual-venue"
                  error={createMatchForm.formState.errors.venue?.message}
                  hint="Opcional. Nome do local da partida"
                >
                  <Input id="manual-venue" type="text" placeholder="Estádio" {...createMatchForm.register('venue')} />
                </FormField>

                <div className="flex justify-end pt-sm">
                  <Button type="submit" variant="primary" disabled={createMatch.isPending}>
                    {createMatch.isPending ? (
                      <>
                        <Loader2 className="mr-xs h-4 w-4 animate-spin" />
                        A criar...
                      </>
                    ) : (
                      <>
                        <PlusCircle className="mr-xs h-4 w-4" />
                        Criar Partida
                      </>
                    )}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>Partidas</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingRounds ? (
              <div className="flex flex-col gap-sm">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="h-24 animate-pulse rounded-xl bg-surface-container-high" />
                ))}
              </div>
            ) : rounds.length === 0 ? (
              <div className="flex flex-col items-center gap-md py-2xl text-on-surface-variant">
                <Calendar className="h-12 w-12 opacity-30" />
                <p className="font-medium">Calendário ainda não gerado.</p>
                <p className="text-sm opacity-70">Use o formulário acima para gerar o calendário ou criar uma partida.</p>
              </div>
            ) : (
              <div className="space-y-xl">
                {rounds.map((round) => (
                  <div key={round.id} className="space-y-sm">
                    <h3 className="flex flex-wrap items-center justify-between gap-sm text-sm font-semibold text-on-surface-variant">
                      <span className="inline-flex items-center rounded-full bg-primary-container/20 px-sm py-0.5 text-xs font-bold text-primary">
                        {getRoundDisplayLabel(round)}
                      </span>
                      <Button variant="secondary" size="sm" type="button" onClick={() => applyRoundContext(round)}>
                        <PlusCircle className="mr-xs h-4 w-4" />
                        Criar nesta ronda
                      </Button>
                    </h3>
                    <div className="space-y-sm">
                      {round.matches.map((match) => (
                        <div key={match.id} className="space-y-sm">
                          <MatchCard match={match} competitionId={competitionId} showLink />
                          {editingMatchId === match.id ? (
                            <div className="space-y-md rounded-xl border border-outline-variant/20 bg-surface-container p-md">
                              <div className="flex items-center justify-between gap-sm">
                                <h4 className="text-sm font-semibold text-on-surface">Editar Resultado</h4>
                                <button
                                  type="button"
                                  onClick={cancelEditMatch}
                                  className="text-on-surface-variant hover:text-error"
                                >
                                  <XCircle className="h-4 w-4" />
                                </button>
                              </div>
                              <div className="grid grid-cols-3 items-end gap-md">
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
                                  <label className="text-xs font-semibold text-on-surface-variant">Estado</label>
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
                                <Button variant="secondary" size="sm" type="button" onClick={cancelEditMatch}>
                                  Cancelar
                                </Button>
                                <Button
                                  variant="primary"
                                  size="sm"
                                  type="button"
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
                              <Button variant="secondary" size="sm" type="button" onClick={() => startEditMatch(match)}>
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
