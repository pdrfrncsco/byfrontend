import { ROUTES } from '@/constants'

export const organizationRoutes = {
  list: ROUTES.ORGANIZATIONS,
  detail: (slug: string) => ROUTES.ORGANIZATION_DETAIL(slug),
  settings: ROUTES.ORGANIZATION_SETTINGS,
  dashboard: ROUTES.DASHBOARD_ORGANIZATION,
  members: ROUTES.DASHBOARD_ORGANIZATION_MEMBERS,
  affiliations: ROUTES.DASHBOARD_ORGANIZATION_AFFILIATIONS,
}
