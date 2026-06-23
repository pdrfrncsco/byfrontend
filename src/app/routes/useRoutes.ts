import { ROUTES } from '@/constants'

export function useRoutes() {
  const routes = {
    home: ROUTES.HOME,
    login: ROUTES.LOGIN,
    register: ROUTES.REGISTER,
    dashboard: ROUTES.DASHBOARD,
    profile: ROUTES.PROFILE,
    settings: ROUTES.SETTINGS,
    organizations: ROUTES.ORGANIZATIONS,
    clubs: ROUTES.CLUBS,
    players: ROUTES.PLAYERS,
    competitions: ROUTES.COMPETITIONS,
    matches: ROUTES.MATCHES,
    transfers: ROUTES.TRANSFERS,
    news: ROUTES.NEWS,
  }

  return routes
}

export const navigationRoutes = [
  { path: '/', label: 'Home' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/organizations', label: 'Organizations' },
  { path: '/clubs', label: 'Clubs' },
  { path: '/players', label: 'Players' },
  { path: '/competitions', label: 'Competitions' },
]
