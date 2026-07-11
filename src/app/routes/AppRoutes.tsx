import { Routes } from 'react-router-dom'
import { publicRouteElements } from './slices/publicRoutes'
import { dashboardRouteElements } from './slices/dashboardRoutes'
import { contentRouteElements } from './slices/contentRoutes'

/**
 * AppRoutes composes domain-specific route slices:
 *  - publicRouteElements   → auth, landing, profile, 404
 *  - dashboardRouteElements → dashboards, org/club management, onboarding
 *  - contentRouteElements  → public browse: clubs, competitions, players, orgs
 */
export function AppRoutes() {
  return (
    <Routes>
      {publicRouteElements()}
      {dashboardRouteElements()}
      {contentRouteElements()}
    </Routes>
  )
}
