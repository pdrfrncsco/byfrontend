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

  it('supports extra time, penalties and fulltime periods', () => {
    expect(getMatchClockInfo({ status: 'live', events: [{ minute: 96, period: 'extra_time' } as any] }).shortLabel).toBe('ET')
    expect(getMatchClockInfo({ status: 'live', events: [{ minute: 119, period: 'penalties' } as any] }).shortLabel).toBe('PEN')
    expect(getMatchClockInfo({ status: 'finished', current_period: 'fulltime', current_minute: 90 }).shortLabel).toBe('FT')
    expect(getMatchClockInfo({ status: 'live', current_period: 'halftime', current_minute: 45 }).shortLabel).toBe('INT')
  })

  it('prefers explicit backend phase and minute when present', () => {
    const match: any = {
      status: 'live',
      current_period: 'second_half',
      current_minute: 52,
      events: [{ minute: 23, period: 'first_half' } as any],
    }

    expect(getMatchClockInfo(match).display).toBe("52'")
    expect(formatMatchClock(match)).toBe('2T 52\'')
  })

  it('advances the live clock as time passes', () => {
    const now = new Date('2026-08-18T20:42:00Z').getTime()
    const match: any = {
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
