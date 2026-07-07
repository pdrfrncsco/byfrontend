import { Award, Search } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrganizationEmptyStateProps {
  title: string
  description: string
  iconType?: 'search' | 'trophy'
  action?: {
    label: string
    onClick: () => void
  }
  className?: string
}

export function OrganizationEmptyState({
  title,
  description,
  iconType = 'search',
  action,
  className
}: OrganizationEmptyStateProps) {
  return (
    <div
      className={cn(
        "glass-card p-xl border border-outline-variant/30 rounded-xl text-center flex flex-col items-center justify-center max-w-lg mx-auto py-16 space-y-md animate-fade-in",
        className
      )}
      role="status"
    >
      <div className="p-lg rounded-full bg-surface-bright border border-outline-variant/40 text-outline mb-sm">
        {iconType === 'search' ? (
          <Search className="w-8 h-8 text-primary" />
        ) : (
          <Award className="w-8 h-8 text-tertiary" />
        )}
      </div>

      <div className="space-y-sm">
        <h3 className="font-title-md text-xl text-on-surface">{title}</h3>
        <p className="text-body-md text-on-surface-variant max-w-sm">
          {description}
        </p>
      </div>

      {action && (
        <button
          onClick={action.onClick}
          className="btn-primary mt-md py-sm px-lg text-sm rounded-lg hover:brightness-110 transition-all font-semibold"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}
