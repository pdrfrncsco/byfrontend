import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { AlertCircle, ArrowRight, Calendar, DollarSign, Plus, Trash2 } from 'lucide-react'
import {
  usePlayerTransfers,
  getTransferStatusInfo,
  getTransferTypeLabel,
  formatTransferFee,
  getDaysUntilEffective,
  canCancelTransfer,
  type PlayerTransfer,
} from '../../hooks/usePlayerTransfers'

interface PlayerTransferSectionProps {
  playerId: string
  onAddTransfer?: () => void
  onSelectTransfer?: (transfer: PlayerTransfer) => void
  onCancelTransfer?: (transferId: string) => Promise<void>
  readOnly?: boolean
}

export function PlayerTransferSection({
  playerId,
  onAddTransfer,
  onSelectTransfer,
  onCancelTransfer,
  readOnly = false,
}: PlayerTransferSectionProps) {
  const { t } = useTranslation()
  const { data, isLoading, error } = usePlayerTransfers(playerId)

  const transfers = useMemo(() => (Array.isArray(data) ? data : (data as { results?: PlayerTransfer[] } | undefined)?.results ?? []), [data])
  const pendingTransfers = useMemo(
    () => transfers.filter((t) => ['requested', 'pending'].includes(t.status)),
    [transfers]
  )
  const activeTransfer = useMemo(
    () => transfers.find((t) => t.status === 'approved' || t.status === 'completed'),
    [transfers]
  )

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Transferências</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-lg">
          <div className="text-sm text-on-surface-variant">Carregando transferências...</div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="border-error/20">
        <CardHeader>
          <CardTitle className="text-error">Erro ao Carregar Transferências</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-on-surface-variant">
            Não foi possível carregar as transferências. Tente novamente mais tarde.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-lg">
      {/* Pending Transfer Alerts */}
      {pendingTransfers.length > 0 && (
        <div className="space-y-md">
          {pendingTransfers.map((transfer) => {
            const statusInfo = getTransferStatusInfo(transfer.status)
            const daysUntil = getDaysUntilEffective(transfer.effective_date)

            return (
              <Card key={transfer.id} className={`border-l-4 ${statusInfo.color.replace('text-', 'border-')}`}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-md">
                        <span className="text-2xl">{statusInfo.icon}</span>
                        {statusInfo.label}
                      </CardTitle>
                      <CardDescription>
                        {transfer.from_club.name} → {transfer.to_club.name}
                      </CardDescription>
                    </div>
                    <Badge className={`${statusInfo.bgColor} ${statusInfo.color}`}>
                      {getTransferTypeLabel(transfer.transfer_type)}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-md">
                  <div className="grid gap-md sm:grid-cols-3">
                    {transfer.effective_date && (
                      <div>
                        <p className="text-xs text-on-surface-variant">Data Efetiva</p>
                        <p className="text-sm font-semibold text-on-surface">
                          {new Date(transfer.effective_date).toLocaleDateString('pt-PT')}
                        </p>
                        {daysUntil !== null && (
                          <p className="text-xs text-on-surface-variant">
                            {daysUntil > 0 ? `${daysUntil} dias` : 'Hoje'}
                          </p>
                        )}
                      </div>
                    )}

                    {transfer.transfer_fee && (
                      <div>
                        <p className="text-xs text-on-surface-variant">Valor da Transferência</p>
                        <p className="text-sm font-semibold text-on-surface">
                          {formatTransferFee(transfer.transfer_fee, transfer.currency)}
                        </p>
                      </div>
                    )}

                    {transfer.transfer_type === 'loan' && transfer.loan_duration_months && (
                      <div>
                        <p className="text-xs text-on-surface-variant">Duração</p>
                        <p className="text-sm font-semibold text-on-surface">
                          {transfer.loan_duration_months} meses
                        </p>
                      </div>
                    )}
                  </div>

                  {transfer.notes && (
                    <div className="rounded bg-surface/50 p-md">
                      <p className="text-xs text-on-surface-variant">{transfer.notes}</p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-sm pt-md">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectTransfer?.(transfer)}
                      className="flex-1"
                    >
                      Ver Detalhes
                    </Button>
                    {!readOnly && canCancelTransfer(transfer) && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onCancelTransfer?.(transfer.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Active Transfer Highlight */}
      {activeTransfer && (
        <Card className="border-primary/30 bg-primary-container/10">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle>Transferência Ativa</CardTitle>
                <CardDescription>
                  Para {activeTransfer.to_club.name}
                </CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-800">✓ {activeTransfer.status}</Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-md">
            <div className="flex items-center justify-center gap-md rounded-lg bg-surface/50 p-md">
              <div className="text-center">
                <p className="text-xs text-on-surface-variant">{activeTransfer.from_club.name}</p>
                <p className="font-semibold text-on-surface">{activeTransfer.from_club.name}</p>
              </div>
              <ArrowRight className="h-6 w-6 text-primary" />
              <div className="text-center">
                <p className="text-xs text-on-surface-variant">{activeTransfer.to_club.name}</p>
                <p className="font-semibold text-on-surface">{activeTransfer.to_club.name}</p>
              </div>
            </div>

            <div className="grid gap-md sm:grid-cols-3">
              <div>
                <p className="text-xs text-on-surface-variant">Tipo</p>
                <p className="text-sm font-semibold text-on-surface">
                  {getTransferTypeLabel(activeTransfer.transfer_type)}
                </p>
              </div>

              {activeTransfer.effective_date && (
                <div>
                  <p className="text-xs text-on-surface-variant">Data Efetiva</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {new Date(activeTransfer.effective_date).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              )}

              {activeTransfer.transfer_fee && (
                <div>
                  <p className="text-xs text-on-surface-variant">Valor</p>
                  <p className="text-sm font-semibold text-on-surface">
                    {formatTransferFee(activeTransfer.transfer_fee, activeTransfer.currency)}
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Transfers List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Histórico de Transferências</CardTitle>
              <CardDescription>
                {transfers.length} transferência{transfers.length !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {!readOnly && (
              <Button onClick={onAddTransfer} size="sm">
                <Plus className="h-4 w-4" />
                Solicitar Transferência
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent>
          {transfers.length === 0 ? (
            <div className="rounded-lg border border-dashed border-outline p-lg text-center">
              <ArrowRight className="mx-auto h-8 w-8 text-on-surface-variant/50" />
              <p className="mt-md text-sm text-on-surface-variant">Sem transferências registadas</p>
            </div>
          ) : (
            <div className="space-y-md">
              {transfers.map((transfer) => {
                const statusInfo = getTransferStatusInfo(transfer.status)

                return (
                  <div
                    key={transfer.id}
                    className="rounded-lg border border-outline/50 p-md hover:border-outline transition-colors"
                  >
                    <div className="flex items-start justify-between gap-md">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-sm flex-wrap">
                          <span className="text-xl">{statusInfo.icon}</span>
                          <h4 className="font-semibold text-on-surface">
                            {transfer.from_club.name} → {transfer.to_club.name}
                          </h4>
                          <Badge className={`text-xs ${statusInfo.bgColor} ${statusInfo.color}`}>
                            {statusInfo.label}
                          </Badge>
                        </div>

                        <div className="mt-md grid gap-sm text-xs sm:grid-cols-4">
                          <div>
                            <p className="text-on-surface-variant">Tipo</p>
                            <p className="font-medium text-on-surface">
                              {getTransferTypeLabel(transfer.transfer_type)}
                            </p>
                          </div>

                          {transfer.requested_at && (
                            <div>
                              <p className="text-on-surface-variant">Solicitado</p>
                              <p className="font-medium text-on-surface">
                                {new Date(transfer.requested_at).toLocaleDateString('pt-PT')}
                              </p>
                            </div>
                          )}

                          {transfer.effective_date && (
                            <div>
                              <p className="text-on-surface-variant">Efetiva</p>
                              <p className="font-medium text-on-surface">
                                {new Date(transfer.effective_date).toLocaleDateString('pt-PT')}
                              </p>
                            </div>
                          )}

                          {transfer.transfer_fee && (
                            <div>
                              <p className="text-on-surface-variant">Valor</p>
                              <p className="font-medium text-on-surface">
                                {formatTransferFee(transfer.transfer_fee, transfer.currency)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {!readOnly && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onSelectTransfer?.(transfer)}
                        >
                          Abrir
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
