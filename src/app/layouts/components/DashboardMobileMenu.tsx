import React from 'react'
import { useTranslation } from 'react-i18next'
import { X, LogOut } from 'lucide-react'

interface SidebarLink {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
}

interface DashboardMobileMenuProps {
  isOpen: boolean
  onClose: () => void
  logo: string | null
  dashboardType: string
  sidebarLinks: SidebarLink[]
  subLabel: string
  onLogout: () => void
}

export function DashboardMobileMenu({
  isOpen,
  onClose,
  logo,
  dashboardType,
  sidebarLinks,
  subLabel,
  onLogout,
}: DashboardMobileMenuProps) {
  const { t } = useTranslation()

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-[#000f21]/80 backdrop-blur-sm z-50 md:hidden flex justify-start">
      <aside className="w-64 border-r border-[#26364a] bg-[#102034] flex flex-col p-md h-full relative animate-fade-in">
        <button 
          onClick={onClose}
          className="absolute top-md right-md p-sm text-on-surface-variant hover:text-[#d3e4fe]"
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
          <h1 className="font-display-lg text-xl text-[#94d3c1] uppercase tracking-tighter">BOLA YETU</h1>
          <p className="text-on-surface-variant text-[10px] font-semibold uppercase tracking-widest mt-1">
            {subLabel}
          </p>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto px-sm">
          {sidebarLinks.map((link, idx) => (
            <a
              key={idx}
              href={link.href}
              onClick={onClose}
              className={`flex items-center gap-md p-md rounded-lg transition-all ${
                link.active
                  ? 'bg-primary-container/20 text-[#94d3c1] font-bold border-r-4 border-[#94d3c1]'
                  : 'text-on-surface-variant hover:bg-[#1b2b3f] hover:text-[#d3e4fe]'
              }`}
            >
              {link.icon}
              <span className="font-title-md text-sm">{link.label}</span>
            </a>
          ))}
        </nav>
        <div className="pt-lg border-t border-[#26364a] mt-auto space-y-1">
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
