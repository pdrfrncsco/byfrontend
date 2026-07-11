import { ROUTES } from '@/constants'

export const playerRoutes = {
  list: ROUTES.PLAYERS,
  detail: (slug: string) => ROUTES.PLAYER_DETAIL(slug),
}
