import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useTransfers, transferKeys } from '@/modules/transfers/hooks/useTransfers'
import type { Transfer, TransferListParams } from '@/modules/transfers/types'

vi.mock('@/modules/transfers/services', () => ({
  transferApi: {
    list: vi.fn(),
  },
}))

vi.mock('@/app/providers', () => ({
  useAuth: () => ({ isAuthenticated: true }),
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
  player: 'player-uuid-1',
  player_name: 'Mateus Paulo',
  player_slug: 'mateus-paulo',
  from_club: 'club-uuid-1',
  from_club_name: 'FC Origem',
  to_club: 'club-uuid-2',
  to_club_name: 'FC Destino',
  competition: null,
  joined_date: '2026-07-01',
  shirt_number: 10,
  fee: '15000.00',
  status: 'approved',
  status_label: 'Aprovado',
  request_date: '2026-06-28',
  completed_date: '2026-07-01',
  rejection_reason: null,
}

describe('useTransfers', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fetches and returns transfer list when authenticated', async () => {
    vi.mocked(transferApi.list).mockResolvedValueOnce([mockTransfer])

    const { result } = renderHook(() => useTransfers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([mockTransfer])
    expect(transferApi.list).toHaveBeenCalledTimes(1)
  })

  it('passes filter params to the service', async () => {
    vi.mocked(transferApi.list).mockResolvedValueOnce([mockTransfer])

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

  it('returns empty array when no transfers exist', async () => {
    vi.mocked(transferApi.list).mockResolvedValueOnce([])

    const { result } = renderHook(() => useTransfers(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
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
