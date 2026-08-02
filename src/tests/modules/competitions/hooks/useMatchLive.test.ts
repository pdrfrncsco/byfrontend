import { beforeEach, afterEach, describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'

// Mocks
vi.mock('@/modules/competitions/services/match.api', () => {
  return {
    matchApi: {
      get: vi.fn(),
      listEvents: vi.fn(),
    },
    // lightweight mapper used by the hook
    mapMatchEventFromBackend: (data: any) => ({
      id: data.id || `evt-${Math.random().toString(36).slice(2, 8)}`,
      matchId: data.match || data.match_id || data.matchId,
      minute: data.minute || 0,
      type: data.event_type || data.type || 'goal',
      teamId: data.club || data.teamId,
      description: data.notes || data.description || undefined,
      createdAt: data.created_at || new Date().toISOString(),
      updatedAt: data.updated_at || new Date().toISOString(),
    }),
  }
})

let notificationHandler: ((n: any) => void) | null = null
vi.mock('@/modules/notifications/hooks', () => ({
  useNotificationStream: (opts: any = {}) => {
    notificationHandler = opts.onNewNotification || null
  },
  __triggerNotification: (n: any) => notificationHandler?.(n),
}))

import { useMatchLive } from '@/modules/competitions/hooks/useMatchLive'

const createWrapper = (qc: QueryClient) => function Wrapper({ children }: { children: React.ReactNode }) {
  return React.createElement(QueryClientProvider, { client: qc }, children)
}

describe('useMatchLive', () => {
  beforeEach(() => {
    vi.resetAllMocks()
    notificationHandler = null
  })

  it('fetches match and events on mount', async () => {
    const { matchApi } = await import('@/modules/competitions/services/match.api')
    vi.mocked(matchApi.get).mockResolvedValueOnce({ id: 'm1', status: 'scheduled' })
    vi.mocked(matchApi.listEvents).mockResolvedValueOnce([])

    const qc = new QueryClient()

    const { result } = renderHook(() => useMatchLive({ competitionId: 'c1', matchId: 'm1' }), { wrapper: createWrapper(qc) })

    await waitFor(() => expect(result.current.match).not.toBeNull())
    expect(result.current.match?.id).toBe('m1')
    expect(result.current.events).toEqual([])
  })

  it('prepends event received via notifications', async () => {
    const { matchApi } = await import('@/modules/competitions/services/match.api')
    vi.mocked(matchApi.get).mockResolvedValueOnce({ id: 'm1', status: 'live' })
    vi.mocked(matchApi.listEvents).mockResolvedValueOnce([])

    const qc = new QueryClient()

    const { result } = renderHook(() => useMatchLive({ competitionId: 'c1', matchId: 'm1' }), { wrapper: createWrapper(qc) })

    await waitFor(() => expect(result.current.match).not.toBeNull())

    // Trigger a notification carrying an event payload
    const notif = {
      id: 'n1',
      type: 'match_event',
      payload: {
        matchId: 'm1',
        event: {
          id: 'e1',
          minute: 12,
          event_type: 'goal',
          club: 'team-a',
        },
      },
    }

    const notifModule = await import('@/modules/notifications/hooks')
    act(() => {
      // call internal trigger exported by our mock
      ;(notifModule as any).__triggerNotification(notif)
    })

    await waitFor(() => expect(result.current.events.some(e => e.id === 'e1')).toBeTruthy())
  })

  it('updates match score and status via notifications', async () => {
    const { matchApi } = await import('@/modules/competitions/services/match.api')
    vi.mocked(matchApi.get).mockResolvedValueOnce({ id: 'm1', status: 'scheduled', score: { home: 0, away: 0 } })
    vi.mocked(matchApi.listEvents).mockResolvedValueOnce([])

    const qc = new QueryClient()

    const { result } = renderHook(() => useMatchLive({ competitionId: 'c1', matchId: 'm1' }), { wrapper: createWrapper(qc) })

    await waitFor(() => expect(result.current.match).not.toBeNull())

    const notif = {
      id: 'n2',
      type: 'match_update',
      payload: {
        matchId: 'm1',
        home_score: 2,
        away_score: 1,
        status: 'finished',
      },
    }

    const notifModule = await import('@/modules/notifications/hooks')
    act(() => {
      ;(notifModule as any).__triggerNotification(notif)
    })

    await waitFor(() => expect(result.current.match?.score?.home).toBe(2))
    expect(result.current.match?.status).toBe('finished')

    const list = qc.getQueryData<any[]>(['matches', 'competition', 'c1'])
    expect(list?.[0]?.score?.home).toBe(2)
    expect(list?.[0]?.status).toBe('finished')
  })
})
