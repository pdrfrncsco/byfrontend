import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCompetitionConfig } from './useCompetitionConfig'
import { competitionApi } from '../services/competition.api'
import { calculateStandings } from '../utils/league-calculator'
import { generateCupBracket } from '../utils/bracket-generator'
import { standingKeys } from './useCompetitionPhase3'

export function useTournamentBracket(competitionId: string) {
  const { tournamentConfig } = useCompetitionConfig(competitionId)

  // Fetch matches
  const { data: matches = [], isLoading: loadingMatches } = useQuery({
    queryKey: ['matches', 'competition', competitionId],
    queryFn: () => competitionApi.listMatches(competitionId),
    enabled: Boolean(competitionId),
  })

  // Fetch initial/registered clubs list
  const { data: initialStandings = [], isLoading: loadingInitial, error } = useQuery({
    queryKey: standingKeys.byCompetition(competitionId),
    queryFn: () => competitionApi.getStandings(competitionId),
    enabled: Boolean(competitionId),
  })

  const tournamentData = useMemo(() => {
    if (!tournamentConfig || initialStandings.length === 0) {
      return { groups: [], bracket: [] }
    }

    const allClubs = initialStandings.map((s) => ({
      id: s.club,
      name: s.club_name,
      logo: s.club_logo,
    }))

    // Determine group partition
    const numGroups = tournamentConfig.groupStage.numberOfGroups || 2
    const groupStageConfig = tournamentConfig.groupStage

    let groupsMap: { name: string; teams: typeof allClubs }[] = []

    // Automatic slicing — manual group config not yet stored server-side
    const teamsPerGroup = Math.ceil(allClubs.length / numGroups)
    for (let i = 0; i < numGroups; i++) {
      const groupTeams = allClubs.slice(i * teamsPerGroup, (i + 1) * teamsPerGroup)
      groupsMap.push({
        name: `Grupo ${String.fromCharCode(65 + i)}`,
        teams: groupTeams,
      })
    }

    // For each group, calculate standings
    const groups = groupsMap.map((g) => {
      const teamIds = g.teams.map((t) => t.id)
      const groupMatches = matches.filter(
        (m) => teamIds.includes(m.home_club) && teamIds.includes(m.away_club)
      )

      const leagueConfigEquivalent = {
        format: 'league' as const,
        rounds: groupStageConfig.homeAndAway ? (g.teams.length - 1) * 2 : (g.teams.length - 1),
        homeAndAway: groupStageConfig.homeAndAway,
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
        tiebreakers: ['goal_difference', 'goals_scored'] as any[],
        relegationZone: 0,
        promotionZone: groupStageConfig.qualifiersPerGroup,
      }

      const standings = calculateStandings(groupMatches, g.teams, leagueConfigEquivalent)

      return {
        name: g.name,
        teams: g.teams,
        standings,
      }
    })

    // Knockout matches: matches that aren't inside any group
    const knockoutMatches = matches.filter((m) => {
      const groupA = groups.find((g) => g.teams.some((t) => t.id === m.home_club))
      const groupB = groups.find((g) => g.teams.some((t) => t.id === m.away_club))
      return groupA !== groupB
    })

    // Determine qualifiers: top qualifiersPerGroup from each group
    const qualifiers: { id: string; name: string }[] = []
    groups.forEach((g) => {
      const passed = g.standings.slice(0, groupStageConfig.qualifiersPerGroup)
      passed.forEach((s) => {
        qualifiers.push({ id: s.club, name: s.club_name })
      })
    })

    // Generate bracket template based on qualifiers
    const cupConfigEquivalent = {
      format: 'cup' as const,
      seeded: false,
      twoLegs: tournamentConfig.knockoutStage.twoLegs,
      twoLegsFinal: false,
      extraTimeOnDraw: tournamentConfig.knockoutStage.extraTimeOnDraw,
      penaltiesOnDraw: tournamentConfig.knockoutStage.penaltiesOnDraw,
      rounds: tournamentConfig.knockoutStage.rounds as any[],
      byeAllowed: false,
    }

    const bracketTemplate = generateCupBracket(qualifiers, cupConfigEquivalent)

    // Merge actual knockoutMatches results into the bracket template
    const bracket = bracketTemplate.map((round) => {
      const matchesInRound = round.matches.map((m) => {
        const actualMatch = knockoutMatches.find((km) => {
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

    return { groups, bracket }
  }, [matches, initialStandings, tournamentConfig])

  return {
    groups: tournamentData.groups,
    bracket: tournamentData.bracket,
    isLoading: loadingMatches || loadingInitial,
    error,
  }
}
