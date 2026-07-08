import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import * as React from 'react'
import { useOrganizationMe, usePublicOrganizations, useOrganizationKpis } from '@/modules/organizations/hooks/useOrganization'
import { organizationApi } from '@/modules/organizations/services/organization.api'
import { mockOrganization, mockPublicOrganization, mockOrganizationKpis } from '@/tests/__mocks__/organization.mock'

// Mock the API
vi.mock('@/modules/organizations/services/organization.api', () => ({
  organizationApi: {
    getMe: vi.fn(),
    listPublic: vi.fn(),
    getKpis: vi.fn(),
  },
}))

// Mock auth provider
vi.mock('@/app/providers', () => ({
  useAuth: () => ({ isAuthenticated: true }),
}))

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  })
  
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return React.createElement(
      QueryClientProvider,
      { client: queryClient },
      children
    )
  }
}

describe('useOrganizationMe', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch organization me successfully', async () => {
    vi.mocked(organizationApi.getMe).mockResolvedValueOnce(mockOrganization)

    const { result } = renderHook(() => useOrganizationMe(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockOrganization)
    expect(organizationApi.getMe).toHaveBeenCalledTimes(1)
  })

  it('should handle error when fetching organization me', async () => {
    const error = new Error('Failed to fetch')
    vi.mocked(organizationApi.getMe).mockRejectedValueOnce(error)

    const { result } = renderHook(() => useOrganizationMe(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isError).toBe(true))

    expect(result.current.error).toBeDefined()
  })
})

describe('usePublicOrganizations', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch public organizations list successfully', async () => {
    vi.mocked(organizationApi.listPublic).mockResolvedValueOnce([mockPublicOrganization])

    const { result } = renderHook(() => usePublicOrganizations(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([mockPublicOrganization])
    expect(organizationApi.listPublic).toHaveBeenCalledWith(undefined)
  })

  it('should fetch public organizations with params', async () => {
    vi.mocked(organizationApi.listPublic).mockResolvedValueOnce([mockPublicOrganization])
    const params = { type: 'federation' as const, search: 'futebol' }

    const { result } = renderHook(() => usePublicOrganizations(params), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(organizationApi.listPublic).toHaveBeenCalledWith(params)
  })

  it('should handle empty list', async () => {
    vi.mocked(organizationApi.listPublic).mockResolvedValueOnce([])

    const { result } = renderHook(() => usePublicOrganizations(), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual([])
  })
})

describe('useOrganizationKpis', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should fetch organization kpis successfully', async () => {
    const slug = 'faf'
    vi.mocked(organizationApi.getKpis).mockResolvedValueOnce(mockOrganizationKpis)

    const { result } = renderHook(() => useOrganizationKpis(slug), {
      wrapper: createWrapper(),
    })

    await waitFor(() => expect(result.current.isSuccess).toBe(true))

    expect(result.current.data).toEqual(mockOrganizationKpis)
    expect(organizationApi.getKpis).toHaveBeenCalledWith(slug)
  })

  it('should not fetch when slug is undefined', async () => {
    const { result } = renderHook(() => useOrganizationKpis(undefined), {
      wrapper: createWrapper(),
    })

    expect(result.current.isFetching).toBe(false)
    expect(organizationApi.getKpis).not.toHaveBeenCalled()
  })
})
