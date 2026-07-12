import { User } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

interface PlayerEmptyStateProps {
  onReset?: () => void
  message?: string
}

export function PlayerEmptyState({ onReset, message }: PlayerEmptyStateProps) {
  return (
    <EmptyState
      icon={User}
      title="Nenhum jogador encontrado"
      description={message || "Tente alterar a pesquisa ou limpar os filtros para ver mais resultados."}
      action={
        onReset
          ? {
              label: 'Limpar filtros',
              onClick: onReset,
              variant: 'secondary',
            }
          : undefined
      }
    />
  )
}
