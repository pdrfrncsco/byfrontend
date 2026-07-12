// Players module — API service

import apiClient from '@/lib/api-client'
import { API_ROUTES } from '@/constants/routes'
import type { ApiResponse } from '@/types'
import type {
  Player,
  PlayerDetail,
  PlayerListParams,
  PlayerListResponse,
  PlayerCreate,
  PlayerUpdate,
  PlayerRegisterPayload,
  PlayerDocument,
  PlayerDocumentCreate,
  PlayerDocumentUpdate,
  PlayerVideo,
  PlayerVideoCreate,
  PlayerVideoUpdate,
  PlayerAchievement,
  PlayerAchievementCreate,
  PlayerAchievementUpdate,
} from '../types'

type Envelope<T> = ApiResponse<T> | T

type PaginatedEnvelope<T> =
  | ApiResponse<PlayerListResponse>
  | PlayerListResponse
  | { count?: number; next?: string | null; previous?: string | null; results: T[] }
  | T[]

function hasData<T>(payload: unknown): payload is ApiResponse<T> {
  return !!payload && typeof payload === 'object' && 'data' in payload && 'success' in payload
}

function unwrapData<T>(payload: Envelope<T>): T {
  return hasData<T>(payload) ? payload.data : payload
}

function unwrapList<T>(payload: PaginatedEnvelope<T> | Envelope<T[]>): T[] {
  const data = hasData<T[]>(payload) ? payload.data : payload
  if (Array.isArray(data)) return data
  if (data && typeof data === 'object' && 'results' in data) {
    return Array.isArray((data as { results?: T[] }).results) ? (data as { results: T[] }).results : []
  }
  return []
}

function unwrapPaginated<T>(payload: PaginatedEnvelope<T>): { count: number; next: string | null; previous: string | null; results: T[] } {
  const data = hasData<{ count: number; next: string | null; previous: string | null; results: T[] }>(payload)
    ? payload.data
    : payload
  if (Array.isArray(data)) {
    return {
      count: data.length,
      next: null,
      previous: null,
      results: data,
    }
  }

  if (data && typeof data === 'object' && 'results' in data) {
    const paginated = data as { count?: number; next?: string | null; previous?: string | null; results?: T[] }
    return {
      count: paginated.count ?? paginated.results?.length ?? 0,
      next: paginated.next ?? null,
      previous: paginated.previous ?? null,
      results: Array.isArray(paginated.results) ? paginated.results : [],
    }
  }

  return { count: 0, next: null, previous: null, results: [] }
}

// ─── Player CRUD ─────────────────────────────────────────────────────────────

export async function listPlayers(params?: PlayerListParams): Promise<PlayerListResponse> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.LIST, { params })
  return unwrapPaginated(res.data)
}

export async function getPlayer(slug: string): Promise<PlayerDetail> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.GET(slug))
  return unwrapData(res.data)
}

export async function searchPlayers(q: string): Promise<Player[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.SEARCH, { params: { q } })
  return unwrapList(res.data)
}

export async function createPlayer(data: PlayerCreate): Promise<Player> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.CREATE, data)
  return unwrapData(res.data)
}

export async function updatePlayer(slug: string, data: PlayerUpdate): Promise<Player> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.UPDATE(slug), data)
  return unwrapData(res.data)
}

export async function registerPlayer(slug: string, data: PlayerRegisterPayload): Promise<unknown> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.REGISTER(slug), data)
  return unwrapData(res.data)
}

export async function getPlayerMe(): Promise<PlayerDetail> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ME)
  return unwrapData(res.data)
}

export async function updatePlayerMe(data: PlayerUpdate): Promise<Player> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.ME, data)
  return unwrapData(res.data)
}

export async function uploadPlayerAvatar(file: File, slug?: string): Promise<Player> {
  const formData = new FormData()
  formData.append('avatar', file)
  const url = slug ? API_ROUTES.PLAYERS.AVATAR(slug) : API_ROUTES.PLAYERS.ME_AVATAR
  const res = await apiClient.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  return unwrapData(res.data)
}

// ─── Player Documents ────────────────────────────────────────────────────────

export async function listPlayerDocuments(slug: string): Promise<PlayerDocument[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.DOCUMENTS(slug))
  return unwrapList(res.data)
}

export async function getPlayerDocument(slug: string, documentId: string): Promise<PlayerDocument> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.DOCUMENT_DETAIL(slug, documentId))
  return unwrapData(res.data)
}

export async function createPlayerDocument(slug: string, data: PlayerDocumentCreate): Promise<PlayerDocument> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.DOCUMENTS(slug), data)
  return unwrapData(res.data)
}

export async function updatePlayerDocument(
  slug: string,
  documentId: string,
  data: PlayerDocumentUpdate,
): Promise<PlayerDocument> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.DOCUMENT_DETAIL(slug, documentId), data)
  return unwrapData(res.data)
}

export async function deletePlayerDocument(slug: string, documentId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.DOCUMENT_DETAIL(slug, documentId))
}

export async function verifyPlayerDocument(slug: string, documentId: string): Promise<PlayerDocument> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.DOCUMENT_VERIFY(slug, documentId))
  return unwrapData(res.data)
}

// ─── Player Videos ───────────────────────────────────────────────────────────

export async function listPlayerVideos(slug: string): Promise<PlayerVideo[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.VIDEOS(slug))
  return unwrapList(res.data)
}

export async function getPlayerVideo(slug: string, videoId: string): Promise<PlayerVideo> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.VIDEO_DETAIL(slug, videoId))
  return unwrapData(res.data)
}

export async function createPlayerVideo(slug: string, data: PlayerVideoCreate): Promise<PlayerVideo> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.VIDEOS(slug), data)
  return unwrapData(res.data)
}

export async function updatePlayerVideo(
  slug: string,
  videoId: string,
  data: PlayerVideoUpdate,
): Promise<PlayerVideo> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.VIDEO_DETAIL(slug, videoId), data)
  return unwrapData(res.data)
}

export async function deletePlayerVideo(slug: string, videoId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.VIDEO_DETAIL(slug, videoId))
}

export async function publishPlayerVideo(slug: string, videoId: string): Promise<PlayerVideo> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.VIDEO_PUBLISH(slug, videoId))
  return unwrapData(res.data)
}

// ─── Player Achievements ─────────────────────────────────────────────────────

export async function listPlayerAchievements(slug: string): Promise<PlayerAchievement[]> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ACHIEVEMENTS(slug))
  return unwrapList(res.data)
}

export async function getPlayerAchievement(slug: string, achievementId: string): Promise<PlayerAchievement> {
  const res = await apiClient.get(API_ROUTES.PLAYERS.ACHIEVEMENT_DETAIL(slug, achievementId))
  return unwrapData(res.data)
}

export async function createPlayerAchievement(
  slug: string,
  data: PlayerAchievementCreate,
): Promise<PlayerAchievement> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.ACHIEVEMENTS(slug), data)
  return unwrapData(res.data)
}

export async function updatePlayerAchievement(
  slug: string,
  achievementId: string,
  data: PlayerAchievementUpdate,
): Promise<PlayerAchievement> {
  const res = await apiClient.patch(API_ROUTES.PLAYERS.ACHIEVEMENT_DETAIL(slug, achievementId), data)
  return unwrapData(res.data)
}

export async function deletePlayerAchievement(slug: string, achievementId: string): Promise<void> {
  await apiClient.delete(API_ROUTES.PLAYERS.ACHIEVEMENT_DETAIL(slug, achievementId))
}

export async function verifyPlayerAchievement(slug: string, achievementId: string): Promise<PlayerAchievement> {
  const res = await apiClient.post(API_ROUTES.PLAYERS.ACHIEVEMENT_VERIFY(slug, achievementId))
  return unwrapData(res.data)
}
