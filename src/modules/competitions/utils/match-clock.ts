import type { Match, MatchEvent, MatchStatus } from '../types'

export type MatchClockPeriod = 'first_half' | 'second_half' | 'extra_time' | 'extra_first_half' | 'extra_halftime' | 'extra_second_half' | 'penalties' | 'halftime' | 'finished'

export interface MatchClockInfo {
  period: MatchClockPeriod
  minute: number
  minuteExtra: number
  display: string
  shortLabel: string
  fullLabel: string
}

const PERIOD_ORDER: Record<MatchClockPeriod, number> = {
  first_half: 1,
  second_half: 2,
  extra_time: 3,
  extra_first_half: 3,
  extra_halftime: 3,
  extra_second_half: 3,
  penalties: 4,
  halftime: 2,
  finished: 5,
}

function normalizePeriod(value?: string): MatchClockPeriod {
  switch (value) {
    case 'first_half':
      return 'first_half'
    case 'second_half':
      return 'second_half'
    case 'extra_time':
      return 'extra_time'
    case 'extra_first_half':
      return 'extra_first_half'
    case 'extra_halftime':
      return 'extra_halftime'
    case 'extra_second_half':
      return 'extra_second_half'
    case 'penalties':
      return 'penalties'
    case 'halftime':
      return 'halftime'
    case 'fulltime':
      return 'finished'
    default:
      return 'first_half'
  }
}

function formatMinuteValue(minute: number, minuteExtra: number): string {
  if (minuteExtra > 0 && [45, 90, 105, 120].includes(minute)) {
    return `${minute}+${minuteExtra}'`
  }

  if (minute <= 0) return '0\''
  return `${minute}'`
}

function formatPeriodLabel(period: MatchClockPeriod): string {
  switch (period) {
    case 'first_half':
      return '1T'
    case 'second_half':
      return '2T'
    case 'extra_time':
      return 'ET'
    case 'extra_first_half':
      return 'ET1'
    case 'extra_halftime':
      return 'ET INT'
    case 'extra_second_half':
      return 'ET2'
    case 'penalties':
      return 'PEN'
    case 'halftime':
      return 'INT'
    case 'finished':
      return 'FT'
    default:
      return '1T'
  }
}

function getClockMinuteForPeriod(period: MatchClockPeriod, minute: number): number {
  if (period === 'first_half') return Math.max(0, Math.min(minute, 45))
  if (period === 'second_half') return Math.max(45, Math.min(minute, 90))
  if (period === 'extra_time') return Math.max(90, Math.min(minute, 120))
  if (period === 'extra_first_half') return Math.max(90, Math.min(minute, 105))
  if (period === 'extra_second_half') return Math.max(105, Math.min(minute, 120))
  if (period === 'extra_halftime') return 105
  if (period === 'penalties') return Math.max(120, Math.min(minute, 130))
  if (period === 'halftime') return 45
  if (period === 'finished') return 90
  return Math.max(0, Math.min(minute, 90))
}

export function getMatchClockInfo(match?: Partial<Match> | null, now = Date.now()): MatchClockInfo {
  const status = match?.status ?? 'scheduled'
  const events: MatchEvent[] = Array.isArray(match?.events) ? [...match.events] : []

  const explicitPeriod = normalizePeriod((match as any)?.current_period ?? (match as any)?.period ?? undefined)
  const explicitMinute = typeof (match as any)?.current_minute === 'number' ? (match as any).current_minute : undefined

  if (status === 'halftime') {
    if (explicitPeriod === 'extra_halftime') {
      return { period: 'extra_halftime', minute: 105, minuteExtra: 0, display: 'Intervalo prolongamento', shortLabel: 'ET INT', fullLabel: 'Intervalo prolongamento' }
    }
    return {
      period: 'halftime',
      minute: 45,
      minuteExtra: 0,
      display: 'Intervalo',
      shortLabel: 'INT',
      fullLabel: 'Intervalo',
    }
  }

  if (status === 'finished' || status === 'cancelled' || status === 'walkover' || status === 'postponed') {
    return {
      period: 'finished',
      minute: 90,
      minuteExtra: 0,
      display: 'FT',
      shortLabel: 'FT',
      fullLabel: 'Fim de partida',
    }
  }

  let latestEvent: MatchEvent | undefined

  if (events.length > 0) {
    latestEvent = [...events].sort((a, b) => {
      const aPeriod = normalizePeriod(a.period)
      const bPeriod = normalizePeriod(b.period)

      return (
        PERIOD_ORDER[bPeriod] - PERIOD_ORDER[aPeriod] ||
        b.minute - a.minute ||
        (b.minuteExtra ?? 0) - (a.minuteExtra ?? 0)
      )
    })[0]
  }

  const period = explicitPeriod === 'first_half' && latestEvent
    ? normalizePeriod(latestEvent.period)
    : explicitPeriod

  const currentMinuteValue = explicitMinute ?? (latestEvent ? getClockMinuteForPeriod(period, latestEvent.minute) : 0)

  let minute = typeof explicitMinute === 'number' ? explicitMinute : currentMinuteValue
  let minuteExtra = latestEvent?.minuteExtra ?? 0

  const clockRunning = Boolean((match as any)?.clock_running)
  const clockStartedAt = (match as any)?.clock_started_at
  const elapsedSeconds = Number((match as any)?.clock_elapsed_seconds ?? 0)
  if (status === 'live' && clockRunning && clockStartedAt) {
    const elapsedMinutes = Math.max(0, Math.floor((now - new Date(clockStartedAt).getTime()) / 60_000) + Math.floor(elapsedSeconds / 60))
    const periodBase = period === 'second_half' ? 45 : period === 'extra_time' || period === 'extra_first_half' ? 90 : period === 'extra_second_half' ? 105 : 0
    minute = periodBase + elapsedMinutes
    const regulationEnd = period === 'first_half' ? 45 : period === 'second_half' ? 90 : period === 'extra_time' || period === 'extra_second_half' ? 120 : period === 'extra_first_half' ? 105 : minute
    if (minute > regulationEnd) {
      minuteExtra = minute - regulationEnd
      minute = regulationEnd
    }
  }

  if (status === 'live' && latestEvent && explicitMinute === undefined) {
    const eventTime = latestEvent.created_at || latestEvent.createdAt
    if (eventTime) {
      const elapsedMinutes = Math.max(0, Math.floor((now - new Date(eventTime).getTime()) / 60_000))
      minute = getClockMinuteForPeriod(period, latestEvent.minute + elapsedMinutes)
      if (period === 'first_half' && minute > 45) minute = 45
      if (period === 'second_half' && minute > 90) minute = 90
      if (period === 'extra_time' && minute > 120) minute = 120
    }
  }

  const shortLabel = formatPeriodLabel(period)
  const display = formatMinuteValue(minute, minuteExtra)

  return {
    period,
    minute,
    minuteExtra,
    display,
    shortLabel,
    fullLabel: `${shortLabel} ${display}`,
  }
}

export function formatMatchClock(match?: Partial<Match> | null, now = Date.now()): string {
  const info = getMatchClockInfo(match, now)

  if (match?.status === 'halftime') return 'Intervalo'
  if (match?.status === 'finished' || match?.status === 'cancelled' || match?.status === 'walkover' || match?.status === 'postponed') {
    return 'FT'
  }

  return info.fullLabel
}

export function isClockVisible(status: MatchStatus | undefined) {
  return status === 'live' || status === 'halftime' || status === 'finished'
}
