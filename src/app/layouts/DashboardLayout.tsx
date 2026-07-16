import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTenant } from '@/app/providers/TenantProvider'
import { DashboardSidebar } from './components/DashboardSidebar'
import { DashboardHeader } from './components/DashboardHeader'
import { DashboardMobileMenu } from './components/DashboardMobileMenu'

interface SidebarLink {
  label: string
  href: string
  icon: React.ReactNode
  active?: boolean
}

interface DashboardLayoutProps {
  children: React.ReactNode
  title: string
  subtitle?: string
  dashboardType: 'federation' | 'executive' | 'organization' | 'league' | 'club' | 'competition' | 'player'
  sidebarLinks: SidebarLink[]
  headerActions?: React.ReactNode
}

export function DashboardLayout({
  children,
  title,
  subtitle,
  dashboardType,
  sidebarLinks,
  headerActions
}: DashboardLayoutProps) {
  const { user, logout } = useAuth()
  const { tenant } = useTenant()
  const { t } = useTranslation()
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const toggleNotifications = () => setNotificationsOpen(v => !v)
  const [searchQuery, setSearchQuery] = useState('')

  // Resolve logo based on dashboard type or tenant logo
  const getLogo = () => {
    if (tenant?.logoUrl) return tenant.logoUrl
    
    switch (dashboardType) {
      case 'federation':
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuA6nGnm2G82DR2YWsrXj4h5WsD5I5U1GF0w3ay7JrMMNTo9N-y5wH9nIqjOPRv04tVJDGyL2XJ7lFBaGsft7Zo97pY4hUuWVG9UWKpg_5-qMdBEsg8HADf653wkmcUzgLwibTGr192tjEb5tQhSvK3IP0epVYBh_nzoHin_PZF9PYapXzd4-ZNlPVsvEwBD_S52qgUBt-DJRBbN_J04Cq6miKpPUKlQwONwuKG_Wo_hV2Rnn5MsfpPX4evBLI7t-KvLpUn9QcKNjEo'
      case 'league':
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz9f-qRKh7Zbj1G4Q5iqJCckbETNGHjWrRoU1Y1W-15edKyjElIms63meXqE7Y7q86vhEfZ_6B3Op6zlhE47YTKlBGP6s93lFnDadIP_SHZA_X86VowyiKByP-wBoa97p1WmieP3jWX6lkMuiEH-a6u7WvaQhORuEF4A6z-RQg-KpwHMBvhgvQRAL7UwARs93dHHA577Y-9e2RztvqJf2HERrIp3zovuVNOBrP1FnqZ2yNfqpHR05cIOkMdP9oRTE26IccxL5QbiU'
      case 'club':
        return 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYQakMAam7Lo4jrPnnXrBpK5pXyAMbKLDJ70RGLqkPlIr9Ls793C6W8OwLYQDuQvK6n-XQU-BYE_0r5PrK7L0EpFy3vZTzji_av3ItQ6WrZT9jWrBHvlZBgIrueTdKBVP7R_p5h8Wk2fH6BGjdVAUG1nIq4ebQ_RaKlywkP-B1Nv3ERnSB-X0oUpgl_IdzS0cSta7IDzO2OtuX4eHe0IzoBuK3DxjofwK4vbSJ06GSd4h3vp5JUx1Q9fyHsj8KkAvm5WzcxcqK814'
      case 'organization':
        return null
      default:
        return null
    }
  }

  // Get Title context label
  const getSubLabel = () => {
    switch (dashboardType) {
      case 'federation':
        return t('dashboard.sublabels.federation')
      case 'executive':
        return t('dashboard.sublabels.executive')
      case 'league':
        return t('dashboard.sublabels.league')
      case 'club':
        return t('dashboard.sublabels.club')
      case 'competition':
        return t('dashboard.sublabels.competition')
      case 'organization':
        return t('dashboard.sublabels.organization', 'Organização')
      case 'player':
        return t('dashboard.sublabels.player')
      default:
        return t('dashboard.sublabels.default')
    }
  }

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-[#031427] text-[#d3e4fe] flex">
      {/* Dynamic Background Glow Effect */}
      <div className="glow-bg">
        <div className="glow-circle glow-1" />
        <div className="glow-circle glow-2" />
      </div>

      {/* Desktop Sidebar */}
      <DashboardSidebar
        logo={getLogo()}
        dashboardType={dashboardType}
        sidebarLinks={sidebarLinks}
        subLabel={getSubLabel()}
        onLogout={handleLogout}
      />

      {/* Mobile Sidebar Overlay */}
      <DashboardMobileMenu
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        logo={getLogo()}
        dashboardType={dashboardType}
        sidebarLinks={sidebarLinks}
        subLabel={getSubLabel()}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (Top Bar) */}
        <DashboardHeader
          tenantName={tenant?.name}
          username={user?.username}
          role={user?.role}
          notificationsOpen={notificationsOpen}
          toggleNotifications={toggleNotifications}
          searchQuery={searchQuery}
          setSearchQuery={setSearchQuery}
          onOpenMobileMenu={() => setMobileMenuOpen(true)}
        />

        {/* Content canvas */}
        <main className="flex-1 p-lg max-w-container-max w-full mx-auto space-y-lg overflow-y-auto">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-md mb-xl animate-fade-in">
            <div>
              <h2 className="font-display-lg text-3xl md:text-4xl text-[#d3e4fe] uppercase tracking-tight">
                {title}
              </h2>
              {subtitle && (
                <p className="text-on-surface-variant text-sm max-w-2xl mt-2 font-body-md opacity-80">
                  {subtitle}
                </p>
              )}
            </div>
            {headerActions && (
              <div className="flex gap-sm shrink-0">
                {headerActions}
              </div>
            )}
          </div>

          {/* Child Dashboard Pages rendering */}
          {children}
        </main>
      </div>
    </div>
  )
}
