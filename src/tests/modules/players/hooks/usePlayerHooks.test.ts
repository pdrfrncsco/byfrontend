import { beforeEach, describe, expect, it, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useCurrentPlayer } from '@/modules/players/hooks/useCurrentPlayer'
import { usePlayerOnboardingState } from '@/modules/players/hooks/usePlayerOnboardingState'
import { usePlayerOutgoingRequests, useClubIncomingRequests } from '@/modules/players/hooks/usePlayerRegistrationRequests'

vi.mock('@/modules/players/services', () => ({
  getPlayerMe: vi.fn(),
  getPlayerOnboardingStatus: vi.fn(),
  getPlayerRegistrationRequests: vi.fn(),
  listMyRegistrationRequests: vi.fn(),
  listClubPlayerRegistrationRequests: vi.fn(),
}))

vi.mock('@/app/providers', () => ({
  useAuth: vi.fn().mockReturnValue({
    user: { id: 'user-1', roles: ['player'], profileType: 'player' },
    isAuthenticated: true,
  }),
}))

import * as service from '@/modules/players/services'

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(QueryClientProvider, { client: queryClient }, children)
  }
}

describe('Player additional hooks (T16)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('useCurrentPlayer', () => {
    it('fetches current authenticated player', async () => {
      const mockPlayer = { id: 'p-1', full_name: 'Cristiano Ronaldo' }
      vi.mocked(service.getPlayerMe).mockResolvedValueOnce(mockPlayer as any)

      const { result } = renderHook(() => useCurrentPlayer(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockPlayer)
      expect(service.getPlayerMe).toHaveBeenCalledTimes(1)
    })
  })

  describe('usePlayerOnboardingState', () => {
    it('derives step state for incomplete onboarding', async () => {
      vi.mocked(service.getPlayerOnboardingStatus).mockResolvedValueOnce({
        onboarding_required: true,
        next_step: 'football',
        has_basic_info: true,
        has_football_info: false,
      } as any)

      const { result } = renderHook(() => usePlayerOnboardingState(true), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.onboardingState).toEqual({
        step: 'football',
        isComplete: false,
        nextStep: 'football',
      })
    })

    it('derives complete state when onboarding_required is false', async () => {
      vi.mocked(service.getPlayerOnboardingStatus).mockResolvedValueOnce({
        onboarding_required: false,
        next_step: null,
        has_basic_info: true,
        has_football_info: true,
      } as any)

      const { result } = renderHook(() => usePlayerOnboardingState(true), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.onboardingState).toEqual({
        step: 'complete',
        isComplete: true,
        nextStep: null,
      })
    })
  })

  describe('usePlayerOutgoingRequests & useClubIncomingRequests', () => {
    it('fetches outgoing player requests', async () => {
      const mockRequests = [{ id: 'req-1', club: { name: 'Petro Luanda' } }]
      vi.mocked(service.listMyRegistrationRequests).mockResolvedValueOnce(mockRequests as any)

      const { result } = renderHook(() => usePlayerOutgoingRequests(), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockRequests)
    })

    it('fetches incoming club requests when enabled', async () => {
      const mockRequests = [{ id: 'req-2', player: { name: 'Manucho' } }]
      vi.mocked(service.listClubPlayerRegistrationRequests).mockResolvedValueOnce(mockRequests as any)

      const { result } = renderHook(() => useClubIncomingRequests('club-123'), {
        wrapper: createWrapper(),
      })

      await waitFor(() => expect(result.current.isSuccess).toBe(true))
      expect(result.current.data).toEqual(mockRequests)
      expect(service.listClubPlayerRegistrationRequests).toHaveBeenCalled()
    })
  })
})
