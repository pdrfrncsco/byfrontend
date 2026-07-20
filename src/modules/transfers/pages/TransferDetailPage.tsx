import { useState } from 'react'
import { Link, useLocation, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Loader2,
  Ban,
  ThumbsDown,
  ThumbsUp,
  Undo2,
  CalendarPlus,
  ShieldCheck,
  Trophy,
  Shield,
} from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  FormField,
  Input,
  Skeleton,
  EmptyState,
} from '@/components/ui'
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
import {
  useApproveTransfer,
  useCancelTransfer,
  useCompleteTransfer,
  useExtendLoan,
  useMakeLoanPermanent,
  useRejectTransfer,
  useReturnLoan,
  useTransferDetail,
} from '../hooks'
import { transferRoutes } from '../routes'
import type { Transfer, TransferStatus } from '../types'
import { formatTransferDate, formatTransferFee, transferStatusVariant } from '../utils/format'

const WORKFLOW_STEPS: TransferStatus[] = ['pending', 'approved', 'completed']

function workflowStepIndex(status: TransferStatus): number {
  if (status === 'cancelled' || status === 'returned') return -1
  const idx = WORKFLOW_STEPS.indexOf(status)
  return idx >= 0 ? idx : 0
}

function canApprove(transfer: Transfer) {
  return transfer.status === 'pending' && transfer.transfer_type === 'permanent' && !!transfer.from_club
}

function canComplete(transfer: Transfer) {
  if (transfer.status === 'approved') return true
  if (transfer.status === 'pending' && transfer.transfer_type !== 'permanent') return true
  if (transfer.status === 'pending' && transfer.transfer_type === 'permanent' && !transfer.from_club) {
    return true
  }
  return false
}

function canCancel(transfer: Transfer) {
  return transfer.status === 'pending' || transfer.status === 'approved'
}

function canManageLoan(transfer: Transfer) {
  return transfer.transfer_type === 'loan' && transfer.status === 'completed'
}

interface TransferDetailPageProps {
  scope?: 'club' | 'organization'
}

export function TransferDetailPage({ scope }: TransferDetailPageProps) {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const isClubScope =
    scope === 'club' || (scope !== 'organization' && location.pathname.startsWith('/dashboard/club'))

  const { data: transfer, isLoading, isError } = useTransferDetail(id)
  const approve = useApproveTransfer()
  const reject = useRejectTransfer()
  const complete = useCompleteTransfer()
  const cancel = useCancelTransfer()
  const extendLoan = useExtendLoan()
  const returnLoan = useReturnLoan()
  const makePermanent = useMakeLoanPermanent()

  const [rejectReason, setRejectReason] = useState('')
  const [cancelReason, setCancelReason] = useState('')
  const [loanEndDate, setLoanEndDate] = useState('')
  const [permanentFee, setPermanentFee] = useState('')
  const [showRejectForm, setShowRejectForm] = useState(false)
  const [showCancelForm, setShowCancelForm] = useState(false)

  const listPath = isClubScope ? transferRoutes.clubList : transferRoutes.list
  const sidebarLinks = isClubScope
    ? getClubSidebarLinks()
    : [
        { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" /> },
        { label: 'Transferências', href: transferRoutes.list, icon: <Shield className="h-4 w-4" /> },
      ]

  const isBusy =
    approve.isPending ||
    reject.isPending ||
    complete.isPending ||
    cancel.isPending ||
    extendLoan.isPending ||
    returnLoan.isPending ||
    makePermanent.isPending

  if (isLoading) {
    return (
      <DashboardLayout
        title="Detalhe da Transferência"
        subtitle="Carregando..."
        dashboardType={isClubScope ? 'club' : 'organization'}
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-40 w-full rounded-[2rem]" />
          <Skeleton className="h-64 w-full rounded-[2rem]" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !transfer) {
    return (
      <DashboardLayout
        title="Detalhe da Transferência"
        subtitle="Não foi possível carregar"
        dashboardType={isClubScope ? 'club' : 'organization'}
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          title="Transferência não encontrada"
          description="O registo pode ter sido removido ou não tem permissão para o ver."
          action={{ label: 'Voltar à lista', onClick: () => navigate(listPath) }}
        />
      </DashboardLayout>
    )
  }

  const stepIndex = workflowStepIndex(transfer.status)

  return (
    <DashboardLayout
      title={`Transferência • ${transfer.player.full_name}`}
      subtitle={`${transfer.from_club?.name || 'Livre'} → ${transfer.to_club.name}`}
      dashboardType={isClubScope ? 'club' : 'organization'}
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={listPath}>
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-xl">
        <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container/80 p-xl lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-md">
            <div className="flex flex-wrap items-center gap-sm">
              <Badge variant={transferStatusVariant(transfer.status)}>
                {transfer.status_display || transfer.status}
              </Badge>
              <Badge variant="secondary">
                {transfer.transfer_type_display || transfer.transfer_type}
              </Badge>
            </div>
            <h1 className="text-3xl font-semibold text-on-surface">{transfer.player.full_name}</h1>
            <p className="text-on-surface-variant">
              {transfer.from_club?.name || 'Agente livre'} → {transfer.to_club.name}
            </p>
          </div>
          <Card variant="flat" padding="md">
            <dl className="space-y-sm text-sm">
              <div className="flex justify-between gap-md">
                <dt className="text-on-surface-variant">Data efectiva</dt>
                <dd className="font-semibold">{formatTransferDate(transfer.transfer_date)}</dd>
              </div>
              <div className="flex justify-between gap-md">
                <dt className="text-on-surface-variant">Valor</dt>
                <dd className="font-semibold">{formatTransferFee(transfer.fee)}</dd>
              </div>
              {transfer.loan_end_date && (
                <div className="flex justify-between gap-md">
                  <dt className="text-on-surface-variant">Fim do empréstimo</dt>
                  <dd className="font-semibold">{formatTransferDate(transfer.loan_end_date)}</dd>
                </div>
              )}
            </dl>
          </Card>
        </section>

        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>Fluxo de aprovação</CardTitle>
          </CardHeader>
          <CardContent>
            {transfer.status === 'cancelled' || transfer.status === 'returned' ? (
              <p className="text-sm text-on-surface-variant">
                Este movimento terminou como{' '}
                <strong>{transfer.status_display || transfer.status}</strong>
                {transfer.rejection_reason ? `: ${transfer.rejection_reason}` : '.'}
              </p>
            ) : (
              <ol className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
                {WORKFLOW_STEPS.map((step, index) => {
                  const done = stepIndex > index
                  const current = stepIndex === index
                  const labels: Record<string, string> = {
                    pending: 'Pendente',
                    approved: 'Aprovada',
                    completed: 'Concluída',
                  }
                  return (
                    <li key={step} className="flex items-center gap-sm">
                      {done ? (
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      ) : (
                        <Circle
                          className={`h-5 w-5 ${current ? 'text-warning' : 'text-outline'}`}
                        />
                      )}
                      <span
                        className={`text-sm font-medium ${
                          done || current ? 'text-on-surface' : 'text-on-surface-variant'
                        }`}
                      >
                        {labels[step]}
                      </span>
                    </li>
                  )
                })}
              </ol>
            )}
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>Acções</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-lg">
              {canApprove(transfer) && (
                <div className="flex flex-wrap gap-sm">
                  <Button
                    variant="primary"
                    disabled={isBusy}
                    onClick={() => approve.mutate(transfer.id)}
                  >
                    {approve.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <ThumbsUp className="h-4 w-4" />
                    )}
                    Aprovar
                  </Button>
                  <Button
                    variant="secondary"
                    disabled={isBusy}
                    onClick={() => setShowRejectForm((v) => !v)}
                  >
                    <ThumbsDown className="h-4 w-4" />
                    Rejeitar
                  </Button>
                </div>
              )}

              {showRejectForm && canApprove(transfer) && (
                <div className="space-y-sm rounded-xl border border-outline-variant/30 p-md">
                  <FormField label="Motivo da rejeição" htmlFor="reject-reason">
                    <Input
                      id="reject-reason"
                      value={rejectReason}
                      onChange={(e) => setRejectReason(e.target.value)}
                      placeholder="Opcional"
                    />
                  </FormField>
                  <Button
                    variant="danger"
                    disabled={isBusy}
                    onClick={() =>
                      reject.mutate(
                        { id: transfer.id, reason: rejectReason },
                        { onSuccess: () => setShowRejectForm(false) },
                      )
                    }
                  >
                    Confirmar rejeição
                  </Button>
                </div>
              )}

              {canComplete(transfer) && (
                <Button
                  variant="primary"
                  disabled={isBusy}
                  onClick={() => complete.mutate(transfer.id)}
                >
                  {complete.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <ShieldCheck className="h-4 w-4" />
                  )}
                  Concluir transferência
                </Button>
              )}

              {canCancel(transfer) && (
                <div className="space-y-sm">
                  <Button
                    variant="ghost"
                    disabled={isBusy}
                    onClick={() => setShowCancelForm((v) => !v)}
                  >
                    <Ban className="h-4 w-4" />
                    Cancelar transferência
                  </Button>
                  {showCancelForm && (
                    <div className="space-y-sm rounded-xl border border-outline-variant/30 p-md">
                      <FormField label="Motivo do cancelamento" htmlFor="cancel-reason">
                        <Input
                          id="cancel-reason"
                          value={cancelReason}
                          onChange={(e) => setCancelReason(e.target.value)}
                          placeholder="Opcional"
                        />
                      </FormField>
                      <Button
                        variant="danger"
                        disabled={isBusy}
                        onClick={() =>
                          cancel.mutate(
                            { id: transfer.id, reason: cancelReason },
                            { onSuccess: () => setShowCancelForm(false) },
                          )
                        }
                      >
                        Confirmar cancelamento
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {canManageLoan(transfer) && (
                <div className="space-y-md rounded-xl border border-outline-variant/30 p-md">
                  <p className="text-sm font-semibold text-on-surface">Gestão de empréstimo</p>
                  <div className="grid gap-md md:grid-cols-2">
                    <FormField label="Nova data de fim" htmlFor="loan-extend">
                      <Input
                        id="loan-extend"
                        type="date"
                        value={loanEndDate}
                        onChange={(e) => setLoanEndDate(e.target.value)}
                      />
                    </FormField>
                    <div className="flex items-end">
                      <Button
                        variant="secondary"
                        disabled={isBusy || !loanEndDate}
                        onClick={() =>
                          extendLoan.mutate({ id: transfer.id, newEndDate: loanEndDate })
                        }
                      >
                        <CalendarPlus className="h-4 w-4" />
                        Prolongar
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-sm">
                    <Button
                      variant="secondary"
                      disabled={isBusy}
                      onClick={() => returnLoan.mutate(transfer.id)}
                    >
                      <Undo2 className="h-4 w-4" />
                      Devolver ao clube de origem
                    </Button>
                  </div>
                  <div className="grid gap-md md:grid-cols-2">
                    <FormField label="Taxa (opcional)" htmlFor="permanent-fee">
                      <Input
                        id="permanent-fee"
                        type="number"
                        value={permanentFee}
                        onChange={(e) => setPermanentFee(e.target.value)}
                        placeholder="AOA"
                      />
                    </FormField>
                    <div className="flex items-end">
                      <Button
                        variant="primary"
                        disabled={isBusy}
                        onClick={() =>
                          makePermanent.mutate({
                            id: transfer.id,
                            fee: permanentFee ? Number(permanentFee) : null,
                          })
                        }
                      >
                        Tornar permanente
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {!canApprove(transfer) &&
                !canComplete(transfer) &&
                !canCancel(transfer) &&
                !canManageLoan(transfer) && (
                  <p className="text-sm text-on-surface-variant">
                    Não há acções disponíveis para o estado actual.
                  </p>
                )}
            </div>
          </CardContent>
        </Card>

        {transfer.notes && (
          <Card variant="flat" padding="md">
            <p className="text-xs uppercase tracking-[0.18em] text-on-surface-variant">Notas</p>
            <p className="mt-sm text-sm text-on-surface">{transfer.notes}</p>
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default TransferDetailPage
