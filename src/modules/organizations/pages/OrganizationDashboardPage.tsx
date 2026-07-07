import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  DataTable,
  Skeleton,
} from '@/components/ui'
import {
  useOrganizationMe,
  useOrganizationKpis,
  useOrganizationClubs,
  useOrganizationTournaments,
} from '../hooks'
import { KpiCard } from '../components'
import { ArrowRight, PlusCircle, Settings, Shield, Trophy, Users } from 'lucide-react'
import TransferItem from '../components/TransferItem'

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

export default function OrganizationDashboardPage() {
  const { data: org, isLoading: isLoadingOrg } = useOrganizationMe()
  const slug = org?.slug

  const { data: kpis, isLoading: isLoadingKpis } = useOrganizationKpis(slug)
  const { data: clubs, isLoading: isLoadingClubs } = useOrganizationClubs(slug)
  const { data: tournaments, isLoading: isLoadingTournaments } = useOrganizationTournaments(slug)

  const headerActions = (
    <Button variant="primary" size="sm" asChild>
      <Link to={ROUTES.ONBOARDING + '/competition'}>
        <PlusCircle className="h-4 w-4" />
        <span>Criar Competição</span>
      </Link>
    </Button>
  )

  const sidebarLinks = [
    { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" />, active: true },
    { label: 'Clubes Associados', href: ROUTES.CLUBS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Competições', href: ROUTES.ONBOARDING + '/competition', icon: <Trophy className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="h-4 w-4" /> },
  ]

  const isLoadingAny = isLoadingOrg || isLoadingKpis || isLoadingTournaments || isLoadingClubs

  const tournamentRows = useMemo(
    () => (Array.isArray(tournaments) ? (tournaments as OrganizationTournamentRow[]) : []),
    [tournaments],
  )

  const tournamentColumns = useMemo<ColumnDef<OrganizationTournamentRow>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome',
        cell: ({ row }) => <span className="font-semibold">{row.original.name}</span>,
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
        enableSorting: false,
      },
    ],
    [],
  )

  return (
    <DashboardLayout
      title={org ? `Portal — ${org.name}` : 'Portal da Organização'}
      subtitle="Painel administrativo de gestão de clubes, competições e estatísticas"
      dashboardType="federation"
      sidebarLinks={sidebarLinks}
      headerActions={headerActions}
    >
      <div className="mb-xl flex animate-fade-in flex-col justify-between gap-lg md:flex-row md:items-end">
        <div>
          <h1 className="mb-xs font-display-lg text-3xl leading-none tracking-tight text-on-surface">
            {org ? `Bem-vindo, ${org.name}` : 'Bem-vindo'}
          </h1>
          <p className="text-sm text-on-surface-variant">Consola operacional e resumo analítico da sua organização.</p>
        </div>

        <div className="flex w-full gap-md md:w-auto">
          {isLoadingAny ? (
            <>
              <Skeleton className="h-20 w-32 rounded-xl" />
              <Skeleton className="h-20 w-32 rounded-xl" />
              <Skeleton className="h-20 w-32 rounded-xl" />
            </>
          ) : (
            <>
              <KpiCard
                label="Torneios Ativos"
                value={kpis?.active_tournaments ?? 0}
                icon={<Trophy className="h-4 w-4" />}
                className="min-w-[120px] flex-1 py-md px-lg md:flex-none"
              />
              <KpiCard
                label="Clubes"
                value={kpis?.total_clubs ?? (Array.isArray(clubs) ? clubs.length : 0)}
                icon={<Shield className="h-4 w-4" />}
                className="min-w-[120px] flex-1 py-md px-lg md:flex-none"
              />
              <KpiCard
                label="Subscritores"
                value={kpis?.active_subscribers ?? 0}
                icon={<Users className="h-4 w-4" />}
                className="min-w-[120px] flex-1 py-md px-lg md:flex-none"
              />
            </>
          )}
        </div>
      </div>

      <div className="grid animate-fade-in grid-cols-12 gap-lg">
        <Card padding="none" className="col-span-12 flex flex-col justify-between overflow-hidden lg:col-span-8">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>Competições Organizacionais</span>
            </CardTitle>
            <Button variant="link" size="sm" asChild className="text-xs">
              <Link to={ROUTES.ONBOARDING + '/competition'}>
                <span>Ver todas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={tournamentColumns}
              data={tournamentRows}
              isLoading={isLoadingAny}
              emptyMessage="Nenhuma competição configurada de momento."
              emptyAction={
                <Button variant="primary" size="sm" asChild>
                  <Link to={ROUTES.ONBOARDING + '/competition'}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Configurar Competição</span>
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>

        <Card padding="none" className="col-span-12 flex flex-col justify-between lg:col-span-4">
          <div>
            <CardHeader>
              <CardTitle>
                <Users className="h-5 w-5 text-primary" aria-hidden="true" />
                <span>Movimentações & Transferências</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-md">
              <p className="text-xs text-on-surface-variant">
                Registo de transferências e renovações de contratos federativos.
              </p>
              <div className="space-y-sm">
                <TransferItem
                  playerName="Manuel Neto"
                  fromClub="Atlético de Luanda"
                  toClub="1º de Agosto"
                  timeAgo="2 horas atrás"
                />
                <TransferItem
                  playerName="Gelson Kiala"
                  fromClub="Sagrada Esperança"
                  toClub="Petro de Luanda"
                  timeAgo="Ontem"
                />
              </div>
            </CardContent>
          </div>

          <CardFooter className="justify-center">
            <Button variant="link" size="sm" asChild className="text-xs">
              <Link to={ROUTES.TRANSFERS || '/transfers'}>
                <span>Ver painel de transferências</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  )
}
