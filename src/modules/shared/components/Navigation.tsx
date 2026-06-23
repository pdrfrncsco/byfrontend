interface NavigationProps {
  onNavClick?: (path: string) => void
}

export function Navigation({ onNavClick }: NavigationProps) {
  const navLinks = [
    { label: 'Directory', href: '#directory', active: true },
    { label: 'Live Matches', href: '#matches' },
    { label: 'Scouting', href: '#scouting' },
    { label: 'Transfers', href: '#transfers' },
  ]

  return (
    <header className="sticky top-0 z-50 bg-surface-container-low border-b border-outline-variant">
      <nav className="flex justify-between items-center w-full px-xl py-md max-w-container-max mx-auto">
        {/* Logo */}
        <div className="flex items-center gap-lg">
          <span className="font-display-lg text-headline-lg-mobile text-primary tracking-widest">
            BOLAYETU
          </span>
          <div className="hidden md:flex gap-md ml-xl font-title-md text-title-md">
            {navLinks.map(link => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => onNavClick?.(link.href)}
                className={`transition-colors pb-base ${
                  link.active
                    ? 'text-primary border-b-2 border-primary font-bold'
                    : 'text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {link.label}
              </a>
            ))}
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-md">
          <button className="hidden lg:block text-on-surface hover:bg-surface-container-high px-md py-sm rounded-full transition-all font-title-md text-title-md">
            Enterprise Login
          </button>
          <button className="bg-primary text-on-primary-fixed font-bold px-lg py-sm rounded-full hover:bg-opacity-90 transition-all font-title-md text-title-md">
            Join Ecosystem
          </button>
          <div className="flex items-center gap-sm ml-md">
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">
              notifications
            </span>
            <span className="material-symbols-outlined text-on-surface-variant cursor-pointer hover:text-primary">
              account_circle
            </span>
          </div>
        </div>
      </nav>
    </header>
  )
}
