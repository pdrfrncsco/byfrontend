import {
  AlertTriangle,
  BookOpen,
  Building2,
  Calendar,
  CircleDot,
  ExternalLink,
  Flame,
  FolderKanban,
  LayoutDashboard,
  PlusCircle,
  Settings,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import { competitionRoutes } from '../routes'
import { ROUTES } from '@/constants/routes'
import type { NavItem } from '@/types/navigation'

export interface CompetitionSidebarCounts {
  activeSuspensions?: number
  pendingLineups?: number
  upcomingMatches?: number
}

export interface CompetitionSidebarSection {
  title?: string
  links: NavItem[]
}

export function getCompetitionSidebarSections(
  competitionId?: string,
  counts?: CompetitionSidebarCounts,
): CompetitionSidebarSection[] {
  const hasCompetition = Boolean(competitionId)
  const compId = competitionId ?? ''

  if (hasCompetition) {
    return [
      {
        title: 'Principal',
        links: [
          {
            label: 'Dashboard',
            href: competitionRoutes.adminDashboard(compId),
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
          {
            label: 'Todas as Provas',
            href: competitionRoutes.dashboard,
            icon: <Trophy className="h-4 w-4" />,
          },
        ],
      },
      {
        title: 'Competição',
        links: [
          {
            label: 'Calendário & Jornadas',
            href: competitionRoutes.schedule(compId),
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            label: 'Jogos & Match Center',
            href: competitionRoutes.adminMatchCenterHub(compId),
            icon: <Flame className="h-4 w-4" />,
            count: counts?.upcomingMatches,
          },
          {
            label: 'Classificação & Rankings',
            href: competitionRoutes.adminRankings(compId),
            icon: <Target className="h-4 w-4" />,
          },
          {
            label: 'Sorteio & Chave',
            href: competitionRoutes.draw(compId),
            icon: <CircleDot className="h-4 w-4" />,
          },
        ],
      },
      {
        title: 'Gestão',
        links: [
          {
            label: 'Inscrições de Clubes',
            href: competitionRoutes.registration(compId),
            icon: <Users className="h-4 w-4" />,
          },
          {
            label: 'Suspensões & Disciplinar',
            href: competitionRoutes.adminSuspensions(compId),
            icon: <AlertTriangle className="h-4 w-4" />,
            count: counts?.activeSuspensions,
          },
          {
            label: 'Regulamento da Prova',
            href: competitionRoutes.adminRegulations(compId),
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            label: 'Configurações',
            href: competitionRoutes.settings(compId),
            icon: <Settings className="h-4 w-4" />,
          },
        ],
      },
      {
        title: 'Institucional',
        links: [
          {
            label: 'Painel da Organização',
            href: ROUTES.DASHBOARD_ORGANIZATION,
            icon: <Building2 className="h-4 w-4" />,
          },
          {
            label: 'Página Pública',
            href: competitionRoutes.detail(compId),
            icon: <ExternalLink className="h-4 w-4" />,
          },
        ],
      },
    ]
  }

  // General scope (no specific competition selected yet)
  return [
    {
      title: 'Principal',
      links: [
        {
          label: 'Geral de Provas',
          href: competitionRoutes.dashboard,
          icon: <Trophy className="h-4 w-4" />,
        },
        {
          label: 'Lista de Competições',
          href: competitionRoutes.adminList,
          icon: <FolderKanban className="h-4 w-4" />,
        },
        {
          label: 'Partidas Gerais',
          href: competitionRoutes.adminMatches,
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          label: 'Nova Competição',
          href: competitionRoutes.create,
          icon: <PlusCircle className="h-4 w-4" />,
        },
      ],
    },
    {
      title: 'Institucional',
      links: [
        {
          label: 'Painel da Organização',
          href: ROUTES.DASHBOARD_ORGANIZATION,
          icon: <Building2 className="h-4 w-4" />,
        },
        {
          label: 'Portal Público',
          href: competitionRoutes.list,
          icon: <ExternalLink className="h-4 w-4" />,
        },
      ],
    },
  ]
}

export function getCompetitionSidebarLinks(
  competitionId?: string,
  counts?: CompetitionSidebarCounts,
): NavItem[] {
  return getCompetitionSidebarSections(competitionId, counts).flatMap((section) => section.links)
}
