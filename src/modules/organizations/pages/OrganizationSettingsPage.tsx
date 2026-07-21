import { Link } from 'react-router-dom'
import { ArrowLeft, Shield, Trophy, Settings, Users } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useOrganizationMe, useUpdateOrganization, useUploadLogo, useUploadBanner } from '../hooks'
import { OrganizationSettingsSkeleton, OrganizationSettingsForm } from '../components'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { organizationRoutes } from '../routes'

export function OrganizationSettingsPage() {
  const { data: organization, isLoading } = useOrganizationMe()
  const updateMutation = useUpdateOrganization()
  const uploadLogoMutation = useUploadLogo()
  const uploadBannerMutation = useUploadBanner()

  const sidebarLinks = [
    { label: 'Visão Geral', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Clubes Associados', href: ROUTES.DASHBOARD_ORGANIZATION_CLUBS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Competições', href: ROUTES.DASHBOARD_ORGANIZATION_COMPETITIONS, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Membros', href: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS, icon: <Users className="h-4 w-4" /> },
    { label: 'Pedidos de Filiação', href: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS, icon: <Shield className="h-4 w-4" /> },
    { label: 'Configurações', href: ROUTES.ORGANIZATION_SETTINGS, icon: <Settings className="h-4 w-4" />, active: true },
  ]

  if (isLoading) {
    return (
      <DashboardLayout
        title="Definições da Organização"
        subtitle="Gira a identidade visual, contactos e visibilidade pública do portal da sua federação/associação."
        dashboardType="organization"
        sidebarLinks={sidebarLinks}
      >
        <OrganizationSettingsSkeleton />
      </DashboardLayout>
    )
  }

  if (!organization) {
    return (
      <DashboardLayout
        title="Definições da Organização"
        subtitle="Gira a identidade visual, contactos e visibilidade pública do portal da sua federação/associação."
        dashboardType="organization"
        sidebarLinks={sidebarLinks}
      >
        <div className="flex items-center justify-center p-lg text-center">
          <Card padding="lg" className="max-w-md space-y-md">
            <p className="mb-md text-on-surface-variant">
              Não tem nenhuma organização associada a este utilizador.
            </p>
            <Button variant="primary" size="sm" asChild>
              <Link to={organizationRoutes.dashboard}>
                <ArrowLeft className="h-4 w-4" />
                <span>Voltar ao Dashboard</span>
              </Link>
            </Button>
          </Card>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title="Definições da Organização"
      subtitle="Gira a identidade visual, contactos e visibilidade pública do portal da sua federação/associação."
      dashboardType="organization"
      sidebarLinks={sidebarLinks}
    >
      <OrganizationSettingsForm
        organization={organization}
        updateMutation={updateMutation}
        uploadLogoMutation={uploadLogoMutation}
        uploadBannerMutation={uploadBannerMutation}
      />
    </DashboardLayout>
  )
}
