import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { HeartPulse, Sparkles } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { PlayerMedicalSection } from '../components/sections/PlayerMedicalSection'
import { usePlayerMe } from '../hooks'
import { getPlayerSidebarLinks } from '../constants/navigation'

export function PlayerMedicalPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  if (isLoading) {
    return (
      <DashboardLayout
        title="Dossiê Médico & Saúde"
        subtitle="A carregar perfil clínico e aptidão desportiva..."
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-64 w-full rounded-2xl" />
          <Skeleton className="h-48 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title="Dossiê Médico & Saúde"
        subtitle="Registo clínico confidencial do atleta"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title="Jogador não encontrado"
          description="Não foi possível carregar o dossiê médico."
          action={{
            label: "Voltar para o Painel",
            onClick: () => navigate(ROUTES.DASHBOARD_PLAYER),
            variant: "secondary",
          }}
        />
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout
      title={`Dossiê Médico & Saúde — ${player.full_name}`}
      subtitle="Registo confidencial de aptidão para a prática desportiva, exames periódicos e documentação médica oficial"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-xl">
        <PlayerMedicalSection playerId={player.id} isStaffOnly={true} />
      </div>
    </DashboardLayout>
  )
}
