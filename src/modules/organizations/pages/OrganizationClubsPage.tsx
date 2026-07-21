import { useMemo } from 'react'
import { type ColumnDef } from '@tanstack/react-table'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Badge, Card, DataTable, Skeleton, EmptyState, Button } from '@/components/ui'
import { useOrganizationClubs, useOrganizationMe } from '../hooks'
import { Settings, Shield, Trophy, Users, PlusCircle } from 'lucide-react'
import type { OrganizationClub } from '../types'
import { Link } from 'react-router-dom'

export function OrganizationClubsPage() {
  const { data: org } = useOrganizationMe()
  const { data: clubs, isLoading: isLoadingClubs } = useOrganizationClubs(org?.slug)

  const sidebarLinks = [
    { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Clubes Associados', href: ROUTES.DASHBOARD_ORGANIZATION_CLUBS, icon: <Shield className="h-4 w-4" />, active: true },
    { label: 'Competições', href: ROUTES.DASHBOARD_ORGANIZATION_COMPETITIONS, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS, icon: <Users className="h-4 w-4" /> },
    { label: 'Pedidos de Filiação', href: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="h-4 w-4" /> },
  ]

  const columns = useMemo<ColumnDef<OrganizationClub>[]>(
    () => [
      {
        accessorKey: 'name',
        header: 'Clube',
        cell: ({ row }) => (
          <div className="flex items-center gap-sm">
            {row.original.logo_url ? (
              <img src={row.original.logo_url} alt={row.original.name} className="h-8 w-8 rounded-full object-cover" />
            ) : (
              <div className="h-8 w-8 rounded-full bg-primary-container text-primary font-bold flex items-center justify-center text-sm">
                {row.original.name.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="font-semibold text-on-surface">{row.original.name}</span>
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

  const clubRows = useMemo(() => (Array.isArray(clubs) ? clubs : []), [clubs])

  return (
    <DashboardLayout
      title="Clubes Associados"
      subtitle="Gerencie os clubes associados à sua organização."
      dashboardType="organization"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button variant="primary" size="sm" asChild>
          <Link to={ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS}>
            <PlusCircle className="h-4 w-4" />
            <span>Ver Pedidos</span>
          </Link>
        </Button>
      }
    >
      <div className="animate-fade-in">
        {isLoadingClubs ? (
          <Card padding="none">
            <div className="divide-y divide-outline-variant/20">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-md px-lg py-md">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-xs">
                    <Skeleton className="h-4 w-40 rounded" />
                    <Skeleton className="h-3 w-32 rounded" />
                  </div>
                  <Skeleton className="h-5 w-16 rounded" />
                </div>
              ))}
            </div>
          </Card>
        ) : clubRows.length === 0 ? (
          <EmptyState
            icon={Shield}
            title="Sem clubes associados"
            description="Ainda não há clubes associados à sua organização."
          />
        ) : (
          <Card padding="none" className="overflow-hidden">
            <DataTable<OrganizationClub, unknown>
              columns={columns}
              data={clubRows}
              isLoading={false}
              emptyMessage="Nenhum clube associado."
            />
          </Card>
        )}
      </div>
    </DashboardLayout>
  )
}
