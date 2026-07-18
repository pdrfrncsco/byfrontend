import client from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type { Notification } from '../types'

export const notificationsApi = {
  async list(params?: Record<string, unknown>): Promise<Notification[]> {
    const response = await client.get<ApiResponse<{ results: Notification[]; count: number }>>(
      API_ROUTES.NOTIFICATIONS.LIST,
      { params },
    )
    // Backend uses StandardPagination → data is {results: [...], count: N}
    const data = response.data.data
    return Array.isArray(data) ? data : (data?.results ?? [])
  },

  async unreadCount(): Promise<{ unread: number }> {
    const response = await client.get<ApiResponse<{ unread: number }>>(API_ROUTES.NOTIFICATIONS.UNREAD_COUNT)
    return response.data.data
  },

  async markRead(id: string): Promise<{ ok: boolean }> {
    const response = await client.post<ApiResponse<{ ok: boolean }>>(API_ROUTES.NOTIFICATIONS.MARK_READ(id))
    return response.data.data
  },
}
