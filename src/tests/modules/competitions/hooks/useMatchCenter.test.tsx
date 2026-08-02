import React from 'react'
import { renderHook, act } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { vi, describe, it, expect, beforeEach } from 'vitest'

import { competitionApi } from '@/modules/competitions/services/competition.api'
import { useAddMatchEvent } from '@/modules/competitions/hooks/useMatchCenter'

// Helper to wrap hooks with QueryClient
function wrapper({ children }: { children?: React.ReactNode }) {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return <QueryClientProvider client={qc}>{children}</QueryClientProvider>
}

describe('useAddMatchEvent', () => {
  const competitionId = 'comp-1'
  const matchId = 'match-1'

  beforeEach(() => {
    vi.restoreAllMocks()
    // By default, prevent real network calls for competitionApi.get unless a test overrides it
    vi.spyOn(competitionApi, 'get').mockRejectedValue(new Error('not found'))
  })

  it('calls createSuspension with default matches_suspended for red_card', async () => {
    const createdEvent = {
      id: 'e1',
      event_type: 'red_card',
      player: 'player-1',
      club: 'club-1',
      minute: 42,
    }

    // Mock addMatchEvent to resolve with createdEvent
    vi.spyOn(competitionApi, 'addMatchEvent').mockResolvedValue(createdEvent as any)

    // Mock createSuspension to resolve
    const createSuspensionSpy = vi.spyOn(competitionApi, 'createSuspension').mockResolvedValue({} as any)

    const { result } = renderHook(() => useAddMatchEvent(competitionId, matchId), { wrapper })

    // Trigger the mutation
    await act(async () => {
      await result.current.mutateAsync({ type: 'red_card', player: 'player-1' } as any)
    })

    expect(createSuspensionSpy).toHaveBeenCalledTimes(1)
    const payload = createSuspensionSpy.mock.calls[0][1]
    expect(payload.player).toBe(createdEvent.player)
    expect(payload.suspension_type).toBe('red_card')
    expect(payload.matches_suspended).toBe(1)
  })

  it('uses competition-level override for matches_suspended when provided', async () => {
    const createdEvent = {
      id: 'e2',
      event_type: 'red_card',
      player: 'player-2',
      club: 'club-2',
      minute: 10,
    }

    // Mock addMatchEvent to resolve with createdEvent
    vi.spyOn(competitionApi, 'addMatchEvent').mockResolvedValue(createdEvent as any)

    // Mock competitionApi.get to return suspension rules override for red_card
    vi.spyOn(competitionApi, 'get').mockResolvedValue({ id: competitionId, suspension_rules: { red_card: 2 } } as any)

    const createSuspensionSpy = vi.spyOn(competitionApi, 'createSuspension').mockResolvedValue({} as any)

    const { result } = renderHook(() => useAddMatchEvent(competitionId, matchId), { wrapper })

    await act(async () => {
      await result.current.mutateAsync({ type: 'red_card', player: 'player-2' } as any)
    })

    expect(createSuspensionSpy).toHaveBeenCalledTimes(1)
    const payload = createSuspensionSpy.mock.calls[0][1]
    expect(payload.player).toBe(createdEvent.player)
    expect(payload.suspension_type).toBe('red_card')
    expect(payload.matches_suspended).toBe(2)
  })
})
