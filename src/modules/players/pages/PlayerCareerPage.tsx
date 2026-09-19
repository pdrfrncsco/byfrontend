import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Award, Globe, GraduationCap, ShieldCheck, Sparkles } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { EmptyState } from '@/components/ui/empty-state'
import { PlayerCareerTimeline } from '../components/PlayerCareerTimeline'
import { PlayerTrainingHistorySection } from '../components/sections/PlayerTrainingHistorySection'
import { PlayerNationalTeamPerformanceSection } from '../components/sections/PlayerNationalTeamPerformanceSection'
import { PlayerComplianceSection } from '../components/sections/PlayerComplianceSection'
import { usePlayerMe } from '../hooks'
import { getPlayerSidebarLinks } from '../constants/navigation'

export function PlayerCareerPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()
  const [activeTab, setActiveTab] = useState('career')

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
      subtitle="Histórico federado de épocas, formação FIFA EPP, internacionalizações e conformidade regulamentar"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-lg">
        <TabsList className="flex flex-wrap gap-xs rounded-2xl border border-outline-variant/30 bg-surface-container/60 p-1.5 shadow-xs">
          <TabsTrigger value="career" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
            <GraduationCap className="h-4 w-4" />
            Carreira & Clubes
          </TabsTrigger>
          <TabsTrigger value="national-team" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
            <Globe className="h-4 w-4" />
            Selecções & Desempenho
          </TabsTrigger>
          <TabsTrigger value="compliance" className="gap-xs rounded-xl px-md py-sm text-xs font-medium">
            <ShieldCheck className="h-4 w-4" />
            Conformidade & RSTP
          </TabsTrigger>
        </TabsList>

        {/* Tab 1: Carreira & Clubes + Formação */}
        <TabsContent value="career" className="space-y-xl mt-0">
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

          <PlayerTrainingHistorySection playerId={player.id} />
        </TabsContent>

        {/* Tab 2: Selecções & Desempenho Físico */}
        <TabsContent value="national-team" className="mt-0">
          <PlayerNationalTeamPerformanceSection playerId={player.id} />
        </TabsContent>

        {/* Tab 3: Conformidade Regulamentar FIFA RSTP */}
        <TabsContent value="compliance" className="mt-0">
          <PlayerComplianceSection playerId={player.id} />
        </TabsContent>
      </Tabs>
    </DashboardLayout>
  )
}
