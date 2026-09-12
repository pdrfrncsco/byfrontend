import {
  Activity,
  ExternalLink,
  FileText,
  FolderOpen,
  GraduationCap,
  Handshake,
  HeartPulse,
  LayoutDashboard,
  Settings,
} from 'lucide-react'
import { playerRoutes } from '../routes'

export function getPlayerSidebarLinks(playerSlug?: string) {
  return [
    { label: 'Geral', href: playerRoutes.dashboard, icon: LayoutDashboard },
    { label: 'Carreira & Formação', href: playerRoutes.career, icon: GraduationCap },
    { label: 'Contratos & Agentes', href: playerRoutes.contracts, icon: FileText },
    { label: 'Dossiê Médico', href: playerRoutes.medical, icon: HeartPulse },
    { label: 'Pedidos de vínculo', href: playerRoutes.linkClub, icon: Handshake },
    { label: 'Biblioteca de média', href: playerRoutes.media, icon: FolderOpen },
    { label: 'Configurações', href: playerRoutes.dashboardSettings, icon: Settings },
    ...(playerSlug ? [{ label: 'Perfil público', href: playerRoutes.detail(playerSlug), icon: ExternalLink }] : []),
  ]
}

