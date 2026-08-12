import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, act } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import {
  usePlayerFilters,
  usePlayerSearch,
  usePositionFilter,
  useAgeRangeFilter,
  useHeightRangeFilter,
  useWeightRangeFilter,
} from '../hooks/usePlayerFilters'

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

describe('usePlayerFilters', () => {
  it('should initialize with empty filters', () => {
    const { result } = renderHook(() => usePlayerFilters(), { wrapper })
    
    expect(result.current.filters.search).toBeUndefined()
    expect(result.current.filters.position).toBeUndefined()
    expect(result.current.filters.page).toBe(1)
  })

  it('should update filters', () => {
    const { result } = renderHook(() => usePlayerFilters(), { wrapper })

    act(() => {
      result.current.setFilters({ search: 'João Silva' })
    })

    expect(result.current.filters.search).toBe('João Silva')
  })

  it('should reset all filters', () => {
    const { result } = renderHook(() => usePlayerFilters(), { wrapper })

    act(() => {
      result.current.setFilters({ search: 'João', position: 'st' })
    })

    expect(result.current.filters.search).toBe('João')
    expect(result.current.filters.position).toBe('st')

    act(() => {
      result.current.resetFilters()
    })

    expect(result.current.filters.search).toBeUndefined()
    expect(result.current.filters.position).toBeUndefined()
  })

  it('should clear individual filter', () => {
    const { result } = renderHook(() => usePlayerFilters(), { wrapper })

    act(() => {
      result.current.setFilters({ search: 'João', position: 'st' })
    })

    act(() => {
      result.current.clearFilter('search')
    })

    expect(result.current.filters.search).toBeUndefined()
    expect(result.current.filters.position).toBe('st')
  })

  it('should handle pagination filters', () => {
    const { result } = renderHook(() => usePlayerFilters(), { wrapper })

    act(() => {
      result.current.setFilters({ page: 2, pageSize: 50 })
    })

    expect(result.current.filters.page).toBe(2)
    expect(result.current.filters.pageSize).toBe(50)
  })
})

describe('usePlayerSearch', () => {
  it('should initialize with empty query', () => {
    const { result } = renderHook(() => usePlayerSearch(), { wrapper })
    
    expect(result.current.query).toBe('')
  })

  it('should set search query', () => {
    const { result } = renderHook(() => usePlayerSearch(), { wrapper })

    act(() => {
      result.current.setQuery('João Silva')
    })

    expect(result.current.query).toBe('João Silva')
  })

  it('should clear search query', () => {
    const { result } = renderHook(() => usePlayerSearch(), { wrapper })

    act(() => {
      result.current.setQuery('João Silva')
    })

    expect(result.current.query).toBe('João Silva')

    act(() => {
      result.current.clearQuery()
    })

    expect(result.current.query).toBe('')
  })
})

describe('usePositionFilter', () => {
  it('should initialize with empty positions', () => {
    const { result } = renderHook(() => usePositionFilter(), { wrapper })
    
    expect(result.current.positions).toEqual([])
  })

  it('should toggle position', () => {
    const { result } = renderHook(() => usePositionFilter(), { wrapper })

    act(() => {
      result.current.togglePosition('st')
    })

    expect(result.current.positions).toContain('st')

    act(() => {
      result.current.togglePosition('st')
    })

    expect(result.current.positions).not.toContain('st')
  })

  it('should handle multiple positions', () => {
    const { result } = renderHook(() => usePositionFilter(), { wrapper })

    act(() => {
      result.current.togglePosition('st')
      result.current.togglePosition('cm')
      result.current.togglePosition('gk')
    })

    expect(result.current.positions).toHaveLength(3)
    expect(result.current.positions).toContain('st')
    expect(result.current.positions).toContain('cm')
    expect(result.current.positions).toContain('gk')
  })

  it('should set positions directly', () => {
    const { result } = renderHook(() => usePositionFilter(), { wrapper })

    act(() => {
      result.current.setPositions(['st', 'cm'])
    })

    expect(result.current.positions).toEqual(['st', 'cm'])
  })

  it('should clear positions', () => {
    const { result } = renderHook(() => usePositionFilter(), { wrapper })

    act(() => {
      result.current.setPositions(['st', 'cm'])
    })

    expect(result.current.positions).toHaveLength(2)

    act(() => {
      result.current.clearPositions()
    })

    expect(result.current.positions).toEqual([])
  })
})

describe('useAgeRangeFilter', () => {
  it('should initialize with undefined range', () => {
    const { result } = renderHook(() => useAgeRangeFilter(), { wrapper })
    
    expect(result.current.ageMin).toBeUndefined()
    expect(result.current.ageMax).toBeUndefined()
  })

  it('should set age range', () => {
    const { result } = renderHook(() => useAgeRangeFilter(), { wrapper })

    act(() => {
      result.current.setAgeRange(18, 30)
    })

    expect(result.current.ageMin).toBe(18)
    expect(result.current.ageMax).toBe(30)
  })

  it('should set partial age range', () => {
    const { result } = renderHook(() => useAgeRangeFilter(), { wrapper })

    act(() => {
      result.current.setAgeRange(25, undefined)
    })

    expect(result.current.ageMin).toBe(25)
    expect(result.current.ageMax).toBeUndefined()
  })

  it('should clear age range', () => {
    const { result } = renderHook(() => useAgeRangeFilter(), { wrapper })

    act(() => {
      result.current.setAgeRange(18, 30)
    })

    act(() => {
      result.current.clearAgeRange()
    })

    expect(result.current.ageMin).toBeUndefined()
    expect(result.current.ageMax).toBeUndefined()
  })
})

describe('useHeightRangeFilter', () => {
  it('should initialize with undefined range', () => {
    const { result } = renderHook(() => useHeightRangeFilter(), { wrapper })
    
    expect(result.current.heightMin).toBeUndefined()
    expect(result.current.heightMax).toBeUndefined()
  })

  it('should set height range', () => {
    const { result } = renderHook(() => useHeightRangeFilter(), { wrapper })

    act(() => {
      result.current.setHeightRange(170, 190)
    })

    expect(result.current.heightMin).toBe(170)
    expect(result.current.heightMax).toBe(190)
  })

  it('should clear height range', () => {
    const { result } = renderHook(() => useHeightRangeFilter(), { wrapper })

    act(() => {
      result.current.setHeightRange(170, 190)
    })

    act(() => {
      result.current.clearHeightRange()
    })

    expect(result.current.heightMin).toBeUndefined()
    expect(result.current.heightMax).toBeUndefined()
  })
})

describe('useWeightRangeFilter', () => {
  it('should initialize with undefined range', () => {
    const { result } = renderHook(() => useWeightRangeFilter(), { wrapper })
    
    expect(result.current.weightMin).toBeUndefined()
    expect(result.current.weightMax).toBeUndefined()
  })

  it('should set weight range', () => {
    const { result } = renderHook(() => useWeightRangeFilter(), { wrapper })

    act(() => {
      result.current.setWeightRange(70, 85)
    })

    expect(result.current.weightMin).toBe(70)
    expect(result.current.weightMax).toBe(85)
  })

  it('should clear weight range', () => {
    const { result } = renderHook(() => useWeightRangeFilter(), { wrapper })

    act(() => {
      result.current.setWeightRange(70, 85)
    })

    act(() => {
      result.current.clearWeightRange()
    })

    expect(result.current.weightMin).toBeUndefined()
    expect(result.current.weightMax).toBeUndefined()
  })
})
