import { Settings, Shield, Trophy, Users } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export type OrganizationNavKey = 'overview' | 'clubs' | 'competitions' | 'settings'

export function getOrganizationSidebarLinks(active: OrganizationNavKey) {
  return [
    {
      label: 'Visão Geral',
      href: ROUTES.DASHBOARD_ORGANIZATION,
      icon: <Trophy className="h-4 w-4" />,
      active: active === 'overview',
    },
    {
      label: 'Clubes Associados',
      href: ROUTES.DASHBOARD_ORGANIZATION_CLUBS,
      icon: <Shield className="h-4 w-4" />,
      active: active === 'clubs',
    },
    {
      label: 'Competições',
      href: ROUTES.DASHBOARD_ORGANIZATION_COMPETITIONS,
      icon: <Trophy className="h-4 w-4" />,
      active: active === 'competitions',
    },
    {
      label: 'Membros',
      href: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS,
      icon: <Users className="h-4 w-4" />,
    },
    {
      label: 'Pedidos de Filiação',
      href: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS,
      icon: <Shield className="h-4 w-4" />,
    },
    {
      label: 'Configurações',
      href: ROUTES.ORGANIZATION_SETTINGS,
      icon: <Settings className="h-4 w-4" />,
      active: active === 'settings',
    },
  ]
}
