import { Link, useNavigate } from 'react-router-dom'
import { Eye, Settings } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { ClubDetailSkeleton } from '@/modules/clubs/components/ClubSkeleton'
import { getClubSidebarLinks } from '@/modules/clubs/constants/navigation'
import { useClubMe, useUpdateClub, useUploadClubLogo } from '@/modules/clubs/hooks/useClubs'
import { ClubSettingsForm } from '../components'

export default function ClubSettingsPage() {
  const navigate = useNavigate()
  const { data: club, isLoading } = useClubMe()
  const updateMutation = useUpdateClub()
  const uploadLogoMutation = useUploadClubLogo()

  const sidebarLinks = getClubSidebarLinks()

  if (isLoading) {
    return (
      <DashboardLayout
        title="Configurações do Clube"
        subtitle="Ajuste a identidade visual, contactos e visibilidade pública."
        dashboardType="club"
        sidebarLinks={sidebarLinks}
      >
        <ClubDetailSkeleton />
      </DashboardLayout>
    )
  }

  if (!club) {
    return (
      <DashboardLayout
        title="Configurações do Clube"
        subtitle="Ajuste a identidade visual, contactos e visibilidade pública."
        dashboardType="club"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          title="Sem clube associado"
          description="Esta conta ainda não tem um clube associado para configurar."
          icon={Settings}
          action={{
            label: 'Voltar ao dashboard',
            onClick: () => navigate(ROUTES.DASHBOARD_CLUB),
          }}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Configurações • ${club.name}`}
      subtitle="Gira o branding do clube, contactos e disponibilidade pública."
      dashboardType="club"
      sidebarLinks={sidebarLinks}
      headerActions={
        <Button asChild variant="secondary" size="sm">
          <Link to={ROUTES.DASHBOARD_CLUB}>
            <Eye className="h-4 w-4" />
            <span>Voltar ao Dashboard</span>
          </Link>
        </Button>
      }
    >
      <ClubSettingsForm
        club={club}
        updateMutation={updateMutation}
        uploadLogoMutation={uploadLogoMutation}
      />
    </DashboardLayout>
  )
}
