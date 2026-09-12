import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { FileText, Sparkles, UserCheck } from 'lucide-react'
import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { ROUTES } from '@/constants/routes'
import { Card, CardContent, CardHeader, CardTitle, Skeleton } from '@/components/ui'
import { EmptyState } from '@/components/ui/empty-state'
import { PlayerContractSection } from '../components/sections/PlayerContractSection'
import { PlayerAgentSection } from '../components/sections/PlayerAgentSection'
import { usePlayerMe } from '../hooks'
import { getPlayerSidebarLinks } from '../constants/navigation'

export function PlayerContractsPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { data: player, isLoading, isError } = usePlayerMe()

  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  if (isLoading) {
    return (
      <DashboardLayout
        title="Contratos & Agenciamento"
        subtitle="A carregar dossiê contratual..."
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <div className="space-y-lg">
          <Skeleton className="h-44 w-full rounded-2xl" />
          <Skeleton className="h-72 w-full rounded-2xl" />
        </div>
      </DashboardLayout>
    )
  }

  if (isError || !player) {
    return (
      <DashboardLayout
        title="Contratos & Agenciamento"
        subtitle="Dossiê jurídico e representação do atleta"
        dashboardType="player"
        sidebarLinks={sidebarLinks}
      >
        <EmptyState
          icon={Sparkles}
          title="Jogador não encontrado"
          description="Não foi possível carregar o dossiê contratual."
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
      title={`Contratos & Agentes — ${player.full_name}`}
      subtitle="Vínculos contratuais desportivos, remuneração, cláusulas e representação por agentes licenciados"
      dashboardType="player"
      sidebarLinks={sidebarLinks}
    >
      <div className="space-y-xl">
        {/* Contracts Section */}
        <PlayerContractSection playerId={player.id} />

        {/* Agents & Legal Representation Section */}
        <PlayerAgentSection playerId={player.id} />
      </div>
    </DashboardLayout>
  )
}
