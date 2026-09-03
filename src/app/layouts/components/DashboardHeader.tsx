import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, Globe } from 'lucide-react'
import { NotificationBell } from '@/modules/notifications/components/NotificationBell'
import { NotificationsDropdown } from '@/modules/notifications/components/NotificationsDropdown'
import { DashboardBreadcrumb } from './DashboardBreadcrumb'
import { GlobalSearch } from './GlobalSearch'

interface DashboardHeaderProps {
  tenantName?: string
  username?: string
  role?: string
  notificationsOpen: boolean
  toggleNotifications: () => void
  searchQuery: string
  setSearchQuery: (v: string) => void
  onOpenMobileMenu: () => void
}

export function DashboardHeader({
  tenantName,
  username,
  role,
  notificationsOpen,
  toggleNotifications,
  searchQuery,
  setSearchQuery,
  onOpenMobileMenu,
}: DashboardHeaderProps) {
  const { t } = useTranslation()
  const navigate = useNavigate()

  return (
    <header className="dashboard-surface sticky top-0 z-30 h-16 w-full flex justify-between items-center px-lg border-b backdrop-blur-xl">
      <div className="flex items-center gap-lg">
        {/* Hamburger Button for mobile */}
        <button
          onClick={onOpenMobileMenu}
          className="dashboard-muted dashboard-soft-hover md:hidden rounded-full p-sm transition-colors hover:text-[var(--dashboard-strong)]"
        >
          <Menu className="w-6 h-6" />
        </button>


        {/* Dynamic Breadcrumbs */}
        <DashboardBreadcrumb />
      </div>

      <div className="flex items-center gap-lg">
        {/* Notifications Bell */}
        <div className="relative">
          <NotificationBell onToggle={toggleNotifications} />
          {notificationsOpen && (
            <div className="absolute right-0 mt-2 z-50">
              <NotificationsDropdown />
            </div>
          )}
        </div>

        {/* Unified Global Search */}
        <GlobalSearch value={searchQuery} onChange={setSearchQuery} />

        <div className="h-8 w-px" style={{ backgroundColor: 'var(--dashboard-border)' }}></div>

        {/* Profile Avatar / Menu */}
        <button
          onClick={() => navigate('/profile')}
          title="Ver Perfil"
          className="flex items-center gap-3 pl-1 pr-3 py-1 rounded-full border transition-all hover:bg-surface-1"
          style={{ borderColor: 'var(--dashboard-border)' }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-white text-xs font-bold uppercase">
            {username?.charAt(0) || '?'}
          </div>
          <div className="text-left hidden xl:block">
            <p className="text-xs font-semibold leading-none text-on-surface">
              {username || 'Utilizador Demo'}
            </p>
            <p className="mt-0.5 text-[10px] font-medium text-on-surface-variant">
              {role || 'Executivo'}
            </p>
          </div>
        </button>
      </div>
    </header>
  )
}
