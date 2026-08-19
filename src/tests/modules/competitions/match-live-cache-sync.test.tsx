import { describe, expect, it, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useMatchLive } from '@/modules/competitions/hooks/useMatchLive'
import { useMatchDetail } from '@/modules/competitions/hooks/useMatchDetail'
import { MATCH_QUERY_KEYS } from '@/modules/competitions/hooks/useMatchCenter'
import { matchApi } from '@/modules/competitions/services/match.api'
import { competitionApi } from '@/modules/competitions/services/competition.api'

vi.mock('@/modules/competitions/services/match.api', () => ({
  matchApi: {
    get: vi.fn(),
    listEvents: vi.fn(),
  },
  mapMatchEventFromBackend: vi.fn((event) => event),
}))

vi.mock('@/modules/competitions/services/competition.api', () => ({
  competitionApi: {
    listMatches: vi.fn(),
  },
}))

vi.mock('@/modules/notifications/hooks', () => ({
  useNotificationStream: () => undefined,
}))

describe('useMatchLive cache sync', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('adds a newly fetched match to the competition list cache without dropping other matches', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    const existingMatch = {
      id: 'match-2',
      competitionId: 'comp-1',
      roundNumber: 2,
      round_number: 2,
      homeTeamName: 'Other Home',
      awayTeamName: 'Other Away',
      home_club_name: 'Other Home',
      away_club_name: 'Other Away',
      competition: 'comp-1',
      home_club: 'club-2',
      away_club: 'club-3',
      match_date: '2026-08-19T18:00:00Z',
      scheduledAt: '2026-08-19T18:00:00Z',
      status: 'scheduled',
      status_label: 'Agendado',
      home_score: 0,
      away_score: 0,
    }

    const freshMatch = {
      id: 'match-1',
      competitionId: 'comp-1',
      roundNumber: 1,
      round_number: 1,
      homeTeamName: 'Home FC',
      awayTeamName: 'Away FC',
      home_club_name: 'Home FC',
      away_club_name: 'Away FC',
      competition: 'comp-1',
      home_club: 'club-1',
      away_club: 'club-2',
      match_date: '2026-08-18T20:00:00Z',
      scheduledAt: '2026-08-18T20:00:00Z',
      status: 'live',
      status_label: 'Ao vivo',
      home_score: 2,
      away_score: 1,
    }

    queryClient.setQueryData(MATCH_QUERY_KEYS.byCompetition('comp-1'), [existingMatch])

    vi.mocked(matchApi.get).mockResolvedValue(freshMatch as any)
    vi.mocked(matchApi.listEvents).mockResolvedValue([])

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useMatchLive({ competitionId: 'comp-1', matchId: 'match-1', initialMatch: undefined }), { wrapper })

    await waitFor(() => {
      const cached = queryClient.getQueryData(MATCH_QUERY_KEYS.byCompetition('comp-1')) as any[]
      expect(cached).toHaveLength(2)
      expect(cached.some((m) => m.id === 'match-1')).toBe(true)
      expect(cached.some((m) => m.id === 'match-2')).toBe(true)
      expect(queryClient.getQueryData(MATCH_QUERY_KEYS.detail('comp-1', 'match-1'))).toMatchObject({ id: 'match-1' })
    })
  })

  it('prefers the backend current_minute over event-derived minute values for live state', async () => {
    const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } })

    vi.mocked(matchApi.get).mockResolvedValue({
      id: 'match-1',
      competitionId: 'comp-1',
      roundNumber: 1,
      round_number: 1,
      homeTeamName: 'Home FC',
      awayTeamName: 'Away FC',
      home_club_name: 'Home FC',
      away_club_name: 'Away FC',
      home_club: 'club-1',
      away_club: 'club-2',
      competition: 'comp-1',
      scheduledAt: '2026-08-18T20:00:00Z',
      match_date: '2026-08-18T20:00:00Z',
      status: 'live',
      status_label: 'Ao vivo',
      current_period: 'second_half',
      current_minute: 52,
      home_score: 1,
      away_score: 0,
    } as any)

    vi.mocked(matchApi.listEvents).mockResolvedValue([
      { id: 'event-1', minute: 23, period: 'first_half', teamId: 'club-1', type: 'goal', event_type: 'goal' },
    ] as any)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    const { result } = renderHook(() => useMatchLive({ competitionId: 'comp-1', matchId: 'match-1', initialMatch: undefined }), { wrapper })

    await waitFor(() => {
      expect(result.current.currentMinute).toBe(52)
      expect(result.current.match?.current_minute).toBe(52)
    })
  })

  it('scopes detail cache by competition to avoid cross-competition leakage', () => {
    expect(MATCH_QUERY_KEYS.detail('comp-1', 'match-1')).toEqual(['matches', 'detail', 'comp-1', 'match-1'])
  })

  it('uses the dedicated match-detail API instead of the hub list for detail queries', async () => {
    vi.mocked(matchApi.get).mockResolvedValue({
      id: 'match-1',
      competitionId: 'comp-1',
      roundNumber: 1,
      round_number: 1,
      homeTeamName: 'Home FC',
      awayTeamName: 'Away FC',
      home_club_name: 'Home FC',
      away_club_name: 'Away FC',
      home_club: 'club-1',
      away_club: 'club-2',
      competition: 'comp-1',
      scheduledAt: '2026-08-18T20:00:00Z',
      match_date: '2026-08-18T20:00:00Z',
      status: 'live',
      status_label: 'Ao vivo',
      home_score: 1,
      away_score: 0,
    } as any)

    vi.mocked(competitionApi.listMatches).mockResolvedValue([] as any)

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>{children}</QueryClientProvider>
    )

    renderHook(() => useMatchDetail('comp-1', 'match-1'), { wrapper })

    await waitFor(() => {
      expect(matchApi.get).toHaveBeenCalledWith('comp-1', 'match-1')
      expect(competitionApi.listMatches).not.toHaveBeenCalled()
    })
  })

  it('updates all competition caches for the same match, including filtered MatchCenter queries', async () => {
    const queryClient = new QueryClient({
      defaultOptions: {
        queries: { retry: false },
      },
    })

    const filteredKey = [...MATCH_QUERY_KEYS.byCompetition('comp-1'), '{"status":"live,halftime"}'] as const
    const baseKey = MATCH_QUERY_KEYS.byCompetition('comp-1')

    queryClient.setQueryData(baseKey, [
      { id: 'match-1', competitionId: 'comp-1', status: 'scheduled', home_score: 0, away_score: 0 },
    ])
    queryClient.setQueryData(filteredKey, [
      { id: 'match-1', competitionId: 'comp-1', status: 'scheduled', home_score: 0, away_score: 0 },
    ])

    const freshMatch = {
      id: 'match-1',
      competitionId: 'comp-1',
      homeTeamName: 'Home FC',
      awayTeamName: 'Away FC',
      home_club_name: 'Home FC',
      away_club_name: 'Away FC',
      competition: 'comp-1',
      home_club: 'club-1',
      away_club: 'club-2',
      match_date: '2026-08-18T20:00:00Z',
      scheduledAt: '2026-08-18T20:00:00Z',
      status: 'live',
      status_label: 'Ao vivo',
      home_score: 2,
      away_score: 1,
    }

    vi.mocked(matchApi.get).mockResolvedValue(freshMatch as any)
    vi.mocked(matchApi.listEvents).mockResolvedValue([])

    const wrapper = ({ children }: { children: React.ReactNode }) => (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )

    renderHook(() => useMatchLive({ competitionId: 'comp-1', matchId: 'match-1', initialMatch: undefined }), { wrapper })

    await waitFor(() => {
      const baseCache = queryClient.getQueryData(baseKey) as any[]
      const filteredCache = queryClient.getQueryData(filteredKey) as any[]

      expect(baseCache[0]).toMatchObject({ id: 'match-1', status: 'live', home_score: 2, away_score: 1 })
      expect(filteredCache[0]).toMatchObject({ id: 'match-1', status: 'live', home_score: 2, away_score: 1 })
    })
  })
})
