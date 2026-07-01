// Competitions Phase 3 hooks — matches, standings, schedule generation, club registration

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'

export const matchKeys = {
  all: ['matches'] as const,
  byCompetition: (id: string) => ['matches', 'competition', id] as const,
}

export const standingKeys = {
  all: ['standings'] as const,
  byCompetition: (id: string) => ['standings', 'competition', id] as const,
}

/**
 * Fetch match list for a competition (public, no auth).
 */
export function useCompetitionMatches(competitionId: string) {
  return useQuery({
    queryKey: matchKeys.byCompetition(competitionId),
    queryFn: () => competitionApi.listMatches(competitionId),
    enabled: Boolean(competitionId),
    staleTime: 30_000,
  })
}

/**
 * Fetch standings/league table for a competition (public, no auth).
 */
export function useCompetitionStandings(competitionId: string) {
  return useQuery({
    queryKey: standingKeys.byCompetition(competitionId),
    queryFn: () => competitionApi.getStandings(competitionId),
    enabled: Boolean(competitionId),
    staleTime: 30_000,
  })
}

/**
 * Mutation: Register a club in a competition (org admin).
 */
export function useRegisterClub(competitionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: (clubId: string) =>
      competitionApi.registerClub(competitionId, clubId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: standingKeys.byCompetition(competitionId) })
      queryClient.invalidateQueries({ queryKey: matchKeys.byCompetition(competitionId) })
    },
  })
}

/**
 * Mutation: Generate round-robin schedule (org admin).
 */
export function useGenerateSchedule(competitionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      startDate,
      roundsIntervalDays,
      doubleRound,
    }: {
      startDate: string
      roundsIntervalDays?: number
      doubleRound?: boolean
    }) =>
      competitionApi.generateSchedule(
        competitionId,
        startDate,
        roundsIntervalDays ?? 7,
        doubleRound ?? true
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.byCompetition(competitionId) })
    },
  })
}

/**
 * Mutation: Update match score (org admin). Recalculates standings on success.
 */
export function useUpdateMatchScore(competitionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      matchId,
      homeScore,
      awayScore,
      status,
    }: {
      matchId: string
      homeScore: number
      awayScore: number
      status?: string
    }) =>
      competitionApi.updateMatchScore(matchId, homeScore, awayScore, status ?? 'finished'),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.byCompetition(competitionId) })
      queryClient.invalidateQueries({ queryKey: standingKeys.byCompetition(competitionId) })
    },
  })
}
