import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, Filter, SlidersHorizontal, Trophy } from 'lucide-react'
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
  FormField,
  Input,
  Select,
  Skeleton,
} from '@/components/ui'
import { useClubMe, useTransfers } from '@/modules/clubs/hooks/useClubs'
import type { Transfer, TransferStatus, TransferType } from '@/modules/clubs/types'

function statusVariant(status?: TransferStatus) {
  switch (status) {
    case 'approved':
    case 'completed':
      return 'primary'
    case 'pending':
      return 'warning'
    case 'cancelled':
    case 'returned':
      return 'danger'
    default:
      return 'secondary'
  }
}

function formatDate(value?: string | null) {
  if (!value) return '—'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '—'
  return date.toLocaleDateString('pt-AO')
}

function formatFee(value?: string | number | null) {
  if (value === null || value === undefined || value === '') return '—'
  const amount = typeof value === 'number' ? value : Number(value)
  if (Number.isNaN(amount)) return String(value)
  return amount.toLocaleString('pt-AO', { style: 'currency', currency: 'AOA' })
}

export default function ClubTransfersPage() {
  const { data: club, isLoading: clubLoading } = useClubMe()
  const { data: transfersData, isLoading } = useTransfers({ page_size: 50, club_id: club?.id })
  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TransferStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | TransferType>('all')

  const sidebarLinks = [
    { label: 'Geral', href: ROUTES.DASHBOARD_CLUB, icon: <ArrowRightLeft className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_CLUB_MEMBERS, icon: <ArrowRightLeft className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.DASHBOARD_CLUB_SETTINGS, icon: <ArrowRightLeft className="h-4 w-4" /> },
    { label: 'Documentos', href: ROUTES.DASHBOARD_CLUB_DOCUMENTS, icon: <ArrowRightLeft className="h-4 w-4" /> },
    { label: 'Patrocinadores', href: ROUTES.DASHBOARD_CLUB_SPONSORS, icon: <ArrowRightLeft className="h-4 w-4" /> },
    { label: 'Transferências', href: ROUTES.DASHBOARD_CLUB_TRANSFERS, icon: <ArrowRightLeft className="h-4 w-4" />, active: true },
  ]

  const rows = useMemo(() => {
    const list = transfersData?.results ?? []
    const term = query.trim().toLowerCase()

    return list.filter((transfer) => {
      const player = transfer.player?.full_name?.toLowerCase() || ''
      const fromClub = transfer.from_club?.name?.toLowerCase() || ''
      const toClub = transfer.to_club?.name?.toLowerCase() || ''
      const matchesSearch = !term || player.includes(term) || fromClub.includes(term) || toClub.includes(term)
      const matchesStatus = statusFilter === 'all' || transfer.status === statusFilter
      const matchesType = typeFilter === 'all' || transfer.transfer_type === typeFilter
      return matchesSearch && matchesStatus && matchesType
    })
  }, [query, statusFilter, typeFilter, transfersData?.results])

  const columns = useMemo<ColumnDef<Transfer>[]>(() => [
    {
      id: 'player',
      header: 'Jogador',
      cell: ({ row }) => (
        <div className="space-y-1">
          <p className="font-semibold text-on-surface">{row.original.player.full_name}</p>
          <p className="text-xs text-on-surface-variant">{row.original.player.primary_position || 'Sem posição'}</p>
        </div>
      ),
    },
    {
      id: 'clubs',
      header: 'Origem / Destino',
      cell: ({ row }) => (
        <p className="text-sm text-on-surface-variant">
          {row.original.from_club?.name || 'Livre'} → {row.original.to_club?.name}
        </p>
      ),
    },
    {
      id: 'type',
      header: 'Tipo',
      cell: ({ row }) => <Badge variant="secondary">{row.original.transfer_type_display || row.original.transfer_type}</Badge>,
    },
    {
      id: 'status',
      header: 'Estado',
      cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{row.original.status_display || row.original.status}</Badge>,
    },
    {
      id: 'fee',
      header: 'Valor',
      cell: ({ row }) => <span className="font-data-tabular text-sm text-on-surface-variant">{formatFee(row.original.fee)}</span>,
    },
    {
      id: 'date',
      header: 'Data',
      cell: ({ row }) => <span className="font-data-tabular text-sm text-on-surface-variant">{formatDate(row.original.transfer_date)}</span>,
    },
  ], [])

  if (clubLoading || !club) {
    return (
      <DashboardLayout title="Transferências do Clube" subtitle="Carregando movimentos..." dashboardType="club" sidebarLinks={sidebarLinks}>
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <Skeleton className="h-96 w-full rounded-[2rem]" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Transferências • ${club.name}`}
      subtitle="Acompanhe o histórico de movimentos e aplique filtros rápidos para leitura executiva."
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={ROUTES.DASHBOARD_CLUB}>
            <ArrowLeft className="h-4 w-4" />
            <span>Voltar</span>
          </Link>
        </Button>
      }
    >
      <div className="space-y-xl">
        <section className="grid gap-lg rounded-[2rem] border border-outline-variant/20 bg-surface-container/80 p-xl lg:grid-cols-[1fr_0.7fr]">
          <div className="space-y-md">
            <div className="inline-flex items-center gap-sm rounded-full border border-primary/15 bg-primary-container/20 px-md py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              Monitorização
            </div>
            <h1 className="text-3xl font-semibold text-on-surface">Movimentos do plantel</h1>
            <p className="max-w-2xl text-on-surface-variant">
              Consulta rápida com filtros por tipo e estado para acompanhar entradas, saídas e aprovações.
            </p>
          </div>
          <Card variant="flat" padding="md">
            <p className="text-xs uppercase tracking-[0.2em] text-on-surface-variant">Total visível</p>
            <p className="mt-1 text-2xl font-bold text-on-surface">{rows.length}</p>
          </Card>
        </section>

        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>Filtros</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-md md:grid-cols-3">
              <FormField label="Pesquisar" htmlFor="transfer-search">
                <div className="relative">
                  <Filter className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline" />
                  <Input id="transfer-search" value={query} onChange={(e) => setQuery(e.target.value)} className="pl-10" placeholder="Jogador ou clube" />
                </div>
              </FormField>
              <FormField label="Estado" htmlFor="transfer-status">
                <Select id="transfer-status" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as TransferStatus | 'all')}>
                  <option value="all">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovada</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="returned">Devolvida</option>
                </Select>
              </FormField>
              <FormField label="Tipo" htmlFor="transfer-type">
                <Select id="transfer-type" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as TransferType | 'all')}>
                  <option value="all">Todos</option>
                  <option value="permanent">Permanente</option>
                  <option value="loan">Empréstimo</option>
                  <option value="free_agent">Livre</option>
                </Select>
              </FormField>
            </div>
          </CardContent>
        </Card>

        <Card variant="flat" padding="none">
          <CardHeader>
            <CardTitle>Lista de transferências</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="space-y-sm">
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
                <Skeleton className="h-14 rounded-xl" />
              </div>
            ) : rows.length === 0 ? (
              <EmptyState
                title="Sem transferências"
                description="Ajuste os filtros ou aguarde novos movimentos para este clube."
                icon={Trophy}
              />
            ) : (
              <DataTable columns={columns} data={rows} isLoading={false} emptyMessage="Sem transferências." enableSorting={false} />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
