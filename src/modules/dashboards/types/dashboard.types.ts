export interface DashboardKpis {
  total_clubs: number
  total_players: number
  total_news: number
  active_tournaments: number
  tournaments_upcoming: number
  tournaments_completed: number
  matches_finished: number
  matches_scheduled: number
  matches_live: number
  total_matches: number
  matches_today: number
  players_this_month: number
  players_last_month: number
  goals_total: number
  avg_goals_per_match: number
  organization_subscribers: number
  total_revenue: number
  avg_subscribers_per_tournament: number
}

export interface DashboardTournamentSummary {
  id: string
  name: string
  status: string
  progress: number
  teams: number
  logo: string | null
}

export interface DashboardTopClub {
  id: string
  name: string
  players: number
  acronym: string
  logo: string | null
  goals: number
}

export interface DashboardTopScorer {
  id: string
  name: string
  nickname: string
  club: string
  club_logo: string | null
  avatar: string | null
  goals: number
}

export interface DashboardMatch {
  id: string
  tournament: string
  status: 'scheduled' | 'live' | 'finished'
  date: string
  home_name: string
  home_logo: string | null
  home_score: number | null
  away_name: string
  away_logo: string | null
  away_score: number | null
}

export interface GoalsEvolutionPeriod {
  period: string
  goals: number
}

export interface GoalsEvolution {
  tournament_name: string
  data: GoalsEvolutionPeriod[]
}

export interface DashboardOverviewResponse {
  kpis: DashboardKpis
  tournaments: DashboardTournamentSummary[]
  top_clubs_by_players: DashboardTopClub[]
  top_scorers: DashboardTopScorer[]
  goals_evolution: GoalsEvolution[]
  live_matches: DashboardMatch[]
  upcoming_matches: DashboardMatch[]
}

export interface PublicStatsResponse {
  total_clubs: number
  total_players: number
  active_tournaments: number
  total_matches: number
}
