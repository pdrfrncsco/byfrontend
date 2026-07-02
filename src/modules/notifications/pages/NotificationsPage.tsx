import React from 'react'
import { useNotificationsList, useMarkRead } from '../hooks/useNotifications'

export const NotificationsPage: React.FC = () => {
  const { data: notifications } = useNotificationsList()
  const markRead = useMarkRead()

  return (
    <div className="max-w-4xl mx-auto p-lg">
      <h1 className="text-headline-md mb-md">Notificações</h1>
      <div className="bg-surface-container rounded-lg border border-outline-variant">
        {(notifications || []).map((n) => (
          <div key={n.id} className="p-4 border-b last:border-b-0 flex justify-between items-center">
            <div>
              <div className="font-semibold">{n.type}</div>
              <div className="text-sm text-on-surface-variant">{JSON.stringify(n.payload)}</div>
            </div>
            <div>
              {n.status !== 'read' && (
                <button className="text-primary" onClick={() => markRead.mutate(n.id)}>Marcar como lido</button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
