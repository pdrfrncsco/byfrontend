import { Award, Search } from 'lucide-react'
import { EmptyState } from '@/components/ui'
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
  className,
}: OrganizationEmptyStateProps) {
  return (
    <EmptyState
      title={title}
      description={description}
      icon={iconType === 'search' ? Search : Award}
      iconClassName={iconType === 'trophy' ? 'text-tertiary' : undefined}
      action={action}
      className={cn(className)}
    />
  )
}
