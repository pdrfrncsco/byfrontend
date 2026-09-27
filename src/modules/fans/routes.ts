import { ROUTES } from '@/constants/routes'

export const fanRoutes = {
  dashboard: ROUTES.DASHBOARD_FAN || '/dashboard/fan',
  favorites: ROUTES.DASHBOARD_FAN_FAVORITES || '/dashboard/fan/favorites',
  matches: ROUTES.DASHBOARD_FAN_MATCHES || '/dashboard/fan/matches',
  community: ROUTES.DASHBOARD_FAN_COMMUNITY || '/dashboard/fan/community',
} as const
