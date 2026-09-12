import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { type ColumnDef } from '@tanstack/react-table'
import {
  ArrowLeft,
  CheckCircle,
  Clock,
  Clock3,
  Filter,
  Handshake,
  UserCheck,
  UserPlus,
  X,
  XCircle,
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
  DataTable,
  EmptyState,
  NativeSelect,
  ServerError,
  Skeleton,
} from '@/components/ui'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import { useClubMe } from '@/modules/clubs/hooks'
import { useClubPlayerRegistrationRequests, useReviewClubPlayerRegistrationRequest } from '../hooks'
import type { PlayerRegistrationRequest } from '../types'

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    if (Number.isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return '—'
  }
}

function StatusBadge({ status, t }: { status: string; t: (key: string) => string }) {
  const normalized = status?.toLowerCase()
  if (normalized === 'accepted') {
    return <Badge variant="success">{t('players.linkRequest.status.accepted') || 'Aceito'}</Badge>
  }
  if (normalized === 'approved') {
    return <Badge variant="success">{t('players.linkRequest.status.approved') || 'Aprovado'}</Badge>
  }
  if (normalized === 'invited') {
    return <Badge variant="secondary">{t('players.linkRequest.status.invited') || 'Convidado'}</Badge>
  }
  if (normalized === 'rejected') {
    return <Badge variant="danger">{t('players.linkRequest.status.rejected') || 'Recusado'}</Badge>
  }
  return <Badge variant="warning">{t('players.linkRequest.status.pending') || 'Pendente'}</Badge>
}

interface RowNotesState {
  [id: string]: { open: boolean; notes: string; approve: boolean }
}

type RequestFilter = 'all' | 'pending' | 'approved' | 'rejected'

export function ClubPlayerRegistrationRequestsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: currentClub, isLoading: isLoadingClub, isError: isClubError, refetch: refetchClub } = useClubMe()
  const {
    data: requests,
    isLoading: isLoadingRequests,
    isError: isRequestsError,
    refetch: refetchRequests,
  } = useClubPlayerRegistrationRequests(currentClub?.id)
  const reviewRequest = useReviewClubPlayerRegistrationRequest(currentClub?.id)

  const [rowNotes, setRowNotes] = useState<RowNotesState>({})
  const [statusFilter, setStatusFilter] = useState<RequestFilter>('pending')
  const isLoading = isLoadingClub || isLoadingRequests

  const requestRows = useMemo(() => (Array.isArray(requests) ? requests : []), [requests])

  const pendingCount = useMemo(
    () => requestRows.filter((r) => r.status?.toLowerCase() === 'pending').length,
    [requestRows],
  )
  const approvedCount = useMemo(
    () => requestRows.filter((r) => ['approved', 'accepted'].includes(r.status?.toLowerCase())).length,
    [requestRows],
  )
  const rejectedCount = useMemo(
    () => requestRows.filter((r) => r.status?.toLowerCase() === 'rejected').length,
    [requestRows],
  )

  const sidebarSections = useMemo(
    () => getClubSidebarSections({ pendingRequests: pendingCount }),
    [pendingCount],
  )

  const toggleNotes = (id: string, approve: boolean) => {
    setRowNotes((prev) => ({
      ...prev,
      [id]: {
        open: !(prev[id]?.open && prev[id]?.approve === approve),
        notes: prev[id]?.notes ?? '',
        approve,
      },
    }))
  }

  const handleReview = (id: string, approve: boolean) => {
    const notes = (rowNotes[id]?.notes ?? '').trim()
    if (!approve && !notes) return
    reviewRequest.mutate(
      { id, data: { approve, review_notes: notes || undefined } },
      {
        onSuccess: () => {
          setRowNotes((prev) => {
            const next = { ...prev }
            delete next[id]
            return next
          })
        },
      },
    )
  }

  const columns = useMemo<ColumnDef<PlayerRegistrationRequest>[]>(
    () => [
      {
        id: 'player',
        header: t('players.clubRequests.columns.player') || 'Jogador',
        cell: ({ row }) => (
          <div>
            <p className="font-semibold text-on-surface text-sm">{row.original.player_name}</p>
            {row.original.player_position_label && (
              <p className="text-[11px] text-on-surface-variant">{row.original.player_position_label}</p>
            )}
          </div>
        ),
      },
      {
        id: 'joined_date',
        header: t('players.register.joinedDate') || 'Data de Entrada',
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant font-data-tabular">
            {formatDate(row.original.joined_date)}
            {row.original.shirt_number ? ` • #${row.original.shirt_number}` : ''}
          </span>
        ),
      },
      {
        id: 'submitted_by',
        header: t('players.clubRequests.columns.submittedBy') || 'Submetido por',
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant">{row.original.submitted_by_email || '—'}</span>
        ),
      },
      {
        id: 'status',
        header: t('players.clubRequests.columns.status') || 'Estado',
        cell: ({ row }) => <StatusBadge status={row.original.status} t={t} />,
      },
      {
        id: 'created_at',
        header: t('players.clubRequests.columns.date') || 'Data do Pedido',
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant font-data-tabular">{formatDate(row.original.created_at)}</span>
        ),
      },
      {
        id: 'actions',
        header: t('players.clubRequests.columns.actions') || 'Ações',
        cell: ({ row }) => {
          const { id, status } = row.original
          const isPending = status?.toLowerCase() === 'pending'
          const notesState = rowNotes[id]
          const isSubmitting = reviewRequest.isPending && reviewRequest.variables?.id === id
          const requiresReason = notesState?.approve === false

          if (!isPending) return null

          return (
            <div className="flex flex-col gap-xs">
              <div className="flex gap-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary-container/20 text-xs gap-1"
                  onClick={() => toggleNotes(id, true)}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>Aprovar</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error hover:bg-error-container/20 text-xs gap-1"
                  onClick={() => toggleNotes(id, false)}
                  disabled={isSubmitting}
                >
                  <XCircle className="h-3.5 w-3.5" />
                  <span>Rejeitar</span>
                </Button>
              </div>

              {notesState?.open && (
                <div className="mt-xs flex flex-col gap-xs rounded-xl border border-outline-variant/30 bg-surface-container p-sm">
                  <label htmlFor={`review-notes-${id}`} className="text-[11px] font-medium text-on-surface">
                    {notesState.approve ? 'Parecer Técnico / Observações:' : 'Motivo da Rejeição:'}
                    {!notesState.approve && <span className="text-error"> *</span>}
                  </label>
                  <textarea
                    id={`review-notes-${id}`}
                    aria-required={!notesState.approve}
                    className="w-full resize-none rounded-lg border border-outline-variant/40 bg-surface-bright px-sm py-xs text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                    placeholder={
                      requiresReason
                        ? 'Indique o motivo da rejeição do atleta...'
                        : 'Observações opcionais para a homologação...'
                    }
                    value={notesState.notes}
                    onChange={(e) =>
                      setRowNotes((prev) => ({
                        ...prev,
                        [id]: { ...prev[id], notes: e.target.value },
                      }))
                    }
                  />
                  <div className="flex gap-xs pt-0.5">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReview(id, notesState.approve)}
                      disabled={requiresReason && !notesState.notes.trim()}
                      loading={isSubmitting}
                      className="text-xs"
                    >
                      {notesState.approve ? 'Confirmar Aprovação' : 'Confirmar Rejeição'}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setRowNotes((prev) => {
                          const next = { ...prev }
                          delete next[id]
                          return next
                        })
                      }
                      className="text-xs"
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        },
      },
    ],
    [rowNotes, reviewRequest.isPending, reviewRequest.variables, t],
  )

  const filteredRows = useMemo(() => {
    const rows =
      statusFilter === 'all'
        ? requestRows
        : requestRows.filter((request) => request.status?.toLowerCase() === statusFilter)
    return [...rows].sort((a, b) => {
      const pendingDelta = Number(b.status?.toLowerCase() === 'pending') - Number(a.status?.toLowerCase() === 'pending')
      if (pendingDelta !== 0) return pendingDelta
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    })
  }, [requestRows, statusFilter])

  return (
    <DashboardLayout
      title="Pedidos de Filiação & Vínculo ao Clube"
      subtitle={`Gestão e análise das solicitações de inscrição de atletas no ${currentClub?.name || 'Clube'}`}
      dashboardType="club"
      sidebarSections={sidebarSections}
      headerActions={
        <div className="flex items-center gap-xs">
          <Button asChild variant="outline" size="sm" className="gap-xs text-xs">
            <Link to={ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER}>
              <UserPlus className="h-3.5 w-3.5" />
              Registar Jogador
            </Link>
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.DASHBOARD_CLUB)} className="gap-xs text-xs">
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar ao Painel
          </Button>
        </div>
      }
    >
      <div className="space-y-lg animate-fade-in">
        {/* ─── 1. PAGE HEADER / HERO BAR ─────────────────────────────────── */}
        <div className="flex flex-col gap-md rounded-2xl border border-outline-variant/30 bg-surface-container/40 p-lg shadow-xs sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-md">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Handshake className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-on-surface">Pedidos de Inscrição e Vínculo</h1>
              <p className="text-xs text-on-surface-variant">
                Analise pedidos de filiação submetidos por jogadores ou acompanhe o status de convites oficiais.
              </p>
            </div>
          </div>
        </div>

        {/* ─── 2. KPI ROW (3 METRICS) ───────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-sm sm:grid-cols-3">
          {/* Pendentes */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-1 flex items-center gap-xs text-xs text-on-surface-variant">
              <Clock className="h-3.5 w-3.5 text-[#854f0b]" />
              <span className="font-medium">Pendentes de Análise</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{pendingCount}</div>
            <p className="text-[11px] text-amber-600 font-medium">Requer parecer da secretaria</p>
          </div>

          {/* Aprovados */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-1 flex items-center gap-xs text-xs text-on-surface-variant">
              <CheckCircle className="h-3.5 w-3.5 text-[#0f6e56]" />
              <span className="font-medium">Aprovados / Homologados</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{approvedCount}</div>
            <p className="text-[11px] text-emerald-600 font-medium">Atletas no plantel</p>
          </div>

          {/* Recusados */}
          <div className="rounded-xl border border-outline-variant/30 bg-surface p-md shadow-xs">
            <div className="mb-1 flex items-center gap-xs text-xs text-on-surface-variant">
              <XCircle className="h-3.5 w-3.5 text-[#a32d2d]" />
              <span className="font-medium">Recusados</span>
            </div>
            <div className="text-2xl font-bold text-on-surface">{rejectedCount}</div>
            <p className="text-[11px] text-on-surface-variant">Processos encerrados</p>
          </div>
        </div>

        {/* ─── 3. TABELA COM FILTROS ───────────────────────────────────── */}
        {isLoading ? (
          <Card padding="none" className="border-outline-variant/30 bg-surface shadow-xs">
            <div className="divide-y divide-outline-variant/20">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md px-lg py-md">
                  <Skeleton className="h-3 w-48 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : isClubError ? (
          <ServerError
            title="Erro ao carregar clube"
            message="Não foi possível consultar os dados do clube para os pedidos."
            onRetry={() => refetchClub()}
          />
        ) : isRequestsError ? (
          <ServerError
            title="Erro ao carregar pedidos"
            message="Não foi possível consultar os pedidos de registo."
            onRetry={() => refetchRequests()}
          />
        ) : requestRows.length === 0 ? (
          <EmptyState
            icon={UserPlus}
            title="Nenhum pedido de registo recebido"
            description="Quando atletas submeterem pedidos de filiação ao clube, serão listados aqui para aprovação."
          />
        ) : (
          <div className="space-y-md">
            <Card variant="flat" padding="md" className="flex flex-col gap-md border-outline-variant/30 bg-surface shadow-xs sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-sm">
                <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-xs font-semibold text-on-surface">
                  {filteredRows.length} {filteredRows.length === 1 ? 'pedido listado' : 'pedidos listados'}
                </span>
              </div>
              <NativeSelect
                aria-label="Filtrar por estado"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
                className="sm:max-w-xs text-xs"
              >
                <option value="pending">Pendentes ({pendingCount})</option>
                <option value="all">Todos ({requestRows.length})</option>
                <option value="approved">Aprovados ({approvedCount})</option>
                <option value="rejected">Recusados ({rejectedCount})</option>
              </NativeSelect>
            </Card>

            <Card padding="none" className="border-outline-variant/30 bg-surface shadow-xs overflow-hidden">
              <DataTable
                columns={columns}
                data={filteredRows}
                isLoading={false}
                emptyMessage="Nenhum pedido encontrado para o filtro selecionado."
              />
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
