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
import {
  Trophy,
  PlusCircle,
} from 'lucide-react'
import { getCompetitionSidebarSections } from '../constants/navigation'
import { competitionRoutes } from '../routes'
import { useCompetitionsPaginated } from '../hooks'
import type { Competition } from '../types'

function getStatusBadge(status: string) {
  const s = status?.toLowerCase()
  if (s === 'active') return <Badge variant="success">EM CURSO</Badge>
  if (s === 'completed') return <Badge variant="warning">CONCLUÍDO</Badge>
  return <Badge variant="default">RASCUNHO</Badge>
}

const TYPE_CONFIG: Record<string, { label: string; icon: any }> = {
  league: { label: 'Liga (Pontos)', icon: Trophy },
  cup: { label: 'Taça (Mata-Mata)', icon: Trophy },
  tournament: { label: 'Torneio (Misto)', icon: Trophy },
}

export function CompetitionAdminListPage() {
  const [page] = useState(1)
  const [pageSize] = useState(10)
  const { data, isLoading } = useCompetitionsPaginated({ page, page_size: pageSize })
  const navigate = useNavigate()

  const sidebarSections = useMemo(() => getCompetitionSidebarSections(), [])

  const headerActions = (
    <Button variant="primary" size="sm" asChild>
      <Link to={competitionRoutes.create}>
        <PlusCircle className="h-4 w-4" />
        <span>Criar Nova Competição</span>
      </Link>
    </Button>
  )

  const columns = useMemo<ColumnDef<Competition>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Nome da Competição',
        cell: ({ row }) => (
          <div className="flex items-center gap-sm">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10 text-primary font-bold text-sm">
              <Trophy className="h-4 w-4" />
            </div>
            <div>
              <Link
                to={competitionRoutes.adminDashboard(row.original.id)}
                className="font-semibold text-on-surface hover:text-primary transition-colors block"
              >
                {row.original.name}
              </Link>
              <span className="text-xs text-on-surface-variant font-data-tabular">
                Época {row.original.season}
              </span>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'competition_type',
        header: 'Formato',
        cell: ({ row }) => {
          const type = row.original.competition_type || 'league'
          const label = TYPE_CONFIG[type]?.label || type
          return (
            <span className="inline-flex items-center rounded-lg bg-surface-container-high px-sm py-xs text-xs font-medium text-on-surface-variant">
              {label}
            </span>
          )
        },
      },
      {
        accessorKey: 'season',
        header: 'Época',
        cell: ({ row }) => <span className="font-data-tabular text-xs font-semibold">{row.original.season}</span>,
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
          <div className="flex items-center gap-xs">
            <Button variant="secondary" size="sm" asChild>
              <Link to={competitionRoutes.adminDashboard(row.original.id)}>
                Gerir Prova
              </Link>
            </Button>
          </div>
        ),
      },
    ],
    [],
  )

  const competitionRows = useMemo(() => data?.results ?? [], [data?.results])

  return (
    <DashboardLayout
      title="Torneios & Competições"
      subtitle="Gerir todas as competições e formatos da organização"
      dashboardType="competition"
      sidebarSections={sidebarSections}
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
              onClick: () => navigate(competitionRoutes.create),
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
