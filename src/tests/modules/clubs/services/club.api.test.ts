import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'
import apiClient from '@/lib/api-client'
import {
  listClubs,
  getClub,
  getClubKpis,
  listClubMembers,
  listClubDocuments,
  listClubSponsors,
} from '@/modules/clubs/services'
import {
  mockClub,
  mockClubKpis,
  mockClubMembers,
  mockClubDocuments,
  mockClubSponsors,
  mockPaginatedClubs,
} from '@/tests/__mocks__/club.mock'

vi.mock('@/lib/api-client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}))

const createResponse = <T>(data: T): AxiosResponse<T> =>
  ({
    data,
    status: 200,
    statusText: 'OK',
    headers: {},
    config: {},
  }) as AxiosResponse<T>

describe('clubs service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists clubs and unwraps paginated data', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse({ success: true, message: '', data: mockPaginatedClubs }))

    const result = await listClubs({ search: 'atlético', organization: 'federacao-bolayetu' })

    expect(result).toEqual(mockPaginatedClubs)
    expect(apiClient.get).toHaveBeenCalledWith('/clubs/public/', {
      params: { search: 'atlético', page: undefined, page_size: undefined, organization: 'federacao-bolayetu' },
    })
  })

  it('fetches club detail through the public endpoint', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse({ success: true, message: '', data: mockClub }))

    const result = await getClub(mockClub.slug)

    expect(result).toEqual(mockClub)
    expect(apiClient.get).toHaveBeenCalledWith(`/clubs/public/${mockClub.slug}/`)
  })

  it('fetches club KPIs', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse({ success: true, message: '', data: mockClubKpis }))

    const result = await getClubKpis(mockClub.slug)

    expect(result).toEqual(mockClubKpis)
    expect(apiClient.get).toHaveBeenCalledWith(`/clubs/public/${mockClub.slug}/kpis/`)
  })

  it('returns lists for members, documents and sponsors', async () => {
    vi.mocked(apiClient.get)
      .mockResolvedValueOnce(createResponse({ success: true, message: '', data: { results: mockClubMembers } }))
      .mockResolvedValueOnce(createResponse({ success: true, message: '', data: { results: mockClubDocuments } }))
      .mockResolvedValueOnce(createResponse({ success: true, message: '', data: { results: mockClubSponsors } }))

    await expect(listClubMembers(mockClub.slug)).resolves.toEqual(mockClubMembers)
    await expect(listClubDocuments(mockClub.slug)).resolves.toEqual(mockClubDocuments)
    await expect(listClubSponsors(mockClub.slug)).resolves.toEqual(mockClubSponsors)
  })
})
