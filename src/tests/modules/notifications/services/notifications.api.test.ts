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
    NOTIFICATIONS: {
      LIST: '/notifications/',
      UNREAD_COUNT: '/notifications/unread-count/',
      MARK_READ: (id: string) => `/notifications/${id}/mark-read/`,
    },
  },
}))

import apiClient from '@/lib/api-client'
import { notificationsApi } from '@/modules/notifications/services/notifications.api'
import type { Notification } from '@/modules/notifications/types'

const createResponse = <T>(data: T): AxiosResponse<T> =>
  ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }) as AxiosResponse<T>

const mockNotification: Notification = {
  id: 'notif-1',
  type: 'transfer_approved',
  payload: { player: 'João Silva', club: 'FC Bola' },
  status: 'sent',
  created_at: '2026-07-18T10:00:00Z',
  delivered_at: null,
}

const mockReadNotification: Notification = {
  ...mockNotification,
  id: 'notif-2',
  status: 'read',
  delivered_at: '2026-07-18T11:00:00Z',
}

describe('notificationsApi', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('list', () => {
    it('fetches and unwraps the notifications list', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({ success: true, message: '', data: [mockNotification, mockReadNotification] }),
      )

      const result = await notificationsApi.list()

      expect(result).toEqual([mockNotification, mockReadNotification])
      expect(result).toHaveLength(2)
      expect(apiClient.get).toHaveBeenCalledWith('/notifications/', { params: undefined })
    })

    it('passes filter params to the API', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({ success: true, message: '', data: [mockNotification] }),
      )

      await notificationsApi.list({ status: 'sent' })

      expect(apiClient.get).toHaveBeenCalledWith('/notifications/', {
        params: { status: 'sent' },
      })
    })

    it('returns empty array when no notifications exist', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({ success: true, message: '', data: [] }),
      )

      const result = await notificationsApi.list()

      expect(result).toEqual([])
    })
  })

  describe('unreadCount', () => {
    it('returns the unread notification count', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({ success: true, message: '', data: { unread: 5 } }),
      )

      const result = await notificationsApi.unreadCount()

      expect(result).toEqual({ unread: 5 })
      expect(apiClient.get).toHaveBeenCalledWith('/notifications/unread-count/')
    })

    it('returns zero when all notifications are read', async () => {
      vi.mocked(apiClient.get).mockResolvedValueOnce(
        createResponse({ success: true, message: '', data: { unread: 0 } }),
      )

      const result = await notificationsApi.unreadCount()

      expect(result.unread).toBe(0)
    })
  })

  describe('markRead', () => {
    it('marks a notification as read and returns ok', async () => {
      vi.mocked(apiClient.post).mockResolvedValueOnce(
        createResponse({ success: true, message: '', data: { ok: true } }),
      )

      const result = await notificationsApi.markRead('notif-1')

      expect(result).toEqual({ ok: true })
      expect(apiClient.post).toHaveBeenCalledWith('/notifications/notif-1/mark-read/')
    })
  })
})
