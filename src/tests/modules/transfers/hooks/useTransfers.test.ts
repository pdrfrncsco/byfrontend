import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useTransfers, transferKeys } from '@/modules/transfers/hooks/useTransfers'
import type { Transfer, TransferListParams, PaginatedTransfers } from '@/modules/transfers/types'

vi.mock('@/modules/transfers/services', () => ({
  transferApi: {
    list: vi.fn(),
  },
}))

vi.mock('@/app/providers', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

vi.mock('sonner', () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}))

import { transferApi } from '@/modules/transfers/services'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

const mockTransfer: Transfer = {
  id: 'trans-1',
  player: {
    id: 'player-uuid-1',
    full_name: 'Mateus Paulo',
    primary_position: 'FW',
  },
  from_club: { id: 'club-uuid-1', name: 'FC Origem', slug: 'fc-origem' },
  to_club: { id: 'club-uuid-2', name: 'FC Destino', slug: 'fc-destino' },
  transfer_type: 'permanent',
  transfer_date: '2026-07-01',
  status: 'approved',
  fee: '15000.00',
}

const mockPage: PaginatedTransfers = {
  count: 1,
  next: null,
  previous: null,
  results: [mockTransfer],
}

describe('useTransfers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and returns transfer list when authenticated', async () => {
    vi.mocked(transferApi.list).mockResolvedValueOnce(mockPage)

    const { result } = renderHook(() => useTransfers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockPage)
    expect(transferApi.list).toHaveBeenCalledTimes(1)
  })

  it('passes filter params to the service', async () => {
    vi.mocked(transferApi.list).mockResolvedValueOnce(mockPage)

    const params: TransferListParams = { status: 'approved' }
    const { result } = renderHook(() => useTransfers(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(transferApi.list).toHaveBeenCalledWith(params)
  })

  it('enters error state when API call fails', async () => {
    vi.mocked(transferApi.list).mockRejectedValueOnce(new Error('Unauthorized'))

    const { result } = renderHook(() => useTransfers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))
  })

  it('returns empty results when no transfers exist', async () => {
    vi.mocked(transferApi.list).mockResolvedValueOnce({
      count: 0,
      next: null,
      previous: null,
      results: [],
    })

    const { result } = renderHook(() => useTransfers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data?.results).toEqual([])
  })
})

describe('transferKeys', () => {
  it('generates correct base key', () => {
    expect(transferKeys.all).toEqual(['transfers'])
  })

  it('generates correct list key without params', () => {
    expect(transferKeys.list()).toEqual(['transfers', 'list', undefined])
  })

  it('generates correct list key with params', () => {
    const params: TransferListParams = { status: 'pending', page: 2 }
    expect(transferKeys.list(params)).toEqual(['transfers', 'list', params])
  })
})
