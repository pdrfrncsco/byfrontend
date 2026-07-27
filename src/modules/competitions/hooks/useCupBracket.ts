import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCompetitionConfig } from './useCompetitionConfig'
import { competitionApi } from '../services/competition.api'
import { generateCupBracket } from '../utils/bracket-generator'
import { standingKeys } from './useCompetitionPhase3'

export function useCupBracket(competitionId: string) {
  const { cupConfig } = useCompetitionConfig(competitionId)

  // Fetch matches
  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['matches', 'competition', competitionId],
    queryFn: () => competitionApi.listMatches(competitionId),
    enabled: Boolean(competitionId),
  })

  // Fetch initial/registered clubs list (which the backend returns in getStandings)
  const { data: initialStandings = [], isLoading: loadingInitial, error } = useQuery({
    queryKey: standingKeys.byCompetition(competitionId),
    queryFn: () => competitionApi.getStandings(competitionId),
    enabled: Boolean(competitionId),
  })

  const bracket = useMemo(() => {
    if (!cupConfig || initialStandings.length === 0) {
      return []
    }

    const clubs = initialStandings.map((s) => ({
      id: s.club,
      name: s.club_name,
    }))

    // Generate bracket template based on registered clubs
    const bracketTemplate = generateCupBracket(clubs, cupConfig)

    // Merge actual matches into the bracket template
    return bracketTemplate.map((round) => {
      const matchesInRound = round.matches.map((m) => {
        const actualMatch = matches.find((km) => {
          if (m.team1 && m.team2) {
            return (
              (km.home_club === m.team1 && km.away_club === m.team2) ||
              (km.home_club === m.team2 && km.away_club === m.team1)
            )
          }
          return false
        })

        if (actualMatch) {
          return {
            ...m,
            id: actualMatch.id,
            score1: actualMatch.home_score,
            score2: actualMatch.away_score,
            winner: actualMatch.status === 'finished'
              ? (actualMatch.home_score! > actualMatch.away_score! ? actualMatch.home_club : actualMatch.away_club)
              : null,
            status: actualMatch.status,
            team1: actualMatch.home_club,
            team1Name: actualMatch.home_club_name,
            team2: actualMatch.away_club,
            team2Name: actualMatch.away_club_name,
          }
        }
        return m
      })

      return {
        ...round,
        matches: matchesInRound,
      }
    })
  }, [matches, initialStandings, cupConfig])

  return {
    bracket,
    isLoading: loadingMatches || loadingInitial,
    error,
  }
}
