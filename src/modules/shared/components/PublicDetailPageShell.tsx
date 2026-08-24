import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ROUTES } from '@/constants'

interface PublicDetailPageShellProps {
  children: ReactNode
  breadcrumb?: ReactNode
  className?: string
}

export function PublicDetailPageShell({ children, breadcrumb, className = '' }: PublicDetailPageShellProps) {
  return (
    <main className="relative min-h-screen overflow-hidden bg-background text-on-surface">
      <div className="pointer-events-none absolute -top-40 -left-40 h-80 w-80 rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-600/20 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-80 w-80 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-600/20 blur-3xl" />

      <div className={`relative z-10 mx-auto max-w-6xl px-md py-xl sm:px-xl space-y-xl ${className}`}>
        {breadcrumb ?? (
          <nav aria-label="Breadcrumb" className="mb-xl flex items-center gap-xs text-sm text-on-surface-variant">
            <Link to={ROUTES.PUBLIC_EXPLORE} className="hover:text-primary">Explorar</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page" className="truncate text-on-surface">Detalhe</span>
          </nav>
        )}
        {children}
      </div>
    </main>
  )
}
