import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { Trophy } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, DataTable } from '@/components/ui'
import type { OrganizationHistoryEntry } from '../types'

interface OrganizationHistoryTableProps {
  history: OrganizationHistoryEntry[]
}

export function OrganizationHistoryTable({ history }: OrganizationHistoryTableProps) {
  const columns = useMemo<ColumnDef<OrganizationHistoryEntry>[]>(
    () => [
      {
        accessorKey: 'season',
        header: 'Época',
        cell: ({ row }) => <span className="font-semibold">{row.original.season}</span>,
      },
      {
        accessorKey: 'tournament_name',
        header: 'Torneio',
        cell: ({ row }) => (
          <span className="font-medium text-on-surface-variant">{row.original.tournament_name}</span>
        ),
      },
      {
        accessorKey: 'winner_club_name',
        header: 'Campeão',
        cell: ({ row }) => (
          <span className="font-bold text-primary">{row.original.winner_club_name || '—'}</span>
        ),
      },
      {
        accessorKey: 'runner_up_club_name',
        header: 'Vice-Campeão',
        cell: ({ row }) => (
          <span className="text-on-surface-variant">{row.original.runner_up_club_name || '—'}</span>
        ),
      },
    ],
    [],
  )

  return (
    <Card padding="none" className="overflow-hidden">
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle>
          <Trophy className="h-5 w-5 text-tertiary" aria-hidden="true" />
          <span>Histórico de Campeões</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <DataTable
          columns={columns}
          data={history.slice(0, 10)}
          emptyMessage="Nenhum registo de histórico disponível."
        />
      </CardContent>
    </Card>
  )
}
