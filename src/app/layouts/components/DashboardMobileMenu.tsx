import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'
import { getActiveSidebarHref, resolveNavContext } from './sidebar-utils'
import { SidebarEntityHeader } from './SidebarEntityHeader'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTenant } from '@/app/providers/TenantProvider'

interface SidebarLink {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
  disabled?: boolean
}

interface SidebarSection {
  title?: string
  links: SidebarLink[]
}

interface DashboardMobileMenuProps {
  isOpen: boolean
  onClose: () => void
  logo: string | null
  dashboardType: string
  sidebarLinks: SidebarLink[]
  sidebarSections?: SidebarSection[]
  subLabel: string
  onLogout: () => void
}

function renderIcon(icon: React.ReactNode) {
  if (React.isValidElement(icon)) {
    return icon
  }
  if (typeof icon === 'function' || (typeof icon === 'object' && icon !== null)) {
    const IconComponent = icon as unknown as React.ComponentType<{ className?: string }>
    return <IconComponent className="w-4 h-4" />
  }
  return null
}

export function DashboardMobileMenu({
  isOpen,
  onClose,
  logo,
  dashboardType,
  sidebarLinks,
  sidebarSections,
  subLabel,
  onLogout,
}: DashboardMobileMenuProps) {
  const { t } = useTranslation()
  const location = useLocation()
  const { user } = useAuth()
  const { tenant } = useTenant()
  const activeHref = getActiveSidebarHref(location, sidebarLinks)

  if (!isOpen) return null

  const navContext = resolveNavContext(location.pathname, tenant, user)

  return (
    <div className="dashboard-overlay fixed inset-0 z-50 flex justify-start backdrop-blur-sm md:hidden">
      <aside className="dashboard-sidebar-surface relative flex h-full w-64 flex-col border-r p-md animate-fade-in">
        <button 
          onClick={onClose}
          className="dashboard-muted absolute right-md top-md p-sm transition-colors hover:text-[var(--dashboard-strong)]"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Contextual Header */}
        <div className="mt-xl">
          <SidebarEntityHeader context={navContext} />
        </div>

        <nav className="flex-1 space-y-4 overflow-y-auto px-sm">
          {sidebarSections ? (
            sidebarSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-1">
                {section.title && (
                  <p className="dashboard-muted px-md text-[10px] font-bold uppercase tracking-[0.22em] opacity-80 mb-sm">
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
                        className="dashboard-muted flex w-full cursor-not-allowed items-center gap-md rounded-lg p-md text-left opacity-55 transition-all"
                      >
                        {renderIcon(link.icon)}
                        <span className="font-title-md text-sm">{link.label}</span>
                      </button>
                    ) : (
                      <Link
                        key={`${sectionIndex}-${idx}`}
                        to={link.href}
                        onClick={onClose}
                        aria-current={activeHref === link.href ? 'page' : undefined}
                        className={`flex items-center gap-md p-md rounded-lg transition-all ${
                          link.active || activeHref === link.href
                            ? 'dashboard-active text-primary font-bold border-r-4'
                            : 'dashboard-muted dashboard-soft-hover hover:text-[var(--dashboard-strong)]'
                        }`}
                      >
                        {renderIcon(link.icon)}
                        <span className="font-title-md text-sm">{link.label}</span>
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
                  className="dashboard-muted flex w-full cursor-not-allowed items-center gap-md rounded-lg p-md text-left opacity-55 transition-all"
                >
                  {renderIcon(link.icon)}
                  <span className="font-title-md text-sm">{link.label}</span>
                </button>
              ) : (
                <Link
                  key={idx}
                  to={link.href}
                  onClick={onClose}
                  aria-current={activeHref === link.href ? 'page' : undefined}
                  className={`flex items-center gap-md p-md rounded-lg transition-all ${
                    link.active || activeHref === link.href
                      ? 'dashboard-active text-primary font-bold border-r-4'
                      : 'dashboard-muted dashboard-soft-hover hover:text-[var(--dashboard-strong)]'
                  }`}
                >
                  {renderIcon(link.icon)}
                  <span className="font-title-md text-sm">{link.label}</span>
                </Link>
              )
            ))
          )}
        </nav>
        <div className="mt-auto space-y-1 border-t pt-lg" style={{ borderColor: 'var(--dashboard-border)' }}>
          <button
            onClick={onLogout}
            className="w-full flex items-center gap-md p-md rounded-lg text-error hover:bg-error-container/10 transition-all text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-title-md text-sm font-semibold">{t('dashboard.sidebar.logout')}</span>
          </button>
        </div>
      </aside>
      <div className="flex-1" onClick={onClose}></div>
    </div>
  )
}
