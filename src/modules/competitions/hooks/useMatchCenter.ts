// src/modules/competitions/hooks/useMatchCenter.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { competitionApi } from '../services/competition.api'
import type { Match, MatchStatus, MatchEventCreateData } from '../types'
import { toast } from 'sonner'

// ─── Query Keys ────────────────────────────────────────────────────────────────

export const MATCH_QUERY_KEYS = {
  all: ['matches'] as const,
  byCompetition: (competitionId: string) =>
    ['matches', 'competition', competitionId] as const,
  detail: (matchId: string) =>
    ['matches', matchId] as const,
  events: (matchId: string) =>
    ['matches', matchId, 'events'] as const,
  eventsByComp: (compId: string, matchId: string) =>
    ['matches', compId, matchId, 'events'] as const,
  lineup: (matchId: string, teamId: string) =>
    ['matches', matchId, 'lineup', teamId] as const,
  stats: (matchId: string) =>
    ['matches', matchId, 'stats'] as const,
  report: (matchId: string) =>
    ['matches', matchId, 'report'] as const,
  live: ['matches', 'live'] as const,
}

// Legacy key for backward compat
export const matchCenterKeys = {
  all: ['match-center'] as const,
  events: (compId: string, matchId: string) => [...matchCenterKeys.all, compId, 'events', matchId] as const,
  playerStats: (compId: string) => [...matchCenterKeys.all, compId, 'stats'] as const,
}

// ─── useMatchCenter ─────────────────────────────────────────────────────────────

export interface UseMatchCenterOptions {
  competitionId: string
  roundNumber?: number
  status?: MatchStatus[]
  teamId?: string
}

export interface Round {
  number: number
  label: string
  matches: Match[]
}

export interface UseMatchCenterReturn {
  matches: Match[]
  rounds: Round[]
  selectedRound: number | null
  setSelectedRound: (round: number | null) => void
  liveMatches: Match[]
  upcomingMatches: Match[]
  finishedMatches: Match[]
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

import { useEffect, useState } from 'react'

export function useMatchCenter(options: UseMatchCenterOptions): UseMatchCenterReturn {
  const { competitionId, roundNumber, status, teamId } = options
  const [selectedRound, setSelectedRound] = useState<number | null>(roundNumber ?? null)

  useEffect(() => {
    setSelectedRound(roundNumber ?? null)
  }, [roundNumber])

  const params: Record<string, any> = {}
  if (selectedRound !== null) params.round_number = selectedRound
  if (status?.length) params.status = status.join(',')
  if (teamId) params.team_id = teamId

  const query = useQuery({
    queryKey: [...MATCH_QUERY_KEYS.byCompetition(competitionId), params],
    queryFn: () => competitionApi.listMatches(competitionId, params),
    enabled: Boolean(competitionId),
    staleTime: 60_000,
    refetchInterval: (query) => {
      // Only poll if there are live matches
      const data = query.state.data as Match[] | undefined
      if (!data) return false
      const hasLive = data.some(m => m.status === 'live' || m.status === 'halftime')
      return hasLive ? 30_000 : false // Poll every 30s when live matches exist
    },
  })

  const matches = (query.data ?? []) as Match[]

  // Compute derived lists
  const liveMatches = matches.filter(m =>
    m.status === 'live' || m.status === 'halftime'
  )
  const upcomingMatches = matches.filter(m =>
    m.status === 'scheduled' || m.status === 'pre_match'
  )
  const finishedMatches = matches.filter(m =>
    m.status === 'finished' || m.status === 'walkover' || m.status === 'cancelled' || m.status === 'postponed'
  )

  // Group into rounds with safe fallback
  const roundMap = new Map<number, Match[]>()
  for (const match of matches) {
    const rn = match.roundNumber ?? match.round_number ?? 0
    if (!roundMap.has(rn)) roundMap.set(rn, [])
    roundMap.get(rn)!.push(match)
  }
  const rounds: Round[] = Array.from(roundMap.entries())
    .sort(([a], [b]) => a - b)
    .map(([number, ms]) => ({
      number,
      label: ms[0]?.roundLabel ?? ms[0]?.round_name ?? `Jornada ${number}`,
      matches: ms,
    }))

  return {
    matches,
    rounds,
    selectedRound,
    setSelectedRound,
    liveMatches,
    upcomingMatches,
    finishedMatches,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}

// ─── Legacy hooks (kept for backward compatibility) ─────────────────────────────

export function useCompetitionMatchEvents(competitionId: string, matchId: string) {
  return useQuery({
    queryKey: MATCH_QUERY_KEYS.eventsByComp(competitionId, matchId),
    queryFn: () => competitionApi.listMatchEvents(competitionId, matchId),
    enabled: !!competitionId && !!matchId,
    staleTime: 10_000,
  })
}

export function useAddMatchEvent(competitionId: string, matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: MatchEventCreateData) =>
      competitionApi.addMatchEvent(competitionId, matchId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.eventsByComp(competitionId, matchId) })
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.events(matchId) })
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.byCompetition(competitionId) })
      toast.success('Evento adicionado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao adicionar evento.')
    },
  })
}

export function useDeleteMatchEvent(competitionId: string, matchId: string) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (eventId: string) =>
      competitionApi.deleteMatchEvent(competitionId, matchId, eventId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.eventsByComp(competitionId, matchId) })
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.events(matchId) })
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.byCompetition(competitionId) })
      toast.success('Evento removido com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover evento.')
    },
  })
}

export function usePlayerStats(competitionId: string) {
  return useQuery({
    queryKey: matchCenterKeys.playerStats(competitionId),
    queryFn: () => competitionApi.getPlayerStats(competitionId),
    enabled: !!competitionId,
  })
}
