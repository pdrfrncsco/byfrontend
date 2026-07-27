import { useCompetition } from './useCompetitions'
import { CompetitionConfig, LeagueConfig, TournamentConfig, CupConfig } from '../types/competition-format.types'

export interface TabConfig {
  id: string
  label: string
}

function buildNavTabs(format?: string): TabConfig[] {
  const base = [
    { id: 'info', label: 'Informação' },
    { id: 'schedule', label: 'Jogos' },
  ]

  if (format === 'league') {
    return [
      ...base,
      { id: 'standings', label: 'Classificação' },
      { id: 'stats', label: 'Estatísticas' },
      { id: 'regulations', label: 'Regulamento' },
    ]
  }

  if (format === 'tournament') {
    return [
      ...base,
      { id: 'groups', label: 'Grupos' },
      { id: 'bracket', label: 'Fase Final' },
      { id: 'stats', label: 'Estatísticas' },
      { id: 'regulations', label: 'Regulamento' },
    ]
  }

  if (format === 'cup') {
    return [
      ...base,
      { id: 'bracket', label: 'Eliminatórias' },
      { id: 'stats', label: 'Estatísticas' },
      { id: 'regulations', label: 'Regulamento' },
    ]
  }

  return base
}

export function useCompetitionConfig(competitionId: string) {
  const { data: competition, isLoading, error } = useCompetition(competitionId)

  const format = competition?.format || competition?.competition_type
  const isLeague = format === 'league'
  const isTournament = format === 'tournament'
  const isCup = format === 'cup'

  const config = competition?.config as CompetitionConfig | undefined

  const leagueConfig = isLeague ? config as LeagueConfig : null
  const tournamentConfig = isTournament ? config as TournamentConfig : null
  const cupConfig = isCup ? config as CupConfig : null

  return {
    competition,
    isLoading,
    error,
    format,
    isLeague,
    isTournament,
    isCup,
    leagueConfig,
    tournamentConfig,
    cupConfig,
    navTabs: buildNavTabs(format),
  }
}
