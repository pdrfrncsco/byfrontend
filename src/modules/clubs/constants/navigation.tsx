import { ArrowRightLeft, FileText, Handshake, LayoutDashboard, Settings, UserCheck, UserPlus, Users } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export function getClubSidebarLinks() {
  return [
    {
      label: 'Geral',
      href: ROUTES.DASHBOARD_CLUB,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      label: 'Membros',
      href: ROUTES.DASHBOARD_CLUB_MEMBERS,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Configurações',
      href: ROUTES.DASHBOARD_CLUB_SETTINGS,
      icon: <Settings className="h-4 w-4" />,
    },
    {
      label: 'Documentos',
      href: ROUTES.DASHBOARD_CLUB_DOCUMENTS,
      icon: <FileText className="h-4 w-4" />,
    },
    {
      label: 'Patrocinadores',
      href: ROUTES.DASHBOARD_CLUB_SPONSORS,
      icon: <Handshake className="h-4 w-4" />,
    },
    {
      label: 'Transferências',
      href: ROUTES.DASHBOARD_CLUB_TRANSFERS,
      icon: <ArrowRightLeft className="h-4 w-4" />,
    },
    {
      label: 'Pedidos de Vínculo',
      href: ROUTES.DASHBOARD_CLUB_PLAYER_REQUESTS,
      icon: <UserCheck className="h-4 w-4" />,
    },
    {
      label: 'Registar Jogador',
      href: ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER,
      icon: <UserPlus className="h-4 w-4" />,
    },
  ]
}
