import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import { i18n } from '@/app/providers/I18nProvider'
import { PlayerCard } from '@/modules/players/components/PlayerCard'
import { mockPlayer } from '@/tests/__mocks__/player.mock'

describe('PlayerCard', () => {
  it('renders player summary and profile link', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <BrowserRouter>
          <PlayerCard player={mockPlayer} />
        </BrowserRouter>
      </I18nextProvider>,
    )

    expect(screen.getByText(mockPlayer.full_name)).toBeInTheDocument()
    expect(screen.getByText(mockPlayer.position_label)).toBeInTheDocument()
    expect(screen.getByText(mockPlayer.status_label)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /ver perfil/i })).toHaveAttribute(
      'href',
      `/players/${mockPlayer.slug}`,
    )
  })
})
