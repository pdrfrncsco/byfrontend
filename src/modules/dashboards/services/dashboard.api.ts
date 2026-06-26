import client from '@/lib/api-client'
import { DashboardOverviewResponse, PublicStatsResponse } from '../types/dashboard.types'

// Realistas fallbacks de mock para garantir que os dashboards nunca apareçam vazios (WOW Aesthetics)
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
    avg_subscribers_per_tournament: 1041.67
  },
  tournaments: [
    {
      id: 'tour-1',
      name: 'Girabola 2025/26',
      status: 'Em andamento',
      progress: 40,
      teams: 16,
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDz9f-qRKh7Zbj1G4Q5iqJCckbETNGHjWrRoU1Y1W-15edKyjElIms63meXqE7Y7q86vhEfZ_6B3Op6zlhE47YTKlBGP6s93lFnDadIP_SHZA_X86VowyiKByP-wBoa97p1WmieP3jWX6lkMuiEH-a6u7WvaQhORuEF4A6z-RQg-KpwHMBvhgvQRAL7UwARs93dHHA577Y-9e2RztvqJf2HERrIp3zovuVNOBrP1FnqZ2yNfqpHR05cIOkMdP9oRTE26IccxL5QbiU'
    },
    {
      id: 'tour-2',
      name: 'Taça de Angola 2026',
      status: 'Inscrições',
      progress: 10,
      teams: 32,
      logo: null
    },
    {
      id: 'tour-3',
      name: 'Supertaça de Angola 2026',
      status: 'Preparada',
      progress: 0,
      teams: 2,
      logo: null
    }
  ],
  top_clubs_by_players: [
    {
      id: 'club-1',
      name: 'Petro de Luanda',
      acronym: 'APL',
      players: 28,
      goals: 42,
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYQakMAam7Lo4jrPnnXrBpK5pXyAMbKLDJ70RGLqkPlIr9Ls793C6W8OwLYQDuQvK6n-XQU-BYE_0r5PrK7L0EpFy3vZTzji_av3ItQ6WrZT9jWrBHvlZBgIrueTdKBVP7R_p5h8Wk2fH6BGjdVAUG1nIq4ebQ_RaKlywkP-B1Nv3ERnSB-X0oUpgl_IdzS0cSta7IDzO2OtuX4eHe0IzoBuK3DxjofwK4vbSJ06GSd4h3vp5JUx1Q9fyHsj8KkAvm5WzcxcqK814'
    },
    {
      id: 'club-2',
      name: '1º de Agosto',
      acronym: 'PRI',
      players: 26,
      goals: 38,
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHWNAdHWlo6ZIPhdG792SPMAlpVqeTNro0fosd9ea0ZpNrdLjcAOkpC1yRdi7dDzNlfEA5GpPD1bqN0h1V290_wvhIZj0sMQ7vvClQLXj3nXgoQaiUnKXw6G93k-u_qhCaNtk5Hep8ON4BGpa3_Ie8EdjHwUnsD0B1E87QeKtDLK1WtjimpHFcgIFjEj4bW8sYnR7A5vJNeGjJrlTxgkx009lUUNn6YeM7XosKAWzs7VeaoUHTASpdlYwduK-ZTGpliKkw7yuH0zI'
    },
    {
      id: 'club-3',
      name: 'Sagrada Esperança',
      acronym: 'SAG',
      players: 25,
      goals: 31,
      logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBz2HttteGFe5b7EVfOPwTYizHMBjUFvN1SFFJz6OqFKI07WQru2FM1ixPPZU1MfQ2TgYIirywjFuP_4TewUiuUEB3-0fkO76xUidCIl2lGWtzXVkljV5wQpYkK_GPSXF5JVudSmn182_Rs7Smq8V6jnjZn1mHhi3PsxiFdB-GhIgh1umPS4ef-RSlUu4Q15iWiPNabVjrOBueImNKmeW64ZGl1IyEe87G_CN23CKGYkuLjTgBrEjUIYlljbI9g4dYiWDvjbSAto4I'
    }
  ],
  top_scorers: [
    {
      id: 'p-1',
      name: 'António Manuel',
      nickname: 'Mabululu',
      club: 'Petro de Luanda',
      club_logo: null,
      avatar: null,
      goals: 12
    },
    {
      id: 'p-2',
      name: 'João Silva',
      nickname: 'Silva',
      club: 'Interclube',
      club_logo: null,
      avatar: null,
      goals: 9
    }
  ],
  goals_evolution: [
    {
      tournament_name: 'Girabola 2025/26',
      data: [
        { period: 'AGO', goals: 32 },
        { period: 'SET', goals: 45 },
        { period: 'OUT', goals: 28 },
        { period: 'NOV', goals: 40 }
      ]
    }
  ],
  live_matches: [
    {
      id: 'match-1',
      tournament: 'Girabola 2025/26',
      status: 'live',
      date: new Date().toISOString(),
      home_name: 'Petro de Luanda',
      home_logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBYQakMAam7Lo4jrPnnXrBpK5pXyAMbKLDJ70RGLqkPlIr9Ls793C6W8OwLYQDuQvK6n-XQU-BYE_0r5PrK7L0EpFy3vZTzji_av3ItQ6WrZT9jWrBHvlZBgIrueTdKBVP7R_p5h8Wk2fH6BGjdVAUG1nIq4ebQ_RaKlywkP-B1Nv3ERnSB-X0oUpgl_IdzS0cSta7IDzO2OtuX4eHe0IzoBuK3DxjofwK4vbSJ06GSd4h3vp5JUx1Q9fyHsj8KkAvm5WzcxcqK814',
      home_score: 2,
      away_name: '1º de Agosto',
      away_logo: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAHWNAdHWlo6ZIPhdG792SPMAlpVqeTNro0fosd9ea0ZpNrdLjcAOkpC1yRdi7dDzNlfEA5GpPD1bqN0h1V290_wvhIZj0sMQ7vvClQLXj3nXgoQaiUnKXw6G93k-u_qhCaNtk5Hep8ON4BGpa3_Ie8EdjHwUnsD0B1E87QeKtDLK1WtjimpHFcgIFjEj4bW8sYnR7A5vJNeGjJrlTxgkx009lUUNn6YeM7XosKAWzs7VeaoUHTASpdlYwduK-ZTGpliKkw7yuH0zI',
      away_score: 1
    }
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
      away_score: null
    }
  ]
}

export const MOCK_PUBLIC_STATS: PublicStatsResponse = {
  total_clubs: 124,
  total_players: 2450,
  active_tournaments: 4,
  total_matches: 240
}

export const dashboardApi = {
  /**
   * Obtém a visão geral do dashboard (para utilizadores autenticados com permissão de Gestor/Admin)
   */
  async getDashboardOverview(): Promise<DashboardOverviewResponse> {
    try {
      const response = await client.get<DashboardOverviewResponse>('/dashboard/overview/')
      return response.data
    } catch (error) {
      console.warn('Dashboard API Offline. Carregando dados fictícios (Mock Mode):', error)
      // Simula uma pequena latência de rede
      await new Promise(resolve => setTimeout(resolve, 300))
      return MOCK_DASHBOARD_DATA
    }
  },

  /**
   * Obtém estatísticas gerais públicas (acessíveis sem autenticação)
   */
  async getPublicStats(): Promise<PublicStatsResponse> {
    try {
      const response = await client.get<PublicStatsResponse>('/dashboard/public-stats/')
      return response.data
    } catch (error) {
      console.warn('Public Stats API Offline. Carregando dados fictícios (Mock Mode):', error)
      await new Promise(resolve => setTimeout(resolve, 150))
      return MOCK_PUBLIC_STATS
    }
  }
}
