import { Competition, CompetitionFormat, CompetitionConfig } from '../types'

export function ensureCompetitionFormat(competition: any): Competition {
  if (!competition) return competition

  // If format is not present, map it from competition_type
  const format: CompetitionFormat = competition.format || competition.competition_type || 'league'

  // If config is not present, build a default config depending on the format
  let config: CompetitionConfig = competition.config

  if (!config) {
    if (format === 'league') {
      config = {
        format: 'league',
        rounds: 18,
        homeAndAway: true,
        pointsWin: 3,
        pointsDraw: 1,
        pointsLoss: 0,
        tiebreakers: [
          'head_to_head_points',
          'head_to_head_goal_difference',
          'goal_difference',
          'goals_scored',
          'fair_play',
          'random_draw',
        ],
        relegationZone: 0,
        promotionZone: 0,
      }
    } else if (format === 'tournament') {
      config = {
        format: 'tournament',
        groupStage: {
          numberOfGroups: 4,
          teamsPerGroup: 4,
          qualifiersPerGroup: 2,
          homeAndAway: true,
        },
        knockoutStage: {
          rounds: ['quarter-final', 'semi-final', 'final'],
          twoLegs: false,
          extraTimeOnDraw: true,
          penaltiesOnDraw: true,
        },
      }
    } else {
      config = {
        format: 'cup',
        seeded: false,
        twoLegs: false,
        twoLegsFinal: false,
        extraTimeOnDraw: true,
        penaltiesOnDraw: true,
        rounds: ['round-of-16', 'quarter-final', 'semi-final', 'final'],
        byeAllowed: true,
      }
    }
  }

  // Sane defaults for phases
  const phases = competition.phases || [
    {
      id: 'default-phase',
      name: format === 'league' ? 'Fase Única' : format === 'tournament' ? 'Fase de Grupos' : 'Eliminatórias',
      type: format === 'league' ? 'round_robin' : format === 'tournament' ? 'group_stage' : 'knockout',
      order: 1,
      status: 'active',
    },
  ]

  return {
    ...competition,
    format,
    config,
    phases,
    currentPhase: competition.currentPhase || phases[0]?.id,
  }
}
