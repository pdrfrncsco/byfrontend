import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { ExplorePage } from '@/modules/shared/pages/ExplorePage'

function renderPage() {
  return render(
    <MemoryRouter>
      <ExplorePage />
    </MemoryRouter>,
  )
}

describe('ExplorePage', () => {
  it('renders the main exploration destinations and editorial journeys', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Explore o futebol em Angola e África' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Competições/ }).some(link => link.getAttribute('href') === '/competitions')).toBe(true)
    expect(screen.getByRole('link', { name: /Acompanhar uma competição/ })).toHaveAttribute('href', '/competitions')
    expect(screen.getByRole('link', { name: /Criar conta/ })).toHaveAttribute('href', '/register')
  })

  it('filters destinations and exposes an empty state', () => {
    renderPage()

    fireEvent.change(screen.getByRole('searchbox'), { target: { value: 'inexistente' } })

    expect(screen.getByText('Nenhuma área corresponde à sua pesquisa.')).toBeInTheDocument()
    expect(screen.getByText('áreas disponíveis').parentElement).toHaveTextContent('0 áreas disponíveis')
  })
})
