import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '@/app/providers/AuthProvider'
import { useTenant } from '@/app/providers/TenantProvider'
import { 
  LayoutDashboard, 
  Search, 
  Bell, 
  Settings, 
  HelpCircle, 
  LogOut, 
  Menu, 
  X
} from 'lucide-react'

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
  dashboardType: 'federation' | 'executive' | 'league' | 'club' | 'competition'
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
  const navigate = useNavigate()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)
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
      default:
        return null
    }
  }

  // Get Title context label
  const getSubLabel = () => {
    switch (dashboardType) {
      case 'federation':
        return 'Consola da Federação'
      case 'executive':
        return 'Ecrã Executivo'
      case 'league':
        return 'Painel de Liga'
      case 'club':
        return 'Portal de Clubes'
      case 'competition':
        return 'Organizador de Provas'
      default:
        return 'BolaYetu Portal'
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
      <aside className="w-64 border-r border-[#26364a] bg-[#102034]/85 backdrop-blur-xl flex flex-col p-md hidden md:flex sticky top-0 h-screen z-40">
        <div className="mb-xl px-md flex flex-col items-center text-center">
          {getLogo() ? (
            <img 
              alt="Logo" 
              className={`object-contain mb-md transition-all duration-300 ${dashboardType === 'federation' ? 'h-20 w-auto' : 'h-24 w-24'}`} 
              src={getLogo() || ''} 
            />
          ) : (
            <div className="w-16 h-16 rounded-full bg-[#1b2b3f] flex items-center justify-center mb-md border border-[#26364a]">
              <LayoutDashboard className="text-primary w-8 h-8" />
            </div>
          )}
          <div>
            <h1 className="font-display-lg text-2xl text-[#94d3c1] uppercase tracking-tighter leading-none">BOLA YETU</h1>
            <p className="text-on-surface-variant text-[11px] font-semibold uppercase tracking-widest mt-1.5 opacity-70">
              {getSubLabel()}
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
            <span className="font-title-md text-sm">Configurações</span>
          </a>
          <a
            href="#help"
            className="flex items-center gap-md p-md rounded-lg text-on-surface-variant hover:bg-[#1b2b3f] hover:text-[#d3e4fe] transition-all"
          >
            <HelpCircle className="w-5 h-5" />
            <span className="font-title-md text-sm">Suporte</span>
          </a>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-md p-md rounded-lg text-error hover:bg-error-container/10 transition-all text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-title-md text-sm font-semibold">Terminar Sessão</span>
          </button>
        </div>
      </aside>

      {/* Mobile Sidebar Overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 bg-[#000f21]/80 backdrop-blur-sm z-50 md:hidden flex justify-start">
          <aside className="w-64 border-r border-[#26364a] bg-[#102034] flex flex-col p-md h-full relative animate-fade-in">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-md right-md p-sm text-on-surface-variant hover:text-[#d3e4fe]"
            >
              <X className="w-6 h-6" />
            </button>
            <div className="mb-xl mt-lg px-md text-center">
              {getLogo() && (
                <img 
                  alt="Logo" 
                  className={`mx-auto mb-md object-contain ${dashboardType === 'federation' ? 'h-16' : 'h-20'}`} 
                  src={getLogo() || ''} 
                />
              )}
              <h1 className="font-display-lg text-xl text-[#94d3c1] uppercase tracking-tighter">BOLA YETU</h1>
              <p className="text-on-surface-variant text-[10px] font-semibold uppercase tracking-widest mt-1">
                {getSubLabel()}
              </p>
            </div>
            <nav className="flex-1 space-y-1 overflow-y-auto px-sm">
              {sidebarLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
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
                onClick={handleLogout}
                className="w-full flex items-center gap-md p-md rounded-lg text-error hover:bg-error-container/10 transition-all text-left"
              >
                <LogOut className="w-5 h-5" />
                <span className="font-title-md text-sm font-semibold">Sair</span>
              </button>
            </div>
          </aside>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)}></div>
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header (Top Bar) */}
        <header className="sticky top-0 z-30 h-16 w-full flex justify-between items-center px-lg bg-[#0b1c30]/70 border-b border-[#26364a]/40 backdrop-blur-xl">
          <div className="flex items-center gap-lg">
            {/* Hamburger Button for mobile */}
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-sm text-on-surface-variant hover:text-[#d3e4fe] rounded-full hover:bg-[#1b2b3f]/30"
            >
              <Menu className="w-6 h-6" />
            </button>

            {/* Tenant / Workspace Active Indicator */}
            <div className="hidden sm:flex items-center gap-sm bg-[#26364a] px-md py-1.5 rounded-full border border-[#3f4945]">
              <span className="w-2 h-2 rounded-full bg-[#94d3c1] animate-pulse"></span>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-[#d3e4fe]">
                {tenant ? `Inquilino: ${tenant.name}` : 'Portal Global BolaYetu'}
              </span>
            </div>

            {/* Quick Breadcrumbs */}
            <div className="hidden md:flex gap-md text-sm">
              <a className="text-[#94d3c1] font-bold border-b-2 border-[#94d3c1] pb-1" href="#home">Geral</a>
              <a className="text-on-surface-variant hover:text-[#94d3c1] transition-colors" href="#analytics">Análise</a>
              <a className="text-on-surface-variant hover:text-[#94d3c1] transition-colors" href="#reports">Relatórios</a>
            </div>
          </div>

          <div className="flex items-center gap-lg">
            {/* Search Input */}
            <div className="relative hidden lg:block w-64">
              <Search className="absolute left-md top-1/2 -translate-y-1/2 text-on-surface-variant w-4 h-4" />
              <input 
                type="text"
                placeholder="Pesquisar..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#000f21] border border-[#3f4945] rounded-full pl-xl pr-md py-1.5 text-xs text-[#d3e4fe] focus:ring-1 focus:ring-[#94d3c1] focus:border-[#94d3c1] transition-all"
              />
            </div>

            <div className="flex gap-sm">
              {/* Notification Button */}
              <div className="relative">
                <button 
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 text-on-surface-variant hover:text-[#94d3c1] transition-colors rounded-full hover:bg-[#26364a]/30"
                >
                  <Bell className="w-5 h-5" />
                  <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-error rounded-full border-2 border-[#031427]"></span>
                </button>

                {/* Notifications Dropdown Panel */}
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 glass-card p-0 overflow-hidden z-50 animate-fade-in shadow-2xl border border-[#26364a]">
                    <div className="p-md bg-[#102034] border-b border-[#26364a] flex justify-between items-center">
                      <h4 className="font-semibold text-sm">Notificações</h4>
                      <button className="text-xs text-primary hover:underline">Limpar tudo</button>
                    </div>
                    <div className="divide-y divide-[#26364a]/50 max-h-64 overflow-y-auto">
                      <div className="p-md hover:bg-[#1b2b3f]/50 transition-colors text-xs space-y-1 cursor-pointer">
                        <p className="font-semibold">Nova Licença Submetida</p>
                        <p className="text-on-surface-variant">O Petro de Luanda atualizou os dados do plantel.</p>
                        <span className="text-[10px] text-primary opacity-60">Há 5 min</span>
                      </div>
                      <div className="p-md hover:bg-[#1b2b3f]/50 transition-colors text-xs space-y-1 cursor-pointer">
                        <p className="font-semibold">Auditoria Periódica CAF</p>
                        <p className="text-on-surface-variant">Conformidade do inquilino atualizada com sucesso.</p>
                        <span className="text-[10px] text-primary opacity-60">Há 1 hora</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="h-8 w-px bg-[#26364a]"></div>

            {/* Profile Avatar / Menu */}
            <div className="flex items-center gap-md">
              <div className="text-right hidden xl:block">
                <p className="text-xs font-semibold text-on-surface leading-none">
                  {user?.username || 'Utilizador Demo'}
                </p>
                <p className="text-[10px] text-on-surface-variant uppercase mt-1 font-bold">
                  {user?.role || 'Executivo'}
                </p>
              </div>
              <button
                onClick={() => navigate('/profile')}
                title="Ver Perfil"
                className="w-10 h-10 rounded-full bg-[#1b2b3f] flex items-center justify-center border-2 border-[#94d3c1] hover:border-primary hover:scale-105 transition-all cursor-pointer"
              >
                <span className="text-sm font-bold text-[#94d3c1] uppercase">
                  {user?.username?.charAt(0) || '?'}
                </span>
              </button>
            </div>
          </div>
        </header>

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
