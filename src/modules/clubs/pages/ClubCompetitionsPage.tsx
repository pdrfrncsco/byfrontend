import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Calendar, CheckCircle2, ListChecks, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { ClubCompetitionsView } from '@/modules/clubs/components/ClubCompetitionsView'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import {
  useClubMe,
  useClubMeCompetitions,
  useClubMeMatches,
  useClubMeStandings,
} from '@/modules/clubs/hooks/useClubs'
import { ClubLogo } from '@/modules/clubs/components/ClubLogo'

export default function ClubCompetitionsPage() {
  const { data: club, isLoading: clubLoading } = useClubMe()

  const { data: competitions = [], isLoading: compLoading } = useClubMeCompetitions()
  const { data: matches = [], isLoading: matchesLoading } = useClubMeMatches()
  const { data: standings = [], isLoading: standingsLoading } = useClubMeStandings()

  const sidebarSections = useMemo(() => getClubSidebarSections(), [])

  // Next scheduled match calculation
  const nextMatch = useMemo(() => {
    const upcoming = matches
      .filter((m: any) => m.status === 'scheduled' || !m.status)
      .sort((a: any, b: any) => new Date(a.match_date).getTime() - new Date(b.match_date).getTime())
    return upcoming[0] || null
  }, [matches])

  const finishedMatchesCount = useMemo(() => {
    return matches.filter((m) => m.status === 'finished').length
  }, [matches])

  if (clubLoading || !club) {
    return (
      <DashboardLayout
        title="Competições & Jogos"
        subtitle="Carregando dados das competições..."
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  const isDataLoading = compLoading || matchesLoading || standingsLoading
  const isHome = nextMatch?.home_club === club.id
  const nextOpponent = nextMatch
    ? isHome
      ? nextMatch.away_club_name
      : nextMatch.home_club_name
    : null

  return (
    <DashboardLayout
      title={`Competições & Jogos • ${club.name}`}
      subtitle="Acompanhe as provas, classificações na tabela, resultados de jogos e a agenda de partidas do clube."
      dashboardType="club"
      sidebarSections={sidebarSections}
      headerActions={
        <div className="flex items-center gap-sm">
          <Button asChild variant="secondary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB}>
              <ArrowLeft className="mr-xs h-4 w-4" />
              <span>Voltar ao Painel</span>
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB_LINEUP}>
              <ListChecks className="mr-xs h-4 w-4" />
              <span>Lineup Manager</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-xl">
        {/* Executive Page Header */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-xs">
          <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-md">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container/50 p-1 flex items-center justify-center">
                <ClubLogo logoUrl={club.logo_url} name={club.name} size="lg" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-xs">
                  <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary font-semibold text-[11px]">
                    <Trophy className="mr-1 h-3 w-3" />
                    Calendário Desportivo
                  </Badge>
                  {(club.tenant_name || (club as any).association_name) && (
                    <Badge variant="outline" className="text-[11px] text-on-surface-variant">
                      {club.tenant_name || (club as any).association_name}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
                  Competições & Calendário • {club.name}
                </h1>
                <p className="text-xs text-on-surface-variant">
                  Consulte tabelas de classificação, histórico de jogos e convoque a equipa para os próximos desafios.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-xs">
              <Button asChild variant="secondary" size="sm">
                <Link to={ROUTES.DASHBOARD_CLUB_SQUAD}>
                  Ver Plantel
                </Link>
              </Button>
              <Button asChild variant="primary" size="sm">
                <Link to={ROUTES.DASHBOARD_CLUB_LINEUP}>
                  <ListChecks className="mr-xs h-4 w-4" />
                  Convocatória
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 KPIs Row with micro-context */}
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Competições</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Trophy className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-on-surface">{competitions.length}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Provas em disputa oficial</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Jogos Totais</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#534ab7]/10 text-[#534ab7]">
                  <Calendar className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-on-surface">{matches.length}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Calendário geral da época</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Concluídos</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f6e56]/10 text-[#0f6e56]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#0f6e56]">{finishedMatchesCount}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Partidas com resultado final</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Próximo Jogo</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ba751b]/10 text-[#ba751b]">
                  <ListChecks className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 truncate text-base font-bold text-on-surface">
                {nextOpponent ? `vs ${nextOpponent}` : 'Sem partidas'}
              </p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">
                {nextMatch
                  ? new Date(nextMatch.match_date).toLocaleDateString('pt-AO', { day: '2-digit', month: 'short' })
                  : 'A aguardar sorteio'}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Competitions View */}
        <ClubCompetitionsView
          clubId={club.id}
          clubSlug={club.slug}
          clubName={club.name}
          competitions={competitions}
          matches={matches}
          standings={standings}
          isLoading={isDataLoading}
        />
      </div>
    </DashboardLayout>
  )
}
