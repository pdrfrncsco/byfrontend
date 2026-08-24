import { DashboardLayout } from '@/app/layouts/DashboardLayout'
import { EmptyState, PageSkeleton } from '@/components/ui'
import { Sparkles } from 'lucide-react'
import MediaManagerPage from '@/modules/media_manager/pages/MediaManagerPage'
import { getPlayerSidebarLinks } from '../constants/navigation'
import { usePlayerMe } from '../hooks'

export default function PlayerMediaPage() {
  const { data: player, isLoading } = usePlayerMe()
  const sidebarLinks = getPlayerSidebarLinks(player?.slug)

  if (isLoading) {
    return <DashboardLayout title="Biblioteca de Media" subtitle="Carregando biblioteca..." dashboardType="player" sidebarLinks={sidebarLinks}><PageSkeleton variant="detail" /></DashboardLayout>
  }

  if (!player) {
    return <DashboardLayout title="Biblioteca de Media" dashboardType="player" sidebarLinks={sidebarLinks}><EmptyState icon={Sparkles} title="Perfil indisponível" description="Não foi possível carregar o perfil do jogador." /></DashboardLayout>
  }

  return <MediaManagerPage ownerType="player" ownerId={player.id} title={`Media • ${player.full_name}`} dashboardType="player" sidebarLinks={sidebarLinks} />
}