import { describe, expect, it, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/providers/I18nProvider'
import { PlayerEmptyState } from '@/modules/players/components/PlayerEmptyState'

describe('PlayerEmptyState', () => {
  it('renders default empty copy', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <PlayerEmptyState />
      </I18nextProvider>,
    )

    expect(screen.getByText('Nenhum jogador encontrado')).toBeInTheDocument()
    expect(
      screen.getByText('Tente alterar a pesquisa ou limpar os filtros para ver mais resultados.'),
    ).toBeInTheDocument()
  })

  it('renders custom message and reset action', () => {
    const onReset = vi.fn()

    render(
      <I18nextProvider i18n={i18n}>
        <PlayerEmptyState message="Sem resultados para o filtro atual." onReset={onReset} />
      </I18nextProvider>,
    )

    expect(screen.getByText('Sem resultados para o filtro atual.')).toBeInTheDocument()
    screen.getByRole('button', { name: /limpar filtros/i }).click()
    expect(onReset).toHaveBeenCalledTimes(1)
  })
})
