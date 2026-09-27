import {
  Home,
  Heart,
  Calendar,
  Trophy,
  Compass,
  Bell,
  Settings,
} from 'lucide-react'
import { ROUTES } from '@/constants/routes'
import type { NavItem } from '@/types/navigation'

export function getFanSidebarLinks(): NavItem[] {
  return [
    {
      key: 'fan-dashboard',
      label: 'Meu Futebol',
      href: ROUTES.DASHBOARD_FAN || '/dashboard/fan',
      icon: Home,
    },
    {
      key: 'fan-favorites',
      label: 'Clubes & Atletas',
      href: ROUTES.DASHBOARD_FAN_FAVORITES || '/dashboard/fan/favorites',
      icon: Heart,
    },
    {
      key: 'fan-matches',
      label: 'Jogos & Calendário',
      href: ROUTES.MATCHES,
      icon: Calendar,
    },
    {
      key: 'fan-community',
      label: 'Palpites & Ranking',
      href: ROUTES.DASHBOARD_FAN_COMMUNITY || '/dashboard/fan/community',
      icon: Trophy,
    },
    {
      key: 'fan-explore',
      label: 'Explorar Futebol',
      href: ROUTES.PUBLIC_EXPLORE,
      icon: Compass,
    },
    {
      key: 'fan-notifications',
      label: 'Notificações',
      href: ROUTES.NOTIFICATIONS,
      icon: Bell,
    },
    {
      key: 'fan-settings',
      label: 'Definições',
      href: ROUTES.SETTINGS,
      icon: Settings,
    },
  ]
}
