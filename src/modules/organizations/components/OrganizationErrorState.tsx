import { AlertTriangle, RotateCcw } from 'lucide-react'
import { cn } from '@/lib/utils'

interface OrganizationErrorStateProps {
  message?: string
  onRetry?: () => void
  className?: string
}

export function OrganizationErrorState({
  message = 'Ocorreu um erro ao carregar as informações. Por favor, verifique a sua ligação.',
  onRetry,
  className
}: OrganizationErrorStateProps) {
  return (
    <div
      className={cn(
        "glass-card p-xl border border-error-container/40 rounded-xl text-center flex flex-col items-center justify-center max-w-lg mx-auto py-12 space-y-md animate-fade-in",
        className
      )}
      role="alert"
    >
      <div className="p-md rounded-full bg-error-container/20 border border-error-container/30 text-error mb-sm animate-bounce">
        <AlertTriangle className="w-8 h-8" />
      </div>

      <div className="space-y-sm">
        <h3 className="font-title-md text-xl text-[#ffdad6]">Falha de Comunicação</h3>
        <p className="text-body-md text-on-surface-variant max-w-sm">
          {message}
        </p>
      </div>

      {onRetry && (
        <button
          onClick={onRetry}
          className="inline-flex items-center gap-sm px-lg py-sm bg-error-container text-[#ffdad6] border border-error/30 rounded-lg hover:bg-error-container/80 transition-all font-semibold text-sm mt-md"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Tentar Novamente</span>
        </button>
      )}
    </div>
  )
}
