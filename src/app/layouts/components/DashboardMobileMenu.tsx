import React from 'react'
import { useTranslation } from 'react-i18next'
import { Link, useLocation } from 'react-router-dom'
import { X, LogOut } from 'lucide-react'
import { getActiveSidebarHref } from './sidebar-utils'

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
  const activeHref = getActiveSidebarHref(location, sidebarLinks)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[var(--profile-surface-muted)]/80 backdrop-blur-sm z-50 md:hidden flex justify-start">
      <aside className="w-64 border-r border-[var(--bg-card-border)] bg-[var(--bg-card)] flex flex-col p-md h-full relative animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-md right-md p-sm text-on-surface-variant hover:text-[var(--text-main)]"
        >
          <X className="w-6 h-6" />
        </button>
        <div className="mb-xl mt-lg px-md text-center">
          {logo && (
            <img 
              alt="Logo" 
              className={`mx-auto mb-md object-contain ${dashboardType === 'federation' ? 'h-16' : 'h-20'}`} 
              src={logo} 
            />
          )}
          <h1 className="font-display-lg text-xl text-primary uppercase tracking-tighter">BOLA YETU</h1>
          <p className="text-on-surface-variant text-[10px] font-semibold uppercase tracking-widest mt-1">
            {subLabel}
          </p>
        </div>
        <nav className="flex-1 space-y-4 overflow-y-auto px-sm">
          {sidebarSections ? (
            sidebarSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-1">
                {section.title && (
                  <p className="px-md text-[10px] font-bold uppercase tracking-[0.22em] text-on-surface-variant/80">
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
                        className="flex w-full items-center gap-md rounded-lg p-md text-left text-on-surface-variant opacity-55 transition-all cursor-not-allowed"
                      >
                        {link.icon}
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
                            ? 'bg-primary-container/20 text-primary font-bold border-r-4 border-primary'
                            : 'text-on-surface-variant hover:bg-primary/10 hover:text-[var(--text-main)]'
                        }`}
                      >
                        {link.icon}
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
                  className="flex w-full items-center gap-md rounded-lg p-md text-left text-on-surface-variant opacity-55 transition-all cursor-not-allowed"
                >
                  {link.icon}
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
                      ? 'bg-primary-container/20 text-primary font-bold border-r-4 border-primary'
                      : 'text-on-surface-variant hover:bg-primary/10 hover:text-[var(--text-main)]'
                  }`}
                >
                  {link.icon}
                  <span className="font-title-md text-sm">{link.label}</span>
                </Link>
              )
            ))
          )}
        </nav>
        <div className="pt-lg border-t border-[var(--bg-card-border)] mt-auto space-y-1">
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
