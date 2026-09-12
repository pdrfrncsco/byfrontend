import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Clock,
  Download,
  ExternalLink,
  Flame,
  FolderKanban,
  Loader2,
  Plus,
  RefreshCw,
  Settings,
  Shield,
  Target,
  TrendingUp,
  Trophy,
  Users,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Badge, Button, Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { useTenant } from '@/app/providers/TenantProvider'
import { useCompetition } from '../hooks/useCompetitions'
import { useCompetitionConfig } from '../hooks/useCompetitionConfig'
import { useCompetitionAccess } from '../hooks/useCompetitionAccess'
import { useTopScorers, useSuspensions, useRecalculateRankings } from '../hooks/useCompetitionAdvanced'
import { useCompetitionStandings, useCompetitionRounds } from '../hooks/useCompetitionMatches'
import { competitionRoutes } from '../routes'
import { getCompetitionSidebarSections } from '../constants/navigation'
import type { Match, Suspension } from '../types'

function getMatchStatusBadge(status?: string) {
  switch (status) {
    case 'finished':
      return <Badge variant="success" className="text-[11px] bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20">Concluído</Badge>
    case 'live':
      return <Badge variant="danger" className="animate-pulse text-[11px] bg-red-500/10 text-red-600 border-red-500/20">Ao Vivo</Badge>
    case 'halftime':
      return <Badge variant="warning" className="text-[11px] bg-amber-500/10 text-amber-700 border-amber-500/20">Intervalo</Badge>
    case 'postponed':
      return <Badge variant="secondary" className="text-[11px] bg-slate-500/10 text-slate-600 border-slate-500/20">Adiado</Badge>
    default:
      return <Badge variant="secondary" className="text-[11px] bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/20">Agendado</Badge>
  }
}

export function CompetitionAdminDashboardPage() {
  const { id } = useParams<{ id: string }>()
  const competitionId = id ?? ''
  const { tenant } = useTenant()
  const { isAdmin } = useCompetitionAccess()

  const { data: competition, isLoading: loadingComp } = useCompetition(competitionId)
  const { isLeague, isCup, isTournament } = useCompetitionConfig(competitionId)
  const { data: standings = [], isLoading: loadingStandings } = useCompetitionStandings(competitionId)
  const { data: roundsView, isLoading: loadingRounds } = useCompetitionRounds(competitionId)
  const { data: topScorers = [], isLoading: loadingScorers } = useTopScorers(competitionId)
  const { data: suspensions = [] } = useSuspensions(competitionId)
  const recalculate = useRecalculateRankings(competitionId)

  const activeSuspensions = useMemo(
    () => (suspensions as Suspension[]).filter((s) => s.is_active),
    [suspensions],
  )

  const sidebarSections = useMemo(
    () =>
      getCompetitionSidebarSections(competitionId, {
        activeSuspensions: activeSuspensions.length,
      }),
    [competitionId, activeSuspensions.length],
  )

  // Derive matches and metrics across all rounds
  const allMatches = useMemo(() => {
    const rounds = roundsView?.rounds ?? []
    return rounds.flatMap((r) => r.matches ?? [])
  }, [roundsView])

  const finishedMatches = useMemo(
    () => allMatches.filter((m) => m.status === 'finished'),
    [allMatches],
  )

  const upcomingMatches = useMemo(
    () =>
      allMatches
        .filter((m) => m.status === 'scheduled' || m.status === 'pre_match')
        .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime()),
    [allMatches],
  )

  const recentMatches = useMemo(() => {
    return [...allMatches]
      .filter((m) => m.status === 'finished' || m.status === 'live' || m.status === 'halftime')
      .slice(-4)
      .reverse()
  }, [allMatches])

  const nextMatch = upcomingMatches[0]

  const totalGoals = useMemo(() => {
    return finishedMatches.reduce(
      (acc, m) => acc + (m.home_score ?? 0) + (m.away_score ?? 0),
      0,
    )
  }, [finishedMatches])

  const avgGoals = finishedMatches.length > 0
    ? (totalGoals / finishedMatches.length).toFixed(1)
    : '0.0'

  const progressPercent = allMatches.length > 0
    ? Math.round((finishedMatches.length / allMatches.length) * 100)
    : 0

  const statusLabel = useMemo(() => {
    const s = competition?.status
    if (s === 'active') return 'Em Curso'
    if (s === 'completed') return 'Concluída'
    return 'Rascunho'
  }, [competition?.status])

  const currentRoundLabel = useMemo(() => {
    if (allMatches.length === 0) return 'Configuração Inicial'
    const lastRound = roundsView?.rounds?.[roundsView.rounds.length - 1]
    const completedRounds = (roundsView?.rounds ?? []).filter((r) =>
      r.matches.length > 0 && r.matches.every((m) => m.status === 'finished'),
    ).length
    const totalRounds = roundsView?.rounds?.length || 1
    if (isCup) return lastRound?.label || 'Fase Eliminatória'
    return `Jornada ${Math.min(completedRounds + 1, totalRounds)}/${totalRounds}`
  }, [allMatches.length, roundsView?.rounds, isCup])

  if (loadingComp) {
    return (
      <DashboardLayout
        title="Carregando Competição..."
        subtitle="A sincronizar dados federativos..."
        dashboardType="competition"
        sidebarSections={sidebarSections}
      >
        <div className="space-y-lg">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <div className="grid grid-cols-2 gap-md md:grid-cols-5">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={competition?.name || 'Painel da Competição'}
      subtitle={`${competition?.season} · Visão executiva da prova`}
      dashboardType="competition"
      sidebarSections={sidebarSections}
      headerActions={
        <div className="flex items-center gap-sm">
          {isAdmin && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => recalculate.mutate()}
              disabled={recalculate.isPending}
              className="text-xs"
              id="recalculate-rankings-btn"
            >
              {recalculate.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              <span>Recalcular</span>
            </Button>
          )}
          <Button asChild variant="secondary" size="sm" className="text-xs">
            <Link to={competitionRoutes.detail(competitionId)}>
              <ExternalLink className="h-3.5 w-3.5" />
              <span>Página Pública</span>
            </Link>
          </Button>
        </div>
      }
    >
      {/* ══════════════════ 1. EXECUTIVE PAGE HEADER ══════════════════ */}
      <div className="rounded-2xl border border-outline-variant/30 bg-surface-container-low p-lg shadow-sm">
        <div className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-md">
            {/* Squircle logo */}
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-amber-600/10 text-amber-700 dark:text-amber-400 border border-amber-500/20 text-xl font-bold font-display shadow-sm">
              {competition?.name ? competition.name.substring(0, 2).toUpperCase() : 'CP'}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-on-surface sm:text-2xl">
                  {competition?.name}
                </h1>
                <span className="rounded-full bg-amber-500/10 border border-amber-500/20 px-2.5 py-0.5 text-xs font-semibold text-amber-800 dark:text-amber-200">
                  {currentRoundLabel}
                </span>
                <Badge variant={competition?.status === 'active' ? 'success' : 'secondary'} className="text-[11px]">
                  {statusLabel}
                </Badge>
              </div>
              <p className="text-xs text-on-surface-variant mt-1">
                {isLeague ? 'Campeonato de Pontos Corridos' : isCup ? 'Taça / Eliminatória Direta' : 'Torneio'} ·{' '}
                <span className="font-semibold text-on-surface">{standings.length} clubes inscritos</span> ·{' '}
                {tenant?.name || 'Organização Titular'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5"
              onClick={() => window.print()}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Exportar</span>
            </Button>
            <Button asChild size="sm" className="text-xs gap-1.5">
              <Link to={competitionRoutes.schedule(competitionId)}>
                <Plus className="h-3.5 w-3.5" />
                <span>Agendar jogo</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* ══════════════════ 2. ROW OF 5 KPIS (HTML PROTOTYPE SPEC) ══════════════════ */}
      <div className="grid grid-cols-2 gap-md sm:grid-cols-3 lg:grid-cols-5 mt-md">
        {/* KPI 1: Clubes inscritos */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md transition-all hover:bg-surface-container">
          <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-blue-500/10 text-blue-600">
              <Shield className="h-3.5 w-3.5" />
            </div>
            <span>Clubes inscritos</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-on-surface">
            {loadingStandings ? '…' : standings.length}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
            <Clock className="h-3 w-3" />
            <span>{standings.length < 4 ? 'Inscrições abertas' : 'Quadro federativo ativo'}</span>
          </div>
        </div>

        {/* KPI 2: Jogos disputados */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md transition-all hover:bg-surface-container">
          <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-amber-500/10 text-amber-600">
              <Flame className="h-3.5 w-3.5" />
            </div>
            <span>Jogos disputados</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-on-surface">
            {loadingRounds ? '…' : finishedMatches.length}
          </div>
          <div className="mt-1.5 flex items-center gap-2 text-[11px] text-emerald-600 font-medium">
            <div className="h-1.5 w-14 overflow-hidden rounded-full bg-surface-container-highest">
              <div
                className="h-full bg-amber-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
            <span>{progressPercent}%</span>
          </div>
        </div>

        {/* KPI 3: Próximo jogo */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md transition-all hover:bg-surface-container">
          <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-emerald-500/10 text-emerald-600">
              <Calendar className="h-3.5 w-3.5" />
            </div>
            <span>Próximo jogo</span>
          </div>
          <div className="text-sm font-bold tracking-tight text-on-surface truncate">
            {nextMatch
              ? `${nextMatch.home_club_name || 'Equipa A'} vs ${nextMatch.away_club_name || 'Equipa B'}`
              : 'Sem partidas'}
          </div>
          <div className="mt-1 text-[11px] text-on-surface-variant truncate">
            {nextMatch
              ? new Date(nextMatch.match_date).toLocaleDateString('pt-AO', {
                  weekday: 'short',
                  day: 'numeric',
                  month: 'short',
                })
              : 'A aguardar calendário'}
          </div>
        </div>

        {/* KPI 4: Golos marcados */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md transition-all hover:bg-surface-container">
          <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-purple-500/10 text-purple-600">
              <Trophy className="h-3.5 w-3.5" />
            </div>
            <span>Golos marcados</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-on-surface">
            {loadingRounds ? '…' : totalGoals}
          </div>
          <div className="mt-1 flex items-center gap-1 text-[11px] text-emerald-600 font-medium">
            <TrendingUp className="h-3 w-3" />
            <span>{avgGoals} por jogo</span>
          </div>
        </div>

        {/* KPI 5: Suspensões ativas */}
        <div className="rounded-xl border border-outline-variant/30 bg-surface-container-low p-md transition-all hover:bg-surface-container">
          <div className="flex items-center gap-2 text-xs font-medium text-on-surface-variant mb-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-md bg-rose-500/10 text-rose-600">
              <AlertTriangle className="h-3.5 w-3.5" />
            </div>
            <span>Suspensões ativas</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-on-surface">
            {activeSuspensions.length}
          </div>
          <div className="mt-1 text-[11px] text-amber-700 dark:text-amber-300 font-medium">
            {activeSuspensions.length > 0 ? 'Aguardam cumprimento' : 'Quadro disciplinar limpo'}
          </div>
        </div>
      </div>

      {/* ══════════════════ 3. BODY 65% / 35% (HTML SPEC) ══════════════════ */}
      <div className="grid grid-cols-1 gap-lg lg:grid-cols-12 mt-lg">
        {/* ── COLUNA PRINCIPAL (65% -> col-span-8) ── */}
        <div className="space-y-lg lg:col-span-8">
          {/* Card: Jogos Recentes */}
          <Card variant="flat" padding="none" className="border-outline-variant/30">
            <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 px-md py-sm">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Flame className="h-4 w-4 text-amber-600" />
                <span>Jogos recentes</span>
              </CardTitle>
              <Button asChild variant="link" size="sm" className="text-xs text-primary p-0">
                <Link to={competitionRoutes.schedule(competitionId)} className="flex items-center gap-1">
                  <span>Ver todos</span>
                  <span>→</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingRounds ? (
                <div className="space-y-sm p-md">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-12 w-full rounded-xl" />
                  ))}
                </div>
              ) : recentMatches.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-xl text-center text-on-surface-variant">
                  <Calendar className="h-10 w-10 opacity-30 mb-2" />
                  <p className="text-sm font-semibold">Nenhum jogo registado recentemente</p>
                  <p className="text-xs opacity-75 mt-1">Gere ou agende partidas no calendário oficial.</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {recentMatches.map((m) => (
                    <div
                      key={m.id}
                      className="flex items-center justify-between px-md py-3 text-xs transition-colors hover:bg-surface-container-high/40"
                    >
                      <div className="font-semibold text-on-surface text-sm">
                        {m.home_club_name || 'Equipa A'}{' '}
                        <span className="text-on-surface-variant font-normal text-xs">vs</span>{' '}
                        {m.away_club_name || 'Equipa B'}
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold text-sm min-w-[36px] text-center text-on-surface">
                          {m.home_score != null && m.away_score != null
                            ? `${m.home_score} – ${m.away_score}`
                            : '– : –'}
                        </span>
                        {getMatchStatusBadge(m.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Card: Classificação (Top 4) */}
          <Card variant="flat" padding="none" className="border-outline-variant/30">
            <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 px-md py-sm">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold">
                <Target className="h-4 w-4 text-primary" />
                <span>Classificação (Top 4)</span>
              </CardTitle>
              <Button asChild variant="link" size="sm" className="text-xs text-primary p-0">
                <Link to={competitionRoutes.adminRankings(competitionId)} className="flex items-center gap-1">
                  <span>Ver completa</span>
                  <span>→</span>
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="p-0">
              {loadingStandings ? (
                <div className="space-y-sm p-md">
                  {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-full rounded-xl" />
                  ))}
                </div>
              ) : standings.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-xl text-center text-on-surface-variant">
                  <Trophy className="h-10 w-10 opacity-30 mb-2" />
                  <p className="text-sm font-semibold">Sem dados de classificação</p>
                  <p className="text-xs opacity-75 mt-1">Inscreva clubes e realize os jogos para pontuar.</p>
                </div>
              ) : (
                <div className="divide-y divide-outline-variant/10">
                  {standings.slice(0, 4).map((s, idx) => (
                    <div
                      key={s.id ?? idx}
                      className="flex items-center justify-between px-md py-2.5 text-xs transition-colors hover:bg-surface-container-high/40"
                    >
                      <div className="flex items-center gap-3">
                        <span className="w-5 text-center font-bold text-on-surface-variant text-xs">
                          {idx + 1}
                        </span>
                        {s.club_logo ? (
                          <img
                            src={s.club_logo}
                            alt={s.club_name}
                            className="h-6 w-6 rounded-full object-cover"
                          />
                        ) : (
                          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary">
                            {s.club_name.charAt(0)}
                          </div>
                        )}
                        <span className="font-semibold text-on-surface text-sm">
                          {s.club_name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-[11px] text-on-surface-variant">
                          {s.played}J · {s.won}V {s.drawn}E {s.lost}D
                        </span>
                        <span className="rounded-md bg-primary/10 px-2 py-0.5 font-bold text-xs text-primary">
                          {s.points} pts
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* ── COLUNA LATERAL (35% -> col-span-4) ── */}
        <div className="space-y-lg lg:col-span-4">
          {/* Card: Ações Rápidas (Grid 2x2 do Protótipo) */}
          <Card variant="flat" padding="none" className="border-outline-variant/30">
            <CardHeader className="border-b border-outline-variant/20 px-md py-sm">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Flame className="h-4 w-4 text-amber-500" />
                <span>Ações rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-sm">
              <div className="grid grid-cols-2 gap-2">
                {/* 1. Agendar Jogo */}
                <Link
                  to={competitionRoutes.schedule(competitionId)}
                  className="flex flex-col gap-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-low p-3 transition-all hover:bg-surface-container hover:border-primary/40 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-500/10 text-amber-700 dark:text-amber-400 group-hover:bg-amber-500 group-hover:text-white transition-colors">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Agendar jogo</p>
                    <p className="text-[10px] text-on-surface-variant">Nova partida</p>
                  </div>
                </Link>

                {/* 2. Suspensões */}
                <Link
                  to={competitionRoutes.adminSuspensions(competitionId)}
                  className="flex flex-col gap-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-low p-3 transition-all hover:bg-surface-container hover:border-rose-500/40 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-rose-500/10 text-rose-600 group-hover:bg-rose-600 group-hover:text-white transition-colors">
                    <AlertTriangle className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Suspensão</p>
                    <p className="text-[10px] text-on-surface-variant">Registar</p>
                  </div>
                </Link>

                {/* 3. Inscrições */}
                <Link
                  to={competitionRoutes.registration(competitionId)}
                  className="flex flex-col gap-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-low p-3 transition-all hover:bg-surface-container hover:border-blue-500/40 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-500/10 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Inscrições</p>
                    <p className="text-[10px] text-on-surface-variant">Gerir clubes</p>
                  </div>
                </Link>

                {/* 4. Regulamento */}
                <Link
                  to={competitionRoutes.adminRegulations(competitionId)}
                  className="flex flex-col gap-1.5 rounded-xl border border-outline-variant/20 bg-surface-container-low p-3 transition-all hover:bg-surface-container hover:border-emerald-500/40 group"
                >
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <CheckCircle2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-on-surface">Regulamento</p>
                    <p className="text-[10px] text-on-surface-variant">Actualizar</p>
                  </div>
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Card: Atividade Recente */}
          <Card variant="flat" padding="none" className="border-outline-variant/30">
            <CardHeader className="border-b border-outline-variant/20 px-md py-sm">
              <CardTitle className="text-sm font-semibold flex items-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span>Atividade recente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-md space-y-3">
              {recentMatches.length > 0 ? (
                recentMatches.slice(0, 2).map((m) => (
                  <div key={m.id} className="flex gap-2.5 text-xs">
                    <span className="h-2 w-2 rounded-full bg-amber-600 mt-1 shrink-0" />
                    <div>
                      <p className="font-semibold text-on-surface">Jogo Concluído</p>
                      <p className="text-[11px] text-on-surface-variant">
                        {m.home_club_name} {m.home_score} – {m.away_score} {m.away_club_name}
                      </p>
                    </div>
                  </div>
                ))
              ) : null}

              {activeSuspensions.length > 0 ? (
                <div className="flex gap-2.5 text-xs">
                  <span className="h-2 w-2 rounded-full bg-rose-500 mt-1 shrink-0" />
                  <div>
                    <p className="font-semibold text-on-surface">Suspensão Registada</p>
                    <p className="text-[11px] text-on-surface-variant">
                      {activeSuspensions[0].player_name} · {activeSuspensions[0].matches_remaining} jogo(s)
                    </p>
                  </div>
                </div>
              ) : null}

              <div className="flex gap-2.5 text-xs">
                <span className="h-2 w-2 rounded-full bg-emerald-500 mt-1 shrink-0" />
                <div>
                  <p className="font-semibold text-on-surface">Quadro de Prova Sincronizado</p>
                  <p className="text-[11px] text-on-surface-variant">
                    {competition?.name} · {competition?.season}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Destaque: Melhor Marcador */}
          {!loadingScorers && topScorers[0] && (
            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-md">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold">
                    <Trophy className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-on-surface">{topScorers[0].player_name}</p>
                    <p className="text-[11px] text-on-surface-variant">{topScorers[0].club_name}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-primary">{topScorers[0].goals}</span>
                  <p className="text-[10px] text-on-surface-variant">golos marcados</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}
