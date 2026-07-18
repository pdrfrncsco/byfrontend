import type { ReactNode } from 'react'
import {
  BookOpen,
  Calendar,
  ExternalLink,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldAlert,
  Target,
  Trophy,
  Users,
} from 'lucide-react'
import { competitionRoutes } from '../routes'
import { ROUTES } from '@/constants/routes'

interface CompetitionSidebarLink {
  label: string
  href: string
  icon: ReactNode
  disabled?: boolean
}

export function getCompetitionSidebarLinks(competitionId?: string): CompetitionSidebarLink[] {
  const hasCompetition = Boolean(competitionId)
  const competitionPath = competitionId ?? ''

  return [
    { label: 'Painel da Organização', href: ROUTES.DASHBOARD_ORGANIZATION, icon: <LayoutDashboard className="h-4 w-4" /> },
    { label: 'Visão Geral (Provas)', href: competitionRoutes.dashboard, icon: <Trophy className="h-4 w-4" /> },
    { label: 'Nova Competição', href: competitionRoutes.create, icon: <PlusCircle className="h-4 w-4" /> },
    ...(hasCompetition
      ? [
          {
            label: 'Painel da Competição',
            href: competitionRoutes.adminDashboard(competitionPath),
            icon: <LayoutDashboard className="h-4 w-4" />,
          },
          {
            label: 'Configurações',
            href: competitionRoutes.settings(competitionPath),
            icon: <Settings className="h-4 w-4" />,
          },
          {
            label: 'Inscrições',
            href: competitionRoutes.registration(competitionPath),
            icon: <Users className="h-4 w-4" />,
          },
          {
            label: 'Calendário',
            href: competitionRoutes.schedule(competitionPath),
            icon: <Calendar className="h-4 w-4" />,
          },
          {
            label: 'Rankings',
            href: competitionRoutes.adminRankings(competitionPath),
            icon: <Target className="h-4 w-4" />,
          },
          {
            label: 'Suspensões',
            href: competitionRoutes.adminSuspensions(competitionPath),
            icon: <ShieldAlert className="h-4 w-4" />,
          },
          {
            label: 'Regulamentos',
            href: competitionRoutes.adminRegulations(competitionPath),
            icon: <BookOpen className="h-4 w-4" />,
          },
          {
            label: 'Página Pública',
            href: competitionRoutes.detail(competitionPath),
            icon: <ExternalLink className="h-4 w-4" />,
          },
        ]
      : [
          {
            label: 'Página Pública',
            href: competitionRoutes.list,
            icon: <ExternalLink className="h-4 w-4" />,
          },
        ]),
  ]
}
