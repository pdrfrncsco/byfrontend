import { ExternalLink, FolderOpen, Handshake, LayoutDashboard, Settings } from 'lucide-react'
import { playerRoutes } from '../routes'

export function getPlayerSidebarLinks(playerSlug?: string) {
  return [
    { label: 'Geral', href: playerRoutes.dashboard, icon: LayoutDashboard },
    { label: 'Pedidos de vínculo', href: playerRoutes.linkClub, icon: Handshake },
    { label: 'Configurações', href: playerRoutes.dashboardSettings, icon: Settings },
    { label: 'Biblioteca de média', href: playerRoutes.media, icon: FolderOpen },
    ...(playerSlug ? [{ label: 'Perfil público', href: playerRoutes.detail(playerSlug), icon: ExternalLink }] : []),
  ]
}
