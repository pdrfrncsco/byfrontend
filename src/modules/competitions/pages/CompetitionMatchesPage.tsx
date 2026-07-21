import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import {
  Badge,
  Card,
  DataTable,
  EmptyState,
  Skeleton,
} from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { competitionRoutes } from '../routes'
import { ROUTES } from '@/constants/routes'
import {
  Trophy,
  Home,
  Calendar,
  Gavel,
  MapPin,
  ShieldAlert,
} from 'lucide-react'
import { useMatchesPaginated } from '../hooks'
import type { Match } from '../types'

function getStatusBadge(status: string) {
  switch (status) {
    case 'live':
      return <Badge variant="success">Ao Vivo</Badge>
    case 'finished':
      return <Badge variant="outline">Terminado</Badge>
    case 'scheduled':
      return <Badge variant="secondary">Agendado</Badge>
    case 'postponed':
      return <Badge variant="warning">Adiado</Badge>
    case 'cancelled':
      return <Badge variant="danger">Cancelado</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}

export function CompetitionMatchesPage() {
  const { data, isLoading } = useMatchesPaginated()

  const sidebarLinks = [
    { label: 'Painel da Organização', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Home className="w-5 h-5" /> },
    { label: 'Geral de Provas', href: ROUTES.DASHBOARD_COMPETITION, icon: <Trophy className="w-5 h-5" /> },
    { label: 'Torneios', href: ROUTES.DASHBOARD_COMPETITIONS_LIST, icon: <Trophy className="w-5 h-5" /> },
    { label: 'Partidas', href: ROUTES.DASHBOARD_COMPETITIONS_MATCHES, icon: <Calendar className="w-5 h-5" />, active: true },
    { label: 'Árbitros', href: ROUTES.DASHBOARD_COMPETITION, icon: <Gavel className="w-5 h-5" />, disabled: true },
    { label: 'Estádios', href: ROUTES.DASHBOARD_COMPETITION, icon: <MapPin className="w-5 h-5" />, disabled: true },
    { label: 'Conformidade', href: ROUTES.DASHBOARD_COMPETITION, icon: <ShieldAlert className="w-5 h-5" />, disabled: true },
  ]

  const columns = useMemo<ColumnDef<Match>[]>(
    () => [
      {
        accessorKey: 'home_club_name',
        header: 'Casa',
        cell: ({ row }) => (
          <div className="flex items-center gap-sm">
            {row.original.home_club_logo ? (
              <img src={row.original.home_club_logo} alt={row.original.home_club_name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-container text-primary font-bold flex items-center justify-center text-sm">
                {row.original.home_club_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium">{row.original.home_club_name}</span>
          </div>
        ),
      },
      {
        id: 'score',
        header: 'Resultado',
        cell: ({ row }) => (
          <div className="flex items-center gap-xs font-data-tabular">
            <span className={row.original.status === 'live' ? 'text-red-500 font-bold' : ''}>
              {row.original.home_score ?? '-'}
            </span>
            <span className="text-xs text-on-surface-variant">x</span>
            <span className={row.original.status === 'live' ? 'text-red-500 font-bold' : ''}>
              {row.original.away_score ?? '-'}
            </span>
          </div>
        ),
      },
      {
        accessorKey: 'away_club_name',
        header: 'Fora',
        cell: ({ row }) => (
          <div className="flex items-center gap-sm">
            {row.original.away_club_logo ? (
              <img src={row.original.away_club_logo} alt={row.original.away_club_name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-container text-primary font-bold flex items-center justify-center text-sm">
                {row.original.away_club_name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="text-sm font-medium">{row.original.away_club_name}</span>
          </div>
        ),
      },
      {
        accessorKey: 'match_date',
        header: 'Data',
        cell: ({ row }) => {
          const date = new Date(row.original.match_date)
          return (
            <span className="text-xs">
              {date.toLocaleDateString('pt-PT', { day: '2-digit', month: 'short', year: 'numeric' })}
              <br />
              {date.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })}
            </span>
          )
        },
      },
      {
        id: 'round',
        header: 'Rodada',
        accessorFn: (row) => row.round_number,
        cell: ({ row }) => <span className="text-xs font-medium">{row.original.round_number}</span>,
      },
      {
        id: 'status',
        header: 'Status',
        cell: ({ row }) => getStatusBadge(row.original.status),
      },
      {
        id: 'actions',
        header: 'Ações',
        cell: ({ row }) => (
          <Link to={competitionRoutes.adminMatchCenter(row.original.competition, row.original.id)}>
            <button className="text-xs text-primary hover:underline">Ver Detalhes</button>
          </Link>
        ),
      },
    ],
    [],
  )

  const matches = useMemo(() => data?.results ?? [], [data?.results])

  return (
    <DashboardLayout
      title="Partidas"
      subtitle="Gerencie todas as partidas da organização"
      dashboardType="competition"
      sidebarLinks={sidebarLinks}
    >
      <div className="animate-fade-in">
        {isLoading ? (
          <Card padding="none">
            <div className="divide-y divide-outline-variant/20">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md px-lg py-md">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-xs">
                    <Skeleton className="h-4 w-32 rounded" />
                    <Skeleton className="h-3 w-24 rounded" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : matches.length === 0 ? (
          <EmptyState
            icon={Calendar}
            title="Sem Partidas"
            description="Ainda não há partidas registadas."
          />
        ) : (
          <Card padding="none" className="overflow-hidden">
            <DataTable<Match, unknown>
              columns={columns}
              data={matches}
              isLoading={isLoading}
              emptyMessage="Nenhuma partida encontrada"
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
