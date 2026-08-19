// src/modules/competitions/types/match-event.types.ts

import { MatchEventType, MatchEvent } from './match.types'

export interface MatchEventFormData {
  type: MatchEventType;
  minute: number;
  minuteExtra?: number;
  period: 'first_half' | 'second_half' | 'extra_time' | 'penalties';
  teamId: string;
  playerId?: string;
  assistPlayerId?: string;        // Para golos
  substitutedPlayerId?: string;   // Para substituições
  description?: string;
  idempotencyKey?: string;
}

// Type Guards for narrowing match event types
export function isGoalEvent(event: MatchEvent): boolean {
  return ['goal', 'own_goal', 'penalty_goal'].includes(event.type)
}

export function isCardEvent(event: MatchEvent): boolean {
  return ['yellow_card', 'red_card', 'yellow_red_card'].includes(event.type)
}

export function isSubstitutionEvent(event: MatchEvent): boolean {
  return event.type === 'substitution'
}

export function isPeriodChangeEvent(event: MatchEvent): boolean {
  return ['kickoff', 'halftime', 'fulltime'].includes(event.type)
}
