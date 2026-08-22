import * as React from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export function DashboardBreadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split('/').filter((x) => x)

  return (
    <nav className="hidden md:flex items-center gap-sm text-xs text-on-surface-variant">
      <Link to="/" className="hover:text-primary transition-colors">Início</Link>
      {pathnames.map((value, index) => {
        const to = `/${pathnames.slice(0, index + 1).join('/')}`
        const isLast = index === pathnames.length - 1
        const label = value.charAt(0).toUpperCase() + value.slice(1)

        // Ignore UUIDs / IDs in breadcrumb trail
        if (value.match(/^[0-9a-fA-F-]{24,36}$/)) return null

        return (
          <span key={to} className="flex items-center gap-sm">
            <ChevronRight className="h-3 w-3" />
            {isLast ? (
              <span className="font-semibold text-primary">{label}</span>
            ) : (
              <Link to={to} className="hover:text-primary transition-colors">{label}</Link>
            )}
          </span>
        )
      })}
    </nav>
  )
}
