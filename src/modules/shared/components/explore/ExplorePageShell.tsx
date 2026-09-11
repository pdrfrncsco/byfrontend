import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'
import { ChevronRight } from 'lucide-react'

interface ExploreBreadcrumb {
  label: string
  href?: string
}

interface ExplorePageShellProps {
  children: ReactNode
  breadcrumbs?: ExploreBreadcrumb[]
  eyebrow?: string
  title?: string
  description?: string
  actions?: ReactNode
  hero?: ReactNode
}

export function ExplorePageShell({
  children,
  breadcrumbs = [],
  eyebrow,
  title,
  description,
  actions,
  hero,
}: ExplorePageShellProps) {
  return (
    <main className="relative mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 md:py-8">
      <div className="relative z-10">
        <nav aria-label="Breadcrumb" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs sm:text-sm text-on-surface-variant">
          <Link
            to={ROUTES.PUBLIC_EXPLORE}
            className="font-medium transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm"
          >
            Explorar
          </Link>
          {breadcrumbs.map((breadcrumb, index) => (
            <span key={`${breadcrumb.label}-${index}`} className="inline-flex items-center gap-1.5">
              <ChevronRight className="h-3.5 w-3.5 text-on-surface-variant/50" aria-hidden="true" />
              {breadcrumb.href ? (
                <Link to={breadcrumb.href} className="font-medium text-on-surface-variant transition-colors hover:text-primary">
                  {breadcrumb.label}
                </Link>
              ) : (
                <span aria-current="page" className="font-medium text-on-surface">
                  {breadcrumb.label}
                </span>
              )}
            </span>
          ))}
        </nav>

        {hero ?? (
          <header className="mb-8 flex flex-col gap-4 rounded-2xl border border-outline-variant/20 bg-surface-container p-6 sm:p-8 shadow-sm md:flex-row md:items-end md:justify-between">
            <div className="max-w-3xl">
              {eyebrow && (
                <p className="mb-2 text-xs font-bold uppercase tracking-wider text-primary">
                  {eyebrow}
                </p>
              )}
              {title && (
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-on-surface">
                  {title}
                </h1>
              )}
              {description && (
                <p className="mt-2 text-sm sm:text-base leading-relaxed text-on-surface-variant">
                  {description}
                </p>
              )}
            </div>
            {actions && <div className="flex shrink-0 flex-wrap items-center gap-2">{actions}</div>}
          </header>
        )}

        {children}
      </div>
    </main>
  )
}
