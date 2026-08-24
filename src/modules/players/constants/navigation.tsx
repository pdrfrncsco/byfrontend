import { ExternalLink, FolderOpen, Handshake, LayoutDashboard, Settings } from 'lucide-react'
import { playerRoutes } from '../routes'

export function getPlayerSidebarLinks(playerSlug?: string) {
  return [
    { label: 'Geral', href: playerRoutes.dashboard, icon: LayoutDashboard },
    { label: 'Pedidos de Vínculo', href: playerRoutes.linkClub, icon: Handshake },
    { label: 'Configurações', href: playerRoutes.dashboardSettings, icon: Settings },
    { label: 'Biblioteca de Media', href: playerRoutes.media, icon: FolderOpen },
    ...(playerSlug ? [{ label: 'Perfil Público', href: playerRoutes.detail(playerSlug), icon: ExternalLink }] : []),
  ]
}
