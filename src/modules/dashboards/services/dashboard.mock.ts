/**
 * Dados mock para dashboards
 * 
 * ATENÇÃO: Este ficheiro só deve ser carregado em modo de desenvolvimento
 * quando VITE_ENABLE_DASHBOARD_MOCK=true
 * 
 * Em produção, estes dados NUNCA devem ser usados.
 */

import type { DashboardOverviewResponse, PublicStatsResponse } from '../types/dashboard.types'

/**
 * Dados mock realistas para desenvolvimento visual
 * Use apenas para testar layouts e componentes
 */
export const MOCK_DASHBOARD_DATA: DashboardOverviewResponse = {
  kpis: {
    total_clubs: 124,
    total_players: 2450,
    total_news: 45,
    active_tournaments: 4,
    tournaments_upcoming: 2,
    tournaments_completed: 6,
    matches_finished: 96,
    matches_scheduled: 144,
    matches_live: 1,
    total_matches: 240,
    matches_today: 9,
    players_this_month: 42,
    players_last_month: 38,
    goals_total: 264,
    avg_goals_per_match: 2.75,
    organization_subscribers: 12500,
    total_revenue: 4200000,
    avg_subscribers_per_tournament: 1041.67,
  },
  tournaments: [
    {
      id: 'tour-1',
      name: 'Girabola 2025/26',
      status: 'Em andamento',
      progress: 40,
      teams: 16,
      logo: 'https://via.placeholder.com/40',
    },
    {
      id: 'tour-2',
      name: 'Taça de Angola 2026',
      status: 'Inscrições',
      progress: 10,
      teams: 32,
      logo: null,
    },
    {
      id: 'tour-3',
      name: 'Supertaça de Angola 2026',
      status: 'Preparada',
      progress: 0,
      teams: 2,
      logo: null,
    },
  ],
  top_clubs_by_players: [
    {
      id: 'club-1',
      name: 'Petro de Luanda',
      acronym: 'APL',
      players: 28,
      goals: 42,
      logo: 'https://via.placeholder.com/40',
    },
    {
      id: 'club-2',
      name: '1º de Agosto',
      acronym: 'PRI',
      players: 26,
      goals: 38,
      logo: 'https://via.placeholder.com/40',
    },
    {
      id: 'club-3',
      name: 'Sagrada Esperança',
      acronym: 'SAG',
      players: 25,
      goals: 31,
      logo: 'https://via.placeholder.com/40',
    },
  ],
  top_scorers: [
    {
      id: 'p-1',
      name: 'António Manuel',
      nickname: 'Mabululu',
      club: 'Petro de Luanda',
      club_logo: null,
      avatar: null,
      goals: 12,
    },
    {
      id: 'p-2',
      name: 'João Silva',
      nickname: 'Silva',
      club: 'Interclube',
      club_logo: null,
      avatar: null,
      goals: 9,
    },
  ],
  goals_evolution: [
    {
      tournament_name: 'Girabola 2025/26',
      data: [
        { period: 'AGO', goals: 32 },
        { period: 'SET', goals: 45 },
        { period: 'OUT', goals: 28 },
        { period: 'NOV', goals: 40 },
      ],
    },
  ],
  live_matches: [
    {
      id: 'match-1',
      tournament: 'Girabola 2025/26',
      status: 'live',
      date: new Date().toISOString(),
      home_name: 'Petro de Luanda',
      home_logo: 'https://via.placeholder.com/40',
      home_score: 2,
      away_name: '1º de Agosto',
      away_logo: 'https://via.placeholder.com/40',
      away_score: 1,
    },
  ],
  upcoming_matches: [
    {
      id: 'match-2',
      tournament: 'Girabola 2025/26',
      status: 'scheduled',
      date: new Date(Date.now() + 86400000).toISOString(),
      home_name: 'Wiliete SC',
      home_logo: null,
      home_score: null,
      away_name: 'Desp. Huíla',
      away_logo: null,
      away_score: null,
    },
  ],
}

export const MOCK_PUBLIC_STATS: PublicStatsResponse = {
  total_clubs: 124,
  total_players: 2450,
  active_tournaments: 4,
  total_matches: 240,
}

/**
 * Funções getter para lazy loading dos mocks
 * Isto garante que os dados mock só são carregados quando necessário
 */
export function getMockDashboardData(): DashboardOverviewResponse {
  return MOCK_DASHBOARD_DATA
}

export function getMockPublicStats(): PublicStatsResponse {
  return MOCK_PUBLIC_STATS
}
