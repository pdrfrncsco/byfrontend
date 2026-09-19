import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Building, Hash, ArrowUpRight, CheckCircle2, Clock, AlertCircle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { playerRoutes } from '../../routes'
import type { Player, PlayerCurrentClub, PlayerLinkStatus, PlayerRegistration } from '../../types'

export interface PlayerRegistrationCardProps {
  player: Player
  currentClub?: PlayerCurrentClub | null
  linkStatus?: PlayerLinkStatus
  activeRegistration?: PlayerRegistration | null
  onManageLink?: () => void
  className?: string
}

export function PlayerRegistrationCard({
  player,
  currentClub,
  linkStatus = 'none',
  activeRegistration,
  onManageLink,
  className = '',
}: PlayerRegistrationCardProps) {
  const club = currentClub || player.current_club
  const shirtNumber = activeRegistration?.shirt_number ?? club?.shirt_number ?? player.shirt_number

  const getLinkStatusBadge = () => {
    switch (linkStatus) {
      case 'active':
        return (
          <Badge variant="success" className="gap-1 text-[11px]">
            <CheckCircle2 className="h-3 w-3" />
            Federado
          </Badge>
        )
      case 'pending_approval':
        return (
          <Badge variant="warning" className="gap-1 text-[11px]">
            <Clock className="h-3 w-3" />
            Aprovação Pendente
          </Badge>
        )
      case 'rejected':
      case 'terminated':
        return (
          <Badge variant="danger" className="gap-1 text-[11px]">
            <AlertCircle className="h-3 w-3" />
            Vínculo Inativo
          </Badge>
        )
      default:
        return (
          <Badge variant="secondary" className="gap-1 text-[11px]">
            Sem Vínculo
          </Badge>
        )
    }
  }

  return (
    <Card variant="flat" padding="none" className={`border-outline-variant/30 bg-surface shadow-xs ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 px-lg py-md">
        <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
          <Shield className="h-4 w-4 text-primary" />
          Filiação & Inscrição
        </CardTitle>
        {getLinkStatusBadge()}
      </CardHeader>

      <CardContent className="space-y-md p-lg">
        <div className="flex items-center gap-md">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary-container/20 text-primary">
            <Building className="h-6 w-6" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-base font-bold text-on-surface">
              {club?.name || 'Agente Livre / Sem Clube'}
            </p>
            <p className="text-xs text-on-surface-variant">
              {club?.registered_since
                ? `Inscrito desde ${new Date(club.registered_since).toLocaleDateString('pt-PT')}`
                : 'Nenhum clube oficial associado'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-sm rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md text-xs">
          <div>
            <span className="text-on-surface-variant">Dorsal / Camisa:</span>
            <div className="mt-0.5 flex items-center gap-1 font-semibold text-on-surface">
              <Hash className="h-3.5 w-3.5 text-primary" />
              {shirtNumber ? `#${shirtNumber}` : '—'}
            </div>
          </div>
          <div>
            <span className="text-on-surface-variant">Posição Registada:</span>
            <div className="mt-0.5 font-semibold text-on-surface">
              {player.position_label || player.primary_position}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-xs pt-xs">
          {onManageLink ? (
            <Button variant="outline" size="sm" onClick={onManageLink} className="w-full gap-xs text-xs">
              Gerir Vínculo
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="w-full gap-xs text-xs">
              <Link to={playerRoutes.linkClub}>
                Gerir Filiação ao Clube
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
