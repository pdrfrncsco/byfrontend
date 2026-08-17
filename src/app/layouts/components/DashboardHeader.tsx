import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Menu, Search } from 'lucide-react'
import { NotificationBell } from '@/modules/notifications/components/NotificationBell'
import { NotificationsDropdown } from '@/modules/notifications/components/NotificationsDropdown'

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

        {/* Quick Breadcrumbs */}
        <div className="hidden md:flex gap-md text-sm" aria-label={t('dashboard.topbar.general')}>
          <span className="text-primary font-bold border-b-2 border-primary pb-1">
            {t('dashboard.topbar.general')}
          </span>
          <span className="dashboard-muted">
            {t('dashboard.topbar.analytics')}
          </span>
          <span className="dashboard-muted">
            {t('dashboard.topbar.reports')}
          </span>
        </div>
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
        {/* Search Input */}
        <div className="relative hidden lg:block w-64">
          <Search className="dashboard-muted absolute left-md top-1/2 w-4 h-4 -translate-y-1/2" />
          <input 
            type="text"
            placeholder={t('dashboard.topbar.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="dashboard-search w-full rounded-full border pl-xl pr-md py-1.5 text-xs transition-all focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>

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
