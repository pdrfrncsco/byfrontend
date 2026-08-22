import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { Card, Button } from '@/components/ui'
import { useOrganizationMe, useUpdateOrganization, useUploadLogo, useUploadBanner, useOnboardingStatus } from '../hooks'
import { OrganizationSettingsForm } from '../components'
import { PageSkeleton } from '@/components/ui'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { organizationRoutes } from '../routes'
import { getOrganizationSidebarSections } from '../constants/navigation'

export function OrganizationSettingsPage() {
  const { data: organization, isLoading } = useOrganizationMe()
  const { data: onboarding } = useOnboardingStatus()
  const updateMutation = useUpdateOrganization()
  const uploadLogoMutation = useUploadLogo()
  const uploadBannerMutation = useUploadBanner()
  const sidebarSections = getOrganizationSidebarSections('settings', {
    showLineups: Boolean(onboarding?.is_organization_admin),
  })

  if (isLoading) {
    return (
      <DashboardLayout
        title="Definições da Organização"
        subtitle="Gira a identidade visual, contactos e visibilidade pública do portal da sua federação/associação."
        dashboardType="organization"
        sidebarSections={sidebarSections}
      >
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    )
  }

  if (!organization) {
    return (
      <DashboardLayout
        title="Definições da Organização"
        subtitle="Gira a identidade visual, contactos e visibilidade pública do portal da sua federação/associação."
        dashboardType="organization"
        sidebarSections={sidebarSections}
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
      sidebarSections={sidebarSections}
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
