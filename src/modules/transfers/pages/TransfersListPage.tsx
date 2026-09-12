import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { ArrowLeft, ArrowRightLeft, CheckCircle2, Clock, Filter, Plus, SlidersHorizontal, Trophy, Settings, Shield } from 'lucide-react'
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
  Label,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Skeleton,
} from '@/components/ui'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import { getOrganizationSidebarSections } from '@/modules/organizations/constants/navigation'
import { useClubMe } from '@/modules/clubs/hooks/useClubs'
import { ClubLogo } from '@/modules/clubs/components/ClubLogo'
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

  const sidebarSections = isClubScope ? getClubSidebarSections() : getOrganizationSidebarSections('overview')

  const stats = useMemo(() => {
    const list = transfersData?.results ?? []
    const total = list.length
    const pending = list.filter((t) => ['pending', 'in_progress', 'draft'].includes(t.status?.toLowerCase())).length
    const completed = list.filter((t) => t.status?.toLowerCase() === 'completed').length
    const loans = list.filter((t) => t.transfer_type?.toLowerCase() === 'loan').length
    return { total, pending, completed, loans }
  }, [transfersData?.results])

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
        sidebarSections={sidebarSections}
      >
        <div className="space-y-lg">
          <Skeleton className="h-36 w-full rounded-2xl" />
          <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={title}
      subtitle={subtitle}
      dashboardType={isClubScope ? 'club' : 'organization'}
      sidebarSections={sidebarSections}
      headerActions={
        <div className="flex items-center gap-sm">
          <Button asChild variant="secondary" size="sm">
            <Link to={backPath}>
              <ArrowLeft className="mr-xs h-4 w-4" />
              <span>Voltar ao Painel</span>
            </Link>
          </Button>
          <Button asChild variant="primary" size="sm">
            <Link to={createPath}>
              <Plus className="mr-xs h-4 w-4" />
              <span>Nova Transferência</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-xl">
        {/* Executive Page Header */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-xs">
          <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-md">
              {isClubScope && club ? (
                <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container/50 p-1 flex items-center justify-center">
                  <ClubLogo logoUrl={club.logo_url} name={club.name} size="lg" />
                </div>
              ) : (
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <ArrowRightLeft className="h-7 w-7" />
                </div>
              )}
              <div>
                <div className="flex flex-wrap items-center gap-xs">
                  <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary font-semibold text-[11px]">
                    <ArrowRightLeft className="mr-1 h-3 w-3" />
                    Mercado & Transferências
                  </Badge>
                  {isClubScope && (club?.tenant_name || (club as any)?.association_name) && (
                    <Badge variant="outline" className="text-[11px] text-on-surface-variant">
                      {club?.tenant_name || (club as any)?.association_name}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
                  {title}
                </h1>
                <p className="text-xs text-on-surface-variant">
                  {subtitle}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-xs">
              {isClubScope && (
                <Button asChild variant="secondary" size="sm">
                  <Link to={ROUTES.DASHBOARD_CLUB_PLAYER_REQUESTS}>
                    Pedidos de Vínculo
                  </Link>
                </Button>
              )}
              <Button asChild variant="primary" size="sm">
                <Link to={createPath}>
                  <Plus className="mr-xs h-4 w-4" />
                  Nova Transferência
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* 4 KPIs Row */}
        <div className="grid gap-md sm:grid-cols-2 lg:grid-cols-4">
          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Movimentos Totais</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <ArrowRightLeft className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-on-surface">{stats.total}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Histórico de transferências</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Em Negociação</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#ba751b]/10 text-[#ba751b]">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#ba751b]">{stats.pending}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">A aguardar aprovação federativa</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Concluídas</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0f6e56]/10 text-[#0f6e56]">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-[#0f6e56]">{stats.completed}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Processos fechados e homologados</p>
            </CardContent>
          </Card>

          <Card variant="flat" padding="none" className="border-outline-variant/30 bg-surface shadow-xs transition-all hover:border-primary/30">
            <CardContent className="p-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium uppercase tracking-wider text-on-surface-variant">Empréstimos</p>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#534ab7]/10 text-[#534ab7]">
                  <Shield className="h-4 w-4" />
                </div>
              </div>
              <p className="mt-2 text-2xl font-bold text-on-surface">{stats.loans}</p>
              <p className="mt-0.5 text-[11px] text-on-surface-variant">Cedências temporárias ativas</p>
            </CardContent>
          </Card>
        </div>

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
              <div className="space-y-2">
                <Label htmlFor="transfer-status">Estado</Label>
                <Select
                  value={statusFilter}
                  onValueChange={(value) => setStatusFilter(value as TransferStatus | 'all')}
                >
                  <SelectTrigger id="transfer-status">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pending">Pendente</SelectItem>
                    <SelectItem value="approved">Aprovada</SelectItem>
                    <SelectItem value="completed">Concluída</SelectItem>
                    <SelectItem value="cancelled">Cancelada</SelectItem>
                    <SelectItem value="returned">Devolvida</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="transfer-type">Tipo</Label>
                <Select
                  value={typeFilter}
                  onValueChange={(value) => setTypeFilter(value as TransferType | 'all')}
                >
                  <SelectTrigger id="transfer-type">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="permanent">Permanente</SelectItem>
                    <SelectItem value="loan">Empréstimo</SelectItem>
                    <SelectItem value="free_agent">Livre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
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
