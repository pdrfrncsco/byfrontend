import { Settings, Shield, Trophy } from 'lucide-react'
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
      href: ROUTES.CLUBS,
      icon: <Shield className="h-4 w-4" />,
      active: active === 'clubs',
    },
    {
      label: 'Competições',
      href: ROUTES.COMPETITIONS,
      icon: <Trophy className="h-4 w-4" />,
      active: active === 'competitions',
    },
    {
      label: 'Configurações',
      href: ROUTES.ORGANIZATION_SETTINGS,
      icon: <Settings className="h-4 w-4" />,
      active: active === 'settings',
    },
  ]
}
