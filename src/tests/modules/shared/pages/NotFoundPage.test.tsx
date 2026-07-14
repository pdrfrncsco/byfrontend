import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/providers/I18nProvider'
import { NotFoundPage } from '@/modules/shared/pages/NotFoundPage'

vi.mock('@/hooks/useSeo', () => ({
  useSeo: vi.fn(),
}))

function renderNotFound() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>
    </I18nextProvider>,
  )
}

describe('NotFoundPage', () => {
  it('renders the 404 heading and message', () => {
    renderNotFound()

    expect(screen.getByRole('heading', { level: 1, name: '404' })).toBeInTheDocument()
    expect(screen.getByText(/Página não encontrada/i)).toBeInTheDocument()
  })

  it('renders a link back to home', () => {
    renderNotFound()

    const homeLink = screen.getByRole('link', { name: /Voltar para Home/i })
    expect(homeLink).toHaveAttribute('href', '/')
  })

  it('uses a main landmark', () => {
    renderNotFound()

    expect(screen.getByRole('main')).toBeInTheDocument()
  })
})
