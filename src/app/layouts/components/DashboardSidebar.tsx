import React from 'react'
import { useTranslation } from 'react-i18next'
import { LayoutDashboard, Settings, HelpCircle, LogOut } from 'lucide-react'

interface SidebarLink {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
}

interface DashboardSidebarProps {
  logo: string | null
  dashboardType: string
  sidebarLinks: SidebarLink[]
  subLabel: string
  onLogout: () => void
}

export function DashboardSidebar({
  logo,
  dashboardType,
  sidebarLinks,
  subLabel,
  onLogout,
}: DashboardSidebarProps) {
  const { t } = useTranslation()

  return (
    <aside className="w-64 border-r border-[#26364a] bg-[#102034]/85 backdrop-blur-xl flex flex-col p-md hidden md:flex sticky top-0 h-screen z-40">
      <div className="mb-xl px-md flex flex-col items-center text-center">
        {logo ? (
          <img 
            alt="Logo" 
            className={`object-contain mb-md transition-all duration-300 ${dashboardType === 'federation' ? 'h-20 w-auto' : 'h-24 w-24'}`} 
            src={logo} 
          />
        ) : (
          <div className="w-16 h-16 rounded-full bg-[#1b2b3f] flex items-center justify-center mb-md border border-[#26364a]">
            <LayoutDashboard className="text-primary w-8 h-8" />
          </div>
        )}
        <div>
          <h1 className="font-display-lg text-2xl text-[#94d3c1] uppercase tracking-tighter leading-none">BOLA YETU</h1>
          <p className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest mt-1.5 opacity-70">
            {subLabel}
          </p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto custom-scrollbar px-sm">
        {sidebarLinks.map((link, idx) => (
          <a
            key={idx}
            href={link.href}
            className={`flex items-center gap-md p-md rounded-lg transition-all duration-200 ${
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

      <div className="pt-lg border-t border-[#26364a]/50 mt-auto space-y-1">
        <a
          href="#settings"
          className="flex items-center gap-md p-md rounded-lg text-on-surface-variant hover:bg-[#1b2b3f] hover:text-[#d3e4fe] transition-all"
        >
          <Settings className="w-5 h-5" />
          <span className="font-title-md text-sm">{t('dashboard.sidebar.settings')}</span>
        </a>
        <a
          href="#help"
          className="flex items-center gap-md p-md rounded-lg text-on-surface-variant hover:bg-[#1b2b3f] hover:text-[#d3e4fe] transition-all"
        >
          <HelpCircle className="w-5 h-5" />
          <span className="font-title-md text-sm">{t('dashboard.sidebar.support')}</span>
        </a>
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
