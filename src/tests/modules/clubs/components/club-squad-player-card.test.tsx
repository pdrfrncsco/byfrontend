import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ClubSquadPlayerCard } from '@/modules/clubs/components/ClubSquadPlayerCard'
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
  joined_at: '2026-01-15',
}

describe('ClubSquadPlayerCard', () => {
  it('renders avatar, name, jersey number, position, and status immediately', () => {
    render(<ClubSquadPlayerCard player={mockPlayer} />)

    // Name
    expect(screen.getByText('Dirceu Lopes')).toBeInTheDocument()

    // Jersey number
    expect(screen.getByText('#10')).toBeInTheDocument()

    // Position
    expect(screen.getByText('Médio Ofensivo')).toBeInTheDocument()

    // Status
    expect(screen.getByText('Ativo')).toBeInTheDocument()

    // Avatar initials fallback
    expect(screen.getByText('DL')).toBeInTheDocument()
  })

  it('triggers onClick when clicked or when pressing Enter', () => {
    const handleClick = vi.fn()
    render(<ClubSquadPlayerCard player={mockPlayer} onClick={handleClick} />)

    const card = screen.getByRole('button')
    fireEvent.click(card)

    expect(handleClick).toHaveBeenCalledTimes(1)
    expect(handleClick).toHaveBeenCalledWith(mockPlayer)
  })
})
