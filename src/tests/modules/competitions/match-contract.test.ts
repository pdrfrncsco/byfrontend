import { describe, expect, it } from 'vitest'
import { normalizeMatch } from '@/modules/competitions/services/competition.api'

describe('match contract normalization', () => {
  it('maps legacy backend fields to the canonical Match contract', () => {
    const match = normalizeMatch({
      id: 'match-1',
      competition: 'comp-1',
      round_number: 3,
      round_name: 'Jornada 3',
      home_club: 'club-1',
      home_club_name: 'Home FC',
      home_club_logo: '/logo-home.png',
      away_club: 'club-2',
      away_club_name: 'Away FC',
      away_club_logo: '/logo-away.png',
      match_date: '2026-08-18T20:00:00Z',
      status: 'live',
      home_score: 2,
      away_score: 1,
    })

    expect(match.competitionId).toBe('comp-1')
    expect(match.roundNumber).toBe(3)
    expect(match.roundLabel).toBe('Jornada 3')
    expect(match.homeTeamId).toBe('club-1')
    expect(match.homeTeamName).toBe('Home FC')
    expect(match.awayTeamName).toBe('Away FC')
    expect(match.scheduledAt).toBe('2026-08-18T20:00:00Z')
    expect(match.score?.home).toBe(2)
    expect(match.score?.away).toBe(1)
    expect(match.status).toBe('live')
  })
})
