import { useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCompetitionConfig } from './useCompetitionConfig'
import { competitionApi } from '../services/competition.api'
import { generateCupBracket, type BracketRound } from '../utils/bracket-generator'
import type { Match, Standing } from '../types'

interface CupBracketView {
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
  if (Array.isArray(candidate)) {
    return candidate as BracketRound[]
  }

  return []
}

function buildBracketFallback(
  standings: Standing[],
  matches: Match[],
  cupConfig: NonNullable<ReturnType<typeof useCompetitionConfig>['cupConfig']>
): BracketRound[] {
  if (standings.length === 0) return []

  const clubs = standings.map((s) => ({
    id: s.club,
    name: s.club_name,
  }))

  const bracketTemplate = generateCupBracket(clubs, cupConfig)

  return bracketTemplate.map((round) => {
    const matchesInRound = round.matches.map((m) => {
      const actualMatch = matches.find((km) => {
        if (!m.team1 || !m.team2) return false
        return (
          (km.home_club === m.team1 && km.away_club === m.team2) ||
          (km.home_club === m.team2 && km.away_club === m.team1)
        )
      })

      if (!actualMatch) return m

      return {
        ...m,
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
}

export function useCupBracket(competitionId: string) {
  const { cupConfig } = useCompetitionConfig(competitionId)

  const { data, isLoading: loadingBracket, error } = useQuery<CupBracketView>({
    queryKey: ['competition', competitionId, 'cup-bracket'],
    queryFn: async () => {
      const [apiBracket, standings, matches] = await Promise.all([
        competitionApi.getBracket(competitionId).catch(() => null),
        competitionApi.getStandings(competitionId).catch(() => [] as Standing[]),
        competitionApi.listMatches(competitionId).catch(() => [] as Match[]),
      ])

      const bracket = normalizeBracketFromApi(apiBracket)
      if (bracket.length > 0) {
        return { bracket, source: 'api' as const }
      }

      return {
        bracket:
          cupConfig && standings.length > 0
            ? buildBracketFallback(standings, matches, cupConfig)
            : [],
        source: 'fallback' as const,
      }
    },
    enabled: Boolean(competitionId),
    staleTime: 30_000,
  })

  const bracket = useMemo(() => data?.bracket ?? [], [data?.bracket])

  return {
    bracket,
    source: data?.source ?? 'fallback',
    isLoading: loadingBracket,
    error,
  }
}
