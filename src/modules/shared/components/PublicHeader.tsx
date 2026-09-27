import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/app/providers'
import { ROUTES } from '@/constants'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import {
  Trophy,
  Shield,
  Building2,
  UserSearch,
  ChevronDown,
  Menu,
  X,
  ArrowRight,
  Compass,
} from 'lucide-react'

export type PublicHeaderVariant = 'landing' | 'explore' | 'minimal'

interface PublicHeaderProps {
  variant?: PublicHeaderVariant
  onNavClick?: (path: string) => void
}

const exploreLinks = [
  {
    label: 'Competições',
    href: ROUTES.COMPETITIONS,
    icon: Trophy,
    desc: 'Ligas e torneios em tempo real',
  },
  {
    label: 'Clubes & Academias',
    href: ROUTES.CLUBS,
    icon: Shield,
    desc: 'Perfis e plantéis oficiais',
  },
  {
    label: 'Federações & Ligas',
    href: ROUTES.ORGANIZATIONS,
    icon: Building2,
    desc: 'Associações e federações homologadas',
  },
  {
    label: 'Base de Atletas',
    href: ROUTES.PLAYERS,
    icon: UserSearch,
    desc: 'Fichas técnicas e estatísticas',
  },
]

const platformLinks = [
  { label: 'Centro de Jogos & Súmulas', href: '#features' },
  { label: 'Como Funciona', href: '#how-it-works' },
  { label: 'O Ecossistema', href: '#ecosystem' },
  { label: 'Perguntas Frequentes', href: '#faq' },
]

function isActivePath(pathname: string, href: string) {
  return pathname === href || (href !== '/' && pathname.startsWith(`${href}/`))
}

function Logo({ minimal = false }: { minimal?: boolean }) {
  return (
    <Link
      to={ROUTES.HOME}
      className="flex items-center gap-xs focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-md group"
    >
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
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const location = useLocation()

  const initials = useMemo(
    () => (user?.username || user?.email || 'U').slice(0, 2).toUpperCase(),
    [user],
  )

  const handleMouseEnter = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
      timeoutRef.current = null
    }
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    timeoutRef.current = setTimeout(() => {
      setUserMenuOpen(false)
    }, 200)
  }

  useEffect(() => {
    setUserMenuOpen(false)
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
  }, [location.pathname])

  useEffect(() => {
    if (!userMenuOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [userMenuOpen])

  if (!isAuthenticated) {
    return (
      <div className="flex items-center gap-xs sm:gap-sm">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="font-semibold text-on-surface-variant hover:text-on-surface text-xs sm:text-sm"
        >
          <Link to={ROUTES.LOGIN}>Entrar</Link>
        </Button>
        <Button
          asChild
          size="sm"
          className="font-bold shadow-sm text-xs sm:text-sm rounded-lg"
        >
          <Link to={ROUTES.REGISTER}>
            Criar Conta
            <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-sm">
      <Button asChild variant="outline" size="sm" className="hidden sm:inline-flex font-semibold text-xs">
        <Link to={ROUTES.DASHBOARD}>Dashboard</Link>
      </Button>

      {/* User Profile Dropdown */}
      <div
        ref={menuRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        className="relative"
      >
        <button
          type="button"
          onClick={() => setUserMenuOpen((prev) => !prev)}
          className="flex cursor-pointer items-center gap-xs rounded-full border border-outline/20 bg-surface-container-high p-xs hover:bg-surface-container focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
          aria-expanded={userMenuOpen}
          aria-haspopup="true"
        >
          <span
            className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-on-primary-fixed"
            aria-hidden="true"
          >
            {initials}
          </span>
          <ChevronDown
            className={`h-4 w-4 text-on-surface-variant transition-transform duration-200 ${
              userMenuOpen ? 'rotate-180' : ''
            }`}
          />
        </button>

        {userMenuOpen && (
          <div className="absolute right-0 top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
            {/* Invisible hover bridge */}
            <div className="w-52 rounded-2xl border border-outline-variant bg-card p-2 shadow-2xl">
              <div className="border-b border-border px-3 py-2 text-xs font-medium text-muted-foreground truncate">
                {user?.username || user?.email}
              </div>
              <Link
                to={ROUTES.PROFILE}
                onClick={() => setUserMenuOpen(false)}
                className="mt-1 block rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors"
              >
                Meu Perfil
              </Link>
              <Link
                to={ROUTES.DASHBOARD}
                onClick={() => setUserMenuOpen(false)}
                className="block rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors sm:hidden"
              >
                Dashboard
              </Link>
              <button
                type="button"
                onClick={() => {
                  setUserMenuOpen(false)
                  logout()
                }}
                className="w-full rounded-xl px-3 py-2 text-left text-xs font-medium text-destructive hover:bg-destructive/10 cursor-pointer transition-colors"
              >
                Terminar sessão
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function PublicHeader({ variant = 'landing', onNavClick }: PublicHeaderProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [exploreOpen, setExploreOpen] = useState(false)
  const [platformOpen, setPlatformOpen] = useState(false)

  const exploreRef = useRef<HTMLDivElement | null>(null)
  const platformRef = useRef<HTMLDivElement | null>(null)
  const exploreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const platformTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const opaque = variant !== 'landing' || scrolled

  useEffect(() => {
    if (variant !== 'landing') return
    const handleScroll = () => setScrolled(window.scrollY > 12)
    handleScroll()
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [variant])

  // Close dropdowns on location change
  useEffect(() => {
    setExploreOpen(false)
    setPlatformOpen(false)
    setMobileOpen(false)
    if (exploreTimeoutRef.current) clearTimeout(exploreTimeoutRef.current)
    if (platformTimeoutRef.current) clearTimeout(platformTimeoutRef.current)
  }, [pathname])

  // Click outside listener
  useEffect(() => {
    if (!exploreOpen && !platformOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node
      if (exploreRef.current && !exploreRef.current.contains(target)) {
        setExploreOpen(false)
      }
      if (platformRef.current && !platformRef.current.contains(target)) {
        setPlatformOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [exploreOpen, platformOpen])

  // Explore hover handlers with grace delay
  const handleExploreEnter = () => {
    if (exploreTimeoutRef.current) {
      clearTimeout(exploreTimeoutRef.current)
      exploreTimeoutRef.current = null
    }
  }

  const handleExploreLeave = () => {
    if (exploreTimeoutRef.current) clearTimeout(exploreTimeoutRef.current)
    exploreTimeoutRef.current = setTimeout(() => {
      setExploreOpen(false)
    }, 220)
  }

  // Platform hover handlers with grace delay
  const handlePlatformEnter = () => {
    if (platformTimeoutRef.current) {
      clearTimeout(platformTimeoutRef.current)
      platformTimeoutRef.current = null
    }
  }

  const handlePlatformLeave = () => {
    if (platformTimeoutRef.current) clearTimeout(platformTimeoutRef.current)
    platformTimeoutRef.current = setTimeout(() => {
      setPlatformOpen(false)
    }, 220)
  }

  const handleAnchorClick = (href: string) => {
    setPlatformOpen(false)
    setMobileOpen(false)
    onNavClick?.(href)
    if (pathname === '/') {
      const el = document.querySelector(href)
      if (el) el.scrollIntoView({ behavior: 'smooth' })
    } else {
      navigate(`/${href}`)
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
          ? 'border-outline-variant/20 bg-background/90 backdrop-blur-md shadow-xs'
          : 'border-outline-variant/15 bg-background/80 backdrop-blur-md'
      }`}
    >
      <nav
        aria-label={t('nav.main', 'Navegação principal')}
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-md md:px-xl"
      >
        <Logo />

        {/* Desktop Links */}
        <div className="hidden items-center gap-1 md:flex">
          {/* Explore Dropdown */}
          <div
            ref={exploreRef}
            onMouseEnter={handleExploreEnter}
            onMouseLeave={handleExploreLeave}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setExploreOpen((prev) => !prev)
                setPlatformOpen(false)
              }}
              className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                exploreLinks.some((i) => isActivePath(pathname, i.href)) || exploreOpen
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              aria-expanded={exploreOpen}
              aria-haspopup="true"
            >
              Explorar
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  exploreOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {exploreOpen && (
              <div className="absolute left-0 top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-72 rounded-2xl border border-border bg-card p-2 shadow-2xl">
                  {exploreLinks.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setExploreOpen(false)}
                        className={`flex items-start gap-3 rounded-xl p-2.5 text-sm transition-colors ${
                          isActivePath(pathname, item.href)
                            ? 'bg-primary/10 text-primary font-bold'
                            : 'text-foreground hover:bg-muted'
                        }`}
                      >
                        <Icon className="h-5 w-5 shrink-0 text-primary mt-0.5" />
                        <div>
                          <div className="font-semibold text-xs leading-none mb-1">{item.label}</div>
                          <div className="text-[11px] text-muted-foreground">{item.desc}</div>
                        </div>
                      </Link>
                    )
                  })}
                  <Link
                    to={ROUTES.PUBLIC_EXPLORE}
                    onClick={() => setExploreOpen(false)}
                    className="mt-1 block border-t border-border pt-2 text-center text-xs font-bold text-primary hover:underline"
                  >
                    Ver tudo no diretório público →
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Quick Direct Link: Competições */}
          <Link
            to={ROUTES.COMPETITIONS}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors ${
              isActivePath(pathname, ROUTES.COMPETITIONS)
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            Competições
          </Link>

          {/* Quick Direct Link: Diretório */}
          <Link
            to={ROUTES.PUBLIC_EXPLORE}
            className={`rounded-lg px-3 py-2 text-sm font-semibold transition-colors flex items-center gap-1.5 ${
              isActivePath(pathname, ROUTES.PUBLIC_EXPLORE)
                ? 'text-primary'
                : 'text-on-surface-variant hover:text-on-surface'
            }`}
          >
            <Compass className="h-4 w-4 text-primary" />
            Diretório
          </Link>

          {/* Platform Sections Dropdown */}
          <div
            ref={platformRef}
            onMouseEnter={handlePlatformEnter}
            onMouseLeave={handlePlatformLeave}
            className="relative"
          >
            <button
              type="button"
              onClick={() => {
                setPlatformOpen((prev) => !prev)
                setExploreOpen(false)
              }}
              className={`flex cursor-pointer items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-primary ${
                platformOpen
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
              aria-expanded={platformOpen}
              aria-haspopup="true"
            >
              Plataforma
              <ChevronDown
                className={`h-4 w-4 transition-transform duration-200 ${
                  platformOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {platformOpen && (
              <div className="absolute left-0 top-full pt-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                <div className="w-56 rounded-2xl border border-border bg-card p-2 shadow-2xl">
                  {platformLinks.map((item) => (
                    <a
                      key={item.href}
                      href={item.href}
                      onClick={(event) => {
                        event.preventDefault()
                        handleAnchorClick(item.href)
                      }}
                      className="block rounded-xl px-3 py-2 text-xs font-medium text-foreground hover:bg-muted transition-colors cursor-pointer"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
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
            onClick={() => setMobileOpen((v) => !v)}
          >
            {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile menu drawer */}
        {mobileOpen && (
          <div className="absolute left-0 right-0 top-full border-b border-border bg-card p-4 shadow-2xl md:hidden animate-in slide-in-from-top-2 z-50">
            <div className="space-y-3">
              <p className="px-1 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Explorar Futebol
              </p>
              <div className="grid grid-cols-2 gap-2">
                {exploreLinks.map((item) => {
                  const Icon = item.icon
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => setMobileOpen(false)}
                      className={`flex items-center gap-2 rounded-xl p-2.5 text-xs font-semibold ${
                        isActivePath(pathname, item.href)
                          ? 'bg-primary/10 text-primary'
                          : 'text-foreground hover:bg-muted'
                      }`}
                    >
                      <Icon className="h-4 w-4 text-primary shrink-0" />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  )
                })}
              </div>

              <div className="pt-2">
                <Link
                  to={ROUTES.PUBLIC_EXPLORE}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center justify-between rounded-xl bg-primary/10 px-3 py-2.5 text-xs font-bold text-primary"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="h-4 w-4" />
                    Diretório Completo
                  </span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>

              <p className="px-1 pt-2 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Recursos da Plataforma
              </p>
              <div className="space-y-1">
                {platformLinks.map((item) => (
                  <a
                    key={item.href}
                    href={item.href}
                    onClick={(event) => {
                      event.preventDefault()
                      handleAnchorClick(item.href)
                      setMobileOpen(false)
                    }}
                    className="block rounded-lg px-2.5 py-1.5 text-xs font-medium text-foreground hover:bg-muted"
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
              <AuthActions />
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
