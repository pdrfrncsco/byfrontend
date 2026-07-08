import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useClub, useClubKpis, useClubMe, useClubs } from '@/modules/clubs/hooks/useClubs'
import { mockClub, mockClubKpis, mockPaginatedClubs } from '@/tests/__mocks__/club.mock'

vi.mock('@/modules/clubs/services', () => ({
  listClubs: vi.fn(),
  getClub: vi.fn(),
  getClubKpis: vi.fn(),
  getClubMe: vi.fn(),
}))

vi.mock('@/app/providers', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

import * as service from '@/modules/clubs/services'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('clubs hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches clubs list with params', async () => {
    vi.mocked(service.listClubs).mockResolvedValueOnce(mockPaginatedClubs)

    const { result } = renderHook(
      () => useClubs({ search: 'bola', organization: 'fed' }),
      { wrapper: createWrapper() },
    )

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPaginatedClubs)
    expect(service.listClubs).toHaveBeenCalledWith({ search: 'bola', organization: 'fed' })
  })

  it('does not fetch club detail without slug', () => {
    const { result } = renderHook(() => useClub(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(service.getClub).not.toHaveBeenCalled()
  })

  it('fetches club KPI data', async () => {
    vi.mocked(service.getClubKpis).mockResolvedValueOnce(mockClubKpis)

    const { result } = renderHook(() => useClubKpis(mockClub.slug), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockClubKpis)
    expect(service.getClubKpis).toHaveBeenCalledWith(mockClub.slug)
  })

  it('fetches authenticated club profile', async () => {
    vi.mocked(service.getClubMe).mockResolvedValueOnce(mockClub)

    const { result } = renderHook(() => useClubMe(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockClub)
    expect(service.getClubMe).toHaveBeenCalledTimes(1)
  })
})
