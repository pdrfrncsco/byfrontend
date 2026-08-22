import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { Navigation } from '@/modules/shared/components/Navigation'

const authState = {
  isAuthenticated: false,
  user: null as { username: string; email: string } | null,
  logout: vi.fn(),
}

vi.mock('@/app/providers', () => ({
  useAuth: () => authState,
}))

function renderNavigation(initialEntries = ['/']) {
  return render(
    <MemoryRouter initialEntries={initialEntries}>
      <Navigation variant="explore" />
    </MemoryRouter>,
  )
}

describe('Public Navigation', () => {
  beforeEach(() => {
    authState.isAuthenticated = false
    authState.user = null
    authState.logout.mockClear()
  })

  it('exposes the public exploration routes to guests', () => {
    renderNavigation()

    fireEvent.click(screen.getByText('Explorar'))

    expect(screen.getByRole('link', { name: 'Competições' })).toHaveAttribute('href', '/competitions')
    expect(screen.getByRole('link', { name: 'Clubes' })).toHaveAttribute('href', '/clubs')
    expect(screen.getByRole('link', { name: 'Organizações' })).toHaveAttribute('href', '/organizations')
    expect(screen.getByRole('link', { name: 'Jogadores' })).toHaveAttribute('href', '/players')
    expect(screen.getByRole('link', { name: 'Entrar' })).toHaveAttribute('href', '/login')
    expect(screen.getByRole('link', { name: 'Registar' })).toHaveAttribute('href', '/register')
  })

  it('shows the authenticated dashboard and profile actions', () => {
    authState.isAuthenticated = true
    authState.user = { username: 'Pedro', email: 'pedro@example.com' }
    renderNavigation(['/players'])

    expect(screen.getByRole('link', { name: 'Dashboard' })).toHaveAttribute('href', '/dashboard')
    expect(screen.getByText('PE')).toBeInTheDocument()
    expect(screen.getByText('Explorar').className).toContain('text-primary')
  })

  it('opens the complete mobile menu', () => {
    renderNavigation()

    fireEvent.click(screen.getByRole('button', { name: 'Abrir menu' }))

    expect(screen.getByRole('button', { name: 'Fechar menu' })).toBeInTheDocument()
    expect(screen.getAllByRole('link', { name: 'Competições' }).length).toBeGreaterThan(0)
  })

  it('renders the minimal variant without public navigation groups', () => {
    render(
      <MemoryRouter>
        <Navigation variant="minimal" />
      </MemoryRouter>,
    )

    expect(screen.getByRole('link', { name: 'Voltar' })).toHaveAttribute('href', '/')
    expect(screen.queryByText('Explorar')).not.toBeInTheDocument()
  })
})
