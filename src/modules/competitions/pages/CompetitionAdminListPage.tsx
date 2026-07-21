import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import {
  Badge,
  Button,
  Card,
  DataTable,
  EmptyState,
  Skeleton,
} from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Trophy,
  Home,
  PlusCircle,
  Calendar,
  Gavel,
  MapPin,
  ShieldAlert,
} from 'lucide-react'
import { useCompetitionsPaginated } from '../hooks'
import type { Competition } from '../types'

function getStatusBadge(status: string) {
  const s = status?.toLowerCase()
  if (s === 'active') return <Badge variant="success">EM CURSO</Badge>
  if (s === 'completed') return <Badge variant="warning">CONCLUÍDO</Badge>
  return <Badge variant="default">RASCUNHO</Badge>
}

export function CompetitionAdminListPage() {
  const [page] = useState(1)
  const [pageSize] = useState(10)
  const { data, isLoading } = useCompetitionsPaginated({ page, page_size: pageSize })
  const navigate = useNavigate()

  const sidebarLinks = [
    { label: 'Painel da Organização', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Home className="w-5 h-5" /> },
    { label: 'Geral de Provas', href: ROUTES.DASHBOARD_COMPETITION, icon: <Trophy className="w-5 h-5" /> },
    { label: 'Torneios', href: ROUTES.DASHBOARD_COMPETITIONS_LIST, icon: <Trophy className="w-5 h-5" />, active: true },
    { label: 'Partidas', href: ROUTES.DASHBOARD_COMPETITION, icon: <Calendar className="w-5 h-5" />, disabled: true },
    { label: 'Árbitros', href: ROUTES.DASHBOARD_COMPETITION, icon: <Gavel className="w-5 h-5" />, disabled: true },
    { label: 'Estádios', href: ROUTES.DASHBOARD_COMPETITION, icon: <MapPin className="w-5 h-5" />, disabled: true },
    { label: 'Conformidade', href: ROUTES.DASHBOARD_COMPETITION, icon: <ShieldAlert className="w-5 h-5" />, disabled: true },
  ]

  const headerActions = (
    <Button variant="primary" size="sm" asChild>
      <Link to={ROUTES.COMPETITION_CREATE}>
        <PlusCircle className="h-4 w-4" />
        <span>Criar Nova Competição</span>
      </Link>
    </Button>
  )

  const columns = useMemo<ColumnDef<Competition>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
        cell: ({ row }) => (
          <Link
            to={ROUTES.COMPETITION_SETTINGS(row.original.id)}
            className="font-semibold text-primary hover:underline hover:text-primary-container"
          >
            {row.original.name}
          </Link>
        ),
      },
      {
        accessorKey: 'competition_type',
        header: 'Tipo',
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant">
            {row.original.competition_type || 'Liga'}
          </span>
        ),
      },
      {
        accessorKey: 'season',
        header: 'Época',
        cell: ({ row }) => <span className="font-data-tabular text-xs">{row.original.season}</span>,
      },
      {
        id: 'status',
        header: 'Estado',
        accessorFn: (row) => row.status || 'draft',
        cell: ({ row }) => getStatusBadge(row.original.status || 'draft'),
        enableSorting: false,
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <Button variant="ghost" size="sm" asChild className="text-primary hover:bg-primary-container/20">
            <Link to={ROUTES.COMPETITION_SETTINGS(row.original.id)}>
              Gerir
            </Link>
          </Button>
        ),
      },
    ],
    [],
  )

  const competitionRows = useMemo(() => data?.results ?? [], [data?.results])

  return (
    <DashboardLayout
      title="Torneios"
      subtitle="Gerir todas as competições da organização"
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="animate-fade-in">
        {isLoading ? (
          <Card padding="none">
            <div className="divide-y divide-outline-variant/20">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md px-lg py-md">
                  <Skeleton className="h-7 w-7 rounded-full" />
                  <div className="flex-1 space-y-xs">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : competitionRows.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Sem competições"
            description="Ainda não há competições registadas. Crie a sua primeira competição para começar."
            action={{
              label: 'Criar Nova Competição',
              onClick: () => navigate(ROUTES.COMPETITION_CREATE),
              variant: 'primary',
            }}
          />
        ) : (
          <Card padding="none" className="overflow-hidden">
            <DataTable<Competition, unknown>
              columns={columns}
              data={competitionRows}
              isLoading={false}
              emptyMessage="Nenhuma competição encontrada"
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
