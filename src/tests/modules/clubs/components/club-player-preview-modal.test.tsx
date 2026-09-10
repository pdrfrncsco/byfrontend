import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ClubPlayerPreviewModal } from '@/modules/clubs/components/ClubPlayerPreviewModal'
import type { ClubSquadMember } from '@/modules/clubs/types'

const mockPlayer: ClubSquadMember = {
  id: 'player-1',
  player_id: 'p-uuid-1',
  player_slug: 'dirceu-lopes',
  display_name: 'Dirceu Lopes',
  jersey_number: 10,
  position: 'cam',
  position_label: 'Médio Ofensivo',
  status: 'registered',
  status_label: 'Ativo',
  nationality: 'Angola',
  date_of_birth: '1998-05-12',
  height_cm: 182,
  weight_kg: 76,
  foot: 'right',
  matches_played: 22,
  goals: 8,
  assists: 11,
  yellow_cards: 2,
  red_cards: 0,
  joined_at: '2026-01-15',
}

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>{ui}</BrowserRouter>
    </QueryClientProvider>
  )
}

describe('ClubPlayerPreviewModal', () => {
  it('does not render when isOpen is false', () => {
    const handleClose = vi.fn()
    renderWithProviders(
      <ClubPlayerPreviewModal
        player={mockPlayer}
        isOpen={false}
        clubName="Petro de Luanda"
        onClose={handleClose}
      />
    )

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders complete preview information when isOpen is true', () => {
    const handleClose = vi.fn()
    renderWithProviders(
      <ClubPlayerPreviewModal
        player={mockPlayer}
        isOpen={true}
        clubName="Petro de Luanda"
        onClose={handleClose}
      />
    )

    expect(screen.getByRole('dialog')).toBeInTheDocument()
    expect(screen.getByText('Dirceu Lopes')).toBeInTheDocument()
    expect(screen.getByText('Petro de Luanda')).toBeInTheDocument()
    expect(screen.getByText('Médio Ofensivo')).toBeInTheDocument()
    expect(screen.getByText('Angola')).toBeInTheDocument()
    expect(screen.getByText('Destro')).toBeInTheDocument()
    expect(screen.getByText('182 cm / 76 kg')).toBeInTheDocument()

    // Stats
    expect(screen.getByText('22')).toBeInTheDocument() // Matches
    expect(screen.getByText('8')).toBeInTheDocument()  // Goals
    expect(screen.getByText('11')).toBeInTheDocument() // Assists

    // External link button
    expect(screen.getByText('Ver Perfil Completo')).toBeInTheDocument()
  })

  it('calls onClose when close button is clicked', () => {
    const handleClose = vi.fn()
    renderWithProviders(
      <ClubPlayerPreviewModal
        player={mockPlayer}
        isOpen={true}
        clubName="Petro de Luanda"
        onClose={handleClose}
      />
    )

    const closeBtn = screen.getByLabelText('Fechar prévia')
    fireEvent.click(closeBtn)

    expect(handleClose).toHaveBeenCalledTimes(1)
  })
})
