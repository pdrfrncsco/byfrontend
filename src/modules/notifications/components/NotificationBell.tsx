import React, { useState, useCallback } from 'react'
import { Bell } from 'lucide-react'
import { useUnreadCount } from '../hooks/useNotifications'
import { useNotificationStream } from '../hooks/useNotificationStream'
import type { Notification } from '../types'

interface NotificationBellProps {
  onToggle: () => void
}

/**
 * Bell icon with live unread badge.
 * Connects to the backend SSE stream for real-time updates.
 * Falls back gracefully to the last polled value if the stream is unavailable.
 */
export const NotificationBell: React.FC<NotificationBellProps> = ({ onToggle }) => {
  const { data } = useUnreadCount()
  const [hasNewBurst, setHasNewBurst] = useState(false)

  const handleNewNotification = useCallback((_: Notification) => {
    setHasNewBurst(true)
    setTimeout(() => setHasNewBurst(false), 2000)
  }, [])

  // Connect to SSE stream — updates the React Query cache automatically
  useNotificationStream({ onNewNotification: handleNewNotification })

  const unread = data?.unread ?? 0

  return (
    <button
      onClick={onToggle}
      aria-label={`Notificações${unread > 0 ? ` — ${unread} por ler` : ''}`}
      className={`relative p-2 rounded-full transition-colors duration-200 hover:bg-[#1b2b3f]/30 ${
        hasNewBurst ? 'animate-pulse' : ''
      }`}
    >
      <Bell
        className={`w-5 h-5 transition-transform duration-200 ${hasNewBurst ? 'scale-110' : ''}`}
      />
      {unread > 0 && (
        <span
          className={`absolute -top-1 -right-1 bg-error text-white rounded-full text-xs min-w-[18px] h-[18px] flex items-center justify-center px-1 transition-transform duration-200 ${
            hasNewBurst ? 'scale-125' : 'scale-100'
          }`}
        >
          {unread > 99 ? '99+' : unread}
        </span>
      )}
    </button>
  )
}
