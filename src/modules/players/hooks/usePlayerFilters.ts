import { useCallback, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import type { PlayerPosition } from '../types'

export interface PlayerFilters {
  search?: string
  position?: PlayerPosition
  nationality?: string
  ageMin?: number
  ageMax?: number
  heightMin?: number
  heightMax?: number
  weightMin?: number
  weightMax?: number
  foot?: 'left' | 'right' | 'both'
  withoutClub?: boolean
  status?: 'active' | 'retired' | 'banned' | 'inactive'
  page?: number
  pageSize?: number
}

/**
 * Hook for advanced player filtering with URL persistence
 * Maintains filters in URL query params for shareability and bookmarking
 */
export function usePlayerFilters() {
  const [searchParams, setSearchParams] = useSearchParams()

  // Parse filters from URL
  const filters = useMemo<PlayerFilters>(() => {
    return {
      search: searchParams.get('search') || undefined,
      position: (searchParams.get('position') || undefined) as PlayerPosition | undefined,
      nationality: searchParams.get('nationality') || undefined,
      ageMin: searchParams.get('ageMin') ? parseInt(searchParams.get('ageMin')!) : undefined,
      ageMax: searchParams.get('ageMax') ? parseInt(searchParams.get('ageMax')!) : undefined,
      heightMin: searchParams.get('heightMin') ? parseInt(searchParams.get('heightMin')!) : undefined,
      heightMax: searchParams.get('heightMax') ? parseInt(searchParams.get('heightMax')!) : undefined,
      weightMin: searchParams.get('weightMin') ? parseInt(searchParams.get('weightMin')!) : undefined,
      weightMax: searchParams.get('weightMax') ? parseInt(searchParams.get('weightMax')!) : undefined,
      foot: (searchParams.get('foot') || undefined) as 'left' | 'right' | 'both' | undefined,
      withoutClub: searchParams.get('withoutClub') === 'true',
      status: (searchParams.get('status') || undefined) as any,
      page: searchParams.get('page') ? parseInt(searchParams.get('page')!) : 1,
      pageSize: searchParams.get('pageSize') ? parseInt(searchParams.get('pageSize')!) : 20,
    }
  }, [searchParams])

  // Update filters and URL
  const setFilters = useCallback(
    (newFilters: Partial<PlayerFilters>) => {
      const params = new URLSearchParams(searchParams)

      Object.entries(newFilters).forEach(([key, value]) => {
        if (value === undefined || value === null || value === '') {
          params.delete(key)
        } else {
          params.set(key, String(value))
        }
      })

      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  // Reset filters
  const resetFilters = useCallback(() => {
    setSearchParams(new URLSearchParams())
  }, [setSearchParams])

  // Clear specific filter
  const clearFilter = useCallback(
    (key: keyof PlayerFilters) => {
      const params = new URLSearchParams(searchParams)
      params.delete(key)
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  return {
    filters,
    setFilters,
    resetFilters,
    clearFilter,
  }
}

/**
 * Hook to fetch filtered players with pagination
 */
export function useFilteredPlayers(filters: PlayerFilters, enabled = true) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1'

  return useQuery({
    queryKey: ['players-filtered', filters],
    queryFn: async () => {
      const params = new URLSearchParams()

      if (filters.search) {
        params.append('search', filters.search)
      }
      if (filters.position) {
        params.append('position', filters.position)
      }
      if (filters.nationality) {
        params.append('nationality', filters.nationality)
      }
      if (filters.ageMin !== undefined) {
        params.append('age_min', String(filters.ageMin))
      }
      if (filters.ageMax !== undefined) {
        params.append('age_max', String(filters.ageMax))
      }
      if (filters.heightMin !== undefined) {
        params.append('height_min', String(filters.heightMin))
      }
      if (filters.heightMax !== undefined) {
        params.append('height_max', String(filters.heightMax))
      }
      if (filters.weightMin !== undefined) {
        params.append('weight_min', String(filters.weightMin))
      }
      if (filters.weightMax !== undefined) {
        params.append('weight_max', String(filters.weightMax))
      }
      if (filters.foot) {
        params.append('foot', filters.foot)
      }
      if (filters.withoutClub) {
        params.append('without_club', 'true')
      }
      if (filters.status) {
        params.append('status', filters.status)
      }
      if (filters.page) {
        params.append('page', String(filters.page))
      }
      if (filters.pageSize) {
        params.append('page_size', String(filters.pageSize))
      }

      const url = `${apiUrl}/players/?${params.toString()}`

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Failed to fetch players: ${response.statusText}`)
      }

      return response.json()
    },
    enabled: enabled && Object.values(filters).some((v) => v !== undefined),
    staleTime: 1000 * 60 * 5, // 5 minutes
    placeholderData: keepPreviousData,
  })
}

/**
 * Hook for search with debounce
 */
export function usePlayerSearch(initialQuery = '') {
  const [searchParams, setSearchParams] = useSearchParams()
  const query = searchParams.get('search') || initialQuery

  const setQuery = useCallback(
    (newQuery: string) => {
      const params = new URLSearchParams(searchParams)
      if (newQuery) {
        params.set('search', newQuery)
        params.set('page', '1') // Reset to first page
      } else {
        params.delete('search')
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  const clearQuery = useCallback(() => {
    const params = new URLSearchParams(searchParams)
    params.delete('search')
    setSearchParams(params)
  }, [searchParams, setSearchParams])

  return {
    query,
    setQuery,
    clearQuery,
  }
}

/**
 * Hook for position filtering
 */
export function usePositionFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const positions = (searchParams.get('positions') || '').split(',').filter(Boolean) as PlayerPosition[]

  const setPositions = useCallback(
    (newPositions: PlayerPosition[]) => {
      const params = new URLSearchParams(searchParams)
      if (newPositions.length > 0) {
        params.set('positions', newPositions.join(','))
        params.set('page', '1')
      } else {
        params.delete('positions')
      }
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  const togglePosition = useCallback(
    (position: PlayerPosition) => {
      const newPositions = positions.includes(position)
        ? positions.filter((p) => p !== position)
        : [...positions, position]
      setPositions(newPositions)
    },
    [positions, setPositions]
  )

  const clearPositions = useCallback(() => {
    setPositions([])
  }, [setPositions])

  return {
    positions,
    setPositions,
    togglePosition,
    clearPositions,
  }
}

/**
 * Hook for age range filter
 */
export function useAgeRangeFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const ageMin = searchParams.get('ageMin') ? parseInt(searchParams.get('ageMin')!) : undefined
  const ageMax = searchParams.get('ageMax') ? parseInt(searchParams.get('ageMax')!) : undefined

  const setAgeRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      const params = new URLSearchParams(searchParams)
      if (min !== undefined) {
        params.set('ageMin', String(min))
      } else {
        params.delete('ageMin')
      }
      if (max !== undefined) {
        params.set('ageMax', String(max))
      } else {
        params.delete('ageMax')
      }
      params.set('page', '1')
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  const clearAgeRange = useCallback(() => {
    setAgeRange(undefined, undefined)
  }, [setAgeRange])

  return {
    ageMin,
    ageMax,
    setAgeRange,
    clearAgeRange,
  }
}

/**
 * Hook for height range filter
 */
export function useHeightRangeFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const heightMin = searchParams.get('heightMin') ? parseInt(searchParams.get('heightMin')!) : undefined
  const heightMax = searchParams.get('heightMax') ? parseInt(searchParams.get('heightMax')!) : undefined

  const setHeightRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      const params = new URLSearchParams(searchParams)
      if (min !== undefined) {
        params.set('heightMin', String(min))
      } else {
        params.delete('heightMin')
      }
      if (max !== undefined) {
        params.set('heightMax', String(max))
      } else {
        params.delete('heightMax')
      }
      params.set('page', '1')
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  const clearHeightRange = useCallback(() => {
    setHeightRange(undefined, undefined)
  }, [setHeightRange])

  return {
    heightMin,
    heightMax,
    setHeightRange,
    clearHeightRange,
  }
}

/**
 * Hook for weight range filter
 */
export function useWeightRangeFilter() {
  const [searchParams, setSearchParams] = useSearchParams()
  const weightMin = searchParams.get('weightMin') ? parseInt(searchParams.get('weightMin')!) : undefined
  const weightMax = searchParams.get('weightMax') ? parseInt(searchParams.get('weightMax')!) : undefined

  const setWeightRange = useCallback(
    (min: number | undefined, max: number | undefined) => {
      const params = new URLSearchParams(searchParams)
      if (min !== undefined) {
        params.set('weightMin', String(min))
      } else {
        params.delete('weightMin')
      }
      if (max !== undefined) {
        params.set('weightMax', String(max))
      } else {
        params.delete('weightMax')
      }
      params.set('page', '1')
      setSearchParams(params)
    },
    [searchParams, setSearchParams]
  )

  const clearWeightRange = useCallback(() => {
    setWeightRange(undefined, undefined)
  }, [setWeightRange])

  return {
    weightMin,
    weightMax,
    setWeightRange,
    clearWeightRange,
  }
}
