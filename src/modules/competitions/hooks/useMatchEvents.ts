// src/modules/competitions/hooks/useMatchEvents.ts
import { useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { matchApi } from '../services/match.api'
import { MATCH_QUERY_KEYS } from './useMatchCenter'
import { isGoalEvent, isCardEvent, isSubstitutionEvent } from '../types/match-event.types'
import type { MatchEvent, MatchEventFormData } from '../types'
import { toast } from 'sonner'

// ─── Interface ──────────────────────────────────────────────────────────────

export interface UseMatchEventsReturn {
  events: MatchEvent[]
  addEvent: (data: MatchEventFormData) => Promise<void>
  removeEvent: (eventId: string) => Promise<void>
  isAddingEvent: boolean
  isRemovingEvent: boolean
  // Golos por equipa
  homeGoals: number
  awayGoals: number
  // Agrupados por tipo
  goals: MatchEvent[]
  cards: MatchEvent[]
  substitutions: MatchEvent[]
  // Meta
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMatchEvents({
  competitionId,
  matchId,
  homeTeamId,
  awayTeamId,
}: {
  competitionId: string
  matchId: string
  homeTeamId?: string
  awayTeamId?: string
}): UseMatchEventsReturn {
  const queryClient = useQueryClient()

  const query = useQuery({
    queryKey: MATCH_QUERY_KEYS.events(matchId),
    queryFn: () => matchApi.listEvents(competitionId, matchId),
    enabled: Boolean(competitionId) && Boolean(matchId),
    staleTime: 10_000,
  })

  const events: MatchEvent[] = query.data ?? []

  // ─── Computed groups ──────────────────────────────────────────────────
  const goals = events.filter(isGoalEvent)
  const cards = events.filter(isCardEvent)
  const substitutions = events.filter(isSubstitutionEvent)

  const homeGoals = goals.filter((e) => e.teamId === homeTeamId || e.club === homeTeamId).length
  const awayGoals = goals.filter((e) => e.teamId === awayTeamId || e.club === awayTeamId).length

  // ─── Add event mutation ───────────────────────────────────────────────
  const addMutation = useMutation({
    mutationFn: async (data: MatchEventFormData): Promise<void> => {
      // Optimistic update
      const optimisticEvent: MatchEvent = {
        id: `optimistic-${Date.now()}`,
        matchId,
        type: data.type,
        minute: data.minute,
        minuteExtra: data.minuteExtra,
        period: data.period,
        teamId: data.teamId,
        playerId: data.playerId,
        assistPlayerId: data.assistPlayerId,
        substitutedPlayerId: data.substitutedPlayerId,
        description: data.description,
        createdBy: 'current-user',
        createdAt: new Date().toISOString(),
        // Legacy fields
        event_type: data.type as any,
        event_type_label: data.type,
        extra_time: false,
        player: data.playerId ?? null,
        player_name: null,
        player_off: data.substitutedPlayerId ?? null,
        player_off_name: null,
        club: data.teamId,
        club_name: '',
        club_logo: null,
        notes: data.description ?? '',
        created_at: new Date().toISOString(),
      }

      queryClient.setQueryData(
        MATCH_QUERY_KEYS.events(matchId),
        (old: MatchEvent[] | undefined) => [...(old ?? []), optimisticEvent]
      )

      try {
        await matchApi.createEvent(competitionId, matchId, data)
      } catch (err) {
        // Rollback optimistic update
        queryClient.setQueryData(
          MATCH_QUERY_KEYS.events(matchId),
          (old: MatchEvent[] | undefined) =>
            (old ?? []).filter((e) => e.id !== optimisticEvent.id)
        )
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.events(matchId) })
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.byCompetition(competitionId) })
      toast.success('Evento registado com sucesso!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao registar evento.')
    },
  })

  // ─── Remove event mutation ────────────────────────────────────────────
  const removeMutation = useMutation({
    mutationFn: async (eventId: string): Promise<void> => {
      // Optimistic removal
      const prevEvents = queryClient.getQueryData<MatchEvent[]>(MATCH_QUERY_KEYS.events(matchId))
      queryClient.setQueryData(
        MATCH_QUERY_KEYS.events(matchId),
        (old: MatchEvent[] | undefined) => (old ?? []).filter((e) => e.id !== eventId)
      )
      try {
        await matchApi.deleteEvent(competitionId, matchId, eventId)
      } catch (err) {
        // Rollback
        queryClient.setQueryData(MATCH_QUERY_KEYS.events(matchId), prevEvents)
        throw err
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.events(matchId) })
      queryClient.invalidateQueries({ queryKey: MATCH_QUERY_KEYS.byCompetition(competitionId) })
      toast.success('Evento removido!')
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || 'Erro ao remover evento.')
    },
  })

  const addEvent = useCallback(
    (data: MatchEventFormData) => addMutation.mutateAsync(data),
    [addMutation]
  )
  const removeEvent = useCallback(
    (eventId: string) => removeMutation.mutateAsync(eventId),
    [removeMutation]
  )

  return {
    events,
    addEvent,
    removeEvent,
    isAddingEvent: addMutation.isPending,
    isRemovingEvent: removeMutation.isPending,
    homeGoals,
    awayGoals,
    goals,
    cards,
    substitutions,
    isLoading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
  }
}
