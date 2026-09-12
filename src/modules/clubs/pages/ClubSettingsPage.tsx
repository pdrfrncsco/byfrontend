import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ExternalLink, Settings, Shield } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Badge, Button } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { PageSkeleton } from '@/components/ui/page-skeleton'
import { getClubSidebarSections } from '@/modules/clubs/constants/navigation'
import { useClubMe, useUpdateClub } from '@/modules/clubs/hooks/useClubs'
import { ClubLogo, ClubSettingsForm } from '../components'

export default function ClubSettingsPage() {
  const navigate = useNavigate()
  const { data: club, isLoading } = useClubMe()
  const updateMutation = useUpdateClub()

  const sidebarSections = useMemo(() => getClubSidebarSections(), [])

  if (isLoading) {
    return (
      <DashboardLayout
        title="Configurações do Clube"
        subtitle="Ajuste a identidade visual, contactos e visibilidade pública."
        dashboardType="club"
        sidebarSections={sidebarSections}
      >
        <PageSkeleton variant="detail" />
      </DashboardLayout>
    )
  }

  if (!club) {
    return (
      <DashboardLayout
        title="Configurações do Clube"
        subtitle="Ajuste a identidade visual, contactos e visibilidade pública."
        dashboardType="club"
        sidebarSections={sidebarSections}
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
      sidebarSections={sidebarSections}
      headerActions={
        <div className="flex items-center gap-sm">
          <Button asChild variant="secondary" size="sm">
            <Link to={ROUTES.DASHBOARD_CLUB}>
              <ArrowLeft className="mr-xs h-4 w-4" />
              <span>Voltar ao Painel</span>
            </Link>
          </Button>
          <Button asChild variant="secondary" size="sm">
            <Link to={`/clubs/${club.slug}`} target="_blank" rel="noreferrer">
              <ExternalLink className="mr-xs h-4 w-4" />
              <span>Ver Perfil Público</span>
            </Link>
          </Button>
        </div>
      }
    >
      <div className="space-y-xl">
        {/* Executive Header Banner */}
        <div className="rounded-2xl border border-outline-variant/30 bg-surface p-lg shadow-xs">
          <div className="flex flex-col gap-md md:flex-row md:items-center md:justify-between">
            <div className="flex items-center gap-md">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl border border-outline-variant/40 bg-surface-container/50 p-1 flex items-center justify-center">
                <ClubLogo logoUrl={club.logo_url} name={club.name} size="lg" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-xs">
                  <Badge variant="secondary" className="border-primary/20 bg-primary/10 text-primary font-semibold text-[11px]">
                    <Settings className="mr-1 h-3 w-3" />
                    Identidade & Configurações Globais
                  </Badge>
                  {(club.tenant_name || (club as any).association_name) && (
                    <Badge variant="outline" className="text-[11px] text-on-surface-variant">
                      {club.tenant_name || (club as any).association_name}
                    </Badge>
                  )}
                </div>
                <h1 className="mt-1 text-2xl font-bold text-on-surface tracking-tight">
                  Definições do Clube • {club.name}
                </h1>
                <p className="text-xs text-on-surface-variant">
                  Personalize a identidade corporativa, recintos desportivos, contactos oficiais e permissões federativas.
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-xs">
              <Button asChild variant="secondary" size="sm">
                <Link to={ROUTES.DASHBOARD_CLUB_DOCUMENTS}>
                  Dossiê Documental
                </Link>
              </Button>
              <Button asChild variant="secondary" size="sm">
                <Link to={ROUTES.DASHBOARD_CLUB_SPONSORS}>
                  Patrocinadores
                </Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Settings Form with Live Preview */}
        <ClubSettingsForm
          club={club}
          updateMutation={updateMutation}
        />
      </div>
    </DashboardLayout>
  )
}
