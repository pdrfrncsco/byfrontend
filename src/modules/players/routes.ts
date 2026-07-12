import { ROUTES } from '@/constants'

export const playerRoutes = {
  list: ROUTES.PLAYERS,
  detail: (slug: string) => ROUTES.PLAYER_DETAIL(slug),
  create: ROUTES.PLAYER_CREATE,
  edit: (slug: string) => ROUTES.PLAYER_EDIT(slug),
  dashboard: ROUTES.DASHBOARD_PLAYER,
  dashboardSettings: ROUTES.DASHBOARD_PLAYER_SETTINGS,
  clubRegister: ROUTES.DASHBOARD_CLUB_REGISTER_PLAYER,
}
