import type { ReactNode } from 'react'

interface ExploreSectionProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function ExploreSection({ title, description, action, children, className = '' }: ExploreSectionProps) {
  return (
    <section className={className}>
      <div className="mb-lg flex flex-col gap-sm sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="text-xl font-bold text-on-surface md:text-2xl">{title}</h2>
          {description && <p className="mt-xs text-sm text-on-surface-variant">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  )
}
