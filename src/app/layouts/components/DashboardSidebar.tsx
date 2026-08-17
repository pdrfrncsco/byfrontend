import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { LayoutDashboard, Settings, HelpCircle, LogOut } from 'lucide-react'
import { getActiveSidebarHref } from './sidebar-utils'

interface SidebarLink {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
  disabled?: boolean
  count?: number
}

interface SidebarSection {
  title?: string
  links: SidebarLink[]
}

interface DashboardSidebarProps {
  logo: string | null
  dashboardType: string
  sidebarLinks: SidebarLink[]
  sidebarSections?: SidebarSection[]
  subLabel: string
  onLogout: () => void
}

export function DashboardSidebar({
  logo,
  dashboardType,
  sidebarLinks,
  sidebarSections,
  subLabel,
  onLogout,
}: DashboardSidebarProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const activeHref = getActiveSidebarHref(location, sidebarLinks)

  return (
    <aside className="dashboard-sidebar-surface hidden h-screen w-64 sticky top-0 z-40 flex-col border-r p-md backdrop-blur-xl md:flex">
      <div className="mb-xl px-md flex flex-col items-center text-center">
        {logo ? (
          <img 
            alt="Logo" 
            className={`object-contain mb-md transition-all duration-300 ${dashboardType === 'federation' ? 'h-20 w-auto' : 'h-24 w-24'}`} 
            src={logo} 
          />
        ) : (
          <div className="dashboard-soft mb-md flex h-16 w-16 items-center justify-center rounded-full border" style={{ borderColor: 'var(--dashboard-border)' }}>
            <LayoutDashboard className="text-primary w-8 h-8" />
          </div>
        )}
        <div>
          <h1 className="font-display-lg text-primary text-2xl uppercase tracking-tighter leading-none">BOLA YETU</h1>
          <p className="dashboard-muted mt-1.5 text-[11px] font-semibold uppercase tracking-widest opacity-80">
            {subLabel}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-4 overflow-y-auto custom-scrollbar px-sm">
        {sidebarSections ? (
          sidebarSections.map((section, sectionIndex) => (
            <div key={sectionIndex} className="space-y-1">
              {section.title && (
                <p className="dashboard-muted px-md text-[10px] font-bold uppercase tracking-[0.22em] opacity-80">
                  {section.title}
                </p>
              )}
              <div className="space-y-1">
                {section.links.map((link, idx) => (
                  link.disabled ? (
                    <button
                      key={`${sectionIndex}-${idx}`}
                      type="button"
                      disabled
                      title={link.label}
                      className="dashboard-muted flex w-full cursor-not-allowed items-center gap-md rounded-lg p-md text-left opacity-55 transition-all duration-200"
                    >
                      {link.icon}
                      <span className="font-title-md text-sm">{link.label}</span>
                    </button>
                  ) : (
                    <Link
                      key={`${sectionIndex}-${idx}`}
                      to={link.href}
                      aria-current={activeHref === link.href ? 'page' : undefined}
                      className={`flex items-center gap-md p-md rounded-lg transition-all duration-200 ${
                        link.active || activeHref === link.href
                          ? 'dashboard-active text-primary font-bold border-r-4'
                          : 'dashboard-muted dashboard-soft-hover hover:text-[var(--dashboard-strong)]'
                      }`}
                    >
                      {link.icon}
                      <span className="font-title-md text-sm">{link.label}</span>
                      {link.count !== undefined && link.count > 0 && (
                        <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-[#031427]">
                          {link.count}
                        </span>
                      )}
                    </Link>
                  )
                ))}
              </div>
            </div>
          ))
        ) : (
          sidebarLinks.map((link, idx) => (
            link.disabled ? (
              <button
                key={idx}
                type="button"
                disabled
                title={link.label}
                className="dashboard-muted flex w-full cursor-not-allowed items-center gap-md rounded-lg p-md text-left opacity-55 transition-all duration-200"
              >
                {link.icon}
                <span className="font-title-md text-sm">{link.label}</span>
              </button>
            ) : (
              <Link
                key={idx}
                to={link.href}
                aria-current={activeHref === link.href ? 'page' : undefined}
                className={`flex items-center gap-md p-md rounded-lg transition-all duration-200 ${
                  link.active || activeHref === link.href
                    ? 'dashboard-active text-primary font-bold border-r-4'
                    : 'dashboard-muted dashboard-soft-hover hover:text-[var(--dashboard-strong)]'
                }`}
              >
                {link.icon}
                <span className="font-title-md text-sm">{link.label}</span>
                {link.count !== undefined && link.count > 0 && (
                  <span className="ml-auto rounded-full bg-secondary px-2 py-0.5 text-xs font-semibold text-[#031427]">
                    {link.count}
                  </span>
                )}
              </Link>
            )
          ))
        )}
      </nav>

      <div className="mt-auto space-y-1 border-t pt-lg" style={{ borderColor: 'var(--dashboard-border)' }}>
        <Link
          to="/settings"
          className="dashboard-muted dashboard-soft-hover flex items-center gap-md rounded-lg p-md transition-all hover:text-[var(--dashboard-strong)]"
        >
          <Settings className="w-5 h-5" />
          <span className="font-title-md text-sm">{t('dashboard.sidebar.settings')}</span>
        </Link>
        <button
          type="button"
          className="dashboard-muted dashboard-soft-hover w-full flex items-center gap-md rounded-lg p-md text-left transition-all hover:text-[var(--dashboard-strong)]"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-title-md text-sm">{t('dashboard.sidebar.support')}</span>
        </button>
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-md p-md rounded-lg text-error hover:bg-error-container/10 transition-all text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-title-md text-sm font-semibold">{t('dashboard.sidebar.logout')}</span>
        </button>
      </div>
    </aside>
  )
}
