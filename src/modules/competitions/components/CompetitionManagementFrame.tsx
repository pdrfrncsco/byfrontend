import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CompetitionManagementFrameProps {
  backTo: string
  backLabel: string
  badge: ReactNode
  title: ReactNode
  description?: ReactNode
  children: ReactNode
  contentClassName?: string
}

export function CompetitionManagementFrame({
  backTo,
  backLabel,
  badge,
  title,
  description,
  children,
  contentClassName,
}: CompetitionManagementFrameProps) {
  return (
    <div className="container py-xl space-y-xl">
      <Link
        to={backTo}
        className="inline-flex items-center gap-xs text-sm text-on-surface-variant transition-colors hover:text-on-surface"
      >
        <ChevronLeft className="h-4 w-4" />
        {backLabel}
      </Link>

      <div className="space-y-xs">
        <div className="inline-flex items-center gap-sm rounded-full border border-primary/15 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-widest text-primary">
          {badge}
        </div>
        <h1 className="text-2xl font-bold text-on-surface">{title}</h1>
        {description ? <p className="text-sm text-on-surface-variant">{description}</p> : null}
      </div>

      <div className={cn('space-y-xl', contentClassName)}>{children}</div>
    </div>
  )
}
