import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Badge, Card, DataTable, Skeleton, EmptyState, Button } from '@/components/ui'
import { useOrganizationTournaments, useOrganizationMe } from '../hooks'
import { Settings, Shield, Trophy, Users, PlusCircle } from 'lucide-react'
import { Link } from 'react-router-dom'

interface OrganizationTournamentRow {
  id: string
  name: string
  type_label?: string
  competition_type?: string
  season: string
  status_label?: string
  status?: string
}

function getStatusBadge(status: string) {
  const s = status.toLowerCase()
  if (s.includes('active') || s.includes('curso') || s.includes('live')) {
    return <Badge variant="success">Em Curso</Badge>
  }
  if (s.includes('complete') || s.includes('concl')) {
    return <Badge variant="warning">Concluído</Badge>
  }
  return <Badge variant="default">Planeado</Badge>
}

export function OrganizationCompetitionsPage() {
  const { data: org } = useOrganizationMe()
  const { data: tournaments, isLoading: isLoadingTournaments } = useOrganizationTournaments(org?.slug)

  const sidebarLinks = [
    { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Clubes Associados', href: ROUTES.DASHBOARD_ORGANIZATION_CLUBS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Competições', href: ROUTES.DASHBOARD_ORGANIZATION_COMPETITIONS, icon: <Trophy className="h-4 w-4" />, active: true },
    { label: 'Membros', href: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS, icon: <Users className="h-4 w-4" /> },
    { label: 'Pedidos de Filiação', href: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="h-4 w-4" /> },
  ]

  const columns = useMemo<ColumnDef<OrganizationTournamentRow>[]>(
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
        id: 'format',
        header: 'Formato',
        accessorFn: (row) => row.type_label || row.competition_type || 'Liga',
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant">
            {row.original.type_label || row.original.competition_type || 'Liga'}
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
        accessorFn: (row) => row.status_label || row.status || 'active',
        cell: ({ row }) => getStatusBadge(row.original.status_label || row.original.status || 'active'),
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

  const tournamentRows = useMemo(() => (Array.isArray(tournaments) ? (tournaments as OrganizationTournamentRow[]) : []), [tournaments])

  return (
    <DashboardLayout
      title="Competições"
      subtitle="Gerencie as competições organizadas pela sua organização."
      dashboardType="organization"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button variant="primary" size="sm" asChild>
          <Link to={ROUTES.COMPETITION_CREATE}>
            <PlusCircle className="h-4 w-4" />
            <span>Criar Competição</span>
          </Link>
        </Button>
      }
    >
      <div className="animate-fade-in">
        {isLoadingTournaments ? (
          <Card padding="none">
            <div className="divide-y divide-outline-variant/20">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md px-lg py-md">
                  <div className="flex-1 space-y-xs">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded" />
                  <Skeleton className="h-5 w-16 rounded" />
                  <Skeleton className="h-5 w-28 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : tournamentRows.length === 0 ? (
          <EmptyState
            icon={Trophy}
            title="Sem competições"
            description="Ainda não há competições organizadas pela sua organização."
          />
        ) : (
          <Card padding="none" className="overflow-hidden">
            <DataTable<OrganizationTournamentRow, unknown>
              columns={columns}
              data={tournamentRows}
              isLoading={false}
              emptyMessage="Nenhuma competição."
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
