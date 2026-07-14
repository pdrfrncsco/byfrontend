import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/providers/I18nProvider'
import { LoginPage } from '@/modules/shared/pages/LoginPage'

vi.mock('@/hooks/useSeo', () => ({
  useSeo: vi.fn(),
}))

vi.mock('@/app/layouts', () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/modules/auth/hooks', () => ({
  useLogin: () => ({ mutateAsync: vi.fn(), isPending: false }),
  useRegister: () => ({ mutateAsync: vi.fn(), isPending: false }),
  getPostAuthRedirectPath: vi.fn().mockResolvedValue('/dashboard'),
}))

function renderLoginAt(path: string) {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[path]}>
        <LoginPage />
      </MemoryRouter>
    </I18nextProvider>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the login title and email/password fields at /login', () => {
    renderLoginAt('/login')

    expect(screen.getByRole('heading', { level: 1, name: /Login/i })).toBeInTheDocument()
    expect(screen.getByText('Email')).toBeInTheDocument()
    expect(screen.getByText('Senha')).toBeInTheDocument()
    expect(screen.getByPlaceholderText('seu@email.com')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Entrar' })).toBeInTheDocument()
  })

  it('shows the register title and name fields at /register', () => {
    renderLoginAt('/register')

    expect(screen.getByRole('heading', { level: 1, name: /Criar Conta/i })).toBeInTheDocument()
    expect(screen.getByText('Nome')).toBeInTheDocument()
    expect(screen.getByText('Apelido')).toBeInTheDocument()
    expect(screen.getByText('Confirmar Senha')).toBeInTheDocument()
  })

  it('shows the toggle link to register when in login mode', () => {
    renderLoginAt('/login')

    expect(screen.getByRole('button', { name: 'Registar-se' })).toBeInTheDocument()
  })

  it('shows the forgot password link only in login mode', () => {
    renderLoginAt('/login')
    expect(screen.getByRole('button', { name: /Esqueceu/i })).toBeInTheDocument()
  })

  it('hides the forgot password link in register mode', () => {
    renderLoginAt('/register')
    expect(screen.queryByRole('button', { name: /Esqueceu/i })).not.toBeInTheDocument()
  })

  it('shows validation errors when submitting empty login form', async () => {
    renderLoginAt('/login')

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findAllByText(/obrigat/i)).toHaveLength(2)
  })
})
