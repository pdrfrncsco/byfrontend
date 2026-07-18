import { beforeEach, afterEach, describe, expect, it, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useNotificationStream } from '@/modules/notifications/hooks/useNotificationStream'

// ── Mocks ────────────────────────────────────────────────────────────────────

vi.mock('@/app/stores/auth-store', () => ({
  useAuthStore: (selector: (s: { token: string | null }) => unknown) =>
    selector({ token: 'mock-jwt-token' }),
}))

vi.mock('@/constants/routes', () => ({
  API_ROUTES: {
    NOTIFICATIONS: {
      STREAM: '/notifications/stream/',
    },
  },
}))

// ── EventSource mock ─────────────────────────────────────────────────────────

/**
 * Minimal EventSource mock that records listeners and lets tests
 * dispatch custom events programmatically.
 * JSDOM does not ship EventSource, so we define it on globalThis before
 * each test and remove it after.
 */
class MockEventSource {
  static instance: MockEventSource | null = null

  url: string
  listeners: Record<string, ((e: MessageEvent) => void)[]> = {}
  onerror: (() => void) | null = null
  readyState = 1 // OPEN

  constructor(url: string) {
    this.url = url
    MockEventSource.instance = this
  }

  addEventListener(type: string, handler: (e: MessageEvent) => void) {
    if (!this.listeners[type]) this.listeners[type] = []
    this.listeners[type].push(handler)
  }

  /** Helper to fire a server event in tests */
  emit(type: string, data: unknown) {
    const event = { data: JSON.stringify(data) } as MessageEvent
    this.listeners[type]?.forEach(fn => fn(event))
  }

  close = vi.fn()
}

// ── Test setup ───────────────────────────────────────────────────────────────

const createWrapper = (queryClient: QueryClient) =>
  function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }

beforeEach(() => {
  MockEventSource.instance = null
  // JSDOM does not include EventSource — assign our mock to globalThis
  Object.defineProperty(globalThis, 'EventSource', {
    value: MockEventSource,
    writable: true,
    configurable: true,
  })
})

afterEach(() => {
  vi.clearAllMocks()
  // Clean up the global after each test
  // @ts-expect-error removing test-only global
  delete globalThis.EventSource
})

// ── Tests ────────────────────────────────────────────────────────────────────

describe('useNotificationStream', () => {
  it('creates an EventSource with the correct URL and JWT token', () => {
    const qc = new QueryClient()
    renderHook(() => useNotificationStream(), { wrapper: createWrapper(qc) })

    expect(MockEventSource.instance).not.toBeNull()
    expect(MockEventSource.instance!.url).toContain('/notifications/stream/')
    expect(MockEventSource.instance!.url).toContain('token=mock-jwt-token')
  })

  it('updates unread-count cache on "init" event', () => {
    const qc = new QueryClient()
    renderHook(() => useNotificationStream(), { wrapper: createWrapper(qc) })

    act(() => {
      MockEventSource.instance!.emit('init', { unread: 7 })
    })

    expect(qc.getQueryData(['notifications', 'unread-count'])).toEqual({ unread: 7 })
  })

  it('updates unread-count cache on "update" event', () => {
    const qc = new QueryClient()
    renderHook(() => useNotificationStream(), { wrapper: createWrapper(qc) })

    act(() => {
      MockEventSource.instance!.emit('update', { unread: 3 })
    })

    expect(qc.getQueryData(['notifications', 'unread-count'])).toEqual({ unread: 3 })
  })

  it('prepends new notification to list cache on "new_notification" event', () => {
    const qc = new QueryClient()
    qc.setQueryData(['notifications', 'list', undefined], [
      { id: 'n1', type: 'club_update', payload: {}, status: 'sent', created_at: '2026-01-01T00:00:00Z' },
    ])

    renderHook(() => useNotificationStream(), { wrapper: createWrapper(qc) })

    act(() => {
      MockEventSource.instance!.emit('new_notification', {
        id: 'n2',
        type: 'transfer_approved',
        payload: { player: 'Mateus Paulo' },
        status: 'pending',
        created_at: '2026-07-18T20:00:00Z',
      })
    })

    const list = qc.getQueryData<{ id: string }[]>(['notifications', 'list', undefined])
    expect(list).toHaveLength(2)
    expect(list![0].id).toBe('n2') // newest first
    expect(list![1].id).toBe('n1')
  })

  it('calls onNewNotification callback when a new notification arrives', () => {
    const qc = new QueryClient()
    const onNewNotification = vi.fn()

    renderHook(() => useNotificationStream({ onNewNotification }), {
      wrapper: createWrapper(qc),
    })

    act(() => {
      MockEventSource.instance!.emit('new_notification', {
        id: 'n3',
        type: 'competition_update',
        payload: {},
        status: 'pending',
        created_at: '2026-07-18T20:05:00Z',
      })
    })

    expect(onNewNotification).toHaveBeenCalledTimes(1)
    expect(onNewNotification).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'n3', type: 'competition_update' }),
    )
  })

  it('does not create EventSource when enabled=false', () => {
    const qc = new QueryClient()
    renderHook(() => useNotificationStream({ enabled: false }), { wrapper: createWrapper(qc) })

    expect(MockEventSource.instance).toBeNull()
  })

  it('closes the EventSource on unmount', () => {
    const qc = new QueryClient()
    const { unmount } = renderHook(() => useNotificationStream(), { wrapper: createWrapper(qc) })

    const es = MockEventSource.instance!
    unmount()

    expect(es.close).toHaveBeenCalledTimes(1)
  })
})
