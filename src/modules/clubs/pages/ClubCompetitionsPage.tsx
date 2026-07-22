import { Link } from 'react-router-dom'
import { ArrowLeft, Trophy } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { ClubCompetitionsView } from '@/modules/clubs/components/ClubCompetitionsView'
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
import {
  useClubMe,
  useClubMeCompetitions,
  useClubMeMatches,
  useClubMeStandings,
} from '@/modules/clubs/hooks/useClubs'

export default function ClubCompetitionsPage() {
  const { data: club, isLoading: clubLoading } = useClubMe()

  const { data: competitions = [], isLoading: compLoading } = useClubMeCompetitions()
  const { data: matches = [], isLoading: matchesLoading } = useClubMeMatches()
  const { data: standings = [], isLoading: standingsLoading } = useClubMeStandings()

  const sidebarLinks = getClubSidebarLinks()

  if (clubLoading || !club) {
    return (
      <DashboardLayout
        title="Competições & Jogos"
        subtitle="Carregando dados das competições..."
        dashboardType="club"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <Skeleton className="h-96 w-full rounded-[2rem]" />
        </div>
      </DashboardLayout>
    )
  }

  const isDataLoading = compLoading || matchesLoading || standingsLoading

  return (
    <DashboardLayout
      title={`Competições & Jogos • ${club.name}`}
      subtitle="Acompanhe as provas, classificações na tabela, resultados de jogos e a agenda de partidas do clube."
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={ROUTES.DASHBOARD_CLUB}>
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar ao Painel</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-xl">
        {/* Banner Section */}
        <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container/80 p-xl lg:grid-cols-[1fr_0.8fr]">
          <div className="space-y-md">
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/15 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <Trophy className="h-3.5 w-3.5" />
              Competições e Calendário
            </div>
            <div className="space-y-sm">
              <h1 className="text-3xl font-semibold text-on-surface">Histórico e Jogos do Clube</h1>
              <p className="max-w-2xl text-on-surface-variant">
                Consulte em tempo real onde o seu clube participa, a posição na tabela de classificação, os resultados mais recentes e as próximas partidas.
              </p>
            </div>
          </div>

          <div className="grid gap-sm sm:grid-cols-3">
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Competições</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">{competitions.length}</p>
            </Card>
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Jogos Totais</p>
              <p className="mt-1 text-2xl font-bold text-on-surface">{matches.length}</p>
            </Card>
            <Card variant="flat" padding="md">
              <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Concluídos</p>
              <p className="mt-1 text-2xl font-bold text-primary">
                {matches.filter((m) => m.status === 'finished').length}
              </p>
            </Card>
          </div>
        </section>

        {/* Reusable View Component */}
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
