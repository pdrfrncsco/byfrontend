import type { ReactNode } from 'react'
import {
  Calendar,
  ExternalLink,
  LayoutDashboard,
  PlusCircle,
  Settings,
  ShieldAlert,
  Trophy,
  Users,
} from 'lucide-react'
import { competitionRoutes } from '../routes'
import { ROUTES } from '@/constants/routes'

interface CompetitionSidebarLink {
  label: string
  href: string
  icon: ReactNode
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
            href: competitionRoutes.rankings(competitionPath),
            icon: <Trophy className="h-4 w-4" />,
          },
          {
            label: 'Suspensões',
            href: competitionRoutes.suspensions(competitionPath),
            icon: <ShieldAlert className="h-4 w-4" />,
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
