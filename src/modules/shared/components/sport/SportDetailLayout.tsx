import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SportDetailLayoutProps extends React.HTMLAttributes<HTMLDivElement> {
  header: React.ReactNode
  main: React.ReactNode
  sidebar: React.ReactNode
  breadcrumb?: React.ReactNode
}

/**
 * 2-column layout for sport detail pages.
 */
export const SportDetailLayout = React.forwardRef<HTMLDivElement, SportDetailLayoutProps>(
  ({ header, main, sidebar, breadcrumb, className, ...props }, ref) => {
    return (
      <div ref={ref} className={cn('min-h-screen bg-background', className)} {...props}>
        {breadcrumb && (
          <nav className="max-w-7xl mx-auto px-lg py-sm">
            {breadcrumb}
          </nav>
        )}
        <div className="max-w-7xl mx-auto px-lg">
          {header}
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-lg mt-lg">
            <main>{main}</main>
            <aside>{sidebar}</aside>
          </div>
        </div>
      </div>
    )
  }
)
SportDetailLayout.displayName = 'SportDetailLayout'
