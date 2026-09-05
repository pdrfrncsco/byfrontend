import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { type ColumnDef } from '@tanstack/react-table'
import { ArrowLeft, CheckCircle, Filter, UserPlus, XCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Badge, Button, Card, DataTable, EmptyState, NativeSelect, ServerError, Skeleton } from '@/components/ui'
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
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
  if (normalized === 'approved') return <Badge variant="success">{t('players.linkRequest.status.approved')}</Badge>
  if (normalized === 'rejected') return <Badge variant="danger">{t('players.linkRequest.status.rejected')}</Badge>
  return <Badge variant="warning">{t('players.linkRequest.status.pending')}</Badge>
}

interface RowNotesState {
  [id: string]: { open: boolean; notes: string; approve: boolean }
}

export function ClubPlayerRegistrationRequestsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const { data: currentClub, isLoading: isLoadingClub, isError: clubError, refetch: refetchClub } = useClubMe()
  const { data: requests, isLoading: isLoadingRequests, isError: requestsError, refetch: refetchRequests } = useClubPlayerRegistrationRequests(currentClub?.id)
  const reviewRequest = useReviewClubPlayerRegistrationRequest(currentClub?.id)

  const [rowNotes, setRowNotes] = useState<RowNotesState>({})
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('pending')
  const isLoading = isLoadingClub || isLoadingRequests

  const sidebarLinks = getClubSidebarLinks()

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
        header: t('players.clubRequests.columns.player'),
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
        header: t('players.register.joinedDate'),
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant font-data-tabular">
            {formatDate(row.original.joined_date)}
            {row.original.shirt_number ? ` • #${row.original.shirt_number}` : ''}
          </span>
        ),
      },
      {
        id: 'submitted_by',
        header: t('players.clubRequests.columns.submittedBy'),
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant">{row.original.submitted_by_email || '—'}</span>
        ),
      },
      {
        id: 'status',
        header: t('players.clubRequests.columns.status'),
        cell: ({ row }) => <StatusBadge status={row.original.status} t={t} />,
      },
      {
        id: 'created_at',
        header: t('players.clubRequests.columns.date'),
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant font-data-tabular">{formatDate(row.original.created_at)}</span>
        ),
      },
      {
        id: 'actions',
        header: t('players.clubRequests.columns.actions'),
        cell: ({ row }) => {
          const { id, status } = row.original
          const isPending = status?.toLowerCase() === 'pending'
          const notesState = rowNotes[id]
          const isSubmitting = reviewRequest.isPending && reviewRequest.variables?.id === id

          if (!isPending) return null

          return (
            <div className="flex flex-col gap-xs">
              <div className="flex gap-xs">
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary-container/20"
                  onClick={() => toggleNotes(id, true)}
                  disabled={isSubmitting}
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">{t('players.clubRequests.approve')}</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error hover:bg-error-container/20"
                  onClick={() => toggleNotes(id, false)}
                  disabled={isSubmitting}
                >
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs">{t('players.clubRequests.reject')}</span>
                </Button>
              </div>

              {notesState?.open && (
                <div className="mt-xs flex flex-col gap-xs rounded border border-outline-variant/30 bg-surface-container p-sm">
                  <label htmlFor={`review-notes-${id}`} className="text-xs font-medium text-on-surface">
                    {notesState.approve ? t('players.clubRequests.notesLabel') : t('players.clubRequests.rejectionReasonLabel')}
                    {!notesState.approve && <span className="text-error"> *</span>}
                  </label>
                  <textarea
                    id={`review-notes-${id}`}
                    aria-required={!notesState.approve}
                    className="w-full resize-none rounded border border-outline-variant/40 bg-surface-bright px-sm py-xs text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                    placeholder={t('players.clubRequests.notesPlaceholder')}
                    value={notesState.notes}
                    onChange={(e) =>
                      setRowNotes((prev) => ({
                        ...prev,
                        [id]: { ...prev[id], notes: e.target.value },
                      }))
                    }
                  />
                  <div className="flex gap-xs">
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => handleReview(id, notesState.approve)}
                      disabled={!notesState.approve && !notesState.notes.trim()}
                      loading={isSubmitting}
                      className="text-xs"
                    >
                      {notesState.approve ? t('players.clubRequests.confirmApprove') : t('players.clubRequests.confirmReject')}
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
                      {t('players.common.cancel')}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        },
      },
    ],
    [rowNotes, reviewRequest.isPending, t],
  )

  const requestRows = useMemo(() => (Array.isArray(requests) ? requests : []), [requests])
  const filteredRows = useMemo(() => {
    const rows = statusFilter === 'all' ? requestRows : requestRows.filter((request) => request.status?.toLowerCase() === statusFilter)
    return [...rows].sort((a, b) => {
      const pendingDelta = Number(b.status?.toLowerCase() === 'pending') - Number(a.status?.toLowerCase() === 'pending')
      if (pendingDelta !== 0) return pendingDelta
      return new Date(b.created_at ?? 0).getTime() - new Date(a.created_at ?? 0).getTime()
    })
  }, [requestRows, statusFilter])
  const pendingCount = requestRows.filter((request) => request.status?.toLowerCase() === 'pending').length

  return (
    <DashboardLayout
      title={t('players.clubRequests.title')}
      subtitle={t('players.clubRequests.subtitle')}
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.DASHBOARD_CLUB)}>
          <ArrowLeft className="h-4 w-4" />
          {t('players.common.back')}
        </Button>
      }
    >
      <div className="animate-fade-in">
        {isLoading ? (
          <Card padding="none">
            <div className="divide-y divide-outline-variant/20">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md px-lg py-md">
                  <Skeleton className="h-3 w-48 rounded" />
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : clubError ? (
          <ServerError title={t('players.clubRequests.clubErrorTitle')} message={t('players.clubRequests.loadErrorDescription')} onRetry={() => refetchClub()} />
        ) : requestsError ? (
          <ServerError title={t('players.clubRequests.loadErrorTitle')} message={t('players.clubRequests.loadErrorDescription')} onRetry={() => refetchRequests()} />
        ) : requestRows.length === 0 ? (
          <EmptyState icon={UserPlus} title={t('players.clubRequests.emptyTitle')} description={t('players.clubRequests.emptyDescription')} />
        ) : (
          <div className="space-y-md">
            <Card variant="flat" padding="md" className="flex flex-col gap-md sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-sm">
                <Filter className="h-4 w-4 text-primary" aria-hidden="true" />
                <span className="text-sm text-on-surface-variant">{t('players.clubRequests.pendingCount', { count: pendingCount })}</span>
              </div>
              <NativeSelect aria-label={t('players.clubRequests.filterLabel')} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)} className="sm:max-w-xs">
                <option value="pending">{t('players.clubRequests.filters.pending')}</option>
                <option value="all">{t('players.clubRequests.filters.all')}</option>
                <option value="approved">{t('players.clubRequests.filters.approved')}</option>
                <option value="rejected">{t('players.clubRequests.filters.rejected')}</option>
              </NativeSelect>
            </Card>
            <Card padding="none" className="overflow-hidden">
              <DataTable columns={columns} data={filteredRows} isLoading={false} emptyMessage={t('players.clubRequests.filteredEmpty')} />
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
