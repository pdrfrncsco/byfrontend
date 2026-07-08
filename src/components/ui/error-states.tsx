import { Shield, Search, AlertCircle } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Card } from './card'

/**
 * Estado de erro 403 - Permissão Negada
 * Exibido quando o utilizador não tem permissão para aceder a um recurso
 */
export interface PermissionDeniedProps {
  title?: string
  message?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function PermissionDenied({
  title = 'Acesso Negado',
  message = 'Não tem permissão para aceder a este recurso. Contacte o administrador da sua organização para obter acesso.',
  actionLabel = 'Voltar',
  onAction,
  className,
}: PermissionDeniedProps) {
  return (
    <Card
      role="alert"
      padding="lg"
      className={cn(
        'mx-auto flex max-w-lg flex-col items-center justify-center border-warning-container/40 py-16 text-center animate-fade-in',
        className,
      )}
    >
      <div className="mb-sm rounded-full border border-warning-container/30 bg-warning-container/20 p-lg text-warning">
        <Shield className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="space-y-sm">
        <h3 className="font-title-md text-xl text-on-warning-container">{title}</h3>
        <p className="max-w-sm text-body-md text-on-surface-variant">{message}</p>
      </div>

      {onAction && (
        <Button variant="secondary" size="sm" className="mt-md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}

/**
 * Estado de erro 404 - Não Encontrado
 * Exibido quando um recurso não existe
 */
export interface NotFoundProps {
  title?: string
  message?: string
  resourceName?: string
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function NotFound({
  title = 'Não Encontrado',
  message,
  resourceName = 'recurso',
  actionLabel = 'Voltar',
  onAction,
  className,
}: NotFoundProps) {
  const defaultMessage = `O ${resourceName} que procura não existe ou foi removido.`

  return (
    <Card
      role="alert"
      padding="lg"
      className={cn(
        'mx-auto flex max-w-lg flex-col items-center justify-center py-16 text-center animate-fade-in',
        className,
      )}
    >
      <div className="mb-sm rounded-full border border-outline-variant/30 bg-surface-container-high p-lg text-outline">
        <Search className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="space-y-sm">
        <h3 className="font-title-md text-xl text-on-surface">{title}</h3>
        <p className="max-w-sm text-body-md text-on-surface-variant">{message ?? defaultMessage}</p>
      </div>

      {onAction && (
        <Button variant="secondary" size="sm" className="mt-md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}

/**
 * Estado de erro 422 - Erro de Validação
 * Exibido quando há erros de validação do backend
 */
export interface ValidationErrorProps {
  title?: string
  message?: string
  errors?: string[]
  actionLabel?: string
  onAction?: () => void
  className?: string
}

export function ValidationError({
  title = 'Erro de Validação',
  message = 'Os dados fornecidos não são válidos.',
  errors,
  actionLabel = 'Corrigir',
  onAction,
  className,
}: ValidationErrorProps) {
  return (
    <Card
      role="alert"
      padding="lg"
      className={cn(
        'mx-auto flex max-w-lg flex-col items-center justify-center border-error-container/40 py-12 text-center animate-fade-in',
        className,
      )}
    >
      <div className="mb-sm rounded-full border border-error-container/30 bg-error-container/20 p-lg text-error">
        <AlertCircle className="h-10 w-10" aria-hidden="true" />
      </div>

      <div className="space-y-sm">
        <h3 className="font-title-md text-xl text-on-error-container">{title}</h3>
        <p className="max-w-sm text-body-md text-on-surface-variant">{message}</p>

        {errors && errors.length > 0 && (
          <ul className="mt-sm list-inside list-disc space-y-xs text-left text-sm text-on-surface-variant">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}
      </div>

      {onAction && (
        <Button variant="danger" size="sm" className="mt-md" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </Card>
  )
}

/**
 * Estado de erro 500 - Erro Interno
 * Exibido quando há um erro interno do servidor
 */
export interface ServerErrorProps {
  title?: string
  message?: string
  onRetry?: () => void
  className?: string
}

export function ServerError({
  title = 'Erro Interno',
  message = 'Ocorreu um erro interno no servidor. Por favor, tente novamente mais tarde.',
  onRetry,
  className,
}: ServerErrorProps) {
  return (
    <Card
      role="alert"
      padding="lg"
      className={cn(
        'mx-auto flex max-w-lg flex-col items-center justify-center border-error-container/40 py-16 text-center animate-fade-in',
        className,
      )}
    >
      <div className="mb-sm rounded-full border border-error-container/30 bg-error-container/20 p-lg text-error">
        <AlertCircle className="h-10 w-10" aria-hidden="true" />
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

/**
 * Utilitário para mapear códigos de erro HTTP para componentes
 */
export function getErrorComponent(statusCode: number) {
  switch (statusCode) {
    case 403:
      return PermissionDenied
    case 404:
      return NotFound
    case 422:
      return ValidationError
    case 500:
    default:
      return ServerError
  }
}
