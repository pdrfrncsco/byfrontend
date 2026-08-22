import { LayoutDashboard, Handshake, Settings, ExternalLink } from 'lucide-react'
import { playerRoutes } from '../routes'
import { ROUTES } from '@/constants/routes'

export function getPlayerSidebarLinks(playerSlug?: string) {
  return [
    { label: 'Geral', href: playerRoutes.dashboard, icon: LayoutDashboard },
    { label: 'Pedidos de Vínculo', href: playerRoutes.linkClub, icon: Handshake },
    { label: 'Configurações', href: playerRoutes.dashboardSettings, icon: Settings },
    ...(playerSlug ? [{ label: 'Perfil Público', href: playerRoutes.detail(playerSlug), icon: ExternalLink }] : []),
  ]
}
