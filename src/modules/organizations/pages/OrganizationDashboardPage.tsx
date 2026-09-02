import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { cn } from '@/lib/utils'
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  DataTable,
  KpiCard,
  Skeleton,
} from '@/components/ui'
import {
  useOrganizationMe,
  useOrganizationKpis,
  useOrganizationClubs,
  useOrganizationTournaments,
  useLaunchOrganization,
  useOnboardingStatus,
} from '../hooks'
import { ArrowLeftRight, ArrowRight, Building2, CheckCircle2, PlusCircle, Rocket, Shield, Trophy, UserCheck, Users } from 'lucide-react'
import TransferItem from '../components/TransferItem'
import { useTransfers } from '@/modules/transfers'
import { toast } from 'sonner'
import type { OrganizationClub } from '../types'
import { getOrganizationSidebarSections } from '../constants/navigation'

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
  const { data: onboarding } = useOnboardingStatus()
  const slug = org?.slug
  const showLineups = Boolean(onboarding?.is_organization_admin)

  const { data: kpis, isLoading: isLoadingKpis } = useOrganizationKpis(slug)
  const { data: clubs, isLoading: isLoadingClubs } = useOrganizationClubs(slug)
  const { data: tournaments, isLoading: isLoadingTournaments } = useOrganizationTournaments(slug)
  const { data: transfers, isLoading: isLoadingTransfers } = useTransfers({ page_size: 4 })
  const transferResults = useMemo(() => transfers?.results ?? [], [transfers])
  const launchOrganization = useLaunchOrganization()

  const headerActions = (
    <Button variant="primary" size="sm" asChild>
      <Link to={ROUTES.COMPETITION_CREATE}>
        <PlusCircle className="h-4 w-4" />
        <span>Criar Competição</span>
      </Link>
    </Button>
  )

  const sidebarSections = getOrganizationSidebarSections('overview', { showLineups })

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
            className="font-bold text-on-surface hover:text-primary transition-colors duration-200"
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
          <span className="inline-flex items-center rounded-md bg-surface-container-high px-2 py-0.5 text-[11px] font-medium text-on-surface-variant">
            {row.original.type_label || row.original.competition_type || 'Liga'}
          </span>
        ),
      },
      {
        accessorKey: 'season',
        header: 'Época',
        cell: ({ row }) => <span className="font-data-tabular text-xs opacity-70">{row.original.season}</span>,
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
          <Button variant="outline" size="sm" asChild className="h-8 rounded-full px-3 text-xs font-semibold transition-all duration-200 hover:bg-primary/10 hover:text-primary hover:border-primary/50">
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
              <img src={row.original.logo_url} alt={row.original.name} className="h-7 w-7 rounded-full object-cover ring-1 ring-outline-variant/30 shadow-sm" />
            ) : (
              <div className="h-7 w-7 rounded-full bg-primary-container text-primary font-bold flex items-center justify-center text-[10px] ring-1 ring-outline-variant/30">
                {row.original.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-bold text-on-surface">{row.original.name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'city',
        header: 'Localização',
        cell: ({ row }) => (
          <div className="flex flex-col">
            <span className="text-sm font-medium text-on-surface">{row.original.city || '—'}</span>
            {row.original.stadium_name && (
              <span className="text-[11px] text-on-surface-variant opacity-70">{row.original.stadium_name}</span>
            )}
          </div>
        ),
      },
      {
        id: 'status',
        header: 'Estado',
        cell: ({ row }) => {
          const s = row.original.status || 'active'
          return s.toLowerCase() === 'active' ? (
            <Badge variant="success" className="rounded-full px-2 py-0.5 text-[10px] font-bold">Ativo</Badge>
          ) : (
            <Badge variant="default" className="rounded-full px-2 py-0.5 text-[10px] font-bold">{row.original.status_label || 'Pendente'}</Badge>
          )
        },
      },
    ],
    [],
  )


  const activeClubsCount = useMemo(() => {
    if (kpis?.active_clubs !== undefined) return kpis.active_clubs
    return clubRows.filter((c) => (c.status || 'active').toLowerCase() === 'active').length
  }, [kpis, clubRows])

  const ongoingCompetitionsCount = useMemo(() => {
    if (kpis?.ongoing_competitions !== undefined) return kpis.ongoing_competitions
    if (kpis?.active_tournaments !== undefined) return kpis.active_tournaments
    return tournamentRows.filter((t) => {
      const s = (t.status_label || t.status || '').toLowerCase()
      return s.includes('active') || s.includes('curso') || s.includes('live')
    }).length
  }, [kpis, tournamentRows])

  const pendingTransfersCount = useMemo(() => {
    if (kpis?.pending_transfers !== undefined) return kpis.pending_transfers
    return transferResults.filter((t) => (t.status || '').toLowerCase() === 'pending').length
  }, [kpis, transferResults])

  return (
    <DashboardLayout
      title={org ? `Portal — ${org.name}` : 'Portal da Organização'}
      subtitle="Painel administrativo de gestão de clubes, competições e estatísticas"
      dashboardType="organization"
      sidebarSections={sidebarSections}
      headerActions={headerActions}
    >
      <div className="mb-xl flex animate-fade-in flex-col justify-between gap-lg lg:flex-row lg:items-end">
        <div>
          <h1 className="mb-xs font-display-lg text-3xl leading-none tracking-tight text-on-surface">
            {org ? `Bem-vindo, ${org.name}` : 'Bem-vindo'}
          </h1>
          <p className="text-sm text-on-surface-variant">Consola operacional e resumo analítico da sua organização.</p>
        </div>

        <div className="flex w-full flex-wrap gap-md lg:w-auto">
          {isLoadingKpiSection ? (
            <>
              <Skeleton className="h-20 w-32 rounded-xl" />
              <Skeleton className="h-20 w-32 rounded-xl" />
              <Skeleton className="h-20 w-32 rounded-xl" />
              <Skeleton className="h-20 w-32 rounded-xl" />
              <Skeleton className="h-20 w-32 rounded-xl" />
            </>
          ) : (
// ... existing imports ...
            <>
              <KpiCard
                label="Org. Afiliadas"
                value={kpis?.total_affiliated_organizations ?? 1}
                icon={<Building2 className="h-4 w-4" />}
                trend={{ value: '+2%', isPositive: true }}
                className="min-w-[120px] flex-1 py-md px-lg lg:flex-none"
              />
              <KpiCard
                label="Clubes Ativos"
                value={activeClubsCount}
                icon={<Shield className="h-4 w-4" />}
                trend={{ value: '+5%', isPositive: true }}
                className="min-w-[120px] flex-1 py-md px-lg lg:flex-none"
              />
              <KpiCard
                label="Jogadores Registados"
                value={kpis?.registered_players ?? 0}
                icon={<UserCheck className="h-4 w-4" />}
                trend={{ value: '+12%', isPositive: true }}
                className="min-w-[120px] flex-1 py-md px-lg lg:flex-none"
              />
              <KpiCard
                label="Competições em Andamento"
                value={ongoingCompetitionsCount}
                icon={<Trophy className="h-4 w-4" />}
                trend={{ value: '-1', isPositive: false }}
                className="min-w-[120px] flex-1 py-md px-lg lg:flex-none"
              />
              <KpiCard
                label="Transferências Pendentes"
                value={pendingTransfersCount}
                icon={<ArrowLeftRight className="h-4 w-4" />}
                trend={{ value: '+8%', isPositive: false }}
                className="min-w-[120px] flex-1 py-md px-lg lg:flex-none"
              />
            </>
// ... rest of the code ...

          )}
        </div>
      </div>

      {isPendingLaunch && (
        <Card padding="md" className="mb-lg border-primary/40 bg-gradient-to-r from-primary-container/20 to-transparent shadow-sm ring-1 ring-primary/20 animate-fade-in">
          <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex gap-md">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-lg shadow-primary/30 animate-pulse">
                <Rocket className="h-6 w-6" aria-hidden="true" />
              </div>
              <div className="flex flex-col gap-xs">
                <h2 className="font-display-md text-lg font-bold text-on-surface">Portal pendente de lançamento</h2>
                <p className="max-w-2xl text-sm text-on-surface-variant">
                  Publique a organização para ativar o portal público e disponibilizar competições, clubes e estatísticas aos visitantes.
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              size="md"
              onClick={handleLaunchPortal}
              loading={launchOrganization.isPending}
              className="w-full md:w-auto h-11 px-6 rounded-full font-bold shadow-lg shadow-primary/20 transition-all duration-300 hover:scale-105"
            >
              {launchOrganization.isPending ? (
                'A lançar...'
              ) : (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  <span>Lançar Portal Agora</span>
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
                <span className="text-on-surface">Ações Rápidas</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-sm sm:grid-cols-2">
              {[
                {
                  title: 'Vincular Novo Clube',
                  description: 'Adicione novos clubes à sua rede',
                  icon: <PlusCircle className="h-5 w-5" />,
                  to: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS,
                  color: 'text-primary',
                },
                {
                  title: 'Nova Competição',
                  description: 'Publique um novo torneio oficial',
                  icon: <Trophy className="h-5 w-5" />,
                  to: ROUTES.COMPETITION_CREATE,
                  color: 'text-secondary',
                },
                {
                  title: 'Convidar Membro',
                  description: 'Gerencie a equipa administrativa',
                  icon: <Users className="h-5 w-5" />,
                  to: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS,
                  color: 'text-primary',
                },
                {
                  title: 'Rever Filiações',
                  description: 'Audite as organizações afiliadas',
                  icon: <Shield className="h-5 w-5" />,
                  to: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS,
                  color: 'text-primary',
                },
              ].map((action, idx) => (
                <Link
                  key={idx}
                  to={action.to}
                  className="group flex items-start gap-md rounded-xl border border-outline-variant/30 p-md transition-all duration-300 hover:-translate-y-1 hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm"
                >
                  <div className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-surface-container-high transition-colors duration-300 group-hover:bg-primary/20',
                    action.color
                  )}>
                    {action.icon}
                  </div>
                  <div className="flex flex-col overflow-hidden">
                    <span className="font-semibold text-sm text-on-surface transition-colors duration-300 group-hover:text-primary">
                      {action.title}
                    </span>
                    <span className="truncate text-xs text-on-surface-variant">
                      {action.description}
                    </span>
                  </div>
                </Link>
              ))}
            </CardContent>
          </Card>

          {/* Atividade Recente */}
          <Card className="flex-1">
            <CardHeader className="pb-sm">
              <CardTitle>
                <span className="text-on-surface">Atividade Recente</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="relative pl-6">
              {/* Timeline Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-6 w-px bg-outline-variant/30" />

              <div className="space-y-lg">
                {[
                  {
                    type: 'Sistema',
                    title: 'Configuração concluída',
                    description: 'O portal da organização foi configurado com sucesso.',
                    color: 'bg-primary text-primary-container',
                    borderColor: 'border-primary',
                  },
                  ...(clubRows.length > 0 ? [{
                    type: 'Clubes',
                    title: 'Clube filiado',
                    description: `${clubRows[0].name} associado à organização.`,
                    color: 'bg-secondary text-secondary-container',
                    borderColor: 'border-secondary',
                  }] : []),
                  ...(tournamentRows.length > 0 ? [{
                    type: 'Torneios',
                    title: 'Competição ativa',
                    description: `${tournamentRows[0].name} listado no portal.`,
                    color: 'bg-tertiary text-tertiary-container',
                    borderColor: 'border-tertiary',
                  }] : []),
                ].map((activity, idx) => (
                  <div key={idx} className="relative flex gap-md">
                    {/* Timeline Node */}
                    <div className={cn(
                      'absolute -left-[25px] top-1 h-5 w-5 rounded-full border-4 bg-surface ring-1 transition-all duration-300 group-hover:scale-110',
                      activity.borderColor,
                    )} />

                    <div className="flex flex-col gap-xs">
                      <div className="flex items-center gap-xs">
                        <span className={cn(
                          'rounded-full px-1.5 py-0 text-[9px] font-bold uppercase tracking-wider ring-1 ring-inset',
                          activity.color,
                          'ring-outline-variant/20'
                        )}>
                          {activity.type}
                        </span>
                        <span className="text-[10px] text-on-surface-variant opacity-60">Agora mesmo</span>
                      </div>
                      <div>
                        <p className="font-bold text-sm text-on-surface leading-tight">{activity.title}</p>
                        <p className="text-xs text-on-surface-variant leading-relaxed opacity-80">{activity.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

        </div>
      </div>
    </DashboardLayout>
  )
}
