import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { FollowButton } from '@/modules/fans/components/FollowButton'
import { FanHeroBanner } from '@/modules/fans/components/FanHeroBanner'
import { FanMatchPredictionCard } from '@/modules/fans/components/FanMatchPredictionCard'
import { getFanSidebarLinks } from '@/modules/fans/constants/navigation'
import type { FanMatch } from '@/modules/fans/types'

const mockMatch: FanMatch = {
  id: 'test-match-1',
  competitionId: 'girabola',
  competitionName: 'Girabola 2026/27',
  round: 'Jornada 1',
  date: '2026-10-01',
  time: '16:00',
  venue: 'Estádio 11 de Novembro',
  status: 'scheduled',
  homeTeam: {
    id: 'club-petro',
    name: 'Petro de Luanda',
    shortName: 'PET',
  },
  awayTeam: {
    id: 'club-primeiro-agosto',
    name: '1º de Agosto',
    shortName: 'PRI',
  },
}

describe('Fan Module', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('renders FollowButton and toggles follow state on click', () => {
    const item = {
      id: 'test-club-1',
      type: 'club' as const,
      name: 'Academia Sambizanga',
    }

    const { rerender } = render(
      <MemoryRouter>
        <FollowButton item={item} />
      </MemoryRouter>
    )

    const followBtn = screen.getByRole('button', { name: /Seguir/i })
    expect(followBtn).toBeInTheDocument()

    fireEvent.click(followBtn)

    rerender(
      <MemoryRouter>
        <FollowButton item={item} />
      </MemoryRouter>
    )

    expect(screen.getByRole('button', { name: /A Seguir/i })).toBeInTheDocument()
  })

  it('renders FanHeroBanner with user name and stat counters', () => {
    const stats = {
      followedClubsCount: 3,
      followedPlayersCount: 5,
      totalPredictions: 10,
      correctPredictions: 7,
      points: 350,
      rank: 4,
    }

    render(
      <MemoryRouter>
        <FanHeroBanner userName="Pedro Francisco" stats={stats} />
      </MemoryRouter>
    )

    expect(screen.getByText(/Pedro Francisco/i)).toBeInTheDocument()
    expect(screen.getByText('3')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('350')).toBeInTheDocument()
    expect(screen.getByText('#4')).toBeInTheDocument()
  })

  it('allows adjusting prediction scores and submitting', () => {
    const submitSpy = vi.fn()

    render(
      <MemoryRouter>
        <FanMatchPredictionCard
          featuredMatch={mockMatch}
          onSubmitPrediction={submitSpy}
        />
      </MemoryRouter>
    )

    expect(screen.getByText(/Palpite da Jornada/i)).toBeInTheDocument()
    expect(screen.getByText(/Petro de Luanda/i)).toBeInTheDocument()
    expect(screen.getByText(/1º de Agosto/i)).toBeInTheDocument()

    const confirmBtn = screen.getByRole('button', { name: /Confirmar Palpite/i })
    fireEvent.click(confirmBtn)

    expect(submitSpy).toHaveBeenCalledWith('test-match-1', 2, 1)
  })

  it('returns valid navigation items for fan sidebar', () => {
    const links = getFanSidebarLinks()
    expect(links.length).toBeGreaterThanOrEqual(4)
    expect(links.some((l) => l.label === 'Meu Futebol')).toBe(true)
    expect(links.some((l) => l.label === 'Clubes & Atletas')).toBe(true)
    expect(links.some((l) => l.label === 'Palpites & Ranking')).toBe(true)
  })
})
