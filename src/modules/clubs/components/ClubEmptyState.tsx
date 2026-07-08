import { Building2 } from 'lucide-react'
import { EmptyState } from '@/components/ui/empty-state'

export function ClubEmptyState({ onReset }: { onReset?: () => void }) {
  return (
    <EmptyState
      icon={Building2}
      title="Nenhum clube encontrado"
      description="Tente alterar a pesquisa ou limpar os filtros para ver mais resultados."
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
