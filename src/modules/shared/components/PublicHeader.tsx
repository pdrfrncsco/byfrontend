import { useEffect, useMemo, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/app/providers'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Trophy, Shield, Building2, UserSearch, ChevronDown, Menu, X, ArrowRight } from 'lucide-react'

export type PublicHeaderVariant = 'landing' | 'explore' | 'minimal'

interface PublicHeaderProps {
  variant?: PublicHeaderVariant
  onNavClick?: (path: string) => void
}

const exploreLinks = [
  { label: 'Competições', href: ROUTES.COMPETITIONS, icon: Trophy, desc: 'Ligas e torneios em tempo real' },
  { label: 'Clubes', href: ROUTES.CLUBS, icon: Shield, desc: 'Perfis e planteis oficiais' },
  { label: 'Organizações', href: ROUTES.ORGANIZATIONS, icon: Building2, desc: 'Associações e federações' },
  { label: 'Atletas / Olheiros', href: ROUTES.PLAYERS, icon: UserSearch, desc: 'Fichas técnicas e estatísticas' },
]

const productLinks = [
  { label: 'Funcionalidades', href: '#features' },
  { label: 'Como funciona', href: '#how-it-works' },
  { label: 'Ecossistema', href: '#ecosystem' },
  { label: 'Preços', href: '#pricing' },
  { label: 'Perguntas Frequentes', href: '#faq' },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
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

function AuthActions() {
  const { isAuthenticated, user, logout } = useAuth()
  const initials = useMemo(() => (user?.username || user?.email || 'U').slice(0, 2).toUpperCase(), [user])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-xs sm:gap-sm">
        <Button asChild variant="ghost" size="sm" className="font-medium text-on-surface-variant hover:text-on-surface">
          <Link to={ROUTES.LOGIN}>Entrar</Link>
        </Button>
        <Button asChild size="sm" className="font-semibold shadow-sm">
          <Link to={ROUTES.REGISTER}>
            Criar Conta
            <ArrowRight className="ml-xs h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-sm">
      <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex">
        <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
      </Button>
      <details className="group relative">
        <summary className="flex cursor-pointer list-none items-center gap-xs rounded-full border border-outline/20 bg-surface-container-high p-xs hover:bg-surface-container [&::-webkit-details-marker]:hidden">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary-fixed" aria-hidden="true">
            {initials}
          </span>
          <ChevronDown className="h-4 w-4 text-on-surface-variant transition-transform group-open:rotate-180" />
        </summary>
        <div className="absolute right-0 top-full mt-xs w-52 rounded-xl border border-outline-variant bg-card p-xs shadow-xl">
          <div className="border-b border-border px-sm py-xs text-xs font-medium text-muted-foreground truncate">
            {user?.username || user?.email}
          </div>
          <Link to={ROUTES.PROFILE} className="mt-xs block rounded-lg px-sm py-xs text-sm font-medium text-foreground hover:bg-muted">
            Perfil
          </Link>
          <button
            type="button"
            onClick={logout}
            className="w-full rounded-lg px-sm py-xs text-left text-sm font-medium text-destructive hover:bg-destructive/10"
          >
            Terminar sessão
          </button>
        </div>
      </details>
    </div>
  )
}

export function PublicHeader({ variant = 'landing', onNavClick }: PublicHeaderProps) {
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
    if (!onNavClick) {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  if (variant === 'minimal') {
    return (
      <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-md md:px-xl">
          <Logo minimal />
          <div className="flex items-center gap-xs">
            <ThemeToggle />
            <Button asChild variant="ghost" size="sm">
              <Link to={ROUTES.HOME}>Voltar à homepage</Link>
            </Button>
          </div>
        </nav>
      </header>
    )
  }

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-all duration-300 ${
        opaque
          ? 'border-border/60 bg-background/85 backdrop-blur-md shadow-sm'
          : 'border-transparent bg-transparent'
      }`}
    >
      <nav aria-label={t('nav.main', 'Navegação principal')} className="mx-auto flex h-16 max-w-7xl items-center justify-between px-md md:px-xl">
        <Logo />

        {/* Desktop Links */}
        <div className="hidden items-center gap-xs md:flex">
          {/* Explore Dropdown */}
          <details className="group relative">
            <summary className={`flex cursor-pointer list-none items-center gap-xs rounded-lg px-sm py-xs text-sm font-semibold transition-colors [&::-webkit-details-marker]:hidden ${
              exploreLinks.some(i => isActivePath(pathname, i.href)) ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}>
              Explorar
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute left-0 top-full mt-xs w-72 rounded-xl border border-border bg-card p-sm shadow-xl">
              {exploreLinks.map(item => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.href}
                    to={item.href}
                    className={`flex items-start gap-sm rounded-lg p-sm text-sm transition-colors ${
                      isActivePath(pathname, item.href)
                        ? 'bg-primary/10 text-primary'
                        : 'text-foreground hover:bg-muted'
                    }`}
                  >
                    <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                    <div>
                      <div className="font-semibold">{item.label}</div>
                      <div className="text-xs text-muted-foreground">{item.desc}</div>
                    </div>
                  </Link>
                )
              })}
              <Link
                to={ROUTES.PUBLIC_EXPLORE}
                className="mt-xs block border-t border-border pt-xs text-center text-xs font-semibold text-primary hover:underline"
              >
                Ver tudo no diretório →
              </Link>
            </div>
          </details>

          {/* Product Dropdown */}
          <details className="group relative">
            <summary className="flex cursor-pointer list-none items-center gap-xs rounded-lg px-sm py-xs text-sm font-semibold text-on-surface-variant transition-colors hover:text-on-surface [&::-webkit-details-marker]:hidden">
              Plataforma
              <ChevronDown className="h-4 w-4 transition-transform group-open:rotate-180" />
            </summary>
            <div className="absolute left-0 top-full mt-xs w-56 rounded-xl border border-border bg-card p-xs shadow-xl">
              {productLinks.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={event => {
                    event.preventDefault()
                    handleAnchorClick(item.href)
                  }}
                  className="block rounded-lg px-sm py-xs text-sm font-medium text-foreground hover:bg-muted transition-colors"
                >
                  {item.label}
                </a>
              ))}
            </div>
          </details>

          <a
            href="#pricing"
            onClick={event => {
              event.preventDefault()
              handleAnchorClick('#pricing')
            }}
            className="rounded-lg px-sm py-xs text-sm font-semibold text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Planos & Preços
          </a>

          <Link
            to={ROUTES.NEWS}
            className={`rounded-lg px-sm py-xs text-sm font-semibold transition-colors ${
              isActivePath(pathname, ROUTES.NEWS) ? 'text-primary' : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Notícias
          </Link>
        </div>

        {/* Auth CTA & Theme Toggle */}
        <div className="hidden md:flex items-center gap-xs">
          <ThemeToggle />
          <AuthActions />
        </div>

        {/* Mobile menu trigger */}
        <div className="flex items-center gap-xs md:hidden">
          <ThemeToggle />
          <Button
            variant="ghost"
            size="icon"
            aria-label={mobileOpen ? 'Fechar menu' : 'Abrir menu'}
            onClick={() => setMobileOpen(v => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-border bg-card p-md shadow-2xl md:hidden animate-in slide-in-from-top-2">
            <div className="space-y-sm">
              <p className="px-xs text-xs font-bold uppercase tracking-wider text-muted-foreground">Explorar Diretório</p>
              <div className="grid grid-cols-2 gap-xs">
                {exploreLinks.map(item => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-xs rounded-lg p-xs text-xs font-semibold ${
                        isActivePath(pathname, item.href) ? 'bg-primary/10 text-primary' : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-primary" />
                      {item.label}
                    </Link>
                  )
                })}
              </div>

              <p className="px-xs pt-sm text-xs font-bold uppercase tracking-wider text-muted-foreground">Plataforma</p>
              {productLinks.map(item => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={event => {
                    event.preventDefault()
                    handleAnchorClick(item.href)
                    setMobileOpen(false)
                  }}
                  className="block rounded-lg px-xs py-xs text-sm font-medium text-foreground hover:bg-muted"
                >
                  {item.label}
                </a>
              ))}
            </div>

            <div className="mt-md pt-md border-t border-border flex items-center justify-between">
              <AuthActions />
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
