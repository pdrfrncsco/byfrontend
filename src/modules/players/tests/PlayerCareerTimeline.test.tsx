import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { I18nextProvider } from 'react-i18next'
import i18n from '@/i18n'
import { PlayerCareerTimeline } from '../components/PlayerCareerTimeline'
import type { PlayerCareerEntry } from '../types'

const mockCareerEntry: PlayerCareerEntry = {
  club: 'SL Benfica',
  club_slug: 'sl-benfica',
  joined: '2020-07-01',
  left: '2023-06-30',
  goals: 45,
  assists: 12,
  matches: 89,
  status: 'transferred',
  competition: 'Primeira Liga',
}

const mockCareerEntryInternational: PlayerCareerEntry = {
  club: 'Seleção Nacional',
  club_slug: 'selecao-nacional',
  joined: '2023-07-01',
  left: null,
  goals: 8,
  assists: 3,
  matches: 15,
  status: 'active',
  competition: 'Seleção Nacional',
}

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  </BrowserRouter>
)

describe('PlayerCareerTimeline', () => {
  it('should render empty state when career is empty', () => {
    render(<PlayerCareerTimeline career={[]} />, { wrapper })
    
    expect(screen.getByText(/career|carreira/i)).toBeInTheDocument()
  })

  it('should render career entries', () => {
    render(
      <PlayerCareerTimeline career={[mockCareerEntry]} />,
      { wrapper }
    )

    expect(screen.getByText('SL Benfica')).toBeInTheDocument()
    expect(screen.getByText('transferred')).toBeInTheDocument()
  })

  it('should display goals, assists, and matches', () => {
    render(
      <PlayerCareerTimeline career={[mockCareerEntry]} />,
      { wrapper }
    )

    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('89')).toBeInTheDocument()
  })

  it('should display correct status badges', () => {
    const transferredEntry = { ...mockCareerEntry, status: 'transferred' }
    const loanedEntry = { ...mockCareerEntry, status: 'loaned', club: 'Porto' }
    
    render(
      <PlayerCareerTimeline career={[transferredEntry, loanedEntry]} />,
      { wrapper }
    )

    expect(screen.getByText('transferred')).toBeInTheDocument()
    expect(screen.getByText('loaned')).toBeInTheDocument()
  })

  it('should show "present" when player is still at club', () => {
    const activeEntry = { ...mockCareerEntry, left: null, status: 'active' }
    
    render(
      <PlayerCareerTimeline career={[activeEntry]} />,
      { wrapper }
    )

    expect(screen.getByText(/present|atual/i)).toBeInTheDocument()
  })

  it('should calculate and display duration in years', () => {
    const entry = {
      ...mockCareerEntry,
      joined: '2020-01-01',
      left: '2023-01-01', // 3 years
    }

    render(<PlayerCareerTimeline career={[entry]} />, { wrapper })
    
    expect(screen.getByText(/3 anos/i)).toBeInTheDocument()
  })

  it('should render multiple entries in chronological order', () => {
    const entries = [
      { ...mockCareerEntry, club: 'Club A', joined: '2020-01-01', left: '2021-01-01' },
      { ...mockCareerEntry, club: 'Club B', joined: '2021-02-01', left: '2022-02-01' },
      { ...mockCareerEntry, club: 'Club C', joined: '2022-03-01', left: null },
    ]

    const { container } = render(
      <PlayerCareerTimeline career={entries} />,
      { wrapper }
    )

    const clubElements = screen.getAllByText(/Club [ABC]/i)
    expect(clubElements).toHaveLength(3)
  })

  it('should display statistics footer', () => {
    const entries = [
      { ...mockCareerEntry, goals: 20, assists: 5, matches: 40 },
      { ...mockCareerEntry, goals: 15, assists: 3, matches: 35, club: 'Porto' },
    ]

    render(
      <PlayerCareerTimeline career={entries} />,
      { wrapper }
    )

    // Should show total stats
    expect(screen.getByText('2')).toBeInTheDocument() // 2 clubs
    expect(screen.getByText('35')).toBeInTheDocument() // total goals
    expect(screen.getByText('8')).toBeInTheDocument() // total assists
  })

  it('should handle career entries without competition field', () => {
    const entryWithoutCompetition = {
      club: 'Test Club',
      club_slug: 'test-club',
      joined: '2020-01-01',
      left: '2021-01-01',
      goals: 10,
      assists: 2,
      matches: 20,
      status: 'active',
    } as PlayerCareerEntry

    render(
      <PlayerCareerTimeline career={[entryWithoutCompetition]} />,
      { wrapper }
    )

    expect(screen.getByText('Test Club')).toBeInTheDocument()
  })

  it('should render show more button when career exceeds max items', () => {
    const entries = Array.from({ length: 60 }, (_, i) => ({
      ...mockCareerEntry,
      club: `Club ${i}`,
      club_slug: `club-${i}`,
    }))

    render(
      <PlayerCareerTimeline career={entries} maxVisibleItems={50} />,
      { wrapper }
    )

    expect(screen.getByText(/Ver mais/i)).toBeInTheDocument()
  })

  it('should render performance indicator when applicable', () => {
    const entry = {
      ...mockCareerEntry,
      goals: 20,
      matches: 40, // 0.50 goals per match
    }

    render(
      <PlayerCareerTimeline career={[entry]} />,
      { wrapper }
    )

    expect(screen.getByText(/0.50 g\/j|0.50 g\/m/i)).toBeInTheDocument()
  })

  it('should not render performance indicator when no goals', () => {
    const entry = {
      ...mockCareerEntry,
      goals: 0,
      matches: 40,
    }

    const { container } = render(
      <PlayerCareerTimeline career={[entry]} />,
      { wrapper }
    )

    // Should not find any g/j or g/m text
    expect(container.textContent).not.toMatch(/g\/[jm]/i)
  })

  it('should handle entries from different competition types', () => {
    const entries = [
      { ...mockCareerEntry, competition: 'Primeira Liga' },
      { ...mockCareerEntry, competition: 'Taça de Portugal', club: 'Club A' },
      { ...mockCareerEntry, competition: 'Liga dos Campeões', club: 'Club B' },
      { ...mockCareerEntry, competition: 'Seleção Nacional', club: 'Club C' },
    ]

    render(
      <PlayerCareerTimeline career={entries} />,
      { wrapper }
    )

    // All entries should be rendered
    expect(screen.getByText('SL Benfica')).toBeInTheDocument()
    expect(screen.getByText('Club A')).toBeInTheDocument()
  })

  it('should render club links correctly', () => {
    render(
      <PlayerCareerTimeline career={[mockCareerEntry]} />,
      { wrapper }
    )

    const link = screen.getByRole('link', { name: 'SL Benfica' })
    expect(link).toHaveAttribute('href', '/clubs/sl-benfica')
  })

  it('should display formatted dates', () => {
    const entry = {
      ...mockCareerEntry,
      joined: '2020-06-15',
      left: '2023-07-20',
    }

    render(
      <PlayerCareerTimeline career={[entry]} />,
      { wrapper }
    )

    // Should display dates in Portuguese format
    expect(screen.getByText(/15\/06\/2020/i)).toBeInTheDocument()
  })

  it('should show current year for ongoing careers', () => {
    const entry = {
      ...mockCareerEntry,
      left: null,
      status: 'active',
    }

    render(
      <PlayerCareerTimeline career={[entry]} />,
      { wrapper }
    )

    const currentYear = new Date().getFullYear()
    expect(screen.getByText(new RegExp(String(currentYear)))).toBeInTheDocument()
  })

  it('should handle large datasets efficiently', () => {
    const largeCareer = Array.from({ length: 100 }, (_, i) => ({
      ...mockCareerEntry,
      club: `Club ${i}`,
      club_slug: `club-${i}`,
      joined: `${2000 + Math.floor(i / 5)}-01-01`,
      left: `${2000 + Math.floor(i / 5) + 2}-01-01`,
    }))

    render(
      <PlayerCareerTimeline career={largeCareer} maxVisibleItems={30} />,
      { wrapper }
    )

    expect(screen.getByText(/Ver mais/i)).toBeInTheDocument()
    // Should only show 30 items initially
    expect(screen.queryByText('Club 99')).not.toBeInTheDocument()
  })

  it('should calculate total stats correctly', () => {
    const entries = [
      { ...mockCareerEntry, goals: 25, assists: 8, matches: 50 },
      { ...mockCareerEntry, goals: 15, assists: 5, matches: 35, club: 'Porto' },
      { ...mockCareerEntry, goals: 10, assists: 3, matches: 25, club: 'Sporting' },
    ]

    render(
      <PlayerCareerTimeline career={entries} />,
      { wrapper }
    )

    // Total: 50 goals, 16 assists, 110 matches
    // Stats footer should show aggregates
    expect(screen.getByText('3')).toBeInTheDocument() // 3 clubs
  })
})
