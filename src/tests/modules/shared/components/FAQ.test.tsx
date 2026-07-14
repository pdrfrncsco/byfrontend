import { describe, it, expect } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/providers/I18nProvider'
import { FAQ } from '@/modules/shared/components/FAQ'

function renderFAQ() {
  return render(
    <I18nextProvider i18n={i18n}>
      <FAQ />
    </I18nextProvider>,
  )
}

describe('FAQ', () => {
  it('renders the section heading and all questions', () => {
    renderFAQ()

    expect(screen.getByRole('heading', { level: 2, name: /Perguntas Frequentes/i })).toBeInTheDocument()
    const questions = screen.getAllByRole('button')
    expect(questions).toHaveLength(4)
    expect(questions[0]).toHaveTextContent('Como começo a usar o BolaYetu?')
  })

  it('starts collapsed with aria-expanded false on all triggers', () => {
    renderFAQ()

    const triggers = screen.getAllByRole('button')
    triggers.forEach(trigger => {
      expect(trigger).toHaveAttribute('aria-expanded', 'false')
    })
  })

  it('expands a panel on click, toggling aria-expanded and revealing the answer', () => {
    renderFAQ()

    const firstTrigger = screen.getAllByRole('button')[0]
    fireEvent.click(firstTrigger)

    expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')
    const panel = document.getElementById(firstTrigger.getAttribute('aria-controls')!)
    expect(panel).toBeInTheDocument()
    expect(panel).toHaveTextContent(/É simples! Registe-se/)
  })

  it('links trigger to panel via aria-controls', () => {
    renderFAQ()

    const firstTrigger = screen.getAllByRole('button')[0]
    const panelId = firstTrigger.getAttribute('aria-controls')
    expect(panelId).toMatch(/^faq-panel-\d+$/)
    expect(document.getElementById(panelId!)).toBeNull()

    fireEvent.click(firstTrigger)
    expect(document.getElementById(panelId!)).toBeInTheDocument()
  })

  it('collapses the panel when clicked again', () => {
    renderFAQ()

    const firstTrigger = screen.getAllByRole('button')[0]
    fireEvent.click(firstTrigger)
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'true')

    fireEvent.click(firstTrigger)
    expect(firstTrigger).toHaveAttribute('aria-expanded', 'false')
  })
})
