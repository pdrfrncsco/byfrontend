import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import * as React from 'react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { PlayerOnboardingProfilePage } from '@/modules/players/pages/PlayerOnboardingProfilePage'
import { PlayerOnboardingFootballPage } from '@/modules/players/pages/PlayerOnboardingFootballPage'
import { PlayerOnboardingReviewPage } from '@/modules/players/pages/PlayerOnboardingReviewPage'

vi.mock('@/modules/players/hooks', () => ({
  usePlayerMe: vi.fn(),
  usePlayerMutations: vi.fn(),
  usePlayerOnboardingStatus: vi.fn(),
  useUpdatePlayerMe: vi.fn(),
}))

import { usePlayerMutations, usePlayerOnboardingStatus, useUpdatePlayerMe } from '@/modules/players/hooks'

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

describe('Player Onboarding Pages (T14)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('PlayerOnboardingProfilePage', () => {
    it('renders form and handles submission', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({})

      vi.mocked(usePlayerOnboardingStatus).mockReturnValue({
        data: {
          has_basic_info: true,
          has_football_info: false,
          has_player_profile: true,
          player: {
            first_name: 'Mateus',
            last_name: 'Galiano',
            date_of_birth: '1990-01-01',
            nationality: 'Angolana',
            phone: '923000111',
          },
        },
        isLoading: false,
      } as any)

      vi.mocked(useUpdatePlayerMe).mockReturnValue({
        mutateAsync: mockUpdate,
        isPending: false,
      } as any)

      renderWithProviders(React.createElement(PlayerOnboardingProfilePage))

      expect(screen.getByText('Dados pessoais')).toBeInTheDocument()
      await waitFor(() => {
        expect(screen.getByDisplayValue('Mateus')).toBeInTheDocument()
      })

      const submitButton = screen.getByRole('button', { name: /continuar/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalledWith(
          expect.objectContaining({
            first_name: 'Mateus',
            last_name: 'Galiano',
          })
        )
      })
    })
  })

  describe('PlayerOnboardingFootballPage', () => {
    it('renders position and physical inputs', async () => {
      const mockUpdate = vi.fn().mockResolvedValue({})

      vi.mocked(usePlayerOnboardingStatus).mockReturnValue({
        data: {
          has_basic_info: true,
          has_football_info: true,
          player: {
            primary_position: 'st',
            foot: 'right',
            height_cm: 180,
            weight_kg: 75,
            bio: 'Avançado centro',
          },
        },
        isLoading: false,
      } as any)

      vi.mocked(useUpdatePlayerMe).mockReturnValue({
        mutateAsync: mockUpdate,
        isPending: false,
      } as any)

      renderWithProviders(React.createElement(PlayerOnboardingFootballPage))

      expect(screen.getByText('Perfil futebolístico')).toBeInTheDocument()

      const submitButton = screen.getByRole('button', { name: /rever perfil/i })
      fireEvent.click(submitButton)

      await waitFor(() => {
        expect(mockUpdate).toHaveBeenCalled()
      })
    })
  })

  describe('PlayerOnboardingReviewPage', () => {
    it('shows completed badges when onboarding steps are done', () => {
      vi.mocked(usePlayerOnboardingStatus).mockReturnValue({
        data: {
          onboarding_required: false,
          has_basic_info: true,
          has_football_info: true,
          player: {
            full_name: 'Mateus Galiano',
            position_label: 'Avançado',
            nationality: 'Angolana',
            is_public: true,
          },
        },
        isLoading: false,
      } as any)

      renderWithProviders(React.createElement(PlayerOnboardingReviewPage))

      expect(screen.getByText('Revisão final')).toBeInTheDocument()
      expect(screen.getByText('Mateus Galiano')).toBeInTheDocument()
      expect(screen.getByText('Perfil pronto')).toBeInTheDocument()
      expect(screen.getByText('Concluir onboarding')).toBeInTheDocument()
    })
  })
})
