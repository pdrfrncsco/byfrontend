import React, { useState, useMemo } from 'react'
import { useNotificationsList, useMarkRead } from '../hooks/useNotifications'
import type { Notification } from '../types'

const PAGE_SIZE = 6

export const NotificationsDropdown: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)

  // Pass params to hook; backend may ignore but client will paginate if needed
  const { data: notifications } = useNotificationsList({ status: filter === 'unread' ? 'pending' : undefined })
  const markRead = useMarkRead()

  const items: Notification[] = notifications ?? []

  // client-side pagination when backend doesn't paginate
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, page])

  const hasMore = items.length > page * PAGE_SIZE

  if (!items || items.length === 0) {
    return <div className="p-4 text-on-surface-variant">Sem notificações</div>
  }

  return (
    <div className="w-80 bg-surface-container rounded-lg border border-outline-variant">
      <div className="flex items-center justify-between p-3 bg-[#102034] border-b border-[#26364a]">
        <div className="flex gap-2">
          <button
            className={`text-sm px-2 py-1 rounded ${filter === 'all' ? 'bg-[#1b2b3f] font-semibold' : 'text-on-surface-variant'}`}
            onClick={() => { setFilter('all'); setPage(1) }}
          >Todas</button>
          <button
            className={`text-sm px-2 py-1 rounded ${filter === 'unread' ? 'bg-[#1b2b3f] font-semibold' : 'text-on-surface-variant'}`}
            onClick={() => { setFilter('unread'); setPage(1) }}
          >Por ler</button>
        </div>
        <div className="text-xs text-on-surface-variant">{items.length} total</div>
      </div>

      <div className="divide-y divide-[#26364a]/50 max-h-64 overflow-y-auto">
        {paged.map((n) => (
          <div key={n.id} className="p-3 border-b last:border-b-0">
            <div className="text-sm font-semibold">{n.type}</div>
            <div className="text-xs text-on-surface-variant mt-1">{typeof n.payload === 'string' ? n.payload : JSON.stringify(n.payload)}</div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-[10px] text-primary opacity-70">{new Date(n.created_at).toLocaleString()}</span>
              <div>
                {n.status !== 'sent' && (
                  <button
                    className="text-primary text-sm"
                    onClick={() => markRead.mutate(n.id)}
                  >Marcar como lido</button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="p-3 flex items-center justify-center">
        {hasMore ? (
          <button className="text-sm text-primary" onClick={() => setPage(p => p + 1)}>Ver mais</button>
        ) : (
          page > 1 && <button className="text-sm text-on-surface-variant" onClick={() => setPage(1)}>Recuar ao início</button>
        )}
      </div>
    </div>
  )
}
