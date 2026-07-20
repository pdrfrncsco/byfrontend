import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, Filter, Plus, SlidersHorizontal, Trophy, Settings, Shield } from 'lucide-react'
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
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
import { useClubMe } from '@/modules/clubs/hooks/useClubs'
import { useTransfers } from '../hooks'
import { transferRoutes } from '../routes'
import type { Transfer, TransferStatus, TransferType } from '../types'
import { formatTransferDate, formatTransferFee, transferStatusVariant } from '../utils/format'

type TransfersListScope = 'club' | 'organization'

interface TransfersListPageProps {
  scope?: TransfersListScope
}

export function TransfersListPage({ scope }: TransfersListPageProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const resolvedScope: TransfersListScope =
    scope ?? (location.pathname.startsWith('/dashboard/club') ? 'club' : 'organization')

  const isClubScope = resolvedScope === 'club'
  const { data: club, isLoading: clubLoading } = useClubMe()
  const listParams = useMemo(
    () => ({
      page_size: 50,
      ...(isClubScope && club?.id ? { club_id: club.id } : {}),
    }),
    [isClubScope, club?.id],
  )
  const { data: transfersData, isLoading } = useTransfers(listParams)

  const [query, setQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<'all' | TransferStatus>('all')
  const [typeFilter, setTypeFilter] = useState<'all' | TransferType>('all')

  const createPath = isClubScope ? transferRoutes.clubCreate : transferRoutes.create
  const detailPath = (id: string) => (isClubScope ? transferRoutes.clubDetail(id) : transferRoutes.detail(id))
  const backPath = isClubScope ? ROUTES.DASHBOARD_CLUB : ROUTES.DASHBOARD_ORGANIZATION

  const sidebarLinks = isClubScope
    ? getClubSidebarLinks()
    : [
        { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" /> },
        { label: 'Transferências', href: transferRoutes.list, icon: <Shield className="h-4 w-4" /> },
        { label: 'Clubes', href: ROUTES.CLUBS, icon: <Shield className="h-4 w-4" /> },
        { label: 'Competições', href: ROUTES.COMPETITIONS, icon: <Trophy className="h-4 w-4" /> },
        { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="h-4 w-4" /> },
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

  const hasFilters = query.trim() !== '' || statusFilter !== 'all' || typeFilter !== 'all'

  const columns = useMemo<ColumnDef<Transfer>[]>(
    () => [
      {
        id: 'player',
        header: 'Jogador',
        cell: ({ row }) => (
          <div className="space-y-1">
            <p className="font-semibold text-on-surface">{row.original.player.full_name}</p>
            <p className="text-xs text-on-surface-variant">
              {row.original.player.primary_position || 'Sem posição'}
            </p>
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
        cell: ({ row }) => (
          <Badge variant="secondary">
            {row.original.transfer_type_display || row.original.transfer_type}
          </Badge>
        ),
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => (
          <Badge variant={transferStatusVariant(row.original.status)}>
            {row.original.status_display || row.original.status}
          </Badge>
        ),
      },
      {
        id: 'fee',
        header: 'Valor',
        cell: ({ row }) => (
          <span className="font-data-tabular text-sm text-on-surface-variant">
            {formatTransferFee(row.original.fee)}
          </span>
        ),
      },
      {
        id: 'date',
        header: 'Data',
        cell: ({ row }) => (
          <span className="font-data-tabular text-sm text-on-surface-variant">
            {formatTransferDate(row.original.transfer_date)}
          </span>
        ),
      },
      {
        id: 'actions',
        header: '',
        cell: ({ row }) => (
          <Button asChild variant="ghost" size="sm">
            <Link to={detailPath(row.original.id)}>Detalhe</Link>
          </Button>
        ),
      },
    ],
    [isClubScope],
  )

  const title = isClubScope
    ? club
      ? `Transferências • ${club.name}`
      : 'Transferências do Clube'
    : 'Transferências'
  const subtitle = isClubScope
    ? 'Acompanhe o histórico de movimentos e aplique filtros rápidos para leitura executiva.'
    : 'Painel de transferências da organização — aprovação, histórico e empréstimos.'

  if (isClubScope && (clubLoading || !club)) {
    return (
      <DashboardLayout
        title="Transferências do Clube"
        subtitle="Carregando movimentos..."
        dashboardType="club"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-[2rem]" />
          <Skeleton className="h-96 w-full rounded-[2rem]" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      dashboardType={isClubScope ? 'club' : 'organization'}
      sidebarLinks={sidebarLinks}
      headerActions={
        <div className="flex gap-sm">
          <Button asChild variant="secondary" size="sm">
            <Link to={backPath}>
              <ArrowLeft className="h-4 w-4" />
              <span>Voltar</span>
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link to={createPath}>
              <Plus className="h-4 w-4" />
              <span>Nova Transferência</span>
            </Link>
          </Button>
        </div>
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
              Consulta rápida com filtros por tipo e estado. Abra o detalhe para aprovar, rejeitar ou
              concluir o fluxo.
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
                  <Filter
                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-outline"
                    aria-hidden="true"
                  />
                  <Input
                    id="transfer-search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="pl-10"
                    placeholder="Jogador ou clube"
                    aria-label="Pesquisar transferências"
                  />
                </div>
              </FormField>
              <FormField label="Estado" htmlFor="transfer-status">
                <Select
                  id="transfer-status"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as TransferStatus | 'all')}
                >
                  <option value="all">Todos</option>
                  <option value="pending">Pendente</option>
                  <option value="approved">Aprovada</option>
                  <option value="completed">Concluída</option>
                  <option value="cancelled">Cancelada</option>
                  <option value="returned">Devolvida</option>
                </Select>
              </FormField>
              <FormField label="Tipo" htmlFor="transfer-type">
                <Select
                  id="transfer-type"
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value as TransferType | 'all')}
                >
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
                title={hasFilters ? 'Sem resultados' : 'Sem transferências'}
                description={
                  hasFilters
                    ? 'Nenhuma transferência corresponde aos filtros atuais. Limpe os filtros para ver todos os movimentos.'
                    : 'Ainda não há movimentos registados.'
                }
                icon={Trophy}
                action={{
                  label: hasFilters ? 'Limpar filtros' : 'Nova transferência',
                  onClick: () => {
                    if (hasFilters) {
                      setQuery('')
                      setStatusFilter('all')
                      setTypeFilter('all')
                      return
                    }
                    navigate(createPath)
                  },
                }}
              />
            ) : (
              <DataTable
                columns={columns}
                data={rows}
                isLoading={false}
                emptyMessage="Sem transferências."
                enableSorting={false}
              />
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}

export default TransfersListPage
