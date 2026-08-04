import { Settings, Shield, Trophy, Users, Check } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export type OrganizationNavKey = 'overview' | 'clubs' | 'competitions' | 'members' | 'affiliations' | 'lineups' | 'settings'

export function getOrganizationSidebarLinks(active: OrganizationNavKey, showLineups = false) {
  const links = [
    {
      label: 'Início',
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
  ] as any[]

  if (showLineups) {
    links.push({
      label: 'Submissões de Escalações',
      href: ROUTES.DASHBOARD_ORGANIZATION_LINEUPS,
      icon: <Check className="h-4 w-4" />,
      active: active === 'lineups',
    })
  }

  links.push(
    {
      label: 'Membros',
      href: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS,
      icon: <Users className="h-4 w-4" />,
      active: active === 'members',
    },
    {
      label: 'Pedidos de Filiação',
      href: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS,
      icon: <Shield className="h-4 w-4" />,
      active: active === 'affiliations',
    },
    {
      label: 'Configurações',
      href: ROUTES.ORGANIZATION_SETTINGS,
      icon: <Settings className="h-4 w-4" />,
      active: active === 'settings',
    },
  )

  return links
}
