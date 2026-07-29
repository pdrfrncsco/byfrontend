// src/modules/competitions/hooks/useMatchLive.ts
import { useState, useEffect, useCallback, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { matchApi } from '../services/match.api'
import { MATCH_QUERY_KEYS } from './useMatchCenter'
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

      // Keep React Query cache up to date
      if (matchData) {
        queryClient.setQueryData(
          MATCH_QUERY_KEYS.byCompetition(competitionId),
          (old: Match[] | undefined) =>
            old ? old.map((m) => (m.id === matchId ? matchData : m)) : [matchData]
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
