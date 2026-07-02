import React from 'react'
import { Bell } from 'lucide-react'
import { useUnreadCount } from '../hooks/useNotifications'

export const NotificationBell: React.FC<{ onToggle: () => void }> = ({ onToggle }) => {
  const { data } = useUnreadCount()
  const unread = data?.unread ?? 0

  return (
    <button onClick={onToggle} className="relative p-2 rounded-full hover:bg-[#1b2b3f]/30">
      <Bell className="w-5 h-5" />
      {unread > 0 && (
        <span className="absolute -top-1 -right-1 bg-error text-white rounded-full text-xs px-1.5 py-0.5">{unread}</span>
      )}
    </button>
  )
}
