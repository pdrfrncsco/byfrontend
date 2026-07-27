import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCompetitionConfig } from './useCompetitionConfig'
import { competitionApi } from '../services/competition.api'
import { calculateStandings } from '../utils/league-calculator'
import { standingKeys } from './useCompetitionPhase3'

export function useLeagueStandings(competitionId: string) {
  const { leagueConfig } = useCompetitionConfig(competitionId)

  // Fetch matches
  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['matches', 'competition', competitionId],
    queryFn: () => competitionApi.listMatches(competitionId),
    enabled: Boolean(competitionId),
  })

  // Fetch initial/registered clubs list (which the backend provides via getStandings)
  const { data: initialStandings = [], isLoading: loadingInitial, error } = useQuery({
    queryKey: standingKeys.byCompetition(competitionId),
    queryFn: () => competitionApi.getStandings(competitionId),
    enabled: Boolean(competitionId),
  })

  // Calculate standings locally using the utility and config
  const data = useMemo(() => {
    if (!leagueConfig || initialStandings.length === 0) {
      return initialStandings
    }

    // Extract club info
    const clubs = initialStandings.map((s) => ({
      id: s.club,
      name: s.club_name,
      logo: s.club_logo,
    }))

    return calculateStandings(matches, clubs, leagueConfig)
  }, [matches, initialStandings, leagueConfig])

  return {
    data,
    isLoading: loadingMatches || loadingInitial,
    error,
  }
}
