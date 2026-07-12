import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { AxiosResponse } from 'axios'
import apiClient from '@/lib/api-client'
import {
  getPlayer,
  getPlayerMe,
  listPlayerDocuments,
  listPlayers,
  registerPlayer,
  searchPlayers,
  uploadPlayerAvatar,
} from '@/modules/players/services'
import { mockPaginatedPlayers, mockPlayer, mockPlayerDetail } from '@/tests/__mocks__/player.mock'

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

describe('players service', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('lists players and unwraps paginated data', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      createResponse({ success: true, message: '', data: mockPaginatedPlayers }),
    )

    const result = await listPlayers({ page: 1, position: 'st' })

    expect(result).toEqual(mockPaginatedPlayers)
    expect(apiClient.get).toHaveBeenCalledWith('/players/', {
      params: { page: 1, position: 'st' },
    })
  })

  it('unwraps plain paginated responses without envelope', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(createResponse(mockPaginatedPlayers))

    const result = await listPlayers()

    expect(result).toEqual(mockPaginatedPlayers)
  })

  it('fetches player detail', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      createResponse({ success: true, message: '', data: mockPlayerDetail }),
    )

    const result = await getPlayer(mockPlayer.slug)

    expect(result).toEqual(mockPlayerDetail)
    expect(apiClient.get).toHaveBeenCalledWith(`/players/${mockPlayer.slug}/`)
  })

  it('searches players and unwraps list data', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      createResponse({ success: true, message: '', data: [mockPlayer] }),
    )

    const result = await searchPlayers('joao')

    expect(result).toEqual([mockPlayer])
    expect(apiClient.get).toHaveBeenCalledWith('/players/search/', { params: { q: 'joao' } })
  })

  it('fetches authenticated player profile', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      createResponse({ success: true, message: '', data: mockPlayerDetail }),
    )

    const result = await getPlayerMe()

    expect(result).toEqual(mockPlayerDetail)
    expect(apiClient.get).toHaveBeenCalledWith('/players/me/')
  })

  it('registers a player at a club', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(
      createResponse({ success: true, message: 'ok', data: { id: 'reg-1' } }),
    )

    const payload = {
      club_id: 'club-1',
      joined_date: '2026-07-01',
      shirt_number: 9,
    }

    const result = await registerPlayer(mockPlayer.slug, payload)

    expect(result).toEqual({ id: 'reg-1' })
    expect(apiClient.post).toHaveBeenCalledWith(`/players/${mockPlayer.slug}/register/`, payload)
  })

  it('uploads avatar via multipart to me endpoint', async () => {
    vi.mocked(apiClient.post).mockResolvedValueOnce(
      createResponse({ success: true, message: 'ok', data: { ...mockPlayer, avatar: 'https://cdn.example.com/new.jpg' } }),
    )

    const file = new File(['avatar'], 'avatar.png', { type: 'image/png' })
    const result = await uploadPlayerAvatar(file)

    expect(result.avatar).toBe('https://cdn.example.com/new.jpg')
    expect(apiClient.post).toHaveBeenCalledWith(
      '/players/me/avatar/',
      expect.any(FormData),
      { headers: { 'Content-Type': 'multipart/form-data' } },
    )
  })

  it('lists player documents as array', async () => {
    vi.mocked(apiClient.get).mockResolvedValueOnce(
      createResponse({ success: true, message: '', data: [] }),
    )

    const result = await listPlayerDocuments(mockPlayer.slug)

    expect(result).toEqual([])
    expect(apiClient.get).toHaveBeenCalledWith(`/players/${mockPlayer.slug}/documents/`)
  })
})
