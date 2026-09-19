import React, { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Users } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { ROUTES } from '@/constants/routes'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import { useClubMe } from '@/modules/clubs/hooks/useClubs'
import { ClubCategoryManager } from '@/modules/clubs/components/ClubCategoryManager'

export default function ClubCategoriesPage() {
  const { data: club, isLoading: clubLoading } = useClubMe()
  const sidebarSections = useMemo(() => getClubSidebarSections(), [])

  if (clubLoading || !club) {
    return (
      <DashboardLayout
        title="Categorias & Escalões"
        subtitle="Carregando..."
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <div className="space-y-lg">
          <Skeleton className="h-28 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Categorias & Escalões • ${club.name}`}
      subtitle="Gerencie os escalões etários do clube e as categorias federadas."
      dashboardType="club"
      sidebarSections={sidebarSections}
      headerActions={
        <div className="flex items-center gap-sm">
          <Button asChild variant="secondary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB_SQUAD}>
              <Users className="mr-xs h-4 w-4" />
              <span>Ver Plantel</span>
            </Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB}>
              <ArrowLeft className="mr-xs h-4 w-4" />
              <span>Voltar ao Painel</span>
            </Link>
          </Button>
        </div>
      }
    >
      <ClubCategoryManager clubIdOrSlug={club.slug || club.id} />
    </DashboardLayout>
  )
}
