import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'
import type { Match, MatchListParams, PaginatedResponse } from '../types'

export interface CompetitionRoundView {
  id: string
  number: number
  label: string
  name?: string
  type?: string
  status?: string
  phase?: string
  groupId?: string
  matches: Match[]
}

export interface CompetitionRoundsView {
  rounds: CompetitionRoundView[]
  source: 'api' | 'fallback'
}

export const matchKeys = {
  all: ['matches'] as const,
  lists: () => [...matchKeys.all, 'list'] as const,
  list: (params?: Record<string, any>) => [...matchKeys.lists(), params] as const,
  byCompetition: (id: string) => ['matches', 'competition', id] as const,
}

export const standingKeys = {
  all: ['standings'] as const,
  byCompetition: (id: string) => ['standings', 'competition', id] as const,
}

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function normalizeMatches(payload: unknown): Match[] {
  if (Array.isArray(payload)) {
    return payload as Match[]
  }

  if (isObject(payload)) {
    if (Array.isArray(payload.results)) return payload.results as Match[]
    if (Array.isArray(payload.matches)) return payload.matches as Match[]
    if (Array.isArray(payload.data)) return payload.data as Match[]
  }

  return []
}

function normalizeRoundEntry(entry: unknown, index: number, fallbackMatches: Match[] = []): CompetitionRoundView | null {
  if (!isObject(entry)) {
    return null
  }

  const rawMatches = normalizeMatches(entry.matches)
  const number = Number(entry.number ?? entry.round_number ?? entry.order ?? index + 1)
  const label = String(
    entry.label ??
    entry.name ??
    entry.round_name ??
    entry.title ??
    `Ronda ${Number.isFinite(number) ? number : index + 1}`
  )
  const phase = typeof entry.phase === 'string' ? entry.phase : undefined
  const groupId = typeof entry.groupId === 'string' ? entry.groupId : typeof entry.group_id === 'string' ? entry.group_id : undefined
  const matches = rawMatches.length > 0
    ? rawMatches
    : fallbackMatches.filter((match) => {
        if (match.round_number !== (Number.isFinite(number) ? number : index + 1)) return false
        if (phase !== undefined && (match.phase ?? undefined) !== phase) return false
        if (groupId !== undefined && (match.group_id ?? undefined) !== groupId) return false
        return true
      })

  return {
    id: String(entry.id ?? entry.key ?? `${number}-${index}`),
    number: Number.isFinite(number) ? number : index + 1,
    label,
    name: typeof entry.name === 'string' ? entry.name : undefined,
    type: typeof entry.type === 'string' ? entry.type : undefined,
    status: typeof entry.status === 'string' ? entry.status : undefined,
    phase,
    groupId,
    matches,
  }
}

function groupMatchesByRound(matches: Match[]): CompetitionRoundView[] {
  const grouped = matches.reduce<Record<number, Match[]>>((acc, match) => {
    const round = match.round_number ?? 0
    if (!acc[round]) acc[round] = []
    acc[round].push(match)
    return acc
  }, {})

  return Object.entries(grouped)
    .sort(([a], [b]) => Number(a) - Number(b))
    .map(([roundNumber, roundMatches]) => ({
      id: `round-${roundNumber}`,
      number: Number(roundNumber),
      label: `Ronda ${roundNumber}`,
      matches: roundMatches.sort((a, b) => a.match_date.localeCompare(b.match_date)),
    }))
}

function normalizeRoundsPayload(payload: unknown, fallbackMatches: Match[]): CompetitionRoundsView {
  if (Array.isArray(payload)) {
    const rounds = payload
      .map((entry, index) => normalizeRoundEntry(entry, index, fallbackMatches))
      .filter((entry): entry is CompetitionRoundView => Boolean(entry))

    if (rounds.length > 0) {
      return { rounds, source: 'api' }
    }
  }

  if (isObject(payload)) {
    const candidate = payload.rounds ?? payload.results ?? payload.data

    if (Array.isArray(candidate)) {
      const rounds = candidate
        .map((entry, index) => normalizeRoundEntry(entry, index, fallbackMatches))
        .filter((entry): entry is CompetitionRoundView => Boolean(entry))

      if (rounds.length > 0) {
        return { rounds, source: 'api' }
      }
    }
  }

  return {
    rounds: groupMatchesByRound(fallbackMatches),
    source: 'fallback',
  }
}

/**
 * Fetch match list for a competition (public, no auth).
 */
export function useCompetitionMatches(
  competitionId: string,
  filters?: { round_number?: number; phase?: string; groupId?: string; group_id?: string }
) {
  return useQuery({
    queryKey: [...matchKeys.byCompetition(competitionId), filters],
    queryFn: () => competitionApi.listMatches(competitionId, filters),
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
 * Fetch the competition rounds directly from the backend endpoint.
 * Falls back to client-side grouping when the endpoint is unavailable.
 */
export function useCompetitionRounds(
  competitionId: string,
  filters?: { phase?: string; groupId?: string; group_id?: string }
) {
  return useQuery<CompetitionRoundsView>({
    queryKey: [...matchKeys.byCompetition(competitionId), 'rounds', filters],
    queryFn: async () => {
      // Try fetching rounds endpoint — treat 404 as "not available" and fall back to client grouping.
      let roundsPayload: unknown | null = null
      try {
        roundsPayload = await competitionApi.getRounds(competitionId, filters)
      } catch (err: any) {
        // If rounds endpoint missing (404), fallback to grouping matches client-side.
        if (err?.response?.status !== 404) {
          // For other errors (500, network), propagate to surface an error in the UI.
          throw err
        }
        roundsPayload = null
      }

      // Always attempt to fetch matches. If this fails (500/404) let the error propagate so UI can show it.
      const matches = await competitionApi.listMatches(competitionId, filters)

      return normalizeRoundsPayload(roundsPayload, matches)
    },
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
      seed,
    }: {
      startDate: string
      roundsIntervalDays?: number
      doubleRound?: boolean
      seed?: string
    }) =>
      competitionApi.generateSchedule(
        competitionId,
        startDate,
        roundsIntervalDays ?? 7,
        doubleRound ?? true,
        seed?.trim() || undefined
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: matchKeys.byCompetition(competitionId) })
    },
  })
}

/**
 * Mutation: Create a manual match (org admin).
 */
export function useCreateMatch(competitionId: string) {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn: ({
      home_club,
      away_club,
      match_date,
      round_number,
      round_name,
      phase,
      group_id,
      venue,
      status,
    }: {
      home_club: string
      away_club: string
      match_date: string
      round_number?: number
      round_name?: string
      phase?: string
      group_id?: string
      venue?: string
      status?: string
    }) =>
      competitionApi.createMatch(competitionId, {
        home_club,
        away_club,
        match_date,
        round_number,
        round_name,
        phase,
        group_id,
        venue,
        status,
      }),
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

/**
 * Fetch the paginated/filtered list of matches.
 */
export function useMatches(params?: MatchListParams | Record<string, any>) {
  return useQuery({
    queryKey: matchKeys.list(params),
    queryFn: async () => {
      const response = await competitionApi.listAllMatches(params)
      return response.results
    },
  })
}

/**
 * Fetch the paginated/filtered list of matches with counts.
 */
export function useMatchesPaginated(params?: MatchListParams | Record<string, any>) {
  return useQuery<PaginatedResponse<Match>>({
    queryKey: matchKeys.list(params),
    queryFn: () => competitionApi.listAllMatches(params),
  })
}
