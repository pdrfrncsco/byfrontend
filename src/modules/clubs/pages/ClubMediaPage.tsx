import { useMemo } from 'react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { PageSkeleton } from '@/components/ui'
import MediaManagerPage from '@/modules/media_manager/pages/MediaManagerPage'
import { getClubSidebarSections } from '../constants/navigation'
import { useClubMe } from '../hooks/useClubs'

export default function ClubMediaPage() {
  const { data: club, isLoading } = useClubMe()
  const sidebarSections = useMemo(() => getClubSidebarSections(), [])

  if (isLoading || !club) {
    return (
      <DashboardLayout
        title="Biblioteca de Media"
        subtitle="Carregando biblioteca multimédia..."
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    )
  }

  return (
    <MediaManagerPage
      ownerType="club"
      ownerId={club.id}
      title={`Biblioteca de Media • ${club.name}`}
      dashboardType="club"
      sidebarSections={sidebarSections}
    />
  )
}