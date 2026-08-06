import { Badge } from '@/components/ui'
import type { PlayerLinkStatus } from '../types'

interface PlayerLinkStatusBadgeProps {
  status: PlayerLinkStatus | string | null | undefined
  className?: string
}

export function PlayerLinkStatusBadge({ status, className }: PlayerLinkStatusBadgeProps) {
  const normalizedStatus = (status || 'none').toLowerCase()

  switch (normalizedStatus) {
    case 'active':
    case 'linked':
      return (
        <Badge variant="success" className={className}>
          Vinculado
        </Badge>
      )
    case 'pending':
    case 'pending_approval':
      return (
        <Badge variant="warning" className={className}>
          Solicitação Pendente
        </Badge>
      )
    case 'rejected':
      return (
        <Badge variant="destructive" className={className}>
          Rejeitado
        </Badge>
      )
    case 'terminated':
      return (
        <Badge variant="secondary" className={className}>
          Desvinculado
        </Badge>
      )
    case 'none':
    default:
      return (
        <Badge variant="outline" className={className}>
          Jogador Livre
        </Badge>
      )
  }
}
