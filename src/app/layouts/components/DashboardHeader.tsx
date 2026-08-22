import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu } from 'lucide-react'
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

        {/* Tenant / Workspace Active Indicator */}
        <div className="dashboard-soft hidden sm:flex items-center gap-sm rounded-full border px-md py-1.5" style={{ borderColor: 'var(--dashboard-border)' }}>
          <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
          <span className="dashboard-strong text-[11px] font-semibold uppercase tracking-wider">
            {tenantName ? `Inquilino: ${tenantName}` : t('dashboard.topbar.globalTenant')}
          </span>
        </div>

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
        <div className="flex items-center gap-md">
          <div className="text-right hidden xl:block">
            <p className="dashboard-strong text-xs font-semibold leading-none">
              {username || 'Utilizador Demo'}
            </p>
            <p className="dashboard-muted mt-1 text-[10px] font-bold uppercase">
              {role || 'Executivo'}
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            title="Ver Perfil"
            className="dashboard-avatar flex h-10 w-10 items-center justify-center rounded-full border-2 border-primary transition-all hover:scale-105 hover:border-primary cursor-pointer"
          >
            <span className="text-primary text-sm font-bold uppercase">
              {username?.charAt(0) || '?'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
