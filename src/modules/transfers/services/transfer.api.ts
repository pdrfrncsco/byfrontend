import client from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse, PaginatedResponse } from '@/types/api'
import type { Transfer, TransferListParams } from '../types'

export const transferApi = {
  async list(params?: TransferListParams): Promise<Transfer[]> {
    const response = await client.get<ApiResponse<PaginatedResponse<Transfer>>>(
      API_ROUTES.TRANSFERS.LIST,
      { params },
    )
    return response.data.data.results
  },
}
