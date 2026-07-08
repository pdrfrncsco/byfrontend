import { useState, useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Settings, Shield, Trophy, Users, CheckCircle, XCircle } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Skeleton,
} from '@/components/ui'
import { useOrganizationClubRequests, useReviewClubRequest } from '../hooks'
import type { ClubAffiliationRequest } from '../types'

function formatDate(dateString?: string | null): string {
  if (!dateString) return '—'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return '—'
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return '—'
  }
}

function StatusBadge({ status }: { status: string }) {
  const s = status?.toLowerCase()
  if (s === 'approved') return <Badge variant="success">Aprovado</Badge>
  if (s === 'rejected') return <Badge variant="danger">Rejeitado</Badge>
  return <Badge variant="warning">Pendente</Badge>
}

interface RowNotesState {
  [id: string]: { open: boolean; notes: string; approve: boolean }
}

export function OrganizationAffiliationsPage() {
  const { data: requests, isLoading } = useOrganizationClubRequests()
  const reviewRequest = useReviewClubRequest()

  // per-row state for inline review notes textarea
  const [rowNotes, setRowNotes] = useState<RowNotesState>({})

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

  const sidebarLinks = [
    { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Clubes Associados', href: ROUTES.CLUBS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Competições', href: ROUTES.COMPETITIONS, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS, icon: <Users className="h-4 w-4" /> },
    { label: 'Pedidos de Filiação', href: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS, icon: <Shield className="h-4 w-4" />, active: true },
    { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="h-4 w-4" /> },
  ]

  const columns = useMemo<ColumnDef<ClubAffiliationRequest>[]>(
    () => [
      {
        id: 'club',
        header: 'Clube',
        cell: ({ row }) => {
          const { name, city } = row.original
          return (
            <div>
              <p className="font-semibold text-on-surface text-sm leading-tight">{name}</p>
              {city && <p className="text-[11px] text-on-surface-variant">{city}</p>}
            </div>
          )
        },
      },
      {
        id: 'submitted_by',
        header: 'Submetido por',
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant">
            {row.original.submitted_by_email || '—'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => <StatusBadge status={row.original.status} />,
      },
      {
        id: 'created_at',
        header: 'Data',
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant font-data-tabular">
            {formatDate(row.original.created_at)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => {
          const { id, status } = row.original
          const isPending = status?.toLowerCase() === 'pending'
          const notesState = rowNotes[id]
          const isSubmitting = reviewRequest.isPending

          if (!isPending) return null

          return (
            <div className="flex flex-col gap-xs">
              <div className="flex gap-xs">
                {/* Aprovar */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-primary hover:bg-primary-container/20"
                  onClick={() => toggleNotes(id, true)}
                  disabled={isSubmitting}
                  title="Aprovar pedido"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span className="text-xs">Aprovar</span>
                </Button>
                {/* Rejeitar */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-error hover:bg-error-container/20"
                  onClick={() => toggleNotes(id, false)}
                  disabled={isSubmitting}
                  title="Rejeitar pedido"
                >
                  <XCircle className="h-4 w-4" />
                  <span className="text-xs">Rejeitar</span>
                </Button>
              </div>

              {/* Inline notes + confirm */}
              {notesState?.open && (
                <div className="mt-xs flex flex-col gap-xs rounded border border-outline-variant/30 bg-surface-container p-sm">
                  <textarea
                    className="w-full resize-none rounded border border-outline-variant/40 bg-surface-lowest px-sm py-xs text-xs text-on-surface placeholder:text-on-surface-variant/50 focus:outline-none focus:ring-1 focus:ring-primary"
                    rows={2}
                    placeholder="Notas de revisão (opcional)..."
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
                      loading={isSubmitting}
                      className="text-xs"
                    >
                      {notesState.approve ? 'Confirmar aprovação' : 'Confirmar rejeição'}
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rowNotes, reviewRequest.isPending],
  )

  const requestRows = useMemo(() => (Array.isArray(requests) ? requests : []), [requests])

  return (
    <DashboardLayout
      title="Pedidos de Filiação de Clubes"
      subtitle="Aprove ou rejeite pedidos de clubes que pretendem filiar-se à sua organização."
      dashboardType="federation"
      sidebarLinks={sidebarLinks}
    >
      <div className="animate-fade-in">
        {isLoading ? (
          <Card padding="none">
            <div className="divide-y divide-outline-variant/20">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md px-lg py-md">
                  <div className="flex-1 space-y-xs">
                    <Skeleton className="h-3 w-48 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded" />
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-28 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : requestRows.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="Sem pedidos de filiação"
            description="Nenhum pedido de filiação pendente."
          />
        ) : (
          <Card padding="none" className="overflow-hidden">
            <DataTable
              columns={columns}
              data={requestRows}
              isLoading={false}
              emptyMessage="Nenhum pedido de filiação pendente."
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
