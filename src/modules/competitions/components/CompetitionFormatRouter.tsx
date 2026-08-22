import { useCompetitionConfig } from '../hooks/useCompetitionConfig'
import { LeagueStandingsTable, TournamentGroupsView, CupBracket } from './formats'
import { PageSkeleton } from '@/components/ui'

interface Props {
  competitionId: string
}

export function CompetitionStandingsRouter({ competitionId }: Props) {
  const { isLeague, isTournament, isCup, isLoading } = useCompetitionConfig(competitionId)

  if (isLoading) {
    return <PageSkeleton variant="card" />
  }

  if (isLeague) {
    return <LeagueStandingsTable competitionId={competitionId} />
  }
  if (isTournament) {
    return <TournamentGroupsView competitionId={competitionId} />
  }
  if (isCup) {
    return <CupBracket competitionId={competitionId} />
  }

  return <PageSkeleton variant="card" />
}
