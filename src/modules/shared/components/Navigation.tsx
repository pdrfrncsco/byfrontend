import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/app/providers'
import { ROUTES } from '@/constants'

export type PublicHeaderVariant = 'landing' | 'explore' | 'minimal'

interface NavigationProps {
  variant?: PublicHeaderVariant
  onNavClick?: (path: string) => void
}

const exploreLinks = [
  { label: 'Competições', href: ROUTES.COMPETITIONS, icon: 'emoji_events' },
  { label: 'Clubes', href: ROUTES.CLUBS, icon: 'shield' },
  { label: 'Organizações', href: ROUTES.ORGANIZATIONS, icon: 'business' },
  { label: 'Jogadores', href: ROUTES.PLAYERS, icon: 'person_search' },
]

const productLinks = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Como funciona', href: '#how-it-works' },
  { label: 'Ecossistema', href: '#ecosystem' },
  { label: 'Preços', href: '#pricing' },
  { label: 'Perguntas frequentes', href: '#faq' },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`)
}

function Logo({ minimal = false }: { minimal?: boolean }) {
  return (
    <Link to={ROUTES.HOME} className="shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md">
      <span className="font-display-lg text-headline-lg-mobile text-primary tracking-widest">BOLAYETU</span>
      {minimal && <span className="sr-only">Voltar à página inicial</span>}
    </Link>
  )
}

function ExploreMenu({ pathname }: { pathname: string }) {
  const active = exploreLinks.some(item => isActivePath(pathname, item.href))
  return (
    <details className="group relative">
      <summary className={`flex cursor-pointer list-none items-center gap-xs rounded-md px-md py-sm text-sm font-semibold transition-colors [&::-webkit-details-marker]:hidden ${active ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>
        Explorar <span className="material-symbols-outlined text-base transition-transform group-open:rotate-180" aria-hidden="true">expand_more</span>
      </summary>
      <div className="absolute left-0 top-full mt-sm w-64 rounded-xl border border-outline-variant bg-surface-container-low p-sm shadow-[0_18px_40px_rgba(15,23,42,0.12)]">
        {exploreLinks.map(item => (
          <Link
            key={item.href}
            to={item.href}
            className={`flex items-center gap-sm rounded-lg px-md py-sm text-sm transition-colors ${isActivePath(pathname, item.href) ? 'bg-primary/12 text-primary shadow-sm ring-1 ring-primary/20' : 'text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface'}`}
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">{item.icon}</span>
            {item.label}
          </Link>
        ))}
        <Link to={ROUTES.PUBLIC_EXPLORE} className="mt-sm block border-t border-outline-variant px-md pt-sm text-xs font-semibold text-primary hover:underline">
          Ver tudo em destaque →
        </Link>
      </div>
    </details>
  )
}

function ProductMenu({ onAnchorClick }: { onAnchorClick: (href: string) => void }) {
  return (
    <details className="group relative">
      <summary className="flex cursor-pointer list-none items-center gap-xs rounded-md px-md py-sm text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface [&::-webkit-details-marker]:hidden">
        Produto <span className="material-symbols-outlined text-base transition-transform group-open:rotate-180" aria-hidden="true">expand_more</span>
      </summary>
      <div className="absolute left-0 top-full mt-sm w-56 rounded-xl border border-outline-variant bg-surface-container-low p-sm shadow-xl">
        {productLinks.map(item => (
          <a key={item.href} href={item.href} onClick={event => { event.preventDefault(); onAnchorClick(item.href) }} className="block rounded-lg px-md py-sm text-sm text-on-surface-variant transition-colors hover:bg-surface-container-high hover:text-on-surface">
            {item.label}
          </a>
        ))}
      </div>
    </details>
  )
}

function AuthActions() {
  const { isAuthenticated, user, logout } = useAuth()
  const initials = useMemo(() => (user?.username || user?.email || 'U').slice(0, 2).toUpperCase(), [user])
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
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-xs rounded-full border border-outline-variant bg-surface-container-high px-sm py-xs [&::-webkit-details-marker]:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary-fixed" aria-hidden="true">{initials}</span>
          <span className="material-symbols-outlined text-base text-on-surface-variant transition-transform group-open:rotate-180" aria-hidden="true">expand_more</span>
        </summary>
        <div className="absolute right-0 top-full mt-sm w-48 rounded-xl border border-outline-variant bg-surface-container-low p-sm shadow-xl">
          <div className="border-b border-outline-variant px-md pb-sm text-xs text-on-surface-variant">{user?.username || user?.email}</div>
          <Link to={ROUTES.PROFILE} className="mt-sm block rounded-lg px-md py-sm text-sm text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface">Perfil</Link>
          <button type="button" onClick={logout} className="w-full rounded-lg px-md py-sm text-left text-sm text-error hover:bg-error-container">Terminar sessão</button>
        </div>
      </details>
    </div>
  )
}

function MobileMenu({ pathname, onAnchorClick, onClose }: { pathname: string; onAnchorClick: (href: string) => void; onClose: () => void }) {
  const { isAuthenticated, logout } = useAuth()
  return (
    <div className="absolute left-0 right-0 top-full border-t border-outline-variant bg-surface-container-low px-gutter py-md shadow-xl md:hidden">
      <div className="space-y-xs">
        <p className="px-md pt-sm text-xs font-bold uppercase tracking-wider text-on-surface-variant">Explorar</p>
        {exploreLinks.map(item => <Link key={item.href} to={item.href} onClick={onClose} className={`flex items-center gap-sm rounded-lg px-md py-sm text-sm ${isActivePath(pathname, item.href) ? 'bg-primary/10 text-primary' : 'text-on-surface'}`}><span className="material-symbols-outlined text-lg" aria-hidden="true">{item.icon}</span>{item.label}</Link>)}
        <p className="px-md pt-md text-xs font-bold uppercase tracking-wider text-on-surface-variant">Produto</p>
        {productLinks.map(item => <a key={item.href} href={item.href} onClick={event => { event.preventDefault(); onAnchorClick(item.href); onClose() }} className="block rounded-lg px-md py-sm text-sm text-on-surface">{item.label}</a>)}
      </div>
      <div className="mt-md flex gap-sm border-t border-outline-variant pt-md">
        {isAuthenticated ? <><Link to={ROUTES.DASHBOARD} onClick={onClose} className="flex-1 rounded-lg bg-primary px-md py-sm text-center text-sm font-bold text-on-primary-fixed">Dashboard</Link><button type="button" onClick={() => { logout(); onClose() }} className="rounded-lg border border-outline-variant px-md py-sm text-sm">Sair</button></> : <><Link to={ROUTES.LOGIN} onClick={onClose} className="flex-1 rounded-lg border border-outline-variant px-md py-sm text-center text-sm font-semibold">Entrar</Link><Link to={ROUTES.REGISTER} onClick={onClose} className="flex-1 rounded-lg bg-primary px-md py-sm text-center text-sm font-bold text-on-primary-fixed">Registar</Link></>}
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
          <a href="#pricing" onClick={event => { event.preventDefault(); handleAnchorClick('#pricing') }} className="rounded-md px-md py-sm text-sm font-semibold text-on-surface-variant hover:text-on-surface">Preços</a>
          <Link to={ROUTES.NEWS} className={`rounded-md px-md py-sm text-sm font-semibold ${isActivePath(pathname, ROUTES.NEWS) ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'}`}>Blog</Link>
        </div>
        <div className="hidden md:block"><AuthActions /></div>
        <button type="button" aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'} aria-expanded={mobileOpen} onClick={() => setMobileOpen(value => !value)} className="rounded-lg p-sm text-on-surface hover:bg-surface-container-high focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary md:hidden"><span className="material-symbols-outlined" aria-hidden="true">{mobileOpen ? 'close' : 'menu'}</span></button>
        {mobileOpen && <MobileMenu pathname={pathname} onAnchorClick={handleAnchorClick} onClose={() => setMobileOpen(false)} />}
      </nav>
    </header>
  )
}
