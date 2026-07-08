import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { ClubKpisCard } from '@/modules/clubs/components/ClubKpisCard'
import { mockClubKpis } from '@/tests/__mocks__/club.mock'

describe('ClubKpisCard', () => {
  it('renders club KPI metrics', () => {
    render(<ClubKpisCard kpis={mockClubKpis} />)

    expect(screen.getByText('KPIs do clube')).toBeInTheDocument()
    expect(screen.getByText('22')).toBeInTheDocument()
    expect(screen.getByText('41')).toBeInTheDocument()
  })
})
