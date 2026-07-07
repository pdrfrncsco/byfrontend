import * as React from 'react'
import { type LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Card } from './card'

export interface EmptyStateProps {
  title: string
  description: string
  icon?: LucideIcon
  iconClassName?: string
  action?: {
    label: string
    onClick: () => void
    variant?: React.ComponentProps<typeof Button>['variant']
  }
  className?: string
}

export function EmptyState({
  title,
  description,
  icon: Icon,
  iconClassName,
  action,
  className,
}: EmptyStateProps) {
  return (
    <Card
      role="status"
      padding="lg"
      className={cn(
        'mx-auto flex max-w-lg flex-col items-center justify-center py-16 text-center animate-fade-in',
        className,
      )}
    >
      {Icon && (
        <div className="mb-sm rounded-full border border-outline-variant/40 bg-surface-bright p-lg text-outline">
          <Icon className={cn('h-8 w-8 text-primary', iconClassName)} aria-hidden="true" />
        </div>
      )}

      <div className="space-y-sm">
        <h3 className="font-title-md text-xl text-on-surface">{title}</h3>
        <p className="max-w-sm text-body-md text-on-surface-variant">{description}</p>
      </div>

      {action && (
        <Button variant={action.variant ?? 'primary'} size="sm" className="mt-md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </Card>
  )
}

export interface ErrorStateProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ErrorState({
  title = 'Falha de Comunicação',
  message = 'Ocorreu um erro ao carregar as informações. Por favor, verifique a sua ligação.',
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <Card
      role="alert"
      padding="lg"
      className={cn(
        'mx-auto flex max-w-lg flex-col items-center justify-center border-error-container/40 py-12 text-center animate-fade-in',
        className,
      )}
    >
      <div className="mb-sm animate-bounce rounded-full border border-error-container/30 bg-error-container/20 p-md text-error">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
          <path d="M12 9v4" />
          <path d="M12 17h.01" />
        </svg>
      </div>

      <div className="space-y-sm">
        <h3 className="font-title-md text-xl text-on-error-container">{title}</h3>
        <p className="max-w-sm text-body-md text-on-surface-variant">{message}</p>
      </div>

      {onRetry && (
        <Button variant="danger" size="sm" className="mt-md gap-sm" onClick={onRetry}>
          Tentar Novamente
        </Button>
      )}
    </Card>
  )
}
