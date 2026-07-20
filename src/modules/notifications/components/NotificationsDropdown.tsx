import React, { useState, useMemo } from 'react'
import { CheckCheck, Bell, Loader2 } from 'lucide-react'
import { useNotificationsList, useMarkRead } from '../hooks/useNotifications'

const PAGE_SIZE = 6

const STATUS_LABEL: Record<string, string> = {
  pending: 'Por ler',
  sent: 'Lida',
  failed: 'Falhou',
  read: 'Lida',
}

const TYPE_ICON: Record<string, string> = {
  transfer_approved: '✅',
  transfer_rejected: '❌',
  transfer_pending: '⏳',
  registration_approved: '✅',
  registration_rejected: '❌',
  competition_update: '🏆',
  club_update: '🏟️',
  player_update: '👤',
}

function formatRelativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60_000)
  if (mins < 1) return 'Agora'
  if (mins < 60) return `${mins}m atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  return `${days}d atrás`
}

export const NotificationsDropdown: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const [page, setPage] = useState(1)

  const { data: notifications, isLoading } = useNotificationsList({
    status: filter === 'unread' ? 'pending' : undefined,
  })
  const markRead = useMarkRead()

  const items = useMemo(() => notifications ?? [], [notifications])

  // client-side pagination
  const paged = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE
    return items.slice(start, start + PAGE_SIZE)
  }, [items, page])

  const hasMore = items.length > page * PAGE_SIZE
  const unreadCount = useMemo(() => items.filter(n => n.status === 'pending').length, [items])

  return (
    <div className="w-96 bg-surface-container rounded-xl border border-outline-variant shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-[#0d1b2a] border-b border-[#26364a]">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Notificações</span>
          {unreadCount > 0 && (
            <span className="text-[10px] bg-primary/20 text-primary px-1.5 py-0.5 rounded-full font-medium">
              {unreadCount} por ler
            </span>
          )}
        </div>
        {/* Stream indicator */}
        <div className="flex items-center gap-1.5">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
          <span className="text-[10px] text-emerald-400 font-medium">Em tempo real</span>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-1 px-3 py-2 bg-[#102034] border-b border-[#26364a]">
        {(['all', 'unread'] as const).map(f => (
          <button
            key={f}
            className={`text-xs px-3 py-1 rounded-full transition-colors duration-150 ${
              filter === f
                ? 'bg-primary text-white font-semibold'
                : 'text-on-surface-variant hover:bg-[#1b2b3f]'
            }`}
            onClick={() => {
              setFilter(f)
              setPage(1)
            }}
          >
            {f === 'all' ? 'Todas' : 'Por ler'}
          </button>
        ))}
      </div>

      {/* Notification list */}
      <div className="divide-y divide-[#26364a]/50 max-h-[340px] overflow-y-auto">
        {isLoading && (
          <div className="flex items-center justify-center py-8 gap-2 text-on-surface-variant">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-sm">A carregar…</span>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 gap-2 text-on-surface-variant">
            <Bell className="w-8 h-8 opacity-30" />
            <p className="text-sm">Sem notificações</p>
          </div>
        )}

        {paged.map(n => {
          const isUnread = n.status === 'pending'
          const icon = TYPE_ICON[n.type] ?? '🔔'

          return (
            <div
              key={n.id}
              className={`px-4 py-3 transition-colors hover:bg-[#1b2b3f]/40 ${
                isUnread ? 'bg-primary/5 border-l-2 border-primary' : ''
              }`}
            >
              <div className="flex items-start gap-3">
                <span className="text-lg mt-0.5 shrink-0">{icon}</span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <p className={`text-sm truncate ${isUnread ? 'font-semibold' : 'font-medium'}`}>
                      {n.type.replace(/_/g, ' ')}
                    </p>
                    <span className="text-[10px] text-on-surface-variant shrink-0">
                      {formatRelativeTime(n.created_at)}
                    </span>
                  </div>
                  <p className="text-xs text-on-surface-variant mt-0.5 line-clamp-2">
                    {typeof n.payload === 'string'
                      ? n.payload
                      : Object.entries(n.payload)
                          .map(([k, v]) => `${k}: ${v}`)
                          .join(' · ')}
                  </p>
                  <div className="flex items-center justify-between mt-2">
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                        isUnread
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'bg-emerald-400/10 text-emerald-400'
                      }`}
                    >
                      {STATUS_LABEL[n.status] ?? n.status}
                    </span>
                    {isUnread && (
                      <button
                        className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors"
                        onClick={() => markRead.mutate(n.id)}
                        disabled={markRead.isPending}
                        aria-label="Marcar como lida"
                      >
                        {markRead.isPending ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <CheckCheck className="w-3 h-3" />
                        )}
                        Lida
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Footer */}
      {items.length > 0 && (
        <div className="px-4 py-2 bg-[#0d1b2a] border-t border-[#26364a] flex items-center justify-between">
          <span className="text-[10px] text-on-surface-variant">{items.length} total</span>
          <div className="flex gap-2">
            {page > 1 && (
              <button
                className="text-xs text-on-surface-variant hover:text-on-surface transition-colors"
                onClick={() => setPage(p => p - 1)}
              >
                ← Anterior
              </button>
            )}
            {hasMore && (
              <button
                className="text-xs text-primary hover:text-primary/80 transition-colors"
                onClick={() => setPage(p => p + 1)}
              >
                Ver mais →
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
