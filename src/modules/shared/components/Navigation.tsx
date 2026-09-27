import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/app/providers'
import { ROUTES } from '@/constants'
import { Trophy, Shield, Building2, UserSearch, ChevronDown, Menu, X, ArrowRight, Compass } from 'lucide-react'

export type PublicHeaderVariant = 'landing' | 'explore' | 'minimal'

interface NavigationProps {
  variant?: PublicHeaderVariant
  onNavClick?: (path: string) => void
}

const exploreLinks = [
  { label: 'Competições', href: ROUTES.COMPETITIONS, icon: Trophy },
  { label: 'Clubes', href: ROUTES.CLUBS, icon: Shield },
  { label: 'Organizações', href: ROUTES.ORGANIZATIONS, icon: Building2 },
  { label: 'Jogadores', href: ROUTES.PLAYERS, icon: UserSearch },
]

const productLinks = [
  { label: 'Centro de Jogos & Súmulas', href: '#features' },
  { label: 'Como Funciona', href: '#how-it-works' },
  { label: 'Ecossistema', href: '#ecosystem' },
  { label: 'Perguntas Frequentes', href: '#faq' },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Logo({ minimal = false }: { minimal?: boolean }) {
  return (
    <Link to={ROUTES.HOME} className="flex items-center gap-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md group">
      <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-on-primary-fixed shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
        <Trophy className="h-5 w-5" />
      </div>
      <div className="flex flex-col">
        <span className="font-display-lg text-lg font-black tracking-wider text-on-surface">
          BOLA<span className="text-primary">YETU</span>
        </span>
      </div>
      {minimal && <span className="sr-only">Voltar à página inicial</span>}
    </Link>
  )
}

function ExploreMenu({ pathname }: { pathname: string }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const active = exploreLinks.some(item => isActivePath(pathname, item.href))

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 220)
  }

  useEffect(() => {
    setOpen(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [pathname])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`flex cursor-pointer items-center gap-xs rounded-md px-md py-sm text-sm font-semibold transition-colors [&::-webkit-details-marker]:hidden ${active || open ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}
        aria-expanded={open}
      >
        Explorar <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 z-50 animate-in fade-in duration-150">
          <div className="w-64 rounded-xl border border-outline-variant bg-surface-container-low p-sm shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
            {exploreLinks.map(item => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  to={item.href}
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-sm rounded-lg px-md py-sm text-sm transition-colors ${isActivePath(pathname, item.href) ? 'bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
                >
                  <Icon className="h-4 w-4 text-primary" />
                  {item.label}
                </Link>
              )
            })}
            <Link to={ROUTES.PUBLIC_EXPLORE} onClick={() => setOpen(false)} className="mt-sm block border-t border-outline-variant px-md pt-sm text-xs font-semibold text-primary hover:underline">
              Ver tudo em destaque →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function ProductMenu({ onAnchorClick }: { onAnchorClick: (href: string) => void }) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 220)
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  return (
    <div
      ref={menuRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative"
    >
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        className={`flex cursor-pointer items-center gap-xs rounded-md px-md py-sm text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface [&::-webkit-details-marker]:hidden ${open ? 'text-primary' : ''}`}
        aria-expanded={open}
      >
        Plataforma <ChevronDown className={`h-4 w-4 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && (
        <div className="absolute left-0 top-full pt-2 z-50 animate-in fade-in duration-150">
          <div className="w-56 rounded-xl border border-outline-variant bg-surface-container-low p-sm shadow-xl">
            {productLinks.map(item => (
              <a
                key={item.href}
                href={item.href}
                onClick={event => {
                  event.preventDefault()
                  setOpen(false)
                  onAnchorClick(item.href)
                }}
                className="block rounded-lg px-md py-sm text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface cursor-pointer"
              >
                {item.label}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function AuthActions() {
  const { isAuthenticated, user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const initials = useMemo(() => (user?.username || user?.email || 'U').slice(0, 2).toUpperCase(), [user])

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setOpen(false)
    }, 220)
  }

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-sm">
        <Link to={ROUTES.LOGIN} className="rounded-md px-md py-sm text-sm font-semibold text-on-surface-variant hover:text-on-surface">Entrar</Link>
        <Link to={ROUTES.REGISTER} className="rounded-full bg-primary px-lg py-sm text-sm font-bold text-on-primary-fixed hover:bg-primary/90">Registar</Link>
      </div>
    )
  }
  return (
    <div className="flex items-center gap-sm">
      <Link to={ROUTES.DASHBOARD} className="hidden rounded-md px-md py-sm text-sm font-semibold text-on-surface-variant hover:text-on-surface sm:inline-flex">Dashboard</Link>
      <div
        ref={menuRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        <button
          type="button"
          onClick={() => setOpen(prev => !prev)}
          className="flex cursor-pointer items-center gap-xs rounded-full border border-outline-variant bg-surface-container-high px-sm py-xs [&::-webkit-details-marker]:hidden"
          aria-expanded={open}
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary-fixed" aria-hidden="true">{initials}</span>
          <ChevronDown className={`h-4 w-4 text-on-surface-variant transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        {open && (
          <div className="absolute right-0 top-full pt-2 z-50 animate-in fade-in duration-150">
            <div className="w-48 rounded-xl border border-outline-variant bg-surface-container-low p-sm shadow-xl">
              <div className="border-b border-outline-variant px-md pb-sm text-xs text-on-surface-variant truncate">{user?.username || user?.email}</div>
              <Link to={ROUTES.PROFILE} onClick={() => setOpen(false)} className="mt-sm block rounded-lg px-md py-sm text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">Perfil</Link>
              <button type="button" onClick={() => { setOpen(false); logout(); }} className="w-full rounded-lg px-md py-sm text-left text-sm text-error hover:bg-error-container cursor-pointer">Terminar sessão</button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MobileMenu({ pathname, onAnchorClick, onClose }: { pathname: string; onAnchorClick: (href: string) => void; onClose: () => void }) {
  const { isAuthenticated, logout } = useAuth()
  return (
    <div className="absolute left-0 right-0 top-full border-t border-outline-variant bg-surface-container-low px-gutter py-md shadow-xl md:hidden z-50">
      <div className="space-y-xs">
        <p className="px-md pt-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant">Explorar</p>
        {exploreLinks.map(item => {
          const Icon = item.icon
          return (
            <Link key={item.href} to={item.href} onClick={onClose} className={`flex items-center gap-sm rounded-lg px-md py-sm text-sm ${isActivePath(pathname, item.href) ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}>
              <Icon className="h-4 w-4 text-primary" />
              {item.label}
            </Link>
          )
        })}
        <p className="px-md pt-md text-xs font-bold uppercase tracking-wider text-on-surface-variant">Plataforma</p>
        {productLinks.map(item => <a key={item.href} href={item.href} onClick={event => { event.preventDefault(); onAnchorClick(item.href); onClose() }} className="block rounded-lg px-md py-sm text-sm text-on-surface">{item.label}</a>)}
      </div>
      <div className="mt-md flex gap-sm border-t border-outline-variant pt-md">
        {isAuthenticated ? <><Link to={ROUTES.DASHBOARD} onClick={onClose} className="flex-1 rounded-lg bg-primary px-md py-sm text-center text-sm font-bold text-on-primary-fixed">Dashboard</Link><button type="button" onClick={() => { logout(); onClose() }} className="rounded-lg border border-outline-variant px-md py-sm text-sm cursor-pointer">Sair</button></> : <><Link to={ROUTES.LOGIN} onClick={onClose} className="flex-1 rounded-lg border border-outline-variant px-md py-sm text-center text-sm font-semibold">Entrar</Link><Link to={ROUTES.REGISTER} onClick={onClose} className="flex-1 rounded-lg bg-primary px-md py-sm text-center text-sm font-bold text-on-primary-fixed">Registar</Link></>}
      </div>
    </div>
  )
}

export function Navigation({ variant = 'landing', onNavClick }: NavigationProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const opaque = variant !== 'landing' || scrolled

  useEffect(() => {
    if (variant !== 'landing') return
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [variant])

  const handleAnchorClick = (href: string) => {
    onNavClick?.(href)
    if (!onNavClick) document.querySelector(href)?.scrollIntoView({ behavior: 'smooth' })
  }

  if (variant === 'minimal') {
    return <header className="fixed inset-x-0 top-0 z-50 border-b border-outline-variant bg-surface-container-low"><nav className="mx-auto flex h-14 max-w-container-max items-center justify-between px-gutter"><Logo /><Link to={ROUTES.HOME} className="text-sm font-semibold text-on-surface-variant hover:text-on-surface">Voltar</Link></nav></header>
  }

  return (
    <header className={`fixed inset-x-0 top-0 z-50 border-b transition-colors ${opaque ? 'border-outline-variant bg-surface-container-low/95 backdrop-blur' : 'border-transparent bg-transparent'}`}>
      <nav aria-label={t('nav.main', 'Navegação principal')} className="relative mx-auto flex h-16 max-w-container-max items-center justify-between px-gutter">
        <Logo />
        <div className="hidden items-center gap-xs md:flex">
          <ExploreMenu pathname={pathname} />
          <ProductMenu onAnchorClick={handleAnchorClick} />
          <Link to={ROUTES.COMPETITIONS} className={`rounded-md px-md py-sm text-sm font-semibold ${isActivePath(pathname, ROUTES.COMPETITIONS) ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Competições</Link>
          <Link to={ROUTES.PUBLIC_EXPLORE} className={`rounded-md px-md py-sm text-sm font-semibold flex items-center gap-1 ${isActivePath(pathname, ROUTES.PUBLIC_EXPLORE) ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}><Compass className="h-4 w-4" /> Diretório</Link>
        </div>
        <div className="hidden md:block"><AuthActions /></div>
        <button type="button" aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(value => !value)} className="rounded-lg p-sm text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden">{mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}</button>
        {mobileOpen && <MobileMenu pathname={pathname} onAnchorClick={handleAnchorClick} onClose={() => setMobileOpen(false)} />}
      </nav>
    </header>
  )
}
