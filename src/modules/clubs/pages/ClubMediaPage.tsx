import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { PageSkeleton } from '@/components/ui'
import MediaManagerPage from '@/modules/media_manager/pages/MediaManagerPage'
import { getClubSidebarLinks } from '../constants/navigation'
import { useClubMe } from '../hooks/useClubs'

export default function ClubMediaPage() {
  const { data: club, isLoading } = useClubMe()
  const sidebarLinks = getClubSidebarLinks()

  if (isLoading || !club) {
    return <DashboardLayout title="Biblioteca de Media" subtitle="Carregando biblioteca..." dashboardType="club" sidebarLinks={sidebarLinks}><PageSkeleton variant="detail" /></DashboardLayout>
  }

  return <MediaManagerPage ownerType="club" ownerId={club.id} title={`Media • ${club.name}`} dashboardType="club" sidebarLinks={sidebarLinks} />
}