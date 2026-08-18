import { describe, expect, it } from 'vitest'
import { normalizeMatchEventPayload } from '@/modules/competitions/services/match.api'

describe('match event payload contract', () => {
  it('converts legacy form payloads into the backend contract', () => {
    const payload = normalizeMatchEventPayload({
      type: 'goal',
      minute: 45,
      minuteExtra: 1,
      period: 'second_half',
      teamId: 'club-2',
      playerId: 'player-1',
      substitutedPlayerId: 'player-2',
      description: 'Assistência',
    })

    expect(payload).toMatchObject({
      event_type: 'goal',
      minute: 45,
      extra_time: true,
      club: 'club-2',
      player: 'player-1',
      player_off: 'player-2',
      notes: 'Assistência',
    })
  })
})
