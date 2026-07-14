import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/providers/I18nProvider'
import { LandingPage } from '@/modules/shared/pages/LandingPage'

vi.mock('@/hooks/useSeo', () => ({
  useSeo: vi.fn(),
}))

function renderLanding() {
  return render(
    <I18nextProvider i18n={i18n}>
      <MemoryRouter>
        <LandingPage />
      </MemoryRouter>
    </I18nextProvider>,
  )
}

describe('LandingPage', () => {
  it('renders the hero heading and skip-to-content link', () => {
    renderLanding()

    expect(screen.getByRole('heading', { level: 1, name: /Futebol Africano/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /Saltar para o conteúdo/i })).toHaveAttribute('href', '#hero')
  })

  it('renders all landing section headings', async () => {
    renderLanding()

    const headings = await screen.findAllByRole('heading', { level: 2 })
    const headingTexts = headings.map(h => h.textContent ?? '')

    expect(headingTexts.some(t => /Funcionalidades de Elite/i.test(t))).toBe(true)
    expect(headingTexts.some(t => /Como Funciona/i.test(t))).toBe(true)
    expect(headingTexts.some(t => /Ecossistema BolaYetu/i.test(t))).toBe(true)
    expect(headingTexts.some(t => /Planos de Subscrição/i.test(t))).toBe(true)
    expect(headingTexts.some(t => /Vozes do Campo/i.test(t))).toBe(true)
    expect(headingTexts.some(t => /Perguntas Frequentes/i.test(t))).toBe(true)
  })

  it('opens and closes the demo modal via the hero CTA', () => {
    renderLanding()

    const demoButton = screen.getByRole('button', { name: /Ver Demonstração/i })
    fireEvent.click(demoButton)

    const dialog = screen.getByRole('dialog')
    expect(dialog).toHaveAttribute('aria-modal', 'true')
    expect(dialog).toHaveAttribute('aria-labelledby', 'demo-title')
    expect(screen.getByText(/Demonstração de vídeo será exibida aqui/i)).toBeInTheDocument()

    const closeButtons = screen.getAllByRole('button', { name: /Fechar/i })
    fireEvent.click(closeButtons[closeButtons.length - 1])

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('closes the demo modal on Escape', () => {
    renderLanding()

    fireEvent.click(screen.getByRole('button', { name: /Ver Demonstração/i }))
    expect(screen.getByRole('dialog')).toBeInTheDocument()

    fireEvent.keyDown(document, { key: 'Escape' })
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  })

  it('renders CTA buttons in the hero', () => {
    renderLanding()

    expect(screen.getAllByRole('button', { name: /Começar Agora/i }).length).toBeGreaterThan(0)
    expect(screen.getByRole('button', { name: /Ver Demonstração/i })).toBeInTheDocument()
  })
})
