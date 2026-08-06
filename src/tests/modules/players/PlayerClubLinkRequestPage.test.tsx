import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PlayerClubLinkRequestPage } from '@/modules/players/pages/PlayerClubLinkRequestPage'

vi.mock('@/modules/players/hooks', () => ({
  usePlayerMe: vi.fn(),
  usePlayerMutations: vi.fn(),
  usePlayerOutgoingRequests: vi.fn(),
  useMyRegistrationRequests: vi.fn(),
  useSubmitRegistrationRequest: vi.fn(),
}))

vi.mock('@/modules/clubs/hooks', () => ({
  useClubs: vi.fn().mockReturnValue({
    data: { items: [{ id: 'club-1', name: 'Petro de Luanda' }] },
    isLoading: false,
  }),
}))

import { usePlayerMe, usePlayerMutations, usePlayerOutgoingRequests, useMyRegistrationRequests, useSubmitRegistrationRequest } from '@/modules/players/hooks'

const renderWithProviders = (ui: React.ReactElement) => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })
  return render(
    React.createElement(
      QueryClientProvider,
      { client: queryClient },
      React.createElement(BrowserRouter, null, ui)
    )
  )
}

describe('PlayerClubLinkRequestPage (T15)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renders request link page and displays outgoing requests', () => {
    vi.mocked(usePlayerMe).mockReturnValue({
      data: { id: 'player-1', full_name: 'Akwá' },
      isLoading: false,
    } as any)

    vi.mocked(useMyRegistrationRequests).mockReturnValue({
      data: [
        {
          id: 'req-1',
          club_name: 'Petro de Luanda',
          status: 'pending',
          created_at: '2026-08-01',
        },
      ],
      isLoading: false,
    } as any)

    vi.mocked(useSubmitRegistrationRequest).mockReturnValue({
      mutateAsync: vi.fn(),
      isPending: false,
    } as any)

    renderWithProviders(React.createElement(PlayerClubLinkRequestPage))

    expect(screen.getByText(/Petro de Luanda/i)).toBeInTheDocument()
  })
})
