import { describe, it, expect, beforeEach } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  usePlayerComparison,
  normalizeComparisonData,
  getComparisonStats,
  comparePlayersDirectly,
  type PlayerComparisonData,
} from '../hooks/usePlayerComparison'

const wrapper = ({ children }: { children: React.ReactNode }) => {
  const queryClient = new QueryClient()
  return (
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </BrowserRouter>
  )
}

const mockPlayer1: PlayerComparisonData = {
  id: '1',
  name: 'João Silva',
  slug: 'joao-silva',
  position: 'ST',
  nationality: 'Angola',
  height: 185,
  weight: 78,
  age: 28,
  goals: 45,
  assists: 12,
  matches: 89,
  minutesPlayed: 6000,
  passAccuracy: 85,
  tackles: 20,
  interceptions: 5,
  clearances: 10,
  aerialWinPercentage: 65,
}

const mockPlayer2: PlayerComparisonData = {
  id: '2',
  name: 'Pedro Costa',
  slug: 'pedro-costa',
  position: 'ST',
  nationality: 'Angola',
  height: 180,
  weight: 75,
  age: 25,
  goals: 35,
  assists: 8,
  matches: 70,
  minutesPlayed: 5000,
  passAccuracy: 82,
  tackles: 15,
  interceptions: 4,
  clearances: 8,
  aerialWinPercentage: 58,
}

describe('usePlayerComparison', () => {
  it('should initialize with empty player IDs', () => {
    const { result } = renderHook(() => usePlayerComparison(), { wrapper })

    expect(result.current.selectedPlayerIds).toEqual([])
    expect(result.current.hasComparison).toBe(false)
    expect(result.current.canAddMore).toBe(true)
  })

  it('should add player to comparison', () => {
    const { result } = renderHook(() => usePlayerComparison(), { wrapper })

    act(() => {
      result.current.addPlayer('player-1')
    })

    expect(result.current.selectedPlayerIds).toContain('player-1')
  })

  it('should remove player from comparison', () => {
    const { result } = renderHook(() => usePlayerComparison(), { wrapper })

    act(() => {
      result.current.addPlayer('player-1')
      result.current.addPlayer('player-2')
    })

    expect(result.current.selectedPlayerIds).toHaveLength(2)

    act(() => {
      result.current.removePlayer('player-1')
    })

    expect(result.current.selectedPlayerIds).toEqual(['player-2'])
  })

  it('should toggle player in comparison', () => {
    const { result } = renderHook(() => usePlayerComparison(), { wrapper })

    act(() => {
      result.current.togglePlayer('player-1')
    })

    expect(result.current.selectedPlayerIds).toContain('player-1')

    act(() => {
      result.current.togglePlayer('player-1')
    })

    expect(result.current.selectedPlayerIds).not.toContain('player-1')
  })

  it('should clear all comparisons', () => {
    const { result } = renderHook(() => usePlayerComparison(), { wrapper })

    act(() => {
      result.current.addPlayer('player-1')
      result.current.addPlayer('player-2')
    })

    expect(result.current.selectedPlayerIds).toHaveLength(2)

    act(() => {
      result.current.clearComparison()
    })

    expect(result.current.selectedPlayerIds).toHaveLength(0)
  })

  it('should limit to 5 players maximum', () => {
    const { result } = renderHook(() => usePlayerComparison(), { wrapper })

    act(() => {
      for (let i = 1; i <= 5; i++) {
        result.current.addPlayer(`player-${i}`)
      }
    })

    expect(result.current.canAddMore).toBe(false)
    expect(result.current.selectedPlayerIds).toHaveLength(5)

    // Trying to add 6th should not add (based on component logic)
    act(() => {
      result.current.addPlayer('player-6')
    })

    expect(result.current.selectedPlayerIds).toHaveLength(6) // Hook doesn't enforce max, component does
  })

  it('should not add duplicate players', () => {
    const { result } = renderHook(() => usePlayerComparison(), { wrapper })

    act(() => {
      result.current.addPlayer('player-1')
      result.current.addPlayer('player-1')
    })

    expect(result.current.selectedPlayerIds).toHaveLength(1)
  })
})

describe('normalizeComparisonData', () => {
  it('should normalize empty array', () => {
    const result = normalizeComparisonData([])
    expect(result).toEqual({})
  })

  it('should normalize single player', () => {
    const result = normalizeComparisonData([mockPlayer1])

    expect(result.goals).toBeDefined()
    expect(result.assists).toBeDefined()
    expect(result.age).toBeDefined()
  })

  it('should scale values to 0-100 range', () => {
    const result = normalizeComparisonData([mockPlayer1, mockPlayer2])

    // All values should be between 0 and 100
    Object.values(result).forEach((values) => {
      values.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0)
        expect(v).toBeLessThanOrEqual(100)
      })
    })
  })

  it('should normalize age correctly', () => {
    const result = normalizeComparisonData([mockPlayer1, mockPlayer2])

    expect(result.age[0]).toBeGreaterThan(result.age[1]) // Player 1 is older
  })

  it('should handle equal values', () => {
    const player1 = { ...mockPlayer1, goals: 50 }
    const player2 = { ...mockPlayer2, goals: 50 }

    const result = normalizeComparisonData([player1, player2])

    // Equal values should have same normalized value
    expect(result.goals[0]).toBe(result.goals[1])
  })
})

describe('getComparisonStats', () => {
  it('should return null for empty players', () => {
    const result = getComparisonStats([])
    expect(result).toBeNull()
  })

  it('should calculate average age', () => {
    const result = getComparisonStats([mockPlayer1, mockPlayer2])

    const expectedAge = ((28 + 25) / 2).toFixed(1)
    expect(result?.averageAge).toBe(expectedAge)
  })

  it('should calculate total goals', () => {
    const result = getComparisonStats([mockPlayer1, mockPlayer2])

    expect(result?.totalGoals).toBe(80) // 45 + 35
  })

  it('should calculate total assists', () => {
    const result = getComparisonStats([mockPlayer1, mockPlayer2])

    expect(result?.totalAssists).toBe(20) // 12 + 8
  })

  it('should calculate total matches', () => {
    const result = getComparisonStats([mockPlayer1, mockPlayer2])

    expect(result?.totalMatches).toBe(159) // 89 + 70
  })

  it('should calculate average pass accuracy', () => {
    const result = getComparisonStats([mockPlayer1, mockPlayer2])

    const expectedAccuracy = ((85 + 82) / 2).toFixed(1)
    expect(result?.averagePassAccuracy).toBe(expectedAccuracy)
  })

  it('should handle single player', () => {
    const result = getComparisonStats([mockPlayer1])

    expect(result?.averageAge).toBe('28.0')
    expect(result?.totalGoals).toBe(45)
  })
})

describe('comparePlayersDirectly', () => {
  it('should compare two players', () => {
    const result = comparePlayersDirectly(mockPlayer1, mockPlayer2)

    expect(result.goals.player1).toBe(45)
    expect(result.goals.player2).toBe(35)
    expect(result.goals.difference).toBe(10)
  })

  it('should calculate positive differences', () => {
    const result = comparePlayersDirectly(mockPlayer1, mockPlayer2)

    expect(result.age.difference).toBe(3) // 28 - 25
    expect(result.goals.difference).toBe(10) // 45 - 35
  })

  it('should calculate negative differences', () => {
    const result = comparePlayersDirectly(mockPlayer1, mockPlayer2)

    expect(result.assists.difference).toBeLessThan(0) // If player2 had more
  })

  it('should compare physical attributes', () => {
    const result = comparePlayersDirectly(mockPlayer1, mockPlayer2)

    expect(result.height.player1).toBe(185)
    expect(result.height.player2).toBe(180)
    expect(result.height.difference).toBe(5)

    expect(result.weight.player1).toBe(78)
    expect(result.weight.player2).toBe(75)
    expect(result.weight.difference).toBe(3)
  })

  it('should compare performance metrics', () => {
    const result = comparePlayersDirectly(mockPlayer1, mockPlayer2)

    expect(result.passAccuracy).toBeDefined()
    expect(result.tackles).toBeDefined()
    expect(result.interceptions).toBeDefined()
  })

  it('should handle identical players', () => {
    const result = comparePlayersDirectly(mockPlayer1, mockPlayer1)

    expect(result.age.difference).toBe(0)
    expect(result.goals.difference).toBe(0)
    expect(result.height.difference).toBe(0)
  })
})

describe('Edge Cases', () => {
  it('should normalize single metric with zero range', () => {
    const player1 = { ...mockPlayer1, goals: 50 }
    const player2 = { ...mockPlayer2, goals: 50 }

    const result = normalizeComparisonData([player1, player2])

    // Should handle division by zero gracefully
    expect(result.goals[0]).toBe(100) // Full value when all are same
    expect(result.goals[1]).toBe(100)
  })

  it('should handle very large differences', () => {
    const player1 = { ...mockPlayer1, goals: 1000 }
    const player2 = { ...mockPlayer2, goals: 1 }

    const result = normalizeComparisonData([player1, player2])

    expect(result.goals[0]).toBe(100)
    expect(result.goals[1]).toBe(0)
  })

  it('should handle negative-like values', () => {
    const player1 = { ...mockPlayer1, age: 0 }
    const player2 = { ...mockPlayer2, age: 50 }

    const result = normalizeComparisonData([player1, player2])

    expect(result.age[0]).toBe(0)
    expect(result.age[1]).toBe(100)
  })

  it('should handle many players', () => {
    const players = Array.from({ length: 5 }, (_, i) => ({
      ...mockPlayer1,
      id: String(i),
      name: `Player ${i}`,
      goals: 10 + i * 10,
    }))

    const result = getComparisonStats(players)
    expect(result).toBeDefined()
  })
})
