import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeftRight, CheckCircle2, Clock, Globe2, AlertCircle, ArrowUpRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import { playerRoutes } from '../../routes'
import type { PlayerStatus } from '../../types'

export type PlayerMarketStatus = 'free_agent' | 'under_contract' | 'transfer_listed' | 'loan_listed'

export interface PlayerTransferStatusProps {
  playerStatus: PlayerStatus
  marketStatus?: PlayerMarketStatus
  estimatedValue?: number | string | null
  transferWindowOpen?: boolean
  pendingRequestsCount?: number
  onOpenTransfersCenter?: () => void
  className?: string
}

const MARKET_STATUS_CONFIG: Record<PlayerMarketStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary'; description: string }> = {
  free_agent: {
    label: 'Passe Livre',
    variant: 'success',
    description: 'Disponível para contratação imediata sem taxa de transferência.',
  },
  under_contract: {
    label: 'Sob Vínculo',
    variant: 'secondary',
    description: 'Vinculado a um clube desportivo federado.',
  },
  transfer_listed: {
    label: 'Na Lista de Transferências',
    variant: 'warning',
    description: 'Clube aberto a propostas de transferência definitiva.',
  },
  loan_listed: {
    label: 'Disponível para Empréstimo',
    variant: 'warning',
    description: 'Clube aberto a cedência temporária / rodagem.',
  },
}

export function PlayerTransferStatus({
  playerStatus,
  marketStatus = 'under_contract',
  estimatedValue,
  transferWindowOpen = true,
  pendingRequestsCount = 0,
  onOpenTransfersCenter,
  className = '',
}: PlayerTransferStatusProps) {
  const resolvedMarketStatus: PlayerMarketStatus = playerStatus === 'inactive' || playerStatus === 'retired'
    ? 'free_agent'
    : marketStatus

  const statusConfig = MARKET_STATUS_CONFIG[resolvedMarketStatus] || MARKET_STATUS_CONFIG.under_contract

  return (
    <Card variant="flat" padding="none" className={`border-outline-variant/30 bg-surface shadow-xs ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 px-lg py-md">
        <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
          <ArrowLeftRight className="h-4 w-4 text-primary" />
          Mercado de Transferências
        </CardTitle>
        <Badge variant={statusConfig.variant} className="text-[11px]">
          {statusConfig.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-md p-lg">
        <p className="text-xs text-on-surface-variant">
          {statusConfig.description}
        </p>

        <div className="grid grid-cols-2 gap-sm rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md text-xs">
          <div>
            <span className="text-on-surface-variant">Janela de Inscrições:</span>
            <div className="mt-0.5 flex items-center gap-1 font-semibold text-on-surface">
              {transferWindowOpen ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Aberta
                </span>
              ) : (
                <span className="flex items-center gap-1 text-on-surface-variant">
                  <Clock className="h-3.5 w-3.5" /> Fechada
                </span>
              )}
            </div>
          </div>

          <div>
            <span className="text-on-surface-variant">Propostas em Curso:</span>
            <div className="mt-0.5 flex items-center gap-1 font-semibold text-on-surface">
              {pendingRequestsCount > 0 ? (
                <Badge variant="warning" className="text-[10px]">
                  {pendingRequestsCount} pendente(s)
                </Badge>
              ) : (
                <span className="text-on-surface-variant">Nenhuma</span>
              )}
            </div>
          </div>
        </div>

        <div className="pt-xs">
          {onOpenTransfersCenter ? (
            <Button variant="outline" size="sm" onClick={onOpenTransfersCenter} className="w-full gap-xs text-xs">
              <Globe2 className="h-3.5 w-3.5" />
              Centro de Transferências
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          ) : (
            <Button asChild variant="outline" size="sm" className="w-full gap-xs text-xs">
              <Link to={playerRoutes.transfers}>
                <Globe2 className="h-3.5 w-3.5" />
                Centro de Transferências
                <ArrowUpRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
