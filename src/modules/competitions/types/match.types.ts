// src/modules/competitions/types/match.types.ts

export type MatchStatus =
  | 'scheduled'    // Agendado
  | 'pre_match'    // Pré-jogo (escalações abertas)
  | 'live'         // Ao vivo
  | 'halftime'     // Intervalo
  | 'finished'     // Terminado
  | 'postponed'    // Adiado
  | 'cancelled'    // Cancelado
  | 'walkover';    // Walkover/WO

export type MatchEventType =
  | 'goal'
  | 'own_goal'
  | 'penalty_goal'
  | 'penalty_missed'
  | 'yellow_card'
  | 'red_card'
  | 'yellow_red_card'
  | 'substitution'
  | 'injury'
  | 'var_review'
  | 'kickoff'
  | 'halftime'
  | 'fulltime';

export type EventType =
  | 'goal'
  | 'own_goal'
  | 'yellow_card'
  | 'red_card'
  | 'yellow_red'
  | 'substitution_in'
  | 'substitution_out'
  | 'penalty_scored'
  | 'penalty_missed';

export interface MatchEvent {
  id: string;
  matchId: string;
  type: MatchEventType;
  minute: number;
  minuteExtra?: number;
  period: 'first_half' | 'second_half' | 'extra_time' | 'penalties';
  teamId: string;
  playerId?: string;
  assistPlayerId?: string;        // Para golos
  substitutedPlayerId?: string;   // Para substituições
  description?: string;
  createdBy: string;
  createdAt: string;
  updatedAt?: string;

  // Legacy fields for backward compatibility
  event_type: EventType;
  event_type_label: string;
  extra_time: boolean;
  player: string | null;
  player_name: string | null;
  player_off: string | null;
  player_off_name: string | null;
  club: string;
  club_name: string;
  club_logo: string | null;
  notes: string;
  created_at: string;
}

export interface MatchLineup {
  matchId: string;
  teamId: string;
  formation: string;              // ex: '4-3-3'
  startingXI: LineupPlayer[];
  substitutes: LineupPlayer[];
  coach?: string;
  submittedAt?: string;
  lockedAt?: string;
}

export interface LineupPlayer {
  playerId: string;
  playerName: string;
  playerNumber: number;
  position: 'GK' | 'DF' | 'MF' | 'FW';
  positionSpecific?: string;      // ex: 'CB', 'CM', 'ST'
  eligible: boolean;
  eligibilityWarning?: string;
  avatarUrl?: string;

  // Legacy fields for backward compatibility
  id: string;
  player: {
    id: string;
    full_name: string;
    position: string;
    date_of_birth?: string;
    nationality?: string;
  };
  player_id: string;
  status: 'starter' | 'substitute';
  status_display?: string;
  position_display?: string;
  shirt_number: number;
  is_captain: boolean;
  is_goalkeeper: boolean;
  formation_position?: number;
  minutes_played?: number;
  substituted_in_minute?: number;
  substituted_out_minute?: number;
}

export interface MatchScore {
  home: number;
  away: number;
  homeFirstHalf?: number;
  awayFirstHalf?: number;
  homePenalties?: number;
  awayPenalties?: number;
}

export interface Match {
  id: string;
  competitionId: string;
  roundNumber: number;
  roundLabel?: string;
  homeTeamId: string;
  homeTeamName: string;
  homeTeamLogo?: string;
  awayTeamId: string;
  awayTeamName: string;
  awayTeamLogo?: string;
  scheduledAt: string;
  venue?: string;
  status: MatchStatus;
  score?: MatchScore;
  events?: MatchEvent[];
  homeLineup?: MatchLineup;
  awayLineup?: MatchLineup;
  refereeId?: string;
  refereeName?: string;
  delegateId?: string;
  attendees?: number;
  streamUrl?: string;
  reportSubmittedAt?: string;
  reportApprovedAt?: string;

  // Legacy fields for backward compatibility
  competition: string;
  round_number: number;
  round_name?: string | null;
  phase?: string | null;
  group_id?: string | null;
  home_club: string;
  home_club_name: string;
  home_club_logo: string | null;
  away_club: string;
  away_club_name: string;
  away_club_logo: string | null;
  match_date: string;
  status_label: string;
  home_score: number | null;
  away_score: number | null;
}

export interface MatchStats {
  matchId: string;
  home: TeamMatchStats;
  away: TeamMatchStats;

  // Legacy fields for backward compatibility
  id?: string;
  match?: string;
  club?: string;
  possession?: number;
  possession_display?: string;
  shots_on_goal?: number;
  shots_off_goal?: number;
  passes?: number;
  passes_accuracy?: number;
  fouls?: number;
  yellow_cards?: number;
  red_cards?: number;
  corner_kicks?: number;
  created_at?: string;
  updated_at?: string;
}

export interface TeamMatchStats {
  teamId: string;
  shots: number;
  shotsOnTarget: number;
  possession: number;
  corners: number;
  fouls: number;
  offsides: number;
  yellowCards: number;
  redCards: number;
  passes: number;
  passAccuracy: number;
}
