import { render, screen, fireEvent } from '@testing-library/react'
import { describe, expect, it, vi, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { MatchCenterPage } from '@/modules/competitions/pages/MatchCenterPage'
import { useMatchCenter } from '@/modules/competitions/hooks/useMatchCenter'
import { useCompetition } from '@/modules/competitions/hooks/useCompetitions'
import { useCompetitionAccess } from '@/modules/competitions/hooks/useCompetitionAccess'

vi.mock('@/modules/competitions/hooks/useCompetitions', () => ({
  useCompetition: vi.fn(),
}))

vi.mock('@/modules/competitions/hooks/useCompetitionAccess', () => ({
  useCompetitionAccess: vi.fn(),
}))

vi.mock('@/modules/competitions/hooks/useMatchCenter', () => ({
  useMatchCenter: vi.fn(),
}))

describe('MatchCenterPage status filter', () => {
  beforeEach(() => {
    vi.clearAllMocks()

    vi.mocked(useCompetition).mockReturnValue({
      data: { id: 'comp-1', name: 'Competition 1' },
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    } as any)

    vi.mocked(useCompetitionAccess).mockReturnValue({
      isAdmin: false,
      isEditor: false,
      canManage: false,
      canView: true,
      canEdit: false,
      userRole: null,
      permissions: [],
    } as any)

    vi.mocked(useMatchCenter).mockReturnValue({
      matches: [
        { id: 'm1', status: 'live', roundNumber: 1, homeTeamName: 'Home', awayTeamName: 'Away', home_club_name: 'Home', away_club_name: 'Away', competition: 'comp-1', competitionId: 'comp-1', round_number: 1, home_club: 'h1', away_club: 'a1', home_score: 1, away_score: 0, match_date: '2026-08-18T20:00:00Z', status_label: 'Ao vivo', home_score_: 1, away_score_: 0 } as any,
        { id: 'm2', status: 'scheduled', roundNumber: 1, homeTeamName: 'X', awayTeamName: 'Y', home_club_name: 'X', away_club_name: 'Y', competition: 'comp-1', competitionId: 'comp-1', round_number: 1, home_club: 'x', away_club: 'y', home_score: 0, away_score: 0, match_date: '2026-08-18T20:00:00Z', status_label: 'Agendado', home_score_: 0, away_score_: 0 } as any,
      ],
      rounds: [{ number: 1, label: 'Jornada 1', matches: [] }],
      selectedRound: null,
      setSelectedRound: vi.fn(),
      liveMatches: [{ id: 'm1', status: 'live' } as any],
      upcomingMatches: [{ id: 'm2', status: 'scheduled' } as any],
      finishedMatches: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    })
  })

  it('applies the selected status to the live list query', () => {
    render(
      <MemoryRouter initialEntries={['/competitions/comp-1/match-center']}>
        <Routes>
          <Route path="/competitions/:compId/match-center" element={<MatchCenterPage />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /ao vivo/i }))

    expect(useMatchCenter).toHaveBeenLastCalledWith(
      expect.objectContaining({
        competitionId: 'comp-1',
        status: ['live', 'halftime'],
      })
    )
  })

  it('shows a specific empty state when a filter has no matches', () => {
    vi.mocked(useMatchCenter).mockImplementation(({ status }) => ({
      matches: status?.includes('live') ? [] : [
        { id: 'm1', status: 'live', roundNumber: 1, homeTeamName: 'Home', awayTeamName: 'Away', home_club_name: 'Home', away_club_name: 'Away', competition: 'comp-1', competitionId: 'comp-1', round_number: 1, home_club: 'h1', away_club: 'a1', home_score: 1, away_score: 0, match_date: '2026-08-18T20:00:00Z', status_label: 'Ao vivo', home_score_: 1, away_score_: 0 } as any,
      ],
      rounds: [{ number: 1, label: 'Jornada 1', matches: [] }],
      selectedRound: null,
      setSelectedRound: vi.fn(),
      liveMatches: status?.includes('live') ? [] : [{ id: 'm1', status: 'live' } as any],
      upcomingMatches: [],
      finishedMatches: [],
      isLoading: false,
      error: null,
      refetch: vi.fn(),
    }))

    render(
      <MemoryRouter initialEntries={['/competitions/comp-1/match-center']}>
        <Routes>
          <Route path="/competitions/:compId/match-center" element={<MatchCenterPage />} />
        </Routes>
      </MemoryRouter>
    )

    fireEvent.click(screen.getByRole('button', { name: /ao vivo/i }))

    expect(screen.getByText(/nenhuma partida encontrada para este filtro/i)).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /limpar filtro/i })).toBeInTheDocument()
  })
})
