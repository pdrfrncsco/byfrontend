import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { ClubCard } from '@/modules/clubs/components/ClubCard'
import { mockClub } from '@/tests/__mocks__/club.mock'

describe('ClubCard', () => {
  it('renders club summary and link', () => {
    render(
      <BrowserRouter>
        <ClubCard club={mockClub} />
      </BrowserRouter>,
    )

    expect(screen.getByText(mockClub.name)).toBeInTheDocument()
    expect(screen.getByText('Ativo')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver perfil/i })).toHaveAttribute('href', `/clubs/${mockClub.slug}`)
  })
})
