import { useLeagueStandings } from '../../hooks/useLeagueStandings'
import { useCompetitionConfig } from '../../hooks/useCompetitionConfig'
import { StandingsTable } from '../StandingsTable'

export function LeagueStandingsTable({ competitionId }: { competitionId: string }) {
  const { data: standings = [], isLoading } = useLeagueStandings(competitionId)
  const { leagueConfig } = useCompetitionConfig(competitionId)

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-xl">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-md">
      <StandingsTable
        standings={standings}
        qualifyingSpots={leagueConfig?.promotionZone ?? 3}
        relegationSpots={leagueConfig?.relegationZone ?? 0}
        competitionId={competitionId}
      />
    </div>
  )
}
