import { useState, useMemo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  Trophy,
  Calendar,
  CalendarDays,
  CheckCircle2,
  XCircle,
  MinusCircle,
  MapPin,
  Users,
  ChevronRight,
  Shield,
  Layers,
  Send,
  LayoutGrid,
  List,
  Clock,
  FileText,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { resolveMediaUrl } from '@/lib/media'
import { clubRoutes } from '@/modules/clubs/routes'
import type { Competition, Match, Standing } from '@/modules/competitions/types'
import { CompetitionStandingsRouter } from '@/modules/competitions/components/CompetitionFormatRouter'
import { useCompetitionRounds } from '@/modules/competitions/hooks/useCompetitionMatches'
import { formatMatchTeamName } from '@/modules/clubs/utils/club-name'

interface ClubCompetitionsViewProps {
  clubId?: string
  clubSlug?: string
  clubName?: string
  competitions: Competition[]
  matches: Match[]
  standings: Standing[]
  isLoading?: boolean
}

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return 'Data a definir'
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return dateStr
  return date.toLocaleDateString('pt-AO', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatTime(dateStr?: string | null): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  if (Number.isNaN(date.getTime())) return ''
  return date.toLocaleTimeString('pt-AO', { hour: '2-digit', minute: '2-digit' })
}

function formatCompetitionType(type?: string, format?: string): string {
  const f = (format || type || '').toLowerCase()
  if (f === 'cup') return 'Taça (Eliminatória)'
  if (f === 'tournament') return 'Torneio (Grupos)'
  if (f === 'league') return 'Campeonato (Liga)'
  return 'Liga'
}

export function ClubCompetitionsView({
  clubId,
  clubName = 'Clube',
  competitions = [],
  matches = [],
  standings = [],
  isLoading = false,
}: ClubCompetitionsViewProps) {
  // Active context: ID of chosen competition or 'agenda' for unified schedule
  const [activeContextId, setActiveContextId] = useState<string>('')

  // Sub-tabs state inside selected competition
  const [compSubTab, setCompSubTab] = useState<'standings' | 'matches' | 'rounds'>('standings')

  // Filter for club matches (all, upcoming, finished)
  const [matchFilter, setMatchFilter] = useState<'all' | 'upcoming' | 'finished'>('all')

  // View mode for Agenda Geral (default to 'grid' for 3 cards per row)
  const [agendaViewMode, setAgendaViewMode] = useState<'grid' | 'list'>('grid')

  // View mode for matches within selected competition
  const [compMatchesViewMode, setCompMatchesViewMode] = useState<'grid' | 'list'>('grid')

  // Initialize active context with the first competition or fallback to 'agenda'
  useEffect(() => {
    if (!activeContextId) {
      if (competitions.length > 0) {
        setActiveContextId(competitions[0].id)
      } else {
        setActiveContextId('agenda')
      }
    }
  }, [competitions, activeContextId])

  const selectedComp = useMemo(() => {
    return competitions.find((c) => c.id === activeContextId) || null
  }, [competitions, activeContextId])

  // Club's standing in the selected competition
  const clubStandingInSelectedComp = useMemo(() => {
    if (!selectedComp) return null
    return (
      standings.find(
        (s) =>
          s.competition === selectedComp.id &&
          (s.club === clubId || s.club_name?.toLowerCase() === clubName?.toLowerCase())
      ) || null
    )
  }, [standings, selectedComp, clubId, clubName])

  // Matches for the selected competition
  const compMatches = useMemo(() => {
    if (!selectedComp) return []
    return matches.filter((m) => m.competition === selectedComp.id)
  }, [matches, selectedComp])

  // Filtered club matches in selected competition
  const filteredCompMatches = useMemo(() => {
    if (matchFilter === 'upcoming') {
      return compMatches.filter(
        (m) => m.status !== 'finished' && m.home_score === null && m.away_score === null
      )
    }
    if (matchFilter === 'finished') {
      return compMatches.filter(
        (m) => m.status === 'finished' || (m.home_score !== null && m.away_score !== null)
      )
    }
    return compMatches
  }, [compMatches, matchFilter])

  // Next match in selected competition
  const nextMatchInComp = useMemo(() => {
    if (!selectedComp) return null
    const upcoming = compMatches
      .filter((m) => m.status !== 'finished' && m.home_score === null && m.away_score === null)
      .sort((a, b) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
    return upcoming[0] || null
  }, [compMatches, selectedComp])

  // Recent form (last 5 finished matches of the club in selected comp)
  const recentFormInComp = useMemo(() => {
    if (!selectedComp) return []
    const finished = compMatches
      .filter((m) => m.status === 'finished' || (m.home_score !== null && m.away_score !== null))
      .sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
      .slice(0, 5)

    return finished
      .map((m) => {
        const isHome =
          m.home_club === clubId || m.home_club_name?.toLowerCase() === clubName?.toLowerCase()
        const myScore = isHome ? m.home_score : m.away_score
        const oppScore = isHome ? m.away_score : m.home_score
        if (myScore === null || oppScore === null) return { type: 'D', label: 'E', match: m }
        if (myScore > oppScore) return { type: 'W', label: 'V', match: m }
        if (myScore < oppScore) return { type: 'L', label: 'D', match: m }
        return { type: 'D', label: 'E', match: m }
      })
      .reverse()
  }, [compMatches, selectedComp, clubId, clubName])

  // Global agenda matches
  const globalAgendaMatches = useMemo(() => {
    if (matchFilter === 'upcoming') {
      return matches.filter(
        (m) => m.status !== 'finished' && m.home_score === null && m.away_score === null
      )
    }
    if (matchFilter === 'finished') {
      return matches.filter(
        (m) => m.status === 'finished' || (m.home_score !== null && m.away_score !== null)
      )
    }
    return matches
  }, [matches, matchFilter])

  if (isLoading) {
    return (
      <div className="space-y-lg">
        <Skeleton className="h-14 w-full rounded-2xl" />
        <Skeleton className="h-44 w-full rounded-2xl" />
        <Skeleton className="h-80 w-full rounded-2xl" />
      </div>
    )
  }

  if (competitions.length === 0 && matches.length === 0) {
    return (
      <EmptyState
        icon={Trophy}
        title="Sem competições associadas"
        description="O clube ainda não foi inscrito em competições ativas na plataforma nesta temporada desportiva."
      />
    )
  }

  return (
    <div className="space-y-lg">
      {/* ─── Top Competition Context Switcher (Pills) ────────────────────────── */}
      <div className="flex flex-wrap items-center gap-xs rounded-2xl border border-outline-variant/20 bg-surface-container p-sm backdrop-blur">
        {competitions.map((comp) => {
          const isSelected = activeContextId === comp.id
          return (
            <button
              key={comp.id}
              onClick={() => {
                setActiveContextId(comp.id)
                setCompSubTab('standings')
              }}
              className={`flex items-center gap-xs rounded-xl px-md py-sm text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary/20'
                  : 'bg-surface-container-high text-on-surface hover:bg-surface-container-highest'
              }`}
            >
              <Trophy className={`h-3.5 w-3.5 ${isSelected ? 'text-on-primary' : 'text-primary'}`} />
              <span>{comp.name}</span>
              <span
                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
                  isSelected
                    ? 'bg-on-primary/20 text-on-primary'
                    : 'bg-surface-container text-on-surface-variant'
                }`}
              >
                {comp.season || 'Época'}
              </span>
            </button>
          )
        })}

        {/* Unified General Schedule Pill */}
        <button
          onClick={() => setActiveContextId('agenda')}
          className={`flex items-center gap-xs rounded-xl px-md py-sm text-xs font-semibold transition-all ${
            activeContextId === 'agenda'
              ? 'bg-primary text-on-primary shadow-sm ring-2 ring-primary/20'
              : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
          }`}
        >
          <CalendarDays className="h-3.5 w-3.5 text-primary" />
          <span>Agenda Geral do Clube</span>
          <span
            className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${
              activeContextId === 'agenda'
                ? 'bg-on-primary/20 text-on-primary'
                : 'bg-surface-container text-on-surface-variant'
            }`}
          >
            {matches.length}
          </span>
        </button>
      </div>

      {/* ─── Mode 1: Active Competition Hub ─────────────────────────────────── */}
      {selectedComp && activeContextId !== 'agenda' && (
        <div className="space-y-lg animate-in fade-in duration-300">
          {/* Header Card: Status do Clube na Prova */}
          <Card
            variant="flat"
            padding="none"
            className="overflow-hidden border border-outline-variant/30 bg-surface shadow-xs"
          >
            <div className="border-b border-outline-variant/15 bg-surface-container-high/40 px-lg py-md flex flex-wrap items-center justify-between gap-sm">
              <div className="flex items-center gap-xs">
                <Badge variant="primary" className="text-xs">
                  {formatCompetitionType(selectedComp.competition_type, selectedComp.format)}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {selectedComp.season}
                </Badge>
                {selectedComp.status && (
                  <Badge variant="secondary" className="text-xs capitalize">
                    {selectedComp.status === 'active' ? 'Em Curso' : selectedComp.status}
                  </Badge>
                )}
              </div>

              <div className="text-xs text-on-surface-variant font-medium">
                {compMatches.length} jogos registados nesta prova
              </div>
            </div>

            <CardContent className="p-lg grid gap-lg md:grid-cols-12 items-center">
              {/* Left Column: Info & Position in this Competition (5 cols) */}
              <div className="md:col-span-4 space-y-sm border-b md:border-b-0 md:border-r border-outline-variant/15 pb-md md:pb-0 md:pr-lg">
                <p className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant">
                  Desempenho na Competição
                </p>
                <h2 className="text-xl font-bold text-on-surface">{selectedComp.name}</h2>

                {clubStandingInSelectedComp ? (
                  <div className="flex items-baseline gap-sm pt-xs">
                    <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary font-bold text-lg shadow-sm">
                      {clubStandingInSelectedComp.position}º
                    </span>
                    <div>
                      <p className="text-base font-bold text-on-surface">
                        {clubStandingInSelectedComp.points} Pontos
                      </p>
                      <p className="text-[11px] text-on-surface-variant">
                        {clubStandingInSelectedComp.played}J ({clubStandingInSelectedComp.won}V{' '}
                        {clubStandingInSelectedComp.drawn}E {clubStandingInSelectedComp.lost}D) • DG{' '}
                        {clubStandingInSelectedComp.goal_difference > 0 ? '+' : ''}
                        {clubStandingInSelectedComp.goal_difference}
                      </p>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-on-surface-variant italic">
                    Tabela em atualização para este clube.
                  </p>
                )}

                {/* Recent Form */}
                {recentFormInComp.length > 0 && (
                  <div className="pt-xs">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-on-surface-variant block mb-1">
                      Forma Recente (Últimos jogos):
                    </span>
                    <div className="flex items-center gap-1">
                      {recentFormInComp.map((item, idx) => (
                        <span
                          key={idx}
                          title={`${item.match.home_club_name} vs ${item.match.away_club_name}`}
                          className={`inline-flex h-5 w-5 items-center justify-center rounded text-[10px] font-bold text-white shadow-xs ${
                            item.type === 'W'
                              ? 'bg-emerald-600'
                              : item.type === 'D'
                              ? 'bg-amber-600'
                              : 'bg-rose-600'
                          }`}
                        >
                          {item.label}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column: Next Match & Quick Actions (7 cols) */}
              <div className="md:col-span-8 space-y-sm md:pl-md">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-xs">
                    <Calendar className="h-3.5 w-3.5" /> Próximo Desafio Nesta Prova
                  </p>
                  {nextMatchInComp?.round_number && (
                    <Badge variant="outline" className="text-[10px]">
                      Jornada {nextMatchInComp.round_number}
                    </Badge>
                  )}
                </div>

                {nextMatchInComp ? (
                  <div className="rounded-xl border border-primary/20 bg-primary-container/10 p-md flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
                    <div className="space-y-1">
                      <div className="flex items-center gap-sm">
                        <span
                          className={`text-sm font-bold ${
                            nextMatchInComp.home_club === clubId ? 'text-primary' : 'text-on-surface'
                          }`}
                        >
                          {nextMatchInComp.home_club_name}
                        </span>
                        <span className="text-xs text-on-surface-variant font-semibold">vs</span>
                        <span
                          className={`text-sm font-bold ${
                            nextMatchInComp.away_club === clubId ? 'text-primary' : 'text-on-surface'
                          }`}
                        >
                          {nextMatchInComp.away_club_name}
                        </span>
                      </div>
                      <p className="text-xs text-on-surface-variant flex items-center gap-sm">
                        <span>📅 {formatDate(nextMatchInComp.match_date)}</span>
                        {formatTime(nextMatchInComp.match_date) && (
                          <span>⏰ {formatTime(nextMatchInComp.match_date)}</span>
                        )}
                        {nextMatchInComp.venue && <span>📍 {nextMatchInComp.venue}</span>}
                      </p>
                    </div>

                    <Button asChild variant="primary" size="sm" className="gap-xs text-xs shrink-0">
                      <Link to={clubRoutes.matchLineup(nextMatchInComp.id)}>
                        <Send className="h-3.5 w-3.5" />
                        Convocatória & Escalação
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <div className="rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md text-xs text-on-surface-variant italic">
                    Sem partidas pendentes agendadas nesta competição.
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Sub-Tabs: Classificação / Jogos do Clube / Calendário Geral */}
          <Tabs
            value={compSubTab}
            onValueChange={(val) => setCompSubTab(val as any)}
            className="space-y-md"
          >
            <TabsList className="flex h-auto flex-wrap gap-xs rounded-xl border border-outline-variant/20 bg-surface-container p-xs">
              <TabsTrigger
                value="standings"
                className="rounded-lg px-md py-sm text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-on-primary transition-all"
              >
                <Shield className="mr-1.5 h-3.5 w-3.5" />
                Classificação / Fases
              </TabsTrigger>
              <TabsTrigger
                value="matches"
                className="rounded-lg px-md py-sm text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-on-primary transition-all"
              >
                <Users className="mr-1.5 h-3.5 w-3.5" />
                Jogos do Meu Clube ({compMatches.length})
              </TabsTrigger>
              <TabsTrigger
                value="rounds"
                className="rounded-lg px-md py-sm text-xs font-semibold data-[state=active]:bg-primary data-[state=active]:text-on-primary transition-all"
              >
                <Layers className="mr-1.5 h-3.5 w-3.5" />
                Todas as Jornadas da Prova
              </TabsTrigger>
            </TabsList>

            {/* Sub-Tab 1: Classificação Dinâmica por Formato */}
            <TabsContent value="standings" className="animate-in fade-in duration-300">
              <Card variant="flat" padding="md" className="border-outline-variant/25 bg-surface">
                <CardHeader className="p-none mb-md flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold flex items-center gap-xs text-on-surface">
                    <Shield className="h-4 w-4 text-primary" /> Quadro Competitivo Oficial
                  </CardTitle>
                  <span className="text-xs text-on-surface-variant">
                    {formatCompetitionType(selectedComp.competition_type, selectedComp.format)}
                  </span>
                </CardHeader>
                <CardContent className="p-none">
                  {/* Dynamic router: renders LeagueStandingsTable, CupBracket, or TournamentGroupsView */}
                  <CompetitionStandingsRouter competitionId={selectedComp.id} />
                </CardContent>
              </Card>
            </TabsContent>

            {/* Sub-Tab 2: Jogos do Meu Clube nesta Competição */}
            <TabsContent value="matches" className="space-y-md animate-in fade-in duration-300">
              {/* Filter toggle & View Switcher */}
              <div className="flex flex-wrap items-center justify-between gap-sm">
                <div className="flex items-center gap-xs">
                  <Button
                    variant={matchFilter === 'all' ? 'primary' : 'secondary'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setMatchFilter('all')}
                  >
                    Todos ({compMatches.length})
                  </Button>
                  <Button
                    variant={matchFilter === 'upcoming' ? 'primary' : 'secondary'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setMatchFilter('upcoming')}
                  >
                    Próximos
                  </Button>
                  <Button
                    variant={matchFilter === 'finished' ? 'primary' : 'secondary'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setMatchFilter('finished')}
                  >
                    Resultados
                  </Button>
                </div>

                <div className="flex items-center gap-sm">
                  <span className="text-xs text-on-surface-variant">
                    A mostrar {filteredCompMatches.length} jogos
                  </span>

                  <div className="flex items-center rounded-lg border border-outline-variant/30 bg-surface-container p-0.5">
                    <button
                      type="button"
                      onClick={() => setCompMatchesViewMode('grid')}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                        compMatchesViewMode === 'grid'
                          ? 'bg-surface text-primary shadow-xs font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      title="Grelha em Cards (3 por linha)"
                    >
                      <LayoutGrid className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Cards</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setCompMatchesViewMode('list')}
                      className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                        compMatchesViewMode === 'list'
                          ? 'bg-surface text-primary shadow-xs font-bold'
                          : 'text-on-surface-variant hover:text-on-surface'
                      }`}
                      title="Lista detalhada"
                    >
                      <List className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Lista</span>
                    </button>
                  </div>
                </div>
              </div>

              {filteredCompMatches.length === 0 ? (
                <EmptyState
                  icon={Calendar}
                  title="Nenhum jogo encontrado"
                  description="Não existem partidas registadas com o filtro selecionado para esta competição."
                />
              ) : compMatchesViewMode === 'grid' ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
                  {filteredCompMatches.map((m) => (
                    <ClubMatchGridCard
                      key={m.id}
                      match={m}
                      clubId={clubId}
                      clubName={clubName}
                      showCompetition={false}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-xs">
                  {filteredCompMatches.map((m) => (
                    <ClubMatchRow key={m.id} match={m} clubId={clubId} clubName={clubName} />
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Sub-Tab 3: Todas as Jornadas da Competição (Para acompanhar rivais) */}
            <TabsContent value="rounds" className="animate-in fade-in duration-300">
              <Card variant="flat" padding="md" className="border-outline-variant/25 bg-surface">
                <CardHeader className="p-none mb-md">
                  <CardTitle className="text-sm font-bold flex items-center gap-xs text-on-surface">
                    <Layers className="h-4 w-4 text-primary" /> Calendário Global da Competição
                  </CardTitle>
                  <p className="text-xs text-on-surface-variant">
                    Consulte os resultados e confrontos de todos os clubes jornada a jornada.
                  </p>
                </CardHeader>
                <CardContent className="p-none">
                  <CompetitionRoundsViewer
                    competitionId={selectedComp.id}
                    clubId={clubId}
                    clubName={clubName}
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      )}

      {/* ─── Mode 2: Unified General Club Schedule (Agenda Geral) ──────────── */}
      {activeContextId === 'agenda' && (
        <div className="space-y-md animate-in fade-in duration-300">
          <div className="rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-md">
              <div>
                <h2 className="text-xl font-bold text-on-surface flex items-center gap-xs">
                  <CalendarDays className="h-5 w-5 text-primary" /> Agenda Geral de Jogos
                </h2>
                <p className="text-xs text-on-surface-variant mt-0.5">
                  Calendário unificado com todas as partidas do clube em todas as competições desta temporada.
                </p>
              </div>

              {/* Sub-filters & View Toggle */}
              <div className="flex flex-wrap items-center gap-xs">
                <div className="flex items-center gap-xs">
                  <Button
                    variant={matchFilter === 'all' ? 'primary' : 'secondary'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setMatchFilter('all')}
                  >
                    Todos ({matches.length})
                  </Button>
                  <Button
                    variant={matchFilter === 'upcoming' ? 'primary' : 'secondary'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setMatchFilter('upcoming')}
                  >
                    Próximos
                  </Button>
                  <Button
                    variant={matchFilter === 'finished' ? 'primary' : 'secondary'}
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => setMatchFilter('finished')}
                  >
                    Concluídos
                  </Button>
                </div>

                <div className="h-4 w-px bg-outline-variant/30 hidden sm:block" />

                {/* View switcher: Grid (Cards 3 por linha) vs List */}
                <div className="flex items-center rounded-lg border border-outline-variant/30 bg-surface-container p-0.5">
                  <button
                    type="button"
                    onClick={() => setAgendaViewMode('grid')}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                      agendaViewMode === 'grid'
                        ? 'bg-surface text-primary shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Grelha em Cards (3 por linha)"
                  >
                    <LayoutGrid className="h-3.5 w-3.5" />
                    <span>Cards</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAgendaViewMode('list')}
                    className={`flex items-center gap-1 rounded-md px-2 py-1 text-xs transition-colors ${
                      agendaViewMode === 'list'
                        ? 'bg-surface text-primary shadow-xs font-bold'
                        : 'text-on-surface-variant hover:text-on-surface'
                    }`}
                    title="Lista detalhada"
                  >
                    <List className="h-3.5 w-3.5" />
                    <span>Lista</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {globalAgendaMatches.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Sem partidas registadas"
              description="Não foram encontradas partidas para o clube com o filtro selecionado."
            />
          ) : agendaViewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-md">
              {globalAgendaMatches.map((m) => (
                <ClubMatchGridCard
                  key={m.id}
                  match={m}
                  clubId={clubId}
                  clubName={clubName}
                  showCompetition
                />
              ))}
            </div>
          ) : (
            <div className="space-y-xs">
              {globalAgendaMatches.map((m) => (
                <ClubMatchRow
                  key={m.id}
                  match={m}
                  clubId={clubId}
                  clubName={clubName}
                  showCompetitionBadge
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Componente Auxiliar: Card de Jogo em Grelha (3 por linha) ───────────────

interface ClubMatchGridCardProps {
  match: Match
  clubId?: string
  clubName?: string
  showCompetition?: boolean
}

function ClubMatchGridCard({
  match,
  clubId,
  clubName,
  showCompetition = true,
}: ClubMatchGridCardProps) {
  const isHome =
    (clubId && (match.home_club === clubId || match.homeTeamId === clubId)) ||
    Boolean(clubName && match.home_club_name?.toLowerCase() === clubName.toLowerCase())
  const isAway =
    (clubId && (match.away_club === clubId || match.awayTeamId === clubId)) ||
    Boolean(clubName && match.away_club_name?.toLowerCase() === clubName.toLowerCase())

  const homeName = formatMatchTeamName(match, 'home', 'short')
  const awayName = formatMatchTeamName(match, 'away', 'short')
  const homeOfficialName = formatMatchTeamName(match, 'home', 'official')
  const awayOfficialName = formatMatchTeamName(match, 'away', 'official')
  const homeLogo = resolveMediaUrl(match.homeTeamLogo || (match as any).home_club_logo)
  const awayLogo = resolveMediaUrl(match.awayTeamLogo || (match as any).away_club_logo)
  const compName = match.competition_name || (match as any).competitionName || (match as any).competition?.name
  const roundNum = match.roundNumber ?? match.round_number

  const homeScore = match.home_score ?? match.score?.home ?? null
  const awayScore = match.away_score ?? match.score?.away ?? null
  const myScore = isHome ? homeScore : awayScore
  const oppScore = isHome ? awayScore : homeScore

  const isFinished =
    match.status === 'finished' || (homeScore !== null && awayScore !== null)
  const isLive = match.status === 'live' || match.status === 'halftime'

  let resultType: 'win' | 'loss' | 'draw' | null = null
  if (isFinished && myScore !== null && oppScore !== null) {
    if (myScore > oppScore) resultType = 'win'
    else if (myScore < oppScore) resultType = 'loss'
    else resultType = 'draw'
  }

  // Top color accent bar based on match status and result
  let topBarColor = 'bg-primary/20'
  if (isLive) topBarColor = 'bg-amber-500 animate-pulse'
  else if (resultType === 'win') topBarColor = 'bg-emerald-500'
  else if (resultType === 'loss') topBarColor = 'bg-rose-500'
  else if (resultType === 'draw') topBarColor = 'bg-amber-500'

  return (
    <div className="group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-outline-variant/25 bg-surface p-md transition-all duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-md">
      {/* Top accent line */}
      <span className={`absolute inset-x-0 top-0 h-1 ${topBarColor}`} aria-hidden="true" />

      {/* Card Header: Competition + Jornada + Status */}
      <div>
        <div className="flex items-center justify-between gap-xs mb-2">
          <div className="flex items-center gap-1.5 min-w-0">
            {showCompetition && compName && (
              <Badge
                variant="outline"
                className="text-[10px] font-semibold max-w-[140px] sm:max-w-[160px] truncate py-0 px-1.5 h-5 bg-surface-container/60 border-outline-variant/30 text-on-surface"
              >
                <Trophy className="h-2.5 w-2.5 mr-1 text-primary shrink-0" />
                <span className="truncate">{compName}</span>
              </Badge>
            )}
            {roundNum ? (
              <span className="rounded bg-surface-container-high px-1.5 py-0.5 text-[10px] font-bold text-on-surface-variant shrink-0">
                J{roundNum}
              </span>
            ) : null}
          </div>

          <div className="shrink-0">
            {isLive ? (
              <Badge variant="danger" className="text-[10px] py-0 px-1.5 h-5 flex items-center gap-1 animate-pulse">
                <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping mr-0.5" />
                AO VIVO
              </Badge>
            ) : isFinished ? (
              resultType === 'win' ? (
                <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 text-[10px] py-0 px-1.5 h-5 font-bold">
                  Vitória
                </Badge>
              ) : resultType === 'loss' ? (
                <Badge variant="danger" className="text-[10px] py-0 px-1.5 h-5 font-bold">
                  Derrota
                </Badge>
              ) : (
                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/30 text-[10px] py-0 px-1.5 h-5 font-bold">
                  Empate
                </Badge>
              )
            ) : (
              <Badge variant="secondary" className="text-[10px] py-0 px-1.5 h-5 font-medium text-on-surface-variant">
                Agendado
              </Badge>
            )}
          </div>
        </div>

        {/* Date and Venue sub-bar */}
        <div className="flex items-center justify-between text-[11px] text-on-surface-variant/80 border-b border-outline-variant/15 pb-2 mb-3">
          <span className="flex items-center gap-1 font-medium">
            <Calendar className="h-3 w-3 text-primary/70 shrink-0" />
            {formatDate(match.match_date)}
          </span>
          {match.venue && (
            <span className="flex items-center gap-1 truncate max-w-[130px]" title={match.venue}>
              <MapPin className="h-3 w-3 text-primary/70 shrink-0" />
              <span className="truncate">{match.venue}</span>
            </span>
          )}
        </div>

        {/* Confrontation Body: Home vs Away */}
        <div className="my-2 flex items-center justify-between gap-2">
          {/* Home Team */}
          <div className="flex flex-1 flex-col items-center text-center min-w-0">
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl p-1 transition-all duration-200 group-hover:scale-105 ${
                isHome
                  ? 'ring-2 ring-primary bg-primary/10 shadow-xs'
                  : 'bg-surface-container border border-outline-variant/20'
              }`}
            >
              {homeLogo ? (
                <img
                  src={homeLogo}
                  alt={homeName}
                  className="h-full w-full object-contain rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.parentElement?.querySelector('.home-fallback')
                    if (fallback) fallback.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`home-fallback text-sm font-black text-primary ${homeLogo ? 'hidden' : ''}`}>
                {homeName.charAt(0).toUpperCase()}
              </div>
              {isHome && (
                <span
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white shadow-xs"
                  title="Meu Clube"
                >
                  ★
                </span>
              )}
            </div>
            <span
              className={`mt-1.5 text-xs font-bold w-full truncate ${
                isHome ? 'text-primary' : 'text-on-surface'
              }`}
              title={homeOfficialName}
            >
              {homeName}
            </span>
            <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider font-semibold">
              {isHome ? 'Meu Clube' : 'Casa'}
            </span>
          </div>

          {/* Center: Score / VS */}
          <div className="flex flex-col items-center justify-center px-1 shrink-0">
            {isFinished ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 rounded-xl bg-surface-container-high px-2.5 py-1 font-mono text-base font-black tracking-wider text-on-surface shadow-xs">
                  <span>{homeScore ?? 0}</span>
                  <span className="text-on-surface-variant/50">-</span>
                  <span>{awayScore ?? 0}</span>
                </div>
                <span className="mt-1 text-[10px] font-semibold text-on-surface-variant">Final</span>
              </div>
            ) : isLive ? (
              <div className="flex flex-col items-center">
                <div className="flex items-center gap-1.5 rounded-xl bg-amber-500/15 border border-amber-500/30 px-2.5 py-1 font-mono text-base font-black tracking-wider text-amber-700 dark:text-amber-300">
                  <span>{homeScore ?? 0}</span>
                  <span>-</span>
                  <span>{awayScore ?? 0}</span>
                </div>
                <span className="mt-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 animate-pulse">
                  {match.current_minute ? `${match.current_minute}'` : 'Ao vivo'}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-surface-container-high font-bold text-xs text-primary shadow-xs">
                  VS
                </div>
                <span className="mt-1 text-[11px] font-bold text-on-surface">
                  {formatTime(match.match_date) || 'A definir'}
                </span>
              </div>
            )}
          </div>

          {/* Away Team */}
          <div className="flex flex-1 flex-col items-center text-center min-w-0">
            <div
              className={`relative flex h-12 w-12 items-center justify-center rounded-2xl p-1 transition-all duration-200 group-hover:scale-105 ${
                isAway
                  ? 'ring-2 ring-primary bg-primary/10 shadow-xs'
                  : 'bg-surface-container border border-outline-variant/20'
              }`}
            >
              {awayLogo ? (
                <img
                  src={awayLogo}
                  alt={awayName}
                  className="h-full w-full object-contain rounded-xl"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                    const fallback = e.currentTarget.parentElement?.querySelector('.away-fallback')
                    if (fallback) fallback.classList.remove('hidden')
                  }}
                />
              ) : null}
              <div className={`away-fallback text-sm font-black text-primary ${awayLogo ? 'hidden' : ''}`}>
                {awayName.charAt(0).toUpperCase()}
              </div>
              {isAway && (
                <span
                  className="absolute -bottom-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[8px] font-black text-white shadow-xs"
                  title="Meu Clube"
                >
                  ★
                </span>
              )}
            </div>
            <span
              className={`mt-1.5 text-xs font-bold w-full truncate ${
                isAway ? 'text-primary' : 'text-on-surface'
              }`}
              title={awayOfficialName}
            >
              {awayName}
            </span>
            <span className="text-[10px] text-on-surface-variant/70 uppercase tracking-wider font-semibold">
              {isAway ? 'Meu Clube' : 'Fora'}
            </span>
          </div>
        </div>
      </div>

      {/* Card Action Footer */}
      <div className="mt-3 pt-2.5 border-t border-outline-variant/15">
        {!isFinished ? (
          <Button asChild variant="primary" size="sm" className="w-full h-8 text-xs font-semibold gap-xs shadow-xs">
            <Link to={clubRoutes.matchLineup(match.id)}>
              <Users className="h-3.5 w-3.5" />
              Escalação & Convocatória
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" size="sm" className="w-full h-8 text-xs font-semibold gap-xs hover:border-primary/40">
            <Link to={clubRoutes.matchLineup(match.id)}>
              <FileText className="h-3.5 w-3.5 text-primary" />
              Ficha de Jogo
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Componente Auxiliar: Linha de Jogo do Clube ─────────────────────────────

function ClubMatchRow({
  match,
  clubId,
  clubName,
  showCompetitionBadge = false,
}: {
  match: Match
  clubId?: string
  clubName?: string
  showCompetitionBadge?: boolean
}) {
  const isHome =
    match.home_club === clubId ||
    match.home_club_name?.toLowerCase() === clubName?.toLowerCase()
  const myScore = isHome ? match.home_score : match.away_score
  const oppScore = isHome ? match.away_score : match.home_score
  const isFinished =
    match.status === 'finished' || (match.home_score !== null && match.away_score !== null)

  let resultBadge = null
  if (isFinished && myScore !== null && oppScore !== null) {
    if (myScore > oppScore) {
      resultBadge = (
        <Badge variant="primary" className="bg-emerald-500/15 text-emerald-800 border-emerald-500/30 text-[10px]">
          Vitória
        </Badge>
      )
    } else if (myScore < oppScore) {
      resultBadge = (
        <Badge variant="danger" className="text-[10px]">
          Derrota
        </Badge>
      )
    } else {
      resultBadge = (
        <Badge variant="outline" className="text-[10px]">
          Empate
        </Badge>
      )
    }
  }

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm rounded-xl border border-outline-variant/20 bg-surface p-sm text-xs hover:border-primary/30 transition-all shadow-xs">
      <div className="flex flex-wrap items-center gap-sm">
        <div className="min-w-[85px]">
          <p className="font-bold text-on-surface">{formatDate(match.match_date)}</p>
          <p className="text-[11px] text-on-surface-variant font-medium">
            {match.round_number ? `Jornada ${match.round_number}` : formatTime(match.match_date)}
          </p>
        </div>

        {showCompetitionBadge && (match.competition_name || (match as any).competition?.name) && (
          <Badge variant="outline" className="text-[10px] hidden md:inline-flex">
            {match.competition_name || (match as any).competition?.name}
          </Badge>
        )}
      </div>

      <div className="flex items-center justify-center gap-sm flex-1 px-sm">
        <span
          className={`text-right flex-1 truncate font-semibold ${
            isHome ? 'text-primary font-bold' : 'text-on-surface'
          }`}
          title={formatMatchTeamName(match, 'home', 'official')}
        >
          {formatMatchTeamName(match, 'home', 'short')}
        </span>

        <div className="flex items-center justify-center rounded-lg bg-surface-container-high px-sm py-1 font-bold text-on-surface min-w-[55px] shadow-xs">
          {isFinished ? (
            `${match.home_score ?? 0} - ${match.away_score ?? 0}`
          ) : (
            <span className="text-[11px] text-primary font-medium">{formatTime(match.match_date) || 'VS'}</span>
          )}
        </div>

        <span
          className={`text-left flex-1 truncate font-semibold ${
            !isHome ? 'text-primary font-bold' : 'text-on-surface'
          }`}
          title={formatMatchTeamName(match, 'away', 'official')}
        >
          {formatMatchTeamName(match, 'away', 'short')}
        </span>
      </div>

      <div className="flex items-center justify-end gap-sm">
        {match.venue && (
          <span className="text-[11px] text-on-surface-variant hidden lg:flex items-center gap-1">
            <MapPin className="h-3 w-3 text-primary" /> {match.venue}
          </span>
        )}
        {resultBadge}

        {/* Action Button: Escalacao se pendente, ou detalhes */}
        {!isFinished ? (
          <Button asChild variant="primary" size="sm" className="h-7 text-xs gap-xs">
            <Link to={clubRoutes.matchLineup(match.id)}>
              <Users className="h-3.5 w-3.5" />
              Escalação
            </Link>
          </Button>
        ) : (
          <Button asChild variant="secondary" size="sm" className="h-7 text-xs">
            <Link to={clubRoutes.matchLineup(match.id)}>
              Ficha de Jogo
            </Link>
          </Button>
        )}
      </div>
    </div>
  )
}

// ─── Componente Auxiliar: Visualizador de Jornadas Completas da Prova ─────────

function CompetitionRoundsViewer({
  competitionId,
  clubId,
  clubName,
}: {
  competitionId: string
  clubId?: string
  clubName?: string
}) {
  const { data: roundsView, isLoading } = useCompetitionRounds(competitionId)
  const rounds = roundsView?.rounds ?? []
  const [selectedRoundIdx, setSelectedRoundIdx] = useState<number>(0)

  useEffect(() => {
    if (rounds.length > 0) {
      // Find round that has scheduled matches or fallback to the latest
      const activeIdx = rounds.findIndex((r) => r.matches?.some((m) => m.status === 'scheduled'))
      if (activeIdx !== -1) {
        setSelectedRoundIdx(activeIdx)
      } else {
        setSelectedRoundIdx(0)
      }
    }
  }, [rounds.length])

  if (isLoading) {
    return (
      <div className="space-y-sm py-md">
        <Skeleton className="h-10 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
        <Skeleton className="h-24 w-full rounded-xl" />
      </div>
    )
  }

  if (rounds.length === 0) {
    return (
      <EmptyState
        icon={Calendar}
        title="Jornadas não disponíveis"
        description="O calendário completo desta competição ainda não foi gerado ou publicado pela organização."
      />
    )
  }

  const currentRound = rounds[selectedRoundIdx] || rounds[0]

  return (
    <div className="space-y-md">
      {/* Round selector scrollable pills */}
      <div className="flex items-center gap-xs overflow-x-auto pb-xs">
        {rounds.map((round, idx) => {
          const isSelected = selectedRoundIdx === idx
          return (
            <button
              key={round.id || idx}
              onClick={() => setSelectedRoundIdx(idx)}
              className={`whitespace-nowrap rounded-lg px-sm py-1 text-xs font-semibold transition-all ${
                isSelected
                  ? 'bg-primary text-on-primary shadow-xs'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              {round.label || `Jornada ${round.number}`}
            </button>
          )
        })}
      </div>

      {/* Matches of selected round */}
      <div className="space-y-xs">
        {(!currentRound.matches || currentRound.matches.length === 0) ? (
          <p className="py-md text-center text-xs text-on-surface-variant italic">
            Sem partidas registradas para esta jornada.
          </p>
        ) : (
          currentRound.matches.map((m) => {
            const isMyMatch =
              m.home_club === clubId ||
              m.away_club === clubId ||
              m.home_club_name?.toLowerCase() === clubName?.toLowerCase() ||
              m.away_club_name?.toLowerCase() === clubName?.toLowerCase()

            const isFinished =
              m.status === 'finished' || (m.home_score !== null && m.away_score !== null)

            return (
              <div
                key={m.id}
                className={`flex flex-col sm:flex-row sm:items-center sm:justify-between gap-sm rounded-xl border p-sm text-xs transition-colors ${
                  isMyMatch
                    ? 'border-primary/40 bg-primary-container/10 shadow-xs'
                    : 'border-outline-variant/15 bg-surface-container/30'
                }`}
              >
                <div className="flex items-center gap-sm">
                  <span className="text-[11px] text-on-surface-variant min-w-[70px]">
                    {formatDate(m.match_date)}
                  </span>
                  {isMyMatch && (
                    <Badge variant="primary" className="text-[9px] py-0 px-1 font-bold">
                      Meu Clube
                    </Badge>
                  )}
                </div>

                <div className="flex items-center justify-center gap-md flex-1 px-xs">
                  <span
                    className={`text-right flex-1 truncate font-medium ${
                      m.home_club === clubId ? 'text-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    {m.home_club_name}
                  </span>

                  <div className="flex items-center justify-center rounded-lg bg-surface-container-high px-sm py-0.5 font-bold text-on-surface min-w-[50px] shadow-xs">
                    {isFinished ? (
                      `${m.home_score ?? 0} - ${m.away_score ?? 0}`
                    ) : (
                      <span className="text-[11px] text-primary">{formatTime(m.match_date) || 'vs'}</span>
                    )}
                  </div>

                  <span
                    className={`text-left flex-1 truncate font-medium ${
                      m.away_club === clubId ? 'text-primary font-bold' : 'text-on-surface'
                    }`}
                  >
                    {m.away_club_name}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-xs">
                  {isMyMatch && !isFinished && (
                    <Button asChild variant="primary" size="sm" className="h-6 text-[10px] px-2">
                      <Link to={clubRoutes.matchLineup(m.id)}>
                        Escalação
                      </Link>
                    </Button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}
