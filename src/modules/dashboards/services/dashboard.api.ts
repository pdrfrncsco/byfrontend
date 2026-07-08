import client from '@/lib/api-client'
import { DashboardOverviewResponse, PublicStatsResponse } from '../types/dashboard.types'

/**
 * NOTA: Dados mock removidos conforme Fase D - Qualidade
 * Os dashboards agora mostram estados de erro honestos quando a API falha.
 * Isto evita a "demo enganosa" mencionada no diagnóstico.
 * 
 * Se precisar de testar visualizações com dados fictícios, use:
 * - Variável de ambiente: VITE_ENABLE_DASHBOARD_MOCK=true
 * - Ou injete dados via props nos componentes de dashboard
 */

// Empty state response for graceful degradation
const EMPTY_DASHBOARD_RESPONSE: DashboardOverviewResponse = {
  kpis: {
    total_clubs: 0,
    total_players: 0,
    total_news: 0,
    active_tournaments: 0,
    tournaments_upcoming: 0,
    tournaments_completed: 0,
    matches_finished: 0,
    matches_scheduled: 0,
    matches_live: 0,
    total_matches: 0,
    matches_today: 0,
    players_this_month: 0,
    players_last_month: 0,
    goals_total: 0,
    avg_goals_per_match: 0,
    organization_subscribers: 0,
    total_revenue: 0,
    avg_subscribers_per_tournament: 0,
  },
  tournaments: [],
  top_clubs_by_players: [],
  top_scorers: [],
  goals_evolution: [],
  live_matches: [],
  upcoming_matches: [],
}

const EMPTY_PUBLIC_STATS: PublicStatsResponse = {
  total_clubs: 0,
  total_players: 0,
  active_tournaments: 0,
  total_matches: 0,
}

/**
 * Verifica se o modo mock está habilitado via variável de ambiente
 */
const isMockEnabled = import.meta.env.VITE_ENABLE_DASHBOARD_MOCK === 'true'

export const dashboardApi = {
  /**
   * Obtém a visão geral do dashboard (para utilizadores autenticados com permissão de Gestor/Admin)
   * 
   * Comportamento:
   * - Em produção: Lança erro se a API falhar (para tratamento no componente)
   * - Em desenvolvimento com VITE_ENABLE_DASHBOARD_MOCK=true: Retorna dados mock
   * 
   * @throws Error quando a API não está disponível (exceto em modo mock)
   */
  async getDashboardOverview(): Promise<DashboardOverviewResponse> {
    try {
      const response = await client.get<DashboardOverviewResponse>('/dashboard/overview/')
      return response.data
    } catch (error) {
      // Em modo mock, retorna dados fictícios para desenvolvimento visual
      if (isMockEnabled) {
        console.warn('[DEV MODE] Dashboard API offline. Retornando dados mock.')
        // Lazy import para evitar bundle bloat em produção
        const { getMockDashboardData } = await import('./dashboard.mock')
        return getMockDashboardData()
      }

      // Em produção, propaga o erro para o componente tratar
      console.error('Dashboard API indisponível:', error)
      throw new Error('Dashboard temporariamente indisponível. Tente novamente mais tarde.')
    }
  },

  /**
   * Obtém estatísticas gerais públicas (acessíveis sem autenticação)
   * 
   * @throws Error quando a API não está disponível (exceto em modo mock)
   */
  async getPublicStats(): Promise<PublicStatsResponse> {
    try {
      const response = await client.get<PublicStatsResponse>('/dashboard/public-stats/')
      return response.data
    } catch (error) {
      if (isMockEnabled) {
        console.warn('[DEV MODE] Public Stats API offline. Retornando dados mock.')
        const { getMockPublicStats } = await import('./dashboard.mock')
        return getMockPublicStats()
      }

      console.error('Public Stats API indisponível:', error)
      throw new Error('Estatísticas temporariamente indisponíveis.')
    }
  },

  /**
   * Retorna dados vazios para estados de erro gracefully
   * Útil quando se quer mostrar o layout sem dados
   */
  getEmptyDashboard(): DashboardOverviewResponse {
    return EMPTY_DASHBOARD_RESPONSE
  },

  getEmptyPublicStats(): PublicStatsResponse {
    return EMPTY_PUBLIC_STATS
  },
}
