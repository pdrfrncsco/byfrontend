import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import {
  ArrowLeftRight,
  Calendar,
  CheckCircle2,
  Clock,
  DollarSign,
  Plus,
  Sparkles,
  X,
} from 'lucide-react'
import { toast } from 'sonner'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Skeleton,
} from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { PlayerTransferSection } from '../components/sections/PlayerTransferSection'
import { PlayerTransferForm } from '../components/forms/PlayerTransferForm'
import {
  usePlayerMe,
  useCreateTransfer,
  useCancelTransfer,
  getTransferStatusInfo,
  getTransferTypeLabel,
  formatTransferFee,
  getTransferTimelineSteps,
  type PlayerTransfer,
} from '../hooks'
import { type TransferRequest } from '../schemas/transfer.schema'
import { getPlayerSidebarLinks } from '../constants/navigation'

export function PlayerTransferCenterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()

  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedTransfer, setSelectedTransfer] = useState<PlayerTransfer | null>(null)

  const createMutation = useCreateTransfer(player?.id ?? '')
  const cancelMutation = useCancelTransfer(player?.id ?? '')

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  if (isLoading) {
    return (
      <DashboardLayout
        title="Centro de Transferências"
        subtitle="A carregar histórico e movimentações..."
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title="Centro de Transferências"
        subtitle="Movimentações desportivas e mercado"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title="Jogador não encontrado"
          description="Não foi possível carregar as informações do atleta para gerir transferências."
          action={{
            label: 'Voltar para o Painel',
            onClick: () => navigate(ROUTES.DASHBOARD_PLAYER),
            variant: 'secondary',
          }}
        />
      </DashboardLayout>
    )
  }

  const handleCreateTransfer = async (data: TransferRequest) => {
    try {
      await createMutation.mutateAsync({
        player_id: player.id,
        to_club_id: data.to_club,
        from_club_id: player.current_club?.id,
        fee: data.transfer_fee ?? undefined,
        joined_date: data.effective_date ? data.effective_date.split('T')[0] : undefined,
      })
      toast.success('Solicitação de transferência submetida com sucesso.')
      setIsFormOpen(false)
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Erro ao submeter transferência.'
      toast.error(msg)
    }
  }

  const handleCancelTransfer = async (transferId: string) => {
    try {
      await cancelMutation.mutateAsync(transferId)
      toast.success('Transferência cancelada com sucesso.')
      if (selectedTransfer?.id === transferId) {
        setSelectedTransfer(null)
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Não foi possível cancelar a transferência.'
      toast.error(msg)
    }
  }

  return (
    <DashboardLayout
      title={`Centro de Transferências — ${player.full_name}`}
      subtitle="Histórico federativo de transferências, mercado, cedências e pedidos de desvinculação"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-xl">
        {/* Form Overlay or Collapsible Drawer */}
        {isFormOpen && (
          <div className="rounded-2xl border border-primary/30 bg-surface p-lg shadow-md animate-in fade-in slide-in-from-top-4 duration-200">
            <div className="mb-md flex items-center justify-between">
              <div className="flex items-center gap-xs">
                <ArrowLeftRight className="h-5 w-5 text-primary" />
                <h3 className="text-base font-bold text-on-surface">Nova Solicitação de Transferência</h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsFormOpen(false)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
            <PlayerTransferForm
              playerId={player.id}
              onSubmit={handleCreateTransfer}
              isLoading={createMutation.isPending}
              onCancel={() => setIsFormOpen(false)}
            />
          </div>
        )}

        {/* Selected Transfer Modal / Drawer */}
        {selectedTransfer && (
          <div className="rounded-2xl border border-outline-variant/40 bg-surface p-lg shadow-md">
            <div className="flex items-start justify-between border-b border-outline-variant/20 pb-md">
              <div>
                <div className="flex items-center gap-sm">
                  <h3 className="text-lg font-bold text-on-surface">Detalhes da Transferência</h3>
                  {(() => {
                    const info = getTransferStatusInfo(selectedTransfer.status)
                    return (
                      <Badge className={`${info.bgColor} ${info.color}`}>
                        {info.icon} {info.label}
                      </Badge>
                    )
                  })()}
                </div>
                <p className="text-xs text-on-surface-variant">
                  {selectedTransfer.from_club.name} → {selectedTransfer.to_club.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSelectedTransfer(null)}
                className="h-8 w-8 p-0"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="mt-md grid gap-md sm:grid-cols-3">
              <div>
                <span className="text-xs text-on-surface-variant">Tipo</span>
                <p className="text-sm font-semibold text-on-surface">
                  {getTransferTypeLabel(selectedTransfer.transfer_type)}
                </p>
              </div>
              {selectedTransfer.effective_date && (
                <div>
                  <span className="text-xs text-on-surface-variant">Data Efetiva</span>
                  <p className="text-sm font-semibold text-on-surface">
                    {new Date(selectedTransfer.effective_date).toLocaleDateString('pt-PT')}
                  </p>
                </div>
              )}
              {selectedTransfer.transfer_fee != null && (
                <div>
                  <span className="text-xs text-on-surface-variant">Compensação / Valor</span>
                  <p className="text-sm font-semibold text-on-surface">
                    {formatTransferFee(selectedTransfer.transfer_fee, selectedTransfer.currency)}
                  </p>
                </div>
              )}
            </div>

            {selectedTransfer.notes && (
              <div className="mt-md rounded-lg bg-surface-container/50 p-sm text-xs text-on-surface-variant">
                <span className="font-semibold">Notas:</span> {selectedTransfer.notes}
              </div>
            )}

            {/* Timeline */}
            <div className="mt-md border-t border-outline-variant/20 pt-md">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-on-surface-variant mb-sm">
                Fases do Processo
              </h4>
              <div className="grid grid-cols-2 gap-sm sm:grid-cols-4">
                {getTransferTimelineSteps().map((step) => {
                  const isCurrent = selectedTransfer.status === step.status
                  return (
                    <div
                      key={step.status}
                      className={`rounded-lg border p-sm text-xs ${
                        isCurrent
                          ? 'border-primary bg-primary-container/20 text-primary font-medium'
                          : 'border-outline-variant/30 text-on-surface-variant'
                      }`}
                    >
                      <div className="font-semibold">{step.label}</div>
                      <div className="text-[11px] opacity-80">{step.description}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            {['requested', 'pending'].includes(selectedTransfer.status) && (
              <div className="mt-md flex justify-end">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCancelTransfer(selectedTransfer.id)}
                  className="text-error hover:bg-error/10 hover:border-error/30"
                >
                  Cancelar Transferência
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Transfer Section List */}
        <PlayerTransferSection
          playerId={player.id}
          onAddTransfer={() => setIsFormOpen(true)}
          onSelectTransfer={(t) => setSelectedTransfer(t)}
          onCancelTransfer={handleCancelTransfer}
        />
      </div>
    </DashboardLayout>
  )
}
