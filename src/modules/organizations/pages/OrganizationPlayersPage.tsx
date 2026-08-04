import { useMemo, useState } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Badge, Card, DataTable, Skeleton, EmptyState, Input } from '@/components/ui'
import { useOrganizationMe, useOrganizationPlayers, useOnboardingStatus } from '../hooks'
import { Shield, UserCheck, Search } from 'lucide-react'
import { Link } from 'react-router-dom'
import { getOrganizationSidebarSections } from '../constants/navigation'

export interface OrganizationPlayerRow {
  id: string
  full_name?: string
  name?: string
  slug?: string
  position?: string
  position_label?: string
  jersey_number?: number | null
  club_name?: string
  club?: { name: string; logo_url?: string }
  photo_url?: string
  avatar_url?: string
  status?: string
  status_label?: string
}

export function OrganizationPlayersPage() {
  const { data: org } = useOrganizationMe()
  const { data: onboarding } = useOnboardingStatus()
  const { data: players, isLoading: isLoadingPlayers } = useOrganizationPlayers(org?.slug)
  const [searchTerm, setSearchTerm] = useState('')
  const sidebarSections = getOrganizationSidebarSections('players', {
    showLineups: Boolean(onboarding?.is_organization_admin),
  })

  const columns = useMemo<ColumnDef<OrganizationPlayerRow>[]>(
    () => [
      {
        accessorKey: 'full_name',
        header: 'Atleta',
        cell: ({ row }) => {
          const name = row.original.full_name || row.original.name || 'Atleta'
          const photo = row.original.photo_url || row.original.avatar_url
          const playerSlug = row.original.slug

          return (
            <div className="flex items-center gap-sm">
              {photo ? (
                <img src={photo} alt={name} className="h-9 w-9 rounded-full object-cover border border-white/10" />
              ) : (
                <div className="h-9 w-9 rounded-full bg-primary-container text-primary font-bold flex items-center justify-center text-xs">
                  {name.slice(0, 2).toUpperCase()}
                </div>
              )}
              <div>
                {playerSlug ? (
                  <Link
                    to={ROUTES.PLAYER_DETAIL(playerSlug)}
                    className="font-semibold text-on-surface hover:text-primary transition-colors"
                  >
                    {name}
                  </Link>
                ) : (
                  <span className="font-semibold text-on-surface">{name}</span>
                )}
                {row.original.jersey_number !== undefined && row.original.jersey_number !== null && (
                  <span className="ml-xs text-[10px] bg-surface-container-high px-1.5 py-0.5 rounded font-data-tabular text-on-surface-variant">
                    #{row.original.jersey_number}
                  </span>
                )}
              </div>
            </div>
          )
        },
      },
      {
        accessorKey: 'club_name',
        header: 'Clube Vinculado',
        cell: ({ row }) => {
          const clubName = row.original.club_name || row.original.club?.name || '—'
          return (
            <div className="flex items-center gap-xs">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-medium text-on-surface">{clubName}</span>
            </div>
          )
        },
      },
      {
        accessorKey: 'position',
        header: 'Posição',
        cell: ({ row }) => (
          <span className="text-xs text-on-surface-variant capitalize">
            {row.original.position_label || row.original.position || '—'}
          </span>
        ),
      },
      {
        id: 'status',
        header: 'Estado Federativo',
        cell: ({ row }) => {
          const s = (row.original.status || 'active').toLowerCase()
          return s === 'active' || s === 'ativo' ? (
            <Badge variant="success">Registado</Badge>
          ) : (
            <Badge variant="default">{row.original.status_label || 'Pendente'}</Badge>
          )
        },
      },
    ],
    [],
  )

  const rawRows = useMemo(() => (Array.isArray(players) ? (players as OrganizationPlayerRow[]) : []), [players])

  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rawRows
    const term = searchTerm.toLowerCase()
    return rawRows.filter((p) => {
      const name = (p.full_name || p.name || '').toLowerCase()
      const club = (p.club_name || p.club?.name || '').toLowerCase()
      const pos = (p.position_label || p.position || '').toLowerCase()
      return name.includes(term) || club.includes(term) || pos.includes(term)
    })
  }, [rawRows, searchTerm])

  return (
    <DashboardLayout
      title="Jogadores Registados"
      subtitle="Lista oficial de atletas registados na organização através dos clubes vinculados."
      dashboardType="organization"
      sidebarSections={sidebarSections}
    >
      <div className="animate-fade-in space-y-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-md">
          <div className="relative w-full sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-on-surface-variant" />
            <Input
              placeholder="Pesquisar por atleta, clube ou posição..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 text-xs"
            />
          </div>
          <div className="text-xs text-on-surface-variant font-data-tabular">
            Total: <span className="font-bold text-on-surface">{filteredRows.length}</span> atleta(s)
          </div>
        </div>

        {isLoadingPlayers ? (
          <Card padding="none">
            <div className="divide-y divide-outline-variant/20">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md px-lg py-md">
                  <Skeleton className="h-9 w-9 rounded-full" />
                  <div className="flex-1 space-y-xs">
                    <Skeleton className="h-4 w-44 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="h-5 w-20 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : filteredRows.length === 0 ? (
          <EmptyState
            icon={UserCheck}
            title={searchTerm ? 'Nenhum atleta encontrado' : 'Sem atletas registados'}
            description={
              searchTerm
                ? 'Tente ajustar o termo de pesquisa.'
                : 'Não existem atletas registados através dos clubes vinculados à organização.'
            }
          />
        ) : (
          <Card padding="none" className="overflow-hidden">
            <DataTable<OrganizationPlayerRow, unknown>
              columns={columns}
              data={filteredRows}
              isLoading={false}
              emptyMessage="Nenhum jogador encontrado."
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}

export default OrganizationPlayersPage
