export const COMPETITION_FORMAT = {
  LEAGUE:      'league',      // Campeonato — pontos corridos
  TOURNAMENT:  'tournament',  // Torneio — grupos + eliminatórias
  CUP:         'cup',         // Taça/Copa — eliminação directa
} as const;

export type CompetitionFormat = typeof COMPETITION_FORMAT[keyof typeof COMPETITION_FORMAT];

export type TiebreakerRule =
  | 'head_to_head_points'
  | 'head_to_head_goal_difference'
  | 'goal_difference'
  | 'goals_scored'
  | 'fair_play'
  | 'random_draw';

export interface LeagueConfig {
  format: 'league';
  rounds: number;              // número de jornadas
  homeAndAway: boolean;        // ida e volta
  pointsWin: number;           // default 3
  pointsDraw: number;          // default 1
  pointsLoss: number;          // default 0
  tiebreakers: TiebreakerRule[]; // critérios de desempate ordenados
  relegationZone: number;      // nº de equipas a descer
  promotionZone: number;       // nº de equipas a subir
}

export type KnockoutRound = 'final' | 'semi-final' | 'quarter-final' | 'round-of-16' | 'round-of-32';
export type CupRound = 'final' | 'semi-final' | 'quarter-final' | 'round-of-16' | 'round-of-32' | 'round-of-64';

// Torneio — fase de grupos + eliminatórias
export interface TournamentConfig {
  format: 'tournament';
  groupStage: {
    numberOfGroups: number;
    teamsPerGroup: number;
    qualifiersPerGroup: number;   // quantos passam de cada grupo
    homeAndAway: boolean;
  };
  knockoutStage: {
    rounds: KnockoutRound[];      // ['quarter-final','semi-final','final']
    twoLegs: boolean;             // ida e volta nas eliminatórias
    extraTimeOnDraw: boolean;
    penaltiesOnDraw: boolean;
  };
}

// Taça/Copa — eliminação directa
export interface CupConfig {
  format: 'cup';
  seeded: boolean;              // sorteio com cabeças-de-série
  twoLegs: boolean;             // ida e volta (excepto final)
  twoLegsFinal: boolean;        // final também a duas mãos
  extraTimeOnDraw: boolean;
  penaltiesOnDraw: boolean;
  rounds: CupRound[];           // ['32-avos','16-avos','quartos','semis','final']
  byeAllowed: boolean;          // equipas com bye na 1ª ronda
}

export type CompetitionConfig = LeagueConfig | TournamentConfig | CupConfig;

export interface CompetitionPhase {
  id: string;
  name: string;
  type: 'round_robin' | 'group_stage' | 'knockout' | 'final';
  order: number;
  status: 'pending' | 'active' | 'completed';
}
