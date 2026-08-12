import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { PlayerCareerStatsSection } from '../components/sections/PlayerCareerStatsSection'
import type { PlayerCareerEntry } from '../types'

describe('PlayerCareerStatsSection', () => {
  const mockCareerData: PlayerCareerEntry[] = [
    {
      club: 'Desportivo da Huíla',
      club_slug: 'desportivo-huila',
      joined: '2018-01-01',
      left: '2020-06-30',
      status: 'inactive',
      matches: 45,
      goals: 12,
      assists: 5,
    },
    {
      club: 'Sporting de Cabinda',
      club_slug: 'sporting-cabinda',
      joined: '2020-07-01',
      left: null,
      status: 'active',
      matches: 78,
      goals: 28,
      assists: 15,
    },
  ]

  it('should render empty state when no career data', () => {
    render(<PlayerCareerStatsSection career={[]} />)
    expect(screen.getByText(/Nenhuma carreira registada/i)).toBeInTheDocument()
  })

  it('should render loading state', () => {
    render(<PlayerCareerStatsSection career={[]} isLoading={true} />)
    expect(screen.getByText(/A carregar estatísticas/i)).toBeInTheDocument()
  })

  it('should calculate and display total statistics correctly', () => {
    render(<PlayerCareerStatsSection career={mockCareerData} />)

    // Total matches: 45 + 78 = 123
    expect(screen.getByText('123')).toBeInTheDocument()

    // Total goals: 12 + 28 = 40
    expect(screen.getByText('40')).toBeInTheDocument()

    // Total assists: 5 + 15 = 20
    expect(screen.getByText('20')).toBeInTheDocument()
  })

  it('should display clubs in career history', () => {
    render(<PlayerCareerStatsSection career={mockCareerData} />)

    expect(screen.getByText('Desportivo da Huíla')).toBeInTheDocument()
    expect(screen.getByText('Sporting de Cabinda')).toBeInTheDocument()
  })

  it('should display club dates correctly', () => {
    render(<PlayerCareerStatsSection career={mockCareerData} />)

    // Should show joined and left dates
    const dateElements = screen.getAllByText(/\d{1,2}\/\d{1,2}\/\d{4}/i)
    expect(dateElements.length).toBeGreaterThan(0)
  })

  it('should show "Atual" for clubs with no left date', () => {
    render(<PlayerCareerStatsSection career={mockCareerData} />)

    // Sporting de Cabinda has no left date, so should show "Atual"
    expect(screen.getByText(/Atual/)).toBeInTheDocument()
  })

  it('should display statistics table with all clubs', () => {
    render(<PlayerCareerStatsSection career={mockCareerData} />)

    // Check table headers
    expect(screen.getByText('Clube')).toBeInTheDocument()
    expect(screen.getByText('Partidas')).toBeInTheDocument()
    expect(screen.getByText('Golos')).toBeInTheDocument()
    expect(screen.getByText('Assistências')).toBeInTheDocument()
  })

  it('should calculate average goals per match correctly', () => {
    render(<PlayerCareerStatsSection career={mockCareerData} />)

    // Average goals: 40 / 123 ≈ 0.33
    // Should display in summary stats
    const averageElements = screen.getAllByText(/0\.33|0\.34/)
    expect(averageElements.length).toBeGreaterThan(0)
  })

  it('should calculate average assists per match correctly', () => {
    render(<PlayerCareerStatsSection career={mockCareerData} />)

    // Average assists: 20 / 123 ≈ 0.16
    // Should display in summary stats
    const averageElements = screen.getAllByText(/0\.16|0\.17/)
    expect(averageElements.length).toBeGreaterThan(0)
  })

  it('should display individual club statistics', () => {
    render(<PlayerCareerStatsSection career={mockCareerData} />)

    // For Desportivo da Huíla: 45 matches, 12 goals, 5 assists
    // For Sporting de Cabinda: 78 matches, 28 goals, 15 assists
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
    expect(screen.getByText('5')).toBeInTheDocument()
    expect(screen.getByText('78')).toBeInTheDocument()
    expect(screen.getByText('28')).toBeInTheDocument()
    expect(screen.getByText('15')).toBeInTheDocument()
  })

  it('should handle single career entry', () => {
    const singleCareer: PlayerCareerEntry[] = [mockCareerData[0]]
    render(<PlayerCareerStatsSection career={singleCareer} />)

    expect(screen.getByText('Desportivo da Huíla')).toBeInTheDocument()
    expect(screen.getByText('45')).toBeInTheDocument()
    expect(screen.getByText('12')).toBeInTheDocument()
  })

  it('should handle career with zero statistics', () => {
    const zeroStatsCareer: PlayerCareerEntry[] = [
      {
        club: 'Test Club',
        club_slug: 'test-club',
        joined: '2020-01-01',
        left: '2021-01-01',
        status: 'inactive',
        matches: 0,
        goals: 0,
        assists: 0,
      },
    ]

    render(<PlayerCareerStatsSection career={zeroStatsCareer} />)

    expect(screen.getByText('Test Club')).toBeInTheDocument()
    expect(screen.getByText('0.00')).toBeInTheDocument() // Average calculations
  })

  it('should display responsive grid layout', () => {
    const { container } = render(<PlayerCareerStatsSection career={mockCareerData} />)

    // Check for grid classes
    const gridElements = container.querySelectorAll('.grid')
    expect(gridElements.length).toBeGreaterThan(0)
  })

  it('should display charts container', () => {
    const { container } = render(<PlayerCareerStatsSection career={mockCareerData} />)

    // Check if canvas elements (charts) are rendered
    const canvasElements = container.querySelectorAll('canvas')
    expect(canvasElements.length).toBeGreaterThan(0)
  })
})
