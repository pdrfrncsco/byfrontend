import { useQuery } from '@tanstack/react-query'
import { dashboardApi } from '../services/dashboard.api'

/**
 * Hook para obter a visão geral do dashboard (dados completos)
 */
export function useDashboardOverview() {
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => dashboardApi.getDashboardOverview(),
  })
}

/**
 * Hook para obter estatísticas públicas da plataforma
 */
export function usePublicStats() {
  return useQuery({
    queryKey: ['dashboard', 'public-stats'],
    queryFn: () => dashboardApi.getPublicStats(),
  })
}
