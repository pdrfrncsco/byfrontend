import { useEffect, useRef, useState } from 'react'
import { useAuthStore } from '@/app/stores/auth-store'
import { API_ROUTES } from '@/constants/routes'
import { mapMatchEventFromBackend, mapMatchFromBackend } from '../services/match.api'
import type { Match, MatchEvent } from '../types'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

interface MatchStreamOptions {
  competitionId: string
  matchId: string
  enabled?: boolean
  onMatch?: (match: Match) => void
  onEvent?: (event: MatchEvent) => void
}

export function useMatchStream({ competitionId, matchId, enabled = true, onMatch, onEvent }: MatchStreamOptions) {
  const token = useAuthStore((state) => state.token)
  const [connected, setConnected] = useState(false)
  const onMatchRef = useRef(onMatch)
  const onEventRef = useRef(onEvent)
  onMatchRef.current = onMatch
  onEventRef.current = onEvent

  useEffect(() => {
    if (!token || !enabled || !competitionId || !matchId) return

    const url = `${API_BASE_URL}${API_ROUTES.COMPETITIONS.MATCH_STREAM(matchId)}?token=${encodeURIComponent(token)}`
    const source = new EventSource(url)

    const handleMatch = (message: MessageEvent) => {
      try {
        const payload = JSON.parse(message.data)
        if (payload.match) onMatchRef.current?.(mapMatchFromBackend(payload.match))
      } catch {
        // Polling remains the source of recovery when a malformed message arrives.
      }
    }
    const handleEvent = (message: MessageEvent) => {
      try {
        const payload = JSON.parse(message.data)
        if (payload.event) onEventRef.current?.(mapMatchEventFromBackend(payload.event))
      } catch {
        // Ignore malformed individual events.
      }
    }

    source.addEventListener('snapshot', handleMatch)
    source.addEventListener('match_state', handleMatch)
    source.addEventListener('match_event', handleEvent)
    source.onopen = () => setConnected(true)
    source.onerror = () => {
      setConnected(false)
      source.close()
    }

    return () => {
      source.close()
      setConnected(false)
    }
  }, [token, enabled, competitionId, matchId])

  return { connected }
}
