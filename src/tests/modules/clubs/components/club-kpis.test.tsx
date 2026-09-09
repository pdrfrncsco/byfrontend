import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { ClubKpisCard } from '@/modules/clubs/components/ClubKpisCard'
import type { ClubKpis } from '@/modules/clubs/types'

const mockKpis: ClubKpis = {
  squad_size: 28,
  staff_count: 12,
  total_matches: 30,
  wins: 18,
  draws: 7,
  losses: 5,
  goals_for: 52,
  goals_against: 22,
  clean_sheets: 14,
  active_competitions: 2,
}

describe('ClubKpisCard', () => {
  it('renders all club key performance indicators correctly', () => {
    render(<ClubKpisCard kpis={mockKpis} />)

    expect(screen.getByText('KPIs do clube')).toBeInTheDocument()
    expect(screen.getByText('Plantel')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
    expect(screen.getByText('Staff')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('Vitórias')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByText('Golos marcados')).toBeInTheDocument()
    expect(screen.getByText('52')).toBeInTheDocument()
  })
})
