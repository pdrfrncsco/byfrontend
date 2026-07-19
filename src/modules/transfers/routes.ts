import { ROUTES } from '@/constants/routes'

export const transferRoutes = {
  /** Organization / tenant-wide transfers hub */
  list: ROUTES.DASHBOARD_TRANSFERS,
  create: ROUTES.DASHBOARD_TRANSFERS_CREATE,
  detail: (id: string) => ROUTES.DASHBOARD_TRANSFER_DETAIL(id),
  /** Club-scoped aliases (same pages, club layout) */
  clubList: ROUTES.DASHBOARD_CLUB_TRANSFERS,
  clubCreate: ROUTES.DASHBOARD_CLUB_TRANSFERS_CREATE,
  clubDetail: (id: string) => ROUTES.DASHBOARD_CLUB_TRANSFER_DETAIL(id),
  /** Legacy public path used by org dashboard links */
  legacy: ROUTES.TRANSFERS,
}
