import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import {
  usePlayer,
  usePlayerMe,
  usePlayers,
  usePlayerSearch,
} from '@/modules/players/hooks/usePlayerQueries'
import { useRegisterPlayer } from '@/modules/players/hooks/usePlayerMutations'
import { mockPaginatedPlayers, mockPlayer, mockPlayerDetail } from '@/tests/__mocks__/player.mock'

vi.mock('@/modules/players/services', () => ({
  listPlayers: vi.fn(),
  getPlayer: vi.fn(),
  searchPlayers: vi.fn(),
  getPlayerMe: vi.fn(),
  registerPlayer: vi.fn(),
}))

import * as service from '@/modules/players/services'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('players hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches players list with params', async () => {
    vi.mocked(service.listPlayers).mockResolvedValueOnce(mockPaginatedPlayers)

    const { result } = renderHook(() => usePlayers({ page: 1, nationality: 'AO' }), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPaginatedPlayers)
    expect(service.listPlayers).toHaveBeenCalledWith({ page: 1, nationality: 'AO' })
  })

  it('does not fetch player detail without slug', () => {
    const { result } = renderHook(() => usePlayer(''), { wrapper: createWrapper() })

    expect(result.current.isFetching).toBe(false)
    expect(service.getPlayer).not.toHaveBeenCalled()
  })

  it('fetches player detail by slug', async () => {
    vi.mocked(service.getPlayer).mockResolvedValueOnce(mockPlayerDetail)

    const { result } = renderHook(() => usePlayer(mockPlayer.slug), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPlayerDetail)
    expect(service.getPlayer).toHaveBeenCalledWith(mockPlayer.slug)
  })

  it('searches players only when query is long enough', () => {
    renderHook(() => usePlayerSearch('a'), { wrapper: createWrapper() })

    expect(service.searchPlayers).not.toHaveBeenCalled()
  })

  it('fetches authenticated player profile', async () => {
    vi.mocked(service.getPlayerMe).mockResolvedValueOnce(mockPlayerDetail)

    const { result } = renderHook(() => usePlayerMe(), { wrapper: createWrapper() })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPlayerDetail)
    expect(service.getPlayerMe).toHaveBeenCalledTimes(1)
  })

  it('registers player and invalidates related queries', async () => {
    vi.mocked(service.registerPlayer).mockResolvedValueOnce({ id: 'reg-1' })

    const { result } = renderHook(() => useRegisterPlayer(mockPlayer.slug), {
      wrapper: createWrapper(),
    })

    result.current.mutate({
      club_id: 'club-1',
      joined_date: '2026-07-01',
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(service.registerPlayer).toHaveBeenCalledWith(mockPlayer.slug, {
      club_id: 'club-1',
      joined_date: '2026-07-01',
    })
  })
})
