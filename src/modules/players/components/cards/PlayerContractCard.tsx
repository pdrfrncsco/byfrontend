import React from 'react'
import { FileText, Calendar, AlertTriangle, CheckCircle2, Clock, XCircle, ArrowUpRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent, Badge, Button } from '@/components/ui'
import type { PlayerContract, ContractStatus, ContractType } from '../../types'

export interface PlayerContractCardProps {
  contract?: PlayerContract | null
  isLoading?: boolean
  onRenew?: () => void
  onViewDetails?: () => void
  className?: string
}

const CONTRACT_TYPE_LABELS: Record<ContractType, string> = {
  professional: 'Profissional',
  youth: 'Formação / Jovem',
  amateur: 'Amador',
  short_term: 'Curta Duração',
  trial: 'Período Experimental',
  loan: 'Empréstimo',
  extension: 'Extensão',
}

const STATUS_CONFIG: Record<ContractStatus, { label: string; variant: 'success' | 'warning' | 'danger' | 'secondary' }> = {
  active: { label: 'Em Vigor', variant: 'success' },
  draft: { label: 'Rascunho', variant: 'secondary' },
  expired: { label: 'Expirado', variant: 'danger' },
  terminated: { label: 'Rescindido', variant: 'danger' },
  suspended: { label: 'Suspenso', variant: 'warning' },
}

export function PlayerContractCard({
  contract,
  isLoading = false,
  onRenew,
  onViewDetails,
  className = '',
}: PlayerContractCardProps) {
  if (isLoading) {
    return (
      <Card variant="flat" padding="none" className={`border-outline-variant/30 bg-surface shadow-xs ${className}`}>
        <CardContent className="p-lg">
          <div className="flex animate-pulse items-center gap-md">
            <div className="h-10 w-10 rounded-xl bg-surface-container/60" />
            <div className="flex-1 space-y-2">
              <div className="h-4 w-1/3 rounded bg-surface-container/60" />
              <div className="h-3 w-1/2 rounded bg-surface-container/40" />
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!contract) {
    return (
      <Card variant="flat" padding="none" className={`border-outline-variant/30 bg-surface shadow-xs ${className}`}>
        <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 px-lg py-md">
          <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
            <FileText className="h-4 w-4 text-primary" />
            Contrato Desportivo
          </CardTitle>
          <Badge variant="secondary" className="text-[11px]">Sem Contrato Ativo</Badge>
        </CardHeader>
        <CardContent className="space-y-md p-lg">
          <p className="text-xs text-on-surface-variant">
            Nenhum contrato desportivo ativo associado a este atleta. Pode registar um contrato profissional, amador ou de formação.
          </p>
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails} className="w-full gap-xs text-xs">
              Ver Histórico de Contratos
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </CardContent>
      </Card>
    )
  }

  const statusInfo = STATUS_CONFIG[contract.status] || { label: contract.status, variant: 'secondary' }
  const endDate = new Date(contract.end_date)
  const today = new Date()
  const monthsRemaining = Math.round((endDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24 * 30.4))
  const isExpiringSoon = monthsRemaining > 0 && monthsRemaining <= 6
  const isExpired = contract.status === 'expired' || endDate.getTime() < today.getTime()

  const clubName = typeof contract.club === 'object' && contract.club !== null
    ? contract.club.name
    : contract.club_name || 'Clube Empregador'

  return (
    <Card variant="flat" padding="none" className={`border-outline-variant/30 bg-surface shadow-xs ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between border-b border-outline-variant/20 px-lg py-md">
        <CardTitle className="flex items-center gap-xs text-sm font-semibold text-on-surface">
          <FileText className="h-4 w-4 text-primary" />
          Contrato Desportivo
        </CardTitle>
        <Badge variant={statusInfo.variant} className="text-[11px]">
          {statusInfo.label}
        </Badge>
      </CardHeader>

      <CardContent className="space-y-md p-lg">
        <div>
          <div className="flex items-center justify-between">
            <p className="text-base font-bold text-on-surface">{clubName}</p>
            <Badge variant="outline" className="text-[10px]">
              {CONTRACT_TYPE_LABELS[contract.contract_type] || contract.contract_type}
            </Badge>
          </div>
          <p className="flex items-center gap-xs text-xs text-on-surface-variant mt-0.5">
            <Calendar className="h-3.5 w-3.5" />
            <span>{new Date(contract.start_date).toLocaleDateString('pt-PT')}</span>
            <span>até</span>
            <span className="font-semibold text-on-surface">{endDate.toLocaleDateString('pt-PT')}</span>
          </p>
        </div>

        {isExpiringSoon && !isExpired && (
          <div className="flex items-center gap-xs rounded-lg border border-amber-500/20 bg-amber-500/10 p-sm text-xs text-amber-600">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            <span>Expira em {monthsRemaining} {monthsRemaining === 1 ? 'mês' : 'meses'} (Regra FIFA RSTP Art. 18.3)</span>
          </div>
        )}

        <div className="grid grid-cols-2 gap-sm rounded-xl border border-outline-variant/20 bg-surface-container/30 p-md text-xs">
          <div>
            <span className="text-on-surface-variant">Assinatura Atleta:</span>
            <div className="mt-0.5 flex items-center gap-1 font-medium">
              {contract.signed_by_player ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Assinado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="h-3.5 w-3.5" /> Pendente
                </span>
              )}
            </div>
          </div>
          <div>
            <span className="text-on-surface-variant">Assinatura Clube:</span>
            <div className="mt-0.5 flex items-center gap-1 font-medium">
              {contract.signed_by_club ? (
                <span className="flex items-center gap-1 text-emerald-600">
                  <CheckCircle2 className="h-3.5 w-3.5" /> Assinado
                </span>
              ) : (
                <span className="flex items-center gap-1 text-amber-600">
                  <Clock className="h-3.5 w-3.5" /> Pendente
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-xs pt-xs">
          {onViewDetails && (
            <Button variant="outline" size="sm" onClick={onViewDetails} className="w-full gap-xs text-xs">
              Ver Contrato Completo
              <ArrowUpRight className="h-3.5 w-3.5" />
            </Button>
          )}
          {onRenew && isExpiringSoon && (
            <Button size="sm" onClick={onRenew} className="gap-xs text-xs">
              Renovar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
