import { ROUTES } from '@/constants'

export const competitionRoutes = {
  list: ROUTES.COMPETITIONS,
  detail: (id: string) => ROUTES.COMPETITION_DETAIL(id),
  rankings: (id: string) => ROUTES.COMPETITION_RANKINGS(id),
  suspensions: (id: string) => ROUTES.COMPETITION_SUSPENSIONS(id),
  dashboard: ROUTES.DASHBOARD_COMPETITION,
  create: ROUTES.DASHBOARD_COMPETITIONS_CREATE,
  adminDashboard: (id: string) => ROUTES.COMPETITION_ADMIN_DASHBOARD(id),
  settings: (id: string) => ROUTES.DASHBOARD_COMPETITIONS_SETTINGS(id),
  registration: (id: string) => ROUTES.DASHBOARD_COMPETITIONS_REGISTRATION(id),
  schedule: (id: string) => ROUTES.DASHBOARD_COMPETITIONS_SCHEDULE(id),
  adminRankings: (id: string) => ROUTES.COMPETITION_ADMIN_RANKINGS(id),
  adminSuspensions: (id: string) => ROUTES.COMPETITION_ADMIN_SUSPENSIONS(id),
  adminRegulations: (id: string) => ROUTES.COMPETITION_ADMIN_REGULATIONS(id),
  matchCenter: (compId: string, matchId: string) => ROUTES.MATCH_CENTER(compId, matchId),
  matchLineup: (compId: string, matchId: string) => ROUTES.MATCH_LINEUP(compId, matchId),
  matchReport: (compId: string, matchId: string) => ROUTES.MATCH_REPORT(compId, matchId),
}
