import client from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type { Notification } from '../types'

export const notificationsApi = {
  async list(params?: any): Promise<Notification[]> {
    const response = await client.get<ApiResponse<Notification[]>>(API_ROUTES.NOTIFICATIONS_API?.LIST || '/notifications/', { params })
    return response.data.data
  },

  async unreadCount(): Promise<{ unread: number }> {
    const response = await client.get<ApiResponse<{ unread: number }>>('/notifications/unread-count/')
    return response.data.data
  },

  async markRead(id: string): Promise<{ ok: boolean }> {
    const response = await client.post<ApiResponse<{ ok: boolean }>>(`/notifications/${id}/mark-read/`)
    return response.data.data
  },
}
