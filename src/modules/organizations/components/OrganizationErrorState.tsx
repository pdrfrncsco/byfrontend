import { ErrorState } from '@/components/ui'
import { cn } from '@/lib/utils'

interface OrganizationErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function OrganizationErrorState({
  message = 'Ocorreu um erro ao carregar as informações. Por favor, verifique a sua ligação.',
  onRetry,
  className,
}: OrganizationErrorStateProps) {
  return <ErrorState message={message} onRetry={onRetry} className={cn(className)} />
}
