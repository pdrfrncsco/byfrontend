import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/providers/I18nProvider'
import { RegisterPage } from '@/modules/shared/pages/RegisterPage'
import { RegisterProfilePage } from '@/modules/shared/pages/RegisterProfilePage'

const authMocks = vi.hoisted(() => ({
  mutateAsync: vi.fn().mockResolvedValue({
    access: 'token',
    refresh: 'refresh',
    user: {},
  }),
}))

vi.mock('@/hooks/useSeo', () => ({
  useSeo: vi.fn(),
}))

vi.mock('@/app/layouts', () => ({
  AuthLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}))

vi.mock('@/modules/auth/hooks', () => ({
  useRegister: () => ({ mutateAsync: authMocks.mutateAsync, isPending: false }),
}))

function renderWithRouter(ui: React.ReactElement, path = '/') {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter initialEntries={[path]}>{ui}</MemoryRouter>
    </I18nextProvider>,
  )
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('shows the profile selector cards', () => {
    renderWithRouter(<RegisterPage />, '/register')

    expect(screen.getByRole('heading', { name: /Criar conta/i })).toBeInTheDocument()
    expect(screen.getByText('Jogador')).toBeInTheDocument()
    expect(screen.getByText('Clube')).toBeInTheDocument()
    expect(screen.getByText('Fan')).toBeInTheDocument()
    expect(screen.getByText('Organização')).toBeInTheDocument()
    expect(screen.getByText('Scouting')).toBeInTheDocument()
  })
})

describe('RegisterProfilePage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('sends the selected profile type on submit', async () => {
    renderWithRouter(
      <RegisterProfilePage
        profileType="player"
        title="Registo de Jogador"
        description="Crie a sua conta individual."
        submitLabel="Criar conta de Jogador"
        path="/register/player"
      />,
      '/register/player',
    )

    fireEvent.change(screen.getByLabelText('Nome'), { target: { value: 'João' } })
    fireEvent.change(screen.getByLabelText('Apelido'), { target: { value: 'Silva' } })
    fireEvent.change(screen.getByLabelText('Email'), { target: { value: 'joao@example.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: 'Senha@123' } })
    fireEvent.change(screen.getByLabelText('Confirmar Senha'), { target: { value: 'Senha@123' } })

    fireEvent.click(screen.getByRole('button', { name: /Criar conta de Jogador/i }))

    await waitFor(() => {
      expect(authMocks.mutateAsync).toHaveBeenCalledWith(
        expect.objectContaining({
          email: 'joao@example.com',
          first_name: 'João',
          last_name: 'Silva',
          password: 'Senha@123',
          password_confirm: 'Senha@123',
          profile_type: 'player',
        }),
      )
    })
  })
})
