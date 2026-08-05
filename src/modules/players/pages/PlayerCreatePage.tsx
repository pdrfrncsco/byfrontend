import { Navigate, useSearchParams } from 'react-router-dom'
import { ROUTES } from '@/constants/routes'

export function PlayerCreatePage() {
  const [searchParams] = useSearchParams()
  const qs = searchParams.toString()
  const to = ROUTES.DASHBOARD_PLAYERS_CREATE + (qs ? `?${qs}` : '')
  return <Navigate to={to} replace />

}
