import type { ReactNode } from 'react'
import { ClipboardList, FolderOpen, Home, Settings, Shield, Trophy, UserCheck, Users } from 'lucide-react'
import { ROUTES } from '@/constants/routes'

export type OrganizationNavKey =
  | 'overview'
  | 'lineups'
  | 'clubs'
  | 'players'
  | 'competitions'
  | 'members'
  | 'affiliations'
  | 'media'
  | 'settings'

interface OrganizationSidebarOptions {
  showLineups?: boolean
  pendingLineupsCount?: number
}

interface OrganizationSidebarLink {
  label: string
  href: string
  icon: ReactNode
  active: boolean
  count?: number
}

export interface OrganizationSidebarSection {
  title?: string
  links: OrganizationSidebarLink[]
}

const ORGANIZATION_SIDEBAR_LINKS: Record<OrganizationNavKey, Omit<OrganizationSidebarLink, 'active'>> = {
  overview: {
    label: 'Início',
    href: ROUTES.DASHBOARD_ORGANIZATION,
    icon: <Home className="h-4 w-4" />,
  },
  lineups: {
    label: 'Submissões de Escalações',
    href: ROUTES.DASHBOARD_ORGANIZATION_LINEUPS,
    icon: <ClipboardList className="h-4 w-4" />,
  },
  clubs: {
    label: 'Clubes Associados',
    href: ROUTES.DASHBOARD_ORGANIZATION_CLUBS,
    icon: <Shield className="h-4 w-4" />,
  },
  players: {
    label: 'Jogadores Registados',
    href: ROUTES.DASHBOARD_ORGANIZATION_PLAYERS,
    icon: <UserCheck className="h-4 w-4" />,
  },
  competitions: {
    label: 'Competições',
    href: ROUTES.DASHBOARD_ORGANIZATION_COMPETITIONS,
    icon: <Trophy className="h-4 w-4" />,
  },
  members: {
    label: 'Membros',
    href: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS,
    icon: <Users className="h-4 w-4" />,
  },
  affiliations: {
    label: 'Pedidos de Filiação',
    href: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS,
    icon: <Shield className="h-4 w-4" />,
  },
  media: {
    label: 'Biblioteca de Media',
    href: ROUTES.DASHBOARD_MEDIA,
    icon: <FolderOpen className="h-4 w-4" />,
  },
  settings: {
    label: 'Configurações',
    href: ROUTES.ORGANIZATION_SETTINGS,
    icon: <Settings className="h-4 w-4" />,
  },
}

const SECTION_ORDER: Array<'context' | 'management'> = ['context', 'management']

function buildLink(key: OrganizationNavKey, active: OrganizationNavKey, count?: number): OrganizationSidebarLink {
  return {
    ...ORGANIZATION_SIDEBAR_LINKS[key],
    active: key === active,
    count,
  }
}

export function getOrganizationSidebarSections(
  active: OrganizationNavKey,
  options: OrganizationSidebarOptions = {},
): OrganizationSidebarSection[] {
  const { showLineups = false, pendingLineupsCount } = options

  const sections: Record<'context' | 'management', OrganizationSidebarSection> = {
    context: {
      title: 'Contexto',
      links: [
        buildLink('overview', active),
        ...(showLineups ? [buildLink('lineups', active, pendingLineupsCount)] : []),
      ],
    },
    management: {
      title: 'Gestão',
      links: [
        buildLink('clubs', active),
        buildLink('players', active),
        buildLink('competitions', active),
        buildLink('members', active),
        buildLink('affiliations', active),
        buildLink('media', active),
        buildLink('settings', active),
      ],
    },
  }

  return SECTION_ORDER.map((sectionKey) => sections[sectionKey]).filter((section) => section.links.length > 0)
}

export function getOrganizationSidebarLinks(active: OrganizationNavKey, options: OrganizationSidebarOptions = {}) {
  return getOrganizationSidebarSections(active, options).flatMap((section) => section.links)
}
