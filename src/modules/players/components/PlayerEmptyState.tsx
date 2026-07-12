import { User } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { EmptyState } from '@/components/ui/empty-state'

interface PlayerEmptyStateProps {
  onReset?: () => void
  message?: string
}

export function PlayerEmptyState({ onReset, message }: PlayerEmptyStateProps) {
  const { t } = useTranslation()

  return (
    <EmptyState
      icon={User}
      title={t('players.empty.title')}
      description={message || t('players.empty.description')}
      action={
        onReset
          ? {
              label: t('players.empty.clearFilters'),
              onClick: onReset,
              variant: 'secondary',
            }
          : undefined
      }
    />
  )
}
