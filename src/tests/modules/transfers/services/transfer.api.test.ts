import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'

vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

vi.mock('@/constants/routes', () => ({
  API_ROUTES: {
    TRANSFERS: {
      LIST: '/clubs/transfers/',
      GET: (id: string) => `/clubs/transfers/${id}/`,
      CREATE: '/clubs/transfers/',
      APPROVE: (id: string) => `/clubs/transfers/${id}/approve/`,
      REJECT: (id: string) => `/clubs/transfers/${id}/reject/`,
      COMPLETE: (id: string) => `/clubs/transfers/${id}/complete/`,
      CANCEL: (id: string) => `/clubs/transfers/${id}/cancel/`,
      EXTEND_LOAN: (id: string) => `/clubs/transfers/${id}/extend_loan/`,
      RETURN_LOAN: (id: string) => `/clubs/transfers/${id}/return_loan/`,
      MAKE_PERMANENT: (id: string) => `/clubs/transfers/${id}/make_permanent/`,
      PENDING_APPROVALS: '/clubs/transfers/pending_approvals/',
      ACTIVE_LOANS: '/clubs/transfers/active_loans/',
      EXPIRING_LOANS: '/clubs/transfers/expiring_loans/',
    },
  },
}))

import apiClient from '@/lib/api-client'
import { transferApi, normalizeTransfer } from '@/modules/transfers/services/transfer.api'
import type { Transfer, TransferListFlat, TransferListParams } from '@/modules/transfers/types'

const createResponse = <T>(data: T): AxiosResponse<T> =>
  ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }) as AxiosResponse<T>

const mockNestedTransfer: Transfer = {
  id: 'trans-1',
  player: {
    id: 'player-uuid-1',
    full_name: 'Mateus Paulo',
    primary_position: 'FW',
  },
  from_club: { id: 'club-uuid-1', name: 'FC Origem', slug: 'fc-origem' },
  to_club: { id: 'club-uuid-2', name: 'FC Destino', slug: 'fc-destino' },
  transfer_type: 'permanent',
  transfer_type_display: 'Permanent Transfer',
  transfer_date: '2026-07-01',
  status: 'approved',
  status_display: 'Approved',
  fee: '15000.00',
}

const mockFlatListItem: TransferListFlat = {
  id: 'trans-2',
  player_name: 'João Silva',
  from_club_name: 'FC A',
  to_club_name: 'FC B',
  transfer_type: 'loan',
  transfer_type_display: 'Loan',
  transfer_date: '2026-06-01',
  status: 'pending',
  status_display: 'Awaiting Approval',
  loan_end_date: '2026-12-01',
  fee: null,
}

describe('normalizeTransfer', () => {
  it('keeps nested detail payloads', () => {
    expect(normalizeTransfer(mockNestedTransfer).player.full_name).toBe('Mateus Paulo')
  })

  it('normalises flat list payloads into nested shape', () => {
    const result = normalizeTransfer(mockFlatListItem)
    expect(result.player.full_name).toBe('João Silva')
    expect(result.from_club?.name).toBe('FC A')
    expect(result.to_club.name).toBe('FC B')
    expect(result.transfer_type).toBe('loan')
  })
})

describe('transferApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('fetches and returns a paginated list of transfers', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({
          count: 2,
          next: null,
          previous: null,
          results: [mockFlatListItem, mockNestedTransfer],
        }),
      )

      const result = await transferApi.list()

      expect(result.count).toBe(2)
      expect(result.results).toHaveLength(2)
      expect(result.results[0].player.full_name).toBe('João Silva')
      expect(result.results[1].player.full_name).toBe('Mateus Paulo')
      expect(apiClient.get).toHaveBeenCalledWith('/clubs/transfers/', { params: undefined })
    })

    it('passes status filter to the API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({ count: 1, next: null, previous: null, results: [mockNestedTransfer] }),
      )

      const params: TransferListParams = { status: 'approved' }
      const result = await transferApi.list(params)

      expect(result.results[0].status).toBe('approved')
      expect(apiClient.get).toHaveBeenCalledWith('/clubs/transfers/', { params })
    })

    it('returns an empty list when no transfers match', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({ count: 0, next: null, previous: null, results: [] }),
      )

      const result = await transferApi.list({ status: 'cancelled' })

      expect(result.results).toEqual([])
    })
  })

  describe('approve', () => {
    it('posts to the approve endpoint', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(mockNestedTransfer))

      const result = await transferApi.approve('trans-1')

      expect(result.status).toBe('approved')
      expect(apiClient.post).toHaveBeenCalledWith('/clubs/transfers/trans-1/approve/')
    })
  })

  describe('reject', () => {
    it('posts rejection reason', async () => {
      const rejected = { ...mockNestedTransfer, status: 'cancelled' as const }
      vi.mocked(apiClient.post).mockResolvedValueOnce(createResponse(rejected))

      await transferApi.reject('trans-1', 'Sem acordo')

      expect(apiClient.post).toHaveBeenCalledWith('/clubs/transfers/trans-1/reject/', {
        reason: 'Sem acordo',
      })
    })
  })

  describe('complete', () => {
    it('unwraps nested transfer from complete response', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce(
        createResponse({
          transfer: { ...mockNestedTransfer, status: 'completed' },
          registration: { id: 'reg-1' },
        }),
      )

      const result = await transferApi.complete('trans-1')

      expect(result.status).toBe('completed')
      expect(apiClient.post).toHaveBeenCalledWith('/clubs/transfers/trans-1/complete/')
    })
  })
})
