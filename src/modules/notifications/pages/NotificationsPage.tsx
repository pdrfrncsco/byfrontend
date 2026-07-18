import React, { useState } from 'react'
import { Bell, CheckCheck, Loader2, RefreshCw } from 'lucide-react'
import { useNotificationsList, useMarkRead } from '../hooks/useNotifications'
import { useNotificationStream } from '../hooks/useNotificationStream'
import type { Notification } from '../types'

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
  if (mins < 60) return `${mins} min atrás`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h atrás`
  const days = Math.floor(hrs / 24)
  return `${days} dias atrás`
}

export const NotificationsPage: React.FC = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all')
  const { data: notifications, isLoading, refetch, isRefetching } = useNotificationsList({
    status: filter === 'unread' ? 'pending' : undefined,
  })
  const markRead = useMarkRead()

  // SSE stream — keeps unread count and list cache live on this page too
  useNotificationStream()

  const items: Notification[] = notifications ?? []
  const unreadCount = items.filter(n => n.status === 'pending').length

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Page header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Notificações
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            Actualizações em tempo real sobre a sua actividade na plataforma
          </p>
        </div>
        <div className="flex items-center gap-3">
          {/* Live indicator */}
          <div className="flex items-center gap-1.5 text-xs text-emerald-400">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
            </span>
            Em tempo real
          </div>
          <button
            onClick={() => refetch()}
            disabled={isRefetching}
            className="flex items-center gap-1.5 text-sm text-on-surface-variant hover:text-on-surface transition-colors px-3 py-1.5 rounded-lg hover:bg-surface-container-high border border-outline-variant"
            aria-label="Actualizar notificações"
          >
            <RefreshCw className={`w-4 h-4 ${isRefetching ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
      </div>

      {/* Filter + stats bar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex gap-1 bg-surface-container p-1 rounded-lg">
          {(['all', 'unread'] as const).map(f => (
            <button
              key={f}
              className={`text-sm px-4 py-1.5 rounded-md transition-all duration-150 ${
                filter === f
                  ? 'bg-primary text-white font-semibold shadow-sm'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              onClick={() => setFilter(f)}
            >
              {f === 'all' ? 'Todas' : 'Por ler'}
              {f === 'unread' && unreadCount > 0 && (
                <span className="ml-1.5 text-[10px] bg-white/20 rounded-full px-1.5 py-0.5">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        <span className="text-xs text-on-surface-variant">{items.length} notificações</span>
      </div>

      {/* List */}
      <div className="bg-surface-container rounded-xl border border-outline-variant overflow-hidden">
        {isLoading && (
          <div className="flex items-center justify-center py-16 gap-2 text-on-surface-variant">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>A carregar…</span>
          </div>
        )}

        {!isLoading && items.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-on-surface-variant">
            <Bell className="w-12 h-12 opacity-20" />
            <p className="text-lg font-medium">Sem notificações</p>
            <p className="text-sm opacity-70">
              {filter === 'unread'
                ? 'Todas as notificações foram lidas.'
                : 'Ainda não há notificações para si.'}
            </p>
          </div>
        )}

        {items.map((n, idx) => {
          const isUnread = n.status === 'pending'
          const icon = TYPE_ICON[n.type] ?? '🔔'

          return (
            <div
              key={n.id}
              className={`flex items-start gap-4 px-5 py-4 transition-colors hover:bg-[#1b2b3f]/20 ${
                idx < items.length - 1 ? 'border-b border-[#26364a]/50' : ''
              } ${isUnread ? 'bg-primary/5 border-l-4 border-primary' : 'border-l-4 border-transparent'}`}
            >
              <span className="text-2xl mt-0.5 shrink-0">{icon}</span>
              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className={`${isUnread ? 'font-semibold' : 'font-medium'} capitalize`}>
                      {n.type.replace(/_/g, ' ')}
                    </p>
                    <p className="text-sm text-on-surface-variant mt-1">
                      {typeof n.payload === 'string'
                        ? n.payload
                        : Object.entries(n.payload)
                            .map(([k, v]) => `${k.replace(/_/g, ' ')}: ${v}`)
                            .join(' · ')}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-xs text-on-surface-variant">{formatRelativeTime(n.created_at)}</p>
                    <span
                      className={`mt-1 inline-block text-[10px] px-2 py-0.5 rounded-full ${
                        isUnread
                          ? 'bg-amber-400/10 text-amber-400'
                          : 'bg-emerald-400/10 text-emerald-400'
                      }`}
                    >
                      {isUnread ? 'Por ler' : 'Lida'}
                    </span>
                  </div>
                </div>
                {isUnread && (
                  <button
                    className="mt-2 flex items-center gap-1.5 text-xs text-primary hover:text-primary/80 transition-colors"
                    onClick={() => markRead.mutate(n.id)}
                    disabled={markRead.isPending}
                  >
                    {markRead.isPending ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <CheckCheck className="w-3 h-3" />
                    )}
                    Marcar como lida
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
