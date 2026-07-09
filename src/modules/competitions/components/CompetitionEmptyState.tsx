import { Trophy } from 'lucide-react'
import { EmptyState } from '@/components/ui'

interface CompetitionEmptyStateProps {
  hasFilters?: boolean
  onClearFilters?: () => void
}

export function CompetitionEmptyState({ hasFilters, onClearFilters }: CompetitionEmptyStateProps) {
  return (
    <EmptyState
      icon={Trophy}
      title={hasFilters ? 'Sem resultados' : 'Nenhuma competição disponível'}
      description={
        hasFilters
          ? 'Não foram encontradas competições com os filtros selecionados. Tente ajustar a pesquisa.'
          : 'Ainda não existem competições registadas na plataforma.'
      }
      action={
        hasFilters && onClearFilters
          ? { label: 'Limpar filtros', onClick: onClearFilters }
          : undefined
      }
    />
  )
}
