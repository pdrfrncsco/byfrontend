// src/modules/competitions/hooks/useMatchLive.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { matchApi, mapMatchEventFromBackend } from '../services/match.api'
import { MATCH_QUERY_KEYS } from './useMatchCenter'
import { useNotificationStream } from '@/modules/notifications/hooks'
import type { Match, MatchEvent } from '../types'

// ─── Polling Intervals (ms) ─────────────────────────────────────────────────

const POLL_INTERVALS: Partial<Record<string, number>> = {
  live: 15_000,
  halftime: 30_000,
  pre_match: 60_000,
}

// ─── Interface ──────────────────────────────────────────────────────────────

export interface UseMatchLiveOptions {
  competitionId: string
  matchId: string
  /** Initial match data (avoids first-load spinner if already fetched) */
  initialMatch?: Match
}

export interface UseMatchLiveReturn {
  match: Match | null
  events: MatchEvent[]
  currentMinute: number | null
  isLive: boolean
  isHalftime: boolean
  lastUpdated: Date | null
  isLoading: boolean
  error: Error | null
  refetch: () => void
}

// ─── Hook ───────────────────────────────────────────────────────────────────

export function useMatchLive({
  competitionId,
  matchId,
  initialMatch,
}: UseMatchLiveOptions): UseMatchLiveReturn {
  const queryClient = useQueryClient()
  const [match, setMatch] = useState<Match | null>(initialMatch ?? null)
  const [events, setEvents] = useState<MatchEvent[]>([])
  const [isLoading, setIsLoading] = useState(!initialMatch)
  const [error, setError] = useState<Error | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const isMountedRef = useRef(true)

  // ─── Fetch match + events ──────────────────────────────────────────────
  const fetchData = useCallback(async () => {
    if (!competitionId || !matchId) return
    try {
      const [matchData, eventsData] = await Promise.all([
        matchApi.get(competitionId, matchId),
        matchApi.listEvents(competitionId, matchId),
      ])

      if (!isMountedRef.current) return

      setMatch(matchData)
      setEvents(eventsData)
      setLastUpdated(new Date())
      setError(null)

      // Keep React Query cache up to date across hub and detail views.
      if (matchData) {
        queryClient.setQueryData(
          MATCH_QUERY_KEYS.byCompetition(competitionId),
          (old: Match[] | undefined) => {
            const next = old ? [...old] : []
            const existingIndex = next.findIndex((m) => m.id === matchId)

            if (existingIndex >= 0) {
              next[existingIndex] = matchData
            } else {
              next.push(matchData)
            }

            return next
          }
        )

        queryClient.setQueryData(
          MATCH_QUERY_KEYS.detail(matchId),
          matchData,
        )
      }
    } catch (err) {
      if (!isMountedRef.current) return
      setError(err as Error)
    } finally {
      if (isMountedRef.current) setIsLoading(false)
    }
  }, [competitionId, matchId, queryClient])

  // ─── Manage polling interval ──────────────────────────────────────────
  const setupPolling = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }

    const status = match?.status
    const interval = status ? POLL_INTERVALS[status] : undefined

    if (interval) {
      intervalRef.current = setInterval(() => {
        // Pause polling when tab is hidden
        if (document.visibilityState === 'hidden') return
        fetchData()
      }, interval)
    }
  }, [match?.status, fetchData])

  // ─── Initial fetch ─────────────────────────────────────────────────────
  useEffect(() => {
    isMountedRef.current = true
    fetchData()
    return () => {
      isMountedRef.current = false
    }
  }, [fetchData])

  // ─── Setup / teardown polling on status change ─────────────────────────
  useEffect(() => {
    setupPolling()

    // Stop polling once match is finished
    if (
      match?.status === 'finished' ||
      match?.status === 'cancelled' ||
      match?.status === 'walkover' ||
      match?.status === 'postponed'
    ) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
        intervalRef.current = null
      }
    }
  }, [match?.status, setupPolling])

  // ─── Visibility change — pause/resume polling ──────────────────────────
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Immediately refresh when tab becomes visible
        fetchData()
        setupPolling()
      }
    }
    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange)
  }, [fetchData, setupPolling])

  // Integrate notification stream (SSE) to receive match events in real time.
  // Keeps polling as a fallback; notifications update local state and react-query cache immediately.
  useNotificationStream({
    enabled: Boolean(matchId),
    onNewNotification: (notif) => {
      try {
        const payload = notif.payload || {}
        const notifMatchId = payload.matchId || payload.match || payload.match_id
        if (!notifMatchId || String(notifMatchId) !== String(matchId)) return

        // If notification carries event data, map it and prepend to events
        const eventData = payload.event || payload.event_data || payload.data || payload
        const mapped = eventData ? mapMatchEventFromBackend(eventData) : null
        if (mapped) {
          setEvents((prev) => {
            if (prev.some((e) => e.id === mapped.id)) return prev
            const next = [mapped, ...prev]
            // keep react-query events cache synced
            queryClient.setQueryData(MATCH_QUERY_KEYS.events(matchId), (old: MatchEvent[] | undefined) =>
              old ? [mapped, ...old] : [mapped]
            )
            return next
          })
        }

        // If notification updates the match score or status, update match state and competition list cache
        const hasScore = payload.home_score !== undefined || payload.away_score !== undefined
        const hasStatus = payload.status !== undefined
        if (hasScore || hasStatus) {
          setMatch((prev) => {
            if (!prev) return prev
            const nextMatch = {
              ...prev,
              score: hasScore
                ? {
                    home: payload.home_score ?? prev.score?.home ?? 0,
                    away: payload.away_score ?? prev.score?.away ?? 0,
                    homeFirstHalf: payload.home_first_half ?? prev.score?.homeFirstHalf,
                    awayFirstHalf: payload.away_first_half ?? prev.score?.awayFirstHalf,
                    homePenalties: payload.home_penalties ?? prev.score?.homePenalties,
                    awayPenalties: payload.away_penalties ?? prev.score?.awayPenalties,
                  }
                : prev.score,
              status: hasStatus ? payload.status : prev.status,
            }

            // update competition-level list cache and detail cache so both hub and detail reflect the same live state
            queryClient.setQueryData(
              MATCH_QUERY_KEYS.byCompetition(competitionId),
              (old: Match[] | undefined) => {
                const next = old ? [...old] : []
                const existingIndex = next.findIndex((m) => m.id === matchId)

                if (existingIndex >= 0) {
                  next[existingIndex] = nextMatch
                } else {
                  next.push(nextMatch)
                }

                return next
              }
            )
            queryClient.setQueryData(MATCH_QUERY_KEYS.detail(matchId), nextMatch)

            return nextMatch
          })
        }
      } catch (err) {
        // non-fatal — keep polling
        // eslint-disable-next-line no-console
        console.warn('[useMatchLive] failed to apply notification', err)
      }
    },
  })

  // ─── Compute current minute from events ───────────────────────────────
  const currentMinute: number | null =
    match?.status === 'live' || match?.status === 'halftime'
      ? (match.events?.length || events.length
          ? Math.max(...[...(match.events ?? []), ...events].map((e) => e.minute ?? 0))
          : 0)
      : null

  return {
    match,
    events,
    currentMinute,
    isLive: match?.status === 'live',
    isHalftime: match?.status === 'halftime',
    lastUpdated,
    isLoading,
    error,
    refetch: fetchData,
  }
}
