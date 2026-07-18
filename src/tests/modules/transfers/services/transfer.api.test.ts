import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'

vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(),
  },
}))

vi.mock('@/constants/routes', () => ({
  API_ROUTES: {
    TRANSFERS: {
      LIST: '/clubs/transfers/',
    },
  },
}))

import apiClient from '@/lib/api-client'
import { transferApi } from '@/modules/transfers/services/transfer.api'
import type { Transfer, TransferListParams } from '@/modules/transfers/types'

const createResponse = <T>(data: T): AxiosResponse<T> =>
  ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }) as AxiosResponse<T>

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

const mockPendingTransfer: Transfer = {
  ...mockTransfer,
  id: 'trans-2',
  status: 'pending',
  status_label: 'Pendente',
  completed_date: null,
}

describe('transferApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('fetches and returns a list of transfers', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({
          success: true,
          message: '',
          data: { results: [mockTransfer, mockPendingTransfer], count: 2 },
        }),
      )

      const result = await transferApi.list()

      expect(result).toEqual([mockTransfer, mockPendingTransfer])
      expect(result).toHaveLength(2)
      expect(apiClient.get).toHaveBeenCalledWith('/clubs/transfers/', { params: undefined })
    })

    it('passes status filter to the API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({
          success: true,
          message: '',
          data: { results: [mockTransfer], count: 1 },
        }),
      )

      const params: TransferListParams = { status: 'approved' }
      const result = await transferApi.list(params)

      expect(result).toEqual([mockTransfer])
      expect(apiClient.get).toHaveBeenCalledWith('/clubs/transfers/', { params })
    })

    it('passes player_id filter to the API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({
          success: true,
          message: '',
          data: { results: [mockTransfer], count: 1 },
        }),
      )

      const params: TransferListParams = { player_id: 'player-uuid-1' }
      await transferApi.list(params)

      expect(apiClient.get).toHaveBeenCalledWith('/clubs/transfers/', { params })
    })

    it('returns an empty list when no transfers match', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({ success: true, message: '', data: { results: [], count: 0 } }),
      )

      const result = await transferApi.list({ status: 'rejected' })

      expect(result).toEqual([])
    })
  })
})
