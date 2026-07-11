import React from 'react'
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
    <header className="sticky top-0 z-30 h-16 w-full flex justify-between items-center px-lg bg-[#0b1c30]/70 border-b border-[#26364a]/40 backdrop-blur-xl">
      <div className="flex items-center gap-lg">
        {/* Hamburger Button for mobile */}
        <button 
          onClick={onOpenMobileMenu}
          className="md:hidden p-sm text-on-surface-variant hover:text-[#d3e4fe] rounded-full hover:bg-[#1b2b3f]/30"
        >
          <Menu className="w-6 h-6" />
        </button>

        {/* Tenant / Workspace Active Indicator */}
        <div className="hidden sm:flex items-center gap-sm bg-[#26364a] px-md py-1.5 rounded-full border border-[#3f4945]">
          <span className="w-2 h-2 rounded-full bg-[#94d3c1] animate-pulse"></span>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d3e4fe]">
            {tenantName ? `Inquilino: ${tenantName}` : t('dashboard.topbar.globalTenant')}
          </span>
        </div>

        {/* Quick Breadcrumbs */}
        <div className="hidden md:flex gap-md text-sm">
          <a className="text-[#94d3c1] font-bold border-b-2 border-[#94d3c1] pb-1" href="#home">{t('dashboard.topbar.general')}</a>
          <a className="text-on-surface-variant hover:text-[#94d3c1] transition-colors" href="#analytics">{t('dashboard.topbar.analytics')}</a>
          <a className="text-on-surface-variant hover:text-[#94d3c1] transition-colors" href="#reports">{t('dashboard.topbar.reports')}</a>
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
          <Search className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
          <input 
            type="text"
            placeholder={t('dashboard.topbar.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#000f21] border border-[#3f4945] rounded-full pl-xl pr-md py-1.5 text-xs text-[#d3e4fe] focus:ring-1 focus:ring-[#94d3c1] focus:border-[#94d3c1] transition-all"
          />
        </div>

        <div className="h-8 w-px bg-[#26364a]"></div>

        {/* Profile Avatar / Menu */}
        <div className="flex items-center gap-md">
          <div className="text-right hidden xl:block">
            <p className="text-xs font-semibold text-on-surface leading-none">
              {username || 'Utilizador Demo'}
            </p>
            <p className="text-[10px] text-on-surface-variant uppercase mt-1 font-bold">
              {role || 'Executivo'}
            </p>
          </div>
          <button
            onClick={() => navigate('/profile')}
            title="Ver Perfil"
            className="w-10 h-10 rounded-full bg-[#1b2b3f] flex items-center justify-center border-2 border-[#94d3c1] hover:border-primary hover:scale-105 transition-all cursor-pointer"
          >
            <span className="text-sm font-bold text-[#94d3c1] uppercase">
              {username?.charAt(0) || '?'}
            </span>
          </button>
        </div>
      </div>
    </header>
  )
}
