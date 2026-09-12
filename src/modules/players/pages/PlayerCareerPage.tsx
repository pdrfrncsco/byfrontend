import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { GraduationCap, Sparkles } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { PlayerCareerTimeline } from '../components/PlayerCareerTimeline'
import { PlayerTrainingHistorySection } from '../components/sections/PlayerTrainingHistorySection'
import { usePlayerMe } from '../hooks'
import { getPlayerSidebarLinks } from '../constants/navigation'

export function PlayerCareerPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  if (isLoading) {
    return (
      <DashboardLayout
        title="Carreira & Formação"
        subtitle="A carregar registos desportivos..."
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-96 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title="Carreira & Formação"
        subtitle="Dossiê desportivo do atleta"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title="Jogador não encontrado"
          description="Não foi possível carregar o perfil de carreira."
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
      title={`Carreira & Formação — ${player.full_name}`}
      subtitle="Histórico federado de épocas, clubes e mecanismo de solidariedade / compensação de formação FIFA EPP"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-xl">
        {/* Career Timeline Section */}
        <Card variant="flat" padding="none" className="border border-outline-variant/30">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-sm">
              <GraduationCap className="h-5 w-5 text-primary" />
              Linha Temporal da Carreira
            </CardTitle>
          </CardHeader>
          <CardContent className="p-lg pt-0">
            <PlayerCareerTimeline career={player.career_history ?? []} />
          </CardContent>
        </Card>

        {/* Training History & FIFA EPP Compensation */}
        <PlayerTrainingHistorySection playerId={player.id} />
      </div>
    </DashboardLayout>
  )
}
