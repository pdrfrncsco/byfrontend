import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SportListLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  count?: number
  filters?: React.ReactNode
  pagination?: React.ReactNode
  breadcrumb?: React.ReactNode
}

/**
 * Layout for list pages without a hero banner.
 */
export const SportListLayout = React.forwardRef<HTMLDivElement, SportListLayoutProps>(
  ({ title, count, filters, pagination, breadcrumb, children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('min-h-screen bg-background', className)} {...props}>
        {breadcrumb && (
          <nav className="max-w-7xl mx-auto px-lg py-sm text-sm text-on-surface-variant">
            {breadcrumb}
          </nav>
        )}
        <div className="max-w-7xl mx-auto px-lg py-md">
          <div className="flex items-center justify-between mb-md">
            <div className="flex items-center gap-sm">
              <h1 className="text-xl font-bold text-on-surface">{title}</h1>
              {count != null && (
                <span className="text-sm text-on-surface-variant">({count})</span>
              )}
            </div>
          </div>
          {filters && <div className="mb-md">{filters}</div>}
          {children}
          {pagination && <div className="mt-lg">{pagination}</div>}
        </div>
      </div>
    )
  }
)
SportListLayout.displayName = 'SportListLayout'
