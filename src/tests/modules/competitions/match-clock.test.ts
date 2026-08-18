import { describe, expect, it } from 'vitest'
import { formatMatchClock, getMatchClockInfo } from '@/modules/competitions/utils/match-clock'

describe('match clock', () => {
  it('shows first-half minute in normal time', () => {
    expect(getMatchClockInfo({ status: 'live', events: [{ minute: 23, period: 'first_half' } as any] }).display).toBe("23'")
    expect(formatMatchClock({ status: 'live', events: [{ minute: 23, period: 'first_half' } as any] })).toBe('1T 23\'')
  })

  it('switches to halftime and second half labels correctly', () => {
    expect(getMatchClockInfo({ status: 'halftime' }).shortLabel).toBe('INT')
    expect(formatMatchClock({ status: 'halftime' })).toBe('Intervalo')
    expect(getMatchClockInfo({ status: 'live', events: [{ minute: 50, period: 'second_half' } as any] }).shortLabel).toBe('2T')
  })

  it('supports extra time and penalties periods', () => {
    expect(getMatchClockInfo({ status: 'live', events: [{ minute: 96, period: 'extra_time' } as any] }).shortLabel).toBe('ET')
    expect(getMatchClockInfo({ status: 'live', events: [{ minute: 119, period: 'penalties' } as any] }).shortLabel).toBe('PEN')
  })

  it('advances the live clock as time passes', () => {
    const now = new Date('2026-08-18T20:42:00Z').getTime()
    const match = {
      status: 'live',
      events: [{
        minute: 23,
        period: 'first_half',
        created_at: '2026-08-18T20:39:00Z',
      } as any],
    }

    expect(getMatchClockInfo(match, now).display).toBe("26'")
    expect(formatMatchClock(match, now)).toBe('1T 26\'')
  })
})
