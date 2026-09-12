import {
  ArrowRightLeft,
  FileText,
  FolderOpen,
  LayoutDashboard,
  ListChecks,
  Settings,
  Star,
  Trophy,
  UserCheck,
  UserCircle,
  UserPlus,
  Users,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import type { NavItem } from '@/types/navigation'

export interface ClubSidebarCounts {
  pendingTransfers?: number
  pendingRequests?: number
}

export interface ClubSidebarSection {
  title?: string
  links: NavItem[]
}

export function getClubSidebarSections(counts?: ClubSidebarCounts): ClubSidebarSection[] {
  return [
    {
      title: 'Principal',
      links: [
        {
          label: 'Dashboard',
          href: ROUTES.DASHBOARD_CLUB,
          icon: <LayoutDashboard className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Gestão desportiva',
      links: [
        {
          label: 'Plantel',
          href: ROUTES.DASHBOARD_CLUB_SQUAD,
          icon: <Users className="h-4 w-4" />,
        },
        {
          label: 'Registar jogador',
          href: ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER,
          icon: <UserPlus className="h-4 w-4" />,
        },
        {
          label: 'Pedidos de vínculo',
          href: ROUTES.DASHBOARD_CLUB_PLAYER_REQUESTS,
          icon: <UserCheck className="h-4 w-4" />,
          count: counts?.pendingRequests,
        },
        {
          label: 'Competições & jogos',
          href: ROUTES.DASHBOARD_CLUB_COMPETITIONS,
          icon: <Trophy className="h-4 w-4" />,
        },
        {
          label: 'Transferências',
          href: ROUTES.DASHBOARD_CLUB_TRANSFERS,
          icon: <ArrowRightLeft className="h-4 w-4" />,
          count: counts?.pendingTransfers,
        },
        {
          label: 'Escalação',
          href: ROUTES.DASHBOARD_CLUB_LINEUP,
          icon: <ListChecks className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Administração',
      links: [
        {
          label: 'Membros',
          href: ROUTES.DASHBOARD_CLUB_MEMBERS,
          icon: <UserCircle className="h-4 w-4" />,
        },
        {
          label: 'Documentos',
          href: ROUTES.DASHBOARD_CLUB_DOCUMENTS,
          icon: <FileText className="h-4 w-4" />,
        },
        {
          label: 'Patrocinadores',
          href: ROUTES.DASHBOARD_CLUB_SPONSORS,
          icon: <Star className="h-4 w-4" />,
        },
        {
          label: 'Biblioteca de média',
          href: ROUTES.DASHBOARD_CLUB_MEDIA,
          icon: <FolderOpen className="h-4 w-4" />,
        },
        {
          label: 'Configurações',
          href: ROUTES.DASHBOARD_CLUB_SETTINGS,
          icon: <Settings className="h-4 w-4" />,
        },
      ],
    },
  ]
}

export function getClubSidebarLinks(counts?: ClubSidebarCounts): NavItem[] {
  return getClubSidebarSections(counts).flatMap((section) => section.links)
}
