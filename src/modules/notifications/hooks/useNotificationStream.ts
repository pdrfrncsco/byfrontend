import { useEffect, useRef, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { useAuthStore } from '@/app/stores/auth-store'
import { API_ROUTES } from '@/constants/routes'
import type { Notification } from '../types'

/** How long to wait before attempting a reconnect (ms). Doubles on each failure. */
const BASE_RECONNECT_DELAY = 3_000
const MAX_RECONNECT_DELAY = 60_000

/**
 * The full API base URL — same default as the Axios client so the
 * EventSource always connects to the backend, not the Vite dev server.
 */
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1'

/**
 * Builds the full SSE stream URL, appending the JWT access token
 * as a query param (EventSource doesn't support custom headers).
 */
function buildStreamUrl(token: string): string {
  return `${API_BASE_URL}${API_ROUTES.NOTIFICATIONS.STREAM}?token=${encodeURIComponent(token)}`
}

export interface UseNotificationStreamOptions {
  /** Called whenever a `new_notification` event arrives. */
  onNewNotification?: (notification: Notification) => void
  /** Whether the stream should be active. Defaults to true when authenticated. */
  enabled?: boolean
}

/**
 * Connects to the backend SSE endpoint and keeps the React Query notification
 * cache up to date in real time.
 *
 * Handles:
 * - Automatic reconnection with exponential back-off
 * - `init` / `update` events → updates `['notifications', 'unread-count']` cache
 * - `new_notification` events → prepends to `['notifications', 'list']` cache
 * - `ping` events → no-op (keeps connection alive)
 * - `error` events → closes the stream cleanly
 * - Disconnects when the component unmounts or the user logs out
 */
export function useNotificationStream(options: UseNotificationStreamOptions = {}) {
  const { onNewNotification, enabled = true } = options

  const token = useAuthStore(state => state.token)
  const queryClient = useQueryClient()

  const esRef = useRef<EventSource | null>(null)
  const reconnectDelayRef = useRef(BASE_RECONNECT_DELAY)
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const isActiveRef = useRef(false)

  const handleUnreadUpdate = useCallback(
    (unread: number) => {
      queryClient.setQueryData<{ unread: number }>(['notifications', 'unread-count'], { unread })
    },
    [queryClient],
  )

  const handleNewNotification = useCallback(
    (notif: Notification) => {
      // Prepend to the list cache (if loaded)
      queryClient.setQueryData<Notification[]>(['notifications', 'list', undefined], old =>
        old ? [notif, ...old] : [notif],
      )
      onNewNotification?.(notif)
    },
    [queryClient, onNewNotification],
  )

  const connect = useCallback(() => {
    if (!token || !enabled || !isActiveRef.current) return

    const url = buildStreamUrl(token)
    const es = new EventSource(url)
    esRef.current = es

    es.addEventListener('init', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as { unread: number }
        handleUnreadUpdate(data.unread)
        reconnectDelayRef.current = BASE_RECONNECT_DELAY // reset back-off on successful connect
      } catch {
        console.warn('[SSE] Failed to parse init event')
      }
    })

    es.addEventListener('update', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as { unread: number }
        handleUnreadUpdate(data.unread)
      } catch {
        console.warn('[SSE] Failed to parse update event')
      }
    })

    es.addEventListener('new_notification', (e: MessageEvent) => {
      try {
        const notif = JSON.parse(e.data) as Notification
        handleNewNotification(notif)
      } catch {
        console.warn('[SSE] Failed to parse new_notification event')
      }
    })

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    es.addEventListener('ping', (_e: MessageEvent) => {
      // Heartbeat — connection is alive, no action needed
    })

    es.addEventListener('error', (e: MessageEvent) => {
      try {
        const data = JSON.parse(e.data) as { detail?: string }
        console.warn('[SSE] Stream error from server:', data.detail)
      } catch {
        // not a structured error event — ignore
      }
      es.close()
    })

    es.onerror = () => {
      es.close()
      esRef.current = null

      if (!isActiveRef.current) return

      // Exponential back-off reconnect
      const delay = reconnectDelayRef.current
      reconnectDelayRef.current = Math.min(delay * 2, MAX_RECONNECT_DELAY)
      console.info(`[SSE] Reconnecting in ${delay / 1000}s…`)
      reconnectTimerRef.current = setTimeout(connect, delay)
    }
  }, [token, enabled, handleUnreadUpdate, handleNewNotification])

  useEffect(() => {
    if (!token || !enabled) return

    isActiveRef.current = true
    connect()

    return () => {
      isActiveRef.current = false

      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current)
        reconnectTimerRef.current = null
      }

      esRef.current?.close()
      esRef.current = null
    }
  }, [token, enabled, connect])
}
