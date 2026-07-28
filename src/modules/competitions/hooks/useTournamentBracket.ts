import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCompetitionConfig } from './useCompetitionConfig'
import { competitionApi } from '../services/competition.api'
import { calculateStandings } from '../utils/league-calculator'
import { generateCupBracket, type BracketRound } from '../utils/bracket-generator'
import type { Match, Standing } from '../types'

type TournamentGroupView = {
  name: string
  teams: { id: string; name: string; logo?: string | null }[]
  standings: Standing[]
}

type TournamentBracketView = {
  groups: TournamentGroupView[]
  bracket: BracketRound[]
  source: 'api' | 'fallback'
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeBracketFromApi(payload: unknown): BracketRound[] {
  if (Array.isArray(payload)) {
    return payload as BracketRound[]
  }

  if (!isObject(payload)) {
    return []
  }

  const candidate = payload.bracket ?? payload.rounds ?? payload.data ?? payload.results
  return Array.isArray(candidate) ? (candidate as BracketRound[]) : []
}

function normalizeGroupsFromApi(payload: unknown): TournamentGroupView[] {
  if (!isObject(payload)) {
    return []
  }

  const candidate = payload.groups ?? payload.groupStage ?? payload.group_stage
  if (!Array.isArray(candidate)) {
    return []
  }

  return candidate
    .map((group, index) => {
      if (!isObject(group)) return null

      const standings = Array.isArray(group.standings) ? (group.standings as Standing[]) : []
      const teams = Array.isArray(group.teams)
        ? (group.teams as { id: string; name: string; logo?: string | null }[])
        : standings.map((standing) => ({
            id: standing.club,
            name: standing.club_name,
            logo: standing.club_logo,
          }))

      return {
        name: String(group.name ?? group.label ?? `Grupo ${String.fromCharCode(65 + index)}`),
        teams,
        standings,
      }
    })
    .filter((group): group is TournamentGroupView => Boolean(group))
}

function buildFallbackTournamentData(
  tournamentConfig: NonNullable<ReturnType<typeof useCompetitionConfig>['tournamentConfig']>,
  standings: Standing[],
  matches: Match[]
): TournamentBracketView {
  if (!tournamentConfig || standings.length === 0) {
    return { groups: [], bracket: [], source: 'fallback' }
  }

  const allClubs = standings.map((s) => ({
    id: s.club,
    name: s.club_name,
    logo: s.club_logo,
  }))

  const numGroups = tournamentConfig.groupStage.numberOfGroups || 2
  const teamsPerGroup = Math.ceil(allClubs.length / numGroups)

  const groupsMap = Array.from({ length: numGroups }, (_, index) => ({
    name: `Grupo ${String.fromCharCode(65 + index)}`,
    teams: allClubs.slice(index * teamsPerGroup, (index + 1) * teamsPerGroup),
  }))

  const groups = groupsMap.map((group) => {
    const teamIds = group.teams.map((team) => team.id)
    const groupMatches = matches.filter(
      (match) =>
        teamIds.includes(match.home_club) &&
        teamIds.includes(match.away_club)
    )

    const leagueConfigEquivalent = {
      format: 'league' as const,
      rounds: tournamentConfig.groupStage.homeAndAway
        ? (group.teams.length - 1) * 2
        : group.teams.length - 1,
      homeAndAway: tournamentConfig.groupStage.homeAndAway,
      pointsWin: 3,
      pointsDraw: 1,
      pointsLoss: 0,
      tiebreakers: ['goal_difference', 'goals_scored'] as const,
      relegationZone: 0,
      promotionZone: tournamentConfig.groupStage.qualifiersPerGroup,
    }

    const standingsForGroup = calculateStandings(groupMatches, group.teams, leagueConfigEquivalent as any)

    return {
      name: group.name,
      teams: group.teams,
      standings: standingsForGroup,
    }
  })

  const knockoutMatches = matches.filter((match) => {
    const groupA = groups.find((group) => group.teams.some((team) => team.id === match.home_club))
    const groupB = groups.find((group) => group.teams.some((team) => team.id === match.away_club))
    return groupA !== groupB
  })

  const qualifiers: { id: string; name: string }[] = []
  groups.forEach((group) => {
    group.standings.slice(0, tournamentConfig.groupStage.qualifiersPerGroup).forEach((standing) => {
      qualifiers.push({ id: standing.club, name: standing.club_name })
    })
  })

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

  const bracket = bracketTemplate.map((round) => {
    const matchesInRound = round.matches.map((match) => {
      const actualMatch = knockoutMatches.find((knockoutMatch) => {
        if (!match.team1 || !match.team2) return false
        return (
          (knockoutMatch.home_club === match.team1 && knockoutMatch.away_club === match.team2) ||
          (knockoutMatch.home_club === match.team2 && knockoutMatch.away_club === match.team1)
        )
      })

      if (!actualMatch) return match

      return {
        ...match,
        id: actualMatch.id,
        score1: actualMatch.home_score,
        score2: actualMatch.away_score,
        winner:
          actualMatch.status === 'finished'
            ? actualMatch.home_score! > actualMatch.away_score!
              ? actualMatch.home_club
              : actualMatch.away_club
            : null,
        status: actualMatch.status,
        team1: actualMatch.home_club,
        team1Name: actualMatch.home_club_name,
        team2: actualMatch.away_club,
        team2Name: actualMatch.away_club_name,
      }
    })

    return {
      ...round,
      matches: matchesInRound,
    }
  })

  return { groups, bracket, source: 'fallback' }
}

export function useTournamentBracket(competitionId: string) {
  const { tournamentConfig } = useCompetitionConfig(competitionId)

  const { data, isLoading: loadingBracket, error } = useQuery<TournamentBracketView>({
    queryKey: ['competition', competitionId, 'tournament-bracket'],
    queryFn: async () => {
      const [apiBracket, standings, matches] = await Promise.all([
        competitionApi.getBracket(competitionId).catch(() => null),
        competitionApi.getStandings(competitionId).catch(() => [] as Standing[]),
        competitionApi.listMatches(competitionId).catch(() => [] as Match[]),
      ])

      const bracket = normalizeBracketFromApi(apiBracket)
      const groups = normalizeGroupsFromApi(apiBracket)

      if (groups.length > 0 || bracket.length > 0) {
        return {
          groups,
          bracket,
          source: 'api' as const,
        }
      }

      return buildFallbackTournamentData(tournamentConfig as any, standings, matches)
    },
    enabled: Boolean(competitionId),
    staleTime: 30_000,
  })

  const groups = useMemo(() => data?.groups ?? [], [data?.groups])
  const bracket = useMemo(() => data?.bracket ?? [], [data?.bracket])

  return {
    groups,
    bracket,
    source: data?.source ?? 'fallback',
    isLoading: loadingBracket,
    error,
  }
}
