import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import {
  useUnreadCount,
  useNotificationsList,
  useMarkRead,
} from '@/modules/notifications/hooks/useNotifications'
import type { Notification } from '@/modules/notifications/types'

vi.mock('@/modules/notifications/services/notifications.api', () => ({
  notificationsApi: {
    list: vi.fn(),
    unreadCount: vi.fn(),
    markRead: vi.fn(),
  },
}))

import { notificationsApi } from '@/modules/notifications/services/notifications.api'

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

const mockNotification: Notification = {
  id: 'notif-1',
  type: 'transfer_approved',
  payload: { player: 'Mateus Paulo' },
  status: 'sent',
  created_at: '2026-07-18T10:00:00Z',
}

describe('notifications hooks', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useUnreadCount', () => {
    it('fetches unread count successfully', async () => {
      vi.mocked(notificationsApi.unreadCount).mockResolvedValueOnce({ unread: 3 })

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual({ unread: 3 })
      expect(notificationsApi.unreadCount).toHaveBeenCalledTimes(1)
    })

    it('enters error state when unread count API fails', async () => {
      vi.mocked(notificationsApi.unreadCount).mockRejectedValueOnce(new Error('Network Error'))

      const { result } = renderHook(() => useUnreadCount(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isError).toBe(true))
    })
  })

  describe('useNotificationsList', () => {
    it('fetches notifications list', async () => {
      vi.mocked(notificationsApi.list).mockResolvedValueOnce([mockNotification])

      const { result } = renderHook(() => useNotificationsList(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(result.current.data).toEqual([mockNotification])
      expect(result.current.data).toHaveLength(1)
    })

    it('passes params to the service', async () => {
      vi.mocked(notificationsApi.list).mockResolvedValueOnce([])

      const params = { status: 'sent' }
      const { result } = renderHook(() => useNotificationsList(params), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))

      expect(notificationsApi.list).toHaveBeenCalledWith(params)
    })
  })

  describe('useMarkRead', () => {
    it('calls markRead and invalidates queries on success', async () => {
      vi.mocked(notificationsApi.markRead).mockResolvedValueOnce({ ok: true })
      vi.mocked(notificationsApi.list).mockResolvedValue([mockNotification])
      vi.mocked(notificationsApi.unreadCount).mockResolvedValue({ unread: 0 })

      const { result } = renderHook(() => useMarkRead(), {
        wrapper: createWrapper(),
      })

      await act(async () => {
        await result.current.mutateAsync('notif-1')
      })

      expect(notificationsApi.markRead).toHaveBeenCalledWith('notif-1')
    })

    it('sets error state when markRead fails', async () => {
      vi.mocked(notificationsApi.markRead).mockRejectedValueOnce(new Error('Not Found'))

      const { result } = renderHook(() => useMarkRead(), {
        wrapper: createWrapper(),
      })

      act(() => {
        result.current.mutate('notif-999')
      })

      await waitFor(() => expect(result.current.isError).toBe(true))

      expect(result.current.error).toBeInstanceOf(Error)
    })
  })
})
