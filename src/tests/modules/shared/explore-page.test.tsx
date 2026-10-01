import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ExplorePage } from '@/modules/shared/pages/ExplorePage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
})

function renderPage() {
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        <ExplorePage />
      </MemoryRouter>
    </QueryClientProvider>,
  )
}

describe('ExplorePage', () => {
  it('renders the main exploration destinations and editorial journeys', () => {
    renderPage()

    expect(screen.getByRole('heading', { name: 'Explorar o Futebol em Angola' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: /Competições/ }).some(link => link.getAttribute('href') === '/competitions')).toBe(true)
    expect(screen.getByRole('link', { name: /Criar Conta/ })).toHaveAttribute('href', '/register')
  })

  it('filters destinations and provides search input', () => {
    renderPage()

    const searchInput = screen.getByPlaceholderText('Pesquisar competições, clubes, organizações ou jogadores...')
    expect(searchInput).toBeInTheDocument()

    fireEvent.change(searchInput, { target: { value: 'Petro' } })
    expect(searchInput).toHaveValue('Petro')
  })
})
