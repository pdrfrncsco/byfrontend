import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

interface ExploreBreadcrumb {
  label: string
  href?: string
}

interface ExplorePageShellProps {
  children: ReactNode
  breadcrumbs?: ExploreBreadcrumb[]
  eyebrow?: string
  title: string
  description?: string
  actions?: ReactNode
}

export function ExplorePageShell({
  children,
  breadcrumbs = [],
  eyebrow,
  title,
  description,
  actions,
}: ExplorePageShellProps) {
  return (
    <main className="mx-auto w-full max-w-container-max px-gutter pb-2xl pt-xl md:pt-2xl">
      <nav aria-label="Breadcrumb" className="mb-md flex flex-wrap items-center gap-xs text-sm text-on-surface-variant">
        <Link to={ROUTES.PUBLIC_EXPLORE} className="font-medium text-on-surface-variant transition-colors hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary rounded-sm">
          Explorar
        </Link>
        {breadcrumbs.map((breadcrumb, index) => (
          <span key={`${breadcrumb.label}-${index}`} className="inline-flex items-center gap-xs">
            <span aria-hidden="true" className="text-on-surface-variant/70">/</span>
            {breadcrumb.href ? (
              <Link to={breadcrumb.href} className="font-medium text-on-surface-variant transition-colors hover:text-primary">{breadcrumb.label}</Link>
            ) : (
              <span aria-current="page" className="font-medium text-on-surface">{breadcrumb.label}</span>
            )}
          </span>
        ))}
      </nav>

      <header className="mb-2xl flex flex-col gap-lg border-b border-outline-variant pb-xl md:flex-row md:items-end md:justify-between">
        <div className="max-w-4xl">
          {eyebrow && <p className="mb-sm text-[11px] font-bold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
          <h1 className="max-w-4xl font-display-lg text-[2.6rem] leading-[0.92] tracking-[-0.05em] text-on-surface md:text-[5rem]">{title}</h1>
          {description && <p className="mt-md max-w-3xl text-base leading-relaxed text-on-surface-variant md:text-[1.125rem]">{description}</p>}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap items-center gap-sm">{actions}</div>}
      </header>

      {children}
    </main>
  )
}
