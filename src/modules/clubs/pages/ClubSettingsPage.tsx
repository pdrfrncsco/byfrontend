import { Link, useNavigate } from 'react-router-dom'
import { Eye, Settings, LayoutDashboard, ArrowRightLeft, FileText, Users, Handshake } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Button } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { ClubDetailSkeleton } from '@/modules/clubs/components/ClubSkeleton'
import { useClubMe, useUpdateClub, useUploadClubLogo } from '@/modules/clubs/hooks/useClubs'
import { ClubSettingsForm } from '../components'

export default function ClubSettingsPage() {
  const navigate = useNavigate()
  const { data: club, isLoading } = useClubMe()
  const updateMutation = useUpdateClub()
  const uploadLogoMutation = useUploadClubLogo()

  const sidebarLinks = [
    { label: 'Geral', href: ROUTES.DASHBOARD_CLUB, icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_CLUB_MEMBERS, icon: <Users className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.DASHBOARD_CLUB_SETTINGS, icon: <Settings className="h-4 w-4" />, active: true },
    { label: 'Documentos', href: ROUTES.DASHBOARD_CLUB_DOCUMENTS, icon: <FileText className="h-4 w-4" /> },
    { label: 'Patrocinadores', href: ROUTES.DASHBOARD_CLUB_SPONSORS, icon: <Handshake className="h-4 w-4" /> },
    { label: 'Transferências', href: ROUTES.DASHBOARD_CLUB_TRANSFERS, icon: <ArrowRightLeft className="h-4 w-4" /> },
  ]

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
