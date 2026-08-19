import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { type ColumnDef } from '@tanstack/react-table'
import { useQuery } from '@tanstack/react-query'
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
  Search,
} from 'lucide-react'
import { useOrganizationMe, useOrganizationTournaments } from '@/modules/organizations/hooks'
import { competitionApi } from '../services/competition.api'
import type { Match } from '../types'
import { MatchCard } from '../components'

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
  const { data: org } = useOrganizationMe()
  const { data: competitions, isLoading: isLoadingCompetitions } = useOrganizationTournaments(org?.slug)
  
  // Fetch matches for each competition
  const competitionQueries = useQuery({
    queryKey: ['organization-matches', competitions?.map(c => (c as any).id)],
    queryFn: async () => {
      if (!competitions || competitions.length === 0) return []
      const allMatches = await Promise.all(
        competitions.map(async (comp: any) => {
          try {
            const matches = await competitionApi.listMatches(comp.id)
            // Add competition info to each match
            return matches.map(match => ({ ...match, competition: comp.id }))
          } catch (e) {
            return []
          }
        })
      )
      return allMatches.flat()
    },
    enabled: !!competitions && competitions.length > 0,
  })
  
  const isLoading = isLoadingCompetitions || competitionQueries.isLoading
  const matches = useMemo(() => {
    const allMatches = competitionQueries.data ?? []
    // Sort matches by date (most recent first)
    return [...allMatches].sort((a, b) => new Date(b.match_date).getTime() - new Date(a.match_date).getTime())
  }, [competitionQueries.data])

  const [statusFilter, setStatusFilter] = useState<'all' | 'live' | 'upcoming' | 'finished'>('all')
  const [search, setSearch] = useState('')

  const filteredMatches = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase()
    return matches.filter((match) => {
      const isUpcoming = match.status === 'scheduled' || match.status === 'pre_match'
      const isFinished = match.status === 'finished' || match.status === 'cancelled' || match.status === 'postponed' || match.status === 'walkover'
      const matchesStatus = statusFilter === 'all'
        || (statusFilter === 'live' && (match.status === 'live' || match.status === 'halftime'))
        || (statusFilter === 'upcoming' && isUpcoming)
        || (statusFilter === 'finished' && isFinished)
      const matchesSearch = !normalizedSearch || [
        match.home_club_name,
        match.away_club_name,
        String(match.competition ?? ''),
      ].some(value => value.toLocaleLowerCase().includes(normalizedSearch))
      return matchesStatus && matchesSearch
    })
  }, [matches, search, statusFilter])

  const liveCount = matches.filter(match => match.status === 'live' || match.status === 'halftime').length

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
          <Link to={competitionRoutes.adminMatchDetail(row.original.competition, row.original.id)}>
            <button className="text-xs text-primary hover:underline">Ver Detalhes</button>
          </Link>
        ),
      },
    ],
    [],
  )



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
          <div className="space-y-lg">
            <div className="flex flex-col gap-md rounded-xl border border-outline-variant/20 bg-surface-container p-lg md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm text-on-surface-variant">MatchCenter</p>
                <h2 className="text-xl font-semibold text-on-surface">Todas as partidas</h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  {filteredMatches.length} de {matches.length} partidas
                  {liveCount > 0 && <span className="ml-sm font-semibold text-emerald-600">· {liveCount} ao vivo</span>}
                </p>
              </div>
              <div className="relative w-full md:max-w-xs">
                <Search className="pointer-events-none absolute left-sm top-1/2 h-4 w-4 -translate-y-1/2 text-on-surface-variant" />
                <input
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Pesquisar equipa..."
                  aria-label="Pesquisar partidas"
                  className="w-full rounded-lg border border-outline-variant/30 bg-surface px-lg py-sm pl-2xl text-sm text-on-surface outline-none focus:border-primary"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-sm" role="tablist" aria-label="Filtrar partidas">
              {([
                ['all', 'Todas'],
                ['live', 'Ao vivo'],
                ['upcoming', 'Próximas'],
                ['finished', 'Terminadas'],
              ] as const).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  role="tab"
                  aria-selected={statusFilter === value}
                  onClick={() => setStatusFilter(value)}
                  className={`rounded-full px-md py-xs text-sm font-medium transition-colors ${statusFilter === value ? 'bg-primary text-on-primary' : 'bg-surface-container-high text-on-surface-variant hover:text-on-surface'}`}
                >
                  {label}
                </button>
              ))}
            </div>

            {filteredMatches.length === 0 ? (
              <EmptyState icon={Search} title="Nenhuma partida encontrada" description="Altere os filtros ou a pesquisa." />
            ) : (
              <div className="grid gap-md lg:grid-cols-2">
                {filteredMatches.map((match) => (
                  <MatchCard
                    key={match.id}
                    match={match}
                    competitionId={String(match.competition ?? match.competitionId)}
                    showLink
                  />
                ))}
              </div>
            )}

            <div className="hidden overflow-hidden rounded-xl md:block">
              <Card padding="none">
                <DataTable<Match, unknown>
                  columns={columns}
                  data={filteredMatches}
                  isLoading={isLoading}
                  emptyMessage="Nenhuma partida encontrada"
                />
              </Card>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
