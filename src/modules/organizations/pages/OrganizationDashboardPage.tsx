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
  useLaunchOrganization,
} from '../hooks'
import { KpiCard } from '../components'
import { ArrowRight, CheckCircle2, PlusCircle, Rocket, Settings, Shield, Trophy, Users } from 'lucide-react'
import TransferItem from '../components/TransferItem'
import { useTransfers } from '@/modules/transfers'
import { toast } from 'sonner'
import type { OrganizationClub } from '../types'

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

function formatTimeAgo(dateString?: string | null): string {
  if (!dateString) return 'Recentemente'
  try {
    const date = new Date(dateString)
    if (isNaN(date.getTime())) return 'Recentemente'
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / (1000 * 60))
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffMins < 1) return 'Agora mesmo'
    if (diffMins < 60) return `Há ${diffMins} min`
    if (diffHours < 24) return `Há ${diffHours} h`
    if (diffDays === 1) return 'Ontem'
    if (diffDays < 30) return `Há ${diffDays} dias`
    return date.toLocaleDateString('pt-AO', { day: '2-digit', month: '2-digit', year: 'numeric' })
  } catch {
    return 'Recentemente'
  }
}

export default function OrganizationDashboardPage() {
  const { data: org, isLoading: isLoadingOrg } = useOrganizationMe()
  const slug = org?.slug

  const { data: kpis, isLoading: isLoadingKpis } = useOrganizationKpis(slug)
  const { data: clubs, isLoading: isLoadingClubs } = useOrganizationClubs(slug)
  const { data: tournaments, isLoading: isLoadingTournaments } = useOrganizationTournaments(slug)
  const { data: transfers, isLoading: isLoadingTransfers } = useTransfers({ page_size: 4 })
  const transferResults = transfers?.results ?? []
  const launchOrganization = useLaunchOrganization()

  const headerActions = (
    <Button variant="primary" size="sm" asChild>
      <Link to={ROUTES.COMPETITION_CREATE}>
        <PlusCircle className="h-4 w-4" />
        <span>Criar Competição</span>
      </Link>
    </Button>
  )

  const sidebarLinks = [
    { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" />, active: true },
    { label: 'Clubes Associados', href: ROUTES.DASHBOARD_ORGANIZATION_CLUBS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Competições', href: ROUTES.DASHBOARD_ORGANIZATION_COMPETITIONS, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS, icon: <Users className="h-4 w-4" /> },
    { label: 'Pedidos de Filiação', href: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="h-4 w-4" /> },
  ]

  const isLoadingKpiSection = isLoadingOrg || isLoadingKpis
  const isLoadingTournamentsSection = isLoadingOrg || isLoadingTournaments
  const isPendingLaunch = org?.status === 'pending'

  const handleLaunchPortal = () => {
    launchOrganization.mutate(undefined, {
      onSuccess: (result) => {
        toast.success('Portal lançado com sucesso.')
        if (result.portal_url) {
          toast.info(`Portal público: ${result.portal_url}`)
        }
      },
      onError: (error: unknown) => {
        const message =
          (error as { response?: { data?: { message?: string } } })?.response?.data?.message ||
          'Erro ao lançar portal.'
        toast.error(message)
      },
    })
  }

  const tournamentRows = useMemo(
    () => (Array.isArray(tournaments) ? (tournaments as OrganizationTournamentRow[]) : []),
    [tournaments],
  )

  const tournamentColumns = useMemo<ColumnDef<OrganizationTournamentRow>[]>(
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

  const clubRows = useMemo(
    () => (Array.isArray(clubs) ? (clubs as OrganizationClub[]) : []),
    [clubs],
  )

  const clubColumns = useMemo<ColumnDef<OrganizationClub>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Clube',
        cell: ({ row }) => (
          <div className="flex items-center gap-sm">
            {row.original.logo_url ? (
              <img src={row.original.logo_url} alt={row.original.name} className="h-6 w-6 rounded-full object-cover" />
            ) : (
              <div className="h-6 w-6 rounded-full bg-primary-container text-primary font-bold flex items-center justify-center text-[10px]">
                {row.original.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-semibold">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'city',
        header: 'Cidade/Província',
        cell: ({ row }) => <span className="text-xs text-on-surface-variant">{row.original.city || '—'}</span>,
      },
      {
        accessorKey: 'stadium_name',
        header: 'Estádio',
        cell: ({ row }) => <span className="text-xs text-on-surface-variant">{row.original.stadium_name || '—'}</span>,
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const s = row.original.status || 'active'
          return s.toLowerCase() === 'active' ? (
            <Badge variant="success">Ativo</Badge>
          ) : (
            <Badge variant="default">{row.original.status_label || 'Pendente'}</Badge>
          )
        },
      },
    ],
    [],
  )

  return (
    <DashboardLayout
      title={org ? `Portal — ${org.name}` : 'Portal da Organização'}
      subtitle="Painel administrativo de gestão de clubes, competições e estatísticas"
      dashboardType="organization"
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
          {isLoadingKpiSection ? (
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
                value={kpis?.total_clubs ?? clubRows.length}
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

      {isPendingLaunch && (
        <Card padding="md" className="mb-lg border-primary/30 bg-primary-container/10">
          <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex gap-md">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary-container text-primary">
                <Rocket className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <h2 className="font-title-md text-base text-on-surface">Portal pendente de lançamento</h2>
                <p className="mt-xs max-w-2xl text-sm text-on-surface-variant">
                  Publique a organização para ativar o portal público e disponibilizar competições, clubes e estatísticas aos visitantes.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={handleLaunchPortal}
              loading={launchOrganization.isPending}
              className="w-full md:w-auto"
            >
              {launchOrganization.isPending ? (
                'A lançar...'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4" />
                  <span>Lançar Portal</span>
                </>
              )}
            </Button>
          </div>
        </Card>
      )}

      <div className="grid animate-fade-in grid-cols-12 gap-lg">
        {/* Competições */}
        <Card padding="none" className="col-span-12 flex flex-col justify-between overflow-hidden lg:col-span-8">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              <Trophy className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>Competições Organizacionais</span>
            </CardTitle>
            <Button variant="link" size="sm" asChild className="text-xs">
              <Link to={ROUTES.DASHBOARD_ORGANIZATION_COMPETITIONS}>
                <span>Ver todas</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={tournamentColumns}
              data={tournamentRows}
              isLoading={isLoadingTournamentsSection}
              emptyMessage="Nenhuma competição configurada de momento."
              emptyAction={
                <Button variant="primary" size="sm" asChild>
                  <Link to={ROUTES.COMPETITIONS}>
                    <PlusCircle className="h-3.5 w-3.5" />
                    <span>Configurar Competição</span>
                  </Link>
                </Button>
              }
            />
          </CardContent>
        </Card>

        {/* Transferências */}
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
              
              {isLoadingTransfers ? (
                <div className="space-y-sm">
                  <Skeleton className="h-14 w-full rounded" />
                  <Skeleton className="h-14 w-full rounded" />
                </div>
              ) : transferResults.length > 0 ? (
                <div className="space-y-sm">
                  {transferResults.map((transfer) => (
                    <TransferItem
                      key={transfer.id}
                      playerName={transfer.player.full_name}
                      fromClub={transfer.from_club?.name || 'Sem Clube'}
                      toClub={transfer.to_club.name}
                      timeAgo={formatTimeAgo(
                        transfer.completed_at || transfer.transfer_date || transfer.created_at,
                      )}
                    />
                  ))}
                </div>
              ) : (
                <div className="py-md text-center text-xs text-on-surface-variant">
                  Nenhuma transferência recente registada.
                </div>
              )}
            </CardContent>
          </div>

          <CardFooter className="justify-center border-t border-outline-variant/20 pt-sm">
            <Button variant="link" size="sm" asChild className="text-xs">
              <Link to={ROUTES.DASHBOARD_TRANSFERS}>
                <span>Ver painel de transferências</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>

        {/* Clubes Associados */}
        <Card padding="none" className="col-span-12 flex flex-col justify-between overflow-hidden lg:col-span-8">
          <CardHeader className="flex-row items-center justify-between">
            <CardTitle>
              <Shield className="h-5 w-5 text-primary" aria-hidden="true" />
              <span>Clubes Associados</span>
            </CardTitle>
            <Button variant="link" size="sm" asChild className="text-xs">
              <Link to={ROUTES.DASHBOARD_ORGANIZATION_CLUBS}>
                <span>Ver todos</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardHeader>

          <CardContent className="p-0">
            <DataTable
              columns={clubColumns}
              data={clubRows}
              isLoading={isLoadingClubs}
              emptyMessage="Nenhum clube associado registado."
              emptyAction={
                <Button variant="primary" size="sm" asChild>
                <Link to={ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS}>
                  <PlusCircle className="h-3.5 w-3.5" />
                  <span>Vincular Novo Clube</span>
                </Link>
              </Button>
              }
            />
          </CardContent>
        </Card>

        {/* Ações Rápidas & Atividade Recente */}
        <div className="col-span-12 lg:col-span-4 flex flex-col gap-lg">
          {/* Ações Rápidas */}
          <Card className="flex-1">
            <CardHeader className="pb-sm">
              <CardTitle>
                <span>Ações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-sm">
              <Button variant="outline" size="sm" asChild className="justify-start gap-md">
                <Link to={ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS}>
                  <PlusCircle className="h-4 w-4 text-primary" />
                  <span>Vincular Novo Clube</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start gap-md">
                <Link to={ROUTES.COMPETITION_CREATE}>
                  <Trophy className="h-4 w-4 text-primary" />
                  <span>Publicar Nova Competição</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start gap-md">
                <Link to={ROUTES.DASHBOARD_ORGANIZATION_MEMBERS}>
                  <Users className="h-4 w-4 text-primary" />
                  <span>Convidar Membro</span>
                </Link>
              </Button>
              <Button variant="outline" size="sm" asChild className="justify-start gap-md">
                <Link to={ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS}>
                  <Shield className="h-4 w-4 text-primary" />
                  <span>Rever Filiações</span>
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card className="flex-1">
            <CardHeader className="pb-sm">
              <CardTitle>
                <span>Atividade Recente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-sm">
              <div className="flex gap-md text-xs items-start">
                <span className="bg-primary-container text-primary font-bold px-sm py-xs rounded text-[9px] uppercase tracking-wider select-none shrink-0">Sistema</span>
                <div>
                  <p className="font-semibold text-on-surface">Configuração concluída</p>
                  <p className="text-on-surface-variant text-[10px]">O portal da organização foi configurado com sucesso.</p>
                </div>
              </div>
              {clubRows.length > 0 && (
                <div className="flex gap-md text-xs items-start border-t border-outline-variant/20 pt-sm">
                  <span className="bg-secondary-container text-[#adb4ce] font-bold px-sm py-xs rounded text-[9px] uppercase tracking-wider select-none shrink-0">Clubes</span>
                  <div>
                    <p className="font-semibold text-on-surface">Clube filiado</p>
                    <p className="text-on-surface-variant text-[10px]">{clubRows[0].name} associado à organização.</p>
                  </div>
                </div>
              )}
              {tournamentRows.length > 0 && (
                <div className="flex gap-md text-xs items-start border-t border-outline-variant/20 pt-sm">
                  <span className="bg-tertiary-container text-[#4f3e00] font-bold px-sm py-xs rounded text-[9px] uppercase tracking-wider select-none shrink-0">Torneios</span>
                  <div>
                    <p className="font-semibold text-on-surface">Competição ativa</p>
                    <p className="text-on-surface-variant text-[10px]">{tournamentRows[0].name} listado no portal.</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  )
}
