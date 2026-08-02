import React from 'react'
import { render, screen } from '@testing-library/react'
import TacticalField from '@/modules/competitions/components/tactical/TacticalField'

describe('TacticalField', () => {
  it('renders players', () => {
    const players = [
      { id: 'p1', number: 1, name: 'GK', x: 0.05, y: 0.5 },
      { id: 'p2', number: 10, name: 'ST', x: 0.75, y: 0.5 },
    ]

    render(<TacticalField players={players} />)

    // expect tokens to render (via role attribute)
    expect(screen.getByRole('img', { name: /vista táctica/i })).toBeInTheDocument()
    expect(screen.getByRole('player-p1')).toBeInTheDocument()
    expect(screen.getByRole('player-p2')).toBeInTheDocument()
  })
})
