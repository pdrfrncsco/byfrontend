import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { Calendar, CalendarDays, CheckCircle2, ChevronRight, Filter, Shield, Trophy, Users } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { EmptyState } from '@/components/ui/empty-state'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { clubRoutes } from '@/modules/clubs/routes'
import type { Competition, Match, Standing } from '@/modules/competitions/types'

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

export function ClubCompetitionsView({
  clubId,
  clubName = 'Clube',
  competitions = [],
  matches = [],
  standings = [],
  isLoading = false,
}: ClubCompetitionsViewProps) {
  const [selectedCompId, setSelectedCompId] = useState<string>('all')

  const filteredCompetitions = useMemo(() => {
    return competitions
  }, [competitions])

  const filteredMatches = useMemo(() => {
    if (selectedCompId === 'all') return matches
    return matches.filter((m) => m.competition === selectedCompId)
  }, [matches, selectedCompId])

  const results = useMemo(() => {
    return filteredMatches.filter(
      (m) => m.status === 'finished' || (m.home_score !== null && m.away_score !== null)
    )
  }, [filteredMatches])

  const upcomingMatches = useMemo(() => {
    return filteredMatches.filter(
      (m) => m.status !== 'finished' && m.home_score === null && m.away_score === null
    )
  }, [filteredMatches])


  const filteredStandings = useMemo(() => {
    if (selectedCompId === 'all') return standings
    return standings.filter((s) => s.competition === selectedCompId)
  }, [standings, selectedCompId])

  if (isLoading) {
    return (
      <div className="space-y-lg">
        <Skeleton className="h-12 w-full rounded-2xl" />
        <div className="grid gap-md md:grid-cols-2 lg:grid-cols-3">
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
          <Skeleton className="h-44 rounded-3xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Top Filter Bar */}
      {competitions.length > 1 && (
        <div className="flex flex-wrap items-center justify-between gap-md rounded-2xl border border-outline-variant/20 bg-surface-container p-md backdrop-blur">
          <div className="flex items-center gap-sm text-sm font-semibold text-on-surface">
            <Filter className="h-4 w-4 text-primary" />
            <span>Filtrar por Competição:</span>
          </div>
          <div className="flex flex-wrap gap-xs">
            <button
              onClick={() => setSelectedCompId('all')}
              className={`rounded-full px-md py-1 text-xs font-semibold transition-all ${
                selectedCompId === 'all'
                  ? 'bg-primary text-on-primary shadow-sm'
                  : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
              }`}
            >
              Todas ({competitions.length})
            </button>
            {competitions.map((comp) => (
              <button
                key={comp.id}
                onClick={() => setSelectedCompId(comp.id)}
                className={`rounded-full px-md py-1 text-xs font-semibold transition-all ${
                  selectedCompId === comp.id
                    ? 'bg-primary text-on-primary shadow-sm'
                    : 'bg-surface-container-high text-on-surface-variant hover:bg-surface-container-highest'
                }`}
              >
                {comp.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Main Tabs */}
      <Tabs defaultValue="competitions" className="space-y-lg">
        <TabsList className="flex h-auto flex-wrap gap-xs rounded-full border border-outline-variant/20 bg-surface-container p-xs">
          <TabsTrigger
            value="competitions"
            className="rounded-full px-lg py-sm text-sm font-medium data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all"
          >
            <Trophy className="mr-2 h-4 w-4" />
            Competições ({filteredCompetitions.length})
          </TabsTrigger>
          <TabsTrigger
            value="standings"
            className="rounded-full px-lg py-sm text-sm font-medium data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all"
          >
            <Shield className="mr-2 h-4 w-4" />
            Classificações ({filteredStandings.length})
          </TabsTrigger>
          <TabsTrigger
            value="results"
            className="rounded-full px-lg py-sm text-sm font-medium data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all"
          >
            <CheckCircle2 className="mr-2 h-4 w-4" />
            Resultados ({results.length})
          </TabsTrigger>
          <TabsTrigger
            value="fixtures"
            className="rounded-full px-lg py-sm text-sm font-medium data-[state=active]:bg-primary-container data-[state=active]:text-primary shadow-sm transition-all"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Partidas / Agenda ({upcomingMatches.length})
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Competições */}
        <TabsContent value="competitions" className="animate-in fade-in duration-300">
          {filteredCompetitions.length === 0 ? (
            <EmptyState
              icon={Trophy}
              title="Sem competições vinculadas"
              description="Este clube ainda não foi inscrito em competições ativas na plataforma."
            />
          ) : (
            <div className="grid gap-md md:grid-cols-2 lg:grid-cols-3">
              {filteredCompetitions.map((comp) => {
                const compMatches = matches.filter((m) => m.competition === comp.id)
                const finishedCount = compMatches.filter((m) => m.status === 'finished').length

                return (
                  <Card key={comp.id} variant="flat" padding="none" className="overflow-hidden shadow-[0_14px_32px_-24px_rgba(15,17,23,0.18)] hover:border-primary/40 transition-all">
                    <CardHeader className="border-b border-outline-variant/10 bg-surface-container-high/40 p-lg">
                      <div className="flex items-center justify-between">
                        <Badge variant={comp.status === 'active' ? 'primary' : 'outline'}>
                          {comp.status_label || comp.status || 'Ativa'}
                        </Badge>
                        <span className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{comp.season}</span>
                      </div>
                      <CardTitle className="mt-sm text-xl font-bold text-on-surface">{comp.name}</CardTitle>
                      <p className="text-xs text-on-surface-variant">{comp.type_label || comp.competition_type || 'Liga'}</p>
                    </CardHeader>

                    <CardContent className="p-lg space-y-md">
                      <div className="grid grid-cols-2 gap-sm rounded-2xl border border-outline-variant/10 bg-surface-container/60 p-sm text-center">
                        <div>
                          <p className="text-xs uppercase tracking-wide text-on-surface-variant">Jogos</p>
                          <p className="text-lg font-bold text-on-surface">{compMatches.length}</p>
                        </div>
                        <div>
                          <p className="text-xs uppercase tracking-wide text-on-surface-variant">Concluídos</p>
                          <p className="text-lg font-bold text-primary">{finishedCount}</p>
                        </div>
                      </div>

                      <button
                        onClick={() => setSelectedCompId(comp.id)}
                        className="flex w-full items-center justify-between text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Ver tabela e resultados desta prova</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 2: Classificações */}
        <TabsContent value="standings" className="animate-in fade-in duration-300">
          {filteredStandings.length === 0 ? (
            <EmptyState
              icon={Shield}
              title="Sem classificação disponível"
              description="Ainda não existem dados de tabela de classificação para este filtro."
            />
          ) : (
            <Card variant="flat" padding="none" className="overflow-hidden shadow-[0_14px_32px_-24px_rgba(15,17,23,0.18)]">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-on-surface">
                  <thead className="bg-surface-container-high/80 text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                    <tr>
                      <th className="px-md py-md text-center">#</th>
                      <th className="px-md py-md">Clube</th>
                      <th className="px-md py-md text-center">J</th>
                      <th className="px-md py-md text-center">V</th>
                      <th className="px-md py-md text-center">E</th>
                      <th className="px-md py-md text-center">D</th>
                      <th className="px-md py-md text-center">GM</th>
                      <th className="px-md py-md text-center">GS</th>
                      <th className="px-md py-md text-center">DG</th>
                      <th className="px-md py-md text-center font-bold text-primary">Pts</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant/10">
                    {filteredStandings.map((row) => {
                      const isCurrentClub =
                        row.club === clubId || row.club_name?.toLowerCase() === clubName?.toLowerCase()

                      return (
                        <tr
                          key={row.id}
                          className={`transition-colors ${
                            isCurrentClub
                              ? 'bg-primary-container/20 font-bold border-l-4 border-primary'
                              : 'hover:bg-surface-container-high/30'
                          }`}
                        >
                          <td className="px-md py-md text-center">
                            <span
                              className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${
                                row.position === 1
                                  ? 'bg-amber-500 text-black'
                                  : row.position === 2
                                  ? 'bg-surface-container-high text-on-surface'
                                  : row.position === 3
                                  ? 'bg-amber-100 text-amber-700'
                                  : 'text-on-surface-variant'
                              }`}
                            >
                              {row.position}
                            </span>
                          </td>
                          <td className="px-md py-md">
                            <div className="flex items-center gap-sm">
                              {row.club_logo ? (
                                <img src={row.club_logo} alt={row.club_name} className="h-6 w-6 object-cover rounded-full" />
                              ) : (
                                <div className="h-6 w-6 rounded-full bg-primary/20 text-[10px] font-bold text-primary flex items-center justify-center">
                                  {row.club_name?.slice(0, 2).toUpperCase()}
                                </div>
                              )}
                              <span className={isCurrentClub ? 'text-primary font-bold' : ''}>
                                {row.club_name}
                              </span>
                              {isCurrentClub && (
                                <Badge variant="primary" className="text-[10px] py-0 px-1.5">
                                  Meu Clube
                                </Badge>
                              )}
                            </div>
                          </td>
                          <td className="px-md py-md text-center">{row.played}</td>
                          <td className="px-md py-md text-center">{row.won}</td>
                          <td className="px-md py-md text-center">{row.drawn}</td>
                          <td className="px-md py-md text-center">{row.lost}</td>
                          <td className="px-md py-md text-center">{row.goals_for}</td>
                          <td className="px-md py-md text-center">{row.goals_against}</td>
                          <td className="px-md py-md text-center font-medium">
                            {row.goal_difference > 0 ? `+${row.goal_difference}` : row.goal_difference}
                          </td>
                          <td className="px-md py-md text-center font-bold text-primary text-base">
                            {row.points}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </TabsContent>

        {/* Tab 3: Resultados */}
        <TabsContent value="results" className="animate-in fade-in duration-300">
          {results.length === 0 ? (
            <EmptyState
              icon={CheckCircle2}
              title="Sem resultados anteriores"
              description="Ainda não existem partidas concluídas para este clube."
            />
          ) : (
            <div className="space-y-sm">
              {results.map((match) => {
                const isHome = match.home_club === clubId || match.home_club_name?.toLowerCase() === clubName?.toLowerCase()
                const clubScore = isHome ? match.home_score : match.away_score
                const oppScore = isHome ? match.away_score : match.home_score

                let resultBadge = <Badge variant="outline">Empate</Badge>
                if (clubScore !== null && oppScore !== null) {
                  if (clubScore > oppScore) {
                    resultBadge = <Badge variant="primary">Vitória</Badge>
                  } else if (clubScore < oppScore) {
                    resultBadge = <Badge variant="danger">Derrota</Badge>
                  }
                }

                return (
                  <Link
                    key={match.id}
                    to={clubRoutes.matchLineup(match.id)}
                    className="block hover:shadow-md transition-all"
                  >
                    <Card variant="flat" padding="none" className="overflow-hidden shadow-sm hover:shadow-md transition-all">
                      <CardContent className="p-md flex flex-col md:flex-row md:items-center justify-between gap-md">
                        <div className="flex items-center gap-md">
                          <div className="text-xs font-semibold text-on-surface-variant min-w-[100px]">
                            <p>{formatDate(match.match_date)}</p>
                            <p className="text-[11px] text-primary">Jornada {match.round_number}</p>
                          </div>

                          {/* Teams and Score */}
                          <div className="flex items-center gap-md">
                            {/* Home */}
                            <div className={`flex items-center gap-xs font-semibold ${isHome ? 'text-primary font-bold' : 'text-on-surface'}`}>
                              <span>{match.home_club_name}</span>
                            </div>

                            {/* Score Pill */}
                            <div className="flex items-center justify-center rounded-xl bg-surface-container-highest px-md py-sm font-title-lg text-lg font-bold text-on-surface shadow-inner">
                              <span>{match.home_score ?? 0}</span>
                              <span className="mx-1 text-on-surface-variant">-</span>
                              <span>{match.away_score ?? 0}</span>
                            </div>

                            {/* Away */}
                            <div className={`flex items-center gap-xs font-semibold ${!isHome ? 'text-primary font-bold' : 'text-on-surface'}`}>
                              <span>{match.away_club_name}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between md:justify-end gap-md">
                          {match.venue && (
                            <span className="text-xs text-on-surface-variant hidden lg:inline">
                              📍 {match.venue}
                            </span>
                          )}
                          {resultBadge}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab 4: Partidas / Agendamentos */}
        <TabsContent value="fixtures" className="animate-in fade-in duration-300">
          {upcomingMatches.length === 0 ? (
            <EmptyState
              icon={Calendar}
              title="Sem partidas agendadas"
              description="Não há partidas futuras marcadas para este clube no momento."
            />
          ) : (
            <div className="grid gap-md md:grid-cols-2">
              {upcomingMatches.map((match) => {
                const isHome = match.home_club === clubId || match.home_club_name?.toLowerCase() === clubName?.toLowerCase()

                return (
                  <Link
                    key={match.id}
                    to={clubRoutes.matchLineup(match.id)}
                    className="block hover:shadow-lg transition-all hover:-translate-y-0.5"
                  >
                    <Card variant="flat" padding="none" className="overflow-hidden shadow-[0_14px_32px_-24px_rgba(15,17,23,0.18)] border-l-4 border-l-primary hover:shadow-xl transition-all">
                      <CardHeader className="bg-surface-container-high/40 p-md flex flex-row items-center justify-between">
                        <Badge variant="outline" className="text-xs">
                          Jornada {match.round_number}
                        </Badge>
                        <span className="text-xs font-semibold text-primary">
                          {formatDate(match.match_date)} {formatTime(match.match_date)}
                        </span>
                      </CardHeader>

                      <CardContent className="p-lg space-y-md">
                        <div className="flex items-center justify-around gap-md">
                          <div className="text-center space-y-1 flex-1">
                            <p className={`font-bold ${isHome ? 'text-primary text-lg' : 'text-on-surface'}`}>
                              {match.home_club_name}
                            </p>
                            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                              {isHome ? 'Mandante (Casa)' : 'Visitante'}
                            </span>
                          </div>

                          <div className="rounded-full bg-primary-container/30 px-md py-sm text-xs font-bold text-primary">
                            VS
                          </div>

                          <div className="text-center space-y-1 flex-1">
                            <p className={`font-bold ${!isHome ? 'text-primary text-lg' : 'text-on-surface'}`}>
                              {match.away_club_name}
                            </p>
                            <span className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">
                              {!isHome ? 'Mandante (Casa)' : 'Visitante'}
                            </span>
                          </div>
                        </div>

                        {match.venue && (
                          <div className="rounded-xl border border-outline-variant/10 bg-surface-container/60 p-sm text-center text-xs text-on-surface-variant">
                            Estádio / Local: <span className="font-semibold text-on-surface">{match.venue}</span>
                          </div>
                        )}

                        <div className="pt-xs flex justify-end">
                          <div className="w-full sm:w-auto inline-flex items-center justify-center gap-xs px-md py-sm bg-primary text-on-primary rounded-lg text-sm font-semibold hover:bg-primary-fixed transition-all">
                            <Users className="h-3.5 w-3.5" />
                            <span>Escalação & Convocados</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
